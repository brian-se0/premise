// Loads exercises from content/exercises. The full schema validation (Zod) arrives in M1;
// this loader only parses front matter and checks what the prompt builder relies on.

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import type { Exercise, Task } from '../src/domain/types.ts';

export const CONTENT_DIR = new URL('../content/', import.meta.url).pathname;

export function parseExerciseFile(text: string, fileName: string): Exercise {
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text.replace(/\r\n/g, '\n'));
  if (!match) throw new Error(`${fileName}: missing front matter`);
  const data = parse(match[1]!) as Omit<Exercise, 'stimulus'>;
  const exercise: Exercise = { ...data, stimulus: normalizeBody(match[2]!) };
  check(exercise, fileName);
  return exercise;
}

/** Joins hard-wrapped lines into paragraphs, separated by one blank line. */
function normalizeBody(body: string): string {
  return body
    .trim()
    .split(/\n\s*\n/)
    .map((p) => p.split('\n').map((l) => l.trim()).join(' '))
    .join('\n\n');
}

function check(e: Exercise, fileName: string): void {
  const fail = (msg: string) => {
    throw new Error(`${fileName}: ${msg}`);
  };
  if (e.schema !== 3) fail(`schema must be 3, got ${String(e.schema)}`);
  if (`${e.id}.md` !== fileName) fail(`id ${e.id} does not match file name`);
  const keys = new Set<string>();
  for (const t of e.tasks) {
    if (keys.has(t.key)) fail(`duplicate task key ${t.key}`);
    keys.add(t.key);
    checkTask(t, (m) => fail(`${t.key}: ${m}`));
  }
}

function checkTask(t: Task, fail: (m: string) => void): void {
  if (t.max !== t.rubric.length) fail(`max ${t.max} != ${t.rubric.length} rubric criteria`);
  const points = t.anchors.map((a) => a.points).sort((a, b) => a - b);
  const expected = Array.from({ length: t.max + 1 }, (_, i) => i);
  if (points.join() !== expected.join()) fail(`anchors must cover 0..${t.max} once each`);
}

export function loadExercises(dir = join(CONTENT_DIR, 'exercises')): Exercise[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => parseExerciseFile(readFileSync(join(dir, f), 'utf8'), f));
}
