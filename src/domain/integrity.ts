// Cross-table checks for a whole data set: references resolve, the §5.1 invariants hold, request
// status follows the §5.2 rule, lifecycles are legal and each card agrees with its active review
// history (ARCHITECTURE.md §5.1, §7). Local checks only: nothing is replayed. Used by import and tests.

import { validateGrade, validateRange, validateStatus } from './gradeValidator.ts';
import {
  MAX_BATCH_SIZE,
  PROMPT_BUDGET,
  renderPromptForVersion,
  rowId,
  SUPPORTED_PROMPT_VERSIONS,
  type PromptRow,
  type PromptVersion,
} from './prompt.ts';
import type { AttemptRecord, CardFields, DataSet, GradingRecord, ReviewLogRecord, VersionedCard } from './records.ts';
import { effectiveReviewTime, ratingFor } from './scheduler.ts';
import { SCHEDULER_CONFIGS } from './schedulerConfig.ts';
import { canonicalJson } from './snapshot.ts';

const CARD_KEYS = [
  'due',
  'stability',
  'difficulty',
  'elapsed_days',
  'scheduled_days',
  'learning_steps',
  'reps',
  'lapses',
  'state',
  'last_review',
] as const satisfies readonly (keyof CardFields)[];

// The score parser accepts only UUID-shaped request IDs in BEGIN SCORES headers.
const REQUEST_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function sameCard(a: VersionedCard, b: VersionedCard): boolean {
  return a.schedulerVersion === b.schedulerVersion && CARD_KEYS.every((k) => a[k] === b[k]);
}

/** Cards on the active chain can become the current card after undo, then enter ts-fsrs again. */
function usableCardProblems(card: VersionedCard): string[] {
  const problems: string[] = [];
  if (![0, 1, 2, 3].includes(card.state)) problems.push('state is not supported by this scheduler');
  for (const key of ['elapsed_days', 'scheduled_days', 'learning_steps', 'reps', 'lapses'] as const) {
    if (!Number.isSafeInteger(card[key]) || card[key] < 0 || card[key] >= Number.MAX_SAFE_INTEGER) {
      problems.push(`${key} is not a nonnegative safe counter`);
    }
  }
  if (!Number.isFinite(card.stability) || !Number.isFinite(card.difficulty)) {
    problems.push('memory values are not finite');
  } else if (card.state === 0) {
    if (card.stability !== 0 || card.difficulty !== 0) problems.push('new state has nonempty memory');
  } else if (card.stability < 0.001 || card.difficulty < 1 || card.difficulty > 10) {
    problems.push('memory values are outside the FSRS input range');
  }
  if (card.state !== 0 && card.last_review === null) problems.push('reviewed state has no last review');
  if (card.schedulerVersion === 'fsrs-1') {
    if (card.state !== 2) problems.push('fsrs-1 card is not in review state');
    if (card.stability > 36500) problems.push('fsrs-1 stability exceeds its supported range');
    if (card.learning_steps !== 0) problems.push('fsrs-1 card has learning steps despite long-term scheduling');
    if (card.scheduled_days < 1 || card.reps < 1) problems.push('fsrs-1 card has no completed review interval');
  }
  return problems;
}

export function checkDataSet(data: DataSet): string[] {
  const problems: string[] = [];
  const fail = (m: string) => problems.push(m);

  const unique = <T>(rows: T[], key: (r: T) => string, table: string) => {
    const map = new Map<string, T>();
    for (const r of rows) {
      const k = key(r);
      if (map.has(k)) fail(`${table}: duplicate id ${k}`);
      map.set(k, r);
    }
    return map;
  };
  const snapshots = unique(data.snapshots, (s) => s.hash, 'snapshots');
  const sessions = unique(data.sessions, (s) => s.id, 'sessions');
  const attempts = unique(data.attempts, (a) => a.id, 'attempts');
  const requests = unique(data.requests, (r) => r.id, 'requests');
  const replies = unique(data.replies, (r) => r.id, 'replies');
  const gradings = unique(data.gradings, (g) => g.id, 'gradings');
  unique(data.reviewLogs, (l) => l.id, 'reviewLogs');
  unique(data.reviewLogs, (l) => String(l.seq), 'reviewLogs seq');
  for (const l of data.reviewLogs) {
    if (l.seq >= Number.MAX_SAFE_INTEGER) fail(`review log ${l.id}: seq has no safe headroom`);
  }
  const cards = unique(data.cards, (c) => c.taskId, 'cards');
  unique(data.taskStates, (s) => s.taskId, 'taskStates');
  unique(data.flags, (f) => f.id, 'flags');
  unique(data.operations, (o) => o.opId, 'operations');
  const configs = unique(data.schedulerConfigs, (c) => c.version, 'schedulerConfigs');
  unique(data.settings, (s) => s.key, 'settings');

  // Scheduler configurations: every referenced version resolves; a version this app knows has
  // exactly this app's definition.
  for (const c of data.schedulerConfigs) {
    const known = Object.hasOwn(SCHEDULER_CONFIGS, c.version) ? SCHEDULER_CONFIGS[c.version] : undefined;
    if (known) {
      try {
        if (canonicalJson(c.config) !== canonicalJson(known))
          fail(`scheduler ${c.version}: stored configuration differs from this app's definition`);
      } catch {
        fail(`scheduler ${c.version}: stored configuration cannot be validated`);
      }
    }
  }
  const knownVersion = (v: string) => Object.hasOwn(SCHEDULER_CONFIGS, v) || configs.has(v);
  for (const c of data.cards) if (!knownVersion(c.schedulerVersion)) fail(`card ${c.taskId}: scheduler unknown`);
  for (const l of data.reviewLogs) {
    if (!knownVersion(l.schedulerVersion)) fail(`review log ${l.id}: scheduler unknown`);
    if (l.cardBefore && !knownVersion(l.cardBefore.schedulerVersion))
      fail(`review log ${l.id}: cardBefore scheduler unknown`);
  }

  const gradingsByAttempt = new Map<string, GradingRecord[]>();
  for (const g of data.gradings) {
    if (!attempts.has(g.attemptId)) fail(`grading ${g.id}: attempt ${g.attemptId} missing`);
    if (!requests.has(g.requestId)) fail(`grading ${g.id}: request ${g.requestId} missing`);
    if (g.replyId !== null) {
      const reply = replies.get(g.replyId);
      if (!reply) fail(`grading ${g.id}: reply ${g.replyId} missing`);
      else if (reply.requestId !== g.requestId) fail(`grading ${g.id}: reply belongs to another request`);
    }
    const reply = g.replyId !== null ? replies.get(g.replyId) : undefined;
    for (const p of validateRange(g.feedbackRange, reply ? reply.raw.length : null)) fail(`grading ${g.id}: ${p}`);
    gradingsByAttempt.set(g.attemptId, [...(gradingsByAttempt.get(g.attemptId) ?? []), g]);
  }
  for (const r of data.replies) {
    if (!requests.has(r.requestId)) fail(`reply ${r.id}: request missing`);
    for (const p of validateRange(r.selectedBlock, r.raw.length)) fail(`reply ${r.id}: ${p}`);
  }
  for (const f of data.flags) {
    const a = attempts.get(f.attemptId);
    if (!a) fail(`flag ${f.id}: attempt missing`);
    if (!snapshots.has(f.snapshotHash)) fail(`flag ${f.id}: snapshot missing`);
    else if (a && a.snapshotHash !== f.snapshotHash) fail(`flag ${f.id}: snapshot differs from its attempt's`);
  }

  // Invariant 6: session entries name their attempt.
  const entryOf = new Map<string, string>();
  for (const s of data.sessions) {
    for (const e of s.entries) {
      if (e.attemptId === null) continue;
      const a = attempts.get(e.attemptId);
      if (!a) fail(`session ${s.id}: attempt ${e.attemptId} missing`);
      else {
        if (a.taskId !== e.taskId) fail(`session ${s.id}: entry task ${e.taskId} does not match attempt ${a.id}`);
        if (a.sessionId !== s.id) fail(`attempt ${a.id}: sessionId does not match the session listing it`);
      }
      if (entryOf.has(e.attemptId)) fail(`attempt ${e.attemptId} appears in more than one session entry`);
      entryOf.set(e.attemptId, s.id);
    }
  }

  const logsByAttempt = new Map<string, ReviewLogRecord[]>();
  for (const l of data.reviewLogs) logsByAttempt.set(l.attemptId, [...(logsByAttempt.get(l.attemptId) ?? []), l]);

  for (const a of data.attempts) {
    if (a.revision >= Number.MAX_SAFE_INTEGER) fail(`attempt ${a.id}: revision has no safe headroom`);
    const snap = snapshots.get(a.snapshotHash);
    if (!snap) fail(`attempt ${a.id}: snapshot missing`);
    else if (snap.taskId !== a.taskId) fail(`attempt ${a.id}: snapshot belongs to ${snap.taskId}`);
    if (!sessions.has(a.sessionId)) fail(`attempt ${a.id}: session missing`);
    if (!entryOf.has(a.id)) fail(`attempt ${a.id}: not listed in its session`);

    // Lifecycle: which states may carry a submission, a request, gradings and reviews.
    const submitted = a.state === 'submitted' || a.state === 'discarded';
    if (submitted && a.submittedAt === null) fail(`attempt ${a.id}: ${a.state} without submittedAt`);
    if (!submitted && a.submittedAt !== null) fail(`attempt ${a.id}: ${a.state} with submittedAt`);
    if (!submitted && (a.requestId !== null || a.currentGradingId !== null)) {
      fail(`attempt ${a.id}: a ${a.state} attempt cannot be in a grading request`);
    }
    if (a.state === 'discarded' && a.requestId === null) fail(`attempt ${a.id}: discarded outside a request`);

    // Invariant 2: one owning request, agreeing both ways.
    if (a.requestId !== null) {
      const r = requests.get(a.requestId);
      if (!r) fail(`attempt ${a.id}: request missing`);
      else if (!Object.values(r.rows).includes(a.id)) fail(`attempt ${a.id}: not a row of its request`);
    }

    // Invariant 3: one current grading.
    const own = gradingsByAttempt.get(a.id) ?? [];
    if (own.length && a.requestId === null) fail(`attempt ${a.id}: graded outside a request`);
    const live = own.filter((g) => g.status !== 'superseded');
    if (live.length > 1) fail(`attempt ${a.id}: more than one current grading`);
    if (a.currentGradingId === null) {
      if (live.length) fail(`attempt ${a.id}: has a current grading but currentGradingId is null`);
    } else if (live[0]?.id !== a.currentGradingId) {
      fail(`attempt ${a.id}: currentGradingId does not point to its only current grading`);
    }
    const current = a.currentGradingId ? gradings.get(a.currentGradingId) : undefined;
    if (a.state === 'discarded' && current?.status === 'accepted') fail(`attempt ${a.id}: discarded but accepted`);

    // Invariant 4: at most one active review, pointing to the accepted current grading; none for
    // coached or discarded attempts.
    const logs = logsByAttempt.get(a.id) ?? [];
    if (a.kind === 'coached' && logs.length) fail(`attempt ${a.id}: a coached attempt has a review`);
    const active = logs.filter((l) => !l.undone);
    if (active.length > 1) fail(`attempt ${a.id}: more than one active review`);
    if (a.state === 'discarded' && active.length) fail(`attempt ${a.id}: discarded but has an active review`);
    for (const l of active) {
      const g = gradings.get(l.gradingId);
      if (l.gradingId !== a.currentGradingId || g?.status !== 'accepted') {
        fail(`attempt ${a.id}: active review does not point to its accepted current grading`);
      } else if (g.score !== null && l.rating !== ratingFor(g.score, g.max, a.kind, a.ratingChoice)) {
        fail(`review log ${l.id}: rating does not follow from its grading`);
      }
    }
    if (current?.status === 'accepted' && active.length === 0 && a.kind !== 'coached') {
      fail(`attempt ${a.id}: accepted without an active review`);
    }

    // Review time is the submission time (§6.4); the scheduler's effective time is cardAfter.last_review.
    for (const l of logs) {
      if (l.reviewedAt !== a.submittedAt) fail(`review log ${l.id}: reviewedAt differs from the submission time`);
      else if (l.cardAfter.last_review !== effectiveReviewTime(l.cardBefore, l.reviewedAt)) {
        fail(`review log ${l.id}: cardAfter.last_review is not the effective review time`);
      }
    }
  }

  // Invariant 2 from the request side, and invariant 7.
  const owner = new Map<string, string>();
  for (const r of data.requests) {
    if (!REQUEST_UUID.test(r.id)) fail(`request ${r.id}: ID is not a score-parser UUID`);
    const rowIds = Object.keys(r.rows);
    if (rowIds.length === 0) fail(`request ${r.id}: no rows`);
    if (rowIds.length > MAX_BATCH_SIZE || rowIds.some((id, i) => id !== rowId(i))) {
      fail(`request ${r.id}: row IDs are not the ordered request rows`);
    }
    if (rowIds.sort().join() !== Object.keys(r.snapshots).sort().join())
      fail(`request ${r.id}: rows and snapshots differ`);
    for (const [rowId, attemptId] of Object.entries(r.rows)) {
      if (owner.has(attemptId)) fail(`attempt ${attemptId} is owned by more than one request row`);
      owner.set(attemptId, r.id);
      const a = attempts.get(attemptId);
      if (!a) fail(`request ${r.id}: attempt ${attemptId} missing`);
      else {
        if (a.requestId !== r.id) fail(`request ${r.id}: attempt ${attemptId} names another request`);
        if (r.snapshots[rowId] !== a.snapshotHash)
          fail(`request ${r.id}: row ${rowId} snapshot differs from its attempt`);
      }
    }
    const expected = requestStatus(r.rows, attempts, gradings, r.status === 'abandoned');
    if (expected !== r.status) fail(`request ${r.id}: status ${r.status} should be ${expected}`);

    // A stored clipboard prompt must be exactly what the frozen attempts and snapshots produced.
    // Keep v2's renderer for backups created before the current prompt version.
    if (!SUPPORTED_PROMPT_VERSIONS.includes(r.promptVersion as PromptVersion)) {
      fail(`request ${r.id}: unsupported prompt version ${r.promptVersion}`);
      continue;
    }
    if (!/^[0-9ABCDEFGHJKMNPQRSTVWXYZ]{6}$/.test(r.fence)) fail(`request ${r.id}: invalid fence`);
    const promptRows: PromptRow[] = [];
    for (const id of Object.keys(r.rows)) {
      const attemptId = r.rows[id]!;
      const attempt = attempts.get(attemptId);
      const snapshot = snapshots.get(r.snapshots[id]!);
      if (attempt && snapshot) {
        if (attempt.answer.includes(r.fence) || snapshot.stimulus.includes(r.fence)) {
          fail(`request ${r.id}: fence occurs in an answer or stimulus`);
        }
        promptRows.push({ rowId: id, attemptId, snapshot, answer: attempt.answer });
      }
    }
    if (promptRows.length === rowIds.length) {
      const rendered = renderPromptForVersion(r.promptVersion as PromptVersion, r.id, r.fence, promptRows);
      if (r.promptText === null) {
        if (promptRows.length !== 1) fail(`request ${r.id}: self-grading request has more than one row`);
        if (rendered.length <= PROMPT_BUDGET) fail(`request ${r.id}: null prompt is within the prompt budget`);
      } else if (r.promptText !== rendered) {
        fail(`request ${r.id}: prompt differs from its frozen answers and snapshots`);
      } else if (rendered.length > PROMPT_BUDGET) {
        fail(`request ${r.id}: stored prompt exceeds the prompt budget`);
      }
    }
  }

  // Invariants 5 and 8 through the shared grade validator, for every revision.
  for (const g of data.gradings) {
    const a = attempts.get(g.attemptId);
    const snap = a ? snapshots.get(a.snapshotHash) : undefined;
    if (a && a.requestId !== g.requestId) fail(`grading ${g.id}: request differs from its attempt's`);
    for (const p of validateStatus(g.status, g.score, g.source)) fail(`grading ${g.id}: ${p}`);
    if (snap) {
      const ctx = { snapshotMax: snap.max, allowedTags: snap.allowedTags, ownedByRequest: true };
      for (const p of validateGrade(g, ctx)) fail(`grading ${g.id}: ${p}`);
    }
  }

  // Invariant 7: review logs match their grading's attempt.
  const activeByTask = new Map<string, ReviewLogRecord[]>();
  for (const l of data.reviewLogs) {
    const g = gradings.get(l.gradingId);
    if (!g) fail(`review log ${l.id}: grading missing`);
    else if (g.attemptId !== l.attemptId) fail(`review log ${l.id}: attempt differs from its grading's`);
    const a = attempts.get(l.attemptId);
    if (!a) fail(`review log ${l.id}: attempt missing`);
    else if (a.taskId !== l.taskId) fail(`review log ${l.id}: task differs from its attempt's`);
    for (const n of [l.rating, l.cardAfter.stability, l.cardAfter.difficulty]) {
      if (!Number.isFinite(n)) fail(`review log ${l.id}: non-finite number`);
    }
    if (!l.undone) activeByTask.set(l.taskId, [...(activeByTask.get(l.taskId) ?? []), l]);
  }

  // Each card is its latest active review's cardAfter, and active reviews chain: undo only ever
  // removes the latest, so each one's cardBefore is the previous one's cardAfter (or null first).
  for (const [taskId, logs] of activeByTask) {
    logs.sort((x, y) => x.seq - y.seq);
    let previous: VersionedCard | null = null;
    for (const l of logs) {
      for (const p of usableCardProblems({ ...l.cardAfter, schedulerVersion: l.schedulerVersion })) {
        fail(`review log ${l.id}: ${p}`);
      }
      if (l.cardBefore === null ? previous !== null : previous === null || !sameCard(l.cardBefore, previous)) {
        fail(`review log ${l.id}: cardBefore is not the card the previous active review left`);
      }
      previous = { ...l.cardAfter, schedulerVersion: l.schedulerVersion };
    }
    const c = cards.get(taskId);
    if (!c) fail(`task ${taskId}: has active reviews but no card`);
    else if (!sameCard(c, previous!)) fail(`card ${taskId}: differs from its latest active review`);
  }
  for (const c of data.cards) {
    for (const p of usableCardProblems(c)) fail(`card ${c.taskId}: ${p}`);
    if (!activeByTask.has(c.taskId)) fail(`card ${c.taskId}: no active review produced it`);
    if (!Number.isFinite(c.stability) || !Number.isFinite(c.difficulty)) fail(`card ${c.taskId}: non-finite number`);
  }
  return problems;
}

function requestStatus(
  rows: Record<string, string>,
  attempts: Map<string, AttemptRecord>,
  gradings: Map<string, GradingRecord>,
  abandoned: boolean,
): 'open' | 'closed' | 'abandoned' {
  for (const id of Object.values(rows)) {
    const a = attempts.get(id);
    if (!a || a.state === 'discarded') continue;
    const g = a.currentGradingId ? gradings.get(a.currentGradingId) : undefined;
    if (g?.status !== 'accepted') return 'open';
  }
  return abandoned ? 'abandoned' : 'closed';
}
