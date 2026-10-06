import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parse } from 'yaml';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { checkRegistration, loadAnswers, loadSnapshots } from '../../pilot/load.ts';
import type { AnswerEntry } from '../../pilot/metrics.ts';
import { REGISTRATION } from '../../pilot/registration.ts';
import { buildReport } from '../../pilot/report.ts';
import { planRequests } from '../../src/domain/prompt.ts';
import type { Snapshot } from '../../src/domain/types.ts';

let snapshots: Map<string, Snapshot>;
let answers: Map<string, AnswerEntry>;
let dir = '';

beforeAll(async () => {
  snapshots = await loadSnapshots();
  answers = loadAnswers(snapshots);
  dir = mkdtempSync(join(tmpdir(), 'pilot-report-'));
});
afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe('pilot registration', () => {
  it('matches the committed answer set and keys', () => {
    expect(() => checkRegistration(answers, snapshots)).not.toThrow();
  });

  it('refuses a changed gold score, a late acceptable set or a changed key', () => {
    const changed = (id: string, over: Partial<AnswerEntry>) =>
      new Map([...answers].map(([k, a]) => [k, k === id ? { ...a, ...over } : a]));
    const held = [...answers.values()].find((a) => a.holdout)!;
    expect(() => checkRegistration(changed(held.id, { gold: held.gold === 0 ? 1 : 0 }), snapshots)).toThrow(
      /pre-registered digest/,
    );
    expect(() =>
      checkRegistration(changed(held.id, { acceptable: [0, 1], settlement: 'after the replies' }), snapshots),
    ).toThrow(/final labels/);
    const tasks = { ...REGISTRATION.tasks, [held.task]: '0'.repeat(64) };
    expect(() => checkRegistration(answers, snapshots, { ...REGISTRATION, tasks })).toThrow(
      new RegExp(`key of ${held.task.replace('.', '\\.')}`),
    );
  });
});

/** Builds a run folder the way `npm run pilot:prompt` does, without the prompt text. */
function buildRun(name: string, ids: string[]) {
  const folder = join(dir, name);
  mkdirSync(folder, { recursive: true });
  let n = 0;
  const requests = planRequests(
    ids.map((id) => ({
      attemptId: id,
      snapshot: snapshots.get(answers.get(id)!.task)!,
      answer: answers.get(id)!.answer,
    })),
    { newId: () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`, random: () => 0.5 },
  );
  requests.forEach((req, i) => {
    const fixture = {
      id: req.id,
      fence: req.fence,
      promptVersion: req.promptVersion,
      rows: req.rows.map((r) => ({
        rowId: r.rowId,
        attemptId: r.attemptId,
        taskId: r.snapshot.taskId,
        snapshotHash: r.snapshot.hash,
        answer: r.answer,
      })),
      selfGradeOnly: req.promptText === null,
    };
    writeFileSync(join(folder, `request-${String(i + 1).padStart(2, '0')}.json`), JSON.stringify(fixture));
  });
  return { folder, requests };
}

/** A well-formed reply giving each row the score `scoreOf` returns, with one feedback paragraph per row. */
function reply(req: ReturnType<typeof planRequests>[number], scoreOf: (id: string) => number) {
  const feedback = req.rows.map((r) => `${r.rowId}: The answer meets the criteria it names for ${r.attemptId}.`);
  const rows = req.rows.map((r) => `${r.rowId} | ${scoreOf(r.attemptId)}/${r.snapshot.max} | -`);
  return [
    `BEGIN FEEDBACK request=${req.id}`,
    ...feedback,
    'END FEEDBACK',
    '',
    `BEGIN SCORES v2 request=${req.id}`,
    ...rows,
    'END SCORES',
    '',
  ].join('\n');
}

const goldOf = (id: string) => answers.get(id)!.gold;
const heldIds = () => (parse(readFileSync('pilot/runs/holdout-a.yaml', 'utf8')) as { items: string[] }).items;

describe('pilot report', () => {
  it('does not screen an incomplete run and counts its missing rows as unresolved', () => {
    const { folder, requests } = buildRun('held-incomplete', heldIds());
    requests.slice(0, 3).forEach((req, i) => {
      writeFileSync(join(folder, `request-0${i + 1}.reply.gemini-1.txt`), reply(req, goldOf));
    });
    const text = buildReport([folder], answers, snapshots);
    expect(text).toContain(`**Incomplete:** no saved reply for 2 of ${requests.length} requests`);
    expect(text).toContain('**Not screened:**');
    expect(text).not.toMatch(/^- Met:/m);
    expect(text).toContain('| Resolution coverage | 12/20 (60%) |');
    expect(text).toContain('| Replies: recoverable / manual / choose / missing | 0 / 0 / 0 / 2 |');
    expect(text).toMatch(/- gemini: not screened: .*held-incomplete gemini-1 incomplete\./);
  });

  it('screens a complete run, pools a chatbot’s runs and compares them', () => {
    const { folder, requests } = buildRun('held-complete', heldIds());
    const missed = requests[0]!.rows.find((r) => goldOf(r.attemptId) < r.snapshot.max)!.attemptId;
    requests.forEach((req, i) => {
      const name = `request-0${i + 1}`;
      writeFileSync(join(folder, `${name}.reply.grok-1.txt`), reply(req, goldOf));
      const lenient = (id: string) => (id === missed ? snapshots.get(answers.get(id)!.task)!.max : goldOf(id));
      writeFileSync(join(folder, `${name}.reply.grok-2.txt`), reply(req, lenient));
    });
    writeFileSync(
      join(folder, 'notes.csv'),
      'request,label,time,model,client,account,mode,search,copied,notes\n' +
        requests.map((_, i) => `0${i + 1},grok-1,21:00,Grok 5,web PC,free,private,no,copy button,`).join('\n') +
        '\n' +
        requests
          .map(
            (_, i) =>
              `0${i + 1},grok-2,21:30,${i < 3 ? 'Grok 5' : 'Grok 5 mini'},web PC,free,private,"yes, cited",copy button,`,
          )
          .join('\n') +
        '\n',
    );
    const text = buildReport([folder], answers, snapshots);
    expect(text).toContain('- Met: Resolution coverage ≥ 90% (20/20 (100%))');
    expect(text).toContain('- Model label: Grok 5; 5 of 5 requests noted.');
    expect(text).toContain('**Model label changed within this run:** Grok 5 (01, 02, 03); Grok 5 mini (04, 05)');
    expect(text).toContain('**Web search used** in 01, 02, 03, 04, 05.');
    expect(text).toContain(`- ${missed} (`);
    expect(text).toMatch(
      new RegExp(`Its feedback: “I\\d\\d: The answer meets the criteria it names for ${missed}\\.”`),
    );
    expect(text).toContain('| Metric | grok, 2 runs |');
    expect(text).toContain('| Rows | 40 |');
    expect(text).toMatch(/- grok: .*held-complete grok-1 and .*held-complete grok-2: same score 19\/20 \(95%\)/);
    expect(text).toMatch(/Held-out by skill \(information\): assumption exact 4\/4, resolved 4\/4; conclusion/);
    expect(text).toContain('- grok: not decided: every target met, but held-out runs in only one order.');
  });

  it('flags a run with no notes, reads a reply saved with a byte-order mark, and reports Claude apart', () => {
    const orderB = (parse(readFileSync('pilot/runs/holdout-b.yaml', 'utf8')) as { items: string[] }).items;
    const folders = [buildRun('held-claude-a', heldIds()), buildRun('held-claude-b', orderB)].map(
      ({ folder, requests }) => {
        requests.forEach((req, i) =>
          writeFileSync(join(folder, `request-0${i + 1}.reply.claude-1.txt`), '\uFEFF' + reply(req, goldOf)),
        );
        return folder;
      },
    );
    const text = buildReport(folders, answers, snapshots);
    expect(text).toContain('claude-1 (reported apart: the gold scores also come from Claude)');
    expect(text).toContain('**No notes.csv lines for this run:**');
    expect(text).toContain('| Replies: clean | 5/5 (100%) |');
    expect(text).toContain('| Feedback matched (rows) | 20/20 (100%) |');
    expect(text).toContain(
      '- claude: passes: every target met in all 2 held-out runs, in 2 orders. Reported apart: a Claude pass alone cannot select outcome 1.',
    );
  });
});
