import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { loadExercises } from '../../scripts/content.ts';
import {
  PROMPT_BUDGET,
  MAX_ANSWER_LENGTH,
  renderPromptForVersion,
  renderPromptV2,
  type PromptRow,
  type PromptVersion,
} from '../../src/domain/prompt.ts';
import { schedulerConfig } from '../../src/domain/schedulerConfig.ts';
import { MAX_REPLY_LENGTH } from '../../src/domain/scoreParser.ts';
import { buildSnapshot, canonicalJson, sha256Hex } from '../../src/domain/snapshot.ts';
import { checkImport, exportData, replaceAll, type ExportFile } from '../../src/storage/backup.ts';
import { openDb } from '../../src/storage/db.ts';
import {
  confirmRows,
  endSession,
  openEntry,
  prepareGrading,
  saveDraft,
  skipAttempt,
  startSession,
  submitAttempt,
  type OpContext,
} from '../../src/storage/ops.ts';

const NOW = '2026-10-05T15:00:00.000Z';

function emptyFile(): ExportFile {
  return {
    app: 'premise',
    schemaVersion: 1,
    exportedAt: NOW,
    appVersion: 'test',
    schedulerConfigs: {},
    snapshots: [],
    sessions: [],
    attempts: [],
    requests: [],
    replies: [],
    gradings: [],
    reviewLogs: [],
    cards: [],
    taskStates: [],
    flags: [],
    operations: [],
    settings: [],
  };
}

async function reviewedFile(acceptReview = true): Promise<ExportFile> {
  const db = openDb(`backup-security-${crypto.randomUUID()}`);
  let id = 0;
  const ctx = (): OpContext => ({
    now: NOW,
    newId: () => `00000000-0000-4000-8000-${String(++id).padStart(12, '0')}`,
    random: () => 0.42,
  });
  const exercise = (await loadExercises()).find((e) => e.id === 'arg-0001')!;
  const task = exercise.tasks[0]!;
  const snapshot = await buildSnapshot(exercise, task);
  const session = await startSession(db, ctx(), 'today', [snapshot.taskId]);
  const opened = await openEntry(db, ctx(), session.id, 0, snapshot);
  if (opened.status !== 'opened') throw new Error(`Unexpected open status: ${opened.status}`);
  const submitted = await submitAttempt(
    db,
    ctx(),
    { session, entryIndex: 0, attempt: opened.attempt },
    'My answer.',
    30,
  );
  await endSession(db, ctx(), session.id);
  const { requestIds } = await prepareGrading(db, ctx(), 'prepare', [submitted.id], 4);
  const requestId = requestIds[0]!;
  if (acceptReview) {
    const current = (await db.attempts.get(submitted.id))!;
    await confirmRows(
      db,
      ctx(),
      'confirm',
      requestId,
      [
        {
          attemptId: submitted.id,
          revision: current.revision,
          score: snapshot.max,
          tags: [],
          source: 'manual',
          disqualified: false,
          feedbackRange: null,
          ratingChoice: 'good',
        },
      ],
      null,
    );
  }
  return exportData(db, NOW, 'test');
}

async function problems(file: ExportFile): Promise<string[]> {
  const result = await checkImport(JSON.stringify(file));
  return result.ok ? [] : result.problems;
}

function requestRows(file: ExportFile): PromptRow[] {
  const request = file.requests[0]!;
  return Object.entries(request.rows).map(([rowId, attemptId]) => {
    const attempt = file.attempts.find((a) => a.id === attemptId)!;
    const snapshot = file.snapshots.find((s) => s.hash === request.snapshots[rowId])!;
    return { rowId, attemptId, snapshot, answer: attempt.answer };
  });
}

async function enlargeFrozenStimulus(file: ExportFile): Promise<void> {
  const snapshot = file.snapshots[0]!;
  const oldHash = snapshot.hash;
  snapshot.stimulus += 'x'.repeat(PROMPT_BUDGET);
  const { hash: _hash, firstSeenAt: _seen, ...payload } = snapshot;
  snapshot.hash = await sha256Hex(canonicalJson(payload));
  for (const attempt of file.attempts) if (attempt.snapshotHash === oldHash) attempt.snapshotHash = snapshot.hash;
  for (const request of file.requests) {
    for (const [row, hash] of Object.entries(request.snapshots)) {
      if (hash === oldHash) request.snapshots[row] = snapshot.hash;
    }
  }
}

describe('backup import security boundaries', () => {
  it.each(['constructor', 'toString', '__proto__'])(
    'rejects inherited setting name %s without throwing',
    async (key) => {
      const file = emptyFile();
      file.settings.push({ key, value: false });
      expect((await problems(file)).join(' ')).toContain('unknown setting');
    },
  );

  it('does not mistake inherited scheduler keys for known or exported configurations', async () => {
    expect(schedulerConfig('constructor')).toBeUndefined();
    const file = await reviewedFile();
    file.cards[0]!.schedulerVersion = 'constructor';
    file.reviewLogs[0]!.schedulerVersion = 'constructor';
    file.schedulerConfigs = {};
    expect((await problems(file)).join(' ')).toContain('scheduler constructor: configuration missing');
  });

  it.each(['constructor', 'toString', '__proto__'])(
    'round-trips an own scheduler key named %s as an unknown version',
    async (version) => {
      const file = await reviewedFile();
      file.cards[0]!.schedulerVersion = version;
      file.reviewLogs[0]!.schedulerVersion = version;
      file.schedulerConfigs = Object.fromEntries([[version, { request_retention: 0.85 }]]);
      const checked = await checkImport(JSON.stringify(file));
      expect(checked.ok).toBe(true);
      if (!checked.ok) return;
      expect(checked.summary.unknownSchedulers).toContain(version);
      const db = openDb(`backup-security-${crypto.randomUUID()}`);
      await replaceAll(db, checked.data);
      const exported = await exportData(db, NOW, 'test');
      expect(Object.hasOwn(exported.schedulerConfigs, version)).toBe(true);
    },
  );

  it('returns a validation result for nonfinite scheduler numbers', async () => {
    const file = emptyFile();
    file.schedulerConfigs = { 'fsrs-1': { bad: 'sentinel' } };
    const text = JSON.stringify(file).replace('"sentinel"', '1e400');
    const checked = await checkImport(text);
    expect(checked.ok).toBe(false);
    const unknown = JSON.stringify({ ...file, schedulerConfigs: { future: { nested: ['sentinel'] } } }).replace(
      '"sentinel"',
      '1e400',
    );
    expect((await checkImport(unknown)).ok).toBe(false);
  });

  it.each([
    ['state', 999],
    ['state', 0],
    ['stability', -1],
    ['stability', 36501],
    ['difficulty', -1],
    ['difficulty', 11],
    ['reps', -1],
    ['learning_steps', 1],
    ['scheduled_days', -1],
  ] as const)('rejects an unusable active card field %s=%s', async (key, value) => {
    const file = await reviewedFile();
    file.cards[0]![key] = value;
    file.reviewLogs[0]!.cardAfter[key] = value;
    expect(await problems(file)).not.toEqual([]);
  });

  it('reserves a safe next application sequence and attempt revision', async () => {
    const file = await reviewedFile();
    file.reviewLogs[0]!.seq = Number.MAX_SAFE_INTEGER;
    expect((await problems(file)).join(' ')).toContain('seq');
    file.reviewLogs[0]!.seq = 1;
    file.attempts[0]!.revision = Number.MAX_SAFE_INTEGER;
    expect((await problems(file)).join(' ')).toContain('revision');
  });

  it('imports and round-trips an old saved reply beyond the current paste limit', async () => {
    const initial = await checkImport(JSON.stringify(await reviewedFile(false)));
    expect(initial.ok).toBe(true);
    if (!initial.ok) return;
    const db = openDb(`backup-security-${crypto.randomUUID()}`);
    await replaceAll(db, initial.data);
    const requestId = (await db.requests.toArray())[0]!.id;
    const raw = 'x'.repeat(MAX_REPLY_LENGTH + 1);
    // The deployed release stored unparseable replies without a length check.
    await db.replies.add({
      id: 'large-reply',
      requestId,
      raw,
      pastedAt: NOW,
      parserVersion: 1,
      selectedBlock: null,
      parseOutcome: 'manual',
    });
    const exported = await exportData(db, NOW, 'test');
    const checked = await checkImport(JSON.stringify(exported));
    expect(checked.ok ? [] : checked.problems).toEqual([]);
    if (!checked.ok) return;
    const restored = openDb(`backup-security-${crypto.randomUUID()}`);
    await replaceAll(restored, checked.data);
    expect((await restored.replies.get('large-reply'))?.raw).toBe(raw);
    expect((await checkImport(JSON.stringify(await exportData(restored, NOW, 'test')))).ok).toBe(true);
  });

  it('refuses an ended session that still owns a draft attempt', async () => {
    const db = openDb(`backup-security-${crypto.randomUUID()}`);
    const exercise = (await loadExercises()).find((e) => e.id === 'arg-0002')!;
    const snapshot = await buildSnapshot(exercise, exercise.tasks[0]!);
    const ctx: OpContext = { now: NOW, newId: () => crypto.randomUUID(), random: () => 0.42 };
    const session = await startSession(db, ctx, 'today', [snapshot.taskId]);
    const opened = await openEntry(db, ctx, session.id, 0, snapshot);
    if (opened.status !== 'opened') throw new Error('Expected a draft');
    const file = await exportData(db, NOW, 'test');
    file.sessions[0]!.endedAt = NOW;
    expect((await problems(file)).join(' ')).toMatch(/ended session.*draft/i);
  });

  it('imports an ended session with submitted and unopened entries and can grade its answer', async () => {
    const file = await reviewedFile(false);
    file.sessions[0]!.entries.push({ taskId: 'arg-0002.assumption', attemptId: null });
    const checked = await checkImport(JSON.stringify(file));
    expect(checked.ok ? [] : checked.problems).toEqual([]);
    if (!checked.ok) return;
    const db = openDb(`backup-security-${crypto.randomUUID()}`);
    await replaceAll(db, checked.data);
    const attempt = (await db.attempts.toArray())[0]!;
    const request = (await db.requests.toArray())[0]!;
    const snapshot = (await db.snapshots.get(attempt.snapshotHash))!;
    const ctx: OpContext = { now: NOW, newId: () => crypto.randomUUID(), random: () => 0.42 };
    await confirmRows(
      db,
      ctx,
      'confirm-imported',
      request.id,
      [
        {
          attemptId: attempt.id,
          revision: attempt.revision,
          score: snapshot.max,
          tags: [],
          source: 'manual',
          disqualified: false,
          feedbackRange: null,
          ratingChoice: 'good',
        },
      ],
      null,
    );
    expect(await db.reviewLogs.count()).toBe(1);
  });

  it.each([MAX_ANSWER_LENGTH, MAX_ANSWER_LENGTH + 1])(
    'checks a submitted answer of %i characters at import',
    async (length) => {
      const file = await reviewedFile(false);
      file.attempts[0]!.answer = 'x'.repeat(length);
      const request = file.requests[0]!;
      request.promptText = renderPromptForVersion(
        request.promptVersion as PromptVersion,
        request.id,
        request.fence,
        requestRows(file),
      );
      const found = await problems(file);
      if (length === MAX_ANSWER_LENGTH) expect(found).toEqual([]);
      else expect(found.join(' ')).toMatch(/submitted.*answer.*2,?000/i);
    },
  );

  it('refuses an over-limit discarded answer as well', async () => {
    const file = await reviewedFile(false);
    file.attempts[0]!.answer = 'x'.repeat(MAX_ANSWER_LENGTH + 1);
    file.attempts[0]!.state = 'discarded';
    file.requests[0]!.status = 'closed';
    const request = file.requests[0]!;
    request.promptText = renderPromptForVersion(
      request.promptVersion as PromptVersion,
      request.id,
      request.fence,
      requestRows(file),
    );
    expect((await problems(file)).join(' ')).toMatch(/discarded.*answer.*2,?000/i);
  });

  it('round-trips long drafts and skipped answers unchanged', async () => {
    const db = openDb(`backup-security-${crypto.randomUUID()}`);
    const ctx: OpContext = { now: NOW, newId: () => crypto.randomUUID(), random: () => 0.42 };
    const exercises = await loadExercises();
    const makeAttempt = async (exerciseId: string, skip: boolean) => {
      const exercise = exercises.find((e) => e.id === exerciseId)!;
      const snapshot = await buildSnapshot(exercise, exercise.tasks[0]!);
      const session = await startSession(db, ctx, 'today', [snapshot.taskId]);
      const opened = await openEntry(db, ctx, session.id, 0, snapshot);
      if (opened.status !== 'opened') throw new Error('Expected a draft');
      const answer = exerciseId.repeat(MAX_ANSWER_LENGTH / exerciseId.length + 1);
      await saveDraft(db, ctx, { session, entryIndex: 0, attempt: opened.attempt }, answer);
      const saved = (await db.attempts.get(opened.attempt.id))!;
      if (skip) await skipAttempt(db, ctx, { session, entryIndex: 0, attempt: saved });
      return { id: opened.attempt.id, answer };
    };
    const draft = await makeAttempt('arg-0002', false);
    const skipped = await makeAttempt('arg-0003', true);
    const checked = await checkImport(JSON.stringify(await exportData(db, NOW, 'test')));
    expect(checked.ok ? [] : checked.problems).toEqual([]);
    if (!checked.ok) return;
    const restored = openDb(`backup-security-${crypto.randomUUID()}`);
    await replaceAll(restored, checked.data);
    expect((await restored.attempts.get(draft.id))?.answer).toBe(draft.answer);
    expect((await restored.attempts.get(skipped.id))?.answer).toBe(skipped.answer);
    expect((await restored.attempts.get(draft.id))?.state).toBe('draft');
    expect((await restored.attempts.get(skipped.id))?.state).toBe('skipped');
  });

  it('refuses a route-breaking session ID with consistent attempt foreign keys', async () => {
    const file = await reviewedFile(false);
    file.sessions[0]!.id = 'bad/session';
    file.attempts[0]!.sessionId = 'bad/session';
    expect(await problems(file)).toEqual(['session bad/session: ID is not a canonical lower-case UUID']);
  });

  it('refuses case variants of a request ID even when all foreign keys match', async () => {
    const file = await reviewedFile(false);
    const first = file.requests[0]!;
    first.id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    file.attempts[0]!.requestId = first.id;
    first.promptText = renderPromptForVersion(
      first.promptVersion as PromptVersion,
      first.id,
      first.fence,
      requestRows(file),
    );
    const sourceSession = file.sessions[0]!;
    const sourceAttempt = file.attempts[0]!;
    const secondSessionId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    const secondAttemptId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
    const secondRequestId = first.id.toUpperCase();
    file.sessions.push({
      ...sourceSession,
      id: secondSessionId,
      entries: [{ taskId: sourceAttempt.taskId, attemptId: secondAttemptId }],
    });
    file.attempts.push({
      ...sourceAttempt,
      id: secondAttemptId,
      sessionId: secondSessionId,
      requestId: secondRequestId,
    });
    const second = {
      ...first,
      id: secondRequestId,
      rows: { I01: secondAttemptId },
      snapshots: { I01: sourceAttempt.snapshotHash },
    };
    file.requests.push(second);
    second.promptText = renderPromptForVersion(
      second.promptVersion as PromptVersion,
      second.id,
      second.fence,
      requestRows({ ...file, requests: [second] }),
    );
    expect(await problems(file)).toEqual([`request ${secondRequestId}: ID is not a canonical lower-case UUID`]);
  });

  it('refuses empty record IDs that runtime code treats as absent', async () => {
    const file = await reviewedFile(false);
    file.attempts[0]!.id = '';
    file.sessions[0]!.entries[0]!.attemptId = '';
    file.requests[0]!.rows.I01 = '';
    file.requests[0]!.promptText = renderPromptForVersion(
      file.requests[0]!.promptVersion as PromptVersion,
      file.requests[0]!.id,
      file.requests[0]!.fence,
      requestRows(file),
    );
    expect((await problems(file)).join(' ')).toMatch(/attempts: empty id/i);
  });

  it('imports an ordinary export with generated session and request UUIDs', async () => {
    expect(await problems(await reviewedFile(false))).toEqual([]);
  });

  it('rejects a prompt that differs from the frozen attempts and snapshots', async () => {
    const file = await reviewedFile();
    file.requests[0]!.promptText += '\nAltered grading instruction';
    expect((await problems(file)).join(' ')).toContain('prompt');
  });

  it('rejects a short request whose prompt text was replaced by null', async () => {
    const file = await reviewedFile();
    file.requests[0]!.promptText = null;
    expect((await problems(file)).join(' ')).toContain('budget');
  });

  it('rejects exact prompt text that exceeds the prompt budget', async () => {
    const file = await reviewedFile();
    await enlargeFrozenStimulus(file);
    const request = file.requests[0]!;
    request.promptText = renderPromptForVersion(
      request.promptVersion as PromptVersion,
      request.id,
      request.fence,
      requestRows(file),
    );
    expect(request.promptText.length).toBeGreaterThan(PROMPT_BUDGET);
    expect((await problems(file)).join(' ')).toContain('budget');
  });

  it('accepts a one-row null prompt when its canonical text exceeds the budget', async () => {
    const file = await reviewedFile(false);
    await enlargeFrozenStimulus(file);
    file.requests[0]!.promptText = null;
    expect(await problems(file)).toEqual([]);
  });

  it('rejects a request ID that the score parser cannot recognize', async () => {
    const file = await reviewedFile();
    const request = file.requests[0]!;
    const badId = 'not-a-uuid';
    request.id = badId;
    for (const attempt of file.attempts) if (attempt.requestId) attempt.requestId = badId;
    for (const grading of file.gradings) grading.requestId = badId;
    request.promptText = renderPromptForVersion(
      request.promptVersion as PromptVersion,
      request.id,
      request.fence,
      requestRows(file),
    );
    expect((await problems(file)).join(' ')).toContain('UUID');
  });

  it('accepts the exact historical v2 prompt', async () => {
    const file = await reviewedFile();
    const request = file.requests[0]!;
    request.promptVersion = 'v2';
    request.promptText = renderPromptV2(request.id, request.fence, requestRows(file));
    expect(await problems(file)).toEqual([]);
  });
});
