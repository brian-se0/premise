# M0 grading pilot

A feasibility screen: can a chatbot grade written answers well enough for the owner's own study? See `docs/ROADMAP.md` M0 and `docs/GRADING_PROTOCOL.md` §9.

## Layout

- `answers/` — the answer set, one YAML file per skill: answer id, task id, answer text, gold score (or acceptable-score set for ambiguous answers), the blind second score and any settlement, answer type, and whether it belongs to a held-out exercise. Claude writes it (`GRADING_PROTOCOL.md` §9). `walkthrough.yaml` holds the owner's first answers to draft exercises, which are not part of the check.
- `second-scores.yaml` — the blind second scorer's file, verbatim (SHA-256 `530bcf01…ff2933a`).
- `runs/` — one YAML file per row order: which answers, in what order (see `build-prompt.ts` for the format). `dev-a` and `dev-b` order the development answers; `holdout-a` and `holdout-b` order the held-out ones (arg-0020, arg-0024, arg-0027) and are built only after the development runs have frozen the configuration. The same prompts go to every chatbot under test.
- `LOG.md` — every run, grade disagreement, feedback match and moment of friction.
- `../tests/fixtures/pilot/<run>/` — generated requests (`request-NN.json`, `request-NN.prompt.txt`), the pasted replies (`request-NN.reply.<chatbot>-<n>.txt`, for example `request-03.reply.gemini-1.txt`) and, once checked by hand, the expected parse results. The app must reproduce these. Each `<chatbot>-<n>` label in a folder is one grading run.
- `metrics.ts`, `score.ts` — `npm run pilot:score` reads the answer set and every saved reply with the app's own parser and prints the §9 metrics, per grading run, with their denominators.

## Steps

1. Approve the pilot exercises (`content/exercises/`, `docs/CONTENT_GUIDELINES.md` §7).
2. Write the answer set (Claude, with a blind second scorer; `docs/GRADING_PROTOCOL.md` §9). Hold out at least two whole exercises covering every skill in scope; don't copy held-out answers from anchors.
3. For each development run (`dev-a`, `dev-b`; prompts already built): paste each prompt into each chatbot under test in a new chat, and save the whole reply next to it. `npm run pilot:prompt -- pilot/runs/<run>.yaml` rebuilds a run's prompts.
4. Freeze prompt wording, rubrics, chatbot configuration and the expected parse and feedback results for the development replies.
5. Run the frozen configuration on the held-out exercises at least twice, with different row orders.
6. `npm run pilot:score` for the §9 metrics with counts and denominators; record one of the four outcomes in `docs/DECISIONS.md`.
