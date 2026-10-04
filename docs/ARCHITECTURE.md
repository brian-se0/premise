# Architecture

Status: draft v0.4 (2026-10-04, revised after peer review round 3).

## 1. Shape

A static single-page app. Content is compiled into the bundle at build time; all user data lives in IndexedDB. After load, the app makes no network requests other than downloading its own files (including through the service worker). It never uploads answers or progress.

```
content/*.md ──(build-content: parse, validate, hash)──▶ src/generated/content.json
                                                              │
   Browser ───────────────────────────────────────────────────┼─────────────────────
   UI (React) ──▶ domain (pure TS) ──▶ storage (Dexie / IndexedDB)
                     │
                     ├─ session planner  (due + new tasks ─▶ ordered session entries)
                     ├─ prompt builder   (attempts ─▶ frozen grading requests + clipboard text)
                     ├─ score parser     (raw reply + request ─▶ row results + feedback ranges)
                     ├─ grade validator  (one rule set for parsed, manual, self and imported grades)
                     └─ scheduler        (accepted grading ─▶ review log + card)
```

## 2. Stack

Versions current on 2026-10-04; pin exact versions in `package.json` when scaffolding.

| Concern | Choice |
| --- | --- |
| Build | Vite 8, TypeScript (strict) |
| UI | React 19, React Router in hash mode |
| Storage | Dexie 4 over IndexedDB |
| Validation | Zod 4 (content schema, export schema) |
| Front matter | `yaml` package, build script only |
| Scheduling | ts-fsrs 5, configuration pinned in `src/domain/schedulerConfig.ts` (§6.5) |
| Offline / install | vite-plugin-pwa, prompt-to-update (added in M5) |
| Unit tests | Vitest |
| End-to-end | Playwright on Chromium and WebKit |
| Hosting | GitHub Pages via GitHub Actions, Vite `base` set to the repo path |

No CSS framework: plain CSS modules with design tokens on `:root`, light and dark themes.

## 3. Repository layout

```
/
├─ AGENTS.md, CLAUDE.md, README.md, CONTRIBUTING.md, LICENSE
├─ content/
│  ├─ LICENSE.txt            CC BY-NC-SA 4.0
│  ├─ maintainers.yaml       handles allowed to approve exercises
│  ├─ taxonomy.yaml
│  └─ exercises/*.md
├─ docs/
├─ reviews/                  peer-review packets, responses and triage
├─ pilot/                    M0 grading pilot materials and log
├─ scripts/build-content.ts
├─ src/
│  ├─ domain/                pure logic: types, snapshot, planner, prompt, scoreParser, gradeValidator, scheduler, progress
│  ├─ storage/               Dexie schema, transactions, export/import
│  ├─ ui/
│  └─ generated/             build output, git-ignored
├─ tests/{unit,fixtures/replies,fixtures/pilot,e2e}/
└─ prompt-eval/
```

## 4. Domain rules

- `src/domain` is pure: no DOM, storage, network or clock. Time and ids are passed in.
- The UI never builds prompt text, parses replies, validates grades or computes schedules itself.
- The M0 pilot script uses the app's own prompt builder and snapshot modules; the app's parser must reproduce the pilot's hand-checked results (`ROADMAP.md` M0).

### 4.1 Content snapshots

A snapshot freezes everything needed to show, grade and count one task. Its payload (snapshot format `1`) is:

`snapshotFormat, taskId, exerciseId, kind, skill, difficulty, stimulus, credit, prompt, max, reference, accept, disqualifiers, rubric, anchors, allowedTags`

- `credit` is the output of the shared credit formatter (`EXERCISE_FORMAT.md` §7), or null.
- The hash is SHA-256 over the payload serialized as JSON with keys sorted, no insignificant whitespace, strings exactly as built (no Unicode normalization), arrays in authored order. It is written as lowercase hex.
- Fields that are not part of the payload, such as `firstSeenAt`, are stored beside it and never hashed.
- Because `taskId` is in the payload, two tasks with identical grading text still get different hashes.
- Import recomputes every snapshot hash and rejects the file if any differs.

## 5. Data model (IndexedDB, schema v1)

| Table | Key | Fields |
| --- | --- | --- |
| `snapshots` | `hash` | the §4.1 payload, `firstSeenAt` |
| `sessions` | `id` (uuid) | `entries` (ordered list of `{ taskId, attemptId }`; `attemptId` null until the task is opened), `cursor`, `createdAt`, `endedAt`, `mode` (`today` \| `new` \| `library` \| `retry`; a `retry` session makes coached attempts) |
| `attempts` | `id` (uuid) | `sessionId`, `taskId`, `snapshotHash`, `answer`, `state` (`draft` \| `submitted` \| `skipped` \| `discarded`), `kind` (`new` \| `review` \| `coached`), `stimulusSeenBefore` (bool), `ratingChoice` (`good` \| `hard` \| `easy`, default `good`), `requestId` (nullable), `currentGradingId` (nullable), `revision` (int; draft saves increment it too), `startedAt`, `submittedAt`, `updatedAt`, `elapsedSeconds` (opening to submission; recorded for the final-weeks timer, never graded) |
| `requests` | `id` (uuid) | `label`, `rows` (rowId → attemptId), `snapshots` (rowId → snapshot hash), `fence`, `promptVersion`, `promptText` (null for a self-grading-only request; `GRADING_PROTOCOL.md` §2), `createdAt`, `status` (`open` \| `closed` \| `abandoned`) |
| `replies` | `id` (uuid) | `requestId`, `raw`, `pastedAt`, `parserVersion`, `selectedBlock` (`{ start, end }` or null), `parseOutcome` (`clean` \| `recoverable` \| `manual`) |
| `gradings` | `id` (uuid) | `attemptId`, `requestId`, `replyId` (nullable; a reply of the same request), `opId`, `score` (int or null), `max`, `tags[]`, `status` (`accepted` \| `needs-review` \| `superseded`), `source` (`parsed` \| `manual` \| `self`: who set the score), `disqualified` (bool, self-grading only), `feedbackRange` (`{ start, end }` into the linked reply, or null; needs a `replyId`), `createdAt` |
| `reviewLogs` | `id` (uuid) | `taskId`, `attemptId`, `gradingId`, `opId`, `rating`, `ratingPolicy`, `schedulerVersion` (the scheduler that computed `cardAfter`), `reviewedAt` (= attempt `submittedAt`, always), `cardBefore` (the whole card before this review including its own `schedulerVersion`, or null if no card existed), `cardAfter` (its `last_review` is the effective scheduler time, §6.4), `appliedAt` (wall-clock time the review was applied; display only), `seq` (application order, §6.2; unique), `undone` (bool) |
| `cards` | `taskId` | ts-fsrs card fields, `schedulerVersion` (scheduler state only; may be deleted by undo) |
| `taskStates` | `taskId` | `suspended`, `notBefore` (local date; see §6.4). Student controls, never deleted by undo or correction |
| `flags` | `id` (uuid) | `attemptId`, `snapshotHash`, `category` (`unfair-grade` \| `content-problem` \| `other`), `note`, `createdAt` |
| `operations` | `opId` | `name`, `affectedIds`, `resultingRevisions` (attemptId → revision), `result` (the immutable value returned to the UI), `createdAt` |
| `schedulerConfigs` | `version` | `config`: the configuration of a scheduler version this app's bundle does not define, kept from an import so history stays readable and re-exports (§7) |
| `settings` | `key` | `gradingMode`, `batchSize`, `finalWeeks`, `timerEnabled`, `timerSeconds`, `dailyReviewCap`, `focus` (`{ tag, note }`), `disclosureSeen`, `lastExportAt`, `persistGranted`. `disclosureSeen` and `persistGranted` are device-local (§7) |

Ranges are offsets in UTF-16 code units into the stored `raw` string, start inclusive, end exclusive (the native JavaScript string index), with `0 ≤ start ≤ end ≤ raw.length`.

Timestamps are canonical UTC ISO 8601 strings exactly as `Date.prototype.toISOString` writes them (`2026-10-04T12:00:00.000Z`), so string order is time order. Import refuses any other form.

Schema v1 is not frozen yet and holds no user data, so it is still edited in place (Dexie version 1, no migration).

### 5.1 Invariants

The grade validator and import both enforce these:

1. **Attempts are frozen at submission.** `answer`, `snapshotHash`, `taskId`, `kind` and `submittedAt` never change after `state` leaves `draft`. Trying again creates a new attempt.
2. **One owning request per attempt.** An attempt appears in at most one request, once. `attempt.requestId` and the request's `rows` agree.
3. **One current grading per attempt.** `currentGradingId` points to the attempt's only grading whose status is not `superseded`. Older revisions stay, marked `superseded`.
4. **At most one active review per attempt.** At most one review log per attempt has `undone: false`, and it points to the attempt's current grading, which is `accepted`.
5. **Accepted means valid.** An `accepted` grading has an integer score with `0 ≤ score ≤ max`, `max` equal to the snapshot's `max`, and only tags allowed by the snapshot. A `needs-review` grading has a null score.
6. **Session entries name their attempt.** Each attempt appears in at most one session entry; that entry's `taskId` matches the attempt's, and the attempt's `sessionId` is that session.
7. **Snapshots agree.** For every request row, `request.snapshots[rowId]` equals the attempt's `snapshotHash`, and `rows` and `snapshots` have the same row ids. A snapshot's `taskId` equals the `taskId` of every attempt that references it. A review log's `taskId` and `attemptId` match its grading's attempt.
8. **Disqualified means zero.** A grading with `disqualified: true` has `source: self` and score 0.

Import also checks, locally and without replaying history (§7):

- **Provenance.** A grading's reply belongs to the grading's request; feedback and selected-block ranges lie inside their reply; a flag's snapshot exists and is its attempt's.
- **Lifecycle.** Only `submitted` and `discarded` attempts have `submittedAt`, a request or gradings. A discarded attempt has no accepted grading and no active review. A coached attempt has no review log. An accepted, uncoached current grading has its active review, whose rating follows from the grading by the rating policy.
- **Grades.** Every grading revision passes the shared grade validator (max equals the snapshot's, allowed and non-repeating tags, a null score only from a parsed reply); `needs-review` means a parsed null score.
- **Cards.** A task's active reviews, in `seq` order, chain: the first has `cardBefore` null and each later one's `cardBefore` is the previous one's `cardAfter` with its version. The card equals the latest one's `cardAfter`; a task with no active review has no card.
- **Time.** A review log's `reviewedAt` equals its attempt's `submittedAt`, and `cardAfter.last_review` is the effective time of §6.4.

### 5.2 Row and request states

A request row's state is derived from its attempt:

| Row state | Condition |
| --- | --- |
| `pending` | attempt `submitted`, no current grading |
| `needs-review` | current grading is `needs-review` |
| `accepted` | current grading is `accepted` |
| `discarded` | attempt `discarded` (any needs-review grading stays in history, never counted as a result) |

Transitions: `pending → needs-review → accepted`, `pending → accepted`, and `pending` or `needs-review → discarded`. Nothing leaves `accepted` except a correction (§6.3), which yields a new `accepted` revision, or an undo, which supersedes the grading and returns the row to `pending` (reopening its request).

A request is `open` while any row is `pending` or `needs-review`. It becomes `closed` when no row is. It becomes `abandoned` when the student discards the whole request; that discards its pending and needs-review rows and leaves accepted rows untouched. Open requests appear in **Awaiting grading** with their pending and needs-review counts.

A task with an attempt in `pending` or `needs-review` is not offered for practice until that row is accepted or discarded.

## 6. Grading and scheduling

### 6.1 Rating policy `v1`

Provisional; reassessed with M4 daily-use data (M0 cannot calibrate it).

| Grading | Rating |
| --- | --- |
| Full credit | The attempt's `ratingChoice`: Good by default; the student may pick Hard or Easy **before** confirming |
| Less than full credit | Again |
| Needs review, or `kind: coached` | No review event |

Changing the rating after confirming is not supported in v1; it goes through Correct grade.

### 6.2 Operations

Every grading mutation is a named operation with a client-generated `opId` and the attempt `revision` the UI last read:

| Operation | Effect |
| --- | --- |
| `openEntry(sessionId, index)` | Creates the entry's draft attempt the first time, after rechecking eligibility (§6.4) in the same transaction. Returns the attempt, the competing draft, or why the task is not eligible; it writes nothing unless it opens. |
| `saveDraft(attemptId, revision, answer)`, `submitAttempt(attemptId, revision, answer)` | Check and increment the draft's revision, so one tab never overwrites another. Submitting again with the submitted text returns the stored attempt; different text is refused as a distinct conflict. |
| `saveReply(requestId, reply)` | Stores a reply the student read even when it gave no usable scores, so manual or self grades after it keep the raw text and can link to it. |
| `prepareGrading(attemptIds)` | Creates the request(s) for these submitted, unowned attempts (`GRADING_PROTOCOL.md` §2). Used by Copy and by Grade it myself. Re-running for already-owned attempts returns the existing requests and their stored prompt text. |
| `confirmRows(requestId, rows)` | For each row, writes a grading revision; for an accepted, uncoached row, appends a review log and updates the card; sets `notBefore` (§6.4). Updates request status. Each attempt may appear once and must be a row of this request. A row links to the reply saved with it, or to a stored reply of the request, or keeps its needs-review grading's reply and range. |
| `correctGrade(attemptId, grading)` | Replaces the current accepted grading with a new accepted revision (§6.3). |
| `undoLatest(attemptId)` | Undoes the attempt's active review, if it is its card's latest; the grading becomes `superseded`, `currentGradingId` is cleared and the row returns to `pending`. |
| `discardRows(requestId, rows)` / `abandonRequest(requestId, revisions)` | Moves pending or needs-review rows to `discarded`. `abandonRequest` takes every row's revision as the student saw it. |
| `setTaskControls(taskId, controls)` | Suspends or resumes a task; edits `taskStates` only. |
| `setTags(attemptId, tags)` | Writes a new grading revision with the same score and status; no scheduling change. |

Rules for all of them:

- Each runs in **one IndexedDB read-write transaction** covering every table it reads or writes. Existence checks, revision checks, latest-review checks and writes all happen inside it. IndexedDB serializes overlapping read-write transactions on the same tables, so no other locking is needed. Clipboard writes and other async work happen outside the transaction.
- **Receipts.** Every successful operation writes an `operations` receipt in the same transaction as its changes.
- **Same `opId` again** (double tap, retry after a crash): the receipt is checked first, before any revision check, and its recorded result is returned without writing.
- **Stale revision** (another tab, or an undo, changed the attempt since the UI read it, and there is no receipt for this `opId`): the operation writes nothing and the UI reloads the row and says what changed. A stale confirm never becomes a new review.
- Receipts are a result ledger for retries, not an event log; nothing is replayed from them.
- Every successful operation increments `revision` on each attempt it changes.
- **Row sets.** An operation over several rows refuses, before writing anything, a row set that repeats an attempt or names one outside the request.
- **Application order.** Each review log gets `seq`, one more than the highest `seq` of any stored review log, assigned inside the applying transaction, so it strictly increases in the order reviews were applied. "Latest review" always means the highest `seq` among a task's active reviews. Timestamps (`appliedAt`, `reviewedAt`) and ids never order reviews: device clocks can repeat or move backwards, and ids are random.

### 6.3 Correction and undo

- **Correct grade** is allowed only when the row is `accepted` (pending and needs-review rows are resolved with `confirmRows`; discarded rows are final), the replacement has a valid score, and the attempt has no active review or its active review is the card's latest (by `seq`). Otherwise the UI explains that older grades are locked. In one transaction: mark the review log `undone`, restore the card exactly from its `cardBefore`, scheduler version included (deleting the card if `cardBefore` is null), mark the old grading `superseded`, then apply the new grading as in `confirmRows` but without the confirmation-only `notBefore` update: correction leaves `taskStates` untouched. The new revision keeps the corrected grading's `replyId` and `feedbackRange`; its `source` says who set the new score.
- **Undo** does the same restore without applying a new grading. Discarded rows cannot be undone, corrected or re-tagged.
- Repeated corrections stack revisions; each one undoes only the review it replaces.
- A general history-replay engine is out of scope.

### 6.4 Review time and study eligibility

- **Review time** (`reviewedAt`) is the attempt's `submittedAt`: what the student knew when they answered. Grading may arrive days later. It is stored unchanged in every case.
- **Out-of-order grades.** If an attempt is confirmed after a later-submitted attempt of the same task was already reviewed, the review is still applied on top of the current card (no replay), and the scheduler runs at the later of `reviewedAt` and the card's `last_review`, so elapsed time is never negative. That effective time is recorded as `cardAfter.last_review`; `reviewedAt` keeps the submission time.
- **Eligibility** is separate: after a grading is confirmed, the task's `taskStates.notBefore` becomes the next local date after confirmation. A task is offered only when it is due (or new), not suspended, and today is on or after `notBefore`, so a student is never re-tested on an answer they have just read. Undo and correction never clear or set it.
- **Eligibility is rechecked when work is opened**, not only when a session is planned: `openEntry` creates an uncoached attempt only if, in its own transaction, no other uncoached draft of the task exists, the task is not suspended, it has no submitted attempt still pending or needing review, and today is on or after `notBefore`. A competing draft is returned instead of creating a second attempt, so its text is never lost. A `retry` session (coached attempts, never scheduled) is the one explicit exception.

### 6.5 Scheduler configuration

`schedulerConfig.ts` exports a registry of scheduler versions. Version `fsrs-1`:

| Setting | Value |
| --- | --- |
| `request_retention` | 0.9 |
| `maximum_interval` | 365 days |
| `enable_fuzz` | false |
| `enable_short_term` | false (whole-day intervals only; one practice session a day is the expected use) |
| `w` | the default parameters of the pinned ts-fsrs version, copied into the file |

Timestamps are stored as UTC ISO 8601. Day boundary is local midnight. A card is due on a local date when its due time falls on or before the end of that date. Due reviews are shown in due order; overdue cards stay due. Adding a scheduler version or changing parameters requires a `DECISIONS.md` entry.

## 7. Export and import

```json
{ "app": "premise", "schemaVersion": 1, "exportedAt": "…", "appVersion": "…",
  "snapshots": [], "sessions": [], "attempts": [], "requests": [], "replies": [],
  "gradings": [], "reviewLogs": [], "cards": [], "taskStates": [], "flags": [],
  "operations": [], "settings": [],
  "schedulerConfigs": {} }
```

- `schedulerConfigs` carries the full configuration of every scheduler version referenced in the file (by cards, review logs and their `cardBefore`). Import refuses a file that omits one, or that defines a version this app knows differently from the app. Configurations of versions the app does not know are stored in the `schedulerConfigs` table and exported again.
- **Device-local settings.** `disclosureSeen` and `persistGranted` describe this browser, not the student's data: export leaves them out, import ignores them if present, and replacement keeps this device's values.
- **Replace-only import** in v1. Steps: validate, show a summary (counts, date range, newest activity), offer to export the current data first, then replace everything in one transaction.
- Validation: Zod shape; known settings validated by key (unknown keys refused); unique ids and `seq`s; every reference resolves (attempt → snapshot, attempt → session, grading → attempt, grading → reply, review log → grading, flag → attempt and snapshot, session entry → attempt); snapshot hashes recompute (§4.1); the §5.1 invariants and the import checks after them hold, tested with deliberately inconsistent fixtures; request status matches the §5.2 rule; timestamps are canonical UTC (§5); scheduler numbers are finite; the file is at most 50 MB in bytes. The UI checks `File.size` before reading the file (`checkImportFile`); text callers are checked by UTF-8 byte length. Newer schema versions are refused with a clear message.
- A file referencing a scheduler version this app does not know is imported, and its history stays readable, but correction and undo of reviews made under that version are refused. New reviews always use the app's current version, starting from the stored card's fields whatever version produced them; their `cardBefore` keeps the old version, so undoing them restores the imported card exactly.
- Snapshots travel in the export, so history survives even if an exercise is later retired or removed.
- Merge import is out of scope until conflict rules are written.

## 8. Persistence

- On first launch, call `navigator.storage.persist()`; record the result and show a one-line notice if it was refused.
- Prompt for a first export after the first graded request, then remind when the last export is more than 7 days old and there is new activity.
- Any failed write shows a visible error and keeps the in-memory draft until saved.
- A grading request is written to storage before its prompt is put on the clipboard.

## 9. Build, CI and deployment

- `npm run content` parses, validates, hashes and emits content; production builds exclude drafts.
- `npm run check` = typecheck + lint + unit tests + content build.
- CI on pull requests: `npm ci`, `npm run check`, Playwright (Chromium and WebKit). On `main`: build and deploy to GitHub Pages.
- Routing uses hash URLs so direct navigation and refresh work on GitHub Pages. A deployed-site smoke test loads a deep link.
- From the first deployment (M1), the About page links to the source code, names the deployed commit and shows the licenses.
- PWA (from M5): the service worker never reloads a page by itself; it shows "Update available" and applies on the next navigation without unsaved drafts.

## 10. Security and privacy

- No third-party scripts, analytics or remote fonts. Content Security Policy via meta tag: `default-src 'self'`.
- Pasted replies are displayed as plain text. Stimuli use the safe Markdown subset in `EXERCISE_FORMAT.md` §1.
- The clipboard is written only on an explicit button press; if the write fails, the prompt is shown in a selectable text box.

## 11. Manual checks (each release)

Keyboard-only run of practice, copy, paste and confirm; screen-reader run (VoiceOver on iOS or NVDA on Windows) of validation errors and the confirm dialog; the owner's own phone handoff to a chatbot app and back, including an interrupted session.
