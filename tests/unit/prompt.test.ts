import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadSnapshots } from '../../pilot/load.ts';
import { loadExercises } from '../../scripts/content.ts';
import {
  chooseFence,
  planRequests,
  PROMPT_VERSION,
  renderPrompt,
  renderPromptForVersion,
  renderPromptV2,
  type GradingItem,
  type PromptVersion,
} from '../../src/domain/prompt.ts';
import { buildSnapshot, canonicalJson } from '../../src/domain/snapshot.ts';
import type { Snapshot } from '../../src/domain/types.ts';

async function allSnapshots(): Promise<Map<string, Snapshot>> {
  const map = new Map<string, Snapshot>();
  for (const e of await loadExercises())
    for (const t of e.tasks) {
      const s = await buildSnapshot(e, t);
      map.set(s.taskId, s);
    }
  return map;
}

function seeded(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ID = '11111111-2222-4333-8444-555555555555';

describe('snapshot', () => {
  it('serializes canonically with sorted keys', () => {
    expect(canonicalJson({ b: 1, a: [2, { d: 'x', c: null }] })).toBe('{"a":[2,{"c":null,"d":"x"}],"b":1}');
  });

  it('gives different hashes to different tasks and is stable', async () => {
    const snaps = await allSnapshots();
    const flaw = snaps.get('arg-0001.flaw')!;
    const conclusion = snaps.get('arg-0001.conclusion')!;
    expect(flaw.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(flaw.hash).not.toBe(conclusion.hash);
    expect((await allSnapshots()).get('arg-0001.flaw')!.hash).toBe(flaw.hash);
  });
});

describe('prompt builder', () => {
  it('keeps exact v2 and v3 bytes and freezes the v4 template', () => {
    const snapshot: Snapshot = {
      snapshotFormat: 1,
      taskId: 'arg-9999.flaw',
      exerciseId: 'arg-9999',
      kind: 'argument',
      skill: 'flaw',
      difficulty: 2,
      stimulus: 'A short argument.',
      credit: null,
      prompt: 'Name the flaw.',
      max: 2,
      reference: 'It assumes a link.',
      accept: null,
      disqualifiers: [],
      rubric: ['Find the gap.', 'Explain why it matters.'],
      anchors: [{ points: 2, answer: 'The argument assumes a link.' }],
      allowedTags: ['incomplete'],
      hash: '0'.repeat(64),
    };
    const rows = [{ rowId: 'I01', attemptId: 'a1', snapshot, answer: 'A brief answer.' }];
    const digest = (s: string) => createHash('sha256').update(s).digest('hex');
    // The v2 digest was taken from the renderer before this version change.
    expect(digest(renderPromptV2(ID, 'ABC123', rows))).toBe(
      'a8594cac76ce2ab2a12a98932d86235d255912091c0075b46f9549fcc7f69924',
    );
    expect(digest(renderPromptForVersion('v3', ID, 'ABC123', rows))).toBe(
      'abe0b781f9c49663c4ba4d98848dbbe1cc738c07cc0406181f688e3098a1021c',
    );
    expect(digest(renderPrompt(ID, 'ABC123', rows))).toBe(
      '19d78275a944e7ae83ea3a0508c886cb0fa5d328f6f0624e394fd6f3e2928dad',
    );
  });

  it('uses v4 feedback boundaries but keeps the v2 score block', async () => {
    const s = (await allSnapshots()).get('arg-0001.flaw')!;
    const rows = [{ rowId: 'I01', attemptId: 'a', snapshot: s, answer: 'An answer.' }];
    const current = renderPrompt(ID, 'ABC123', rows);
    expect(PROMPT_VERSION).toBe('v4');
    expect(current).toContain(`BEGIN FEEDBACK request=${ID}`);
    expect(current).toContain('END FEEDBACK');
    expect(current).toContain(`BEGIN SCORES v2 request=${ID}`);
    expect(current.match(/^I\d\d: \{score\}\/\d+$/gm)).toEqual([`I01: {score}/${s.max}`]);
    expect(current.indexOf('\nEND FEEDBACK\n')).toBeLessThan(current.indexOf('\nBEGIN SCORES v2'));
    expect(renderPromptForVersion('v4', ID, 'ABC123', rows)).toBe(current);
    expect(renderPromptForVersion('v2', ID, 'ABC123', rows)).toBe(renderPromptV2(ID, 'ABC123', rows));
    expect(renderPromptV2(ID, 'ABC123', rows)).not.toContain('BEGIN FEEDBACK');
  });

  it('renders the skeleton, shared stimulus and fenced answers', async () => {
    const snaps = await allSnapshots();
    const rows = [
      {
        rowId: 'I01',
        attemptId: 'a1',
        snapshot: snaps.get('arg-0001.conclusion')!,
        answer: 'Harlow should not switch.',
      },
      { rowId: 'I02', attemptId: 'a2', snapshot: snaps.get('arg-0001.flaw')!, answer: '   ' },
    ];
    const text = renderPrompt(ID, 'ABC123', rows);
    expect(text.match(/^BEGIN FEEDBACK request=/gm)).toHaveLength(1);
    expect(text.match(/^END FEEDBACK$/gm)).toHaveLength(1);
    const feedbackShape = text.slice(
      text.indexOf(`BEGIN FEEDBACK request=${ID}\n`),
      text.indexOf('\nEND FEEDBACK\n') + '\nEND FEEDBACK'.length,
    );
    expect(feedbackShape).toContain(`I01: {score}/${rows[0]!.snapshot.max}`);
    expect(feedbackShape).toContain(`I02: {score}/${rows[1]!.snapshot.max}`);
    expect(feedbackShape.indexOf('I01:')).toBeLessThan(feedbackShape.indexOf('I02:'));
    expect(text).toContain('Copy the completed score block directly after END FEEDBACK');
    expect(text).toContain(
      `BEGIN SCORES v2 request=${ID}\nI01 | __/${rows[0]!.snapshot.max} | --\nI02 | __/${rows[1]!.snapshot.max} | --\nEND SCORES`,
    );
    expect(text).toContain('=== I02 ===\nStimulus:\nsame as I01\n\nTask:');
    expect(text).toContain('<<<ANSWER-ABC123\n(blank)\nANSWER-ABC123>>>');
    expect(text).toContain('Text between <<<ANSWER-ABC123 and ANSWER-ABC123>>>');
    expect(text).not.toContain('{{');
    expect(text.endsWith('=== END OF ITEMS ===\n')).toBe(true);
  });

  it('chooses a fence absent from the texts', () => {
    const fence = chooseFence(['xyz'], seeded(1));
    expect(fence).toMatch(/^[0-9A-HJKMNP-TV-Z]{6}$/);
    let calls = 0;
    const scripted = () => [0, 0, 0, 0, 0, 0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5][calls++ % 12]!;
    expect(chooseFence(['000000'], scripted)).toBe('GGGGGG');
  });

  it('splits by batch size in session order', async () => {
    const snaps = await allSnapshots();
    const s = snaps.get('arg-0001.flaw')!;
    const items: GradingItem[] = Array.from({ length: 5 }, (_, i) => ({
      attemptId: `a${i}`,
      snapshot: s,
      answer: `answer ${i}`,
    }));
    let n = 0;
    const reqs = planRequests(items, { batchSize: 4, newId: () => `req-${n++}`, random: seeded(2) });
    expect(reqs.every((r) => r.promptVersion === 'v4')).toBe(true);
    expect(reqs.map((r) => r.rows.map((x) => x.attemptId))).toEqual([['a0', 'a1', 'a2', 'a3'], ['a4']]);
    expect(reqs[1]!.rows[0]!.rowId).toBe('I01');
  });

  it('uses the default size for invalid batch sizes and caps larger sizes at eight', async () => {
    const s = (await allSnapshots()).get('arg-0001.flaw')!;
    const items: GradingItem[] = Array.from({ length: 9 }, (_, i) => ({
      attemptId: `a${i}`,
      snapshot: s,
      answer: `answer ${i}`,
    }));
    for (const batchSize of [0, -1, Number.NaN, 1.5]) {
      let n = 0;
      const requests = planRequests(items, { batchSize, newId: () => `req-${n++}`, random: seeded(5) });
      expect(requests.map((r) => r.rows.length)).toEqual([4, 4, 1]);
      expect(requests.flatMap((r) => r.rows.map((row) => row.attemptId))).toEqual(items.map((i) => i.attemptId));
      expect(requests.every((r) => r.rows.length > 0)).toBe(true);
    }
    let n = 0;
    const capped = planRequests(items, { batchSize: 99, newId: () => `req-${n++}`, random: seeded(5) });
    expect(capped.map((r) => r.rows.length)).toEqual([8, 1]);
  });

  it('splits by budget and makes oversized items self-grading only', async () => {
    const snaps = await allSnapshots();
    const s = snaps.get('arg-0001.flaw')!;
    const one = renderPrompt(ID, 'XXXXXX', [{ rowId: 'I01', attemptId: 'x', snapshot: s, answer: 'a' }]).length;
    const items: GradingItem[] = ['a', 'b', 'c'].map((a) => ({ attemptId: a, snapshot: s, answer: a }));
    let n = 0;
    const newId = () => `00000000-0000-0000-0000-00000000000${n++}`;
    const reqs = planRequests(items, { budget: one + 10, newId, random: seeded(3) });
    expect(reqs.map((r) => r.rows.length)).toEqual([1, 1, 1]);
    const tiny = planRequests(items, { budget: 100, newId, random: seeded(3) });
    expect(tiny.every((r) => r.promptText === null)).toBe(true);
  });

  it('rejects answers over the length limit', async () => {
    const s = (await allSnapshots()).get('arg-0001.flaw')!;
    expect(() =>
      planRequests([{ attemptId: 'a', snapshot: s, answer: 'x'.repeat(2001) }], { newId: () => ID, random: seeded(4) }),
    ).toThrow();
  });
});

const pilotRoot = join('tests', 'fixtures', 'pilot');
const pilotPrompts = existsSync(pilotRoot)
  ? readdirSync(pilotRoot, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.prompt.txt'))
  : [];

describe.skipIf(pilotPrompts.length === 0)('pilot fixtures', () => {
  const root = pilotRoot;
  it.each(pilotPrompts)('reproduces %s byte for byte', async (file) => {
    // The grading check's tasks keep the snapshots they were scored under (pilot/load.ts).
    const snaps = await loadSnapshots();
    const meta = JSON.parse(readFileSync(join(root, file.replace('.prompt.txt', '.json')), 'utf8')) as {
      id: string;
      fence: string;
      promptVersion: PromptVersion;
      rows: { rowId: string; attemptId: string; taskId: string; snapshotHash: string; answer: string }[];
    };
    const rows = meta.rows.map((r) => {
      const snapshot = snaps.get(r.taskId)!;
      expect(snapshot.hash, `snapshot of ${r.taskId} differs from the fixture's`).toBe(r.snapshotHash);
      return { rowId: r.rowId, attemptId: r.attemptId, snapshot, answer: r.answer };
    });
    expect(renderPromptForVersion(meta.promptVersion, meta.id, meta.fence, rows)).toBe(
      readFileSync(join(root, file), 'utf8'),
    );
  });
});
