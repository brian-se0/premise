# Architecture

Status: draft v0.2 (2026-10-04, revised after peer review round 1).

## 1. Shape

A static single-page app. Content is compiled into the bundle at build time; all user data lives in IndexedDB. The app makes no network requests after load, other than the service worker fetching the app's own assets.

```
content/*.md ──(build-content: parse, validate, hash)──▶ src/generated/content.json
                                                              │
   Browser ───────────────────────────────────────────────────┼─────────────────────
   UI (React) ──▶ domain (pure TS) ──▶ storage (Dexie / IndexedDB)
                     │
                     ├─ session planner  (due + new tasks ─▶ ordered task list)
                     ├─ prompt builder   (attempts ─▶ frozen grading request + clipboard text)
                     ├─ score parser     (raw reply + request ─▶ row results)
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
| Scheduling | ts-fsrs 5, parameters pinned in `src/domain/schedulerConfig.ts` |
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
│  ├─ taxonomy.yaml
│  └─ exercises/*.md
├─ docs/
├─ reviews/                  peer-review packets, responses and triage
├─ pilot/                    M0 grading pilot materials and log
├─ scripts/build-content.ts
├─ src/
│  ├─ domain/                pure logic: types, planner, prompt, scoreParser, scheduler, progress
│  ├─ storage/               Dexie schema, transactions, export/import
│  ├─ ui/
│  └─ generated/             build output, git-ignored
├─ tests/{unit,fixtures/replies,e2e}/
└─ prompt-eval/
```

## 4. Domain rules

- `src/domain` is pure: no DOM, storage, network or clock. Time and ids are passed in.
- The UI never builds prompt text, parses replies or computes schedules itself.
- Content snapshots are identified by a SHA-256 hash of the task's grading-relevant fields plus its stimulus. Attempts reference snapshots, never live content.

## 5. Data model (IndexedDB, schema v1)

| Table | Key | Fields |
| --- | --- | --- |
| `snapshots` | `hash` | `taskId`, `exerciseId`, `stimulus`, `credit`, task fields (prompt, max, reference, accept, disqualifiers, rubric, anchors, allowed tags), `firstSeenAt` |
| `sessions` | `id` (uuid) | `taskIds` (ordered), `cursor`, `createdAt`, `endedAt` |
| `attempts` | `id` (uuid) | `sessionId`, `taskId`, `snapshotHash`, `answer`, `state` (`draft` \| `submitted` \| `skipped`), `kind` (`new` \| `review` \| `coached`), `startedAt`, `submittedAt`, `updatedAt` |
| `requests` | `id` (uuid) | `label`, `rows` (rowId → attemptId), `fence`, `promptVersion`, `promptText`, `createdAt`, `status` (`open` \| `closed` \| `abandoned`) |
| `replies` | `id` (uuid) | `requestId`, `raw`, `pastedAt`, `parseOutcome` (`clean` \| `recoverable` \| `manual`) |
| `gradings` | `attemptId` (unique) | `requestId`, `replyId` (nullable), `score` (int or null), `max`, `tags[]`, `status` (`accepted` \| `needs-review` \| `superseded`), `source` (`parsed` \| `manual` \| `self`), `feedbackRange`, `acceptedAt` |
| `reviewLogs` | `id` (uuid) | `taskId`, `attemptId`, `rating`, `ratingPolicy`, `schedulerVersion`, `reviewedAt` (= attempt `submittedAt`), ts-fsrs log fields, `undone` |
| `cards` | `taskId` | ts-fsrs card fields, `suspended` |
| `settings` | `key` | `gradingMode`, `batchSize`, `timerEnabled`, `disclosureSeen`, `lastExportAt`, `persistGranted` |

An attempt has at most one grading. A request's status is derived: `closed` when every row's attempt has an accepted or needs-review grading, `abandoned` when the student discards it (unresolved attempts are marked skipped; resolved ones keep their grades).

## 6. Grading and scheduling

**Rating policy `v1`** (provisional, to be calibrated with pilot data):

| Grading | Rating |
| --- | --- |
| Full credit | Good (student may change it to Hard or Easy on the result screen) |
| Less than full credit | Again |
| Needs review, or `kind: coached` | No review event |

**Confirm is one transaction**: write the grading, append the review log, update the card, update the request status. Running it again for the same attempt with the same score is a no-op. A different score for an already-accepted attempt goes through **Correct grade**: undo that attempt's review log (only allowed if it is the card's latest review; otherwise the UI explains that older grades are locked), mark the old grading `superseded`, then apply the new one.

**Review time** is the attempt's `submittedAt`, not when the grade arrived. A task with an attempt awaiting grading is not offered again until it resolves.

**Scheduler**: ts-fsrs with parameters and `enable_fuzz: false` pinned in `schedulerConfig.ts`, versioned as `schedulerVersion`. Day boundary: local midnight. Due reviews are shown in order of due date; overdue cards simply stay due. Upgrading ts-fsrs or parameters requires a `DECISIONS.md` entry.

**Undo**: the latest accepted grading in the app can be undone from the result screen.

## 7. Export and import

```json
{ "app": "premise", "schemaVersion": 1, "exportedAt": "…", "appVersion": "…",
  "snapshots": [], "sessions": [], "attempts": [], "requests": [], "replies": [],
  "gradings": [], "reviewLogs": [], "cards": [], "settings": [] }
```

- **Replace-only import** in v1. Steps: validate, show a summary (counts, date range, newest activity), offer to export the current data first, then replace everything in one transaction.
- Validation: Zod shape, unique ids, every foreign reference resolves (attempt → snapshot, grading → attempt, etc.), timestamps parse, scheduler numbers are finite, file under 50 MB. Newer schema versions are refused with a clear message.
- Snapshots travel in the export, so history survives even if an exercise is later retired or removed.
- Merge import is out of scope until conflict rules are written.

## 8. Persistence

- On first launch, call `navigator.storage.persist()`; record the result and show a one-line notice if it was refused.
- Prompt for a first export after the first graded request, then remind when the last export is more than 7 days old and there is new activity.
- Any failed write shows a visible error and keeps the in-memory draft until saved.

## 9. Build, CI and deployment

- `npm run content` parses, validates, hashes and emits content; production builds exclude drafts.
- `npm run check` = typecheck + lint + unit tests + content build.
- CI on pull requests: `npm ci`, `npm run check`, Playwright (Chromium and WebKit). On `main`: build and deploy to GitHub Pages.
- Routing uses hash URLs so direct navigation and refresh work on GitHub Pages. A deployed-site smoke test loads a deep link.
- The About page links to the source code and names the deployed commit.
- PWA (from M4): the service worker never reloads a page by itself; it shows "Update available" and applies on the next navigation without unsaved drafts.

## 10. Security and privacy

- No third-party scripts, analytics or remote fonts. Content Security Policy via meta tag: `default-src 'self'`.
- Pasted replies are displayed as plain text. Stimuli use the safe Markdown subset in `EXERCISE_FORMAT.md` §1.
- The clipboard is written only on an explicit button press; if the write fails, the prompt is shown in a selectable text box.

## 11. Manual checks (each release)

Keyboard-only run of practice, copy, paste and confirm; screen-reader run (VoiceOver on iOS or NVDA on Windows) of validation errors and the confirm dialog; the owner's own phone handoff to a chatbot app and back, including an interrupted session.
