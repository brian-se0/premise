// M0 pilot: scores saved chatbot replies against the gold labels and prints the
// docs/GRADING_PROTOCOL.md §9 metrics as Markdown, with the app's own parser (pilot/report.ts).
//
// Usage: npm run pilot:score -- [tests/fixtures/pilot/<run> ...]   (default: every run folder)
//
// Refuses to run when the answer set, its labels or a task's key differ from pilot/registration.ts.

import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadAnswers, loadSnapshots } from './load.ts';
import { buildReport } from './report.ts';

const ROOT = join('tests', 'fixtures', 'pilot');

const snapshots = await loadSnapshots();
const answers = loadAnswers(snapshots);
const folders = process.argv.slice(2).length
  ? process.argv.slice(2)
  : existsSync(ROOT)
    ? readdirSync(ROOT, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => join(ROOT, d.name))
        .sort()
    : [];
console.log(buildReport(folders, answers, snapshots));
