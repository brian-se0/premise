// M0 pilot: builds grading prompts from a run file with the app's own prompt builder,
// and saves each request as a fixture the app must later reproduce.
//
// Usage: npm run pilot:prompt -- pilot/runs/<run>.yaml
//
// Run file:
//   run: dev-chatgpt-1          # fixture folder name
//   batchSize: 4                # optional
//   items:
//     - id: a001                # answer id from pilot/answers
//       task: arg-0001.flaw
//       answer: The author assumes ...

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { parse } from 'yaml';
import { loadExercises } from '../scripts/content.ts';
import { planRequests, type GradingItem } from '../src/domain/prompt.ts';
import { buildSnapshot } from '../src/domain/snapshot.ts';
import type { Snapshot } from '../src/domain/types.ts';

interface RunFile {
  run: string;
  batchSize?: number;
  items: { id: string; task: string; answer: string }[];
}

const runPath = process.argv[2];
if (!runPath) {
  console.error('Usage: npm run pilot:prompt -- pilot/runs/<run>.yaml');
  process.exit(1);
}
const runFile = parse(readFileSync(runPath, 'utf8')) as RunFile;

const snapshots = new Map<string, Snapshot>();
for (const exercise of loadExercises()) {
  for (const task of exercise.tasks) {
    const snap = await buildSnapshot(exercise, task);
    snapshots.set(snap.taskId, snap);
  }
}

const items: GradingItem[] = runFile.items.map((i) => {
  const snapshot = snapshots.get(i.task);
  if (!snapshot) throw new Error(`Unknown task ${i.task} for answer ${i.id}`);
  return { attemptId: i.id, snapshot, answer: i.answer };
});

const requests = planRequests(items, {
  ...(runFile.batchSize === undefined ? {} : { batchSize: runFile.batchSize }),
  newId: () => crypto.randomUUID(),
  random: Math.random,
});

const outDir = join('tests', 'fixtures', 'pilot', runFile.run || basename(runPath, '.yaml'));
mkdirSync(outDir, { recursive: true });
requests.forEach((req, n) => {
  const name = `request-${String(n + 1).padStart(2, '0')}`;
  writeFileSync(
    join(outDir, `${name}.json`),
    JSON.stringify(
      {
        id: req.id,
        fence: req.fence,
        promptVersion: req.promptVersion,
        rows: req.rows.map((r) => ({ rowId: r.rowId, attemptId: r.attemptId, taskId: r.snapshot.taskId, snapshotHash: r.snapshot.hash, answer: r.answer })),
        selfGradeOnly: req.promptText === null,
      },
      null,
      2,
    ) + '\n',
  );
  if (req.promptText !== null) writeFileSync(join(outDir, `${name}.prompt.txt`), req.promptText);
  console.log(`${name}: ${req.rows.length} rows${req.promptText === null ? ' (self-grading only: too long)' : `, ${req.promptText.length} chars`}`);
});
console.log(`Saved to ${outDir}. Paste each .prompt.txt into the chatbot; save its reply next to it as ${'request-NN.reply.<chatbot>-<n>.txt'}.`);
