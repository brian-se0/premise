// Shared loaders for the pilot scripts: the answer set and the current task snapshots.

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { loadExercises } from '../scripts/content.ts';
import { buildSnapshot } from '../src/domain/snapshot.ts';
import type { Snapshot } from '../src/domain/types.ts';
import type { AnswerEntry } from './metrics.ts';

export const ANSWERS_DIR = join('pilot', 'answers');
/** The owner's first answers to draft exercises: not part of the check (pilot/README.md). */
const NOT_IN_CHECK = new Set(['walkthrough.yaml']);

export async function loadSnapshots(): Promise<Map<string, Snapshot>> {
  const snapshots = new Map<string, Snapshot>();
  for (const exercise of await loadExercises()) {
    for (const task of exercise.tasks) {
      const snap = await buildSnapshot(exercise, task);
      snapshots.set(snap.taskId, snap);
    }
  }
  return snapshots;
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
  const lines = [...answers.values()]
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map((a) => JSON.stringify([a.id, a.task, a.answer, a.gold]));
  return createHash('sha256').update(lines.join('\n') + '\n').digest('hex');
}
