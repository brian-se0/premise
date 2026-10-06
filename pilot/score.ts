// M0 pilot: scores saved chatbot replies against the gold labels and prints the
// docs/GRADING_PROTOCOL.md §9 metrics as Markdown, with the app's own parser.
//
// Usage: npm run pilot:score -- [tests/fixtures/pilot/<run> ...]   (default: every run folder)
//
// A run folder holds request-NN.json and request-NN.prompt.txt from `npm run pilot:prompt`, and one
// reply per chatbot run: request-NN.reply.<chatbot>-<n>.txt. Each <chatbot>-<n> label in a folder is
// one grading run. Requests without a saved reply are left out and the run is marked incomplete.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseReply, type ParserRequest } from '../src/domain/scoreParser.ts';
import { goldDigest, loadAnswers, loadSnapshots } from './load.ts';
import {
  computeMetrics,
  finalGold,
  pct,
  ratio,
  runToRun,
  screen,
  upperBound95,
  type AnswerEntry,
  type GradedRow,
  type Metrics,
  type Ratio,
  type ReplyOutcome,
  type RowResult,
} from './metrics.ts';

interface RequestFixture {
  id: string;
  promptVersion: string;
  rows: { rowId: string; attemptId: string; taskId: string; snapshotHash: string; answer: string }[];
  selfGradeOnly: boolean;
}

const ROOT = join('tests', 'fixtures', 'pilot');
const REPLY = /^(request-\d{2})\.reply\.(.+)\.txt$/;

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

const out: string[] = ['# Pilot results', ''];
const all = [...answers.values()];
const count = (f: (a: AnswerEntry) => boolean) => all.filter(f).length;
out.push(
  `Answer set: ${all.length} answers, ${count((a) => !a.holdout)} development and ${count((a) => a.holdout)} held-out. ` +
    `Second scores: ${count((a) => a.second !== undefined)} of ${all.length}; agreeing with Claude's before settlement: ` +
    `${count((a) => a.second !== undefined && a.second === a.gold)}; settled: ${count((a) => a.settled !== undefined)}; ` +
    `acceptable-score sets: ${count((a) => a.acceptable !== undefined)}. Digest of Claude's scores: \`${goldDigest(answers)}\`.`,
  '',
);
const gold = new Map(all.map((a) => [a.id, finalGold(a)]));

/** Per chatbot, each run's row results by answer id, for run-to-run agreement. */
const byChatbot = new Map<string, { run: string; results: Map<string, RowResult> }[]>();

for (const folder of folders) {
  const requestFiles = readdirSync(folder)
    .filter((f) => /^request-\d{2}\.json$/.test(f))
    .sort();
  const requests = requestFiles.map((f) => ({
    name: f.replace(/\.json$/, ''),
    fixture: JSON.parse(readFileSync(join(folder, f), 'utf8')) as RequestFixture,
  }));
  for (const { name, fixture } of requests) {
    for (const row of fixture.rows) {
      const answer = answers.get(row.attemptId);
      const where = `${folder}/${name} ${row.rowId} (${row.attemptId})`;
      if (!answer) throw new Error(`${where}: not in the answer set`);
      if (answer.task !== row.taskId || answer.answer !== row.answer) throw new Error(`${where}: differs from the answer set`);
      if (snapshots.get(row.taskId)?.hash !== row.snapshotHash) {
        throw new Error(`${where}: the task's key changed after this request was built, so its gold may not apply`);
      }
    }
    const holdouts = new Set(fixture.rows.map((r) => answers.get(r.attemptId)!.holdout));
    if (holdouts.size > 1) throw new Error(`${folder}/${name}: mixes development and held-out answers`);
  }

  const labels = new Set<string>();
  for (const f of readdirSync(folder)) {
    const m = REPLY.exec(f);
    if (m) labels.add(m[2]!);
  }
  if (labels.size === 0) {
    out.push(`## ${folder}`, '', 'No replies saved yet.', '');
    continue;
  }

  for (const label of [...labels].sort()) {
    const rows: GradedRow[] = [];
    const replies: { outcome: ReplyOutcome; holdout: boolean }[] = [];
    const notes: string[] = [];
    const results = new Map<string, RowResult>();
    let replied = 0;
    for (const { name, fixture } of requests) {
      if (fixture.selfGradeOnly) {
        notes.push(`${name} is self-grading only (too long to send) and is not counted.`);
        continue;
      }
      const path = join(folder, `${name}.reply.${label}.txt`);
      if (!existsSync(path)) continue;
      replied++;
      const request: ParserRequest = {
        id: fixture.id,
        promptVersion: fixture.promptVersion,
        rows: fixture.rows.map((r) => {
          const snap = snapshots.get(r.taskId)!;
          return { rowId: r.rowId, max: snap.max, allowedTags: snap.allowedTags };
        }),
      };
      const parsed = parseReply(readFileSync(path, 'utf8'), request);
      const holdout = answers.get(fixture.rows[0]!.attemptId)!.holdout;
      let outcome: ReplyOutcome;
      if (parsed.kind === 'parsed') outcome = parsed.block.outcome;
      else if (parsed.kind === 'choose') outcome = 'choose';
      else outcome = 'manual';
      if (parsed.kind !== 'parsed') notes.push(`${name}: ${parsed.kind === 'choose' ? 'several different score blocks' : parsed.message}.`);
      replies.push({ outcome, holdout });
      fixture.rows.forEach((r, i) => {
        const row = parsed.kind === 'parsed' ? parsed.block.rows[i]! : null;
        const result: RowResult =
          row?.status === 'valid' ? (row.score === null ? { kind: 'abstain' } : { kind: 'score', score: row.score }) : { kind: 'unresolved' };
        results.set(r.attemptId, result);
        rows.push({
          answerId: r.attemptId,
          max: request.rows[i]!.max,
          gold: gold.get(r.attemptId)!,
          result,
          feedbackMatched: row?.feedback != null,
        });
      });
    }
    const sendable = requests.filter((r) => !r.fixture.selfGradeOnly).length;
    const chatbot = label.replace(/-\d+$/, '');
    if (!byChatbot.has(chatbot)) byChatbot.set(chatbot, []);
    byChatbot.get(chatbot)!.push({ run: `${folder} ${label}`, results });

    const isHoldout = (r: GradedRow) => answers.get(r.answerId)!.holdout;
    const dev = computeMetrics(
      rows.filter((r) => !isHoldout(r)),
      replies.filter((r) => !r.holdout).map((r) => r.outcome),
    );
    const held = computeMetrics(
      rows.filter(isHoldout),
      replies.filter((r) => r.holdout).map((r) => r.outcome),
    );
    out.push(`## ${folder} · ${label}`, '');
    out.push(
      replied === sendable
        ? `Replies saved for all ${sendable} requests.`
        : `**Incomplete:** replies saved for ${replied} of ${sendable} requests; the metrics cover those only.`,
      '',
    );
    out.push(...table(dev, held), '');
    if (held.rows > 0) {
      out.push('Screening targets on the held-out exercises (§9):', '');
      for (const t of screen(held)) out.push(`- ${t.met ? 'Met' : 'Not met'}: ${t.target} (${t.value ?? 'not evaluable'})`);
      out.push('');
    }
    const misses = rows.filter(
      (r) => r.result.kind !== 'score' || (r.gold.kind === 'exact' ? r.result.score !== r.gold.score : !r.gold.scores.includes(r.result.score)),
    );
    if (misses.length) {
      out.push('Rows that differ from gold:', '');
      for (const r of misses) {
        const a = answers.get(r.answerId)!;
        const g = r.gold.kind === 'exact' ? String(r.gold.score) : `{${r.gold.scores.join(', ')}}`;
        const got = r.result.kind === 'score' ? String(r.result.score) : r.result.kind === 'abstain' ? '?' : 'no score';
        out.push(`- ${r.answerId} (${a.task}${a.holdout ? ', held-out' : ''}): gold ${g}/${r.max}, chatbot ${got}`);
      }
      out.push('');
    }
    if (notes.length) out.push(...notes.map((n) => `- ${n}`), '');
  }
}

const pairs: string[] = [];
for (const [chatbot, runs] of [...byChatbot].sort(([a], [b]) => a.localeCompare(b))) {
  for (let i = 0; i < runs.length; i++) {
    for (let j = i + 1; j < runs.length; j++) {
      const r = runToRun(runs[i]!.results, runs[j]!.results);
      if (r.same.d + r.nonDecisionPairs === 0) continue;
      pairs.push(
        `- ${chatbot}: ${runs[i]!.run} and ${runs[j]!.run}: same score ${pct(r.same)}; pairs with a non-decision in either run: ${r.nonDecisionPairs}`,
      );
    }
  }
}
if (pairs.length) out.push('## Run-to-run agreement', '', ...pairs, '');
out.push(
  'Counts are over rows of one run; repeated runs are not independent answers. Results for Claude as a grader are ' +
    "reported apart from the others because the gold scores come from Claude (§9). Upper bounds are one-sided 95% (exact binomial) and assume independent rows.",
);
console.log(out.join('\n'));

function bound(r: Ratio): string {
  const b = upperBound95(r.n, r.d);
  return b === null ? '' : `; rate ≤ ${(100 * b).toFixed(0)}%`;
}

function table(dev: Metrics, held: Metrics): string[] {
  const cols = [
    { name: 'Development', m: dev },
    { name: 'Held-out', m: held },
  ].filter((c) => c.m.rows > 0);
  const row = (label: string, f: (m: Metrics) => string) => `| ${label} | ${cols.map((c) => f(c.m)).join(' | ')} |`;
  return [
    `| Metric | ${cols.map((c) => c.name).join(' | ')} |`,
    `| --- |${cols.map(() => ' --- |').join('')}`,
    row('Rows', (m) => String(m.rows)),
    row('Resolution coverage', (m) => pct(m.coverage)),
    row('Abstentions (?)', (m) => pct(m.abstention)),
    row('Invalid or missing', (m) => pct(m.invalidOrMissing)),
    row('Exact agreement (unequivocal gold)', (m) => pct(m.exactAgreement)),
    row('Within an acceptable-score set', (m) => pct(m.withinAcceptable)),
    row('False passes', (m) => `${pct(m.falsePasses)}${bound(m.falsePasses)}`),
    row('False fails', (m) => `${pct(m.falseFails)}${bound(m.falseFails)}`),
    row('Pass/fail agreement', (m) => pct(m.passFail)),
    row('Replies: clean', (m) => pct(m.cleanParse)),
    row('Replies: recoverable / manual / choose', (m) => `${m.replies.recoverable} / ${m.replies.manual} / ${m.replies.choose}`),
    row('Feedback matched (rows)', (m) => pct(m.feedbackMatch)),
    row('Rows resolved by hand / requests', (m) => ratio(m.handRows)),
  ];
}
