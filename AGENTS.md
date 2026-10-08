# Agent Instructions

Rules for any AI coding agent working in this repository (Claude Code, Codex, others). Humans should read them too.

## Read first

1. `docs/SPEC.md`: what we are building and what we are not.
2. `docs/DECISIONS.md`: settled decisions. Do not reopen them in code; propose a new entry instead.
3. The doc for the area you are touching: `ARCHITECTURE.md`, `EXERCISE_FORMAT.md`, `GRADING_PROTOCOL.md`, `CONTENT_GUIDELINES.md`, `METHOD.md` (the reasoning method answer keys and form lines follow).
4. `docs/ROADMAP.md`: work on the current milestone only.
5. `reviews/`: the latest peer review and its triage, for the reasoning behind current rules.

## Hard rules

- **No official content.** Never add, generate, fetch or paraphrase LSAC or prep-company questions, passages or explanations. Never use "LSAT" or "LSAC" in product names, UI text or exercise bodies.
- **No server, no network.** The app makes no runtime network requests, includes no analytics or third-party scripts, and calls no AI API.
- **Contracts are versioned.** Changes to the exercise schema, taxonomy, grading prompt, score block grammar or export schema require: a version bump where the doc says so, a `DECISIONS.md` entry, updated fixtures, and a peer review (`docs/PEER_REVIEW.md`).
- **Domain stays pure.** `src/domain/` has no DOM, storage, network or clock access. Pass time in.
- **Grading integrity.** Never repair, clamp or guess a score; never apply a review twice; write gradings, review logs and cards in one transaction (`ARCHITECTURE.md` §6).
- **Never render pasted text as HTML.**
- **Licenses.** Code is AGPL-3.0-only; files under `content/` are CC BY-NC-SA 4.0. Do not add dependencies with licenses incompatible with AGPL-3.0.

## Commands

| Command | What it does |
| --- | --- |
| `npm ci` | Install exact dependencies |
| `npm run dev` | Local dev server |
| `npm run content` | Validate content and build `src/generated/content.json` (drafts included; `-- --production` excludes them, `-- --lock` records published tasks) |
| `npm run build` | Production build into `dist/` (drafts excluded) |
| `npm run check` | Content build, typecheck, lint and format check, unit tests. Must pass before every commit. |
| `npm run format` | Apply Prettier |
| `npm run test:e2e` | Playwright tests (builds and serves the production site; set `PW_CHROMIUM` to use a preinstalled Chromium, `E2E_WEBKIT=0` to skip WebKit) |
| `npm run pilot:prompt -- pilot/runs/<run>.yaml` | Build pilot grading prompts from a run file |
| `npm run pilot:score` | Score saved pilot replies against the answer set's gold labels and print the grading-check metrics |

## Working style

- Small pull requests, one milestone or less. Each PR states which acceptance criteria it meets.
- Tests first for `src/domain/` (parser, prompt builder, scheduler). Every parser bug gets a fixture.
- Do not add dependencies without saying why in the PR description.
- Prefer deleting code to adding configuration.
- If the spec is ambiguous, pick the simplest reading, note it in the PR, and add an open question to `docs/SPEC.md` §9.
