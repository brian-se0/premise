# PR #3 review: storage, sessions, planner, backup and parser

Independent review by Claude, 2026-10-05, of the owner's draft PR #3 (https://github.com/brian-se0/premise/pull/3) at `9e263bb`. The `src/` tree is identical on its merge with today's `main` (`19b2166`), so every line reference below applies to the PR branch as it stands. GPT-6 Pro's review of the same code, and a triage covering both reviews, are in `2026-10-05-pr3-hardening.md`.

**Verdict: merge after fixes.** No blockers. Nothing found loses a draft, applies a review twice or breaks a transaction. Five small fixes are worth making before merge. One of them is a regression that would leave some backups unrestorable.

Every finding was reproduced with a scratch test against the PR's code, except 10, which was traced from the code. The scratch tests have been deleted.

## Fix before merge: security and data integrity

**1. major: backups that hold a long reply saved by the live version can't be restored after this PR.**
- Where: `src/storage/backup.ts:172`, `raw: z.string().max(MAX_REPLY_LENGTH)`, which is new in this PR.
- Why: the live version (`d76cef5`) saves every reply it can't parse, including one over 200,000 characters (`RequestPage.tsx:324-332` there), and its `saveReply` has no length cap. After the upgrade that row stays in the database. Both the old backup and this PR's own export of that database are refused on import ("replies.0.raw: Too big"), and import is all-or-nothing.
- Scenario: a student pastes a whole chat transcript on the live site today, then upgrades. Their next backup can't be restored.
- Fix: drop the `.max()` from the import schema, or apply it only when `parserVersion >= 3`. The 50 MiB file cap still bounds it, and the save-time check (`ops.ts:535`) stays.

**2. major: when another tab finishes the session, this tab shows a false "changed in another tab" error with every button disabled.**
- Where: `src/ui/pages/SessionPage.tsx:245-246` (`takenElsewhere`) and `:278` call `matchesDraftIdentity` without `allowEnded`, so it defaults to false (`src/storage/ops.ts:115`).
- Why: the other tab's Session done screen ends the session as soon as its last task is submitted (`SessionPage.tsx:684-686`). From then on the identity check fails, so the "This task was submitted in another tab" view never appears. The student sees a conflict instead.
- Scenario: two tabs on the last task of a session. That includes every one-task Library or retry session. After tab B submits, tab A says "This answer changed in another tab… copy it before leaving", and Submit, Skip and Stop are all disabled. The only way out is a header link, then "Leave without saving". No data is lost, but the student is told their text is at risk and has nothing to press. The existing tests miss it because the other tab always submits a task that isn't the last one.
- Fix: pass `allowEnded = true` at `:246` and `:278`. The `state !== 'draft'` check and the storage-level checks still refuse any write into an ended session.

**3. minor: import accepts an ended session that still holds a draft. The draft is hidden and its task can never be practised again.**
- Where: `src/domain/integrity.ts:142-176` has no rule for it.
- Why: an ended session renders Session done (`SessionPage.tsx:85`), so the draft is never shown. Save, skip and submit all refuse ended sessions. Every later attempt to open the task, from Today, New or the Library, returns "unfinished answer in another session" (`ops.ts:262-263`), and that link leads back to Session done.
- Scenario: a damaged or hand-edited backup. The app can't produce this state itself (`endSession` refuses drafts, and export reads in one transaction). All three reviewers found this one independently.
- Fix: an import rule that a draft's session must not be ended. No valid backup is refused.

**4. minor: import accepts a submitted answer over 2,000 characters, which then blocks grading for its whole session.**
- Where: `backup.ts:141` (`answer: z.string()`, no cap) and no length rule in `integrity.ts`. The check that fires later is `prompt.ts:240-244`, reached from `ops.ts:452-458`.
- Why: Session done and Home send all of a session's ungraded answers to one `prepareGrading` call, which throws on the long answer. None of that session's answers can be graded, and the long one can't be discarded because it isn't in a request.
- Fix: refuse `answer.length > MAX_ANSWER_LENGTH` for submitted and discarded attempts at import. Submit has enforced the cap since `d76cef5`, so no valid backup is refused.

**5. minor: two request ids that differ only in letter case both import, and a reply for one grades the other.**
- Where: `integrity.ts:34` (`REQUEST_UUID` has the `/i` flag) and `:82` (uniqueness compares exact strings). The score-block header is matched case-insensitively (`scoreParser.ts:86`, `:197`).
- Scenario: a crafted file holds request B whose id is request A's id in upper case. It imports. A reply written for A, pasted on B's page, confirms B's answers with A's scores.
- Fix: check uniqueness on `id.toLowerCase()`, or require lower case (`randomUUID` only produces lower case).

## Fix before merge if practical: grading feedback

Both are fail-safe for scores, which stay identical under every reader. They affect which feedback text is shown under a row.

**6. minor: a code fence opened on a list-item line flips the fence state.**
- Where: `src/domain/scoreParser.ts:391-416`. `FEEDBACK_FENCE_START` (`:93`) is tested on the trimmed line, so `- ```` isn't seen as an opener, but its indented closer is.
- Common case: a grader quotes the student's answer inside a list item (valid Markdown). Feedback for every row is dropped. Reproduced: the same reply with the fence on its own indented line attaches both rows' feedback; with `- ```` both are null.
- Rare case: if the student's own answer contains a line starting `I02:`, two such quotes cancel out and I02's feedback becomes the student's text plus I01's tip, shown as I02's correction. Grader headings the parser doesn't recognise (`**I02**: 2/3`) can do the same.
- Fix: treat a fence after a list marker as an opener. For prompt v3 and v4, attribute a heading only when it carries a `score/max` equal to the block's row (v4 already asks for `I01: {score}/max`). That also closes 7.

**7. minor: formatting skips the check that a heading's score matches the block.**
- Where: `scoreParser.ts:421-427`. `HEADING_SCORE` (`:95`) only matches right after `I01:`.
- Scenario: the feedback says `**I01:** 0/2`, `I01: **0/2**`, `I01: (0/2)` or `I01: Score 0/2`, and the block says 2/2. The "not met" assessment and its tip are shown under the confirmed 2/2. Reproduced for all four; only the bare `I01: 0/2` is caught.
- Fix: strip emphasis, brackets and a leading "Score" before testing, or use the heading rule from 6.

## Repair loop (learning logic, not security)

**8. major: a miss counts as repaired by a success the student answered before seeing the miss's correction.**
- Where: `src/domain/planner.ts:232-242`.
- Scenario: day 1, the student misses arg-0003.flaw and doesn't grade yet. Day 2, the planner can't see the ungraded miss and offers arg-0005.flaw (same skill and likely error) as a new task, which they get right. Day 3 they grade both. The success is later and in another session, so it clears the miss. The student never gets the check after the correction that SPEC §5.1.9 requires. The plan then repeats arg-0003.flaw with no repair first, and the results page says Premise has no unseen argument for that point, although some remain.
- Why: "different session" stands in for "after the correction" only when every session is graded before the next starts. The PR fixed the same-session case; this is the deferred-grading case.
- Fix: also require the success attempt's `startedAt` to be later than the miss's first grading (`createdAt` of its earliest grading, which `PlannerState` already holds).

**9. minor: two misses on one task with the same error use two repair slots, but one success clears both.**
- Where: `planner.ts:318`, `:343-345` against `:232-242`.
- Effect: two of four slots and two scarce unseen exercises go to one task, and the second repair is redundant.
- Fix: when a repair is placed, mark every open miss that task would clear as repaired.

## Phone and robustness

**10. minor (traced, not reproduced): no save when a phone tab is hidden or closed.**
- Where: `SessionPage.tsx:167-177`. The only guard is `beforeunload`, which iOS Safari doesn't reliably fire.
- Effect: text typed in the 400 ms before autosave, or left unsaved after a failed write, can be lost when the tab is closed or discarded in the background. This matters for the owner's phone session on an iPhone.
- Fix: call `flush()` on `visibilitychange` (when hidden) and on `pagehide`.

**11. minor, already in the live version: a grade confirmed while the device clock is far ahead locks the task after the clock is fixed.**
- Where: `ops.ts:696-703`, `:272`; `planner.ts:95`. `notBefore` only moves forward, and undo, discard and hide/show all leave it.
- Fix: in both eligibility checks, ignore a `notBefore` more than a day ahead.

**12. nit: far-future timestamps import, and then the next export can't be imported.** `backup.ts:52` has no upper bound. A submission dated 9999 plus one review pushes a due date past year 9999, which the timestamp check rejects. Fix: refuse timestamps far beyond `exportedAt`.

**13. nit: looking for old preview data can upgrade that old database.** `SettingsPage.tsx:175` and `:189` open `premise-preview` with the current schema, and Dexie adds missing tables and indexes. Stored records are untouched, and it only matters if a preview was ever deployed from a pre-`d76cef5` build. Fix: open it without a version and export the tables that exist.

**14. nits.**
- "Stay here" doesn't cancel a pending "Try saving and leave" (`SessionPage.tsx:419-424`).
- A failed Submit or Skip replaces the conflict message that tells the student to copy their text (`:466`, `:472`, `:483`, `:488`).
- A successful confirm clears a reply edited while the confirm was running (`RequestPage.tsx:443`).
- The new error page only catches render errors. `useLive` (`runtime.ts`) only logs a failed read, so that page shows "Loading…" forever.

## Checked and sound

- **Draft writes.** Save, submit and skip check the session, the entry, the attempt's fixed fields, its revision and its stored text in one transaction. A repeated submit succeeds only for the same text. Every replace-import case in the PR's tests behaves.
- **Ending vs opening a session.** Both are read-write transactions over sessions and attempts, so they can't interleave. Submitted answers stay reachable from Home.
- **Autosave and navigation.** Saves run one at a time and write the latest text. "Saved" shows only when the latest edit is stored. Link clicks wait for the save, and leaving with unsaved text needs an explicit click. Edits from another tab, a backup rollback, or same-revision different text are detected, and the local text is kept.
- **Confirming grades.** The reply is saved before the preview shows. `confirmRows` reparses the saved reply with the request's prompt version and matches score, tags and feedback exactly. Any mismatch aborts the whole transaction. Repeated operation ids are safe.
- **Prompt v4 / parser v3.**
  - `promptVersion` is required.
  - v2 and v3 prompt bytes are unchanged (3,000 random inputs with `$&`, `{{…}}`, CRLF).
  - Scores, statuses and choices are identical under parser 1, 2 and 3 on every fixture and 40,000 random replies.
  - The earlier reviewer's findings 1, 2, 4 and 5 now behave as triaged.
- **Backup import.**
  - Prototype-named keys are safe, and non-finite numbers are refused.
  - The stored prompt must equal an exact re-render.
  - Normal `d76cef5` backups import, and the PR's own export of normal data round-trips.
- **Schema.** Storage schema v1 and export schema 1 are unchanged.
- **Planner.** The Today plan never lists a task twice. The new "not due" and "already seen" rechecks mirror the planner's rules.
