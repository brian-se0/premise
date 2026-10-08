// Shared loaders for the pilot scripts: the answer set and the task snapshots it was scored under.

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { loadExercises } from '../scripts/content.ts';
import { buildSnapshot, canonicalJson, sha256Hex } from '../src/domain/snapshot.ts';
import type { Snapshot } from '../src/domain/types.ts';
import type { AnswerEntry } from './metrics.ts';
import { REGISTRATION, type Registration } from './registration.ts';

export const ANSWERS_DIR = join('pilot', 'answers');
/** The owner's first answers to draft exercises: not part of the check (pilot/README.md). */
const NOT_IN_CHECK = new Set(['walkthrough.yaml']);

/** The snapshots of the tasks registered for the grading check, as they were scored (pilot/README.md). */
export const FROZEN_SNAPSHOTS = join('tests', 'fixtures', 'pilot', 'snapshots.json');

/**
 * Every task's current snapshot, except that each task registered for the grading check keeps the snapshot
 * its answers were scored under, so a later key fix leaves the check's prompts and results reproducible.
 */
export async function loadSnapshots(frozen = FROZEN_SNAPSHOTS): Promise<Map<string, Snapshot>> {
  const snapshots = new Map<string, Snapshot>();
  for (const exercise of await loadExercises()) {
    for (const task of exercise.tasks) {
      const snap = await buildSnapshot(exercise, task);
      snapshots.set(snap.taskId, snap);
    }
  }
  for (const snap of await loadFrozenSnapshots(frozen)) snapshots.set(snap.taskId, snap);
  return snapshots;
}

/** Reads the saved snapshots, refusing any that no longer hashes to its saved hash or isn't the registered key. */
export async function loadFrozenSnapshots(
  path = FROZEN_SNAPSHOTS,
  registered: Registration = REGISTRATION,
): Promise<Snapshot[]> {
  const saved = JSON.parse(readFileSync(path, 'utf8')) as Snapshot[];
  const problems: string[] = [];
  for (const snap of saved) {
    const { hash, ...payload } = snap;
    if ((await sha256Hex(canonicalJson(payload))) !== hash) problems.push(`${snap.taskId} no longer hashes to its saved hash`);
    if (registered.tasks[snap.taskId] !== hash) problems.push(`${snap.taskId} is not the registered key`);
  }
  const savedIds = new Set(saved.map((s) => s.taskId));
  const missing = Object.keys(registered.tasks).filter((t) => !savedIds.has(t));
  if (missing.length) problems.push(`no saved snapshot for ${missing.join(', ')}`);
  if (problems.length) throw new Error(`${path} does not hold the registered snapshots: ${problems.join('; ')}.`);
  return saved;
}

const isScore = (v: unknown, max: number): v is number => Number.isInteger(v) && (v as number) >= 0 && (v as number) <= max;

/** Reads and checks every answer file in the check. Throws on the first problem, naming the answer. */
export function loadAnswers(snapshots: ReadonlyMap<string, Snapshot>, dir = ANSWERS_DIR): Map<string, AnswerEntry> {
  const answers = new Map<string, AnswerEntry>();
  const files = readdirSync(dir).filter((f) => f.endsWith('.yaml') && !NOT_IN_CHECK.has(f));
  for (const file of files.sort()) {
    const list = parse(readFileSync(join(dir, file), 'utf8')) as AnswerEntry[];
    if (!Array.isArray(list)) throw new Error(`${file}: expected a list of answers`);
    for (const a of list) {
      const where = `${file}: ${a?.id ?? '(no id)'}`;
      if (typeof a.id !== 'string' || answers.has(a.id)) throw new Error(`${where}: missing or duplicate id`);
      const snap = snapshots.get(a.task);
      if (!snap) throw new Error(`${where}: unknown task ${a.task}`);
      if (typeof a.answer !== 'string') throw new Error(`${where}: answer must be text`);
      if (typeof a.holdout !== 'boolean') throw new Error(`${where}: holdout must be true or false`);
      for (const key of ['gold', 'second', 'settled'] as const) {
        if ((key === 'gold' || a[key] !== undefined) && !isScore(a[key], snap.max)) {
          throw new Error(`${where}: ${key} must be a whole number from 0 to ${snap.max}`);
        }
      }
      if (a.acceptable !== undefined && (!Array.isArray(a.acceptable) || a.acceptable.length < 2 || !a.acceptable.every((s) => isScore(s, snap.max)))) {
        throw new Error(`${where}: acceptable must list two or more scores from 0 to ${snap.max}`);
      }
      if ((a.settled !== undefined || a.acceptable !== undefined) && !a.settlement) {
        throw new Error(`${where}: a settled score or acceptable set needs a settlement reason`);
      }
      if (a.settled !== undefined && a.acceptable !== undefined) throw new Error(`${where}: settled or acceptable, not both`);
      answers.set(a.id, a);
    }
  }
  // Once second scoring is recorded, every answer has a second score.
  const unscored = [...answers.values()].filter((a) => a.second === undefined);
  if (unscored.length > 0 && unscored.length < answers.size) {
    throw new Error(`${unscored.map((a) => a.id).join(', ')}: no second score, though other answers have one`);
  }
  // The split is by whole exercise (§9).
  const split = new Map<string, boolean>();
  for (const a of answers.values()) {
    const exercise = snapshots.get(a.task)!.exerciseId;
    if (split.has(exercise) && split.get(exercise) !== a.holdout) {
      throw new Error(`${a.id}: every answer to ${exercise} must have the same holdout value`);
    }
    split.set(exercise, a.holdout);
  }
  return answers;
}

/**
 * SHA-256 over Claude's scores and the answers they score, recorded before the blind second scorer
 * starts (docs/GRADING_PROTOCOL.md §9): one JSON line [id, task, answer, gold] per answer, sorted by id.
 * Later fields (second, settled, acceptable) do not change it.
 */
export function goldDigest(answers: ReadonlyMap<string, AnswerEntry>): string {
  return digest(answers, (a) => [a.id, a.task, a.answer, a.gold]);
}

/**
 * SHA-256 over the final labels, recorded before the first chatbot reply is saved: one JSON line
 * [id, task, answer, gold, second, settled, acceptable] per answer, sorted by id, with null for an
 * absent field and the acceptable set sorted.
 */
export function labelDigest(answers: ReadonlyMap<string, AnswerEntry>): string {
  return digest(answers, (a) => [
    a.id,
    a.task,
    a.answer,
    a.gold,
    a.second ?? null,
    a.settled ?? null,
    a.acceptable === undefined ? null : [...a.acceptable].sort((x, y) => x - y),
  ]);
}

function digest(answers: ReadonlyMap<string, AnswerEntry>, line: (a: AnswerEntry) => unknown[]): string {
  const lines = [...answers.values()].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)).map((a) => JSON.stringify(line(a)));
  return createHash('sha256').update(lines.join('\n') + '\n').digest('hex');
}

/**
 * Refuses an answer set or key that no longer matches what was registered before the first reply
 * (pilot/registration.ts): a changed gold score, final label or task key.
 */
export function checkRegistration(
  answers: ReadonlyMap<string, AnswerEntry>,
  snapshots: ReadonlyMap<string, Snapshot>,
  registered: Registration = REGISTRATION,
): void {
  const problems: string[] = [];
  if (goldDigest(answers) !== registered.gold) problems.push("Claude's scores or the answers differ from the pre-registered digest");
  if (labelDigest(answers) !== registered.labels) problems.push('the final labels differ from the registered digest');
  for (const task of new Set([...answers.values()].map((a) => a.task))) {
    if (snapshots.get(task)?.hash !== registered.tasks[task]) problems.push(`the key of ${task} differs from the one its answers were scored under`);
  }
  if (problems.length) {
    throw new Error(`The grading check's registered inputs changed (pilot/registration.ts): ${problems.join('; ')}.`);
  }
}
