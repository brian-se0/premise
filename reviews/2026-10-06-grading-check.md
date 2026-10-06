# Grading check: blind second scoring and review of PR #16

Reviewer: an independent Claude Opus 5.5 session at maximum effort, started by the coordinator in its own thread on 2026-10-06 and briefed only by the packet below (`/mnt/project-files/grading-check/README.md` in the project's shared folder; one session id replaced). Phase 1 produced `pilot/second-scores.yaml`, committed verbatim at 7094d21. Phase 2 reviewed PR #16 at 6bb3c21 and 7094d21. The response is copied from `/mnt/project-files/reviews/2026-10-06-grading-check-review.md` as it stood at 21:05 UTC, with headings moved down two levels.

## Packet

Owner: the "Formal-logic approach" thread. Repo: https://github.com/brian-se0/premise, draft PR #16 (branch `claude/project-thread-74uxzl`).

### Pre-registration

Claude's scores for the 70 answers in `answers-blind.yaml` were fixed at about 20:25 UTC on 2026-10-06, before any second scoring began. Their digest, as `npm run pilot:score` computes it (`goldDigest` in `pilot/load.ts`: SHA-256 over one JSON line `[id, task, answer, gold]` per answer, sorted by id), is:

`ae78dd71f7ef4b8824d9919aba1fcc4b2e0f1de6a5f551b5db0db87744aeb59f`

SHA-256 of `answers-blind.yaml`: `598764e145a6cb3316b90b81700bce9e9a55126769a3fe300a10d4e970445039`.

### Brief for the independent reviewer (Claude Opus 5.5, maximum effort)

You are the blind second scorer required by `docs/GRADING_PROTOCOL.md` §9, and then an independent reviewer of PR #16. Work read-only on the repository; write only the two files named below.

#### Phase 1: score every answer blind

1. Check out `main` (commit 72888ad or later; the exercises in `content/exercises/` are the answer keys) and read `docs/GRADING_PROTOCOL.md` §3: the grading instructions a chatbot receives. Score as a careful grader following those instructions exactly.
2. For each of the 70 answers in `/mnt/project-files/grading-check/answers-blind.yaml`, read its task's `prompt`, `reference`, `accept` ("Counts as correct"), `disqualifiers`, `rubric` and `anchors`, and give the score the key supports (0 to the task's `max`; each rubric criterion is worth one point; any disqualifier makes it 0).
3. Do not look for Claude's scores. They are not in the repository or the PR, and nothing you need refers to them. An encrypted copy sits in `.sealed/` only so the scores survive if the owning session ends; do not open it. Do not read the "Formal-logic approach" thread.
4. Write `/mnt/project-files/grading-check/second-scores.yaml`: a list with, for each answer, `id`, `score`, `reason` (one or two sentences naming the criteria met or missed), and `unclear` (only where the key does not settle the score: quote the key text and give the other defensible score).
5. At the end of that file, under a comment line, list any key text that looked wrong or unclear, with the exercise and quote.

#### Phase 2: independent review of PR #16

After Phase 1 is saved, review PR #16 at its current head: the protocol changes (`docs/DECISIONS.md` entries of 2026-10-06, `docs/GRADING_PROTOCOL.md` v0.8 §9, `docs/PEER_REVIEW.md` v0.2, `docs/ROADMAP.md` v0.7), the scripts and tests (`pilot/score.ts`, `pilot/metrics.ts`, `pilot/load.ts`, `pilot/build-prompt.ts`, `tests/unit/pilot-metrics.test.ts`), the holdout split (arg-0020, arg-0024, arg-0027 held out, covering all five skills), and the run plan (`pilot/runs/`, the development prompts in `tests/fixtures/pilot/`). Look for anything that would make the check's results misleading: metric definitions that differ from §9, leaks between development and held-out material, gold handling that could let a disagreement pass unsettled, workload or free-tier limits that would bias which replies get saved. Write findings, most severe first, each with file and line and a concrete failure scenario, to `/mnt/project-files/reviews/2026-10-06-grading-check-review.md`.

When each phase is done, tell the "Formal-logic approach" thread (by a message to its session) where the file is.

## Reviewer response

Reviewer: an independent Claude Opus 5.5 session at maximum effort, started by the coordinator on 2026-10-06, briefed by `/mnt/project-files/grading-check/README.md`. Keys read at `main` 72888ad. PR #16 reviewed at 6bb3c21, then at its new head 7094d21 (pushed 20:38:48 UTC, adding the answer files with both scores; the scripts and tests are unchanged between the two). Nothing in the repository was changed; the checks below ran in a scratch copy.

What I ran: the pilot unit tests and the prompt tests (46 pass, 26 of them the pilot fixtures), `npm run pilot:score` at 7094d21, an audit of the 26 development fixtures against `answers-blind.yaml`, and a simulated held-out run with made-up replies. The PR's `check` run passed on the head.

### Phase 1 result

- **70 of 70 exact agreement** with Claude's scores: 14 of 14 in each skill, 20 of 20 on the held-out exercises.
- **How and when that was established.** `grading-check/second-scores.yaml` was saved at 20:36:02 UTC; its SHA-256 (`530bcf01…ff2933a`) went to the answer thread at about 20:37, before I opened PR #16. The answer thread published Claude's scores at 20:38:48. I first saw the agreement at about 20:42, when a scratch copy using my scores as gold printed the pre-registered digest (finding 6). The file is unchanged since 20:36 and is committed verbatim at 7094d21.
- **Unclear answers.** I flagged six: str01, asm01, fla04, str04, con08 and str07. The answer thread made acceptable-score sets of these six plus wea09, all on development exercises, so the 20 held-out rows stay unequivocal. I agree with all seven sets. On wea09 I would have kept 1 as settled, because rubric 2 excludes exactly the inference the answer makes ("So under its own code the Ledger shouldn't publish it"), but `{1, 2}` is defensible and costs only one development row.
- **Signal from the blind flags.** Of the five answers the writer typed `ambiguous`, I flagged four without knowing their types (all but wea09). The other two I flagged (str01, str07) are typed `confidently-wrong`: their risk is a lenient grader, not an unclear key.
- **One blinding exception:** project memory named wea07's planned score before I scored it (finding 10).
- **Key-text notes** are at the end of `second-scores.yaml`. Notes 1 and 2 touch held-out tasks; read finding 5 before acting on them.

### Findings, most severe first

#### 1. Major: an incomplete run passes the screening targets

- **Where:** `pilot/score.ts:111` skips a request with no saved reply; `pilot/score.ts:143-169` marks the run incomplete but still prints the target lines from `screen(held)`. `GRADING_PROTOCOL.md:201` defines resolution coverage over "all requested rows".
- **Failure scenario (reproduced in a scratch copy, using the committed gold):** I built holdout-a and saved correct replies for requests 01 to 03 only. The report says "Incomplete: replies saved for 3 of 5 requests" and then prints "Met" for all seven targets, including resolution coverage 12/12 (100%). In real runs the missing replies are the ones a free-tier limit cut off, or ones the owner judged broken and did not save, which are the requests most likely to fail.
- **Fix:** count every row of an unreplied request as unresolved and that request as a manual outcome, so the denominators cover all requested rows; or print "Not screened: incomplete run" in place of the target lines. `grading-check/pc-run-brief.md` already says to save every reply, with an empty file for an error, so in the development runs a gap would come from a request skipped at a free limit and not redone before scoring.

#### 2. Major: no outcome rule for four chatbots, and Claude graded against Claude

- **Where:** `docs/ROADMAP.md:21-22` ("Proceed with chatbot: name the chatbot … Requires the §9 screening targets on the holdout"); `docs/GRADING_PROTOCOL.md:211` ("each run of the frozen candidate") and `:213`; `docs/DECISIONS.md:7` (the Grade screen links all four).
- **Failure scenario:** ChatGPT and Claude meet the targets and Gemini and Grok do not. Nothing says whether that is "Proceed", or whether the Grade screen keeps linking the two that failed. Picking whichever chatbot passed after the holdout run also selects on the holdout. With 20 rows a run, a chatbot whose true exact agreement is 75% still reaches 16 of 20 in a given run about 41% of the time, so across four chatbots one lucky pass is plausible. Claude's results are reported separately, but nothing says whether a Claude pass can carry the outcome, though it shares the gold's reading of the keys.
- **Fix:** before any held-out prompt is built, record the rule in `DECISIONS.md` or §9. For example: each linked chatbot must meet the targets on both orders to stay recommended; a Claude pass alone cannot select "Proceed"; the decision lists all four results.

#### 3. Minor (was major): the repository's run procedure does not control chat memory or free-tier behavior

- **Where:** `docs/GRADING_PROTOCOL.md:199` (records model label and settings per run); `pilot/README.md:18` (step 3); `pilot/score.ts:144-146` (a run is a file label and nothing more).
- **Mostly covered outside the PR:** `grading-check/pc-run-brief.md` (20:27 UTC), which I had not read when I first wrote this finding, already requires for the development runs: temporary or incognito chats, never re-asking, saving every reply (an empty file for an error), and a `notes.csv` line per reply with the visible model label, account, chat mode and any limit warning or model switch. That covers the scenarios below for those runs, so I lowered this from major.
- **Failure scenarios the repository alone still allows:**
  - *Memory.* dev-a and dev-b grade the same 50 answers in the same account. With memory or chat-history features on, the second order's chats can draw on the first order's grades, which inflates run-to-run agreement, the metric meant to show variability.
  - *Model switching.* Free tiers cap use, and some switch to a smaller model at the cap. A 13-request run can then mix models under one label, and the frozen "candidate configuration" describes neither model. `notes.csv` records a switch, but `score.ts` never reads it, so the report does not show it.
  - *Retries.* Nothing in the repository says to keep the first reply. Regenerating a garbled reply and saving the better one inflates clean parse, coverage and feedback match.
- **Fix:** copy the brief's rules into `pilot/README.md` so the held-out runs and saint's phone check follow them too, and commit each run's `notes.csv` with its replies. Have the report flag, or split, a run whose model label changed.

#### 4. Major: the final labels are not pinned, and the scorer never checks the digest

- **Where:** `pilot/load.ts:70-80` (the digest covers id, task, answer and gold only); `pilot/score.ts:55-62` (prints the digest and compares it with nothing); `pilot/metrics.ts:26-33` (`finalGold` only checks `second` against `gold`).
- **Failure scenarios:**
  - After a chatbot disagrees on a held-out row, someone edits `gold` instead of adding `settled` with a reason. `finalGold` accepts it, the counts improve, and nothing fails; only someone comparing the printed digest by eye would notice.
  - Someone adds an acceptable-score set after reading replies. The row leaves exact agreement and the false-pass count, and nothing records that the set came late. (The seven current sets follow the two scorers' own flags, not any chatbot reply, which is right.)
- **Fix:** hard-code the pre-registered digest (`ae78dd71…eb59f`) and fail on a mismatch. Add a second digest over the final labels, commit it before the first reply is saved, and fail on a mismatch. To make that easy: SHA-256 over one JSON line per answer, `[id, task, answer, gold, second, settled or null, sorted acceptable or null]`, sorted by id, joined and terminated with a newline (the same encoding as `goldDigest`), is `808927cf4b80c3b1cebafd72409596a5f09cf45be900b431929537ee96d76c4b` at 7094d21.

#### 5. Major: held-out keys could change before the holdout build, and gold is not tied to a key version

- **Where:** `pilot/score.ts:81-83` compares each fixture's snapshot hash with the current content, which only shows that replies and current keys match. The answer files record no key version for their gold.
- **Failure scenario:** my key-text notes 1 and 2 suggest stating in arg-0020.weaken's grader-visible text that a starting gap with the streak holders behind earns 0, and saying in arg-0027.strengthen that a wrong-direction fact earns 0. Both came from held-out answers (wea11, str13, str14). If those keys are edited before the held-out prompts are built, the new prompts match the new hashes and `score.ts` accepts them. But the gold was scored under the old keys, and the held-out keys have been tuned on held-out answers, which §9 (`GRADING_PROTOCOL.md:198`) treats as turning them into regression material.
- **Already intended:** `grading-check/key-clarity-notes.md` (the answer thread, 20:39 UTC) says keys stay frozen until the grading check ends. The built development prompts enforce that for development tasks, since a key change breaks their snapshot hashes; nothing enforces it for the held-out tasks, whose prompts are not built yet.
- **Fix:** pin the six held-out task hashes now (listed under Reference values) and refuse a held-out build or score when they differ. Record each answer's snapshot hash with its gold and have `load.ts` refuse a mismatch. Hold notes 1 and 2 for the held-out tasks until after the holdout run, or apply them and choose fresh held-out exercises.

#### 6. Major for any later blind check, no effect on this one: the pre-registered digest is unsalted

- **Where:** `pilot/load.ts:75-80`; the "Pre-registration" section of `grading-check/README.md`, which gave the digest to the second scorer; `docs/DECISIONS.md:11` ("fixed and hashed before an independent second scorer starts").
- **What happened:** during this review, a scratch copy that used my 70 scores as gold printed `ae78dd71…`, the pre-registered digest, so Claude's scores equal mine. I saw that after my file was saved and its hash sent, and after the answer thread had published Claude's scores, so this run's result stands.
- **Failure scenario for a later check:** a second scorer holding the digest hashes its own scores. If they don't match, it tries every variant with up to three changes (about 440,000 hashes for 70 answers, a few seconds), finds Claude's scores and "agrees". The digest proves Claude's scores were not changed, but it does not hide them, so the files alone cannot show the agreement was blind.
- **Fix:** hash with a random salt kept from the second scorer, publish the salt once the second scores are committed, and do not give the second scorer the digest.

#### 7. Minor: 70 of 70 is agreement between two Claude sessions

- **Where:** `docs/DECISIONS.md:11` ("two independent scorers catch each other's slips"), `docs/DECISIONS.md:15` ("which the grading check offsets by testing chatbots from four companies"), `docs/GRADING_PROTOCOL.md:212`.
- **Problem:** both scorers ran on the same model at the same effort with the same instructions, scoring answers that Claude wrote to land on named key clauses. Perfect agreement shows the keys read one way to Claude. It cannot show that reading is right where Claude's habits are shared, and testing four companies' chatbots does not offset that, because every chatbot is measured against Claude's gold. A non-Claude chatbot that reads a borderline key differently is counted as wrong. The seven sets remove the clearest such cases, all on development exercises.
- **Fix:** report the benchmark as agreement between two Claude scorers, and the metrics as agreement with Claude's reading of the keys. For each held-out disagreement by a non-Claude chatbot, show saint the row with that chatbot's criterion-by-criterion feedback before calling it an error. Note in the outcome that the answers are synthetic and written against the keys, so real answers may be harder to grade. Reword `DECISIONS.md:15`.

#### 8. Minor: some requests pair two answers to the same task

- **Where:** the seeded orders in `pilot/runs/*.yaml`, batched four at a time by `pilot/build-prompt.ts:47-51`.
- **Detail:** dev-a requests 01 (asm05, asm06), 06 (wea03, wea04) and 12 (str02, str01); dev-b request 12 (con04, con01); holdout-a request 04 (con11, con12); holdout-b requests 02 (str12, str14), 04 (fla13, fla12) and 05 (wea13, wea12). Most of these put a right and a wrong answer to the same question side by side, which a student's request rarely does. The contrast can help or anchor the grader, and it makes held-out conditions differ from real use.
- **Fix:** reshuffle so that no request holds two answers to one task (possible for the holdout: five tasks of four answers into five requests of four). The development fixtures would need rebuilding, so do it before any reply is saved, or leave the development orders and fix only the held-out ones.

#### 9. Minor: no per-skill or pooled view

- **Where:** `pilot/score.ts:149-169`; `docs/GRADING_PROTOCOL.md:211` ("results are also shown pooled for information").
- **Failure scenario:** the holdout has four answers per skill, so a chatbot can get all four weaken answers wrong and still reach 16 of 20. The report shows nothing per skill, and nothing pooled across a chatbot's two held-out runs.
- **Fix:** print per-skill counts (information, not targets) and one pooled held-out line per chatbot.

#### 10. Minor: project memory carried a gold score into the blind session

- **Where:** the project memory file `grading-check-plan` (outside the repository) names "an arg-0025.weaken answer of 'Not every restaurant that failed did so all four times' scores 0" as a planned regression case, and every session in the project loads memory at start. `docs/PEER_REVIEW.md:5` says a reviewer never starts from the implementer's conversation, but memory is a channel into it.
- **Effect here:** wea07 was not scored blind. My 0 rests on the key ("clearly more than one restaurant in ten"), and the item changes no result.
- **Fix:** keep scores, verdicts and planned answers out of memory until the independent session has reported, and say in briefs that memory may hold such items.

#### 11. Minor: rebuilding a run orphans its saved replies

- **Where:** `pilot/build-prompt.ts:47-51` (new random request ids and fences) and `:53-71` (overwrites the folder); `pilot/README.md:18` ("rebuilds a run's prompts").
- **Failure scenario:** after some dev-a replies are saved, someone reruns `pilot:prompt` for dev-a. Every saved reply now belongs to "a different grading request" and scores as a manual outcome.
- **Fix:** refuse to write into a folder that already holds request files unless explicitly told to.

#### 12. Minor: a missing second score passes silently

- **Where:** `pilot/metrics.ts:29`, asserted by `tests/unit/pilot-metrics.test.ts:39-42`.
- **Detail:** all 70 answers have one now, so this run is unaffected. For later answer sets, fail when any answer lacks `second` once second scoring is recorded.

#### 13. Minor: the route for saving phone replies is not specified

- **Where:** `pilot/README.md:18`; `docs/ROADMAP.md:16` ("on phone and PC").
- **Failure scenario:** phone replies pass through a notes app or email on their way into `tests/fixtures/pilot/`, which can change quotes, whitespace or Markdown and so change parse outcomes in ways a student's direct paste would not.
- **Fix:** choose and record one route, use the chatbot app's own copy control, and note the client for each reply.

#### 14. Minor: a grader with web search could find the public answer files

- **Where:** `pilot/answers/*.yaml` at 7094d21: a public repository holding every answer's exact text, gold and reasoning.
- **Failure scenario:** a chatbot searches the web for an unusual phrase in the prompt and finds the file with the answer and its gold.
- **Fix:** turn search and tools off where the chatbot allows it, record that, and flag any reply that cites a web source.

#### Nits

- `docs/GRADING_PROTOCOL.md:194` still calls the set "hand-graded".
- `pilot/score.ts:125` counts a "choose" reply as neither clean nor manual, while all its rows count as resolved by hand. Say so in the report, or count it as manual for the 2% target.
- No test runs `score.ts` end to end (row mapping, an incomplete run, label grouping).

### Checked and found sound

- `pilot/metrics.ts` matches §9 v0.8: coverage, abstention, invalid-or-missing, exact and pass/fail agreement over unequivocal numeric rows, false passes and false fails with sets excluded, an empty denominator never meeting a target, run-to-run agreement over rows numeric in both runs, and the zero-failure bound 1 − 0.05^(1/n) (exact Clopper-Pearson otherwise). Apart from finding 1, no definition differs from §9.
- `pilot/score.ts` maps parsed rows by position correctly: the parser returns one row per request row, in request order (`src/domain/scoreParser.ts:40`, `:280`), and `?` becomes an abstention (`pilot/score.ts:132`).
- The 26 development prompts reproduce byte for byte, and their snapshot hashes match `main` 72888ad. In each order, the 50 answers match `answers-blind.yaml` exactly (text and task) and follow the run file's order. No held-out answer or stimulus appears in them, and request ids and fences are unique across both orders.
- The holdout is arg-0020, arg-0024 and arg-0027: 20 answers, four per skill, all five skills. No held-out answer copies an anchor or reference (highest similarity ratio 0.59). `load.ts` keeps the split by whole exercise, and `score.ts` refuses a request that mixes development and held-out answers.
- At 7094d21, `pilot/second-scores.yaml` is byte-identical to my file, every `second` equals my score, Claude's scores reproduce the pre-registered digest, and §9 (`GRADING_PROTOCOL.md:197`) now has any answer that either scorer marks defensible under another score re-read and either settled in writing or given an acceptable-score set. That rule is right, and the seven sets it produced follow the two scorers' own flags, not any chatbot reply.

### Reference values

Held-out task snapshot hashes at `main` 72888ad, for finding 5:

| Task | Snapshot hash |
| --- | --- |
| arg-0020.flaw | `14527d8e350cc40c01833387421f6f32ba61f7f9b784b82da1cc70eaacc525d1` |
| arg-0020.weaken | `429a6fce8fbec4bed3b3686bbbe2a563881a42cf481795460c34643ebe4b188e` |
| arg-0024.conclusion | `28724fcca95f57247818dd0ccba2b39264faabf11b3e2e1ac09516b27af9f98f` |
| arg-0024.assumption | `171cfbdd8623334eeeb19ac30611bfcc9869bbc94d8990d2c5ae679cbf0e203e` |
| arg-0027.assumption | `6dc447a7d8bac114e064e5211de1d483274ce1c47ea3554c77e50abb441ec1c7` |
| arg-0027.strengthen | `198269e7d33a4153198a796b6acc7a50fc4f111d2a4178ba99c7ab9d10cb0fe1` |

Final-label digest at 7094d21, for finding 4: `808927cf4b80c3b1cebafd72409596a5f09cf45be900b431929537ee96d76c4b`.

Screening odds behind finding 2: the chance of at least 16 of 20 in one run is 0.24, 0.41, 0.63, 0.83 and 0.96 for a true exact agreement of 70%, 75%, 80%, 85% and 90%.


## Triage

Fixes are in 9e168cc unless noted. The development prompts already on the owner's PC are unchanged.

1. **Accepted.** A request with no saved reply now counts as a `missing` reply with every row unresolved, so coverage and the other row metrics cover all requested rows, and an incomplete run prints "Not screened" in place of the targets (`pilot/report.ts`, tested in `tests/unit/pilot-report.test.ts` with the reviewer's scenario: 3 of 5 held-out replies gives coverage 12/20 and no target lines).
2. **Accepted.** §9 "Choosing among chatbots": each chatbot passes only if every one of its held-out runs, in both orders, meets every target; outcome 1 needs a passing chatbot other than Claude and a Claude pass alone cannot select it; the decision lists all four results; the Grade screen keeps linking all four and describes only those that passed as checked; the reviewer's screening odds are quoted. `ROADMAP.md` M0b outcome 1 matches. This is Claude's default for the owner to confirm with the PR.
3. **Accepted.** `pilot/README.md` "Pasting a run" carries the PC brief's rules for every run, phone included, plus memory and search off where a chatbot allows. Each run folder gets a committed `notes.csv` with a fixed header; the report flags a run whose model label changed, a reply that searched the web, and a run with no notes. §9 "Runs" states the same rules.
4. **Accepted.** `pilot/registration.ts` records the pre-registered digest of Claude's scores (`ae78dd71…`) and a final-label digest in the reviewer's encoding (`808927cf…`, which `labelDigest` reproduces). `pilot:score` and `pilot:prompt` refuse a mismatch, and a unit test checks the committed set, a late acceptable set and a changed gold score.
5. **Accepted.** The registration pins the snapshot hash of all 28 tasks in the answer set, the six held-out ones included (they match the reviewer's table), and the scripts and a unit test refuse a change. Keys stay frozen until the outcome is recorded; key-text notes on held-out tasks, the reviewer's notes 1 and 2 among them, wait until after the holdout run (noted in the shared `key-clarity-notes.md`).
6. **Accepted for later checks.** This check's digest stays as registered. §9 now says a later check salts the digest with a value kept from the second scorer, does not give the second scorer the digest, and publishes the salt once the second scores are committed.
7. **Accepted.** `DECISIONS.md` no longer says four companies offset a same-family reviewer; it says the gold and the second score are two Claude readings. §9 and the report footer describe results as agreement with Claude's reading of the keys and note that the answers are synthetic. The report prints a chatbot's feedback beside each held-out disagreement, and §9 has the owner see those rows before the outcome is recorded, with counts kept against the registered gold.
8. **Accepted for the held-out orders.** `holdout-a` and `holdout-b` are redrawn from their seeded generators until no request holds two answers to one task, and `pilot:prompt` refuses such a held-out request or a run that mixes development and held-out answers. The development orders are kept, since their prompts were already set up on the owner's PC; §9 records the exception (four of 26 requests).
9. **Accepted.** Each run shows per-skill exact agreement and resolution, and a pooled held-out table compares chatbots, with Claude last and marked apart. Both are labelled information, not targets.
10. **Accepted.** `PEER_REVIEW.md` gains a ground rule: until an independent reviewer or blind scorer has reported, keep what it will judge out of project memory, and warn it in the brief. Project memory now carries the same rule.
11. **Accepted.** `pilot:prompt` refuses to write into a folder that already holds requests; deleting the folder is the explicit way to rebuild.
12. **Accepted.** `loadAnswers` refuses a set where some answers have a second score and others do not.
13. **Accepted.** Phone replies are copied with the app's own copy control and pasted into a message in the project thread, which Claude saves unchanged; the client goes in `notes.csv`.
14. **Accepted.** Search and tools off where the chatbot allows, a `search` column in `notes.csv`, and a report flag. The owner's go-ahead to the PC session asks for search and memory off.

Nits: §9 no longer calls the set "hand-graded"; a reply to choose from and a missing reply count toward the manual-outcome target, and the table says so; `tests/unit/pilot-report.test.ts` runs the report end to end (row mapping, an incomplete run, label grouping, pooling, notes flags).
