// Cross-table checks for a whole data set: references resolve, the §5.1 invariants hold and
// request status follows the §5.2 rule (ARCHITECTURE.md §5.1, §7). Used by import and tests.

import type { AttemptRecord, DataSet, GradingRecord } from './records.ts';

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
  unique(data.cards, (c) => c.taskId, 'cards');
  unique(data.taskStates, (s) => s.taskId, 'taskStates');
  unique(data.flags, (f) => f.id, 'flags');
  unique(data.operations, (o) => o.opId, 'operations');
  unique(data.settings, (s) => s.key, 'settings');

  const gradingsByAttempt = new Map<string, GradingRecord[]>();
  for (const g of data.gradings) {
    if (!attempts.has(g.attemptId)) fail(`grading ${g.id}: attempt ${g.attemptId} missing`);
    if (!requests.has(g.requestId)) fail(`grading ${g.id}: request ${g.requestId} missing`);
    if (g.replyId !== null && !replies.has(g.replyId)) fail(`grading ${g.id}: reply ${g.replyId} missing`);
    gradingsByAttempt.set(g.attemptId, [...(gradingsByAttempt.get(g.attemptId) ?? []), g]);
  }
  for (const r of data.replies) if (!requests.has(r.requestId)) fail(`reply ${r.id}: request missing`);
  for (const f of data.flags) if (!attempts.has(f.attemptId)) fail(`flag ${f.id}: attempt missing`);

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

  for (const a of data.attempts) {
    const snap = snapshots.get(a.snapshotHash);
    if (!snap) fail(`attempt ${a.id}: snapshot missing`);
    else if (snap.taskId !== a.taskId) fail(`attempt ${a.id}: snapshot belongs to ${snap.taskId}`);
    if (!sessions.has(a.sessionId)) fail(`attempt ${a.id}: session missing`);
    if (!entryOf.has(a.id)) fail(`attempt ${a.id}: not listed in its session`);
    if (a.state !== 'draft' && a.submittedAt === null && a.state !== 'skipped') {
      fail(`attempt ${a.id}: ${a.state} without submittedAt`);
    }
    if (a.state === 'draft' && (a.requestId !== null || a.currentGradingId !== null)) {
      fail(`attempt ${a.id}: a draft cannot be in a grading request`);
    }

    // Invariant 2: one owning request, agreeing both ways.
    if (a.requestId !== null) {
      const r = requests.get(a.requestId);
      if (!r) fail(`attempt ${a.id}: request missing`);
      else if (!Object.values(r.rows).includes(a.id)) fail(`attempt ${a.id}: not a row of its request`);
    }

    // Invariant 3: one current grading.
    const own = gradingsByAttempt.get(a.id) ?? [];
    const live = own.filter((g) => g.status !== 'superseded');
    if (live.length > 1) fail(`attempt ${a.id}: more than one current grading`);
    if (a.currentGradingId === null) {
      if (live.length) fail(`attempt ${a.id}: has a current grading but currentGradingId is null`);
    } else if (live[0]?.id !== a.currentGradingId) {
      fail(`attempt ${a.id}: currentGradingId does not point to its only current grading`);
    }

    // Invariant 4: at most one active review, pointing to the accepted current grading.
    const active = data.reviewLogs.filter((l) => l.attemptId === a.id && !l.undone);
    if (active.length > 1) fail(`attempt ${a.id}: more than one active review`);
    for (const l of active) {
      const g = gradings.get(l.gradingId);
      if (l.gradingId !== a.currentGradingId || g?.status !== 'accepted') {
        fail(`attempt ${a.id}: active review does not point to its accepted current grading`);
      }
    }
  }

  // Invariant 2 from the request side, and invariant 7.
  const owner = new Map<string, string>();
  for (const r of data.requests) {
    const rowIds = Object.keys(r.rows);
    if (rowIds.length === 0) fail(`request ${r.id}: no rows`);
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
  }

  for (const g of data.gradings) {
    const a = attempts.get(g.attemptId);
    const snap = a ? snapshots.get(a.snapshotHash) : undefined;
    // Invariant 5: accepted means valid.
    if (g.status === 'accepted') {
      if (g.score === null || !Number.isInteger(g.score) || g.score < 0 || g.score > g.max) {
        fail(`grading ${g.id}: accepted with an invalid score`);
      }
      if (snap && g.max !== snap.max) fail(`grading ${g.id}: max differs from the snapshot`);
      if (snap && g.tags.some((t) => !snap.allowedTags.includes(t))) fail(`grading ${g.id}: tag not allowed`);
    }
    if (g.status === 'needs-review' && g.score !== null) fail(`grading ${g.id}: needs-review with a score`);
    // Invariant 8: disqualified means zero.
    if (g.disqualified && (g.source !== 'self' || g.score !== 0))
      fail(`grading ${g.id}: disqualified but not a self-grade of 0`);
    if (a && a.requestId !== g.requestId) fail(`grading ${g.id}: request differs from its attempt's`);
  }

  // Invariant 7: review logs match their grading's attempt.
  for (const l of data.reviewLogs) {
    const g = gradings.get(l.gradingId);
    if (!g) fail(`review log ${l.id}: grading missing`);
    else if (g.attemptId !== l.attemptId) fail(`review log ${l.id}: attempt differs from its grading's`);
    const a = attempts.get(l.attemptId);
    if (a && a.taskId !== l.taskId) fail(`review log ${l.id}: task differs from its attempt's`);
    for (const n of [l.rating, l.cardAfter.stability, l.cardAfter.difficulty]) {
      if (!Number.isFinite(n)) fail(`review log ${l.id}: non-finite number`);
    }
  }
  for (const c of data.cards) {
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
