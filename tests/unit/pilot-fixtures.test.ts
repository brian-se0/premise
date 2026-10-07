import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { loadSnapshots } from '../../pilot/load.ts';
import { renderPromptForVersion, type PromptVersion } from '../../src/domain/prompt.ts';
import { PARSER_VERSION, parseReply } from '../../src/domain/scoreParser.ts';
import type { Snapshot } from '../../src/domain/types.ts';

// The pilot's saved prompts and replies (docs/GRADING_PROTOCOL.md §10): the app's prompt builder must
// reproduce every prompt byte for byte, and its parser the hand-checked results in expected.json.
const root = join('tests', 'fixtures', 'pilot');
const runs = readdirSync(root).filter((f) => existsSync(join(root, f, 'request-01.json')));

interface RequestFixture {
  id: string;
  fence: string;
  promptVersion: PromptVersion;
  rows: { rowId: string; attemptId: string; taskId: string; snapshotHash: string; answer: string }[];
  selfGradeOnly: boolean;
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
  it('rebuilds every saved prompt byte for byte from its frozen inputs', () => {
    for (const { name, fixture } of requestsOf(run)) {
      const rows = fixture.rows.map((r) => {
        const snapshot = snapshots.get(r.taskId)!;
        expect(snapshot.hash, `${name} ${r.rowId}`).toBe(r.snapshotHash);
        return { rowId: r.rowId, attemptId: r.attemptId, snapshot, answer: r.answer };
      });
      const path = join(root, run, `${name}.prompt.txt`);
      expect(existsSync(path), name).toBe(!fixture.selfGradeOnly);
      if (fixture.selfGradeOnly) continue;
      expect(renderPromptForVersion(fixture.promptVersion, fixture.id, fixture.fence, rows), name).toBe(
        readFileSync(path, 'utf8'),
      );
    }
  });

  it.runIf(existsSync(join(root, run, 'expected.json')))('parses every saved reply as expected', () => {
    const expected = JSON.parse(readFileSync(join(root, run, 'expected.json'), 'utf8')) as {
      parserVersion: number;
      replies: Record<string, unknown>;
    };
    expect(expected.parserVersion).toBe(PARSER_VERSION);
    const replies = readdirSync(join(root, run)).filter((f) => /^request-\d{2}\.reply\./.test(f));
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
