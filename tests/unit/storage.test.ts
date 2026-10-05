// Storage operations (ARCHITECTURE.md §6.2): repeated opIds, stale revisions, crash before
// acknowledgement, review order, correction and undo, eligibility, and import validation for each
// §5.1 invariant and the §7 rules.

import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { loadExercises } from '../../scripts/content.ts';
import { checkDataSet } from '../../src/domain/integrity.ts';
import type { AttemptRecord, CardRecord, DataSet, SessionRecord } from '../../src/domain/records.ts';
import { Rating, review } from '../../src/domain/scheduler.ts';
import { CURRENT_SCHEDULER } from '../../src/domain/schedulerConfig.ts';
import { parseReply, PARSER_VERSION } from '../../src/domain/scoreParser.ts';
import { buildSnapshot } from '../../src/domain/snapshot.ts';
import type { Snapshot } from '../../src/domain/types.ts';
import {
  checkImport,
  checkImportFile,
  exportData,
  IMPORT_TOO_LARGE,
  MAX_IMPORT_BYTES,
  replaceAll,
  type ExportFile,
} from '../../src/storage/backup.ts';
import { openDb, TABLES, type PremiseDb } from '../../src/storage/db.ts';
import {
  abandonRequest,
  addFlag,
  AlreadySubmittedError,
  canChangeGrade,
  confirmRows,
  correctGrade,
  discardRows,
  endSession,
  faults,
  OpError,
  openEntry,
  prepareGrading,
  saveDraft,
  saveReply,
  setTags,
  setTaskControls,
  skipAttempt,
  StaleError,
  startSession,
  submitAttempt,
  undoLatest,
  type GradeRow,
  type DraftPrecondition,
  type OpContext,
} from '../../src/storage/ops.ts';

let db: PremiseDb;
let n = 0;
let now = '2026-10-05T15:00:00.000Z';
/** 'asc' ids sort in creation order; 'desc' ids sort in reverse, to prove nothing orders by id. */
let ids: 'asc' | 'desc' = 'asc';
const ctx = (): OpContext => ({
  now,
  newId: () => {
    n++;
    const ordinal = ids === 'asc' ? n : 9999 - n;
    return `00000000-0000-4000-8000-${String(ordinal).padStart(12, '0')}`;
  },
  random: () => ((n * 7919) % 1000) / 1000,
});
const snaps = new Map<string, Snapshot>();

beforeEach(async () => {
  db = openDb(`test-${Math.random()}`);
  n = 0;
  now = '2026-10-05T15:00:00.000Z';
  ids = 'asc';
  faults.beforeReceipt = null;
  if (snaps.size === 0) {
    for (const e of await loadExercises())
      for (const t of e.tasks) {
        const s = await buildSnapshot(e, t);
        snaps.set(s.taskId, s);
      }
  }
});

async function open(sessionId: string, index: number, taskId: string): Promise<AttemptRecord> {
  const r = await openEntry(db, ctx(), sessionId, index, snaps.get(taskId)!);
  if (r.status !== 'opened') throw new Error(`expected to open ${taskId}, got ${r.status}`);
  return r.attempt;
}

async function expectedDraft(
  attempt: AttemptRecord,
  entryIndex = 0,
  revision = attempt.revision,
  answer = attempt.answer,
): Promise<DraftPrecondition> {
  const session = await db.sessions.get(attempt.sessionId);
  if (!session) throw new Error(`Session ${attempt.sessionId} missing in test setup`);
  return { session, entryIndex, attempt: { ...attempt, revision, answer } };
}

async function answer(taskIds: string[], answers: string[] = taskIds.map((_, i) => `answer ${i}`)) {
  const session = await startSession(db, ctx(), 'today', taskIds);
  const attemptIds: string[] = [];
  for (const [i, t] of taskIds.entries()) {
    const a = await open(session.id, i, t);
    await submitAttempt(db, ctx(), await expectedDraft(a, i), answers[i]!, 30);
    attemptIds.push(a.id);
  }
  await endSession(db, ctx(), session.id);
  return { sessionId: session.id, attemptIds };
}

let prepCount = 0;
async function prepared(taskIds: string[]) {
  const { attemptIds } = await answer(taskIds);
  const { requestIds } = await prepareGrading(db, ctx(), `prep-${++prepCount}`, attemptIds, 4);
  return { attemptIds, requestId: requestIds[0]! };
}

async function row(attemptId: string, score: number | null, extra: Partial<GradeRow> = {}): Promise<GradeRow> {
  const a = (await db.attempts.get(attemptId))!;
  return {
    attemptId,
    revision: a.revision,
    score,
    tags: [],
    source: 'manual',
    disqualified: false,
    feedbackRange: null,
    ratingChoice: 'good',
    ...extra,
  };
}

/** A real parsed row and its immutable saved reply for provenance-sensitive tests. */
async function parsedGradeRow(
  requestId: string,
  attemptId: string,
  score: number | null,
  saveOpId: string,
): Promise<GradeRow> {
  const request = (await db.requests.get(requestId))!;
  const rowId = Object.entries(request.rows).find(([, id]) => id === attemptId)?.[0];
  if (!rowId) throw new Error('Attempt is not in the request');
  const parserRows = await Promise.all(
    Object.entries(request.rows).map(async ([id, ownedAttemptId]) => {
      const owned = (await db.attempts.get(ownedAttemptId))!;
      const snapshot = (await db.snapshots.get(owned.snapshotHash))!;
      return { rowId: id, max: snapshot.max, allowedTags: snapshot.allowedTags };
    }),
  );
  const max = parserRows.find((r) => r.rowId === rowId)!.max;
  const token = score === null ? '?' : String(score);
  const raw = `BEGIN FEEDBACK request=${requestId}\n${rowId}: ${token}/${max}\n- Tip: Check the reasoning.\nEND FEEDBACK\nBEGIN SCORES v2 request=${requestId}\n${rowId} | ${token}/${max} | -\nEND SCORES`;
  const parsed = parseReply(raw, { id: requestId, promptVersion: request.promptVersion, rows: parserRows });
  if (parsed.kind !== 'parsed') throw new Error('Expected a parsed reply');
  const result = parsed.block.rows.find((r) => r.rowId === rowId);
  if (result?.status !== 'valid') throw new Error('Expected a valid parsed row');
  const { replyId } = await saveReply(db, ctx(), saveOpId, requestId, {
    raw,
    parserVersion: PARSER_VERSION,
    selectedBlock: parsed.block.range,
    parseOutcome: parsed.block.outcome,
  });
  return row(attemptId, score, { source: 'parsed', replyId, feedbackRange: result.feedback });
}

async function rev(attemptId: string): Promise<number> {
  return (await db.attempts.get(attemptId))!.revision;
}

async function dump(of: PremiseDb = db): Promise<DataSet> {
  return Object.fromEntries(await Promise.all(TABLES.map(async (t) => [t, await of.table(t).toArray()]))) as DataSet;
}

async function expectConsistent() {
  expect(checkDataSet(await dump())).toEqual([]);
}

/** The operation must fail and leave every table, receipts included, exactly as it was. */
async function expectUnchanged(op: () => Promise<unknown>, error: unknown): Promise<void> {
  const before = await dump();
  await expect(op()).rejects.toBeInstanceOf(error);
  expect(await dump()).toEqual(before);
}

/** One graded review of `taskId`: answered at `answeredAt`, confirmed at `confirmedAt`. */
async function reviewOnce(taskId: string, answeredAt: string, confirmedAt: string, score: number) {
  now = answeredAt;
  const { attemptIds, requestId } = await prepared([taskId]);
  now = confirmedAt;
  await confirmRows(db, ctx(), `c-${attemptIds[0]}`, requestId, [await row(attemptIds[0]!, score)], null);
  return attemptIds[0]!;
}

describe('prepareGrading', () => {
  it('creates one request, is idempotent by opId and reuses requests for owned attempts', async () => {
    const { attemptIds } = await answer(['arg-0001.conclusion', 'arg-0001.flaw']);
    const first = await prepareGrading(db, ctx(), 'op-a', attemptIds, 4);
    const again = await prepareGrading(db, ctx(), 'op-a', attemptIds, 4);
    const other = await prepareGrading(db, ctx(), 'op-b', attemptIds, 4);
    expect(again).toEqual(first);
    expect(other.requestIds).toEqual(first.requestIds);
    expect(await db.requests.count()).toBe(1);
    const req = (await db.requests.get(first.requestIds[0]!))!;
    expect(Object.values(req.rows)).toEqual(attemptIds);
    expect(req.promptText).toContain(`request=${req.id}`);
    await expectConsistent();
  });

  it('splits by batch size in session order', async () => {
    const tasks = ['arg-0001.flaw', 'arg-0002.assumption', 'arg-0003.flaw', 'arg-0005.flaw', 'arg-0006.flaw'];
    const { attemptIds } = await answer(tasks.filter((t) => snaps.has(t)));
    const { requestIds } = await prepareGrading(db, ctx(), 'op', attemptIds, 2);
    expect(requestIds.length).toBe(Math.ceil(attemptIds.length / 2));
    await expectConsistent();
  });

  it('refuses a repeated attempt without writing', async () => {
    const { attemptIds } = await answer(['arg-0001.flaw']);
    await expectUnchanged(() => prepareGrading(db, ctx(), 'op', [attemptIds[0]!, attemptIds[0]!], 4), OpError);
  });
});

describe('confirmRows', () => {
  it('schedules accepted rows once, even when the same opId is repeated', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.conclusion', 'arg-0001.flaw']);
    const rows = [await row(attemptIds[0]!, 1), await row(attemptIds[1]!, 1)];
    const first = await confirmRows(db, ctx(), 'confirm-1', requestId, rows, null);
    const again = await confirmRows(db, ctx(), 'confirm-1', requestId, rows, null);
    expect(again).toEqual(first);
    expect(await db.reviewLogs.count()).toBe(2);
    expect(await db.cards.count()).toBe(2);
    expect((await db.requests.get(requestId))!.status).toBe('closed');
    await expectConsistent();
  });

  it('refuses a stale revision (a second confirm with a new opId) without writing', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.flaw']);
    const rows = [await row(attemptIds[0]!, 2)];
    await confirmRows(db, ctx(), 'c1', requestId, rows, null);
    await expectUnchanged(() => confirmRows(db, ctx(), 'c2', requestId, rows, null), StaleError);
  });

  it('refuses duplicate rows and rows of another request, leaving every table unchanged', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.flaw']);
    const other = await prepared(['arg-0002.assumption']);
    const r = await row(attemptIds[0]!, 2);
    const reply = { raw: 'reply', parserVersion: 1, selectedBlock: null, parseOutcome: 'clean' as const };
    await expectUnchanged(() => confirmRows(db, ctx(), 'dup', requestId, [r, r], reply), OpError);
    await expectUnchanged(
      () => confirmRows(db, ctx(), 'foreign', requestId, [r, { ...r, attemptId: other.attemptIds[0]! }], null),
      OpError,
    );
    expect(await db.reviewLogs.count()).toBe(0);
  });

  it('writes nothing when it fails before the receipt, and a retry with the same opId then succeeds once', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.flaw']);
    const rows = [await row(attemptIds[0]!, 0)];
    faults.beforeReceipt = () => {
      throw new Error('simulated crash');
    };
    await expectUnchanged(() => confirmRows(db, ctx(), 'c1', requestId, rows, null), Error);
    faults.beforeReceipt = null;
    await confirmRows(db, ctx(), 'c1', requestId, rows, null);
    await confirmRows(db, ctx(), 'c1', requestId, rows, null);
    expect(await db.reviewLogs.count()).toBe(1);
    await expectConsistent();
  });

  it('keeps needs-review rows open, then resolves them with a manual score', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.flaw']);
    await confirmRows(
      db,
      ctx(),
      'c1',
      requestId,
      [await parsedGradeRow(requestId, attemptIds[0]!, null, 'saved-needs-review')],
      null,
    );
    expect((await db.requests.get(requestId))!.status).toBe('open');
    expect(await db.reviewLogs.count()).toBe(0);
    await confirmRows(db, ctx(), 'c2', requestId, [await row(attemptIds[0]!, 2, { source: 'manual' })], null);
    expect((await db.requests.get(requestId))!.status).toBe('closed');
    expect((await db.gradings.toArray()).filter((g) => g.status === 'superseded')).toHaveLength(1);
    await expectConsistent();
  });

  it('rejects invalid grades through the shared validator', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.flaw']);
    await expect(confirmRows(db, ctx(), 'c1', requestId, [await row(attemptIds[0]!, 3)], null)).rejects.toThrow(
      /whole number/,
    );
    await expect(
      confirmRows(db, ctx(), 'c2', requestId, [await row(attemptIds[0]!, 1, { tags: ['made-up'] })], null),
    ).rejects.toThrow(/not allowed/);
    await expect(
      confirmRows(
        db,
        ctx(),
        'c3',
        requestId,
        [await row(attemptIds[0]!, 1, { source: 'self', disqualified: true })],
        null,
      ),
    ).rejects.toThrow(/disqualified/);
    await expect(
      confirmRows(
        db,
        ctx(),
        'c4',
        requestId,
        [await row(attemptIds[0]!, 1, { feedbackRange: { start: 0, end: 1 } })],
        null,
      ),
    ).rejects.toThrow(/needs the reply/);
    expect(await db.gradings.count()).toBe(0);
  });

  it('sets notBefore to the next local day and keeps coached attempts out of scheduling', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.flaw']);
    await confirmRows(db, ctx(), 'c1', requestId, [await row(attemptIds[0]!, 0)], null);
    const state = (await db.taskStates.get('arg-0001.flaw'))!;
    expect(state.notBefore! > '2026-10-05').toBe(true);

    const retry = await startSession(db, ctx(), 'retry', ['arg-0001.flaw']);
    const coached = await open(retry.id, 0, 'arg-0001.flaw');
    expect(coached.kind).toBe('coached');
    await submitAttempt(db, ctx(), await expectedDraft(coached), 'better', null);
    const { requestIds } = await prepareGrading(db, ctx(), 'p2', [coached.id], 4);
    await confirmRows(db, ctx(), 'c2', requestIds[0]!, [await row(coached.id, 2)], null);
    expect(await db.reviewLogs.count()).toBe(1);
    await expectConsistent();
  });
});

describe('drafts and submission', () => {
  it('saveDraft checks and increments the revision; a stale editor writes nothing', async () => {
    const s = await startSession(db, ctx(), 'today', ['arg-0001.flaw']);
    const a = await open(s.id, 0, 'arg-0001.flaw');
    const first = await saveDraft(db, ctx(), await expectedDraft(a), 'tab one');
    expect(first.revision).toBe(a.revision + 1);
    await expectUnchanged(async () => saveDraft(db, ctx(), await expectedDraft(a), 'tab two'), StaleError);
    await expectUnchanged(async () => submitAttempt(db, ctx(), await expectedDraft(a), 'tab two', 1), StaleError);
    expect((await db.attempts.get(a.id))!.answer).toBe('tab one');
    await submitAttempt(db, ctx(), await expectedDraft(a, 0, first.revision, 'tab one'), 'tab one', 1);
    await expectUnchanged(
      async () => saveDraft(db, ctx(), await expectedDraft(a, 0, first.revision + 1), 'late'),
      StaleError,
    );
  });

  it('a retried submission with the same text succeeds; different text is a distinct conflict', async () => {
    const s = await startSession(db, ctx(), 'today', ['arg-0001.flaw']);
    const a = await open(s.id, 0, 'arg-0001.flaw');
    const submitted = await submitAttempt(db, ctx(), await expectedDraft(a), 'mine', 10);
    await endSession(db, ctx(), s.id);
    const before = await dump();
    expect(await submitAttempt(db, ctx(), await expectedDraft(a), 'mine', 99)).toEqual(submitted);
    expect(await dump()).toEqual(before);
    const conflict = submitAttempt(db, ctx(), await expectedDraft(a), 'theirs', 10);
    await expect(conflict).rejects.toBeInstanceOf(AlreadySubmittedError);
    await expect(conflict).rejects.toMatchObject({ attempt: { answer: 'mine' } });
    expect(await dump()).toEqual(before);
  });

  it('a stale tab cannot skip a newer saved draft', async () => {
    const s = await startSession(db, ctx(), 'today', ['arg-0001.flaw']);
    const a = await open(s.id, 0, 'arg-0001.flaw');
    await saveDraft(db, ctx(), await expectedDraft(a), 'newer work');
    await expectUnchanged(async () => skipAttempt(db, ctx(), await expectedDraft(a)), StaleError);
    expect(await db.attempts.get(a.id)).toMatchObject({ answer: 'newer work', state: 'draft' });
    await skipAttempt(db, ctx(), await expectedDraft(a, 0, await rev(a.id), 'newer work'));
    expect(await db.attempts.get(a.id)).toMatchObject({ answer: 'newer work', state: 'skipped' });
  });

  it('refuses save, submit and skip when a replacement has the same revision but different text', async () => {
    const session = await startSession(db, ctx(), 'today', ['arg-0001.flaw']);
    const attempt = await open(session.id, 0, 'arg-0001.flaw');
    const expected = await expectedDraft(attempt);
    await db.attempts.update(attempt.id, { answer: 'answer from replacement backup' });

    await expectUnchanged(() => saveDraft(db, ctx(), expected, 'stale local edit'), StaleError);
    await expectUnchanged(() => submitAttempt(db, ctx(), expected, 'stale local edit', 5), StaleError);
    await expectUnchanged(() => skipAttempt(db, ctx(), expected), StaleError);
  });

  it.each([
    ['session removed', async (s: SessionRecord) => db.sessions.delete(s.id)],
    [
      'session entry repointed',
      async (s: SessionRecord) => db.sessions.update(s.id, { entries: [{ taskId: 'arg-0001.flaw', attemptId: null }] }),
    ],
    [
      'session creation changed',
      async (s: SessionRecord) => db.sessions.update(s.id, { createdAt: '2026-10-06T15:00:00.000Z' }),
    ],
    ['session mode changed', async (s: SessionRecord) => db.sessions.update(s.id, { mode: 'library' })],
  ] as const)('refuses all draft mutations when the %s', async (_label, replace) => {
    const session = await startSession(db, ctx(), 'today', ['arg-0001.flaw']);
    const attempt = await open(session.id, 0, 'arg-0001.flaw');
    const expected = await expectedDraft(attempt);
    await replace(session);

    await expectUnchanged(() => saveDraft(db, ctx(), expected, 'stale local edit'), StaleError);
    await expectUnchanged(() => submitAttempt(db, ctx(), expected, 'stale local edit', 5), StaleError);
    await expectUnchanged(() => skipAttempt(db, ctx(), expected), StaleError);
  });

  it.each([
    ['sessionId', { sessionId: 'other-session' }],
    ['taskId', { taskId: 'arg-0001.conclusion' }],
    ['snapshotHash', { snapshotHash: '0'.repeat(64) }],
    ['kind', { kind: 'review' as const }],
    ['startedAt', { startedAt: '2026-10-06T15:00:00.000Z' }],
    ['stimulusSeenBefore', { stimulusSeenBefore: true }],
    ['ratingChoice', { ratingChoice: 'hard' as const }],
  ] as const)(
    'refuses all draft mutations when replacement changes %s at the same revision',
    async (_field, change) => {
      const session = await startSession(db, ctx(), 'today', ['arg-0001.flaw']);
      const attempt = await open(session.id, 0, 'arg-0001.flaw');
      const expected = await expectedDraft(attempt);
      await db.attempts.update(attempt.id, change);

      await expectUnchanged(() => saveDraft(db, ctx(), expected, 'stale local edit'), StaleError);
      await expectUnchanged(() => submitAttempt(db, ctx(), expected, 'stale local edit', 5), StaleError);
      await expectUnchanged(() => skipAttempt(db, ctx(), expected), StaleError);
    },
  );

  it('does not mistake a different submitted attempt for an idempotent retry', async () => {
    const session = await startSession(db, ctx(), 'today', ['arg-0001.flaw']);
    const attempt = await open(session.id, 0, 'arg-0001.flaw');
    const expected = await expectedDraft(attempt);
    await db.attempts.update(attempt.id, {
      state: 'submitted',
      answer: 'same text',
      startedAt: '2026-10-06T15:00:00.000Z',
    });
    await expectUnchanged(() => submitAttempt(db, ctx(), expected, 'same text', 5), StaleError);
  });

  it('refuses a revision increment that would round instead of advancing', async () => {
    const s = await startSession(db, ctx(), 'today', ['arg-0001.flaw']);
    const a = await open(s.id, 0, 'arg-0001.flaw');
    await db.attempts.update(a.id, { revision: Number.MAX_SAFE_INTEGER });
    await expectUnchanged(
      async () => saveDraft(db, ctx(), await expectedDraft(a, 0, Number.MAX_SAFE_INTEGER), 'overwritten'),
      OpError,
    );
  });

  it('keeps submitted fields frozen through every operation', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.flaw']);
    const id = attemptIds[0]!;
    const frozen = (a: AttemptRecord) => ({
      answer: a.answer,
      snapshotHash: a.snapshotHash,
      taskId: a.taskId,
      kind: a.kind,
      submittedAt: a.submittedAt,
      sessionId: a.sessionId,
      startedAt: a.startedAt,
      stimulusSeenBefore: a.stimulusSeenBefore,
      elapsedSeconds: a.elapsedSeconds,
    });
    const original = frozen((await db.attempts.get(id))!);
    now = '2026-10-06T15:00:00.000Z';
    const stored = (await db.attempts.get(id))!;
    await expect(saveDraft(db, ctx(), await expectedDraft(stored), 'edited')).rejects.toBeInstanceOf(StaleError);
    await expect(submitAttempt(db, ctx(), await expectedDraft(stored), 'edited', 1)).rejects.toBeInstanceOf(StaleError);
    await confirmRows(db, ctx(), 'c1', requestId, [await row(id, 1)], null);
    await setTags(db, ctx(), 't1', id, await rev(id), ['correlation-causation']);
    await correctGrade(db, ctx(), 'f1', await row(id, 2, { source: 'manual', tags: ['correlation-causation'] }));
    await undoLatest(db, ctx(), 'u1', id, await rev(id));
    await discardRows(db, ctx(), 'd1', requestId, [{ attemptId: id, revision: await rev(id) }]);
    await addFlag(db, ctx(), id, 'other', 'note');
    expect(frozen((await db.attempts.get(id))!)).toEqual(original);
    await expectConsistent();
  });
});

describe('opening work rechecks eligibility', () => {
  it('does not end a session that still holds a draft answer', async () => {
    const session = await startSession(db, ctx(), 'today', ['arg-0001.flaw']);
    const attempt = await open(session.id, 0, 'arg-0001.flaw');
    await saveDraft(db, ctx(), await expectedDraft(attempt), 'unfinished reasoning');
    await expectUnchanged(() => endSession(db, ctx(), session.id), OpError);
    expect((await db.sessions.get(session.id))?.endedAt).toBeNull();
  });

  it('lets New only reopen skipped work but refuses a task submitted since planning', async () => {
    const taskId = 'arg-0001.flaw';
    const first = await startSession(db, ctx(), 'new', [taskId]);
    const skipped = await open(first.id, 0, taskId);
    await skipAttempt(db, ctx(), await expectedDraft(skipped));
    await endSession(db, ctx(), first.id);

    const second = await startSession(db, ctx(), 'new', [taskId]);
    const resumed = await open(second.id, 0, taskId);
    expect(resumed.kind).toBe('new');
    await submitAttempt(db, ctx(), await expectedDraft(resumed), 'an answer', 5);

    const stale = await startSession(db, ctx(), 'new', [taskId]);
    const before = await dump();
    expect(await openEntry(db, ctx(), stale.id, 0, snaps.get(taskId)!)).toMatchObject({
      status: 'ineligible',
      reason: 'awaiting-grade',
    });
    expect(await dump()).toEqual(before);

    const prepared = await prepareGrading(db, ctx(), 'new-after-skip', [resumed.id], 4);
    await confirmRows(db, ctx(), 'grade-after-skip', prepared.requestIds[0]!, [await row(resumed.id, 2)], null);
    now = '2026-10-07T15:00:00.000Z';
    expect(await openEntry(db, ctx(), stale.id, 0, snaps.get(taskId)!)).toMatchObject({
      status: 'ineligible',
      reason: 'already-seen',
    });
  });

  it('refuses suspended, awaiting-grade and not-before tasks without writing, except coached retries', async () => {
    await setTaskControls(db, ctx(), 's1', 'arg-0002.assumption', { suspended: true });
    const s1 = await startSession(db, ctx(), 'today', ['arg-0002.assumption']);
    let before = await dump();
    expect(await openEntry(db, ctx(), s1.id, 0, snaps.get('arg-0002.assumption')!)).toMatchObject({
      status: 'ineligible',
      reason: 'suspended',
    });
    expect(await dump()).toEqual(before);

    const { attemptIds, requestId } = await prepared(['arg-0001.flaw']);
    const s2 = await startSession(db, ctx(), 'today', ['arg-0001.flaw']);
    before = await dump();
    expect(await openEntry(db, ctx(), s2.id, 0, snaps.get('arg-0001.flaw')!)).toMatchObject({
      status: 'ineligible',
      reason: 'awaiting-grade',
    });
    expect(await dump()).toEqual(before);

    await confirmRows(db, ctx(), 'c1', requestId, [await row(attemptIds[0]!, 0)], null);
    expect(await openEntry(db, ctx(), s2.id, 0, snaps.get('arg-0001.flaw')!)).toEqual({
      status: 'ineligible',
      reason: 'not-before',
      notBefore: '2026-10-06',
    });

    const retry = await startSession(db, ctx(), 'retry', ['arg-0001.flaw']);
    expect((await open(retry.id, 0, 'arg-0001.flaw')).kind).toBe('coached');

    now = '2026-10-06T08:00:00.000Z';
    expect((await open(s2.id, 0, 'arg-0001.flaw')).kind).toBe('review');
  });

  it('returns a competing draft instead of creating a second attempt, so its text is kept', async () => {
    const s1 = await startSession(db, ctx(), 'today', ['arg-0001.flaw']);
    const a = await open(s1.id, 0, 'arg-0001.flaw');
    await saveDraft(db, ctx(), await expectedDraft(a), 'half an answer');
    const s2 = await startSession(db, ctx(), 'library', ['arg-0001.flaw']);
    const before = await dump();
    const r = await openEntry(db, ctx(), s2.id, 0, snaps.get('arg-0001.flaw')!);
    expect(r.status).toBe('draft-elsewhere');
    expect(r.status === 'draft-elsewhere' && r.attempt).toMatchObject({ id: a.id, answer: 'half an answer' });
    expect(await dump()).toEqual(before);
    // Reopening the entry that owns the draft still works.
    expect((await open(s1.id, 0, 'arg-0001.flaw')).id).toBe(a.id);
  });

  it('refuses a stale automatic entry whose card is now due later, while Library can open it', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.flaw']);
    const stale = await startSession(db, ctx(), 'today', ['arg-0001.flaw']);
    await confirmRows(db, ctx(), 'c1', requestId, [await row(attemptIds[0]!, 2)], null);
    const due = (await db.cards.get('arg-0001.flaw'))!.due.slice(0, 10);
    now = '2026-10-06T15:00:00.000Z';
    expect(due > '2026-10-06').toBe(true);
    const before = await dump();
    expect(await openEntry(db, ctx(), stale.id, 0, snaps.get('arg-0001.flaw')!)).toMatchObject({
      status: 'ineligible',
      reason: 'not-due',
    });
    expect(await dump()).toEqual(before);
    const library = await startSession(db, ctx(), 'library', ['arg-0001.flaw']);
    expect((await open(library.id, 0, 'arg-0001.flaw')).kind).toBe('review');
  });
});

describe('review order', () => {
  async function twoReviews(confirmA: string, confirmB: string) {
    const a = await reviewOnce('arg-0001.flaw', '2026-10-05T15:00:00.000Z', confirmA, 2);
    const cardA = (await db.cards.get('arg-0001.flaw'))!;
    const b = await reviewOnce('arg-0001.flaw', '2026-11-01T15:00:00.000Z', confirmB, 2);
    return { a, b, cardA };
  }

  async function expectBLatest({ a, b, cardA }: Awaited<ReturnType<typeof twoReviews>>) {
    const logs = await db.reviewLogs.toArray();
    const logA = logs.find((l) => l.attemptId === a)!;
    const logB = logs.find((l) => l.attemptId === b)!;
    expect(logB.seq).toBeGreaterThan(logA.seq);
    expect(await canChangeGrade(db, a)).toBe(false);
    expect(await canChangeGrade(db, b)).toBe(true);
    await expectUnchanged(() => undoLatest(db, ctx(), 'ua', a, 0), StaleError);
    await expect(undoLatest(db, ctx(), 'ua', a, await rev(a))).rejects.toThrow(/locked/);
    await expect(correctGrade(db, ctx(), 'fa', await row(a, 0, { source: 'manual' }))).rejects.toThrow(/locked/);
    await undoLatest(db, ctx(), 'ub', b, await rev(b));
    expect(await db.cards.get('arg-0001.flaw')).toEqual(cardA);
    await expectConsistent();
  }

  it('uses the application sequence when timestamps are equal', async () => {
    await expectBLatest(await twoReviews('2026-10-25T15:00:00.000Z', '2026-10-25T15:00:00.000Z'));
  });

  it('refuses a review sequence increment beyond safe integer precision atomically', async () => {
    const first = await prepared(['arg-0001.flaw']);
    await confirmRows(db, ctx(), 'first-grade', first.requestId, [await row(first.attemptIds[0]!, 2)], null);
    const log = (await db.reviewLogs.toArray())[0]!;
    await db.reviewLogs.update(log.id, { seq: Number.MAX_SAFE_INTEGER });
    const second = await prepared(['arg-0002.assumption']);
    await expectUnchanged(
      async () => confirmRows(db, ctx(), 'second-grade', second.requestId, [await row(second.attemptIds[0]!, 2)], null),
      OpError,
    );
  });

  it('uses the application sequence when the clock moved backwards', async () => {
    await expectBLatest(await twoReviews('2026-10-25T15:00:00.000Z', '2026-10-10T15:00:00.000Z'));
  });

  it('does not depend on id order', async () => {
    ids = 'desc';
    const r = await twoReviews('2026-10-06T15:00:00.000Z', '2026-10-21T15:00:00.000Z');
    const logs = await db.reviewLogs.toArray();
    expect(logs.find((l) => l.attemptId === r.b)!.id < logs.find((l) => l.attemptId === r.a)!.id).toBe(true);
    await expectBLatest(r);
  });

  it('stores the submission time as reviewedAt when grades are confirmed out of order', async () => {
    now = '2026-10-01T15:00:00.000Z';
    const early = await prepared(['arg-0001.flaw']);
    const a = early.attemptIds[0]!;
    // Confirm, then undo, so that a later attempt can be answered and confirmed first.
    await confirmRows(db, ctx(), 'c1', early.requestId, [await row(a, 2)], null);
    now = '2026-10-05T15:00:00.000Z';
    const late = await prepared(['arg-0001.flaw']);
    const b = late.attemptIds[0]!;
    await confirmRows(db, ctx(), 'c2', late.requestId, [await row(b, 2)], null);
    await undoLatest(db, ctx(), 'u1', b, await rev(b));
    await undoLatest(db, ctx(), 'u2', a, await rev(a));
    await confirmRows(db, ctx(), 'c3', late.requestId, [await row(b, 2)], null);
    await confirmRows(db, ctx(), 'c4', early.requestId, [await row(a, 0)], null);

    const logA = (await db.reviewLogs.toArray()).find((l) => l.attemptId === a && !l.undone)!;
    expect(logA.reviewedAt).toBe('2026-10-01T15:00:00.000Z');
    expect(logA.reviewedAt).toBe((await db.attempts.get(a))!.submittedAt);
    // The scheduler ran at the card's last review, recorded as the effective time.
    expect(logA.cardBefore!.last_review).toBe('2026-10-05T15:00:00.000Z');
    expect(logA.cardAfter.last_review).toBe('2026-10-05T15:00:00.000Z');
    expect(logA.cardAfter).toEqual(review(CURRENT_SCHEDULER, logA.cardBefore, Rating.Again, logA.reviewedAt).after);
    await expectConsistent();
  });
});

describe('correction and undo', () => {
  it('correctGrade replaces the review; repeated corrections stack; a repeated opId is a no-op', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.flaw']);
    const id = attemptIds[0]!;
    await confirmRows(db, ctx(), 'c1', requestId, [await row(id, 0)], null);
    const lapsedCard = (await db.cards.get('arg-0001.flaw'))!;
    await correctGrade(db, ctx(), 'fix-1', await row(id, 2, { source: 'manual' }));
    await correctGrade(db, ctx(), 'fix-1', await row(id, 2, { source: 'manual' }));
    const logs = await db.reviewLogs.toArray();
    expect(logs.filter((l) => !l.undone)).toHaveLength(1);
    expect((await db.cards.get('arg-0001.flaw'))!.lapses).toBe(0);
    expect(lapsedCard.reps).toBe(1);
    await correctGrade(db, ctx(), 'fix-2', await row(id, 1, { source: 'manual' }));
    expect((await db.reviewLogs.toArray()).filter((l) => !l.undone)).toHaveLength(1);
    expect(await db.gradings.count()).toBe(3);
    await expectConsistent();
  });

  it('restores whole cards exactly through multiple reviews, undo and correction', async () => {
    const task = 'arg-0001.flaw';
    await reviewOnce(task, '2026-10-05T15:00:00.000Z', '2026-10-05T16:00:00.000Z', 2);
    const card1 = (await db.cards.get(task))!;
    const second = await reviewOnce(task, '2026-10-09T15:00:00.000Z', '2026-10-09T16:00:00.000Z', 2);
    const card2 = (await db.cards.get(task))!;
    const thirdDay = card2.due.slice(0, 10);
    const third = await reviewOnce(task, `${thirdDay}T15:00:00.000Z`, `${thirdDay}T16:00:00.000Z`, 0);

    await undoLatest(db, ctx(), 'u3', third, await rev(third));
    expect(await db.cards.get(task)).toEqual(card2);

    await correctGrade(db, ctx(), 'f2', await row(second, 1, { source: 'manual' }));
    const { schedulerVersion: _v, taskId: _t, ...fields1 } = card1;
    const submitted2 = (await db.attempts.get(second))!.submittedAt!;
    const expected: CardRecord = {
      ...review(CURRENT_SCHEDULER, fields1, Rating.Again, submitted2).after,
      taskId: task,
      schedulerVersion: CURRENT_SCHEDULER,
    };
    expect(await db.cards.get(task)).toEqual(expected);

    await undoLatest(db, ctx(), 'u2', second, await rev(second));
    expect(await db.cards.get(task)).toEqual(card1);
    await expectConsistent();
  });

  it('refuses to correct discarded rows, rows without an accepted grade, and null scores', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.conclusion', 'arg-0001.flaw']);
    const [x, y] = attemptIds as [string, string];
    await expectUnchanged(async () => correctGrade(db, ctx(), 'f1', await row(x, 1, { source: 'manual' })), OpError);
    await confirmRows(db, ctx(), 'c1', requestId, [await parsedGradeRow(requestId, x, null, 'saved-unknown')], null);
    await discardRows(db, ctx(), 'd1', requestId, [{ attemptId: x, revision: await rev(x) }]);
    await expectUnchanged(async () => correctGrade(db, ctx(), 'f2', await row(x, 1, { source: 'manual' })), OpError);
    await expectUnchanged(async () => undoLatest(db, ctx(), 'u2', x, await rev(x)), OpError);
    await confirmRows(db, ctx(), 'c2', requestId, [await row(y, 2)], null);
    await expectUnchanged(async () => correctGrade(db, ctx(), 'f3', await row(y, null)), OpError);
    await expectConsistent();
  });

  it('correction leaves the whole task-state record untouched', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.flaw']);
    const id = attemptIds[0]!;
    await confirmRows(db, ctx(), 'c1', requestId, [await row(id, 0)], null);
    await setTaskControls(db, ctx(), 's1', 'arg-0001.flaw', { suspended: true });
    const state = await db.taskStates.get('arg-0001.flaw');
    now = '2026-10-12T15:00:00.000Z';
    await correctGrade(db, ctx(), 'f1', await row(id, 2, { source: 'manual' }));
    await undoLatest(db, ctx(), 'u1', id, await rev(id));
    expect(await db.taskStates.toArray()).toEqual([state]);
  });

  it('undo, then a stale confirm and a stale undo are refused', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.flaw']);
    const id = attemptIds[0]!;
    const before = await row(id, 2);
    await confirmRows(db, ctx(), 'c1', requestId, [before], null);
    const readForUndo = await rev(id);
    await undoLatest(db, ctx(), 'u1', id, readForUndo);
    await undoLatest(db, ctx(), 'u1', id, readForUndo); // same opId: no-op
    await expectUnchanged(() => undoLatest(db, ctx(), 'u2', id, readForUndo), StaleError);
    expect(await db.cards.count()).toBe(0);
    expect((await db.requests.get(requestId))!.status).toBe('open');
    await expectUnchanged(() => confirmRows(db, ctx(), 'c2', requestId, [before], null), StaleError);
    await expectConsistent();
  });

  it('locks older grades once the task was reviewed again', async () => {
    const first = await prepared(['arg-0001.flaw']);
    await confirmRows(db, ctx(), 'c1', first.requestId, [await row(first.attemptIds[0]!, 0)], null);
    now = '2026-10-07T15:00:00.000Z';
    const second = await answer(['arg-0001.flaw']);
    const { requestIds } = await prepareGrading(db, ctx(), 'p2', second.attemptIds, 4);
    await confirmRows(db, ctx(), 'c2', requestIds[0]!, [await row(second.attemptIds[0]!, 2)], null);
    await expect(correctGrade(db, ctx(), 'fix', await row(first.attemptIds[0]!, 2))).rejects.toThrow(/locked/);
    await expect(undoLatest(db, ctx(), 'u', first.attemptIds[0]!, await rev(first.attemptIds[0]!))).rejects.toThrow(
      /locked/,
    );
  });

  it('first review, suspend, undo, discard: suspension and next-day restriction survive', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.flaw']);
    const id = attemptIds[0]!;
    await confirmRows(db, ctx(), 'c1', requestId, [await row(id, 2)], null);
    const notBefore = (await db.taskStates.get('arg-0001.flaw'))!.notBefore;
    await setTaskControls(db, ctx(), 's1', 'arg-0001.flaw', { suspended: true });
    await undoLatest(db, ctx(), 'u1', id, await rev(id));
    await discardRows(db, ctx(), 'd1', requestId, [{ attemptId: id, revision: await rev(id) }]);
    expect(await db.taskStates.get('arg-0001.flaw')).toEqual({ taskId: 'arg-0001.flaw', suspended: true, notBefore });
    expect(await db.cards.count()).toBe(0);
    expect((await db.attempts.get(id))!.state).toBe('discarded');
    expect((await db.requests.get(requestId))!.status).toBe('closed');
    await expectConsistent();
  });
});

describe('replies and provenance', () => {
  const reply = {
    raw: 'I01: 2/2\nGood point about the shift.',
    parserVersion: 1,
    selectedBlock: null,
    parseOutcome: 'manual' as const,
  };

  it('keeps an unparseable reply and links manual and self grades to it', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.conclusion', 'arg-0001.flaw']);
    const [x, y] = attemptIds as [string, string];
    const { replyId } = await saveReply(db, ctx(), 's1', requestId, reply);
    expect(await saveReply(db, ctx(), 's1', requestId, reply)).toEqual({ replyId });
    expect(await db.replies.count()).toBe(1);
    await confirmRows(
      db,
      ctx(),
      'c1',
      requestId,
      [
        await row(x, 1, { source: 'manual', replyId, feedbackRange: { start: 9, end: 36 } }),
        await row(y, 2, { source: 'self', replyId }),
      ],
      null,
    );
    const gradings = await db.gradings.toArray();
    expect(gradings.map((g) => g.replyId)).toEqual([replyId, replyId]);
    await expectConsistent();
  });

  it('refuses a reply of another request and a range outside the reply', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.flaw']);
    const other = await prepared(['arg-0002.assumption']);
    const { replyId } = await saveReply(db, ctx(), 's1', other.requestId, reply);
    const x = attemptIds[0]!;
    await expectUnchanged(
      async () => confirmRows(db, ctx(), 'c1', requestId, [await row(x, 1, { source: 'manual', replyId })], null),
      OpError,
    );
    const own = await saveReply(db, ctx(), 's2', requestId, reply);
    await expectUnchanged(
      async () =>
        confirmRows(
          db,
          ctx(),
          'c2',
          requestId,
          [await row(x, 1, { source: 'manual', replyId: own.replyId, feedbackRange: { start: 5, end: 999 } })],
          null,
        ),
      OpError,
    );
  });

  it('refuses replies longer than the parser limit in both save paths', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.flaw']);
    const oversized = {
      raw: 'x'.repeat(200_001),
      parserVersion: 2,
      selectedBlock: null,
      parseOutcome: 'manual' as const,
    };
    await expectUnchanged(() => saveReply(db, ctx(), 'too-long', requestId, oversized), OpError);
    await expectUnchanged(
      async () => confirmRows(db, ctx(), 'too-long-confirm', requestId, [await row(attemptIds[0]!, 1)], oversized),
      OpError,
    );
  });

  it('rejects a preview bound to an older answer even when an import reused its revision', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.flaw']);
    const id = attemptIds[0]!;
    const a = (await db.attempts.get(id))!;
    const shown = await row(id, 1, { expectedAnswer: a.answer, expectedSnapshotHash: a.snapshotHash });
    await db.attempts.update(id, { answer: 'replacement backup answer' });
    await expectUnchanged(() => confirmRows(db, ctx(), 'stale-answer', requestId, [shown], null), StaleError);
  });

  it('rechecks a parsed score against the saved reply inside the confirming transaction', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.flaw']);
    const id = attemptIds[0]!;
    const snapshot = (await db.snapshots.get((await db.attempts.get(id))!.snapshotHash))!;
    const raw = `BEGIN FEEDBACK request=${requestId}\nI01: The reasoning misses a gap.\nEND FEEDBACK\nBEGIN SCORES v2 request=${requestId}\nI01 | 1/${snapshot.max} | -\nEND SCORES`;
    const parsed = parseReply(raw, {
      id: requestId,
      promptVersion: (await db.requests.get(requestId))!.promptVersion,
      rows: [{ rowId: 'I01', max: snapshot.max, allowedTags: snapshot.allowedTags }],
    });
    expect(parsed.kind).toBe('parsed');
    if (parsed.kind !== 'parsed') throw new Error('expected a parsed reply');
    const { replyId } = await saveReply(db, ctx(), 'saved-parse', requestId, {
      raw,
      parserVersion: PARSER_VERSION,
      selectedBlock: parsed.block.range,
      parseOutcome: parsed.block.outcome,
    });
    const valid = parsed.block.rows[0]!;
    if (valid.status !== 'valid') throw new Error('expected a valid row');
    await expectUnchanged(
      async () =>
        confirmRows(
          db,
          ctx(),
          'forged-score',
          requestId,
          [await row(id, 2, { source: 'parsed', replyId, feedbackRange: valid.feedback })],
          null,
        ),
      OpError,
    );
    await confirmRows(
      db,
      ctx(),
      'real-score',
      requestId,
      [await row(id, 1, { source: 'parsed', replyId, feedbackRange: valid.feedback })],
      null,
    );
    expect((await db.gradings.toArray())[0]).toMatchObject({ score: 1, replyId });
  });

  it('refuses a parsed grade without a reply or with an older parser, without writing', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.flaw']);
    const id = attemptIds[0]!;
    await expectUnchanged(
      async () => confirmRows(db, ctx(), 'no-reply', requestId, [await row(id, 1, { source: 'parsed' })], null),
      OpError,
    );
    const { replyId } = await saveReply(db, ctx(), 'old-reply', requestId, {
      raw: 'An old reply',
      parserVersion: PARSER_VERSION - 1,
      selectedBlock: null,
      parseOutcome: 'manual',
    });
    await expectUnchanged(
      async () =>
        confirmRows(db, ctx(), 'old-parser', requestId, [await row(id, 1, { source: 'parsed', replyId })], null),
      OpError,
    );
    expect(await db.gradings.count()).toBe(0);
  });

  it('rechecks a reply inherited from a needs-review grading', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.flaw']);
    const id = attemptIds[0]!;
    const pending = await parsedGradeRow(requestId, id, null, 'saved-inherited');
    await confirmRows(db, ctx(), 'needs-review', requestId, [pending], null);
    await expectUnchanged(
      async () => confirmRows(db, ctx(), 'inherited-score', requestId, [await row(id, 1, { source: 'parsed' })], null),
      OpError,
    );
    await db.replies.update(pending.replyId!, { parserVersion: PARSER_VERSION - 1 });
    await expectUnchanged(
      async () =>
        confirmRows(db, ctx(), 'inherited-old-parser', requestId, [await row(id, null, { source: 'parsed' })], null),
      OpError,
    );
  });

  it('accepts only the chosen option of a saved multi-block reply', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.flaw']);
    const id = attemptIds[0]!;
    const snapshot = (await db.snapshots.get((await db.attempts.get(id))!.snapshotHash))!;
    const scoreBlock = (score: number) =>
      `BEGIN SCORES v2 request=${requestId}\nI01 | ${score}/${snapshot.max} | -\nEND SCORES`;
    const raw = `${scoreBlock(0)}\n\n${scoreBlock(1)}`;
    const parsed = parseReply(raw, {
      id: requestId,
      promptVersion: (await db.requests.get(requestId))!.promptVersion,
      rows: [{ rowId: 'I01', max: snapshot.max, allowedTags: snapshot.allowedTags }],
    });
    expect(parsed.kind).toBe('choose');
    if (parsed.kind !== 'choose') throw new Error('Expected two blocks');
    const first = parsed.options[0]!;
    const second = parsed.options[1]!;
    const { replyId: firstReplyId } = await saveReply(db, ctx(), 'first-option', requestId, {
      raw,
      parserVersion: PARSER_VERSION,
      selectedBlock: first.range,
      parseOutcome: first.outcome,
    });
    await expectUnchanged(
      async () =>
        confirmRows(
          db,
          ctx(),
          'wrong-option',
          requestId,
          [await row(id, 1, { source: 'parsed', replyId: firstReplyId })],
          null,
        ),
      OpError,
    );
    const { replyId: secondReplyId } = await saveReply(db, ctx(), 'second-option', requestId, {
      raw,
      parserVersion: PARSER_VERSION,
      selectedBlock: second.range,
      parseOutcome: second.outcome,
    });
    await confirmRows(
      db,
      ctx(),
      'right-option',
      requestId,
      [await row(id, 1, { source: 'parsed', replyId: secondReplyId })],
      null,
    );
    expect((await db.gradings.toArray())[0]).toMatchObject({ score: 1, replyId: secondReplyId });
  });

  it('requires human source labels on a corrected grade', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.flaw']);
    const id = attemptIds[0]!;
    await confirmRows(db, ctx(), 'first-grade', requestId, [await row(id, 1)], null);
    await expectUnchanged(
      async () => correctGrade(db, ctx(), 'forged-correction', await row(id, 2, { source: 'parsed' })),
      OpError,
    );
  });

  it('resolution and correction keep the reply and feedback range, labelling the new source', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.flaw']);
    const x = attemptIds[0]!;
    const pending = await parsedGradeRow(requestId, x, null, 'saved-for-resolution');
    const range = pending.feedbackRange;
    const replyId = pending.replyId!;
    await confirmRows(db, ctx(), 'c1', requestId, [pending], null);
    await confirmRows(db, ctx(), 'c2', requestId, [await row(x, 2, { source: 'manual' })], null);
    await correctGrade(db, ctx(), 'f1', await row(x, 1, { source: 'self' }));
    const current = (await db.gradings.get((await db.attempts.get(x))!.currentGradingId!))!;
    expect(current).toMatchObject({ replyId, feedbackRange: range, source: 'self', score: 1, status: 'accepted' });
    await expect(
      correctGrade(db, ctx(), 'f2', await row(x, 2, { source: 'manual', feedbackRange: { start: 0, end: 1 } })),
    ).rejects.toThrow(/keeps the feedback/);
    await expectConsistent();
  });
});

describe('discard, abandon and tags', () => {
  it('discardRows and abandonRequest leave accepted rows alone; repeated opIds are no-ops', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.conclusion', 'arg-0001.flaw']);
    await confirmRows(db, ctx(), 'c1', requestId, [await row(attemptIds[0]!, 1)], null);
    const r = { attemptId: attemptIds[1]!, revision: await rev(attemptIds[1]!) };
    await expectUnchanged(() => discardRows(db, ctx(), 'd0', requestId, [r, r]), OpError);
    await discardRows(db, ctx(), 'd1', requestId, [r]);
    expect(await discardRows(db, ctx(), 'd1', requestId, [r])).toEqual({ discarded: [attemptIds[1]] });
    await expectUnchanged(() => discardRows(db, ctx(), 'd2', requestId, [r]), StaleError);
    expect((await db.attempts.get(attemptIds[0]!))!.state).toBe('submitted');
    await expectConsistent();

    const other = await answer(['arg-0002.assumption']);
    const { requestIds } = await prepareGrading(db, ctx(), 'p2', other.attemptIds, 4);
    const shown = { [other.attemptIds[0]!]: await rev(other.attemptIds[0]!) };
    await abandonRequest(db, ctx(), 'ab', requestIds[0]!, shown);
    await abandonRequest(db, ctx(), 'ab', requestIds[0]!, shown);
    expect((await db.requests.get(requestIds[0]!))!.status).toBe('abandoned');
    await expectConsistent();
  });

  it('abandonRequest refuses revisions that changed since they were shown', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.conclusion', 'arg-0001.flaw']);
    const [x, y] = attemptIds as [string, string];
    const shown = { [x]: await rev(x), [y]: await rev(y) };
    // Another tab confirms and then undoes x while the discard dialog is open.
    await confirmRows(db, ctx(), 'c1', requestId, [await row(x, 1)], null);
    await undoLatest(db, ctx(), 'u1', x, await rev(x));
    await expectUnchanged(() => abandonRequest(db, ctx(), 'ab1', requestId, shown), StaleError);
    await expectUnchanged(() => abandonRequest(db, ctx(), 'ab2', requestId, { [x]: shown[x]! + 2 }), StaleError);
    await expectUnchanged(
      () => abandonRequest(db, ctx(), 'ab3', requestId, { ...shown, [x]: shown[x]! + 2, other: 0 }),
      OpError,
    );
    await abandonRequest(db, ctx(), 'ab4', requestId, { ...shown, [x]: await rev(x) });
    expect((await db.requests.get(requestId))!.status).toBe('abandoned');
    await expectConsistent();
  });

  it('setTags writes a new revision, keeps the review and refuses stale revisions', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.flaw']);
    const id = attemptIds[0]!;
    await confirmRows(db, ctx(), 'c1', requestId, [await row(id, 1)], null);
    const r = await rev(id);
    await setTags(db, ctx(), 't1', id, r, ['correlation-causation']);
    await setTags(db, ctx(), 't1', id, r, ['correlation-causation']);
    await expectUnchanged(() => setTags(db, ctx(), 't2', id, r, []), StaleError);
    expect(await db.reviewLogs.count()).toBe(1);
    expect(await db.gradings.count()).toBe(2);
    await expectConsistent();
  });
});

describe('export and import', () => {
  /**
   * Request 1: both rows accepted with a saved reply (two reviews, one tagged and flagged).
   * Request 2: one parsed row needs review, linked to a saved reply. Plus an unfinished
   * session with a draft.
   */
  async function populated(): Promise<ExportFile> {
    const { attemptIds, requestId } = await prepared(['arg-0001.conclusion', 'arg-0001.flaw']);
    await confirmRows(
      db,
      ctx(),
      'c1',
      requestId,
      [await row(attemptIds[0]!, 1, { feedbackRange: { start: 0, end: 5 } }), await row(attemptIds[1]!, 1)],
      { raw: 'reply text', parserVersion: 1, selectedBlock: { start: 0, end: 10 }, parseOutcome: 'clean' },
    );
    await addFlag(db, ctx(), attemptIds[1]!, 'unfair-grade', 'too harsh');
    const second = await prepared(['arg-0002.assumption']);
    const pending = await parsedGradeRow(second.requestId, second.attemptIds[0]!, null, 'r2');
    await confirmRows(db, ctx(), 'c2', second.requestId, [pending], null);
    const s = await startSession(db, ctx(), 'today', ['arg-0003.flaw']);
    const draft = await open(s.id, 0, 'arg-0003.flaw');
    await saveDraft(db, ctx(), await expectedDraft(draft), 'unfinished');
    await db.settings.bulkPut([
      { key: 'batchSize', value: 3 },
      { key: 'focus', value: { tag: null, note: 'assumptions' } },
      { key: 'disclosureSeen', value: true },
      { key: 'persistGranted', value: true },
    ]);
    await expectConsistent();
    return exportData(db, now, 'test');
  }

  const roundTrip = (f: ExportFile) => JSON.parse(JSON.stringify(f)) as ExportFile;

  it('round-trips every record exactly, minus device-local settings', async () => {
    const file = await populated();
    expect(file.settings.map((s) => s.key).sort()).toEqual(['batchSize', 'focus']);
    const check = await checkImport(JSON.stringify(file));
    expect(check.ok ? [] : check.problems).toEqual([]);
    const fresh = openDb(`test-${Math.random()}`);
    if (check.ok) await replaceAll(fresh, check.data);
    const original = await dump();
    const copy = await dump(fresh);
    for (const t of TABLES) {
      if (t === 'settings') continue;
      expect(copy[t]).toEqual(original[t]);
    }
    expect(copy.settings).toEqual(original.settings.filter((s) => s.key === 'batchSize' || s.key === 'focus'));
    expect(roundTrip(await exportData(fresh, now, 'test'))).toEqual(roundTrip(file));
  });

  it('keeps this device’s disclosure and persistence settings on replace', async () => {
    const file = await populated();
    const check = await checkImport(
      JSON.stringify({ ...file, settings: [...file.settings, { key: 'disclosureSeen', value: true }] }),
    );
    expect(check.ok).toBe(true);
    const fresh = openDb(`test-${Math.random()}`);
    await fresh.settings.bulkPut([
      { key: 'disclosureSeen', value: false },
      { key: 'persistGranted', value: false },
      { key: 'batchSize', value: 9 },
    ]);
    if (check.ok)
      await replaceAll(fresh, {
        ...check.data,
        settings: [...check.data.settings, { key: 'persistGranted', value: true }],
      });
    const settings = Object.fromEntries((await fresh.settings.toArray()).map((s) => [s.key, s.value]));
    expect(settings).toEqual({
      batchSize: 3,
      focus: { tag: null, note: 'assumptions' },
      disclosureSeen: false,
      persistGranted: false,
    });
  });

  it('a late failure inside replaceAll leaves every original table intact', async () => {
    const file = await populated();
    const check = await checkImport(JSON.stringify(file));
    if (!check.ok) throw new Error(check.problems.join('\n'));
    const target = openDb(`test-${Math.random()}`);
    const other = db;
    db = target;
    await reviewOnce('arg-0005.flaw', '2026-10-05T15:00:00.000Z', '2026-10-05T16:00:00.000Z', 2);
    await db.settings.put({ key: 'batchSize', value: 2 });
    const before = await dump(target);
    db = other;
    // settings is the last table written: a duplicate key fails after every other table was replaced.
    const broken = { ...check.data, settings: [...check.data.settings, check.data.settings[0]!] };
    expect(TABLES.at(-1)).toBe('settings');
    await expect(replaceAll(target, broken)).rejects.toThrow();
    expect(await dump(target)).toEqual(before);
  });

  it('imports an unknown scheduler version, reviews with the current one, undoes exactly and re-exports both', async () => {
    const file = await populated();
    const fsrsX = { request_retention: 0.85, maximum_interval: 100, future_setting: true };
    for (const c of file.cards) c.schedulerVersion = 'fsrs-x';
    for (const l of file.reviewLogs) l.schedulerVersion = 'fsrs-x';
    file.schedulerConfigs = { 'fsrs-x': fsrsX };
    const check = await checkImport(JSON.stringify(file));
    if (!check.ok) throw new Error(check.problems.join('\n'));
    expect(check.summary.unknownSchedulers).toEqual(['fsrs-x']);
    const fresh = openDb(`test-${Math.random()}`);
    await replaceAll(fresh, check.data);
    db = fresh;
    const imported = (await db.cards.get('arg-0001.flaw'))!;
    expect(imported.schedulerVersion).toBe('fsrs-x');

    const b = await reviewOnce('arg-0001.flaw', '2026-10-09T15:00:00.000Z', '2026-10-09T16:00:00.000Z', 2);
    const log = (await db.reviewLogs.where('attemptId').equals(b).toArray())[0]!;
    expect(log.schedulerVersion).toBe(CURRENT_SCHEDULER);
    expect(log.cardBefore!.schedulerVersion).toBe('fsrs-x');
    expect((await db.cards.get('arg-0001.flaw'))!.schedulerVersion).toBe(CURRENT_SCHEDULER);
    await expectConsistent();

    await undoLatest(db, ctx(), 'u', b, await rev(b));
    expect(await db.cards.get('arg-0001.flaw')).toEqual(imported);
    // Older reviews made under the unknown version stay locked.
    const old = file.reviewLogs[0]!.attemptId;
    await expect(undoLatest(db, ctx(), 'u-old', old, await rev(old))).rejects.toThrow(/scheduler/);

    const again = await exportData(db, now, 'test');
    expect(Object.keys(again.schedulerConfigs).sort()).toEqual([CURRENT_SCHEDULER, 'fsrs-x']);
    expect(again.schedulerConfigs['fsrs-x']).toEqual(fsrsX);
    const recheck = await checkImport(JSON.stringify(again));
    expect(recheck.ok ? [] : recheck.problems).toEqual([]);
  });

  it('checks size in bytes, and a File’s size before reading it', async () => {
    const huge = { size: MAX_IMPORT_BYTES + 1, text: () => Promise.reject(new Error('read')) } as unknown as Blob;
    expect(await checkImportFile(huge)).toEqual({ ok: false, problems: [IMPORT_TOO_LARGE] });
    // Under the limit in characters, over it in UTF-8 bytes.
    const text = '€'.repeat(Math.floor(MAX_IMPORT_BYTES / 3) + 1);
    expect(text.length).toBeLessThan(MAX_IMPORT_BYTES);
    expect(await checkImport(text)).toEqual({ ok: false, problems: [IMPORT_TOO_LARGE] });
  });

  const firstAccepted = (f: ExportFile) => f.gradings.find((g) => g.status === 'accepted')!;
  const tagged = (f: ExportFile) => f.gradings.find((g) => g.replyId !== null && g.status === 'accepted')!;
  const breakers: [string, (f: ExportFile) => void][] = [
    ['1 frozen snapshot', (f) => void (f.snapshots[0]!.reference = 'changed')],
    ['2 one owning request', (f) => void (f.attempts.find((a) => a.requestId)!.requestId = null)],
    [
      '3 one current grading',
      (f) => void f.gradings.push({ ...f.gradings[0]!, id: 'dup', status: 'needs-review', score: null }),
    ],
    ['4 one active review', (f) => void f.reviewLogs.push({ ...f.reviewLogs[0]!, id: 'dup-log', seq: 99 })],
    ['5 accepted means valid', (f) => void (firstAccepted(f).score = 9)],
    ['6 session entries', (f) => void (f.sessions[0]!.entries[0]!.taskId = 'arg-0009.flaw')],
    [
      '7 snapshots agree',
      (f) =>
        void (f.requests[0]!.snapshots.I01 = f.snapshots.find((s) => s.hash !== f.requests[0]!.snapshots.I01)!.hash),
    ],
    ['8 disqualified means zero', (f) => void (firstAccepted(f).disqualified = true)],
    ['request status', (f) => void (f.requests[0]!.status = 'open')],
    ['grading reply from another request', (f) => void (tagged(f).replyId = f.replies[1]!.id)],
    ['flag snapshot missing', (f) => void (f.flags[0]!.snapshotHash = '0'.repeat(64))],
    [
      'flag snapshot of another attempt',
      (f) => void (f.flags[0]!.snapshotHash = f.snapshots.find((s) => s.hash !== f.flags[0]!.snapshotHash)!.hash),
    ],
    ['reversed feedback range', (f) => void (tagged(f).feedbackRange = { start: 4, end: 2 })],
    ['feedback range past the reply', (f) => void (tagged(f).feedbackRange = { start: 0, end: 999 })],
    [
      'feedback range without a reply',
      (f) => void f.gradings.filter((g) => g.replyId).forEach((g) => (g.replyId = null)),
    ],
    ['selected block past the reply', (f) => void (f.replies[0]!.selectedBlock = { start: 0, end: 999 })],
    [
      'discarded attempt with an active review',
      (f) => void (f.attempts.find((a) => a.currentGradingId)!.state = 'discarded'),
    ],
    [
      'coached attempt with an active review',
      (f) => void (f.attempts.find((a) => a.currentGradingId)!.kind = 'coached'),
    ],
    ['active review without a card', (f) => void f.cards.pop()],
    ['card differs from its latest review', (f) => void (f.cards[0]!.reps += 1)],
    ['card without a review', (f) => void f.cards.push({ ...f.cards[0]!, taskId: 'arg-0003.flaw' })],
    ['rating does not follow from the grade', (f) => void (f.reviewLogs[0]!.rating = 1)],
    ['duplicate seq', (f) => void (f.reviewLogs[1]!.seq = f.reviewLogs[0]!.seq)],
    ['reviewedAt is not the submission time', (f) => void (f.reviewLogs[0]!.reviewedAt = '2026-10-06T00:00:00.000Z')],
    [
      'duplicate tags',
      (f) => {
        const g = firstAccepted(f);
        const a = f.attempts.find((x) => x.id === g.attemptId)!;
        const tag = f.snapshots.find((x) => x.hash === a.snapshotHash)!.allowedTags[0]!;
        g.tags = [tag, tag];
      },
    ],
    [
      'needs-review from a manual source',
      (f) => void (f.gradings.find((g) => g.status === 'needs-review')!.source = 'manual'),
    ],
    [
      'needs-review max differs from the snapshot',
      (f) => void (f.gradings.find((g) => g.status === 'needs-review')!.max = 9),
    ],
    ['focus setting is not an object', (f) => void (f.settings.find((s) => s.key === 'focus')!.value = null)],
    ['unknown setting', (f) => void f.settings.push({ key: 'colour', value: 'blue' })],
    ['offset timestamp', (f) => void (f.attempts[0]!.startedAt = '2026-10-05T11:00:00.000-04:00')],
    ['timestamp without milliseconds', (f) => void (f.attempts[0]!.startedAt = '2026-10-05T15:00:00Z')],
    ['scheduler config missing', (f) => void (f.schedulerConfigs = {})],
    [
      'scheduler config conflicts with a known version',
      (f) => void (f.schedulerConfigs[CURRENT_SCHEDULER]!.request_retention = 0.8),
    ],
  ];

  it.each(breakers)('rejects an export that breaks: %s', async (_, breakIt) => {
    const file = await populated();
    breakIt(file);
    const check = await checkImport(JSON.stringify(file));
    expect(check.ok).toBe(false);
  });

  it('refuses newer schema versions with a clear message', async () => {
    const file = { ...(await populated()), schemaVersion: 2 };
    const check = await checkImport(JSON.stringify(file));
    expect(check.ok ? [] : check.problems).toEqual([
      'This file comes from a newer version of Premise. Update the app first.',
    ]);
  });
});
