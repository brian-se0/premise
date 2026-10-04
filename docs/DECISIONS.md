# Decision Log

Newest first. Each entry: date, decision, why, and what it rules out. Reopening a decision needs a new entry, not an edit.

## 2026-10-04 — Build the app before the grading pilot finishes
The owner chose to build the app end to end (M1 onward) without first finishing M0: the 12-approved-exercise bar, the holdout run and the M0b outcome are deferred, not dropped. Until an M0b outcome is recorded, the app treats chatbot grading as provisional and self-grading as always available. **Why:** the owner understood the exercise format from a short walkthrough and wants a working loop to study with; the pilot measurements are easier to run from the app than by hand. **Rules out:** recommending a chatbot to anyone before M0b is recorded; opening to other students before M3.

## 2026-10-04 — Published-task ledger
`content/published-tasks.json` records every task ever published with its skill, max, status and each snapshot hash it has had. `npm run content` fails when a published task is missing from it, changed without being recorded, changes skill or max under the same key, or returns from retired to active; `npm run content -- --lock` records the current state. **Why:** `EXERCISE_FORMAT.md` §4 rule 12 needs a memory of past publications, and git history is not available to the build in every checkout. What a task "tests" cannot be machine-checked; skill and max are the checkable part, and wording edits are recorded, not blocked. **Rules out:** relying on reviewers alone to catch a reused key.

## 2026-10-04 — Stack versions at scaffold
Vite 8.3, React 19.3, React Router 8.4 (hash router), Zod 4.6, Vitest 5.0 (4.x does not support Vite 8), ESLint 10 with typescript-eslint, Prettier 3.9, Playwright 1.63, pinned exactly. The Content Security Policy meta tag is added to built pages only, because the dev server needs inline styles and a socket. **Why:** `ARCHITECTURE.md` §2 asks for versions current at scaffolding, pinned.

## 2026-10-04 — Positioning: targeted reasoning repair with a final-weeks mode
The owner chose this over a final-weeks-only product, after a GPT-6 Pro consultation (`reviews/2026-10-04-difficulty-and-niche.md`). Premise targets students past the basics who understand explanations but keep missing the same reasoning move; it gives one correction, then checks the same point on a fresh argument. A time-capped final-weeks mode serves the last stretch. Conclusion tasks become a selective diagnostic, worth 1 point for identifying the conclusion; the prompt no longer says "not the reasons", and extra reasons don't lose credit unless they make the conclusion ambiguous. Task-level difficulty and difficulty notes are added to schema 3 (no exercise was published yet). Authoring rules for difficulty and a necessary-assumption check go into the content guidelines. The roadmap splits M0 into content validity then grading feasibility, brings strengthen and weaken forward, and adds an M3 usefulness pilot with a few students past the basics before daily-use polish. **Why:** the owner found a signposted conclusion task too easy; the reviewer found five answer keys defective and argued that usefulness, not difficulty alone, is the product's open risk. **Rules out:** making every task hard; treating final weeks as the only audience.

## 2026-10-04 — Three flaw tags added
`unrepresentative-sample`, `part-to-whole` and `attacks-source` join the error tags. **Why:** the pilot exercises test these flaws and no existing tag named them.

## 2026-10-04 — Spec v0.4 after peer review round 3
GPT-6 Pro reviewed spec v0.3: of the 20 round-2 findings, 12 resolved and 8 partly; 8 new findings (2 blockers, 2 major, 4 minor), all accepted; see `reviews/2026-10-04-specs-v0.3.md`. Changes: an `operations` receipt table so every grading operation can be retried by id; student task controls (`suspended`, `notBefore`) moved out of the scheduler card into `taskStates`, so undo never loses them; new cross-table invariants; self-grading-only requests with no prompt for oversized items; a fixed representative for identical score blocks; per-run screening targets with stated denominators; the approval hash covers all exercise fields except status and approval bookkeeping; independent approval is per exercise. **Why:** the reviewer judged storage schema v1 not safe to freeze without these, and M0's holdout not ready to use without the measurement definitions. **Rules out:** event sourcing or replay built on the receipts.

## 2026-10-04 — Spec v0.3 after peer review round 2
GPT-6 Pro reviewed spec v0.2 (verdict: not ready; 2 blockers, 14 major, 4 minor; of the 27 round-1 findings, 11 resolved and 16 partly). All 20 new findings were accepted; see `reviews/2026-10-04-specs-v0.2.md`. Exercise schema 3; prompt version stays v2; parser version 1.

## 2026-10-04 — Grading state model
Gradings are revisions with their own ids; each attempt has one current grading and at most one active review, and each review log stores the card state before it so the latest review can be undone exactly. "Needs review" is not terminal: a request stays open until every row is accepted or discarded. Every grading change is an operation with an id and an expected attempt revision, run in one IndexedDB transaction. Submitted attempts are frozen and belong to one request. **Why:** v0.2 could not store a correction's history, closed requests that still needed action, and treated "same score" as idempotency. **Rules out:** a history-replay engine, post-confirm rating changes in v1.

## 2026-10-04 — Scheduler fsrs-1 and next-day eligibility
ts-fsrs with retention 0.9, maximum interval 365 days, no fuzz, no short-term steps, default weights copied into the repo. A confirmed task is not offered again before the next local day. Review time stays the submission time. **Why:** delayed grading must not let a student be "reviewed" on an answer they just read. The rating policy is reassessed with M3 usage, not M0. **Supersedes:** "calibrated with pilot data" in Rating policy v1.

## 2026-10-04 — M0 is a feasibility screen with four outcomes
The pilot holds out whole exercises, reports counts with uncertainty, treats `?` and invalid rows as non-decisions, and ends in one of: proceed with a chatbot, proceed with self-grading only, revise and repeat on fresh exercises, or stop. The M0 pilot uses the app's own pure prompt builder, and its replies become golden fixtures. **Why:** nine held-out answers cannot establish a 10% error rate, and two prompt builders could drift.

## 2026-10-04 — Approval bound to content revision
Publishing requires `approved_revision` matching the exercise's current content hash; any edit needs re-approval. Approvers come from `content/maintainers.yaml`; once a non-maintainer contributes to an exercise, its approver must not be one of its contributors. Tasks can be retired individually. **Why:** v0.2 approval survived later edits.

## 2026-10-04 — Privacy wording, revised
"Premise does not upload your answers or progress; it only downloads its own app files." **Supersedes:** "sends nothing" in the earlier Privacy wording entry, which overstated it.

## 2026-10-04 — Spec v0.2 after peer review round 1
GPT-6 Pro reviewed spec v0.1 (verdict: ready with changes; 4 blockers, 22 major, 1 minor). All 27 findings were accepted; see `reviews/2026-10-04-specs-v0.1.md`. The decisions below record the ones that change earlier entries or set new rules.

## 2026-10-04 — Grading integrity rules
Grading requests have UUIDs and frozen content snapshots; score rows use request-local ids; invalid scores are never repaired; confirm is one idempotent transaction; corrections undo and reapply. Prompt version v2, exercise schema v2. **Why:** the v0.1 rules could turn invalid or stale replies into full credit and apply a review twice. **Rules out:** clamping, task-id-keyed rows, short codes as keys.

## 2026-10-04 — Rating policy v1
Full credit → Good (student may choose Hard or Easy); anything less → Again; needs-review and coached attempts create no review. Review time is the answer's submission time. **Why:** partial credit is not "correct but hard" in FSRS terms. Provisional; to be calibrated with pilot data. **Supersedes:** the ratio mapping in spec v0.1.

## 2026-10-04 — Grading pilot before app code
Roadmap now starts with M0, a manual grading pilot, then a vertical slice. Merge import, charts, the 100-exercise target and chatbot endorsements are cut from the first release. **Why:** grading quality and the copy-paste loop are the central risks.

## 2026-10-04 — Content sources narrowed
CC BY-SA removed from allowed sources; CC BY 4.0, original writing, federal-employee works, court opinions and pre-1931 public-domain editions remain, with full provenance fields. Public-domain and CC BY text keeps its own status. **Why:** BY-SA material cannot be relicensed under NonCommercial terms.

## 2026-10-04 — License rationale, corrected
The licenses stay (code AGPL-3.0-only, contributed content CC BY-NC-SA 4.0). Corrected rationale: AGPL keeps the code and any hosted modifications open, but does not forbid commercial use; NC-SA restricts commercial reuse only of content the project can license. A contributor agreement matters only if the owner later wants to offer the code or content under other terms; its exact grant will be written, with legal review, before any outside contribution is accepted. **Supersedes:** the rationale in the earlier Licenses entry.

## 2026-10-04 — Privacy wording
"Premise stores progress only on this device and sends nothing. When you paste a grading prompt into another service, that service receives your answers under its own terms." Manual pasting is not a claim of compliance with any chatbot's terms. **Supersedes:** "no personal data held" and "stays within each service's terms" in earlier entries.

## 2026-10-04 — Peer review by a second model
Specs and milestone pull requests get a review from a second AI model (GPT-6 Pro, via the owner's ChatGPT) using `docs/PEER_REVIEW.md`. **Why:** a different model catches blind spots. **Rules out:** merging contract changes without a review round.

## 2026-10-04 — Licenses
Code AGPL-3.0-only; exercise content CC BY-NC-SA 4.0. **Why:** keeps the project open while discouraging closed commercial clones and resale of the exercise library. The owner, as copyright holder, can still offer a paid version; outside contributions will need a contributor agreement to keep that option. **Rules out:** MIT/Apache for code; CC BY for content.

## 2026-10-04 — Static app, no server
Vite/React/TypeScript static site on GitHub Pages; IndexedDB storage with export/import; ts-fsrs scheduling. **Why:** copy-and-paste grading removes the need for any backend, so there is no cost, no accounts and no personal data held. **Rules out:** accounts and sync in v1.

## 2026-10-04 — Copy-and-paste grading with a score block
The app builds a grading prompt; the student pastes it into any chatbot; the reply ends with a fixed-format score block the student pastes back. Batch grading by default, per-question available. **Why:** zero AI cost, works with any chatbot the student already uses, stays within each service's terms because the student does the pasting. **Rules out:** API keys and hosted AI in v1.

## 2026-10-04 — Free-response reasoning trainer
Students write conclusions, assumptions, flaws and main points for original or public-domain arguments and passages, graded against reference answers and rubrics. **Why:** trains producing answers rather than recognizing them, which official multiple-choice practice does not, and AI grades written answers against a reference far more reliably than it writes multiple-choice questions. **Rules out:** a multiple-choice question bank.

## 2026-10-04 — No official content, no test branding
No LSAC questions or paraphrases; no "LSAT" or LSAC marks in the name, UI or marketing. **Why:** LSAC licenses and enforces its content and marks (Law360, 2026-07-07: LSAC sued a test-prep company in the Eastern District of Pennsylvania over unpaid licensing fees and trademark use in digital offerings; https://www.law360.com/articles/2497915), and duplicating LawHub adds nothing. **Rules out:** a LawHub companion that references official questions.
