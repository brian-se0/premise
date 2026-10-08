// M0 pilot report: scores saved chatbot replies against the gold labels with the app's own parser and
// returns the docs/GRADING_PROTOCOL.md §9 metrics as Markdown. `score.ts` is the command-line entry.
//
// A run folder holds request-NN.json and request-NN.prompt.txt from `npm run pilot:prompt`, one reply per
// chatbot run (request-NN.reply.<chatbot>-<n>.txt; each <chatbot>-<n> label is one grading run) and
// notes.csv, one line per reply (pilot/README.md). A request with no saved reply counts as a missing
// reply with every row unresolved, and an incomplete run is not screened.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseReply, type ParserRequest } from '../src/domain/scoreParser.ts';
import type { Snapshot } from '../src/domain/types.ts';
import { checkRegistration, goldDigest, labelDigest } from './load.ts';
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

/** One request's outcome in one run, with the rows it covered. */
interface RunRequest {
  holdout: boolean;
  outcome: ReplyOutcome;
}

interface Run {
  folder: string;
  label: string;
  chatbot: string;
  rows: GradedRow[];
  requests: RunRequest[];
  /** Held-out screening: targets not met, or null for an incomplete run that is not screened. */
  unmet?: string[] | null;
}

const REPLY = /^(request-\d{2})\.reply\.(.+)\.txt$/;
/** Where the gold comes from, so this grader's results are reported apart (§9). */
const SAME_AS_GOLD = 'claude';

export function buildReport(
  folders: readonly string[],
  answers: ReadonlyMap<string, AnswerEntry>,
  snapshots: ReadonlyMap<string, Snapshot>,
): string {
  checkRegistration(answers, snapshots);
  const out: string[] = ['# Pilot results', ''];
  const all = [...answers.values()];
  const count = (f: (a: AnswerEntry) => boolean) => all.filter(f).length;
  out.push(
    `Answer set: ${all.length} answers, ${count((a) => !a.holdout)} development and ${count((a) => a.holdout)} held-out. ` +
      `Second scores: ${count((a) => a.second !== undefined)} of ${all.length}; agreeing with Claude's before settlement: ` +
      `${count((a) => a.second !== undefined && a.second === a.gold)}; settled: ${count((a) => a.settled !== undefined)}; ` +
      `acceptable-score sets: ${count((a) => a.acceptable !== undefined)}. Digest of Claude's scores: \`${goldDigest(answers)}\`; ` +
      `of the final labels: \`${labelDigest(answers)}\` (both as registered in pilot/registration.ts).`,
    '',
  );
  const gold = new Map(all.map((a) => [a.id, finalGold(a)]));
  const runs: Run[] = [];

  for (const folder of folders) {
    const requests = readdirSync(folder)
      .filter((f) => /^request-\d{2}\.json$/.test(f))
      .sort()
      .map((f) => ({
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
    const notes = readNotes(folder);

    for (const label of [...labels].sort()) {
      const chatbot = label.replace(/-\d+$/, '');
      const run: Run = { folder, label, chatbot, rows: [], requests: [] };
      const remarks: string[] = [];
      const feedbackOf = new Map<string, string>();
      let missing = 0;
      for (const { name, fixture } of requests) {
        if (fixture.selfGradeOnly) {
          remarks.push(`${name} is self-grading only (too long to send) and is not counted.`);
          continue;
        }
        const holdout = answers.get(fixture.rows[0]!.attemptId)!.holdout;
        const max = (r: { taskId: string }) => snapshots.get(r.taskId)!.max;
        const path = join(folder, `${name}.reply.${label}.txt`);
        if (!existsSync(path)) {
          missing++;
          run.requests.push({ holdout, outcome: 'missing' });
          for (const r of fixture.rows) {
            run.rows.push({ answerId: r.attemptId, max: max(r), gold: gold.get(r.attemptId)!, result: { kind: 'unresolved' }, feedbackMatched: false });
          }
          continue;
        }
        const request: ParserRequest = {
          id: fixture.id,
          promptVersion: fixture.promptVersion,
          rows: fixture.rows.map((r) => ({ rowId: r.rowId, max: max(r), allowedTags: snapshots.get(r.taskId)!.allowedTags })),
        };
        // A byte-order mark is a file-encoding artifact, never part of a pasted reply.
        const raw = readFileSync(path, 'utf8');
        const reply = raw.replace(/^\uFEFF/, '');
        if (reply !== raw) remarks.push(`${name}: the saved file began with a byte-order mark, which was ignored.`);
        const parsed = parseReply(reply, request);
        let outcome: ReplyOutcome;
        if (parsed.kind === 'parsed') outcome = parsed.block.outcome;
        else if (parsed.kind === 'choose') outcome = 'choose';
        else outcome = 'manual';
        if (parsed.kind !== 'parsed') remarks.push(`${name}: ${parsed.kind === 'choose' ? 'several different score blocks' : parsed.message}.`);
        run.requests.push({ holdout, outcome });
        fixture.rows.forEach((r, i) => {
          const row = parsed.kind === 'parsed' ? parsed.block.rows[i]! : null;
          const result: RowResult =
            row?.status === 'valid' ? (row.score === null ? { kind: 'abstain' } : { kind: 'score', score: row.score }) : { kind: 'unresolved' };
          if (row?.feedback) feedbackOf.set(r.attemptId, reply.slice(row.feedback.start, row.feedback.end));
          run.rows.push({ answerId: r.attemptId, max: max(r), gold: gold.get(r.attemptId)!, result, feedbackMatched: row?.feedback != null });
        });
      }
      runs.push(run);

      const sendable = requests.filter((r) => !r.fixture.selfGradeOnly).length;
      const isHoldout = (id: string) => answers.get(id)!.holdout;
      const dev = metricsOf(run, false, isHoldout);
      const held = metricsOf(run, true, isHoldout);
      const apart = chatbot === SAME_AS_GOLD ? ' (reported apart: the gold scores also come from Claude)' : '';
      out.push(`## ${folder} · ${label}${apart}`, '');
      out.push(
        missing === 0
          ? `Replies saved for all ${sendable} requests.`
          : `**Incomplete:** no saved reply for ${missing} of ${sendable} requests. Their rows count as unresolved and the requests as missing replies.`,
        '',
      );
      out.push(...noteLines(notes, label, requests.length), '');
      out.push(...table([{ name: 'Development', m: dev }, { name: 'Held-out', m: held }].filter((c) => c.m.rows > 0)), '');
      out.push(...skillLines(run, answers, snapshots), '');
      if (held.rows > 0) {
        if (missing > 0) {
          run.unmet = null;
          out.push(`**Not screened:** the run is incomplete, so the §9 screening targets are not applied.`, '');
        } else {
          const checks = screen(held);
          run.unmet = checks.filter((t) => !t.met).map((t) => t.target);
          out.push('Screening targets on the held-out exercises (§9):', '');
          for (const t of checks) out.push(`- ${t.met ? 'Met' : 'Not met'}: ${t.target} (${t.value ?? 'not evaluable'})`);
          out.push('');
        }
      }
      const misses = run.rows.filter(
        (r) => r.result.kind !== 'score' || (r.gold.kind === 'exact' ? r.result.score !== r.gold.score : !r.gold.scores.includes(r.result.score)),
      );
      if (misses.length) {
        out.push('Rows that differ from gold:', '');
        for (const r of misses) {
          const a = answers.get(r.answerId)!;
          const g = r.gold.kind === 'exact' ? String(r.gold.score) : `{${r.gold.scores.join(', ')}}`;
          const got = r.result.kind === 'score' ? String(r.result.score) : r.result.kind === 'abstain' ? '?' : 'no score';
          out.push(`- ${r.answerId} (${a.task}${a.holdout ? ', held-out' : ''}): gold ${g}/${r.max}, chatbot ${got}`);
          // §9: a held-out disagreement is shown to the owner with the chatbot's own reasoning.
          const feedback = feedbackOf.get(r.answerId);
          if (a.holdout && feedback) out.push(`  - Its feedback: ${quote(feedback)}`);
        }
        out.push('');
      }
      if (remarks.length) out.push(...remarks.map((n) => `- ${n}`), '');
    }
  }

  const heldByChatbot = new Map<string, Run[]>();
  for (const run of runs) {
    if (!run.rows.some((r) => answers.get(r.answerId)!.holdout)) continue;
    heldByChatbot.set(run.chatbot, [...(heldByChatbot.get(run.chatbot) ?? []), run]);
  }
  if (heldByChatbot.size) {
    const isHoldout = (id: string) => answers.get(id)!.holdout;
    const order = [...heldByChatbot.keys()].sort((a, b) => Number(a === SAME_AS_GOLD) - Number(b === SAME_AS_GOLD) || a.localeCompare(b));
    out.push('## Held-out results pooled per chatbot', '');
    out.push('For information: the screening targets apply to each run separately (§9).', '');
    out.push(
      ...table(
        order.map((chatbot) => {
          const pooled = heldByChatbot.get(chatbot)!;
          const merged: Run = { folder: '', label: '', chatbot, rows: pooled.flatMap((r) => r.rows), requests: pooled.flatMap((r) => r.requests) };
          return { name: `${chatbot}${chatbot === SAME_AS_GOLD ? ' (apart)' : ''}, ${pooled.length} run${pooled.length === 1 ? '' : 's'}`, m: metricsOf(merged, true, isHoldout) };
        }),
      ),
      '',
    );
    out.push('Verdicts (§9 "Choosing among chatbots"):', '');
    for (const chatbot of order) out.push(`- ${chatbot}: ${verdict(heldByChatbot.get(chatbot)!)}`);
    out.push('');
  }

  const pairs: string[] = [];
  const byChatbot = new Map<string, Run[]>();
  for (const run of runs) byChatbot.set(run.chatbot, [...(byChatbot.get(run.chatbot) ?? []), run]);
  for (const [chatbot, list] of [...byChatbot].sort(([a], [b]) => a.localeCompare(b))) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const r = runToRun(resultsOf(list[i]!), resultsOf(list[j]!));
        if (r.same.d + r.nonDecisionPairs === 0) continue;
        pairs.push(
          `- ${chatbot}: ${list[i]!.folder} ${list[i]!.label} and ${list[j]!.folder} ${list[j]!.label}: same score ${pct(r.same)}; pairs with a non-decision in either run: ${r.nonDecisionPairs}`,
        );
      }
    }
  }
  if (pairs.length) out.push('## Run-to-run agreement', '', ...pairs, '');
  out.push(
    "Agreement here is agreement with Claude's reading of the keys: the gold scores come from Claude, checked by a second, " +
      'blind Claude session, and the answers are synthetic, written against the keys, so real answers may be harder to grade. ' +
      'Results for Claude as a grader are reported apart (§9). Counts are over rows of one run; repeated runs are not ' +
      'independent answers. Upper bounds are one-sided 95% (exact binomial) and assume independent rows.',
  );
  return out.join('\n');
}

/** A chatbot passes only if every held-out run, in at least two orders, meets every target. */
function verdict(runs: Run[]): string {
  const apart = runs[0]!.chatbot === SAME_AS_GOLD ? ' Reported apart: a Claude pass alone cannot select outcome 1.' : '';
  const name = (r: Run) => `${r.folder} ${r.label}`;
  const incomplete = runs.filter((r) => r.unmet === null);
  if (incomplete.length) return `not screened: ${incomplete.map(name).join(', ')} incomplete.${apart}`;
  const failed = runs.filter((r) => r.unmet!.length > 0);
  if (failed.length) return `does not pass: ${failed.map((r) => `${name(r)} missed ${r.unmet!.join('; ')}`).join('. ')}.${apart}`;
  const orders = new Set(runs.map((r) => r.folder)).size;
  if (orders < 2) return `not decided: every target met, but held-out runs in only one order.${apart}`;
  return `passes: every target met in all ${runs.length} held-out runs, in ${orders} orders.${apart}`;
}

function metricsOf(run: Run, holdout: boolean, isHoldout: (id: string) => boolean): Metrics {
  return computeMetrics(
    run.rows.filter((r) => isHoldout(r.answerId) === holdout),
    run.requests.filter((r) => r.holdout === holdout).map((r) => r.outcome),
  );
}

function resultsOf(run: Run): Map<string, RowResult> {
  return new Map(run.rows.map((r) => [r.answerId, r.result]));
}

/** Exact agreement and coverage per skill, for information (§9 sets no per-skill targets). */
function skillLines(run: Run, answers: ReadonlyMap<string, AnswerEntry>, snapshots: ReadonlyMap<string, Snapshot>): string[] {
  const lines: string[] = [];
  for (const holdout of [false, true]) {
    const rows = run.rows.filter((r) => answers.get(r.answerId)!.holdout === holdout);
    if (!rows.length) continue;
    const skills = [...new Set(rows.map((r) => snapshots.get(answers.get(r.answerId)!.task)!.skill))].sort();
    const parts = skills.map((skill) => {
      const m = computeMetrics(
        rows.filter((r) => snapshots.get(answers.get(r.answerId)!.task)!.skill === skill),
        [],
      );
      return `${skill} exact ${ratio(m.exactAgreement)}, resolved ${ratio(m.coverage)}`;
    });
    lines.push(`- ${holdout ? 'Held-out' : 'Development'} by skill (information): ${parts.join('; ')}.`);
  }
  return lines;
}

/** notes.csv: request,label,time,model,client,account,mode,search,copied,notes (pilot/README.md). */
type Note = Record<string, string>;

function readNotes(folder: string): Note[] | null {
  const path = join(folder, 'notes.csv');
  if (!existsSync(path)) return null;
  const [header, ...lines] = parseCsv(readFileSync(path, 'utf8'));
  if (!header) return [];
  return lines.map((cells) => Object.fromEntries(header.map((h, i) => [h.trim(), (cells[i] ?? '').trim()])));
}

/** Flags what the parser cannot see: a model switch inside a run, web search, or no notes at all. */
function noteLines(notes: Note[] | null, label: string, requests: number): string[] {
  const mine = (notes ?? []).filter((n) => n.label === label);
  if (mine.length === 0) return [`- **No notes.csv lines for this run:** the model label, client and chat mode are not recorded.`];
  const lines: string[] = [];
  const models = [...new Set(mine.map((n) => n.model))];
  lines.push(
    models.length === 1
      ? `- Model label: ${models[0] || '(blank)'}; ${mine.length} of ${requests} requests noted.`
      : `- **Model label changed within this run:** ${models
          .map((m) => `${m || '(blank)'} (${mine.filter((n) => n.model === m).map((n) => n.request).join(', ')})`)
          .join('; ')}. Split or flag the run before using it.`,
  );
  const searched = mine.filter((n) => /^y/i.test(n.search ?? ''));
  if (searched.length) lines.push(`- **Web search used** in ${searched.map((n) => n.request).join(', ')}.`);
  return lines;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(cell);
      cell = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      if (row.some((x) => x !== '')) rows.push(row);
      row = [];
      cell = '';
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x !== '')) rows.push(row);
  return rows;
}

function quote(text: string): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  return `“${flat.length > 400 ? `${flat.slice(0, 400)}…` : flat}”`;
}

function bound(r: Ratio): string {
  const b = upperBound95(r.n, r.d);
  return b === null ? '' : `; rate ≤ ${(100 * b).toFixed(0)}%`;
}

function table(cols: { name: string; m: Metrics }[]): string[] {
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
    row(
      'Replies: recoverable / manual / choose / missing',
      (m) => `${m.replies.recoverable} / ${m.replies.manual} / ${m.replies.choose} / ${m.replies.missing}`,
    ),
    row('Manual outcome (manual, choose or missing)', (m) => pct(m.manualOutcome)),
    row('Feedback matched (rows)', (m) => pct(m.feedbackMatch)),
    row('Rows resolved by hand / requests', (m) => ratio(m.handRows)),
  ];
}
