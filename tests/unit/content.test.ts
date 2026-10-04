// One failing fixture per validation rule in docs/EXERCISE_FORMAT.md §4.

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { stringify } from 'yaml';
import {
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

async function errorsFor(docs: Doc[], extra: Partial<ContentFiles> = {}): Promise<string[]> {
  return (await validateContent(files(docs, extra))).errors;
}

async function approve(doc: Doc, by = 'owner'): Promise<Doc> {
  const revision = await contentRevision(doc, normalizeBody(BODY));
  return { ...doc, status: 'published', approved_by: by, approved_at: '2026-10-04', approved_revision: revision };
}

/** Validates once with --lock semantics and returns the ledger it would write. */
async function ledgerFor(docs: Doc[]): Promise<string> {
  return JSON.stringify((await validateContent(files(docs))).ledger);
}

function task(doc: Doc, i = 0): Record<string, unknown> {
  return doc.tasks[i]!;
}

describe('content validation', () => {
  it('accepts the base fixture and the real content', async () => {
    expect(await errorsFor([baseDoc()])).toEqual([]);
    const { readContentFiles } = await import('../../scripts/content.ts');
    expect((await validateContent(readContentFiles())).errors).toEqual([]);
  });

  it('rule 1: rejects unknown keys and wrong types', async () => {
    const d = baseDoc();
    d.colour = 'blue';
    expect((await errorsFor([d])).join()).toMatch(/colour/);
    const e = baseDoc();
    task(e).max = 'two';
    expect(await errorsFor([e])).not.toEqual([]);
    const f = baseDoc();
    task(f).status = 'paused';
    expect((await errorsFor([f])).join()).toMatch(/status/);
  });

  it('rule 2: id must match the file name and be unique; task keys unique', async () => {
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
  });

  it('rule 3: skills and error tags come from the taxonomy', async () => {
    const d = baseDoc();
    task(d).skill = 'vibes';
    expect((await errorsFor([d])).join()).toMatch(/unknown skill vibes/);
    const e = baseDoc();
    task(e).likely_errors = ['made-up'];
    expect((await errorsFor([e])).join()).toMatch(/unknown error tag made-up/);
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

  it('rule 7: publishing needs an approval bound to the current revision', async () => {
    const unapproved = { ...baseDoc(), status: 'published' };
    expect((await errorsFor([unapproved])).join()).toMatch(/need approved_by/);

    const approved = await approve(baseDoc());
    const ledger = await ledgerFor([approved]);
    expect(await errorsFor([approved], { ledger })).toEqual([]);

    const edited = structuredClone(approved);
    edited.difficulty = 4;
    expect((await errorsFor([edited], { ledger })).join()).toMatch(/needs re-approval/);
  });

  it('rule 8: approvers are maintainers, independent when a contributor is not', async () => {
    const stranger = await approve(baseDoc(), 'nobody');
    expect((await errorsFor([stranger])).join()).toMatch(/not in maintainers.yaml/);

    const outside = await approve({ ...baseDoc(), contributors: ['owner', 'guest'] }, 'owner');
    expect((await errorsFor([outside])).join()).toMatch(/must be approved by a maintainer who is not a contributor/);

    const independent = await approve({ ...baseDoc(), contributors: ['owner', 'guest'] }, 'second');
    const ledger = await ledgerFor([independent]);
    expect(await errorsFor([independent], { ledger })).toEqual([]);
  });

  it('rule 9: non-original sources need full provenance', async () => {
    const d = baseDoc();
    d.source = {
      ...(d.source as object),
      type: 'public-domain',
      title: 'T',
      creator: 'C',
      locator: 'L',
      attribution: 'A',
      rights_basis: 'R',
    };
    expect((await errorsFor([d])).join()).toMatch(/source.year is required/);
    const e = baseDoc();
    e.source = { ...(e.source as object), type: 'cc-by', title: 'T', creator: 'C', locator: 'L', attribution: 'A' };
    const errs = (await errorsFor([e])).join();
    expect(errs).toMatch(/source.rights_basis is required/);
    expect(errs).toMatch(/source.license_uri is required/);
  });

  it('rule 11: a full-length answer fits the prompt budget', async () => {
    const d = baseDoc();
    task(d).reference = 'x '.repeat(12_000);
    expect((await errorsFor([d])).join()).toMatch(/over the 24000 budget/);
  });

  it('rule 12: published keys keep their meaning and retired tasks stay retired', async () => {
    const approved = await approve(baseDoc());
    const ledger = await ledgerFor([approved]);

    expect((await errorsFor([approved])).join()).toMatch(/not recorded as published/);

    const reused = baseDoc();
    task(reused).skill = 'conclusion';
    task(reused).likely_errors = [];
    expect((await errorsFor([await approve(reused)], { ledger })).join()).toMatch(/needs a new key/);

    const retired = baseDoc();
    task(retired).status = 'retired';
    const retiredApproved = await approve(retired);
    const retiredLedger = await ledgerFor([retiredApproved]);
    expect(JSON.parse(retiredLedger) as Ledger).toMatchObject({ tasks: { 'arg-0001.flaw': { status: 'retired' } } });
    expect((await errorsFor([approved], { ledger: retiredLedger })).join()).toMatch(/cannot become active again/);

    const reworded = baseDoc();
    task(reworded).reference = 'Low attendance is not zero attendance.';
    expect((await errorsFor([await approve(reworded)], { ledger })).join()).toMatch(/changed since it was recorded/);
  });

  it('rule 13: word counts outside the range warn', async () => {
    const result = await validateContent({ ...files([]), exercises: [file(baseDoc(), 'Too short.')] });
    expect(result.errors).toEqual([]);
    expect(result.warnings.join()).toMatch(/2 words, outside the 60–180 range/);
  });

  it('rule 14: blocked strings are rejected in the body and task text', async () => {
    const result = await validateContent({ ...files([]), exercises: [file(baseDoc(), `${BODY} Like the lsat.`)] });
    expect(result.errors.join()).toMatch(/blocked string "LSAT"/);
    const d = baseDoc();
    task(d).reference = 'As on a PrepTest.';
    expect((await errorsFor([d])).join()).toMatch(/blocked string "PrepTest"/);
  });
});
