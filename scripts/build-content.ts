// Validates content and writes src/generated/content.json (docs/EXERCISE_FORMAT.md §4).
//
//   npm run content                 all exercises, drafts included (development)
//   npm run content -- --production published and retired exercises only
//   npm run content -- --lock       also record published tasks in content/published-tasks.json

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONTENT_DIR, LEDGER_FILE, readContentFiles, validateContent } from './content.ts';

const args = new Set(process.argv.slice(2));
const production = args.has('--production');
const lock = args.has('--lock');

const result = await validateContent(readContentFiles());

for (const w of result.warnings) console.warn(`warning: ${w}`);
const blocking = lock ? result.errors.filter((e) => !e.includes('npm run content -- --lock')) : result.errors;
if (blocking.length > 0) {
  for (const e of blocking) console.error(`error: ${e}`);
  console.error(`\n${blocking.length} content error(s).`);
  process.exit(1);
}

if (lock) {
  writeFileSync(join(CONTENT_DIR, LEDGER_FILE), JSON.stringify(result.ledger, null, 2) + '\n');
  console.log(`Recorded ${Object.keys(result.ledger.tasks).length} published task(s) in content/${LEDGER_FILE}.`);
}

const exercises = result.exercises.filter((e) => !production || e.status !== 'draft');
const outDir = new URL('../src/generated/', import.meta.url).pathname;
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'content.json'), JSON.stringify({ exercises, taxonomy: result.taxonomy }, null, 2) + '\n');

for (const e of result.exercises) console.log(`${e.id}  ${e.status.padEnd(9)} revision ${e.revision}`);
console.log(
  `\nWrote ${exercises.length} of ${result.exercises.length} exercise(s)${production ? ' (production: drafts excluded)' : ''}.`,
);
