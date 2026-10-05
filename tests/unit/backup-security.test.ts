import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { loadExercises } from '../../scripts/content.ts';
import {
  PROMPT_BUDGET,
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

  it('rejects a stored reply beyond the parser limit', async () => {
    const file = await reviewedFile();
    file.replies.push({
      id: 'large-reply',
      requestId: file.requests[0]!.id,
      raw: 'x'.repeat(MAX_REPLY_LENGTH + 1),
      pastedAt: NOW,
      parserVersion: 1,
      selectedBlock: null,
      parseOutcome: 'manual',
    });
    expect((await problems(file)).join(' ')).toContain('replies');
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
