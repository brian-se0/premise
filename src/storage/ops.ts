// Storage operations (ARCHITECTURE.md §6.2–6.4). Each runs in one read-write transaction over
// every table it touches. Grading operations take a client-generated opId: a repeated opId
// returns the stored receipt's result without writing; a stale revision writes nothing.

import { addDays, localDate } from '../domain/dates.ts';
import { validateGrade } from '../domain/gradeValidator.ts';
import { MAX_ANSWER_LENGTH, planRequests, type GradingItem } from '../domain/prompt.ts';
import type {
  AttemptKind,
  AttemptRecord,
  CardFields,
  FlagCategory,
  GradingRecord,
  GradingSource,
  Range,
  RatingChoice,
  ReplyRecord,
  RequestRecord,
  ReviewLogRecord,
  SessionRecord,
  SnapshotRecord,
} from '../domain/records.ts';
import { ratingFor, review } from '../domain/scheduler.ts';
import { CURRENT_SCHEDULER, RATING_POLICY, SCHEDULER_CONFIGS } from '../domain/schedulerConfig.ts';
import type { Snapshot } from '../domain/types.ts';
import type { PremiseDb } from './db.ts';

/** Time, ids and randomness come from the caller so tests are deterministic. */
export interface OpContext {
  now: string;
  newId: () => string;
  random: () => number;
}

export class StaleError extends Error {
  constructor(
    public readonly attemptIds: string[],
    message = 'This answer changed in another tab or by an undo.',
  ) {
    super(message);
    this.name = 'StaleError';
  }
}

export class OpError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OpError';
  }
}

/** Test hook: called inside grading transactions just before the receipt is written. */
export const faults: { beforeReceipt: ((op: string) => void) | null } = { beforeReceipt: null };

const LABEL_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function label(random: () => number): string {
  let s = '';
  for (let i = 0; i < 4; i++) s += LABEL_ALPHABET[Math.floor(random() * LABEL_ALPHABET.length)];
  return s;
}

// ---------- Sessions and attempts ----------

export async function startSession(
  db: PremiseDb,
  ctx: OpContext,
  mode: SessionRecord['mode'],
  taskIds: string[],
): Promise<SessionRecord> {
  const session: SessionRecord = {
    id: ctx.newId(),
    entries: taskIds.map((taskId) => ({ taskId, attemptId: null })),
    cursor: 0,
    createdAt: ctx.now,
    endedAt: null,
    mode,
  };
  await db.sessions.add(session);
  return session;
}

/**
 * Opens a session entry: creates its draft attempt the first time (freezing the snapshot) and
 * moves the cursor. Returns the attempt.
 */
export async function openEntry(
  db: PremiseDb,
  ctx: OpContext,
  sessionId: string,
  index: number,
  snapshot: Snapshot,
): Promise<AttemptRecord> {
  return db.transaction('rw', [db.sessions, db.attempts, db.snapshots, db.cards], async () => {
    const session = await db.sessions.get(sessionId);
    if (!session) throw new OpError('Session not found.');
    const entry = session.entries[index];
    if (!entry) throw new OpError('No such task in this session.');
    if (entry.taskId !== snapshot.taskId) throw new OpError('Snapshot does not match the session entry.');
    session.cursor = index;
    if (entry.attemptId) {
      await db.sessions.put(session);
      const existing = await db.attempts.get(entry.attemptId);
      if (!existing) throw new OpError('Attempt missing.');
      return existing;
    }
    if (!(await db.snapshots.get(snapshot.hash))) {
      await db.snapshots.add({ ...snapshot, firstSeenAt: ctx.now } satisfies SnapshotRecord);
    }
    const exercisePrefix = `${snapshot.exerciseId}.`;
    const seenBefore = (await db.attempts.where('taskId').startsWith(exercisePrefix).count()) > 0;
    const kind: AttemptKind =
      session.mode === 'retry' ? 'coached' : (await db.cards.get(snapshot.taskId)) ? 'review' : 'new';
    const attempt: AttemptRecord = {
      id: ctx.newId(),
      sessionId,
      taskId: snapshot.taskId,
      snapshotHash: snapshot.hash,
      answer: '',
      state: 'draft',
      kind,
      stimulusSeenBefore: seenBefore,
      ratingChoice: 'good',
      requestId: null,
      currentGradingId: null,
      revision: 0,
      startedAt: ctx.now,
      submittedAt: null,
      updatedAt: ctx.now,
      elapsedSeconds: null,
    };
    await db.attempts.add(attempt);
    entry.attemptId = attempt.id;
    await db.sessions.put(session);
    return attempt;
  });
}

export async function saveDraft(db: PremiseDb, ctx: OpContext, attemptId: string, answer: string): Promise<void> {
  await db.transaction('rw', [db.attempts], async () => {
    const a = await db.attempts.get(attemptId);
    if (!a) throw new OpError('Attempt not found.');
    if (a.state !== 'draft') throw new OpError('This answer was already submitted.');
    await db.attempts.update(attemptId, { answer, updatedAt: ctx.now });
  });
}

/** Freezes the attempt (invariant 1). An empty answer is a deliberate blank submission. */
export async function submitAttempt(
  db: PremiseDb,
  ctx: OpContext,
  attemptId: string,
  answer: string,
  elapsedSeconds: number | null,
): Promise<AttemptRecord> {
  if (answer.length > MAX_ANSWER_LENGTH) {
    throw new OpError(`Answers are limited to ${MAX_ANSWER_LENGTH.toLocaleString()} characters.`);
  }
  return db.transaction('rw', [db.attempts], async () => {
    const a = await db.attempts.get(attemptId);
    if (!a) throw new OpError('Attempt not found.');
    if (a.state === 'submitted') return a;
    if (a.state !== 'draft') throw new OpError('This task was skipped.');
    const next: AttemptRecord = {
      ...a,
      answer,
      state: 'submitted',
      submittedAt: ctx.now,
      updatedAt: ctx.now,
      elapsedSeconds,
      revision: a.revision + 1,
    };
    await db.attempts.put(next);
    return next;
  });
}

export async function skipAttempt(db: PremiseDb, ctx: OpContext, attemptId: string): Promise<void> {
  await db.transaction('rw', [db.attempts], async () => {
    const a = await db.attempts.get(attemptId);
    if (!a || a.state !== 'draft') return;
    await db.attempts.update(attemptId, { state: 'skipped', updatedAt: ctx.now, revision: a.revision + 1 });
  });
}

export async function endSession(db: PremiseDb, ctx: OpContext, sessionId: string): Promise<void> {
  await db.sessions.update(sessionId, { endedAt: ctx.now });
}

// ---------- Receipts ----------

type Tx = PremiseDb;

async function receipt<T>(db: Tx, opId: string): Promise<T | undefined> {
  const r = await db.operations.get(opId);
  return r ? (r.result as T) : undefined;
}

async function writeReceipt(
  db: Tx,
  ctx: OpContext,
  opId: string,
  name: string,
  attempts: AttemptRecord[],
  result: unknown,
): Promise<void> {
  faults.beforeReceipt?.(name);
  await db.operations.add({
    opId,
    name,
    affectedIds: attempts.map((a) => a.id),
    resultingRevisions: Object.fromEntries(attempts.map((a) => [a.id, a.revision])),
    result,
    createdAt: ctx.now,
  });
}

const GRADING_TABLES = (db: PremiseDb) => [
  db.attempts,
  db.requests,
  db.replies,
  db.gradings,
  db.reviewLogs,
  db.cards,
  db.taskStates,
  db.snapshots,
  db.operations,
];

// ---------- prepareGrading ----------

export interface PrepareResult {
  requestIds: string[];
}

/**
 * Creates grading requests for submitted, unowned attempts, in the order given (session order).
 * Attempts already owned return their existing requests; the stored prompt text is reused.
 */
export async function prepareGrading(
  db: PremiseDb,
  ctx: OpContext,
  opId: string,
  attemptIds: string[],
  batchSize: number,
): Promise<PrepareResult> {
  return db.transaction('rw', GRADING_TABLES(db), async () => {
    const done = await receipt<PrepareResult>(db, opId);
    if (done) return done;
    const attempts = await db.attempts.bulkGet(attemptIds);
    const requestIds: string[] = [];
    const items: GradingItem[] = [];
    for (const [i, a] of attempts.entries()) {
      if (!a) throw new OpError(`Attempt ${attemptIds[i]} not found.`);
      if (a.requestId) {
        if (!requestIds.includes(a.requestId)) requestIds.push(a.requestId);
        continue;
      }
      if (a.state !== 'submitted') throw new OpError('Only submitted answers can be graded.');
      const snapshot = await db.snapshots.get(a.snapshotHash);
      if (!snapshot) throw new OpError('Snapshot missing.');
      items.push({ attemptId: a.id, snapshot, answer: a.answer });
    }
    const changed: AttemptRecord[] = [];
    for (const planned of planRequests(items, { batchSize, newId: ctx.newId, random: ctx.random })) {
      const request: RequestRecord = {
        id: planned.id,
        label: label(ctx.random),
        rows: Object.fromEntries(planned.rows.map((r) => [r.rowId, r.attemptId])),
        snapshots: Object.fromEntries(planned.rows.map((r) => [r.rowId, r.snapshot.hash])),
        fence: planned.fence,
        promptVersion: planned.promptVersion,
        promptText: planned.promptText,
        createdAt: ctx.now,
        status: 'open',
      };
      await db.requests.add(request);
      requestIds.push(request.id);
      for (const r of planned.rows) {
        const a = attempts.find((x) => x?.id === r.attemptId)!;
        const next = { ...a, requestId: request.id, revision: a.revision + 1, updatedAt: ctx.now };
        await db.attempts.put(next);
        changed.push(next);
      }
    }
    const result: PrepareResult = { requestIds };
    await writeReceipt(db, ctx, opId, 'prepareGrading', changed, result);
    return result;
  });
}

// ---------- Row state ----------

export type RowState = 'pending' | 'needs-review' | 'accepted' | 'discarded';

export function rowState(attempt: AttemptRecord, current: GradingRecord | undefined): RowState {
  if (attempt.state === 'discarded') return 'discarded';
  if (current?.status === 'accepted') return 'accepted';
  if (current?.status === 'needs-review') return 'needs-review';
  return 'pending';
}

async function refreshRequestStatus(db: Tx, requestId: string): Promise<void> {
  const request = await db.requests.get(requestId);
  if (!request) return;
  const attempts = await db.attempts.bulkGet(Object.values(request.rows));
  let waiting = false;
  for (const a of attempts) {
    if (!a) continue;
    const g = a.currentGradingId ? await db.gradings.get(a.currentGradingId) : undefined;
    const s = rowState(a, g);
    if (s === 'pending' || s === 'needs-review') waiting = true;
  }
  const status = waiting ? 'open' : request.status === 'abandoned' ? 'abandoned' : 'closed';
  if (status !== request.status) await db.requests.update(requestId, { status });
}

// ---------- Applying grades ----------

export interface GradeRow {
  attemptId: string;
  /** The attempt revision the UI last read. */
  revision: number;
  score: number | null;
  tags: string[];
  source: GradingSource;
  disqualified: boolean;
  feedbackRange: Range | null;
  ratingChoice: RatingChoice;
}

async function latestActiveLog(db: Tx, taskId: string): Promise<ReviewLogRecord | undefined> {
  const logs = (await db.reviewLogs.where('taskId').equals(taskId).toArray()).filter((l) => !l.undone);
  return logs.sort((a, b) => (a.appliedAt < b.appliedAt ? -1 : a.appliedAt > b.appliedAt ? 1 : 0)).at(-1);
}

async function activeLogFor(db: Tx, attemptId: string): Promise<ReviewLogRecord | undefined> {
  return (await db.reviewLogs.where('attemptId').equals(attemptId).toArray()).find((l) => !l.undone);
}

/** Undoes an attempt's active review: restores the card from cardBefore (§6.3). taskStates is untouched. */
async function undoReview(db: Tx, log: ReviewLogRecord): Promise<void> {
  await db.reviewLogs.update(log.id, { undone: true });
  if (log.cardBefore) {
    await db.cards.put({ ...log.cardBefore, taskId: log.taskId, schedulerVersion: log.schedulerVersion });
  } else {
    await db.cards.delete(log.taskId);
  }
}

/** Writes one grading revision for an attempt and schedules it when accepted and uncoached. */
async function applyGrade(
  db: Tx,
  ctx: OpContext,
  opId: string,
  attempt: AttemptRecord,
  row: GradeRow,
  replyId: string | null,
): Promise<AttemptRecord> {
  const snapshot = await db.snapshots.get(attempt.snapshotHash);
  if (!snapshot) throw new OpError('Snapshot missing.');
  const problems = validateGrade(
    { score: row.score, max: snapshot.max, tags: row.tags, source: row.source, disqualified: row.disqualified },
    { snapshotMax: snapshot.max, allowedTags: snapshot.allowedTags, ownedByRequest: attempt.requestId !== null },
  );
  if (problems.length) throw new OpError(problems.join(' '));

  if (attempt.currentGradingId) await db.gradings.update(attempt.currentGradingId, { status: 'superseded' });
  const grading: GradingRecord = {
    id: ctx.newId(),
    attemptId: attempt.id,
    requestId: attempt.requestId!,
    replyId,
    opId,
    score: row.score,
    max: snapshot.max,
    tags: row.tags,
    status: row.score === null ? 'needs-review' : 'accepted',
    source: row.source,
    disqualified: row.disqualified,
    feedbackRange: row.feedbackRange,
    createdAt: ctx.now,
  };
  await db.gradings.add(grading);

  if (grading.status === 'accepted') {
    const rating = ratingFor(grading.score!, grading.max, attempt.kind, row.ratingChoice);
    if (rating !== null) {
      const existing = await db.cards.get(attempt.taskId);
      const version = existing?.schedulerVersion ?? CURRENT_SCHEDULER;
      if (!SCHEDULER_CONFIGS[version]) throw new OpError('This card uses a scheduler this app does not know.');
      const cardBefore: CardFields | null = existing ? stripCard(existing) : null;
      const { after, reviewedAt } = review(version, cardBefore, rating, attempt.submittedAt!);
      await db.cards.put({ ...after, taskId: attempt.taskId, schedulerVersion: version });
      await db.reviewLogs.add({
        id: ctx.newId(),
        taskId: attempt.taskId,
        attemptId: attempt.id,
        gradingId: grading.id,
        opId,
        rating,
        ratingPolicy: RATING_POLICY,
        schedulerVersion: version,
        reviewedAt,
        cardBefore,
        cardAfter: after,
        appliedAt: ctx.now,
        undone: false,
      });
    }
    // Not offered again before the next local day (§6.4); never cleared by undo or correction.
    const notBefore = addDays(localDate(new Date(ctx.now)), 1);
    const state = await db.taskStates.get(attempt.taskId);
    if (!state?.notBefore || state.notBefore < notBefore) {
      await db.taskStates.put({ taskId: attempt.taskId, suspended: state?.suspended ?? false, notBefore });
    }
  }

  const next: AttemptRecord = {
    ...attempt,
    currentGradingId: grading.id,
    ratingChoice: row.ratingChoice,
    revision: attempt.revision + 1,
    updatedAt: ctx.now,
  };
  await db.attempts.put(next);
  return next;
}

function stripCard(card: CardFields & { taskId?: string; schedulerVersion?: string }): CardFields {
  return {
    due: card.due,
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review,
  };
}

async function loadFresh(db: Tx, rows: { attemptId: string; revision: number }[]): Promise<AttemptRecord[]> {
  const attempts = await db.attempts.bulkGet(rows.map((r) => r.attemptId));
  const stale = rows.filter((r, i) => attempts[i]?.revision !== r.revision).map((r) => r.attemptId);
  if (stale.length) throw new StaleError(stale);
  return attempts as AttemptRecord[];
}

export interface ConfirmResult {
  requestId: string;
  replyId: string | null;
  gradingIds: Record<string, string>;
}

/**
 * Saves grades for rows of one request exactly once: one grading revision per row; accepted,
 * uncoached rows get a review log and card update. Rows must be pending or needs-review.
 */
export async function confirmRows(
  db: PremiseDb,
  ctx: OpContext,
  opId: string,
  requestId: string,
  rows: GradeRow[],
  reply: Omit<ReplyRecord, 'id' | 'requestId' | 'pastedAt'> | null,
): Promise<ConfirmResult> {
  return db.transaction('rw', GRADING_TABLES(db), async () => {
    const done = await receipt<ConfirmResult>(db, opId);
    if (done) return done;
    const request = await db.requests.get(requestId);
    if (!request) throw new OpError('Grading request not found.');
    const attempts = await loadFresh(db, rows);
    for (const a of attempts) {
      if (a.requestId !== requestId) throw new OpError('An answer does not belong to this request.');
      const g = a.currentGradingId ? await db.gradings.get(a.currentGradingId) : undefined;
      const state = rowState(a, g);
      if (state === 'accepted' || state === 'discarded')
        throw new StaleError([a.id], `This answer is already ${state}.`);
    }
    let replyId: string | null = null;
    if (reply) {
      replyId = ctx.newId();
      await db.replies.add({ ...reply, id: replyId, requestId, pastedAt: ctx.now });
    }
    const changed: AttemptRecord[] = [];
    const gradingIds: Record<string, string> = {};
    for (const [i, row] of rows.entries()) {
      const next = await applyGrade(db, ctx, opId, attempts[i]!, row, replyId);
      changed.push(next);
      gradingIds[next.id] = next.currentGradingId!;
    }
    await refreshRequestStatus(db, requestId);
    const result: ConfirmResult = { requestId, replyId, gradingIds };
    await writeReceipt(db, ctx, opId, 'confirmRows', changed, result);
    return result;
  });
}

export interface AttemptOpResult {
  attemptId: string;
  revision: number;
}

/** Can this attempt's grade be corrected or undone? Only if its review is the card's latest. */
export async function canChangeGrade(db: PremiseDb, attemptId: string): Promise<boolean> {
  return db.transaction('r', [db.attempts, db.reviewLogs], async () => {
    const a = await db.attempts.get(attemptId);
    if (!a) return false;
    const log = await activeLogFor(db, attemptId);
    if (!log) return true;
    return (await latestActiveLog(db, a.taskId))?.id === log.id;
  });
}

async function unwindForChange(db: Tx, attempt: AttemptRecord): Promise<void> {
  const log = await activeLogFor(db, attempt.id);
  if (log) {
    const latest = await latestActiveLog(db, attempt.taskId);
    if (latest?.id !== log.id) throw new OpError('Older grades are locked: this task was reviewed again since.');
    if (!SCHEDULER_CONFIGS[log.schedulerVersion])
      throw new OpError('This review used a scheduler this app does not know.');
    await undoReview(db, log);
  }
}

/** Replaces the current grading with a new accepted revision (§6.3). */
export async function correctGrade(
  db: PremiseDb,
  ctx: OpContext,
  opId: string,
  row: GradeRow,
): Promise<AttemptOpResult> {
  return db.transaction('rw', GRADING_TABLES(db), async () => {
    const done = await receipt<AttemptOpResult>(db, opId);
    if (done) return done;
    const [attempt] = await loadFresh(db, [row]);
    if (!attempt!.currentGradingId) throw new OpError('There is no grade to correct.');
    await unwindForChange(db, attempt!);
    const next = await applyGrade(db, ctx, opId, attempt!, row, null);
    await refreshRequestStatus(db, attempt!.requestId!);
    const result = { attemptId: next.id, revision: next.revision };
    await writeReceipt(db, ctx, opId, 'correctGrade', [next], result);
    return result;
  });
}

/** Undoes the latest grade: the grading is superseded and the row returns to pending. */
export async function undoLatest(
  db: PremiseDb,
  ctx: OpContext,
  opId: string,
  attemptId: string,
  revision: number,
): Promise<AttemptOpResult> {
  return db.transaction('rw', GRADING_TABLES(db), async () => {
    const done = await receipt<AttemptOpResult>(db, opId);
    if (done) return done;
    const [attempt] = await loadFresh(db, [{ attemptId, revision }]);
    if (!attempt!.currentGradingId) throw new OpError('There is no grade to undo.');
    await unwindForChange(db, attempt!);
    await db.gradings.update(attempt!.currentGradingId, { status: 'superseded' });
    const next = { ...attempt!, currentGradingId: null, revision: attempt!.revision + 1, updatedAt: ctx.now };
    await db.attempts.put(next);
    await refreshRequestStatus(db, attempt!.requestId!);
    const result = { attemptId, revision: next.revision };
    await writeReceipt(db, ctx, opId, 'undoLatest', [next], result);
    return result;
  });
}

/** Moves pending or needs-review rows to discarded. Accepted rows are untouched. */
export async function discardRows(
  db: PremiseDb,
  ctx: OpContext,
  opId: string,
  requestId: string,
  rows: { attemptId: string; revision: number }[],
): Promise<{ discarded: string[] }> {
  return db.transaction('rw', GRADING_TABLES(db), async () => {
    const done = await receipt<{ discarded: string[] }>(db, opId);
    if (done) return done;
    const attempts = await loadFresh(db, rows);
    const changed: AttemptRecord[] = [];
    for (const a of attempts) {
      if (a.requestId !== requestId) throw new OpError('An answer does not belong to this request.');
      const g = a.currentGradingId ? await db.gradings.get(a.currentGradingId) : undefined;
      const state = rowState(a, g);
      if (state !== 'pending' && state !== 'needs-review')
        throw new StaleError([a.id], `This answer is already ${state}.`);
      const next = { ...a, state: 'discarded' as const, revision: a.revision + 1, updatedAt: ctx.now };
      await db.attempts.put(next);
      changed.push(next);
    }
    await refreshRequestStatus(db, requestId);
    const result = { discarded: changed.map((a) => a.id) };
    await writeReceipt(db, ctx, opId, 'discardRows', changed, result);
    return result;
  });
}

/** Discards every waiting row of a request and marks it abandoned. */
export async function abandonRequest(
  db: PremiseDb,
  ctx: OpContext,
  opId: string,
  requestId: string,
): Promise<{ discarded: string[] }> {
  return db.transaction('rw', GRADING_TABLES(db), async () => {
    const done = await receipt<{ discarded: string[] }>(db, opId);
    if (done) return done;
    const request = await db.requests.get(requestId);
    if (!request) throw new OpError('Grading request not found.');
    const attempts = (await db.attempts.bulkGet(Object.values(request.rows))) as AttemptRecord[];
    const changed: AttemptRecord[] = [];
    for (const a of attempts) {
      const g = a.currentGradingId ? await db.gradings.get(a.currentGradingId) : undefined;
      const state = rowState(a, g);
      if (state !== 'pending' && state !== 'needs-review') continue;
      const next = { ...a, state: 'discarded' as const, revision: a.revision + 1, updatedAt: ctx.now };
      await db.attempts.put(next);
      changed.push(next);
    }
    await db.requests.update(requestId, { status: 'abandoned' });
    const result = { discarded: changed.map((a) => a.id) };
    await writeReceipt(db, ctx, opId, 'abandonRequest', changed, result);
    return result;
  });
}

/** New grading revision with the same score and status but different tags; no scheduling change. */
export async function setTags(
  db: PremiseDb,
  ctx: OpContext,
  opId: string,
  attemptId: string,
  revision: number,
  tags: string[],
): Promise<AttemptOpResult> {
  return db.transaction('rw', GRADING_TABLES(db), async () => {
    const done = await receipt<AttemptOpResult>(db, opId);
    if (done) return done;
    const [attempt] = await loadFresh(db, [{ attemptId, revision }]);
    const current = attempt!.currentGradingId ? await db.gradings.get(attempt!.currentGradingId) : undefined;
    if (!current || current.status === 'superseded') throw new OpError('There is no grade to tag.');
    const snapshot = await db.snapshots.get(attempt!.snapshotHash);
    const problems = validateGrade(
      { score: current.score, max: current.max, tags, source: current.source, disqualified: current.disqualified },
      { snapshotMax: snapshot!.max, allowedTags: snapshot!.allowedTags, ownedByRequest: true },
    );
    if (problems.length) throw new OpError(problems.join(' '));
    const grading: GradingRecord = { ...current, id: ctx.newId(), opId, tags, createdAt: ctx.now };
    await db.gradings.update(current.id, { status: 'superseded' });
    await db.gradings.add(grading);
    // The active review now points at the new revision (invariant 4).
    const log = await activeLogFor(db, attemptId);
    if (log) await db.reviewLogs.update(log.id, { gradingId: grading.id });
    const next = { ...attempt!, currentGradingId: grading.id, revision: attempt!.revision + 1, updatedAt: ctx.now };
    await db.attempts.put(next);
    const result = { attemptId, revision: next.revision };
    await writeReceipt(db, ctx, opId, 'setTags', [next], result);
    return result;
  });
}

/** Suspends or resumes a task. Edits taskStates only. */
export async function setTaskControls(
  db: PremiseDb,
  ctx: OpContext,
  opId: string,
  taskId: string,
  controls: { suspended: boolean },
): Promise<void> {
  await db.transaction('rw', [db.taskStates, db.operations], async () => {
    if (await db.operations.get(opId)) return;
    const state = await db.taskStates.get(taskId);
    await db.taskStates.put({ taskId, notBefore: state?.notBefore ?? null, suspended: controls.suspended });
    await db.operations.add({
      opId,
      name: 'setTaskControls',
      affectedIds: [taskId],
      resultingRevisions: {},
      result: null,
      createdAt: ctx.now,
    });
  });
}

export async function addFlag(
  db: PremiseDb,
  ctx: OpContext,
  attemptId: string,
  category: FlagCategory,
  note: string,
): Promise<void> {
  const a = await db.attempts.get(attemptId);
  if (!a) throw new OpError('Attempt not found.');
  await db.flags.add({ id: ctx.newId(), attemptId, snapshotHash: a.snapshotHash, category, note, createdAt: ctx.now });
}
