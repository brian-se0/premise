import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { loadSnapshots } from '../../pilot/load.ts';
import type { PromptVersion } from '../../src/domain/prompt.ts';
import { PARSER_VERSION, parseReply } from '../../src/domain/scoreParser.ts';
import type { Snapshot } from '../../src/domain/types.ts';

// The pilot's saved replies (docs/GRADING_PROTOCOL.md §10): the parser must reproduce the hand-checked results in
// each run's expected.json, which every run with saved replies must have. tests/unit/prompt.test.ts checks the
// saved prompts.
const root = join('tests', 'fixtures', 'pilot');
const runs = readdirSync(root).filter((f) => existsSync(join(root, f, 'request-01.json')));
const repliesOf = (run: string) => readdirSync(join(root, run)).filter((f) => /^request-\d{2}\.reply\./.test(f));

interface RequestFixture {
  id: string;
  promptVersion: PromptVersion;
  rows: { rowId: string; taskId: string }[];
}

let snapshots: Map<string, Snapshot>;
beforeAll(async () => {
  snapshots = await loadSnapshots();
});

const requestsOf = (run: string) =>
  readdirSync(join(root, run))
    .filter((f) => /^request-\d{2}\.json$/.test(f))
    .map((f) => ({
      name: f.slice(0, 10),
      fixture: JSON.parse(readFileSync(join(root, run, f), 'utf8')) as RequestFixture,
    }));

describe.each(runs)('pilot run %s', (run) => {
  it('parses every saved reply as expected', () => {
    // A run with saved replies needs its hand-checked results, so no run is skipped unnoticed.
    if (repliesOf(run).length === 0) return;
    expect(existsSync(join(root, run, 'expected.json')), `${run}/expected.json`).toBe(true);
    const expected = JSON.parse(readFileSync(join(root, run, 'expected.json'), 'utf8')) as {
      parserVersion: number;
      replies: Record<string, unknown>;
    };
    expect(expected.parserVersion).toBe(PARSER_VERSION);
    const replies = repliesOf(run);
    expect(Object.keys(expected.replies).sort()).toEqual(replies.sort());
    const requests = new Map(requestsOf(run).map((r) => [r.name, r.fixture]));
    for (const file of replies) {
      const fixture = requests.get(file.slice(0, 10))!;
      const request = {
        id: fixture.id,
        promptVersion: fixture.promptVersion,
        rows: fixture.rows.map((r) => ({
          rowId: r.rowId,
          max: snapshots.get(r.taskId)!.max,
          allowedTags: snapshots.get(r.taskId)!.allowedTags,
        })),
      };
      // As in pilot/report.ts: a byte-order mark is a file-encoding artifact, never part of a reply.
      const raw = readFileSync(join(root, run, file), 'utf8').replace(/^\uFEFF/, '');
      expect(parseReply(raw, request), file).toEqual(expected.replies[file]);
    }
  });
});
