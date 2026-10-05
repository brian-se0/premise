// Storage operations (ARCHITECTURE.md §6.2–6.4). Each runs in one read-write transaction over
// every table it touches. Grading operations take a client-generated opId: a repeated opId
// returns the stored receipt's result without writing; a stale revision writes nothing.

import { addDays, localDate, localDateOf } from '../domain/dates.ts';
import { validateGrade, validateRange } from '../domain/gradeValidator.ts';
import { MAX_ANSWER_LENGTH, planRequests, type GradingItem } from '../domain/prompt.ts';
import { MAX_REPLY_LENGTH, PARSER_VERSION, parseReply, type ParsedBlock } from '../domain/scoreParser.ts';
import type {
  AttemptKind,
  AttemptRecord,
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
  VersionedCard,
} from '../domain/records.ts';
import { ratingFor, review } from '../domain/scheduler.ts';
import { CURRENT_SCHEDULER, RATING_POLICY, schedulerConfig } from '../domain/schedulerConfig.ts';
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

/**
 * submitAttempt found the attempt already submitted with a different answer (another tab won).
 * The stored attempt is attached so the UI can show both texts; nothing was written.
 */
export class AlreadySubmittedError extends StaleError {
  constructor(public readonly attempt: AttemptRecord) {
    super([attempt.id], 'This answer was already submitted with different text, probably in another tab.');
    this.name = 'AlreadySubmittedError';
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

type Tx = PremiseDb;

export interface AttemptOpResult {
  attemptId: string;
  revision: number;
}

/** The persisted draft and session entry this editor last accepted. */
export interface DraftPrecondition {
  session: Pick<SessionRecord, 'id' | 'createdAt' | 'mode'>;
  entryIndex: number;
  attempt: Pick<
    AttemptRecord,
    | 'id'
    | 'sessionId'
    | 'taskId'
    | 'snapshotHash'
    | 'kind'
    | 'stimulusSeenBefore'
    | 'ratingChoice'
    | 'startedAt'
    | 'revision'
    | 'answer'
  >;
}

/** Identity excludes the mutable revision and text, which each operation checks separately. */
export function matchesDraftIdentity(
  session: SessionRecord | undefined | null,
  attempt: AttemptRecord | undefined | null,
  expected: DraftPrecondition,
  allowEnded = false,
): boolean {
  const original = expected.attempt;
  return (
    !!session &&
    !!attempt &&
    session.id === expected.session.id &&
    session.createdAt === expected.session.createdAt &&
    session.mode === expected.session.mode &&
    (allowEnded || session.endedAt === null) &&
    session.entries[expected.entryIndex]?.attemptId === original.id &&
    session.entries[expected.entryIndex]?.taskId === original.taskId &&
    attempt.id === original.id &&
    attempt.sessionId === original.sessionId &&
    attempt.sessionId === session.id &&
    attempt.taskId === original.taskId &&
    attempt.snapshotHash === original.snapshotHash &&
    attempt.kind === original.kind &&
    attempt.stimulusSeenBefore === original.stimulusSeenBefore &&
    attempt.ratingChoice === original.ratingChoice &&
    attempt.startedAt === original.startedAt
  );
}

async function draftRow(
  db: PremiseDb,
  expected: DraftPrecondition,
  allowEnded = false,
): Promise<{ session: SessionRecord; attempt: AttemptRecord }> {
  const session = await db.sessions.get(expected.session.id);
  const attempt = await db.attempts.get(expected.attempt.id);
  if (!matchesDraftIdentity(session, attempt, expected, allowEnded)) {
    throw new StaleError([expected.attempt.id], 'This answer or its session was replaced in another tab.');
  }
  return { session: session!, attempt: attempt! };
}

/** Counters must advance exactly; rounded integers would defeat revision checks and review ordering. */
function nextCounter(current: number, name: string): number {
  const next = current + 1;
  if (!Number.isSafeInteger(current) || current < 0 || !Number.isSafeInteger(next) || next >= Number.MAX_SAFE_INTEGER) {
    throw new OpError(`${name} has reached the limit for safe, importable data.`);
  }
  return next;
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

export type OpenEntryResult =
  /** This entry's attempt: created now (freezing the snapshot), or the one it already had. */
  | { status: 'opened'; attempt: AttemptRecord }
  /**
   * Another uncoached draft of this task exists (another session or tab). Nothing was created;
   * the existing draft is returned so its text is not lost (resume its session instead).
   */
  | { status: 'draft-elsewhere'; attempt: AttemptRecord }
  /** The task may not be practised now; nothing was created. */
  | {
      status: 'ineligible';
      reason: 'suspended' | 'awaiting-grade' | 'not-before' | 'not-due' | 'already-seen';
      notBefore: string | null;
    };

/**
 * Opens a session entry. The first time, it rechecks eligibility in the same transaction that
 * creates the draft attempt (§6.4): no other uncoached draft of the task, not suspended, no
 * submitted attempt still waiting for a grade, and today on or after `notBefore`. A `retry`
 * session (coached attempts) is the explicit exception and skips these checks. Moves the cursor
 * when it opens.
 */
export async function openEntry(
  db: PremiseDb,
  ctx: OpContext,
  sessionId: string,
  index: number,
  snapshot: Snapshot,
): Promise<OpenEntryResult> {
  return db.transaction(
    'rw',
    [db.sessions, db.attempts, db.snapshots, db.cards, db.taskStates, db.gradings],
    async (): Promise<OpenEntryResult> => {
      const session = await db.sessions.get(sessionId);
      if (!session) throw new OpError('Session not found.');
      if (session.endedAt !== null) throw new OpError('This session has ended.');
      const entry = session.entries[index];
      if (!entry) throw new OpError('No such task in this session.');
      if (entry.taskId !== snapshot.taskId) throw new OpError('Snapshot does not match the session entry.');
      if (entry.attemptId) {
        const existing = await db.attempts.get(entry.attemptId);
        if (!existing) throw new OpError('Attempt missing.');
        await db.sessions.put({ ...session, cursor: index });
        return { status: 'opened', attempt: existing };
      }
      if (session.mode !== 'retry') {
        const blocked = await eligibility(db, snapshot.taskId, localDate(new Date(ctx.now)), session.mode);
        if (blocked) return blocked;
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
      const entries = session.entries.map((e, i) => (i === index ? { ...e, attemptId: attempt.id } : e));
      await db.sessions.put({ ...session, entries, cursor: index });
      return { status: 'opened', attempt };
    },
  );
}

/** Why a new uncoached attempt of this task may not be created now, or null if it may. */
async function eligibility(
  db: Tx,
  taskId: string,
  today: string,
  mode: SessionRecord['mode'],
): Promise<OpenEntryResult | null> {
  const attempts = await db.attempts.where('taskId').equals(taskId).toArray();
  const draft = attempts.find((a) => a.state === 'draft' && a.kind !== 'coached');
  if (draft) return { status: 'draft-elsewhere', attempt: draft };
  const state = await db.taskStates.get(taskId);
  const notBefore = state?.notBefore ?? null;
  if (state?.suspended) return { status: 'ineligible', reason: 'suspended', notBefore };
  for (const a of attempts) {
    if (a.state !== 'submitted') continue;
    const g = a.currentGradingId ? await db.gradings.get(a.currentGradingId) : undefined;
    if (g?.status !== 'accepted') return { status: 'ineligible', reason: 'awaiting-grade', notBefore };
  }
  if (notBefore !== null && today < notBefore) return { status: 'ineligible', reason: 'not-before', notBefore };
  // New-only planning deliberately keeps skipped work available; a submitted or discarded
  // attempt means the task has actually been seen since this session was planned.
  if (mode === 'new' && attempts.some((a) => a.state === 'submitted' || a.state === 'discarded')) {
    return { status: 'ineligible', reason: 'already-seen', notBefore: null };
  }
  if (mode === 'today') {
    const card = await db.cards.get(taskId);
    if (card && today < localDateOf(card.due)) {
      return { status: 'ineligible', reason: 'not-due', notBefore: localDateOf(card.due) };
    }
  }
  return null;
}

/**
 * Saves only if the original session entry still owns this draft and its persisted revision and
 * answer still match what the editor last read or wrote. The check and write share a transaction.
 */
export async function saveDraft(
  db: PremiseDb,
  ctx: OpContext,
  expected: DraftPrecondition,
  answer: string,
): Promise<AttemptOpResult> {
  return db.transaction('rw', [db.sessions, db.attempts], async () => {
    const { attempt: a } = await draftRow(db, expected);
    if (a.state !== 'draft') throw new StaleError([a.id], 'This answer was already submitted or skipped.');
    if (a.revision !== expected.attempt.revision || a.answer !== expected.attempt.answer)
      throw new StaleError([a.id], 'This answer was changed in another tab.');
    const next = nextCounter(a.revision, 'Attempt revision');
    await db.attempts.update(a.id, { answer, updatedAt: ctx.now, revision: next });
    return { attemptId: a.id, revision: next };
  });
}

/**
 * Freezes the attempt (invariant 1). An empty answer is a deliberate blank submission. The draft
 * must still match the draft precondition. Retrying a submission that already happened returns the stored
 * attempt only if `answer` equals the submitted answer; otherwise it throws
 * AlreadySubmittedError and writes nothing.
 */
export async function submitAttempt(
  db: PremiseDb,
  ctx: OpContext,
  expected: DraftPrecondition,
  answer: string,
  elapsedSeconds: number | null,
): Promise<AttemptRecord> {
  if (answer.length > MAX_ANSWER_LENGTH) {
    throw new OpError(`Answers are limited to ${MAX_ANSWER_LENGTH.toLocaleString()} characters.`);
  }
  return db.transaction('rw', [db.sessions, db.attempts], async () => {
    const { attempt: a, session } = await draftRow(db, expected, true);
    if (a.state === 'submitted' || a.state === 'discarded') {
      if (a.answer === answer) return a;
      throw new AlreadySubmittedError(a);
    }
    if (session.endedAt !== null) throw new StaleError([a.id], 'This session has already ended.');
    if (a.state !== 'draft') throw new StaleError([a.id], 'This task was skipped.');
    if (a.revision !== expected.attempt.revision || a.answer !== expected.attempt.answer)
      throw new StaleError([a.id], 'This answer was changed in another tab.');
    const next: AttemptRecord = {
      ...a,
      answer,
      state: 'submitted',
      submittedAt: ctx.now,
      updatedAt: ctx.now,
      elapsedSeconds,
      revision: nextCounter(a.revision, 'Attempt revision'),
    };
    await db.attempts.put(next);
    return next;
  });
}

export async function skipAttempt(db: PremiseDb, ctx: OpContext, expected: DraftPrecondition): Promise<void> {
  await db.transaction('rw', [db.sessions, db.attempts], async () => {
    const { attempt: a } = await draftRow(db, expected);
    if (a.state !== 'draft' || a.revision !== expected.attempt.revision || a.answer !== expected.attempt.answer) {
      throw new StaleError([a.id], 'This answer changed or was finished in another tab.');
    }
    await db.attempts.update(a.id, {
      state: 'skipped',
      updatedAt: ctx.now,
      revision: nextCounter(a.revision, 'Attempt revision'),
    });
  });
}

export async function endSession(db: PremiseDb, ctx: OpContext, sessionId: string): Promise<void> {
  await db.transaction('rw', [db.sessions, db.attempts], async () => {
    const session = await db.sessions.get(sessionId);
    if (!session) throw new OpError('Session not found.');
    if (session.endedAt !== null) return;
    const attempts = await db.attempts.bulkGet(session.entries.map((entry) => entry.attemptId ?? ''));
    if (attempts.some((attempt) => attempt?.state === 'draft')) {
      throw new OpError('Save, submit or skip the unfinished answer before ending this session.');
    }
    await db.sessions.update(sessionId, { endedAt: ctx.now });
  });
}

// ---------- Receipts ----------

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
  otherIds: string[] = [],
): Promise<void> {
  faults.beforeReceipt?.(name);
  await db.operations.add({
    opId,
    name,
    affectedIds: [...attempts.map((a) => a.id), ...otherIds],
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

/** Rejects a row set that repeats an attempt or names one outside the request's rows. */
function checkRowSet(request: RequestRecord, attemptIds: string[]): void {
  if (new Set(attemptIds).size !== attemptIds.length) throw new OpError('The same answer appears twice.');
  const owned = new Set(Object.values(request.rows));
  if (attemptIds.some((id) => !owned.has(id))) throw new OpError('An answer does not belong to this request.');
}

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
    if (attemptIds.length === 0) throw new OpError('There are no submitted answers to grade.');
    if (new Set(attemptIds).size !== attemptIds.length) throw new OpError('The same answer appears twice.');
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
        const next = {
          ...a,
          requestId: request.id,
          revision: nextCounter(a.revision, 'Attempt revision'),
          updatedAt: ctx.now,
        };
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

// ---------- Replies ----------

export type NewReply = Omit<ReplyRecord, 'id' | 'requestId' | 'pastedAt'>;

/**
 * Stores a reply the student explicitly read, even when it gave no usable scores, so the raw
 * text is kept before manual or self grading. Link gradings to it with GradeRow.replyId.
 */
export async function saveReply(
  db: PremiseDb,
  ctx: OpContext,
  opId: string,
  requestId: string,
  reply: NewReply,
): Promise<{ replyId: string }> {
  return db.transaction('rw', [db.requests, db.replies, db.operations], async () => {
    const done = await receipt<{ replyId: string }>(db, opId);
    if (done) return done;
    if (!(await db.requests.get(requestId))) throw new OpError('Grading request not found.');
    if (reply.raw.length > MAX_REPLY_LENGTH)
      throw new OpError(`Replies are limited to ${MAX_REPLY_LENGTH} characters.`);
    const problems = validateRange(reply.selectedBlock, reply.raw.length);
    if (problems.length) throw new OpError(problems.join(' '));
    const replyId = ctx.newId();
    await db.replies.add({ ...reply, id: replyId, requestId, pastedAt: ctx.now });
    const result = { replyId };
    await writeReceipt(db, ctx, opId, 'saveReply', [], result, [replyId]);
    return result;
  });
}

// ---------- Applying grades ----------

interface GradeRowBase {
  attemptId: string;
  /** The attempt revision the UI last read. */
  revision: number;
  score: number | null;
  tags: string[];
  disqualified: boolean;
  /** Offsets into the linked reply's raw text; needs a reply. */
  feedbackRange: Range | null;
  ratingChoice: RatingChoice;
  /**
   * confirmRows only, when it creates no reply: an already stored reply of this request (from
   * saveReply) that this grade came from. Omit it to keep the provenance of the row's current
   * needs-review grading, if any.
   */
  replyId?: string | null;
}

export type GradeRow = GradeRowBase &
  (
    | {
        source: 'parsed';
        /** The frozen answer, snapshot, and reply text shown in this preview. */
        expectedAnswer: string;
        expectedSnapshotHash: string;
        expectedReplyRaw: string;
      }
    | {
        source: Exclude<GradingSource, 'parsed'>;
        expectedAnswer?: string;
        expectedSnapshotHash?: string;
        expectedReplyRaw?: never;
      }
  );

interface Provenance {
  replyId: string | null;
  feedbackRange: Range | null;
}

/** The highest stored review-log seq plus one; called inside the applying transaction. */
async function nextSeq(db: Tx): Promise<number> {
  const last = await db.reviewLogs.orderBy('seq').last();
  return nextCounter(last?.seq ?? 0, 'Review sequence');
}

/** The task's latest active review, by application sequence (never by timestamp or id). */
async function latestActiveLog(db: Tx, taskId: string): Promise<ReviewLogRecord | undefined> {
  const logs = (await db.reviewLogs.where('taskId').equals(taskId).toArray()).filter((l) => !l.undone);
  return logs.sort((a, b) => a.seq - b.seq).at(-1);
}

async function activeLogFor(db: Tx, attemptId: string): Promise<ReviewLogRecord | undefined> {
  return (await db.reviewLogs.where('attemptId').equals(attemptId).toArray()).find((l) => !l.undone);
}

/**
 * Undoes an attempt's active review: restores the card exactly from cardBefore, scheduler version
 * included (§6.3). taskStates is untouched.
 */
async function undoReview(db: Tx, log: ReviewLogRecord): Promise<void> {
  await db.reviewLogs.update(log.id, { undone: true });
  if (log.cardBefore) {
    await db.cards.put({ ...log.cardBefore, taskId: log.taskId });
  } else {
    await db.cards.delete(log.taskId);
  }
}

function versionedCard(card: VersionedCard): VersionedCard {
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
    schedulerVersion: card.schedulerVersion,
  };
}

/**
 * Writes one grading revision for an attempt and, when it is accepted and uncoached, a review
 * under the current scheduler. `confirmation` also sets the next-day eligibility restriction
 * (§6.4); correction passes false and leaves taskStates untouched.
 */
async function applyGrade(
  db: Tx,
  ctx: OpContext,
  opId: string,
  attempt: AttemptRecord,
  row: GradeRow,
  provenance: Provenance,
  confirmation: boolean,
): Promise<AttemptRecord> {
  const snapshot = await db.snapshots.get(attempt.snapshotHash);
  if (!snapshot) throw new OpError('Snapshot missing.');
  const problems = validateGrade(
    { score: row.score, max: snapshot.max, tags: row.tags, source: row.source, disqualified: row.disqualified },
    {
      snapshotMax: snapshot.max,
      allowedTags: snapshot.allowedTags,
      ownedByRequest: attempt.requestId !== null && attempt.state === 'submitted',
    },
  );
  const reply = provenance.replyId ? await db.replies.get(provenance.replyId) : undefined;
  if (provenance.replyId && reply?.requestId !== attempt.requestId) {
    problems.push('The reply does not belong to this grading request.');
  }
  problems.push(...validateRange(provenance.feedbackRange, reply ? reply.raw.length : null));
  if (problems.length) throw new OpError(problems.join(' '));

  if (attempt.currentGradingId) await db.gradings.update(attempt.currentGradingId, { status: 'superseded' });
  const grading: GradingRecord = {
    id: ctx.newId(),
    attemptId: attempt.id,
    requestId: attempt.requestId!,
    replyId: provenance.replyId,
    opId,
    score: row.score,
    max: snapshot.max,
    tags: row.tags,
    status: row.score === null ? 'needs-review' : 'accepted',
    source: row.source,
    disqualified: row.disqualified,
    feedbackRange: provenance.feedbackRange,
    createdAt: ctx.now,
  };
  await db.gradings.add(grading);

  if (grading.status === 'accepted') {
    const rating = ratingFor(grading.score!, grading.max, attempt.kind, row.ratingChoice);
    if (rating !== null) {
      // New reviews always use the current scheduler, whatever version produced the card (§7).
      const existing = await db.cards.get(attempt.taskId);
      const cardBefore = existing ? versionedCard(existing) : null;
      const reviewedAt = attempt.submittedAt!;
      const { after } = review(CURRENT_SCHEDULER, cardBefore, rating, reviewedAt);
      await db.cards.put({ ...after, taskId: attempt.taskId, schedulerVersion: CURRENT_SCHEDULER });
      await db.reviewLogs.add({
        id: ctx.newId(),
        taskId: attempt.taskId,
        attemptId: attempt.id,
        gradingId: grading.id,
        opId,
        rating,
        ratingPolicy: RATING_POLICY,
        schedulerVersion: CURRENT_SCHEDULER,
        reviewedAt,
        cardBefore,
        cardAfter: after,
        appliedAt: ctx.now,
        seq: await nextSeq(db),
        undone: false,
      });
    }
    if (confirmation) {
      // Not offered again before the next local day (§6.4); never cleared by undo or correction.
      const notBefore = addDays(localDate(new Date(ctx.now)), 1);
      const state = await db.taskStates.get(attempt.taskId);
      if (!state?.notBefore || state.notBefore < notBefore) {
        await db.taskStates.put({ taskId: attempt.taskId, suspended: state?.suspended ?? false, notBefore });
      }
    }
  }

  const next: AttemptRecord = {
    ...attempt,
    currentGradingId: grading.id,
    ratingChoice: row.ratingChoice,
    revision: nextCounter(attempt.revision, 'Attempt revision'),
    updatedAt: ctx.now,
  };
  await db.attempts.put(next);
  return next;
}

async function loadFresh(
  db: Tx,
  rows: {
    attemptId: string;
    revision: number;
    source?: GradingSource;
    expectedAnswer?: string;
    expectedSnapshotHash?: string;
    expectedReplyRaw?: string;
  }[],
): Promise<AttemptRecord[]> {
  if (
    rows.some(
      (r) =>
        r.source === 'parsed' &&
        (typeof r.expectedAnswer !== 'string' ||
          typeof r.expectedSnapshotHash !== 'string' ||
          typeof r.expectedReplyRaw !== 'string'),
    )
  ) {
    throw new OpError('A parsed grade needs the answer, snapshot and saved reply text shown in its preview.');
  }
  const attempts = await db.attempts.bulkGet(rows.map((r) => r.attemptId));
  const stale = rows
    .filter(
      (r, i) =>
        attempts[i]?.revision !== r.revision ||
        (r.expectedAnswer !== undefined && attempts[i]?.answer !== r.expectedAnswer) ||
        (r.expectedSnapshotHash !== undefined && attempts[i]?.snapshotHash !== r.expectedSnapshotHash),
    )
    .map((r) => r.attemptId);
  if (stale.length) throw new StaleError(stale);
  return attempts as AttemptRecord[];
}

async function currentGrading(db: Tx, attempt: AttemptRecord): Promise<GradingRecord | undefined> {
  return attempt.currentGradingId ? db.gradings.get(attempt.currentGradingId) : undefined;
}

export interface ConfirmResult {
  requestId: string;
  replyId: string | null;
  gradingIds: Record<string, string>;
}

/**
 * Saves grades for rows of one request exactly once: one grading revision per row; accepted,
 * uncoached rows get a review log and card update. Rows must be pending or needs-review, each
 * attempt at most once and owned by this request; otherwise nothing is written.
 *
 * `reply` stores a new reply that every row links to. With `reply` null, a row may name an
 * already stored reply (GradeRow.replyId); otherwise it keeps its current needs-review grading's
 * reply and feedback range, if any.
 */
export async function confirmRows(
  db: PremiseDb,
  ctx: OpContext,
  opId: string,
  requestId: string,
  rows: GradeRow[],
  reply: NewReply | null,
): Promise<ConfirmResult> {
  return db.transaction('rw', GRADING_TABLES(db), async () => {
    const done = await receipt<ConfirmResult>(db, opId);
    if (done) return done;
    const request = await db.requests.get(requestId);
    if (!request) throw new OpError('Grading request not found.');
    checkRowSet(
      request,
      rows.map((r) => r.attemptId),
    );
    if (reply && rows.some((r) => r.replyId !== undefined)) {
      throw new OpError('Rows cannot name another reply when a new one is saved.');
    }
    const attempts = await loadFresh(db, rows);
    const currents: (GradingRecord | undefined)[] = [];
    for (const a of attempts) {
      if (a.requestId !== requestId) throw new OpError('An answer does not belong to this request.');
      const g = await currentGrading(db, a);
      const state = rowState(a, g);
      if (state === 'accepted' || state === 'discarded')
        throw new StaleError([a.id], `This answer is already ${state}.`);
      currents.push(g);
    }
    let replyId: string | null = null;
    if (reply) {
      if (reply.raw.length > MAX_REPLY_LENGTH)
        throw new OpError(`Replies are limited to ${MAX_REPLY_LENGTH} characters.`);
      const problems = validateRange(reply.selectedBlock, reply.raw.length);
      if (problems.length) throw new OpError(problems.join(' '));
      replyId = ctx.newId();
      await db.replies.add({ ...reply, id: replyId, requestId, pastedAt: ctx.now });
    }
    const parsedBlocks = new Map<string, { block: ParsedBlock; raw: string }>();
    const rowIdByAttempt = new Map(Object.entries(request.rows).map(([rowId, attemptId]) => [attemptId, rowId]));
    const changed: AttemptRecord[] = [];
    const gradingIds: Record<string, string> = {};
    for (const [i, row] of rows.entries()) {
      const current = currents[i];
      const provenance: Provenance = replyId
        ? { replyId, feedbackRange: row.feedbackRange }
        : row.replyId !== undefined
          ? { replyId: row.replyId, feedbackRange: row.feedbackRange }
          : current?.replyId
            ? { replyId: current.replyId, feedbackRange: row.feedbackRange ?? current.feedbackRange }
            : { replyId: null, feedbackRange: row.feedbackRange };
      if (row.source === 'parsed') {
        const saved = provenance.replyId ? await db.replies.get(provenance.replyId) : undefined;
        if (!saved || saved.requestId !== requestId || saved.parserVersion !== PARSER_VERSION) {
          throw new OpError('This parsed grade needs a reply read by the current parser. Read it again.');
        }
        let checked = parsedBlocks.get(saved.id);
        if (!checked) {
          if (saved.raw !== row.expectedReplyRaw) {
            throw new OpError('The stored reply changed since the preview. Read the scores again.');
          }
          const parserRows = await Promise.all(
            Object.entries(request.rows).map(async ([rowId, attemptId]) => {
              const owned = await db.attempts.get(attemptId);
              const snapshot = owned ? await db.snapshots.get(owned.snapshotHash) : undefined;
              if (!snapshot) throw new OpError('Snapshot missing.');
              return { rowId, max: snapshot.max, allowedTags: snapshot.allowedTags };
            }),
          );
          const parsed = parseReply(saved.raw, {
            id: request.id,
            rows: parserRows,
            promptVersion: request.promptVersion,
          });
          const candidates = parsed.kind === 'parsed' ? [parsed.block] : parsed.kind === 'choose' ? parsed.options : [];
          const block = candidates.find((candidate) => sameRange(candidate.range, saved.selectedBlock));
          if (!block || block.outcome !== saved.parseOutcome) {
            throw new OpError('The stored reply no longer matches the selected score block. Read it again.');
          }
          checked = { block, raw: saved.raw };
          parsedBlocks.set(saved.id, checked);
        } else if (row.expectedReplyRaw !== checked.raw) {
          throw new OpError('The parsed rows came from different previews of the same reply. Read the scores again.');
        }
        const parsedRow = checked.block.rows.find((candidate) => candidate.rowId === rowIdByAttempt.get(row.attemptId));
        if (
          parsedRow?.status !== 'valid' ||
          parsedRow.score !== row.score ||
          !sameRange(parsedRow.feedback, provenance.feedbackRange) ||
          JSON.stringify(parsedRow.tags) !== JSON.stringify(row.tags)
        ) {
          throw new OpError('The score or feedback differs from the stored reply. Read it again.');
        }
      }
      const next = await applyGrade(db, ctx, opId, attempts[i]!, row, provenance, true);
      changed.push(next);
      gradingIds[next.id] = next.currentGradingId!;
    }
    await refreshRequestStatus(db, requestId);
    const result: ConfirmResult = { requestId, replyId, gradingIds };
    await writeReceipt(db, ctx, opId, 'confirmRows', changed, result);
    return result;
  });
}

/** Can this attempt's grade be corrected or undone? Only if its review is the card's latest. */
export async function canChangeGrade(db: PremiseDb, attemptId: string): Promise<boolean> {
  return db.transaction('r', [db.attempts, db.reviewLogs], async () => {
    const a = await db.attempts.get(attemptId);
    if (!a || a.state === 'discarded') return false;
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
    if (!schedulerConfig(log.schedulerVersion))
      throw new OpError('This review used a scheduler this app does not know.');
    await undoReview(db, log);
  }
}

/**
 * Replaces an accepted grading with a new accepted revision (§6.3). The replacement needs a
 * valid score; discarded rows and rows without an accepted grade are refused. The new revision
 * keeps the corrected grading's reply and feedback range (its source labels who set the score).
 * Correction never touches taskStates.
 */
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
    if (attempt!.state === 'discarded') throw new OpError('A discarded answer cannot be graded.');
    const current = await currentGrading(db, attempt!);
    if (current?.status !== 'accepted') throw new OpError('Only an accepted grade can be corrected.');
    if (row.score === null) throw new OpError('A correction needs a score.');
    if (row.source === 'parsed') throw new OpError('Correct a grade manually or by self-grading.');
    if (row.replyId !== undefined && row.replyId !== current.replyId) {
      throw new OpError('A correction keeps the reply of the grade it corrects.');
    }
    if (row.feedbackRange !== null && !sameRange(row.feedbackRange, current.feedbackRange)) {
      throw new OpError('A correction keeps the feedback of the grade it corrects.');
    }
    await unwindForChange(db, attempt!);
    const provenance = { replyId: current.replyId, feedbackRange: current.feedbackRange };
    const next = await applyGrade(db, ctx, opId, attempt!, row, provenance, false);
    await refreshRequestStatus(db, attempt!.requestId!);
    const result = { attemptId: next.id, revision: next.revision };
    await writeReceipt(db, ctx, opId, 'correctGrade', [next], result);
    return result;
  });
}

function sameRange(a: Range | null, b: Range | null): boolean {
  return a === b || (a !== null && b !== null && a.start === b.start && a.end === b.end);
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
    if (attempt!.state === 'discarded') throw new OpError('A discarded answer has no grade to undo.');
    if (!attempt!.currentGradingId) throw new OpError('There is no grade to undo.');
    await unwindForChange(db, attempt!);
    await db.gradings.update(attempt!.currentGradingId, { status: 'superseded' });
    const next = {
      ...attempt!,
      currentGradingId: null,
      revision: nextCounter(attempt!.revision, 'Attempt revision'),
      updatedAt: ctx.now,
    };
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
    const request = await db.requests.get(requestId);
    if (!request) throw new OpError('Grading request not found.');
    checkRowSet(
      request,
      rows.map((r) => r.attemptId),
    );
    const attempts = await loadFresh(db, rows);
    const changed: AttemptRecord[] = [];
    for (const a of attempts) {
      if (a.requestId !== requestId) throw new OpError('An answer does not belong to this request.');
      const state = rowState(a, await currentGrading(db, a));
      if (state !== 'pending' && state !== 'needs-review')
        throw new StaleError([a.id], `This answer is already ${state}.`);
      const next = {
        ...a,
        state: 'discarded' as const,
        revision: nextCounter(a.revision, 'Attempt revision'),
        updatedAt: ctx.now,
      };
      await db.attempts.put(next);
      changed.push(next);
    }
    await refreshRequestStatus(db, requestId);
    const result = { discarded: changed.map((a) => a.id) };
    await writeReceipt(db, ctx, opId, 'discardRows', changed, result);
    return result;
  });
}

/**
 * Discards every waiting row of a request and marks it abandoned. `revisions` maps every row's
 * attempt id to the revision the student was shown; if any differs (or a row is missing) the
 * operation throws StaleError and writes nothing.
 */
export async function abandonRequest(
  db: PremiseDb,
  ctx: OpContext,
  opId: string,
  requestId: string,
  revisions: Record<string, number>,
): Promise<{ discarded: string[] }> {
  return db.transaction('rw', GRADING_TABLES(db), async () => {
    const done = await receipt<{ discarded: string[] }>(db, opId);
    if (done) return done;
    const request = await db.requests.get(requestId);
    if (!request) throw new OpError('Grading request not found.');
    checkRowSet(request, Object.keys(revisions));
    const ids = Object.values(request.rows);
    const attempts = await loadFresh(
      db,
      ids.map((attemptId) => ({ attemptId, revision: revisions[attemptId] ?? -1 })),
    );
    const changed: AttemptRecord[] = [];
    for (const a of attempts) {
      const state = rowState(a, await currentGrading(db, a));
      if (state !== 'pending' && state !== 'needs-review') continue;
      const next = {
        ...a,
        state: 'discarded' as const,
        revision: nextCounter(a.revision, 'Attempt revision'),
        updatedAt: ctx.now,
      };
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
    if (attempt!.state === 'discarded') throw new OpError('A discarded answer cannot be tagged.');
    const current = await currentGrading(db, attempt!);
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
    const next = {
      ...attempt!,
      currentGradingId: grading.id,
      revision: nextCounter(attempt!.revision, 'Attempt revision'),
      updatedAt: ctx.now,
    };
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
