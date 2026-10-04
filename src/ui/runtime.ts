// Browser runtime: the database, operation context (clock, ids, randomness), settings and
// snapshot cache. Everything impure the UI needs lives here.

import { liveQuery } from 'dexie';
import { useEffect, useState } from 'react';
import { content } from '../content.ts';
import { localDate } from '../domain/dates.ts';
import type { PlannerState } from '../domain/planner.ts';
import { DEFAULT_SETTINGS, type Settings } from '../domain/records.ts';
import { buildSnapshot, taskId as idOf } from '../domain/snapshot.ts';
import type { BuiltExercise, Snapshot, Task } from '../domain/types.ts';
import { openDb } from '../storage/db.ts';
import type { OpContext } from '../storage/ops.ts';

export const db = openDb();

function random(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0]! / 2 ** 32;
}

export function ctx(): OpContext {
  return { now: new Date().toISOString(), newId: () => crypto.randomUUID(), random };
}

export function newOpId(): string {
  return crypto.randomUUID();
}

export function today(): string {
  return localDate(new Date());
}

/** Subscribes to an IndexedDB query; re-runs when the data changes, in this tab or another. */
export function useLive<T>(query: () => Promise<T>, deps: unknown[]): T | undefined {
  const [value, setValue] = useState<T>();
  useEffect(() => {
    const sub = liveQuery(query).subscribe({
      next: setValue,
      error: (e: unknown) => console.error(e),
    });
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return value;
}

export async function loadSettings(): Promise<Settings> {
  const rows = await db.settings.toArray();
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...DEFAULT_SETTINGS, ...stored } as Settings;
}

export function useSettings(): Settings | undefined {
  return useLive(loadSettings, []);
}

export async function saveSetting<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
  await db.settings.put({ key, value });
}

export function findTask(taskId: string): { exercise: BuiltExercise; task: Task } | undefined {
  const [exerciseId] = taskId.split('.');
  const exercise = content.exercises.find((e) => e.id === exerciseId);
  const task = exercise?.tasks.find((t) => idOf(exercise, t) === taskId);
  return exercise && task ? { exercise, task } : undefined;
}

const snapshotCache = new Map<string, Promise<Snapshot>>();

/** The current content snapshot of a task (frozen into an attempt when it is opened). */
export function currentSnapshot(taskId: string): Promise<Snapshot> {
  let p = snapshotCache.get(taskId);
  if (!p) {
    const found = findTask(taskId);
    if (!found) return Promise.reject(new Error(`Task ${taskId} is not in this version of the app.`));
    p = buildSnapshot(found.exercise, found.task);
    snapshotCache.set(taskId, p);
  }
  return p;
}

/** Asks the browser to keep storage (ARCHITECTURE.md §8); recorded once. */
export async function requestPersistence(): Promise<void> {
  const s = await loadSettings();
  if (s.persistGranted !== null || !navigator.storage?.persist) return;
  await saveSetting('persistGranted', await navigator.storage.persist());
}

export async function loadPlannerState(): Promise<PlannerState> {
  const [attempts, gradings, cards, taskStates, settings] = await Promise.all([
    db.attempts.toArray(),
    db.gradings.toArray(),
    db.cards.toArray(),
    db.taskStates.toArray(),
    loadSettings(),
  ]);
  return { exercises: content.exercises, attempts, gradings, cards, taskStates, settings, today: today() };
}
