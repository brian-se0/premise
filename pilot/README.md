# M0 grading pilot

A feasibility screen: can a chatbot grade written answers well enough for the owner's own study? See `docs/ROADMAP.md` M0 and `docs/GRADING_PROTOCOL.md` §9.

## Layout

- `answers/` — the answer set, one YAML file per skill: answer id, task id, answer text, gold score (or acceptable-score set for ambiguous answers), the blind second score and any settlement, answer type, and whether it belongs to a held-out exercise. Claude writes it (`GRADING_PROTOCOL.md` §9). `walkthrough.yaml` holds the owner's first answers to draft exercises, which are not part of the check.
- `second-scores.yaml` — the blind second scorer's file, verbatim (SHA-256 `530bcf01…ff2933a`).
- `registration.ts` — the check's fixed inputs, recorded before the first chatbot reply: the digest of Claude's scores, the digest of the final labels, and the snapshot hash of every task in the answer set. Both scripts refuse to run when one of them no longer matches.
- `../tests/fixtures/pilot/snapshots.json` — the snapshots of those 28 tasks as they were scored, checked against `registration.ts`. The scripts and tests read these instead of the current content, so a later key fix (`docs/EXERCISE_FORMAT.md` §6) leaves the check's prompts and results reproducible.
- `runs/` — one YAML file per row order: which answers, in what order (see `build-prompt.ts` for the format). `dev-a` and `dev-b` order the development answers; `holdout-a` and `holdout-b` order the held-out ones (arg-0020, arg-0024, arg-0027), with no request holding two answers to one task, and are built only after the development runs have frozen the configuration. The same prompts go to every chatbot under test. For a later check, redraw the second order until no three rows share a request in both orders (in this check, wea11, con13 and fla14 shared request 02 in both). `pilot:prompt` refuses to rebuild a folder that already holds requests, since saved replies would no longer match; delete the folder to rebuild it.
- `LOG.md` — every run, grade disagreement, feedback match and moment of friction.
- `results/` — the outcome's record: the `npm run pilot:score` output and the held-out rows where a chatbot disagreed with the gold, as given to the owner before choosing.
- `key-clarity-notes.md` — places where a key let graders, or the second scorer, read it more than one way. Fixes go through `docs/EXERCISE_FORMAT.md` §6.
- `../tests/fixtures/pilot/<run>/` — generated requests (`request-NN.json`, `request-NN.prompt.txt`), the pasted replies (`request-NN.reply.<chatbot>-<n>.txt`, for example `request-03.reply.gemini-1.txt`), `notes.csv` and the expected parse results checked by hand (`expected.json`, the parser's full result for each saved reply). The app must reproduce these: `tests/unit/prompt.test.ts` rebuilds every prompt and `tests/unit/pilot-fixtures.test.ts` re-parses every saved reply, failing a run that has replies but no `expected.json`. Each `<chatbot>-<n>` label in a folder is one grading run.
- `metrics.ts`, `report.ts`, `score.ts` — `npm run pilot:score` reads the answer set and every saved reply with the app's own parser and prints the §9 metrics, per grading run, with their denominators, per-skill counts and each chatbot's pooled held-out results.

## Pasting a run

These rules hold for every run, on PC or phone (`docs/GRADING_PROTOCOL.md` §9):

- Use the chatbot's free version and the model its free plan uses by default; on a paid account, pick that model and note "paid account".
- Paste each request into a new temporary or private chat. Where the chatbot has no such mode, turn memory and chat history off for the chat if it allows that. Turn web search and tools off where the chatbot allows. Paste the whole prompt unchanged.
- Save the first reply whole with the reply's own copy control, as `request-NN.reply.<chatbot>-<n>.txt` (UTF-8 without a byte-order mark). Never regenerate, edit or follow up. Save an error, refusal or cut-off reply as it is, or an empty file if nothing can be copied. A re-paste is a new run with a new `<n>`.
- If a free limit stops a chatbot, note when and what it said, carry on with the others, and come back when the limit resets.
- Add a line per reply to the run folder's `notes.csv`, with this header: `request,label,time,model,client,account,mode,search,copied,notes`. For example: `03,gemini-1,21:14,Gemini Flash,web PC,free,temporary,no,copy button,`. `search` is `yes` when the reply searched the web. The report flags a run whose `model` changed and a reply that searched.
- On a phone, use the app's own copy control and paste the reply into a message in the project thread; Claude saves it unchanged.

## Steps

1. Approve the pilot exercises (`content/exercises/`, `docs/CONTENT_GUIDELINES.md` §7).
2. Write the answer set (Claude, with a blind second scorer; `docs/GRADING_PROTOCOL.md` §9). Hold out at least two whole exercises covering every skill in scope; don't copy held-out answers from anchors.
3. For each development run (`dev-a`, `dev-b`; prompts already built): paste each prompt into each chatbot under test as in "Pasting a run" above, and save the whole reply next to it.
4. Freeze prompt wording, rubrics, chatbot configuration and the expected parse and feedback results for the development replies.
5. Run the frozen configuration on the held-out exercises at least twice, with different row orders.
6. `npm run pilot:score` for the §9 metrics with counts and denominators; apply §9 "Choosing among chatbots" and record one of the four outcomes in `docs/DECISIONS.md`.

## After the outcome

The check ended in outcome 1 with Grok (`docs/DECISIONS.md`, 2026-10-08). The held-out exercises (arg-0020, arg-0024, arg-0027) are now regression material: they stay in the app as study exercises and serve parser re-scoring and the drift check below, but a new claim needs fresh exercises that no chatbot has graded for the project.

- **Drift check.** Grok's Auto mode can change models without a visible sign. Every month or two, and when xAI announces a new default model, paste `holdout-b` requests 02 and 04 into Grok in the checked setup (free website, private chat, Auto mode) and save the replies in `holdout-b` under the label `grok-drift-<n>`. The report treats that label as a grader of its own, so a partial run never enters the checked setup's verdict; read its rows that differ from gold. These two requests hold four of the five held-out rows where another chatbot disagreed with the gold (wea11, fla14, asm11, str12). Any false pass takes the checked mark off until a new check; log each drift check in `LOG.md`.
- **Parser changes.** A new parser version re-scores every saved reply; it counts as checked only if Grok's held-out runs still meet every target (`docs/DECISIONS.md`, 2026-10-08).
- **Phone pastes** measure the copy-paste loop. Save them under `grok-phone-<n>` (or `<chatbot>-phone-<n>`), which the report also keeps apart from the check's verdict: they don't extend "checked" to the phone app.
