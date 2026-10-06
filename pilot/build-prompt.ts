// M0 pilot: builds grading prompts from a run file with the app's own prompt builder,
// and saves each request as a fixture the app must later reproduce.
//
// Usage: npm run pilot:prompt -- pilot/runs/<run>.yaml
//
// Run file:
//   run: dev-a                  # fixture folder name
//   batchSize: 4                # optional
//   items:                      # in row order
//     - con03                   # an answer id from pilot/answers, or a whole item:
//     - id: a001
//       task: arg-0001.flaw
//       answer: The author assumes ...

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { parse } from 'yaml';
import { planRequests, type GradingItem } from '../src/domain/prompt.ts';
import { checkRegistration, loadAnswers, loadSnapshots } from './load.ts';
import type { AnswerEntry } from './metrics.ts';

type RunItem = string | { id: string; task: string; answer: string };

interface RunFile {
  run: string;
  batchSize?: number;
  items: RunItem[];
}

const runPath = process.argv[2];
if (!runPath) {
  console.error('Usage: npm run pilot:prompt -- pilot/runs/<run>.yaml');
  process.exit(1);
}
const runFile = parse(readFileSync(runPath, 'utf8')) as RunFile;

const outDir = join('tests', 'fixtures', 'pilot', runFile.run || basename(runPath, '.yaml'));
// A rebuild gets new request ids and fences, so replies saved for the old prompts would no longer match.
if (existsSync(outDir) && readdirSync(outDir).some((f) => /^request-\d{2}\./.test(f))) {
  console.error(`${outDir} already holds a built run. Delete the folder first to rebuild it; saved replies would no longer match.`);
  process.exit(1);
}

const snapshots = await loadSnapshots();
const usesAnswerSet = runFile.items.some((i) => typeof i === 'string');
const answers = usesAnswerSet ? loadAnswers(snapshots) : new Map<string, AnswerEntry>();
if (usesAnswerSet) checkRegistration(answers, snapshots);

const items: GradingItem[] = runFile.items.map((i) => {
  const item = typeof i === 'string' ? answers.get(i) : i;
  if (!item) throw new Error(`Unknown answer id ${String(i)}`);
  const snapshot = snapshots.get(item.task);
  if (!snapshot) throw new Error(`Unknown task ${item.task} for answer ${item.id}`);
  return { attemptId: item.id, snapshot, answer: item.answer };
});

const requests = planRequests(items, {
  ...(runFile.batchSize === undefined ? {} : { batchSize: runFile.batchSize }),
  newId: () => crypto.randomUUID(),
  random: Math.random,
});

// Held-out requests mirror real use: one answer per task in a request, and no development answers (§9).
const held = items.filter((i) => answers.get(i.attemptId)?.holdout === true).length;
if (held > 0 && held < items.length) throw new Error('A run must not mix development and held-out answers');
if (held > 0) {
  requests.forEach((req, n) => {
    const tasks = req.rows.map((r) => r.snapshot.taskId);
    if (new Set(tasks).size < tasks.length) {
      throw new Error(`Request ${n + 1} would hold two held-out answers to one task (${tasks.join(', ')}); reorder the run file`);
    }
  });
}

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
