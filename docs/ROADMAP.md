# Roadmap

Status: draft v0.2 (2026-10-04, revised after peer review round 1). Milestones are ordered. Each ends with a peer review (`PEER_REVIEW.md`) before it is considered done.

## M0. Grading pilot (no app code)
Test the central risk first: can a chatbot grade written answers well enough, and is the copy-paste loop tolerable?
- 8 exercises covering `conclusion`, `flaw` and `assumption`, with anchors, drafted and approved by the owner.
- The owner answers them, then deliberately writes alternative-valid, partial, wrong and disqualified answers: at least 12 answers per skill.
- A small script (`pilot/build-prompt.mjs`) builds prompt-v2 text from the files; the owner pastes it into two or three chatbots, on phone and PC, twice each.
- Log every grade, every disagreement with the owner's own grade, and every moment of friction in `pilot/LOG.md`.
- **Done when:** metrics from `GRADING_PROTOCOL.md` §9 are computed for each chatbot, the prompt is revised once if needed, and the owner decides to proceed with a named chatbot and batch size.

## M1. Scaffold and content pipeline
- Vite + React + TypeScript (strict), ESLint, Prettier, Vitest, Playwright (Chromium, WebKit), CI, GitHub Pages with hash routing.
- Zod schema for exercise format v2, `scripts/build-content.ts`, hashing, validation rules, drafts excluded from production.
- **Done when:** `npm run check` passes in CI; the deployed site loads a deep link; each validation rule has a failing-fixture test.

## M2. Vertical slice
Answer → autosave → submit → copy → paste → validate → confirm once → see results → export → replace-import.
- Storage schema v1, sessions with exact resume, frozen grading requests, parser with the full fixture suite, self-grading, manual entry, one-transaction confirm.
- Scheduling uses rating policy v1 but the UI shows only "due again on <date>".
- **Done when:** fixture suite passes; Playwright covers double-confirm, identical re-paste, conflicting re-paste, partial grading, reload mid-session, failure halfway through save, export then replace-import restoring an unfinished session and a partially graded request; the owner completes one real session on their phone.

## M3. Daily use
- Today mix, due reviews, sibling spacing, suspend, coached retries, correction and undo, flag, Awaiting grading list, backup prompts, persistent storage request, privacy disclosure.
- **Done when:** the owner uses it daily for two weeks and the friction log has no "would stop me" items open.

## M4. Progress, PWA and polish
- Progress counts per `SPEC.md` §5.4; PWA with prompt-to-update; About page with source link and deployed commit; manual accessibility checks.
- **Done when:** first-release success criteria in `SPEC.md` §8 are being tracked.

## M5. Content to 50 and more skills
- Grow to 50 approved exercises; add `weaken`, `strengthen`, `principle`, then passage skills, each with its own small grading pilot before release.

## Later (not scheduled)
Transfer checks on held-out tasks, merge import or sync, optional hosted one-click grading, writing practice, contributor tooling, opening to other users.
