// Content types for exercise schemas 3 and 4 (docs/EXERCISE_FORMAT.md §3).

export type SourceType = 'original' | 'public-domain' | 'cc-by';

export interface Source {
  type: SourceType;
  title: string | null;
  creator: string | null;
  year: number | null;
  locator: string | null;
  license_uri: string | null;
  attribution: string | null;
  rights_basis: string | null;
  modifications: string | null;
}

export interface Anchor {
  points: number;
  answer: string;
  note?: string;
}

export interface Task {
  key: string;
  status: 'active' | 'retired';
  skill: string;
  /** Overrides the exercise's difficulty for this task. */
  difficulty?: number;
  difficulty_note?: string | null;
  prompt: string;
  max: number;
  reference: string;
  accept?: string;
  disqualifiers?: string[];
  rubric: string[];
  anchors: Anchor[];
  likely_errors: string[];
  /** Schema 4: the reasoning skeleton shown after grading (docs/METHOD.md §5). Never in a snapshot. */
  form?: string;
}

export interface Exercise {
  schema: 3 | 4;
  id: string;
  status: 'draft' | 'published' | 'retired';
  kind: 'argument' | 'passage';
  difficulty: number;
  topics: string[];
  source: Source;
  contributors: string[];
  ai_assistance: { used: boolean; notes: string | null };
  approved_by: string | null;
  approved_at: string | null;
  approved_revision: string | null;
  tasks: Task[];
  /** The Markdown body: the stimulus shown to the student. */
  stimulus: string;
}

/** Snapshot payload, format 1 (docs/ARCHITECTURE.md §4.1). */
export interface SnapshotPayload {
  snapshotFormat: 1;
  taskId: string;
  exerciseId: string;
  kind: Exercise['kind'];
  skill: string;
  difficulty: number;
  stimulus: string;
  credit: string | null;
  prompt: string;
  max: number;
  reference: string;
  accept: string | null;
  disqualifiers: string[];
  rubric: string[];
  anchors: Anchor[];
  allowedTags: string[];
}

export interface Snapshot extends SnapshotPayload {
  hash: string;
}

/** An exercise as emitted by the content build, with its content revision. */
export interface BuiltExercise extends Exercise {
  revision: string;
}

export interface TaxonomyData {
  skills: Record<string, { label: string; open_ended: boolean }>;
  error_tags: Record<string, string>;
}

/** src/generated/content.json */
export interface ContentBundle {
  exercises: BuiltExercise[];
  taxonomy: TaxonomyData;
}
