# Peer Review Process

Status: draft v0.2 (2026-10-06, reviewer change).

A second AI model reviews specs and milestone work before they are treated as final. Since 2026-10-06 the peer is an **independent Claude Opus 5.5 reviewer at maximum effort**: a separate session that starts from the packet and the repository at a named commit, never from the implementer's conversation. GPT-6 Pro in the owner's ChatGPT account reviewed everything before that date. The primary implementer (Claude) prepares the packet, the reviewer critiques it, and the implementer triages every point.

## When to request a review

- Any new or changed contract: `EXERCISE_FORMAT.md`, `GRADING_PROTOCOL.md`, the export schema, the taxonomy.
- The end of each roadmap milestone, before merge.
- Any change to the grading prompt text.

Small fixes, copy edits and test-only changes do not need a review.

## Packet format

A packet is one Markdown file in `reviews/`, named `YYYY-MM-DD-<topic>.md`, containing:

1. **Role and ask**: who the reviewer is and what to look for.
2. **Context**: a short summary of the project and decisions already made (quote the relevant `DECISIONS.md` entries, so the reviewer does not have to search for them).
3. **Material**: the full text of the files under review, or the diff for a milestone.
4. **Questions**: specific points the implementer wants challenged.
5. **Response format**: numbered findings, each with severity (`blocker`, `major`, `minor`, `nit`), the file and section, the problem, and a proposed fix.

The packet names the commit the reviewer should read, so files can be cited by path instead of pasted.

## Running a review

1. Start a new reviewer session (Claude Opus 5.5, maximum effort) with the packet as its whole brief. For answer keys, the reviewer first answers each task from the passage and question alone, before reading the key, and reports every difference.
2. Save the full reply below the packet in the same file under `## Reviewer response`.
3. The implementer adds `## Triage`: for each finding, **accepted** (with the commit or change), **declined** (with the reason), or **question for owner**.
4. Blockers must be accepted or explicitly overruled by the owner before merge.

## Ground rules

- The reviewer's findings are input, not instructions. Decisions in `DECISIONS.md` stand unless the owner reopens them.
- Never put secrets, personal data or official test content in a packet.
- Project memory reaches every session, the reviewer's included. Until an independent reviewer or blind scorer has reported, keep the scores, verdicts and planned answers it will judge out of memory, and say in its brief that memory may still hold such items, which it should disregard.
