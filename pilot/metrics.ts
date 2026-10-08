// M0 pilot metrics (docs/GRADING_PROTOCOL.md §9). Pure: takes graded rows and reply outcomes,
// returns counts with their denominators. `score.ts` reads the files and prints the report.

/** One answer in pilot/answers/<skill>.yaml. */
export interface AnswerEntry {
  id: string;
  task: string;
  holdout: boolean;
  type: string;
  answer: string;
  /** Claude's score, fixed and hashed before the second scorer started. */
  gold: number;
  /** The blind second scorer's score. */
  second?: number;
  /** A disagreement settled to one score, with the reason in `settlement`. */
  settled?: number;
  /** A disagreement left as an acceptable-score set, with the reason in `settlement`. */
  acceptable?: number[];
  settlement?: string;
  why?: string;
}

export type Gold = { kind: 'exact'; score: number } | { kind: 'set'; scores: number[] };

/** The gold label used for metrics. A disagreement with the second scorer must be settled first. */
export function finalGold(a: AnswerEntry): Gold {
  if (a.acceptable !== undefined) return { kind: 'set', scores: [...new Set(a.acceptable)].sort((x, y) => x - y) };
  if (a.settled !== undefined) return { kind: 'exact', score: a.settled };
  if (a.second !== undefined && a.second !== a.gold) {
    throw new Error(`${a.id}: Claude's score ${a.gold} and the second score ${a.second} differ and are not settled`);
  }
  return { kind: 'exact', score: a.gold };
}

/** What a chatbot's reply did with one requested row. */
export type RowResult = { kind: 'score'; score: number } | { kind: 'abstain' } | { kind: 'unresolved' };

export interface GradedRow {
  answerId: string;
  max: number;
  gold: Gold;
  result: RowResult;
  feedbackMatched: boolean;
}

/**
 * Outcome of one request: the §6 parse outcomes, a reply with several different blocks to choose from,
 * or no saved reply at all.
 */
export type ReplyOutcome = 'clean' | 'recoverable' | 'manual' | 'choose' | 'missing';

export interface Ratio {
  n: number;
  d: number;
}

export interface Metrics {
  rows: number;
  coverage: Ratio;
  abstention: Ratio;
  invalidOrMissing: Ratio;
  exactAgreement: Ratio;
  /** Numeric rows whose gold is an acceptable-score set, scored inside the set. */
  withinAcceptable: Ratio;
  falsePasses: Ratio;
  falseFails: Ratio;
  passFail: Ratio;
  replies: Record<ReplyOutcome, number>;
  cleanParse: Ratio;
  /** Requests the student had to settle by hand (manual, choose or missing), over requests. */
  manualOutcome: Ratio;
  feedbackMatch: Ratio;
  /** Rows the student resolves by hand (no numeric score) over requests. */
  handRows: Ratio;
}

export function computeMetrics(rows: readonly GradedRow[], replies: readonly ReplyOutcome[]): Metrics {
  const numeric = rows.filter((r): r is GradedRow & { result: { kind: 'score' } } => r.result.kind === 'score');
  const exact = numeric.filter((r) => r.gold.kind === 'exact');
  const goldOf = (r: GradedRow) => (r.gold as { score: number }).score;
  const belowFull = exact.filter((r) => goldOf(r) < r.max);
  const full = exact.filter((r) => goldOf(r) === r.max);
  const sets = numeric.filter((r) => r.gold.kind === 'set');
  const count = (o: ReplyOutcome) => replies.filter((x) => x === o).length;
  const outcomes = {
    clean: count('clean'),
    recoverable: count('recoverable'),
    manual: count('manual'),
    choose: count('choose'),
    missing: count('missing'),
  };
  return {
    rows: rows.length,
    coverage: { n: numeric.length, d: rows.length },
    abstention: { n: rows.filter((r) => r.result.kind === 'abstain').length, d: rows.length },
    invalidOrMissing: { n: rows.filter((r) => r.result.kind === 'unresolved').length, d: rows.length },
    exactAgreement: { n: exact.filter((r) => r.result.score === goldOf(r)).length, d: exact.length },
    withinAcceptable: {
      n: sets.filter((r) => (r.gold as { scores: number[] }).scores.includes(r.result.score)).length,
      d: sets.length,
    },
    falsePasses: { n: belowFull.filter((r) => r.result.score === r.max).length, d: belowFull.length },
    falseFails: { n: full.filter((r) => r.result.score < r.max).length, d: full.length },
    passFail: { n: exact.filter((r) => (r.result.score === r.max) === (goldOf(r) === r.max)).length, d: exact.length },
    replies: outcomes,
    cleanParse: { n: outcomes.clean, d: replies.length },
    manualOutcome: { n: outcomes.manual + outcomes.choose + outcomes.missing, d: replies.length },
    feedbackMatch: { n: rows.filter((r) => r.feedbackMatched).length, d: rows.length },
    handRows: { n: rows.length - numeric.length, d: replies.length },
  };
}

/** Same score in two runs, over answers resolved numerically in both; other shared answers are counted apart. */
export function runToRun(
  a: ReadonlyMap<string, RowResult>,
  b: ReadonlyMap<string, RowResult>,
): { same: Ratio; nonDecisionPairs: number } {
  let n = 0;
  let d = 0;
  let nonDecisionPairs = 0;
  for (const [id, ra] of a) {
    const rb = b.get(id);
    if (rb === undefined) continue;
    if (ra.kind === 'score' && rb.kind === 'score') {
      d++;
      if (ra.score === rb.score) n++;
    } else nonDecisionPairs++;
  }
  return { same: { n, d }, nonDecisionPairs };
}

function binomialCdf(k: number, n: number, p: number): number {
  let term = Math.pow(1 - p, n);
  let sum = term;
  for (let i = 1; i <= k; i++) {
    term *= ((n - i + 1) / i) * (p / (1 - p));
    sum += term;
  }
  return sum;
}

/**
 * One-sided 95% upper bound on a failure rate after `failures` in `n` independent cases (exact,
 * Clopper-Pearson). With no failures it is 1 − 0.05^(1/n), as in §9. Null when `n` is 0.
 */
export function upperBound95(failures: number, n: number): number | null {
  if (n === 0) return null;
  if (failures >= n) return 1;
  let lo = failures / n;
  let hi = 1;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (binomialCdf(failures, n, mid) > 0.05) lo = mid;
    else hi = mid;
  }
  return hi;
}

export interface TargetCheck {
  target: string;
  /** Null when the metric is not evaluable, which does not meet the target. */
  value: string | null;
  met: boolean;
}

/** §9 screening targets for one run of a frozen candidate on the held-out exercises. */
export function screen(m: Metrics): TargetCheck[] {
  const atLeast = (label: string, r: Ratio, share: number): TargetCheck =>
    r.d === 0 ? { target: label, value: null, met: false } : { target: label, value: pct(r), met: r.n / r.d >= share };
  const atMost = (label: string, r: Ratio, share: number): TargetCheck =>
    r.d === 0 ? { target: label, value: null, met: false } : { target: label, value: pct(r), met: r.n / r.d <= share };
  return [
    atLeast('Resolution coverage ≥ 90%', m.coverage, 0.9),
    atLeast('Exact agreement ≥ 80%', m.exactAgreement, 0.8),
    m.falsePasses.d === 0
      ? { target: 'At most one false pass', value: null, met: false }
      : { target: 'At most one false pass', value: ratio(m.falsePasses), met: m.falsePasses.n <= 1 },
    atLeast('Pass/fail agreement ≥ 90%', m.passFail, 0.9),
    atLeast('Clean parse ≥ 90%', m.cleanParse, 0.9),
    atMost('Manual outcome ≤ 2% (counting replies to choose from and missing replies)', m.manualOutcome, 0.02),
    atLeast('Feedback match ≥ 90%', m.feedbackMatch, 0.9),
  ];
}

export function ratio(r: Ratio): string {
  return `${r.n}/${r.d}`;
}

/** "n/d (x%)", or "not evaluable" for an empty denominator (never zero errors). */
export function pct(r: Ratio): string {
  return r.d === 0 ? 'not evaluable' : `${r.n}/${r.d} (${((100 * r.n) / r.d).toFixed(0)}%)`;
}
