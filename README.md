# Premise

A free, open-source trainer for argument and reading reasoning. Read a short argument or passage, write your analysis in your own words, and have it graded by any AI chatbot you already use. Premise tracks your weak skills and schedules redos with spaced repetition.

> Status: early development. The practice and grading loop (milestone M2) is live at https://brian-se0.github.io/premise/. Specs are in [`docs/`](docs/). "Premise" is a working name.

## Develop

```sh
npm ci
npm run dev      # local site with draft exercises
npm run check    # content build, typecheck, lint, unit tests
npm run test:e2e # browser tests
```

## How it works

1. **Practice.** Answer tasks like "state the main conclusion", "state the assumption" or "describe the flaw".
2. **Copy for grading.** One button copies a prompt with each exercise, its reference answer, a rubric and your answers.
3. **Paste into your chatbot.** ChatGPT, Claude, Gemini or another. Read the feedback there.
4. **Paste the reply back.** Premise reads the score block at the end, records your grades and schedules reviews.

Or grade yourself against the same rubric, no chatbot needed.

No account, no server, no AI bill. Premise keeps your answers and progress on your device and never uploads them; when you paste a grading prompt into a chatbot, that service receives your answers under its own terms. Export your data any time.

## Docs

- [Product spec](docs/SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Exercise format](docs/EXERCISE_FORMAT.md)
- [Grading protocol](docs/GRADING_PROTOCOL.md)
- [Content guidelines](docs/CONTENT_GUIDELINES.md)
- [Roadmap](docs/ROADMAP.md)
- [Decision log](docs/DECISIONS.md)
- [Peer review process](docs/PEER_REVIEW.md) and [reviews](reviews/)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Exercises are the most valuable contribution.

## License

- Code: [GNU AGPL-3.0-only](LICENSE).
- Exercises and taxonomy in [`content/`](content/): [CC BY-NC-SA 4.0](content/LICENSE.txt), except public-domain and CC BY source text, which keeps its own status and is credited with each exercise.

Premise uses no content from any official test maker and is not affiliated with or endorsed by any testing organization.
