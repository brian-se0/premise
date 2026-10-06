// Parses and validates content (docs/EXERCISE_FORMAT.md §4). Used by the content build,
// the M0 pilot script and the tests. `validateContent` is pure apart from hashing: it takes
// file texts in and returns exercises, errors and warnings.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { MAX_ANSWER_LENGTH, PROMPT_BUDGET, renderPrompt } from '../src/domain/prompt.ts';
import { UNIVERSAL_TAGS, buildSnapshot, canonicalJson, sha256Hex, taskId } from '../src/domain/snapshot.ts';
import type { BuiltExercise, Exercise } from '../src/domain/types.ts';
import {
  frontMatterSchema,
  ledgerSchema,
  maintainersSchema,
  taxonomySchema,
  type Ledger,
  type Taxonomy,
} from './contentSchema.ts';

export type { BuiltExercise };

export const CONTENT_DIR = fileURLToPath(new URL('../content/', import.meta.url));
export const LEDGER_FILE = 'published-tasks.json';

export const BLOCKED_STRINGS = ['LSAT', 'LSAC', 'PrepTest', 'Law School Admission'];

export const WORD_RANGES = {
  argument: { min: 60, max: 180 },
  passage: { min: 350, max: 550 },
} as const;

export interface ContentFiles {
  exercises: { name: string; text: string }[];
  taxonomy: string;
  maintainers: string;
  /** JSON text of the published-task ledger, or null when none exists yet. */
  ledger: string | null;
}

export interface ContentResult {
  exercises: BuiltExercise[];
  taxonomy: Taxonomy | null;
  /** Content errors. Always block the build. */
  errors: string[];
  /** Published-task changes not yet in the ledger. Block the build; `--lock` records them. */
  unrecorded: string[];
  warnings: string[];
  /** The ledger updated with the current published tasks; written only by `--lock`. */
  ledger: Ledger;
}

interface Split {
  data: unknown;
  body: string;
}

function splitFrontMatter(text: string): Split | null {
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text.replace(/\r\n/g, '\n'));
  if (!match) return null;
  return { data: parse(match[1]!) as unknown, body: match[2]! };
}

/** Parses a file, turning syntax errors into diagnostics. */
function tryParse<T>(name: string, errors: string[], f: () => T): T | undefined {
  try {
    return f();
  } catch (e) {
    errors.push(`${name}: cannot be parsed: ${e instanceof Error ? e.message.split('\n')[0] : String(e)}`);
    return undefined;
  }
}

function has(record: Record<string, unknown>, key: string): boolean {
  return Object.hasOwn(record, key);
}

/** Joins hard-wrapped lines into paragraphs, separated by one blank line (§1). */
export function normalizeBody(body: string): string {
  return body
    .trim()
    .split(/\n\s*\n/)
    .map((p) =>
      p
        .split('\n')
        .map((l) => l.trim())
        .join(' '),
    )
    .join('\n\n');
}

/** SHA-256 over the stimulus and every front-matter field except status and approval (§4 rule 7). */
export async function contentRevision(frontMatter: Record<string, unknown>, stimulus: string): Promise<string> {
  const rest = Object.fromEntries(
    Object.entries(frontMatter).filter(
      ([k]) => !['status', 'approved_by', 'approved_at', 'approved_revision'].includes(k),
    ),
  );
  return sha256Hex(canonicalJson({ ...rest, stimulus }));
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function taskTexts(t: Exercise['tasks'][number]): string[] {
  return [
    t.prompt,
    t.reference,
    t.accept ?? '',
    t.difficulty_note ?? '',
    t.form ?? '',
    ...(t.disqualifiers ?? []),
    ...t.rubric,
    ...t.anchors.flatMap((a) => [a.answer, a.note ?? '']),
  ];
}

function issuesOf(error: { issues: { path: PropertyKey[]; message: string }[] }): string[] {
  return error.issues.map((i) => `${i.path.map(String).join('.') || '(root)'}: ${i.message}`);
}

export async function validateContent(files: ContentFiles): Promise<ContentResult> {
  const errors: string[] = [];
  const unrecorded: string[] = [];
  const warnings: string[] = [];

  const taxonomyParsed = taxonomySchema.safeParse(tryParse('taxonomy.yaml', errors, () => parse(files.taxonomy)));
  if (!taxonomyParsed.success) errors.push(...issuesOf(taxonomyParsed.error).map((m) => `taxonomy.yaml: ${m}`));
  const taxonomy = taxonomyParsed.success ? taxonomyParsed.data : null;

  const maintainersParsed = maintainersSchema.safeParse(
    tryParse('maintainers.yaml', errors, () => parse(files.maintainers)),
  );
  if (!maintainersParsed.success) {
    errors.push(...issuesOf(maintainersParsed.error).map((m) => `maintainers.yaml: ${m}`));
  }
  const maintainers = new Set(maintainersParsed.success ? maintainersParsed.data.maintainers : []);

  // A malformed ledger is a blocking error, never treated as missing (so --lock cannot recreate it).
  let ledger: Ledger = { tasks: {} };
  if (files.ledger !== null) {
    const ledgerText = files.ledger;
    const ledgerParsed = ledgerSchema.safeParse(tryParse(LEDGER_FILE, errors, () => JSON.parse(ledgerText) as unknown));
    if (ledgerParsed.success) ledger = ledgerParsed.data;
    else errors.push(...issuesOf(ledgerParsed.error).map((m) => `${LEDGER_FILE}: ${m}`));
  }
  const nextLedger: Ledger = structuredClone(ledger);

  if (taxonomy) {
    for (const tag of UNIVERSAL_TAGS) {
      if (!has(taxonomy.error_tags, tag)) errors.push(`taxonomy.yaml: universal tag ${tag} is missing`);
    }
  }

  const exercises: BuiltExercise[] = [];
  const seenIds = new Set<string>();

  for (const file of [...files.exercises].sort((a, b) => a.name.localeCompare(b.name))) {
    const fail = (msg: string) => errors.push(`${file.name}: ${msg}`);
    const split = tryParse(file.name, errors, () => splitFrontMatter(file.text));
    if (split === undefined) continue;
    if (split === null) {
      fail('missing front matter');
      continue;
    }
    // Rule 1: the schema, with unknown keys rejected.
    const parsed = frontMatterSchema.safeParse(split.data);
    if (!parsed.success) {
      for (const m of issuesOf(parsed.error)) fail(m);
      continue;
    }
    const fm = parsed.data;
    const stimulus = normalizeBody(split.body);
    const exercise = { ...fm, stimulus } as Exercise;
    const revision = await contentRevision(split.data as Record<string, unknown>, stimulus);

    // Rule 2: ids.
    if (`${fm.id}.md` !== file.name) fail(`id ${fm.id} does not match the file name`);
    if (seenIds.has(fm.id)) fail(`duplicate exercise id ${fm.id}`);
    seenIds.add(fm.id);
    if ((fm.kind === 'argument') !== fm.id.startsWith('arg-')) fail(`id ${fm.id} does not match kind ${fm.kind}`);
    if (stimulus === '') fail('the stimulus is empty');

    const keys = new Set<string>();
    for (const t of exercise.tasks) {
      const tfail = (msg: string) => fail(`task ${t.key}: ${msg}`);
      if (keys.has(t.key)) tfail('duplicate task key');
      keys.add(t.key);

      // Rules 3 and 6: taxonomy.
      const skill = taxonomy && has(taxonomy.skills, t.skill) ? taxonomy.skills[t.skill] : undefined;
      if (taxonomy && !skill) tfail(`unknown skill ${t.skill}`);
      for (const tag of t.likely_errors) {
        if (taxonomy && !has(taxonomy.error_tags, tag)) tfail(`unknown error tag ${tag}`);
      }
      if (skill?.open_ended && !t.accept) tfail(`accept is required for the open-ended skill ${t.skill}`);

      // Rule 4: one point per rubric criterion.
      if (t.max !== t.rubric.length) tfail(`max ${t.max} does not equal the ${t.rubric.length} rubric criteria`);

      // Rule 5: one anchor per score.
      const points = t.anchors.map((a) => a.points).sort((a, b) => a - b);
      const expected = Array.from({ length: t.max + 1 }, (_, i) => i);
      if (points.join() !== expected.join()) tfail(`anchors must cover each score from 0 to ${t.max} exactly once`);

      // Rule 11: a 2,000-character answer fits the prompt budget.
      const snapshot = await buildSnapshot(exercise, t);
      const longest = renderPrompt('00000000-0000-4000-8000-000000000000', 'ZZZZZZ', [
        { rowId: 'I01', attemptId: 'x', snapshot, answer: 'x'.repeat(MAX_ANSWER_LENGTH) },
      ]).length;
      if (longest > PROMPT_BUDGET)
        tfail(
          `the grading prompt with a full-length answer is ${longest} characters, over the ${PROMPT_BUDGET} budget`,
        );

      // Rule 12: published task keys keep their skill and max, every published revision is
      // recorded, and retirement is recorded and permanent. Only published content can retire.
      if (fm.status !== 'draft') {
        const id = taskId(exercise, t);
        const status = fm.status === 'retired' ? 'retired' : t.status;
        const entry = ledger.tasks[id];
        if (entry) {
          if (entry.skill !== t.skill || entry.max !== t.max) {
            tfail(
              `${id} was published as ${entry.skill} out of ${entry.max}; a task that tests something else needs a new key`,
            );
          }
          if (entry.status === 'retired' && status === 'active') {
            tfail(`${id} was retired and cannot become active again`);
          }
          if (!entry.revisions.includes(snapshot.hash)) {
            unrecorded.push(`${file.name}: task ${t.key}: ${id} changed since it was recorded`);
          }
          if (entry.status === 'active' && status === 'retired') {
            unrecorded.push(`${file.name}: task ${t.key}: ${id} was retired but the ledger still lists it as active`);
          }
        } else if (status === 'retired') {
          tfail(`${id} was never published, so it cannot be retired; remove it or publish it first`);
        } else {
          unrecorded.push(`${file.name}: task ${t.key}: ${id} is not recorded as published`);
        }
        const next = nextLedger.tasks[id];
        if (next) {
          if (!next.revisions.includes(snapshot.hash)) next.revisions.push(snapshot.hash);
          if (status === 'retired') next.status = 'retired';
        } else if (status === 'active') {
          nextLedger.tasks[id] = { skill: t.skill, max: t.max, status, revisions: [snapshot.hash] };
        }
      }
    }

    // Rule 7: approval bound to the content revision. Retired exercises were published, so any
    // edit to them needs re-approval too.
    if (fm.status !== 'draft') {
      if (!fm.approved_by || !fm.approved_at || !fm.approved_revision) {
        fail(`${fm.status} exercises need approved_by, approved_at and approved_revision`);
      } else if (fm.approved_revision !== revision) {
        fail(
          `approved_revision does not match the current content revision ${revision}; the exercise needs re-approval`,
        );
      }
      if (fm.status === 'published' && !fm.tasks.some((t) => t.status === 'active'))
        warnings.push(`${file.name}: published with no active task`);
    }

    // Rule 8: approvers.
    if (fm.approved_by) {
      if (!maintainers.has(fm.approved_by)) fail(`approver ${fm.approved_by} is not in maintainers.yaml`);
      const outsider = fm.contributors.some((c) => !maintainers.has(c));
      if (outsider && fm.contributors.includes(fm.approved_by)) {
        fail(
          'an exercise with a contributor who is not a maintainer must be approved by a maintainer who is not a contributor',
        );
      }
    }

    // Rule 9: sources.
    const s = fm.source;
    if (s.type !== 'original') {
      for (const k of ['title', 'creator', 'locator', 'attribution', 'rights_basis'] as const) {
        if (s[k] === null) fail(`source.${k} is required for ${s.type} sources`);
      }
      if (s.type === 'public-domain' && s.year === null) fail('source.year is required for public-domain sources');
      if (s.type === 'cc-by' && s.license_uri === null) fail('source.license_uri is required for cc-by sources');
    }

    // Rule 13: word counts (warning).
    const range = WORD_RANGES[fm.kind];
    const words = wordCount(stimulus);
    if (words < range.min || words > range.max) {
      warnings.push(`${file.name}: ${words} words, outside the ${range.min}–${range.max} range for ${fm.kind}s`);
    }
    if (fm.kind === 'passage') {
      const paragraphs = stimulus.split('\n\n').length;
      if (paragraphs < 3 || paragraphs > 5)
        warnings.push(`${file.name}: ${paragraphs} paragraphs, outside 3–5 for passages`);
    }

    // Rule 14: blocked strings.
    const allText = [stimulus, ...fm.tasks.flatMap((t) => taskTexts(t as Exercise['tasks'][number]))]
      .join('\n')
      .toLowerCase();
    for (const blocked of BLOCKED_STRINGS) {
      if (allText.includes(blocked.toLowerCase())) fail(`contains the blocked string "${blocked}"`);
    }

    exercises.push({ ...exercise, revision });
  }

  return { exercises, taxonomy, errors, unrecorded, warnings, ledger: nextLedger };
}

/** The exercises a bundle ships: production excludes drafts (§6). */
export function bundleExercises(exercises: BuiltExercise[], production: boolean): BuiltExercise[] {
  return exercises.filter((e) => !production || e.status !== 'draft');
}

export function readContentFiles(dir = CONTENT_DIR): ContentFiles {
  const exDir = join(dir, 'exercises');
  const ledgerPath = join(dir, LEDGER_FILE);
  const ledger = existsSync(ledgerPath) ? readFileSync(ledgerPath, 'utf8') : null;
  return {
    exercises: readdirSync(exDir)
      .filter((f) => f.endsWith('.md'))
      .map((name) => ({ name, text: readFileSync(join(exDir, name), 'utf8') })),
    taxonomy: readFileSync(join(dir, 'taxonomy.yaml'), 'utf8'),
    maintainers: readFileSync(join(dir, 'maintainers.yaml'), 'utf8'),
    ledger,
  };
}

/** Validated exercises for scripts and tests; throws on any content error. */
export async function loadExercises(dir = CONTENT_DIR): Promise<BuiltExercise[]> {
  const result = await validateContent(readContentFiles(dir));
  const all = [...result.errors, ...result.unrecorded];
  if (all.length > 0) throw new Error(`Content errors:\n${all.join('\n')}`);
  return result.exercises;
}
