// Storage operations (ARCHITECTURE.md §6.2): repeated opIds, stale revisions, crash before
// acknowledgement, correction and undo, and import validation for each §5.1 invariant.

import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { loadExercises } from '../../scripts/content.ts';
import { checkDataSet } from '../../src/domain/integrity.ts';
import type { DataSet } from '../../src/domain/records.ts';
import { buildSnapshot } from '../../src/domain/snapshot.ts';
import type { Snapshot } from '../../src/domain/types.ts';
import { checkImport, exportData, replaceAll } from '../../src/storage/backup.ts';
import { openDb, TABLES, type PremiseDb } from '../../src/storage/db.ts';
import {
  abandonRequest,
  confirmRows,
  correctGrade,
  discardRows,
  endSession,
  faults,
  openEntry,
  prepareGrading,
  setTags,
  setTaskControls,
  StaleError,
  startSession,
  submitAttempt,
  undoLatest,
  type GradeRow,
  type OpContext,
} from '../../src/storage/ops.ts';

let db: PremiseDb;
let n = 0;
let now = '2026-10-05T15:00:00.000Z';
const ctx = (): OpContext => ({
  now,
  newId: () => `id-${String(++n).padStart(4, '0')}`,
  random: () => ((n * 7919) % 1000) / 1000,
});
const snaps = new Map<string, Snapshot>();

beforeEach(async () => {
  db = openDb(`test-${Math.random()}`);
  n = 0;
  now = '2026-10-05T15:00:00.000Z';
  faults.beforeReceipt = null;
  if (snaps.size === 0) {
    for (const e of await loadExercises())
      for (const t of e.tasks) {
        const s = await buildSnapshot(e, t);
        snaps.set(s.taskId, s);
      }
  }
});

async function answer(taskIds: string[], answers: string[] = taskIds.map((_, i) => `answer ${i}`)) {
  const session = await startSession(db, ctx(), 'today', taskIds);
  const ids: string[] = [];
  for (const [i, t] of taskIds.entries()) {
    const a = await openEntry(db, ctx(), session.id, i, snaps.get(t)!);
    await submitAttempt(db, ctx(), a.id, answers[i]!, 30);
    ids.push(a.id);
  }
  await endSession(db, ctx(), session.id);
  return { sessionId: session.id, attemptIds: ids };
}

async function prepared(taskIds: string[]) {
  const { attemptIds } = await answer(taskIds);
  const { requestIds } = await prepareGrading(db, ctx(), 'prep-1', attemptIds, 4);
  return { attemptIds, requestId: requestIds[0]! };
}

async function row(attemptId: string, score: number | null, extra: Partial<GradeRow> = {}): Promise<GradeRow> {
  const a = (await db.attempts.get(attemptId))!;
  return {
    attemptId,
    revision: a.revision,
    score,
    tags: [],
    source: 'parsed',
    disqualified: false,
    feedbackRange: null,
    ratingChoice: 'good',
    ...extra,
  };
}

async function dump(): Promise<DataSet> {
  return Object.fromEntries(await Promise.all(TABLES.map(async (t) => [t, await db.table(t).toArray()]))) as DataSet;
}

async function expectConsistent() {
  expect(checkDataSet(await dump())).toEqual([]);
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
    await expect(confirmRows(db, ctx(), 'c2', requestId, rows, null)).rejects.toBeInstanceOf(StaleError);
    expect(await db.reviewLogs.count()).toBe(1);
    expect(await db.gradings.count()).toBe(1);
  });

  it('writes nothing when it fails before the receipt, and a retry with the same opId then succeeds once', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.flaw']);
    const rows = [await row(attemptIds[0]!, 0)];
    faults.beforeReceipt = () => {
      throw new Error('simulated crash');
    };
    await expect(confirmRows(db, ctx(), 'c1', requestId, rows, null)).rejects.toThrow('simulated crash');
    expect(await db.gradings.count()).toBe(0);
    expect(await db.cards.count()).toBe(0);
    faults.beforeReceipt = null;
    await confirmRows(db, ctx(), 'c1', requestId, rows, null);
    await confirmRows(db, ctx(), 'c1', requestId, rows, null);
    expect(await db.reviewLogs.count()).toBe(1);
    await expectConsistent();
  });

  it('keeps needs-review rows open, then resolves them with a manual score', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.flaw']);
    await confirmRows(db, ctx(), 'c1', requestId, [await row(attemptIds[0]!, null)], null);
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
    expect(await db.gradings.count()).toBe(0);
  });

  it('sets notBefore to the next local day and keeps coached attempts out of scheduling', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.flaw']);
    await confirmRows(db, ctx(), 'c1', requestId, [await row(attemptIds[0]!, 0)], null);
    const state = (await db.taskStates.get('arg-0001.flaw'))!;
    expect(state.notBefore! > '2026-10-05').toBe(true);

    const retry = await startSession(db, ctx(), 'retry', ['arg-0001.flaw']);
    const coached = await openEntry(db, ctx(), retry.id, 0, snaps.get('arg-0001.flaw')!);
    expect(coached.kind).toBe('coached');
    await submitAttempt(db, ctx(), coached.id, 'better', null);
    const { requestIds } = await prepareGrading(db, ctx(), 'p2', [coached.id], 4);
    await confirmRows(db, ctx(), 'c2', requestIds[0]!, [await row(coached.id, 2)], null);
    expect(await db.reviewLogs.count()).toBe(1);
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

  it('undo, then a stale confirm and a stale undo are refused', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.flaw']);
    const id = attemptIds[0]!;
    const before = await row(id, 2);
    await confirmRows(db, ctx(), 'c1', requestId, [before], null);
    const readForUndo = (await db.attempts.get(id))!.revision;
    await undoLatest(db, ctx(), 'u1', id, readForUndo);
    await undoLatest(db, ctx(), 'u1', id, readForUndo); // same opId: no-op
    await expect(undoLatest(db, ctx(), 'u2', id, readForUndo)).rejects.toBeInstanceOf(StaleError);
    expect(await db.cards.count()).toBe(0);
    expect((await db.requests.get(requestId))!.status).toBe('open');
    await expect(confirmRows(db, ctx(), 'c2', requestId, [before], null)).rejects.toBeInstanceOf(StaleError);
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
    await expect(
      undoLatest(db, ctx(), 'u', first.attemptIds[0]!, (await db.attempts.get(first.attemptIds[0]!))!.revision),
    ).rejects.toThrow(/locked/);
  });

  it('first review, suspend, undo, discard: suspension and next-day restriction survive', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.flaw']);
    const id = attemptIds[0]!;
    await confirmRows(db, ctx(), 'c1', requestId, [await row(id, 2)], null);
    const notBefore = (await db.taskStates.get('arg-0001.flaw'))!.notBefore;
    await setTaskControls(db, ctx(), 's1', 'arg-0001.flaw', { suspended: true });
    await undoLatest(db, ctx(), 'u1', id, (await db.attempts.get(id))!.revision);
    await discardRows(db, ctx(), 'd1', requestId, [{ attemptId: id, revision: (await db.attempts.get(id))!.revision }]);
    expect(await db.taskStates.get('arg-0001.flaw')).toEqual({ taskId: 'arg-0001.flaw', suspended: true, notBefore });
    expect(await db.cards.count()).toBe(0);
    expect((await db.attempts.get(id))!.state).toBe('discarded');
    expect((await db.requests.get(requestId))!.status).toBe('closed');
    await expectConsistent();
  });
});

describe('discard, abandon and tags', () => {
  it('discardRows and abandonRequest leave accepted rows alone; repeated opIds are no-ops', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.conclusion', 'arg-0001.flaw']);
    await confirmRows(db, ctx(), 'c1', requestId, [await row(attemptIds[0]!, 1)], null);
    const r = { attemptId: attemptIds[1]!, revision: (await db.attempts.get(attemptIds[1]!))!.revision };
    await discardRows(db, ctx(), 'd1', requestId, [r]);
    expect(await discardRows(db, ctx(), 'd1', requestId, [r])).toEqual({ discarded: [attemptIds[1]] });
    await expect(discardRows(db, ctx(), 'd2', requestId, [r])).rejects.toBeInstanceOf(StaleError);
    expect((await db.attempts.get(attemptIds[0]!))!.state).toBe('submitted');
    await expectConsistent();

    const other = await answer(['arg-0002.assumption']);
    const { requestIds } = await prepareGrading(db, ctx(), 'p2', other.attemptIds, 4);
    await abandonRequest(db, ctx(), 'ab', requestIds[0]!);
    await abandonRequest(db, ctx(), 'ab', requestIds[0]!);
    expect((await db.requests.get(requestIds[0]!))!.status).toBe('abandoned');
    await expectConsistent();
  });

  it('setTags writes a new revision, keeps the review and refuses stale revisions', async () => {
    const { attemptIds, requestId } = await prepared(['arg-0001.flaw']);
    const id = attemptIds[0]!;
    await confirmRows(db, ctx(), 'c1', requestId, [await row(id, 1)], null);
    const rev = (await db.attempts.get(id))!.revision;
    await setTags(db, ctx(), 't1', id, rev, ['correlation-causation']);
    await setTags(db, ctx(), 't1', id, rev, ['correlation-causation']);
    await expect(setTags(db, ctx(), 't2', id, rev, [])).rejects.toBeInstanceOf(StaleError);
    expect(await db.reviewLogs.count()).toBe(1);
    expect(await db.gradings.count()).toBe(2);
    await expectConsistent();
  });
});

describe('export and import', () => {
  async function populated() {
    const { attemptIds, requestId } = await prepared(['arg-0001.conclusion', 'arg-0001.flaw']);
    await confirmRows(db, ctx(), 'c1', requestId, [await row(attemptIds[0]!, 1)], {
      raw: 'reply',
      parserVersion: 1,
      selectedBlock: null,
      parseOutcome: 'recoverable',
    });
    const s = await startSession(db, ctx(), 'today', ['arg-0002.assumption']);
    await openEntry(db, ctx(), s.id, 0, snaps.get('arg-0002.assumption')!);
    return exportData(db, now, 'test');
  }

  it('round-trips an unfinished session and a partially graded request', async () => {
    const file = await populated();
    const check = await checkImport(JSON.stringify(file));
    expect(check.ok).toBe(true);
    const fresh = openDb(`test-${Math.random()}`);
    if (check.ok) await replaceAll(fresh, check.data);
    for (const t of TABLES) expect(await fresh.table(t).count()).toBe(await db.table(t).count());
  });

  const breakers: [string, (f: DataSet) => void][] = [
    ['1 frozen snapshot', (f) => void (f.snapshots[0]!.reference = 'changed')],
    ['2 one owning request', (f) => void (f.attempts.find((a) => a.requestId)!.requestId = null)],
    [
      '3 one current grading',
      (f) => void f.gradings.push({ ...f.gradings[0]!, id: 'dup', status: 'needs-review', score: null }),
    ],
    ['4 one active review', (f) => void f.reviewLogs.push({ ...f.reviewLogs[0]!, id: 'dup-log' })],
    ['5 accepted means valid', (f) => void (f.gradings[0]!.score = 9)],
    ['6 session entries', (f) => void (f.sessions[0]!.entries[0]!.taskId = 'arg-0009.flaw')],
    [
      '7 snapshots agree',
      (f) =>
        void (f.requests[0]!.snapshots.I01 = f.snapshots.find((s) => s.hash !== f.requests[0]!.snapshots.I01)!.hash),
    ],
    ['8 disqualified means zero', (f) => void (f.gradings[0]!.disqualified = true)],
    ['request status', (f) => void (f.requests[0]!.status = 'closed')],
  ];

  it.each(breakers)('rejects an export that breaks invariant %s', async (_, breakIt) => {
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
