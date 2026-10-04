// Stored record shapes, storage schema v1 (docs/ARCHITECTURE.md §5).
// Timestamps are UTC ISO 8601 strings; local dates are YYYY-MM-DD.

import type { SnapshotPayload } from './types.ts';

export interface Range {
  /** UTF-16 offsets into the reply's raw text, start inclusive, end exclusive. */
  start: number;
  end: number;
}

export interface SnapshotRecord extends SnapshotPayload {
  hash: string;
  firstSeenAt: string;
}

export interface SessionEntry {
  taskId: string;
  attemptId: string | null;
}

export interface SessionRecord {
  id: string;
  entries: SessionEntry[];
  cursor: number;
  createdAt: string;
  endedAt: string | null;
  /** How the session was planned, for display. */
  mode: 'today' | 'new' | 'library' | 'retry';
}

export type AttemptState = 'draft' | 'submitted' | 'skipped' | 'discarded';
export type AttemptKind = 'new' | 'review' | 'coached';
export type RatingChoice = 'good' | 'hard' | 'easy';

export interface AttemptRecord {
  id: string;
  sessionId: string;
  taskId: string;
  snapshotHash: string;
  answer: string;
  state: AttemptState;
  kind: AttemptKind;
  stimulusSeenBefore: boolean;
  ratingChoice: RatingChoice;
  requestId: string | null;
  currentGradingId: string | null;
  revision: number;
  startedAt: string;
  submittedAt: string | null;
  updatedAt: string;
  /** Seconds from opening the task to submitting it (final-weeks timer; recorded, never graded). */
  elapsedSeconds: number | null;
}

export type RequestStatus = 'open' | 'closed' | 'abandoned';

export interface RequestRecord {
  id: string;
  label: string;
  /** Ordered row id → attempt id. */
  rows: Record<string, string>;
  /** Row id → snapshot hash. */
  snapshots: Record<string, string>;
  fence: string;
  promptVersion: string;
  promptText: string | null;
  createdAt: string;
  status: RequestStatus;
}

export type ParseOutcome = 'clean' | 'recoverable' | 'manual';

export interface ReplyRecord {
  id: string;
  requestId: string;
  raw: string;
  pastedAt: string;
  parserVersion: number;
  selectedBlock: Range | null;
  parseOutcome: ParseOutcome;
}

export type GradingStatus = 'accepted' | 'needs-review' | 'superseded';
export type GradingSource = 'parsed' | 'manual' | 'self';

export interface GradingRecord {
  id: string;
  attemptId: string;
  requestId: string;
  replyId: string | null;
  opId: string;
  score: number | null;
  max: number;
  tags: string[];
  status: GradingStatus;
  source: GradingSource;
  disqualified: boolean;
  feedbackRange: Range | null;
  createdAt: string;
}

/** ts-fsrs card fields, dates as ISO strings. */
export interface CardFields {
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number;
  last_review: string | null;
}

export interface CardRecord extends CardFields {
  taskId: string;
  schedulerVersion: string;
}

export interface ReviewLogRecord {
  id: string;
  taskId: string;
  attemptId: string;
  gradingId: string;
  opId: string;
  rating: number;
  ratingPolicy: string;
  schedulerVersion: string;
  reviewedAt: string;
  cardBefore: CardFields | null;
  cardAfter: CardFields;
  /** When the review was applied; orders reviews of one card (reviewedAt can be out of order). */
  appliedAt: string;
  undone: boolean;
}

export interface TaskStateRecord {
  taskId: string;
  suspended: boolean;
  /** Local date (YYYY-MM-DD) before which the task is not offered. */
  notBefore: string | null;
}

export type FlagCategory = 'unfair-grade' | 'content-problem' | 'other';

export interface FlagRecord {
  id: string;
  attemptId: string;
  snapshotHash: string;
  category: FlagCategory;
  note: string;
  createdAt: string;
}

export interface OperationRecord {
  opId: string;
  name: string;
  affectedIds: string[];
  resultingRevisions: Record<string, number>;
  result: unknown;
  createdAt: string;
}

export interface SettingRecord {
  key: string;
  value: unknown;
}

export interface Settings {
  gradingMode: 'batch' | 'per-exercise';
  batchSize: number;
  finalWeeks: boolean;
  timerEnabled: boolean;
  timerSeconds: number;
  dailyReviewCap: number;
  focus: { tag: string | null; note: string };
  disclosureSeen: boolean;
  lastExportAt: string | null;
  persistGranted: boolean | null;
}

export const DEFAULT_SETTINGS: Settings = {
  gradingMode: 'batch',
  batchSize: 4,
  finalWeeks: false,
  timerEnabled: false,
  timerSeconds: 120,
  dailyReviewCap: 6,
  focus: { tag: null, note: '' },
  disclosureSeen: false,
  lastExportAt: null,
  persistGranted: null,
};

/** Everything the app stores; the export file carries these arrays (ARCHITECTURE.md §7). */
export interface DataSet {
  snapshots: SnapshotRecord[];
  sessions: SessionRecord[];
  attempts: AttemptRecord[];
  requests: RequestRecord[];
  replies: ReplyRecord[];
  gradings: GradingRecord[];
  reviewLogs: ReviewLogRecord[];
  cards: CardRecord[];
  taskStates: TaskStateRecord[];
  flags: FlagRecord[];
  operations: OperationRecord[];
  settings: SettingRecord[];
}
