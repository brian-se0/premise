import { formatCredit } from './credit.ts';
import type { Exercise, Snapshot, SnapshotPayload, Task } from './types.ts';

/** Tags every task allows in addition to its own likely errors (docs/GRADING_PROTOCOL.md §3). */
export const UNIVERSAL_TAGS = ['incomplete', 'misread-stimulus', 'irrelevant', 'no-reasoning'] as const;

export function allowedTags(task: Task): string[] {
  return [...new Set([...task.likely_errors, ...UNIVERSAL_TAGS])];
}

export function taskId(exercise: Exercise, task: Task): string {
  return `${exercise.id}.${task.key}`;
}

export function buildSnapshotPayload(exercise: Exercise, task: Task): SnapshotPayload {
  return {
    snapshotFormat: 1,
    taskId: taskId(exercise, task),
    exerciseId: exercise.id,
    kind: exercise.kind,
    skill: task.skill,
    difficulty: task.difficulty ?? exercise.difficulty,
    stimulus: exercise.stimulus,
    credit: formatCredit(exercise.source),
    prompt: task.prompt,
    max: task.max,
    reference: task.reference,
    accept: task.accept ?? null,
    disqualifiers: task.disqualifiers ?? [],
    rubric: task.rubric,
    anchors: task.anchors.map((a) => (a.note === undefined ? { points: a.points, answer: a.answer } : { ...a })),
    allowedTags: allowedTags(task),
  };
}

/**
 * Deterministic JSON: object keys sorted, no insignificant whitespace, arrays in order,
 * strings exactly as given. Undefined object members are omitted.
 */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('Non-finite number');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(',')}}`;
}

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function buildSnapshot(exercise: Exercise, task: Task): Promise<Snapshot> {
  const payload = buildSnapshotPayload(exercise, task);
  return { ...payload, hash: await sha256Hex(canonicalJson(payload)) };
}
