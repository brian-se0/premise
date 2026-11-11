# Key clarity notes from the grading check

Places where a key let a grader, or the second scorer, read it more than one way. Started while writing the
grading-check answers (2026-10-06); compare with the notes at the end of `second-scores.yaml`. None of these changes
a gold score or label, which stay as registered in `registration.ts`.

The check's outcome is recorded (`docs/DECISIONS.md`, 2026-10-08), and its 28 task snapshots are saved in
`tests/fixtures/pilot/snapshots.json`, so a key fix no longer changes the check's prompts or results. Each fix still
goes through `docs/EXERCISE_FORMAT.md` §6, the usual checks and the owner's approval. Notes on the held-out tasks
(arg-0020, arg-0024, arg-0027, and the second scorer's notes 1 and 2) came partly from held-out answers and runs;
those exercises are now regression material.

- arg-0025.flaw accept: a "could be lower than one in ten" answer "does not say why the inference fails" settles
  criterion 2 only; it does not say the answer can still earn 1 for naming the inference.
- arg-0009.flaw / arg-0020.flaw: no key says whether an open alternative earns criterion 2 when the inference is
  never stated (only the 0-point anchor notes imply it).
- arg-0011.flaw: "necessary but not sufficient" applied to likelihood vs guarantee is a fine line for answers
  like "places with springs could have stayed small".
- arg-0013.conclusion: only this key says extra supporting reasons do not lose credit; arg-0017 and arg-0024 lack it.
- arg-0017.conclusion: "should not be trusted as evidence for the lanes" wordings are not placed.
- arg-0024.conclusion: "should let the plan go ahead" sits between "not oppose" and "support".
- arg-0013.assumption: "markings are a fair guide ... do not answer the task" gives no score (0 by rubric).
- arg-0015.assumption: criterion 1's examples cover bridges (a) and (b) only; (c) appears in criterion 2/accept.
- arg-0027.assumption: bridge (a) "sheet came from Holt" is stronger than (b) yet is the reference.
- Strengthen tasks: criterion 2 never says whether "this helps the case" counts as explaining.
- arg-0022.strengthen accept lists "Pell's Saturday sales had also been flat" as a main kind; its materiality is weak.
- arg-0026.strengthen accept lists "nearby towns without a fee held steady", which bears on the cause but not on
  count versus weight.
- arg-0027.strengthen accept does not mention "no paper came into Tarrant from outside the region".
- arg-0028.weaken criterion 2: unclear whether "so under its own code the Ledger shouldn't publish" is the
  excluded inference.
- arg-0025.weaken: "clearly more than one restaurant in ten" sets no threshold (12 to 20 percent would split graders).
- arg-0020.weaken: "none was taking classes outside the app" has no time frame (classes before sign-up?).
- arg-0014.weaken: "a comparable period" is required only for direct counts.
- arg-0025 difficulty_note has a stray mid-sentence line break (cosmetic).

## From the development runs (dev-a, dev-b; scored 2026-10-07)

Rows where more than one run departed from gold the same way (development answers only; full list from
`npm run pilot:score`). Information for after the check, not grounds to change a key now.

- wea07, arg-0025.weaken (gold 0): 1 from Gemini in both runs, Grok in dev-a and Claude in dev-a. Fits the
  "clearly more than one in ten" threshold note above.
- asm10, arg-0023.assumption (gold 1): 2 from ChatGPT in dev-a and Claude in both runs.
- str03, arg-0012.strengthen (gold 1): 2 from ChatGPT in both runs.
- str01, arg-0009.strengthen (gold {0, 1}): 2 from ChatGPT and Claude in dev-a.
- Claude only, both runs: asm03 arg-0013.assumption (gold 1, scored 0), str08 arg-0022.strengthen (gold 2, scored 1),
  wea08 arg-0025.weaken (gold 2, scored 0 then 1).

## From the held-out runs (holdout-a, holdout-b; scored 2026-10-08)

From the independent review of the runs (`reviews/2026-10-08-grading-check-results.md`, finding 9), which found the
gold right on every row below.

- arg-0020.weaken: the rule that a starting difference must favor the streak holders is only in `difficulty_note`,
  which graders never see. wea11 (gold 0; the streak holders began behind) drew 2 from Claude in holdout-a and from
  ChatGPT, Gemini and Claude in holdout-b. The review proposes adding to the accept text: "A starting difference
  that favors the other group (the streak holders began behind) earns 0: it makes the streaks look more effective,
  not less."
- arg-0020.flaw: no line of the key says that an answer reversing the ad's inference fails criterion 1. fla14
  (gold 0) drew 1 from ChatGPT and Claude in holdout-a and from Claude in holdout-b, and 2 from ChatGPT in holdout-b.
- arg-0024.assumption: the 1/2 anchor's wording is close to the intermediate conclusion that asm11 (gold 0)
  restates; Gemini gave asm11 2 in holdout-b.
- arg-0027.strengthen: str12 (gold 1) drew 2 from ChatGPT in holdout-b; see the note on outside paper above.
- Grok matched the gold on all of these rows in both runs.
