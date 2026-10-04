// Failing fixtures for each machine-checked rule in docs/EXERCISE_FORMAT.md §4 (rule 10 is checked by the author).

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { stringify } from 'yaml';
import { PROMPT_BUDGET, MAX_ANSWER_LENGTH, renderPrompt } from '../../src/domain/prompt.ts';
import { buildSnapshot } from '../../src/domain/snapshot.ts';
import type { BuiltExercise, Exercise } from '../../src/domain/types.ts';
import {
  bundleExercises,
  CONTENT_DIR,
  contentRevision,
  normalizeBody,
  validateContent,
  type ContentFiles,
} from '../../scripts/content.ts';
import type { Ledger } from '../../scripts/contentSchema.ts';

const taxonomy = readFileSync(`${CONTENT_DIR}taxonomy.yaml`, 'utf8');
const maintainers = stringify({ maintainers: ['owner', 'second'] });

const BODY = `${'The council of Ashby voted to close its library on Sundays, citing low attendance. '.repeat(5)}
So the closure will save money without harming anyone.`;

type Doc = Record<string, unknown> & { tasks: Record<string, unknown>[] };

function baseDoc(): Doc {
  return {
    schema: 3,
    id: 'arg-0001',
    status: 'draft',
    kind: 'argument',
    difficulty: 3,
    topics: ['libraries'],
    source: {
      type: 'original',
      title: null,
      creator: null,
      year: null,
      locator: null,
      license_uri: null,
      attribution: null,
      rights_basis: null,
      modifications: null,
    },
    contributors: ['owner'],
    ai_assistance: { used: false, notes: null },
    approved_by: null,
    approved_at: null,
    approved_revision: null,
    tasks: [
      {
        key: 'flaw',
        status: 'active',
        skill: 'flaw',
        prompt: 'Describe the main reasoning error in one or two sentences.',
        max: 2,
        reference: 'Low attendance does not show that nobody relies on Sunday hours.',
        rubric: ['Names the gap.', 'Explains why it matters.'],
        anchors: [
          { points: 2, answer: 'A few people may depend on Sundays.' },
          { points: 1, answer: 'It ignores some users.' },
          { points: 0, answer: 'Libraries are good.' },
        ],
        likely_errors: ['missed-alternative'],
      },
      {
        key: 'assumption',
        status: 'active',
        skill: 'assumption',
        prompt: 'State an assumption the argument needs.',
        max: 1,
        reference: 'No one who comes on Sundays is harmed by losing those hours.',
        accept: 'Any claim whose denial means someone is harmed.',
        rubric: ['States a needed assumption.'],
        anchors: [
          { points: 1, answer: 'Sunday visitors can come another day.' },
          { points: 0, answer: 'The library is old.' },
        ],
        likely_errors: ['overstated'],
      },
    ],
  };
}

function file(doc: Doc, body = BODY, name = `${String(doc.id)}.md`) {
  return { name, text: `---\n${stringify(doc)}---\n${body}\n` };
}

function files(docs: Doc[], extra: Partial<ContentFiles> = {}): ContentFiles {
  return { exercises: docs.map((d) => file(d)), taxonomy, maintainers, ledger: null, ...extra };
}

/** Everything that blocks an ordinary (non --lock) build. */
async function errorsFor(docs: Doc[], extra: Partial<ContentFiles> = {}): Promise<string[]> {
  const r = await validateContent(files(docs, extra));
  return [...r.errors, ...r.unrecorded];
}

async function approve(doc: Doc, by = 'owner'): Promise<Doc> {
  const revision = await contentRevision(doc, normalizeBody(BODY));
  return { ...doc, status: 'published', approved_by: by, approved_at: '2026-10-04', approved_revision: revision };
}

/** Runs --lock: content errors still block it; only unrecorded ledger changes are recorded. */
async function lock(docs: Doc[], ledger: string | null = null): Promise<string> {
  const r = await validateContent(files(docs, { ledger }));
  expect(r.errors).toEqual([]);
  return JSON.stringify(r.ledger);
}

function task(doc: Doc, i = 0): Record<string, unknown> {
  return doc.tasks[i]!;
}

describe('content validation', () => {
  it('accepts the base fixture and the real content', async () => {
    expect(await errorsFor([baseDoc()])).toEqual([]);
    const { readContentFiles } = await import('../../scripts/content.ts');
    const real = await validateContent(readContentFiles());
    expect([...real.errors, ...real.unrecorded]).toEqual([]);
  });

  it('rule 1: rejects unknown keys and wrong types, with the field named', async () => {
    const d = baseDoc();
    d.colour = 'blue';
    expect((await errorsFor([d])).join()).toMatch(/colour/);
    const e = baseDoc();
    task(e).max = 'two';
    expect((await errorsFor([e])).join()).toMatch(/tasks\.0\.max: .*number/i);
    const f = baseDoc();
    task(f).status = 'paused';
    expect((await errorsFor([f])).join()).toMatch(/tasks\.0\.status/);
  });

  it('reports syntax errors as diagnostics with the file name', async () => {
    const bad = { name: 'arg-0001.md', text: '---\nid: [unclosed\n---\nBody\n' };
    expect((await validateContent({ ...files([]), exercises: [bad] })).errors.join()).toMatch(
      /arg-0001\.md: cannot be parsed/,
    );
    const ledger = await validateContent(files([baseDoc()], { ledger: '{ not json' }));
    expect(ledger.errors.join()).toMatch(/published-tasks\.json: cannot be parsed/);
  });

  it('rule 2: id must match the file name and kind, and be unique; task keys unique', async () => {
    const d = baseDoc();
    expect((await validateContent({ ...files([]), exercises: [file(d, BODY, 'arg-0002.md')] })).errors.join()).toMatch(
      /does not match the file name/,
    );
    expect((await validateContent({ ...files([]), exercises: [file(d), file(d)] })).errors.join()).toMatch(
      /duplicate exercise id/,
    );
    const k = baseDoc();
    task(k, 1).key = 'flaw';
    expect((await errorsFor([k])).join()).toMatch(/duplicate task key/);
    expect((await errorsFor([{ ...baseDoc(), kind: 'passage' }])).join()).toMatch(/does not match kind passage/);
  });

  it('rule 3: skills and error tags come from the taxonomy, own entries only', async () => {
    for (const name of ['vibes', 'constructor', 'toString', '__proto__']) {
      const d = baseDoc();
      task(d).skill = name;
      expect((await errorsFor([d])).join()).toMatch(new RegExp(`unknown skill ${name}`));
      const e = baseDoc();
      task(e).likely_errors = [name];
      expect((await errorsFor([e])).join()).toMatch(new RegExp(`unknown error tag ${name}`));
    }
  });

  it('rule 4: max equals the number of rubric criteria', async () => {
    const d = baseDoc();
    task(d).rubric = ['Only one.'];
    expect((await errorsFor([d])).join()).toMatch(/does not equal the 1 rubric criteria/);
  });

  it('rule 5: one anchor per score from 0 to max', async () => {
    const d = baseDoc();
    task(d).anchors = [
      { points: 2, answer: 'a' },
      { points: 2, answer: 'b' },
      { points: 0, answer: 'c' },
    ];
    expect((await errorsFor([d])).join()).toMatch(/anchors must cover/);
  });

  it('rule 6: open-ended skills need accept', async () => {
    const d = baseDoc();
    delete task(d, 1).accept;
    expect((await errorsFor([d])).join()).toMatch(/accept is required/);
  });

  it('rule 7: published and retired exercises need an approval bound to the current revision', async () => {
    expect((await errorsFor([{ ...baseDoc(), status: 'published' }])).join()).toMatch(/published exercises need/);
    expect((await errorsFor([{ ...baseDoc(), status: 'retired' }])).join()).toMatch(/retired exercises need/);

    const approved = await approve(baseDoc());
    const ledger = await lock([approved]);
    expect(await errorsFor([approved], { ledger })).toEqual([]);

    const edited = structuredClone(approved);
    edited.difficulty = 4;
    expect((await errorsFor([edited], { ledger })).join()).toMatch(/needs re-approval/);
  });

  it('the content revision covers the stimulus, nested task fields and explicit defaults only', async () => {
    const base = baseDoc();
    const rev = (d: Doc, body = BODY) => contentRevision(d, normalizeBody(body));
    const r0 = await rev(base);
    expect(await rev(base, `${BODY} More.`)).not.toBe(r0);
    const nested = structuredClone(base);
    (task(nested).anchors as { answer: string }[])[0]!.answer = 'Changed.';
    expect(await rev(nested)).not.toBe(r0);
    const explicitDefault = structuredClone(base);
    delete task(explicitDefault).status;
    expect(await rev(explicitDefault)).not.toBe(r0);
    const bookkeeping = {
      ...base,
      status: 'published',
      approved_by: 'x',
      approved_at: '2026-01-01',
      approved_revision: 'f'.repeat(64),
    };
    expect(await rev(bookkeeping)).toBe(r0);
    const reordered = Object.fromEntries(Object.entries(base).reverse()) as Doc;
    expect(await rev(reordered)).toBe(r0);
    expect(await rev(base, BODY.replace('\n', '\n   \n'))).not.toBe(r0);
    expect(await rev(base, BODY.replace('citing low', 'citing\nlow'))).toBe(r0);
  });

  it('rule 8: approvers are maintainers, independent when a contributor is not', async () => {
    const stranger = await approve(baseDoc(), 'nobody');
    expect((await errorsFor([stranger])).join()).toMatch(/not in maintainers.yaml/);

    const outside = await approve({ ...baseDoc(), contributors: ['owner', 'guest'] }, 'owner');
    expect((await errorsFor([outside])).join()).toMatch(/must be approved by a maintainer who is not a contributor/);

    const independent = await approve({ ...baseDoc(), contributors: ['owner', 'guest'] }, 'second');
    const ledger = await lock([independent]);
    expect(await errorsFor([independent], { ledger })).toEqual([]);
  });

  const provenance = {
    title: 'T',
    creator: 'C',
    year: 1900,
    locator: 'L',
    license_uri: 'U',
    attribution: 'A',
    rights_basis: 'R',
  };
  it.each([
    ['public-domain', 'title'],
    ['public-domain', 'creator'],
    ['public-domain', 'locator'],
    ['public-domain', 'attribution'],
    ['public-domain', 'rights_basis'],
    ['public-domain', 'year'],
    ['cc-by', 'title'],
    ['cc-by', 'rights_basis'],
    ['cc-by', 'license_uri'],
  ])('rule 9: a %s source needs %s', async (type, field) => {
    const d = baseDoc();
    d.source = { ...(d.source as object), ...provenance, type, [field]: null };
    expect(await errorsFor([d])).toEqual([expect.stringMatching(new RegExp(`source.${field} is required`))]);
  });

  it('rule 11: the budget is checked with a full 2,000-character answer', async () => {
    // Pad the reference so the prompt with a full-length answer lands exactly on the budget.
    const measure = async (d: Doc) => {
      const e = { ...d, stimulus: normalizeBody(BODY) } as unknown as Exercise;
      const snapshot = await buildSnapshot(e as BuiltExercise, e.tasks[0]!);
      return (answer: string) =>
        renderPrompt('00000000-0000-4000-8000-000000000000', 'ZZZZZZ', [
          { rowId: 'I01', attemptId: 'x', snapshot, answer },
        ]).length;
    };
    const d = baseDoc();
    const full = (await measure(d))('x'.repeat(MAX_ANSWER_LENGTH));
    task(d).reference = `${String(task(d).reference)}${'r'.repeat(PROMPT_BUDGET - full)}`;
    const len = await measure(d);
    expect(len('x'.repeat(MAX_ANSWER_LENGTH))).toBe(PROMPT_BUDGET);
    expect(await errorsFor([d])).toEqual([]);

    const over = structuredClone(d);
    task(over).reference = `${String(task(over).reference)}r`;
    expect((await measure(over))('short')).toBeLessThan(PROMPT_BUDGET);
    expect((await errorsFor([over])).join()).toMatch(/over the 24000 budget/);
  });

  it('rule 12: an unrecorded publication blocks the build until --lock records it', async () => {
    const approved = await approve(baseDoc());
    expect((await validateContent(files([approved]))).unrecorded.join()).toMatch(/not recorded as published/);
    const ledger = await lock([approved]);
    expect(await errorsFor([approved], { ledger })).toEqual([]);
  });

  it('rule 12: a key keeps its skill and max', async () => {
    const ledger = await lock([await approve(baseDoc())]);
    const reskilled = baseDoc();
    task(reskilled).skill = 'conclusion';
    task(reskilled).likely_errors = [];
    expect((await errorsFor([await approve(reskilled)], { ledger })).join()).toMatch(/needs a new key/);

    const remaxed = baseDoc();
    task(remaxed).max = 1;
    task(remaxed).rubric = ['Names the gap.'];
    task(remaxed).anchors = [
      { points: 1, answer: 'a' },
      { points: 0, answer: 'b' },
    ];
    expect((await errorsFor([await approve(remaxed)], { ledger })).join()).toMatch(/needs a new key/);
  });

  it('rule 12: a wording fix is re-approved and recorded, keeping its history', async () => {
    const ledger = await lock([await approve(baseDoc())]);
    const reworded = baseDoc();
    task(reworded).reference = 'Low attendance is not zero attendance.';
    const approved = await approve(reworded);
    expect((await errorsFor([approved], { ledger })).join()).toMatch(/changed since it was recorded/);
    const next = await lock([approved], ledger);
    expect((JSON.parse(next) as Ledger).tasks['arg-0001.flaw']!.revisions).toHaveLength(2);
    expect(await errorsFor([approved], { ledger: next })).toEqual([]);
  });

  it('rule 12: retiring a task must be recorded, and is then permanent', async () => {
    const published = await approve(baseDoc());
    const ledger = await lock([published]);
    const retiredDoc = baseDoc();
    task(retiredDoc).status = 'retired';
    const retired = await approve(retiredDoc);
    expect((await errorsFor([retired], { ledger })).join()).toMatch(/still lists it as active/);
    const after = await lock([retired], ledger);
    expect(JSON.parse(after) as Ledger).toMatchObject({ tasks: { 'arg-0001.flaw': { status: 'retired' } } });
    expect(await errorsFor([retired], { ledger: after })).toEqual([]);
    expect((await errorsFor([published], { ledger: after })).join()).toMatch(/cannot become active again/);
  });

  it('rule 12: retiring a whole exercise is recorded for every task', async () => {
    const published = await approve(baseDoc());
    const ledger = await lock([published]);
    const retired = { ...published, status: 'retired' };
    expect((await errorsFor([retired], { ledger })).join()).toMatch(/still lists it as active/);
    const after = await lock([retired], ledger);
    expect(Object.values((JSON.parse(after) as Ledger).tasks).every((t) => t.status === 'retired')).toBe(true);
    expect((await errorsFor([published], { ledger: after })).join()).toMatch(/cannot become active again/);
  });

  it('rule 12: content that was never published cannot enter as retired, even with --lock', async () => {
    const retired = { ...(await approve(baseDoc())), status: 'retired' };
    const r = await validateContent(files([retired]));
    expect(r.errors.join()).toMatch(/never published/);
    expect(Object.keys(r.ledger.tasks)).toEqual([]);
  });

  it('--lock never waives content errors, whatever their text says', async () => {
    const d = await approve(baseDoc());
    task(d).skill = 'run `npm run content -- --lock`';
    const r = await validateContent(files([d]));
    expect(r.errors.join()).toMatch(/unknown skill/);
  });

  it('production bundles exclude drafts and keep published and retired exercises', async () => {
    const ex = (id: string, status: string) => ({ id, status }) as BuiltExercise;
    const all = [ex('arg-0001', 'draft'), ex('arg-0002', 'published'), ex('arg-0003', 'retired')];
    expect(bundleExercises(all, true).map((e) => e.id)).toEqual(['arg-0002', 'arg-0003']);
    expect(bundleExercises(all, false)).toHaveLength(3);
  });

  it('rule 13: word counts outside the range warn', async () => {
    const short = await validateContent({ ...files([]), exercises: [file(baseDoc(), 'Too short.')] });
    expect(short.errors).toEqual([]);
    expect(short.warnings.join()).toMatch(/2 words, outside the 60–180 range/);
    const long = await validateContent({ ...files([]), exercises: [file(baseDoc(), 'word '.repeat(181))] });
    expect(long.warnings.join()).toMatch(/181 words/);
    const passage = { ...baseDoc(), id: 'psg-0001', kind: 'passage' };
    const p = await validateContent({ ...files([]), exercises: [file(passage, 'word '.repeat(400))] });
    expect(p.warnings.join()).toMatch(/1 paragraphs, outside 3–5/);
  });

  it.each([
    ['the body', (d: Doc) => d, `${BODY} Like the lsat.`, 'LSAT'],
    ['a reference', (d: Doc) => void (task(d).reference = 'As on a PrepTest.'), BODY, 'PrepTest'],
    ['a rubric', (d: Doc) => void (task(d).rubric = ['LSAC style.', 'x']), BODY, 'LSAC'],
    [
      'an anchor note',
      (d: Doc) => void ((task(d).anchors as { note?: string }[])[0]!.note = 'law school admission'),
      BODY,
      'Law School Admission',
    ],
    ['acceptance notes', (d: Doc) => void (task(d, 1).accept = 'Like an LSAT key.'), BODY, 'LSAT'],
  ])('rule 14: blocked strings are rejected in %s', async (_, edit, body, blocked) => {
    const d = baseDoc();
    edit(d);
    const r = await validateContent({ ...files([]), exercises: [file(d, body)] });
    expect(r.errors.join()).toMatch(new RegExp(`blocked string "${blocked}"`));
  });
});
