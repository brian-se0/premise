// Export and replace-only import (ARCHITECTURE.md §7).

import { z } from 'zod';
import { checkDataSet } from '../domain/integrity.ts';
import type { DataSet } from '../domain/records.ts';
import { SCHEDULER_CONFIGS } from '../domain/schedulerConfig.ts';
import { canonicalJson, sha256Hex } from '../domain/snapshot.ts';
import { TABLES, type PremiseDb } from './db.ts';

export const EXPORT_SCHEMA_VERSION = 1;
export const MAX_IMPORT_BYTES = 50 * 1024 * 1024;

const iso = z.iso.datetime({ offset: true });
const num = z.number().refine(Number.isFinite, 'must be finite');
const int = z.int();
const range = z.strictObject({ start: int.min(0), end: int.min(0) }).nullable();
const anchor = z.strictObject({ points: int, answer: z.string(), note: z.string().optional() });

const card = {
  due: iso,
  stability: num,
  difficulty: num,
  elapsed_days: num,
  scheduled_days: num,
  learning_steps: num,
  reps: int,
  lapses: int,
  state: int,
  last_review: iso.nullable(),
};

const exportSchema = z.strictObject({
  app: z.literal('premise'),
  schemaVersion: z.literal(EXPORT_SCHEMA_VERSION),
  exportedAt: iso,
  appVersion: z.string(),
  schedulerConfigs: z.record(z.string(), z.unknown()),
  snapshots: z.array(
    z.strictObject({
      hash: z.string().regex(/^[0-9a-f]{64}$/),
      firstSeenAt: iso,
      snapshotFormat: z.literal(1),
      taskId: z.string(),
      exerciseId: z.string(),
      kind: z.enum(['argument', 'passage']),
      skill: z.string(),
      difficulty: int,
      stimulus: z.string(),
      credit: z.string().nullable(),
      prompt: z.string(),
      max: int.min(1),
      reference: z.string(),
      accept: z.string().nullable(),
      disqualifiers: z.array(z.string()),
      rubric: z.array(z.string()),
      anchors: z.array(anchor),
      allowedTags: z.array(z.string()),
    }),
  ),
  sessions: z.array(
    z.strictObject({
      id: z.string(),
      entries: z.array(z.strictObject({ taskId: z.string(), attemptId: z.string().nullable() })),
      cursor: int.min(0),
      createdAt: iso,
      endedAt: iso.nullable(),
      mode: z.enum(['today', 'new', 'library', 'retry']),
    }),
  ),
  attempts: z.array(
    z.strictObject({
      id: z.string(),
      sessionId: z.string(),
      taskId: z.string(),
      snapshotHash: z.string(),
      answer: z.string(),
      state: z.enum(['draft', 'submitted', 'skipped', 'discarded']),
      kind: z.enum(['new', 'review', 'coached']),
      stimulusSeenBefore: z.boolean(),
      ratingChoice: z.enum(['good', 'hard', 'easy']),
      requestId: z.string().nullable(),
      currentGradingId: z.string().nullable(),
      revision: int.min(0),
      startedAt: iso,
      submittedAt: iso.nullable(),
      updatedAt: iso,
      elapsedSeconds: num.nullable(),
    }),
  ),
  requests: z.array(
    z.strictObject({
      id: z.string(),
      label: z.string(),
      rows: z.record(z.string(), z.string()),
      snapshots: z.record(z.string(), z.string()),
      fence: z.string(),
      promptVersion: z.string(),
      promptText: z.string().nullable(),
      createdAt: iso,
      status: z.enum(['open', 'closed', 'abandoned']),
    }),
  ),
  replies: z.array(
    z.strictObject({
      id: z.string(),
      requestId: z.string(),
      raw: z.string(),
      pastedAt: iso,
      parserVersion: int,
      selectedBlock: range,
      parseOutcome: z.enum(['clean', 'recoverable', 'manual']),
    }),
  ),
  gradings: z.array(
    z.strictObject({
      id: z.string(),
      attemptId: z.string(),
      requestId: z.string(),
      replyId: z.string().nullable(),
      opId: z.string(),
      score: int.nullable(),
      max: int,
      tags: z.array(z.string()),
      status: z.enum(['accepted', 'needs-review', 'superseded']),
      source: z.enum(['parsed', 'manual', 'self']),
      disqualified: z.boolean(),
      feedbackRange: range,
      createdAt: iso,
    }),
  ),
  reviewLogs: z.array(
    z.strictObject({
      id: z.string(),
      taskId: z.string(),
      attemptId: z.string(),
      gradingId: z.string(),
      opId: z.string(),
      rating: int,
      ratingPolicy: z.string(),
      schedulerVersion: z.string(),
      reviewedAt: iso,
      cardBefore: z.strictObject(card).nullable(),
      cardAfter: z.strictObject(card),
      appliedAt: iso,
      undone: z.boolean(),
    }),
  ),
  cards: z.array(z.strictObject({ taskId: z.string(), schedulerVersion: z.string(), ...card })),
  taskStates: z.array(
    z.strictObject({
      taskId: z.string(),
      suspended: z.boolean(),
      notBefore: z.iso.date().nullable(),
    }),
  ),
  flags: z.array(
    z.strictObject({
      id: z.string(),
      attemptId: z.string(),
      snapshotHash: z.string(),
      category: z.enum(['unfair-grade', 'content-problem', 'other']),
      note: z.string(),
      createdAt: iso,
    }),
  ),
  operations: z.array(
    z.strictObject({
      opId: z.string(),
      name: z.string(),
      affectedIds: z.array(z.string()),
      resultingRevisions: z.record(z.string(), int),
      result: z.unknown(),
      createdAt: iso,
    }),
  ),
  settings: z.array(z.strictObject({ key: z.string(), value: z.unknown() })),
});

export type ExportFile = DataSet & {
  app: 'premise';
  schemaVersion: number;
  exportedAt: string;
  appVersion: string;
  schedulerConfigs: Record<string, unknown>;
};

export async function exportData(db: PremiseDb, now: string, appVersion: string): Promise<ExportFile> {
  return db.transaction(
    'r',
    TABLES.map((t) => db.table(t)),
    async () => {
      const data = Object.fromEntries(
        await Promise.all(TABLES.map(async (t) => [t, await db.table(t).toArray()] as const)),
      ) as unknown as DataSet;
      const versions = new Set([...data.cards, ...data.reviewLogs].map((r) => r.schedulerVersion));
      const schedulerConfigs = Object.fromEntries(
        [...versions].filter((v) => SCHEDULER_CONFIGS[v]).map((v) => [v, SCHEDULER_CONFIGS[v]]),
      );
      return {
        app: 'premise',
        schemaVersion: EXPORT_SCHEMA_VERSION,
        exportedAt: now,
        appVersion,
        schedulerConfigs,
        ...data,
      };
    },
  );
}

export interface ImportSummary {
  counts: Record<string, number>;
  firstActivity: string | null;
  lastActivity: string | null;
  unknownSchedulers: string[];
}

export type ImportCheck = { ok: true; data: ExportFile; summary: ImportSummary } | { ok: false; problems: string[] };

/** Validates an export file's text: shape, version, snapshot hashes and every cross-table rule. */
export async function checkImport(text: string): Promise<ImportCheck> {
  if (text.length > MAX_IMPORT_BYTES) return { ok: false, problems: ['The file is larger than 50 MB.'] };
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, problems: ['The file is not valid JSON.'] };
  }
  const version = (json as { schemaVersion?: unknown } | null)?.schemaVersion;
  if (typeof version === 'number' && version > EXPORT_SCHEMA_VERSION) {
    return { ok: false, problems: ['This file comes from a newer version of Premise. Update the app first.'] };
  }
  const parsed = exportSchema.safeParse(json);
  if (!parsed.success) {
    return {
      ok: false,
      problems: parsed.error.issues.slice(0, 20).map((i) => `${i.path.map(String).join('.')}: ${i.message}`),
    };
  }
  const data = parsed.data as unknown as ExportFile;
  const problems: string[] = [];
  for (const s of data.snapshots) {
    const { hash, firstSeenAt: _seen, ...payload } = s;
    if ((await sha256Hex(canonicalJson(payload))) !== hash)
      problems.push(`snapshot ${hash.slice(0, 12)}: hash does not match its content`);
  }
  problems.push(...checkDataSet(data));
  if (problems.length) return { ok: false, problems };

  const times = [...data.attempts.map((a) => a.updatedAt), ...data.gradings.map((g) => g.createdAt)].sort();
  const used = new Set([...data.cards, ...data.reviewLogs].map((r) => r.schedulerVersion));
  return {
    ok: true,
    data,
    summary: {
      counts: Object.fromEntries(TABLES.map((t) => [t, data[t].length])),
      firstActivity: times[0] ?? null,
      lastActivity: times.at(-1) ?? null,
      unknownSchedulers: [...used].filter((v) => !SCHEDULER_CONFIGS[v]),
    },
  };
}

/** Replaces all stored data in one transaction. */
export async function replaceAll(db: PremiseDb, data: DataSet): Promise<void> {
  await db.transaction(
    'rw',
    TABLES.map((t) => db.table(t)),
    async () => {
      for (const t of TABLES) {
        await db.table(t).clear();
        await db.table(t).bulkAdd(data[t]);
      }
    },
  );
}
