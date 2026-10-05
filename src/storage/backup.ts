// Export and replace-only import (ARCHITECTURE.md §7).

import { z } from 'zod';
import { checkDataSet } from '../domain/integrity.ts';
import {
  DEVICE_SETTINGS,
  type DataSet,
  type SchedulerConfigRecord,
  type SettingRecord,
  type Settings,
} from '../domain/records.ts';
import { SCHEDULER_CONFIGS } from '../domain/schedulerConfig.ts';
import { MAX_REPLY_LENGTH } from '../domain/scoreParser.ts';
import { canonicalJson, sha256Hex } from '../domain/snapshot.ts';
import { TABLES, type PremiseDb } from './db.ts';

export const EXPORT_SCHEMA_VERSION = 1;
/** Largest import file, in bytes (UTF-8 for text). */
export const MAX_IMPORT_BYTES = 50 * 1024 * 1024;
export const IMPORT_TOO_LARGE = 'The file is larger than 50 MB.';

/** True when a file of `size` bytes is too large to import; check File.size before reading it. */
export function importTooLarge(size: number): boolean {
  return size > MAX_IMPORT_BYTES;
}

/** UTF-8 byte length of a string, without allocating an encoded copy. */
export function utf8Length(text: string): number {
  let bytes = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c < 0x80) bytes += 1;
    else if (c < 0x800) bytes += 2;
    else if (c >= 0xd800 && c <= 0xdbff && i + 1 < text.length) {
      const d = text.charCodeAt(i + 1);
      if (d >= 0xdc00 && d <= 0xdfff) {
        bytes += 4;
        i++;
      } else bytes += 3;
    } else bytes += 3;
  }
  return bytes;
}

/** A canonical UTC timestamp, exactly as Date.prototype.toISOString writes it. */
export function isCanonicalTimestamp(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(s)) return false;
  const t = new Date(s);
  return !Number.isNaN(t.getTime()) && t.toISOString() === s;
}

const iso = z.string().refine(isCanonicalTimestamp, 'must be a UTC timestamp like 2026-10-04T12:00:00.000Z');
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

/** Known settings, validated by key; the runtime trusts these shapes. */
const settingSchemas: Record<keyof Settings, z.ZodType> = {
  gradingMode: z.enum(['batch', 'per-exercise']),
  batchSize: int.min(1),
  finalWeeks: z.boolean(),
  timerEnabled: z.boolean(),
  timerSeconds: int.min(1),
  dailyReviewCap: int.min(0),
  focus: z.strictObject({ tag: z.string().nullable(), note: z.string() }),
  disclosureSeen: z.boolean(),
  lastExportAt: iso.nullable(),
  persistGranted: z.boolean().nullable(),
};

const setting = z.strictObject({ key: z.string(), value: z.unknown() }).superRefine((s, ctx) => {
  const schema = Object.hasOwn(settingSchemas, s.key)
    ? (settingSchemas[s.key as keyof Settings] as z.ZodType)
    : undefined;
  if (!schema) {
    ctx.addIssue({ code: 'custom', message: `unknown setting ${s.key}` });
    return;
  }
  const r = schema.safeParse(s.value);
  if (!r.success) ctx.addIssue({ code: 'custom', message: `setting ${s.key}: ${r.error.issues[0]?.message}` });
});

const exportSchema = z.strictObject({
  app: z.literal('premise'),
  schemaVersion: z.literal(EXPORT_SCHEMA_VERSION),
  exportedAt: iso,
  appVersion: z.string(),
  schedulerConfigs: z.record(z.string(), z.record(z.string(), z.unknown())),
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
      raw: z.string().max(MAX_REPLY_LENGTH),
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
      cardBefore: z.strictObject({ ...card, schedulerVersion: z.string() }).nullable(),
      cardAfter: z.strictObject(card),
      appliedAt: iso,
      seq: int.min(1),
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
  settings: z.array(setting),
});

/**
 * The export file: every table except `schedulerConfigs`, which travels as a map from version to
 * configuration covering every version the file references. Device-local settings are left out.
 */
export type ExportFile = Omit<DataSet, 'schedulerConfigs'> & {
  app: 'premise';
  schemaVersion: number;
  exportedAt: string;
  appVersion: string;
  schedulerConfigs: Record<string, Record<string, unknown>>;
};

const isDeviceSetting = (s: SettingRecord) => (DEVICE_SETTINGS as readonly string[]).includes(s.key);

function referencedVersions(data: Pick<DataSet, 'cards' | 'reviewLogs'>): string[] {
  const versions = new Set<string>();
  for (const c of data.cards) versions.add(c.schedulerVersion);
  for (const l of data.reviewLogs) {
    versions.add(l.schedulerVersion);
    if (l.cardBefore) versions.add(l.cardBefore.schedulerVersion);
  }
  return [...versions].sort();
}

/** JSON.parse can produce Infinity from an exponent such as 1e400, including deep in unknown configs. */
function finiteJsonNumbers(value: unknown): boolean {
  const pending: unknown[] = [value];
  const seen = new Set<object>();
  while (pending.length) {
    const item = pending.pop();
    if (typeof item === 'number' && !Number.isFinite(item)) return false;
    if (item !== null && typeof item === 'object' && !seen.has(item)) {
      seen.add(item);
      for (const child of Object.values(item)) pending.push(child);
    }
  }
  return true;
}

export async function exportData(db: PremiseDb, now: string, appVersion: string): Promise<ExportFile> {
  return db.transaction(
    'r',
    TABLES.map((t) => db.table(t)),
    async () => {
      const data = Object.fromEntries(
        await Promise.all(TABLES.map(async (t) => [t, await db.table(t).toArray()] as const)),
      ) as unknown as DataSet;
      const stored = new Map(data.schedulerConfigs.map((c) => [c.version, c.config]));
      const schedulerConfigs = Object.create(null) as ExportFile['schedulerConfigs'];
      for (const v of referencedVersions(data)) {
        const config = Object.hasOwn(SCHEDULER_CONFIGS, v) ? SCHEDULER_CONFIGS[v] : stored.get(v);
        if (!config) throw new Error(`Scheduler version ${v} has no stored configuration.`);
        if (!finiteJsonNumbers(config)) throw new Error(`Scheduler version ${v} has non-finite configuration numbers.`);
        schedulerConfigs[v] = JSON.parse(JSON.stringify(config)) as Record<string, unknown>;
      }
      const { schedulerConfigs: _table, settings, ...rest } = data;
      return {
        app: 'premise',
        schemaVersion: EXPORT_SCHEMA_VERSION,
        exportedAt: now,
        appVersion,
        schedulerConfigs,
        ...rest,
        settings: settings.filter((s) => !isDeviceSetting(s)),
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

export type ImportCheck = { ok: true; data: DataSet; summary: ImportSummary } | { ok: false; problems: string[] };

/** Checks a chosen file's size before reading it, then validates its text (checkImport). */
export async function checkImportFile(file: Blob): Promise<ImportCheck> {
  if (importTooLarge(file.size)) return { ok: false, problems: [IMPORT_TOO_LARGE] };
  return checkImport(await file.text());
}

/**
 * Validates an export file's text: size in bytes, shape, version, canonical timestamps, known
 * settings, snapshot hashes, scheduler configurations and every cross-table rule. Returns the
 * data set to store: device-local settings dropped, configurations of versions this app does not
 * know kept as `schedulerConfigs` records.
 */
export async function checkImport(text: string): Promise<ImportCheck> {
  if (importTooLarge(utf8Length(text))) return { ok: false, problems: [IMPORT_TOO_LARGE] };
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
  const file = parsed.data as unknown as ExportFile;
  const problems: string[] = [];
  // Zod's record parser omits an own "__proto__" key. Keep validated JSON keys in a null-prototype
  // map so unknown scheduler versions and their configurations survive import and export exactly.
  const rawConfigs = (json as ExportFile).schedulerConfigs;
  const schedulerMap = Object.create(null) as ExportFile['schedulerConfigs'];
  for (const [version, config] of Object.entries(rawConfigs)) {
    if (config === null || typeof config !== 'object' || Array.isArray(config)) {
      problems.push(`scheduler ${version}: configuration must be an object`);
    } else {
      schedulerMap[version] = config;
    }
  }
  file.schedulerConfigs = schedulerMap;
  for (const s of file.snapshots) {
    const { hash, firstSeenAt: _seen, ...payload } = s;
    if ((await sha256Hex(canonicalJson(payload))) !== hash)
      problems.push(`snapshot ${hash.slice(0, 12)}: hash does not match its content`);
  }
  const referenced = referencedVersions(file);
  for (const v of referenced) {
    if (!Object.hasOwn(file.schedulerConfigs, v)) problems.push(`scheduler ${v}: configuration missing from the file`);
  }
  const schedulerConfigs: SchedulerConfigRecord[] = [];
  for (const [v, config] of Object.entries(file.schedulerConfigs)) {
    if (!finiteJsonNumbers(config)) {
      problems.push(`scheduler ${v}: configuration has a non-finite number`);
      continue;
    }
    const known = Object.hasOwn(SCHEDULER_CONFIGS, v) ? SCHEDULER_CONFIGS[v] : undefined;
    if (known) {
      let agrees: boolean;
      try {
        agrees = canonicalJson(config) === canonicalJson(known);
      } catch {
        problems.push(`scheduler ${v}: configuration cannot be validated`);
        continue;
      }
      if (!agrees) {
        problems.push(`scheduler ${v}: configuration differs from this app's definition`);
      }
    } else if (referenced.includes(v)) {
      schedulerConfigs.push({ version: v, config });
    }
  }
  const {
    app: _app,
    schemaVersion: _v,
    exportedAt: _at,
    appVersion: _appVersion,
    schedulerConfigs: _map,
    settings,
    ...tables
  } = file;
  const data: DataSet = { ...tables, schedulerConfigs, settings: settings.filter((s) => !isDeviceSetting(s)) };
  problems.push(...checkDataSet(data));
  if (problems.length) return { ok: false, problems };

  const times = [...data.attempts.map((a) => a.updatedAt), ...data.gradings.map((g) => g.createdAt)].sort();
  return {
    ok: true,
    data,
    summary: {
      counts: Object.fromEntries(TABLES.map((t) => [t, data[t].length])),
      firstActivity: times[0] ?? null,
      lastActivity: times.at(-1) ?? null,
      unknownSchedulers: referenced.filter((v) => !Object.hasOwn(SCHEDULER_CONFIGS, v)),
    },
  };
}

/**
 * Replaces all stored data in one transaction; if any write fails, nothing changes. This
 * device's own `disclosureSeen` and `persistGranted` are kept; any imported values are ignored.
 */
export async function replaceAll(db: PremiseDb, data: DataSet): Promise<void> {
  await db.transaction(
    'rw',
    TABLES.map((t) => db.table(t)),
    async () => {
      const device = (await db.settings.bulkGet([...DEVICE_SETTINGS])).filter((s): s is SettingRecord => !!s);
      for (const t of TABLES) {
        await db.table(t).clear();
        const rows = t === 'settings' ? [...data.settings.filter((s) => !isDeviceSetting(s)), ...device] : data[t];
        await db.table(t).bulkAdd(rows);
      }
    },
  );
}
