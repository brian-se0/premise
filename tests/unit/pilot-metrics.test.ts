import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { loadAnswers } from '../../pilot/load.ts';
import {
  computeMetrics,
  finalGold,
  pct,
  runToRun,
  screen,
  upperBound95,
  type AnswerEntry,
  type GradedRow,
  type RowResult,
} from '../../pilot/metrics.ts';
import type { Snapshot } from '../../src/domain/types.ts';

const answer = (over: Partial<AnswerEntry>): AnswerEntry => ({
  id: 'x01',
  task: 'arg-0009.flaw',
  holdout: false,
  type: 'partial',
  answer: 'text',
  gold: 1,
  ...over,
});

const row = (gold: number | number[], result: RowResult, feedbackMatched = true): GradedRow => ({
  answerId: 'x',
  max: 2,
  gold: typeof gold === 'number' ? { kind: 'exact', score: gold } : { kind: 'set', scores: gold },
  result,
  feedbackMatched,
});
const score = (s: number): RowResult => ({ kind: 'score', score: s });

describe('pilot gold labels', () => {
  it("uses Claude's score when the second scorer agrees or has not scored", () => {
    expect(finalGold(answer({ gold: 2 }))).toEqual({ kind: 'exact', score: 2 });
    expect(finalGold(answer({ gold: 2, second: 2 }))).toEqual({ kind: 'exact', score: 2 });
  });

  it('refuses an unsettled disagreement, and uses a settlement or an acceptable set', () => {
    expect(() => finalGold(answer({ gold: 2, second: 1 }))).toThrow(/not settled/);
    expect(finalGold(answer({ gold: 2, second: 1, settled: 1, settlement: 'r' }))).toEqual({ kind: 'exact', score: 1 });
    expect(finalGold(answer({ gold: 2, second: 1, acceptable: [2, 1], settlement: 'r' }))).toEqual({
      kind: 'set',
      scores: [1, 2],
    });
  });
});

describe('pilot metrics', () => {
  it('counts every §9 metric with its denominator', () => {
    const m = computeMetrics(
      [
        row(2, score(2)), // agrees, full
        row(1, score(2)), // false pass
        row(2, score(1), false), // false fail, feedback unmatched
        row(0, { kind: 'abstain' }),
        row(1, { kind: 'unresolved' }, false),
        row([1, 2], score(2)), // acceptable set: reported apart
      ],
      ['clean', 'recoverable', 'manual'],
    );
    expect(m.rows).toBe(6);
    expect(m.coverage).toEqual({ n: 4, d: 6 });
    expect(m.abstention).toEqual({ n: 1, d: 6 });
    expect(m.invalidOrMissing).toEqual({ n: 1, d: 6 });
    expect(m.exactAgreement).toEqual({ n: 1, d: 3 });
    expect(m.withinAcceptable).toEqual({ n: 1, d: 1 });
    expect(m.falsePasses).toEqual({ n: 1, d: 1 });
    expect(m.falseFails).toEqual({ n: 1, d: 2 });
    expect(m.passFail).toEqual({ n: 1, d: 3 });
    expect(m.cleanParse).toEqual({ n: 1, d: 3 });
    expect(m.manualOutcome).toEqual({ n: 1, d: 3 });
    expect(m.feedbackMatch).toEqual({ n: 4, d: 6 });
    expect(m.handRows).toEqual({ n: 2, d: 3 });
  });

  it('reports an empty denominator as not evaluable, which never meets a target', () => {
    const m = computeMetrics([row(2, score(2))], ['clean']);
    expect(pct(m.falsePasses)).toBe('not evaluable');
    const checks = screen(m);
    expect(checks.find((c) => c.target === 'At most one false pass')).toEqual({
      target: 'At most one false pass',
      value: null,
      met: false,
    });
    expect(screen(computeMetrics([], [])).every((c) => !c.met && c.value === null)).toBe(true);
  });

  it('applies the screening targets at their thresholds', () => {
    const rows = [...Array(9)].map(() => row(1, score(1))).concat([row(2, { kind: 'abstain' })]);
    const checks = screen(computeMetrics(rows, Array(10).fill('clean')));
    expect(checks.find((c) => c.target.startsWith('Resolution coverage'))).toMatchObject({
      met: true,
      value: '9/10 (90%)',
    });
    const twoFalsePasses = screen(computeMetrics([row(1, score(2)), row(0, score(2)), row(1, score(1))], ['clean']));
    expect(twoFalsePasses.find((c) => c.target === 'At most one false pass')).toMatchObject({
      met: false,
      value: '2/3',
    });
  });

  it('gives the §9 zero-failure bound and exact bounds otherwise', () => {
    expect(upperBound95(0, 9)!).toBeCloseTo(1 - Math.pow(0.05, 1 / 9), 6);
    expect(upperBound95(0, 9)!).toBeCloseTo(0.283, 3);
    expect(upperBound95(0, 28)!).toBeGreaterThan(0.1);
    expect(upperBound95(0, 29)!).toBeLessThan(0.1);
    expect(upperBound95(1, 10)!).toBeCloseTo(0.3942, 3);
    expect(upperBound95(4, 4)).toBe(1);
    expect(upperBound95(0, 0)).toBeNull();
  });

  it('compares two runs over answers resolved in both, counting non-decisions apart', () => {
    const a = new Map<string, RowResult>([
      ['a', score(2)],
      ['b', score(1)],
      ['c', { kind: 'abstain' }],
      ['d', score(0)],
    ]);
    const b = new Map<string, RowResult>([
      ['a', score(2)],
      ['b', score(2)],
      ['c', score(1)],
    ]);
    expect(runToRun(a, b)).toEqual({ same: { n: 1, d: 2 }, nonDecisionPairs: 1 });
  });
});

describe('pilot answer files', () => {
  let dir = '';
  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true });
  });
  const snapshots = new Map([
    ['arg-0009.flaw', { max: 2, exerciseId: 'arg-0009' } as Snapshot],
    ['arg-0009.strengthen', { max: 2, exerciseId: 'arg-0009' } as Snapshot],
    ['arg-0013.conclusion', { max: 1, exerciseId: 'arg-0013' } as Snapshot],
  ]);
  const load = (files: Record<string, string>) => {
    dir = mkdtempSync(join(tmpdir(), 'pilot-answers-'));
    for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text);
    return () => loadAnswers(snapshots, dir);
  };
  const entry = (id: string, task: string, extra = '') =>
    `- id: ${id}\n  task: ${task}\n  holdout: false\n  type: partial\n  answer: text\n  gold: 1\n${extra}`;

  it('reads every answer file but the walkthrough', () => {
    const answers = load({
      'flaw.yaml': entry('fla01', 'arg-0009.flaw'),
      'walkthrough.yaml': 'not: a list',
    })();
    expect([...answers.keys()]).toEqual(['fla01']);
  });

  it('rejects duplicate ids, unknown tasks, out-of-range scores and unexplained settlements', () => {
    expect(load({ 'a.yaml': entry('x', 'arg-0009.flaw') + entry('x', 'arg-0009.flaw') })).toThrow(/duplicate/);
    expect(load({ 'a.yaml': entry('x', 'arg-0099.flaw') })).toThrow(/unknown task/);
    expect(load({ 'a.yaml': entry('x', 'arg-0013.conclusion', '  second: 2\n') })).toThrow(/second must be/);
    expect(load({ 'a.yaml': entry('x', 'arg-0009.flaw', '  second: 2\n  settled: 2\n') })).toThrow(/settlement reason/);
    expect(load({ 'a.yaml': entry('x', 'arg-0009.flaw', '  acceptable: [1]\n') })).toThrow(/two or more/);
  });

  it('keeps the holdout split by whole exercise', () => {
    const mixed =
      entry('x', 'arg-0009.flaw') + entry('y', 'arg-0009.strengthen').replace('holdout: false', 'holdout: true');
    expect(load({ 'a.yaml': mixed })).toThrow(/same holdout value/);
  });
});
