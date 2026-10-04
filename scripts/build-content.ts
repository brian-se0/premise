// Validates content and writes src/generated/content.json (docs/EXERCISE_FORMAT.md §4).
//
//   npm run content                 all exercises, drafts included (development)
//   npm run content -- --production published and retired exercises only
//   npm run content -- --lock       also record published tasks in content/published-tasks.json

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundleExercises, CONTENT_DIR, LEDGER_FILE, readContentFiles, validateContent } from './content.ts';

const args = new Set(process.argv.slice(2));
const production = args.has('--production');
const lock = args.has('--lock');

const result = await validateContent(readContentFiles());

for (const w of result.warnings) console.warn(`warning: ${w}`);
for (const e of result.errors) console.error(`error: ${e}`);
if (!lock)
  for (const e of result.unrecorded) console.error(`error: ${e}; run \`npm run content -- --lock\` to record it`);
const blocking = result.errors.length + (lock ? 0 : result.unrecorded.length);
if (blocking > 0) {
  console.error(`\n${blocking} content error(s).`);
  process.exit(1);
}

if (lock) {
  writeFileSync(join(CONTENT_DIR, LEDGER_FILE), JSON.stringify(result.ledger, null, 2) + '\n');
  console.log(`Recorded ${Object.keys(result.ledger.tasks).length} published task(s) in content/${LEDGER_FILE}.`);
}

const exercises = bundleExercises(result.exercises, production);
const outDir = fileURLToPath(new URL('../src/generated/', import.meta.url));
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'content.json'), JSON.stringify({ exercises, taxonomy: result.taxonomy }, null, 2) + '\n');

for (const e of result.exercises) console.log(`${e.id}  ${e.status.padEnd(9)} revision ${e.revision}`);
console.log(
  `\nWrote ${exercises.length} of ${result.exercises.length} exercise(s)${production ? ' (production: drafts excluded)' : ''}.`,
);
