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
| Offline / install | vite-plugin-pwa, prompt-to-update (added in M4) |
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
| `sessions` | `id` (uuid) | `entries` (ordered list of `{ taskId, attemptId }`; `attemptId` null until the task is opened), `cursor`, `createdAt`, `endedAt` |
| `attempts` | `id` (uuid) | `sessionId`, `taskId`, `snapshotHash`, `answer`, `state` (`draft` \| `submitted` \| `skipped` \| `discarded`), `kind` (`new` \| `review` \| `coached`), `stimulusSeenBefore` (bool), `ratingChoice` (`good` \| `hard` \| `easy`, default `good`), `requestId` (nullable), `currentGradingId` (nullable), `revision` (int), `startedAt`, `submittedAt`, `updatedAt` |
| `requests` | `id` (uuid) | `label`, `rows` (rowId → attemptId), `snapshots` (rowId → snapshot hash), `fence`, `promptVersion`, `promptText` (null for a self-grading-only request; `GRADING_PROTOCOL.md` §2), `createdAt`, `status` (`open` \| `closed` \| `abandoned`) |
| `replies` | `id` (uuid) | `requestId`, `raw`, `pastedAt`, `parserVersion`, `selectedBlock` (`{ start, end }` or null), `parseOutcome` (`clean` \| `recoverable` \| `manual`) |
| `gradings` | `id` (uuid) | `attemptId`, `requestId`, `replyId` (nullable), `opId`, `score` (int or null), `max`, `tags[]`, `status` (`accepted` \| `needs-review` \| `superseded`), `source` (`parsed` \| `manual` \| `self`), `disqualified` (bool, self-grading only), `feedbackRange` (`{ start, end }` or null), `createdAt` |
| `reviewLogs` | `id` (uuid) | `taskId`, `attemptId`, `gradingId`, `opId`, `rating`, `ratingPolicy`, `schedulerVersion`, `reviewedAt` (= attempt `submittedAt`), `cardBefore` (the card's scheduler fields before this review, or null if no card existed), ts-fsrs log fields, `undone` (bool) |
| `cards` | `taskId` | ts-fsrs card fields, `schedulerVersion` (scheduler state only; may be deleted by undo) |
| `taskStates` | `taskId` | `suspended`, `notBefore` (local date; see §6.4). Student controls, never deleted by undo or correction |
| `flags` | `id` (uuid) | `attemptId`, `snapshotHash`, `category` (`unfair-grade` \| `content-problem` \| `other`), `note`, `createdAt` |
| `operations` | `opId` | `name`, `affectedIds`, `resultingRevisions` (attemptId → revision), `result` (the immutable value returned to the UI), `createdAt` |
| `settings` | `key` | `gradingMode`, `batchSize`, `timerEnabled`, `disclosureSeen`, `lastExportAt`, `persistGranted` |

Ranges are offsets in UTF-16 code units into the stored `raw` string, start inclusive, end exclusive (the native JavaScript string index).

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

Provisional; reassessed with M3 usage data (M0 cannot calibrate it).

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
| `prepareGrading(attemptIds)` | Creates the request(s) for these submitted, unowned attempts (`GRADING_PROTOCOL.md` §2). Used by Copy and by Grade it myself. Re-running for already-owned attempts returns the existing requests and their stored prompt text. |
| `confirmRows(requestId, rows)` | For each row, writes a grading revision; for an accepted, uncoached row, appends a review log and updates the card. Updates request status. |
| `correctGrade(attemptId, grading)` | Replaces the current grading with a new revision (§6.3). |
| `undoLatest(attemptId)` | Undoes the attempt's active review, if it is its card's latest; the grading becomes `superseded`, `currentGradingId` is cleared and the row returns to `pending`. |
| `discardRows(requestId, rowIds)` / `abandonRequest(requestId)` | Moves pending or needs-review rows to `discarded`. |
| `setTaskControls(taskId, controls)` | Suspends or resumes a task; edits `taskStates` only. |
| `setTags(attemptId, tags)` | Writes a new grading revision with the same score and status; no scheduling change. |

Rules for all of them:

- Each runs in **one IndexedDB read-write transaction** covering every table it reads or writes. Existence checks, revision checks, latest-review checks and writes all happen inside it. IndexedDB serializes overlapping read-write transactions on the same tables, so no other locking is needed. Clipboard writes and other async work happen outside the transaction.
- **Receipts.** Every successful operation writes an `operations` receipt in the same transaction as its changes.
- **Same `opId` again** (double tap, retry after a crash): the receipt is checked first, before any revision check, and its recorded result is returned without writing.
- **Stale revision** (another tab, or an undo, changed the attempt since the UI read it, and there is no receipt for this `opId`): the operation writes nothing and the UI reloads the row and says what changed. A stale confirm never becomes a new review.
- Receipts are a result ledger for retries, not an event log; nothing is replayed from them.
- Every successful operation increments `revision` on each attempt it changes.

### 6.3 Correction and undo

- **Correct grade** is allowed when the attempt has no active review, or its active review is the card's latest non-undone review. Otherwise the UI explains that older grades are locked. In one transaction: mark the review log `undone`, restore the card from its `cardBefore` (deleting the card if `cardBefore` is null), leave `taskStates` untouched, mark the old grading `superseded`, then apply the new grading as in `confirmRows`.
- **Undo** does the same restore without applying a new grading.
- Repeated corrections stack revisions; each one undoes only the review it replaces.
- A general history-replay engine is out of scope.

### 6.4 Review time and study eligibility

- **Review time** (`reviewedAt`) is the attempt's `submittedAt`: what the student knew when they answered. Grading may arrive days later.
- **Eligibility** is separate: after a grading is confirmed, the task's `taskStates.notBefore` becomes the next local date after confirmation. A task is offered only when it is due (or new), not suspended, and today is on or after `notBefore`, so a student is never re-tested on an answer they have just read. Undo and correction never clear it.

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

- `schedulerConfigs` carries the full configuration of every scheduler version referenced in the file.
- **Replace-only import** in v1. Steps: validate, show a summary (counts, date range, newest activity), offer to export the current data first, then replace everything in one transaction.
- Validation: Zod shape; unique ids; every reference resolves (attempt → snapshot, attempt → session, grading → attempt, review log → grading, flag → attempt, session entry → attempt); snapshot hashes recompute (§4.1); the §5.1 invariants hold, checked with deliberately inconsistent fixtures; request status matches the §5.2 rule; timestamps parse; scheduler numbers are finite; file under 50 MB. Newer schema versions are refused with a clear message.
- A file referencing a scheduler version this app does not know is imported, and its history stays readable, but correction and undo of reviews made under that version are refused. New reviews use the app's current version.
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
- PWA (from M4): the service worker never reloads a page by itself; it shows "Update available" and applies on the next navigation without unsaved drafts.

## 10. Security and privacy

- No third-party scripts, analytics or remote fonts. Content Security Policy via meta tag: `default-src 'self'`.
- Pasted replies are displayed as plain text. Stimuli use the safe Markdown subset in `EXERCISE_FORMAT.md` §1.
- The clipboard is written only on an explicit button press; if the write fails, the prompt is shown in a selectable text box.

## 11. Manual checks (each release)

Keyboard-only run of practice, copy, paste and confirm; screen-reader run (VoiceOver on iOS or NVDA on Windows) of validation errors and the confirm dialog; the owner's own phone handoff to a chatbot app and back, including an interrupted session.
