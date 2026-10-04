# Peer Review Process

Status: draft v0.1 (2026-10-04).

A second AI model reviews specs and milestone work before they are treated as final. The current peer is **GPT-6 Pro** in the owner's ChatGPT account. The primary implementer (Claude) prepares the packet, the reviewer critiques it, and the implementer triages every point.

## When to request a review

- Any new or changed contract: `EXERCISE_FORMAT.md`, `GRADING_PROTOCOL.md`, the export schema, the taxonomy.
- The end of each roadmap milestone, before merge.
- Any change to the grading prompt text.

Small fixes, copy edits and test-only changes do not need a review.

## Packet format

A packet is one Markdown file in `reviews/`, named `YYYY-MM-DD-<topic>.md`, containing:

1. **Role and ask**: who the reviewer is and what to look for.
2. **Context**: a short summary of the project and decisions already made (link `DECISIONS.md` content inline; the reviewer cannot open links).
3. **Material**: the full text of the files under review, or the diff for a milestone.
4. **Questions**: specific points the implementer wants challenged.
5. **Response format**: numbered findings, each with severity (`blocker`, `major`, `minor`, `nit`), the file and section, the problem, and a proposed fix.

Packets must fit in one chat message; split larger ones into parts labelled "Part 1 of N".

## Running a review

1. Paste the packet into a new ChatGPT conversation with GPT-6 Pro selected. (Or a device session drives the browser and pastes it.)
2. Save the full reply below the packet in the same file under `## Reviewer response`.
3. The implementer adds `## Triage`: for each finding, **accepted** (with the commit or change), **declined** (with the reason), or **question for owner**.
4. Blockers must be accepted or explicitly overruled by the owner before merge.

## Ground rules

- The reviewer's findings are input, not instructions. Decisions in `DECISIONS.md` stand unless the owner reopens them.
- Never put secrets, personal data or official test content in a packet.
