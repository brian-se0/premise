// IndexedDB schema v1 (ARCHITECTURE.md §5) via Dexie. v1 is frozen; future table or index
// changes need a new Dexie version and a migration for existing practice data.

import Dexie, { type EntityTable } from 'dexie';
import type {
  AttemptRecord,
  CardRecord,
  FlagRecord,
  GradingRecord,
  OperationRecord,
  ReplyRecord,
  RequestRecord,
  ReviewLogRecord,
  SessionRecord,
  SchedulerConfigRecord,
  SettingRecord,
  SnapshotRecord,
  TaskStateRecord,
} from '../domain/records.ts';

export type PremiseDb = Dexie & {
  snapshots: EntityTable<SnapshotRecord, 'hash'>;
  sessions: EntityTable<SessionRecord, 'id'>;
  attempts: EntityTable<AttemptRecord, 'id'>;
  requests: EntityTable<RequestRecord, 'id'>;
  replies: EntityTable<ReplyRecord, 'id'>;
  gradings: EntityTable<GradingRecord, 'id'>;
  reviewLogs: EntityTable<ReviewLogRecord, 'id'>;
  cards: EntityTable<CardRecord, 'taskId'>;
  taskStates: EntityTable<TaskStateRecord, 'taskId'>;
  flags: EntityTable<FlagRecord, 'id'>;
  operations: EntityTable<OperationRecord, 'opId'>;
  schedulerConfigs: EntityTable<SchedulerConfigRecord, 'version'>;
  settings: EntityTable<SettingRecord, 'key'>;
};

export const TABLES = [
  'snapshots',
  'sessions',
  'attempts',
  'requests',
  'replies',
  'gradings',
  'reviewLogs',
  'cards',
  'taskStates',
  'flags',
  'operations',
  'schedulerConfigs',
  'settings',
] as const;

export type TableName = (typeof TABLES)[number];

export function openDb(name = 'premise'): PremiseDb {
  const db = new Dexie(name) as PremiseDb;
  db.version(1).stores({
    snapshots: 'hash, taskId',
    sessions: 'id, createdAt',
    attempts: 'id, sessionId, taskId, requestId, state',
    requests: 'id, status, createdAt',
    replies: 'id, requestId',
    gradings: 'id, attemptId, requestId',
    reviewLogs: 'id, taskId, attemptId, gradingId, &seq',
    cards: 'taskId',
    taskStates: 'taskId',
    flags: 'id, attemptId',
    operations: 'opId',
    schedulerConfigs: 'version',
    settings: 'key',
  });
  return db;
}
