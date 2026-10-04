# Roadmap

Status: draft v0.4 (2026-10-04, revised after peer review round 3). Milestones are ordered. Each ends with a peer review (`PEER_REVIEW.md`) before it is considered done.

## M0. Grading pilot (feasibility screen)
Test the central risk first: can a chatbot grade written answers well enough for the owner's own study, and is the copy-paste loop tolerable? No app UI or storage yet.
- 8 exercises covering `conclusion`, `flaw` and `assumption`, with anchors, drafted and approved by the owner. At least two whole exercises, covering all three skills, are set aside as the holdout.
- The owner answers them, then deliberately writes the answer types in `GRADING_PROTOCOL.md` §9: at least 12 answers per skill, with acceptable-score sets for genuinely ambiguous ones.
- The pure prompt builder (`src/domain/prompt.ts`) and snapshot hashing are written now, with unit tests, and run from a small script; there is no second builder. The owner pastes the prompts into two or three chatbots, on phone and PC, twice each with different row orders.
- Prompt wording, rubrics and the candidate chatbot configuration are frozen on the development exercises before the holdout run. A prompt change bumps the prompt version.
- Every input, prompt, raw reply and hand-checked parse result is saved under `tests/fixtures/pilot/`. Grades, disagreements, feedback matches and every moment of friction go in `pilot/LOG.md`.
- Before the holdout run: the expected parse and feedback results for the development replies are frozen as fixtures.
- **Done when** the §9 metrics are reported with counts and denominators, and one outcome is recorded in `DECISIONS.md`:
  1. **Proceed with chatbot**: name the chatbot, client, prompt version and batch size. Requires the §9 screening targets on the holdout.
  2. **Proceed with self-grading only**: the app is built with chatbot grading as an optional extra.
  3. **Revise and repeat**: change the prompt or rubrics; the old holdout becomes regression material; repeat on fresh held-out exercises.
  4. **Stop chatbot grading**: results are inconclusive or poor; rethink before building.
- M0 does not calibrate the scheduler; it has no review history. That is assessed in M3.

## M1. Scaffold and content pipeline
- Vite + React + TypeScript (strict), ESLint, Prettier, Vitest, Playwright (Chromium, WebKit), CI, GitHub Pages with hash routing.
- Zod schema for exercise format schema 3, `scripts/build-content.ts`, hashing, validation rules, drafts excluded from production.
- Basic About page: source link, deployed commit, licenses.
- **Done when:** `npm run check` passes in CI; the deployed site loads a deep link and shows the About page; each validation rule in `EXERCISE_FORMAT.md` §4 has a failing-fixture test, including task status, retired-key reuse, approval revision and the independent-approver rule.

## M2. Vertical slice
Answer → autosave → submit → copy → paste → validate → confirm once → see results → export → replace-import.
- Storage schema v1 with the invariants in `ARCHITECTURE.md` §5.1, sessions with exact resume, `prepareGrading`, the parser with the full fixture suite (including the pilot fixtures), the shared grade validator, self-grading with disqualifiers, manual entry, the grading operations in `ARCHITECTURE.md` §6.2, and the privacy disclosure before the first copy.
- Scheduling uses rating policy v1 and scheduler `fsrs-1`; the UI shows only "due again on <date>".
- **Done when:** fixture suite passes; unit tests cover each §6.2 operation with a repeated `opId` (including after a simulated crash before acknowledgement) and a stale revision; a fixture covers first review → suspend → undo → discard and checks the suspension and next-day restriction survive; import rejects deliberately inconsistent exports for each §5.1 invariant; Playwright covers double-confirm, confirm from two tabs, confirm versus discard, stale confirm after undo, repeated correction, repeated undo, identical re-paste, conflicting re-paste, partial grading, a needs-review row resolved later, reload mid-session, failure halfway through save, and export then replace-import restoring an unfinished session and a partially graded request; the owner completes one real session on their phone.

## M3. Daily use
- Today mix with new-stimulus preference, due reviews, next-day eligibility, sibling spacing, suspend, coached retries, correction and undo, flags, Awaiting grading list, backup prompts, persistent storage request.
- Review the rating policy and scheduler with real use: daily review load, repeated failures, grade corrections, and success on the first review after feedback.
- **Done when:** the owner uses it daily for two weeks, the friction log has no "would stop me" items open, and the rating-policy review is recorded in `DECISIONS.md`.

## M4. Progress, PWA and polish
- Progress counts per `SPEC.md` §5.4; PWA with prompt-to-update; full About page (how grading works, source credits); manual accessibility checks.
- **Done when:** first-release success criteria in `SPEC.md` §8 are being tracked.

## M5. Content to 50 and more skills
- Grow to 50 approved exercises; add `weaken`, `strengthen`, `principle`, then passage skills, each with its own small grading pilot before release.

## Later (not scheduled)
Transfer checks on held-out tasks, merge import or sync, optional hosted one-click grading, writing practice, contributor tooling, opening to other users.
