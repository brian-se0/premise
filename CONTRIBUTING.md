# Contributing

Thanks for helping. Exercises matter more than code.

## Contributing exercises

1. Read [`docs/CONTENT_GUIDELINES.md`](docs/CONTENT_GUIDELINES.md) and [`docs/EXERCISE_FORMAT.md`](docs/EXERCISE_FORMAT.md).
2. Copy an existing file in `content/exercises/`, take the next free id, and write the stimulus, tasks, references and rubrics.
3. Keep `status: draft`. Run `npm run content` to validate.
4. Open a pull request. A maintainer or another contributor runs the review checklist and publishes it.

Never submit official test material, prep-company material, or paraphrases of either. Pull requests that do will be closed.

## Contributing code

1. Read [`AGENTS.md`](AGENTS.md); its rules apply to humans too.
2. Pick an item from the current milestone in [`docs/ROADMAP.md`](docs/ROADMAP.md), or open an issue first for anything else.
3. Run `npm run check` before pushing. Add tests for anything in `src/domain/`.

## Licensing of contributions

By contributing you agree that code is licensed under AGPL-3.0-only and content under CC BY-NC-SA 4.0, and that you have the right to submit it. A short contributor license agreement, which lets the maintainer also offer the project under other terms, will be required before outside contributions are merged. (Not yet in place; see `docs/DECISIONS.md`.)
