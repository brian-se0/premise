// UI-level helpers that combine planner and storage calls.

import type { PlannedEntry } from '../domain/planner.ts';
import type { AttemptRecord, SessionRecord } from '../domain/records.ts';
import { startSession } from '../storage/ops.ts';
import { ctx, db } from './runtime.ts';

export async function beginSession(mode: SessionRecord['mode'], entries: PlannedEntry[]): Promise<string | null> {
  if (entries.length === 0) return null;
  const session = await startSession(
    db,
    ctx(),
    mode,
    entries.map((e) => e.taskId),
  );
  return session.id;
}

export interface RequestSummary {
  id: string;
  label: string;
  createdAt: string;
  pending: number;
  needsReview: number;
  total: number;
}

/** Open requests with their pending and needs-review counts, for "Awaiting grading". */
export async function awaitingRequests(): Promise<RequestSummary[]> {
  const open = await db.requests.where('status').equals('open').toArray();
  const out: RequestSummary[] = [];
  for (const r of open.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))) {
    const attempts = await db.attempts.bulkGet(Object.values(r.rows));
    let pending = 0;
    let needsReview = 0;
    for (const a of attempts) {
      if (!a || a.state === 'discarded') continue;
      const g = a.currentGradingId ? await db.gradings.get(a.currentGradingId) : undefined;
      if (!g) pending++;
      else if (g.status === 'needs-review') needsReview++;
    }
    out.push({ id: r.id, label: r.label, createdAt: r.createdAt, pending, needsReview, total: attempts.length });
  }
  return out;
}

/** Sessions with an entry not yet answered, newest first. */
export async function unfinishedSessions(): Promise<{ session: SessionRecord; remaining: number }[]> {
  const sessions = await db.sessions.toArray();
  const out: { session: SessionRecord; remaining: number }[] = [];
  for (const s of sessions) {
    if (s.endedAt) continue;
    const ids = s.entries.map((e) => e.attemptId).filter((x): x is string => x !== null);
    const attempts = await db.attempts.bulkGet(ids);
    const done = attempts.filter((a) => a && a.state !== 'draft').length;
    const remaining = s.entries.length - done;
    if (remaining > 0) out.push({ session: s, remaining });
  }
  return out.sort((a, b) => (a.session.createdAt < b.session.createdAt ? 1 : -1));
}

/** Ended sessions whose submitted answers were never put into a grading request, newest first. */
export async function ungradedSessions(): Promise<{ session: SessionRecord; attempts: AttemptRecord[] }[]> {
  const sessions = await db.sessions.toArray();
  const out: { session: SessionRecord; attempts: AttemptRecord[] }[] = [];
  for (const s of sessions) {
    if (!s.endedAt) continue;
    const ids = s.entries.map((e) => e.attemptId).filter((x): x is string => x !== null);
    const attempts = (await db.attempts.bulkGet(ids)).filter(
      (a): a is AttemptRecord => !!a && a.state === 'submitted' && a.requestId === null,
    );
    if (attempts.length > 0) out.push({ session: s, attempts });
  }
  return out.sort((a, b) => (a.session.createdAt < b.session.createdAt ? 1 : -1));
}

/** Requests that no longer wait on anything, newest first, so their results stay reachable. */
export async function recentRequests(limit = 10): Promise<{ id: string; label: string; createdAt: string }[]> {
  const done = await db.requests.where('status').anyOf('closed', 'abandoned').toArray();
  return done
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit)
    .map((r) => ({ id: r.id, label: r.label, createdAt: r.createdAt }));
}
