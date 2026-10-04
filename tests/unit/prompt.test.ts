import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadExercises } from '../../scripts/content.ts';
import { chooseFence, planRequests, renderPrompt, type GradingItem } from '../../src/domain/prompt.ts';
import { buildSnapshot, canonicalJson } from '../../src/domain/snapshot.ts';
import type { Snapshot } from '../../src/domain/types.ts';

async function allSnapshots(): Promise<Map<string, Snapshot>> {
  const map = new Map<string, Snapshot>();
  for (const e of loadExercises()) for (const t of e.tasks) {
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
  it('renders the skeleton, shared stimulus and fenced answers', async () => {
    const snaps = await allSnapshots();
    const rows = [
      { rowId: 'I01', attemptId: 'a1', snapshot: snaps.get('arg-0001.conclusion')!, answer: 'Harlow should not switch.' },
      { rowId: 'I02', attemptId: 'a2', snapshot: snaps.get('arg-0001.flaw')!, answer: '   ' },
    ];
    const text = renderPrompt(ID, 'ABC123', rows);
    expect(text).toContain(`BEGIN SCORES v2 request=${ID}\nI01 | __/2 | --\nI02 | __/2 | --\nEND SCORES`);
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
    const items: GradingItem[] = Array.from({ length: 5 }, (_, i) => ({ attemptId: `a${i}`, snapshot: s, answer: `answer ${i}` }));
    let n = 0;
    const reqs = planRequests(items, { batchSize: 4, newId: () => `req-${n++}`, random: seeded(2) });
    expect(reqs.map((r) => r.rows.map((x) => x.attemptId))).toEqual([['a0', 'a1', 'a2', 'a3'], ['a4']]);
    expect(reqs[1]!.rows[0]!.rowId).toBe('I01');
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
    expect(() => planRequests([{ attemptId: 'a', snapshot: s, answer: 'x'.repeat(2001) }], { newId: () => ID, random: seeded(4) })).toThrow();
  });
});

const pilotRoot = join('tests', 'fixtures', 'pilot');
const pilotPrompts = existsSync(pilotRoot)
  ? readdirSync(pilotRoot, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.prompt.txt'))
  : [];

describe.skipIf(pilotPrompts.length === 0)('pilot fixtures', () => {
  const root = pilotRoot;
  it.each(pilotPrompts)('reproduces %s byte for byte', async (file) => {
    const snaps = await allSnapshots();
    const meta = JSON.parse(readFileSync(join(root, file.replace('.prompt.txt', '.json')), 'utf8')) as {
      id: string;
      fence: string;
      rows: { rowId: string; attemptId: string; taskId: string; snapshotHash: string; answer: string }[];
    };
    const rows = meta.rows.map((r) => {
      const snapshot = snaps.get(r.taskId)!;
      expect(snapshot.hash, `content of ${r.taskId} changed since the fixture was made`).toBe(r.snapshotHash);
      return { rowId: r.rowId, attemptId: r.attemptId, snapshot, answer: r.answer };
    });
    expect(renderPrompt(meta.id, meta.fence, rows)).toBe(readFileSync(join(root, file), 'utf8'));
  });
});
