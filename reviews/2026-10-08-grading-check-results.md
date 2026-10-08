# Grading check results: independent review of the runs and the outcome

Reviewer: an independent Claude Opus 5.5 session at maximum effort, started by the coordinator in its own thread on 2026-10-08 and briefed only by the packet below (`/mnt/project-files/grading-check/review-2026-10-08-results.md` in the project's shared folder). It reviewed `main` at 96c46d3, after PR #16 was merged, so this is a milestone-end review after merge (`docs/PEER_REVIEW.md`). The response is copied from `/mnt/project-files/grading-check/review-2026-10-08-results-response.md`; the packet's headings are moved down one level.

## Packet

The owner asked on 2026-10-08 (04:13 UTC, "Formal-logic approach" thread) for an independent peer review of the M0b grading check by Claude Opus 5.5 at maximum effort. PR #16 was merged to `main` as **96c46d3** at the owner's request just before this review. The owner chose merge first, then review, so this is a milestone-end review after merge (`docs/PEER_REVIEW.md`).

### Role and ask

You are the independent peer reviewer under `docs/PEER_REVIEW.md`, at maximum effort. You start from this packet and the repository, not from the implementer's conversation.
- Work read-only on https://github.com/brian-se0/premise at commit **96c46d3** on `main`.
- The PR branch `claude/project-thread-74uxzl` keeps the individual commits.
- Write your response to `/mnt/project-files/grading-check/review-2026-10-08-results-response.md`.

Project memory may hold the grading check's scores, verdicts and outcome. Disregard it, and judge only from the repository and the files named here.

The setup of the check (answer set, blind second scorer, registration, metrics and report scripts) was reviewed on 2026-10-06. That review's findings were fixed and verified, and the record is `reviews/2026-10-06-grading-check.md`. Its last verified commit is `9cb7ff8`.

This review covers everything after that point:
1. **The runs.** The free versions of ChatGPT, Claude, Gemini and Grok graded:
   - the development orders `dev-a` and `dev-b`: 13 requests each, 104 replies;
   - the held-out orders `holdout-a` and `holdout-b`: 5 requests each, 40 replies, on arg-0020, arg-0024 and arg-0027.
2. **The freeze between them.** Development parse results are in `expected.json` and `tests/unit/pilot-fixtures.test.ts`. The held-out prompts were built only after the freeze.
3. **The scoring.** See `npm run pilot:score`.
4. **The outcome.**
   - The owner chose outcome 1 with Grok (`docs/DECISIONS.md`, 2026-10-08).
   - The Grade screen line marks Grok as checked (`src/ui/pages/RequestPage.tsx`).
   - The matching `docs/SPEC.md` §5.2 line and `pilot/LOG.md` record it too.

Commits on the branch after the last review:
- `06dd557`: development replies, notes and log
- `745c10a`: freeze and held-out prompts
- `5ab9d4a`: test cleanup
- `f658263`: held-out replies, notes and log
- `fb43f11`: outcome

`3f0758f` merged unrelated content batch 3 from `main`.

### Context

The project is Premise, a free trainer for the reasoning skills on law school admission exams. Students write answers. A chatbot grades them from a copied prompt, or the student grades against the rubric. M0b asks whether a chatbot grades well enough for the owner's own study (`docs/ROADMAP.md` M0b).

#### Decisions already made

These are quoted or summarized from `docs/DECISIONS.md`:
- **2026-10-06, grading targets.** Grading targets the free frontier chatbots first (ChatGPT, Claude, Gemini, Grok) and local models second. The Grade screen links all four.
- **2026-10-06, gold scores.** Claude wrote the answer set and its gold scores. Those scores were fixed and hashed before a blind Claude Opus 5.5 second scorer scored every answer; it agreed on all 70. `pilot/registration.ts` pins Claude's digest, the final labels and every task key.
- **2026-10-08, outcome.** The check ends in outcome 1, proceed with chatbot, naming Grok: the free web version on a PC, private chat in Auto mode, prompt v4, parser v4, default batch of 4.
  - Grok matched 20/20 rows in each held-out run.
  - ChatGPT, Gemini and Claude each missed at least one screening target.
  - Before choosing, the owner was given each held-out row where ChatGPT or Gemini disagreed with the gold.
  - **Rules out:** describing the others as checked; reading the pass as more than a screen; and treating a changed Grok model or mode, prompt version or batch size as checked.

#### How the runs were done

Claude, in a Remote Control session on the owner's PC, pasted every prompt and saved every reply. It used the chatbot's own copy button, after the owner's typed go-ahead for each phase (21:09 UTC 2026-10-06 for development, 00:02 UTC 2026-10-08 for held-out). Setups per chatbot are in `pilot/LOG.md` and each run's `notes.csv`. In brief:
- **ChatGPT:** free, temporary chat set to Unpersonalized, gpt-5-6. One development reply came from gpt-5-6-mini after a limit.
- **Claude:** the owner's paid Max account, incognito chat, Sonnet 5.5 at Medium. That is assumed to be the free default, which claude.ai does not show.
- **Gemini:** free, 3.6 Flash. It had no temporary chat, so this was a normal chat saved to history.
- **Grok:** private chat in Auto mode. The plan was not shown.

Replies are stored byte for byte (`.gitattributes` marks them `-text`, so they keep CRLF). Development `notes.csv` were converted from the PC session's own columns to the README's header, with values kept.

#### Results as reported

From `npm run pilot:score` at 96c46d3. Each held-out run has 20 rows.
- **Grok:** both runs met every target: exact 20/20, no false passes, 5/5 clean, feedback 20/20.
- **ChatGPT:**
  - holdout-a: one reply's id was mistyped (`eda4b` for `eda9`), so it read as "No score block found". That gave coverage 16/20, clean 4/5, manual 1/5 and feedback 16/20.
  - holdout-b: 3 false passes.
- **Gemini:** holdout-a met every target. holdout-b had 3 false passes and one recoverable reply.
- **Claude (reported apart):** holdout-a had 2 false passes; holdout-b met every target.

### Material

Read at 96c46d3:
- `docs/GRADING_PROTOCOL.md`: §§5–7, §9 and §9a. §9 covers runs, screening targets, "Choosing among chatbots" and outcomes.
- `docs/ROADMAP.md`: M0b.
- `docs/DECISIONS.md`: the 2026-10-08 entry.
- `docs/SPEC.md`: §5.2 item 3.
- `pilot/README.md`, `pilot/LOG.md`.
- `pilot/report.ts`, `pilot/metrics.ts`, `pilot/load.ts`, `pilot/registration.ts`.
- `pilot/runs/holdout-a.yaml`, `pilot/runs/holdout-b.yaml`.
- `pilot/answers/*.yaml`: gold, second score and `why` for each answer.
- `tests/fixtures/pilot/{dev-a,dev-b,holdout-a,holdout-b}/`: request JSON, prompts, raw replies, `notes.csv`, and `expected.json` for the development runs.
- `tests/unit/pilot-fixtures.test.ts`.
- `src/ui/pages/RequestPage.tsx`: the chatbot line.

Also read `/mnt/project-files/grading-check/holdout-disagreements.md`. It is the file the owner was given before choosing, listing each held-out row where ChatGPT or Gemini disagreed with the gold, with the chatbot's feedback.

### Questions

1. **Freeze.** Check that nothing a grader sees or the scorer uses changed between the development runs and the held-out runs. That covers the prompt version and text, the parser version, rubrics and keys (`pilot/registration.ts`), batch size, and each chatbot's setup. Were the held-out prompts built only after the freeze commit?
2. **Scoring.**
   - Independently re-read every held-out reply and confirm the score the report used for each row. Pay particular attention to all 10 Grok replies.
   - Recompute each run's §9 screening metrics by hand, at least for Grok and for the runs that failed.
   - Report any row where the parser's reading differs from what the reply says.
3. **Parser on real replies.** These cases came up:
   - A request id that is not a valid UUID was treated as no score block rather than "a different grading request" (§5 step 4, §9a).
   - A corrected second block with the same scores but a different tag was offered as a choice (dev-a 08 Claude).
   - Feedback headings that contradict the score left feedback unmatched.
   - Gemini's copied text twice contained a cut-off first draft.

   Are these readings what the protocol says? Are any of them problems a student would hit often enough to need a parser change, with a new parser version?
4. **Gold on the disagreement rows.** For wea11, fla14, str12, con12 and asm11 (`holdout-disagreements.md`), read the key and judge whether the gold is right. If a chatbot's score is defensible under the key, say so. The counts stay against the registered gold, but the owner should know.
5. **Validity of the pass.** Weigh the threats and say whether outcome 1 with Grok is justified, or whether the decision should be worded differently. Consider:
   - 20 rows per run;
   - synthetic answers written against the keys;
   - gold from Claude;
   - Claude doing the pasting;
   - Grok's "Auto" mode, which may route to different models over time;
   - Gemini chats saved to history;
   - ChatGPT sometimes receiving the prompt as an attachment;
   - the Claude run on a paid account.
6. **Wording.**
   - Does the `DECISIONS.md` entry overclaim or underclaim?
   - Does the Grade screen line ("A checked chatbot's free version graded Premise's test answers in line with the answer keys.") tell a student something true and useful? Propose better wording if not.
7. **What M0b still needs.** The roadmap says the owner pastes a few prompts on their phone, and that has not happened yet. Does it, or anything else, block M0b from being done? What should happen to the held-out exercises now that their results have informed a decision, and to the key-clarity notes (`/mnt/project-files/grading-check/key-clarity-notes.md`)?
8. Anything else you find, in the code, docs or fixtures changed after `9cb7ff8`.

### Response format

Numbered findings. Give each one:
- a severity (`blocker`, `major`, `minor`, `nit`);
- the file and section;
- the problem;
- a proposed fix.

Then a short verdict on the outcome: whether it stands, should be reworded, or should be reopened.

## Reviewer response

Independent review under `docs/PEER_REVIEW.md`, by a separate session at maximum effort, working read-only on `main` at 96c46d3 (individual commits read from the PR branch). I did not read project memory. What I ran:
- `npm run pilot:score`, whose output matches `/mnt/project-files/grading-check/pilot-results.md` line for line;
- `tests/unit/prompt.test.ts` and `tests/unit/pilot-fixtures.test.ts`, where all 48 tests pass;
- my own dump of the parser's reading of all 40 held-out replies beside the gold, read against each reply's text;
- a phrase-overlap check of every held-out feedback against the answer files' `why` text, which no prompt contains.

One caveat on independence: I am also a Claude model, so where I agree with the gold, that is a third Claude reading, not an outside check.

**In short:** the outcome stands. My hand count of every held-out run matches the report exactly, the freeze held, and no defensible re-reading of a disputed row changes any verdict. The Grade screen line and the decision entry should be reworded. M0b is not done until the phone pastes and the held-out parse fixtures are handled.

### Answers to the questions

**1. Freeze.** It held.
- Nothing a grader sees or the scorer uses changed after the last review. `git diff 9cb7ff8 96c46d3` touches no file under `src/domain/` and none of the pilot scripts. `content/` gains only batch 3 (arg-0029 to arg-0038, all new; `published-tasks.json` only adds lines), and `npm run pilot:score` accepts all 28 registered task hashes and both digests.
- `tests/unit/prompt.test.ts` rebuilds all 36 pilot prompts, development and held-out, byte for byte from today's builder, and checks every task's snapshot hash against the fixture.
- Batch size: every held-out request has 4 rows, as did every development request except the last of each order (2 rows).
- Setup: each chatbot's `notes.csv` shows the same model label, account, chat mode, client and copy method in both phases. ChatGPT's one gpt-5-6-mini reply and its one empty reply were in development only.
- Timing: the last development reply came at 12:34 UTC on 2026-10-07 (ChatGPT, dev-b). The development `expected.json` files and the held-out prompts were both added in 745c10a at 23:56 UTC. The go-ahead came at 00:02 UTC, and the held-out runs took place from 00:10 to 00:37 UTC on 2026-10-08. The held-out prompts were built in the freeze commit itself, after every development reply existed and before any held-out paste, which is what §9 asks.
- One thing no one can check: which model Grok's Auto mode used. The visible label was "Auto" throughout (finding 6).

**2. Scoring.**
- Every score the report used is the score in the reply's own block. I read all 40 replies.
- **All 10 Grok replies** have one feedback pair and one score block each. Every row's heading equals its block score, the criteria marked "met" add up to the score in all 40 rows, and every tag is allowed. In each run, 20 of 20 rows equal the gold.
- Hand count. The held-out set has 7 rows whose gold is full credit and 13 below full.

| Run | Coverage | Exact | False passes | Pass/fail | Clean | Manual | Feedback | Targets missed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Grok holdout-a | 20/20 | 20/20 | 0/13 | 20/20 | 5/5 | 0/5 | 20/20 | none |
| Grok holdout-b | 20/20 | 20/20 | 0/13 | 20/20 | 5/5 | 0/5 | 20/20 | none |
| ChatGPT holdout-a | 16/20 | 15/16 | 0/9 | 16/16 | 4/5 | 1/5 | 16/20 | coverage, clean, manual, feedback |
| ChatGPT holdout-b | 20/20 | 17/20 | 3/13 | 17/20 | 5/5 | 0/5 | 20/20 | false passes, pass/fail |
| Gemini holdout-a | 20/20 | 20/20 | 0/13 | 20/20 | 5/5 | 0/5 | 19/20 | none |
| Gemini holdout-b | 20/20 | 17/20 | 3/13 | 17/20 | 4/5 | 0/5 | 20/20 | false passes, pass/fail, clean |
| Claude holdout-a | 20/20 | 16/20 | 2/13 | 17/20 | 5/5 | 0/5 | 20/20 | false passes, pass/fail |
| Claude holdout-b | 20/20 | 18/20 | 1/13 | 19/20 | 5/5 | 0/5 | 19/20 | none |

Every cell matches the report. Rows where the parser's reading differs from what the reply says:
- **ChatGPT holdout-a 03** (wea12, fla13, asm11, con12). The block reads 0/2, 0/2, 0/2 and 0/1, all equal to the gold. But its id is `5eb00edc-eda4b-…` where the request's is `5eb00edc-eda9-…`, so the parser finds no block. Had it been read, ChatGPT would have met every target in holdout-a. It still fails holdout-b, so its verdict is the same.
- **Gemini holdout-a 04, I04** (str14, gold 0). The heading says 1/2 and the block 0/2. The parser takes the block, which is the gold, and leaves the feedback unmatched.
- **Claude holdout-b 05, I04** (str14, gold 0). The heading says 2/2 with both criteria "Met", and the block says `0/2 | irrelevant`. It gets the same handling (finding 13).
- **Gemini holdout-b 03, I01** (con12, gold 0). The row reads `1/1 | overstated`, and its tip warns against overstating. The parser takes 1/1, a false pass. Tags never change a score (§6), so this follows the protocol.
- **Gemini holdout-b 03, I04** (fla13). The tag `ad-hominem` isn't allowed and is dropped, which makes the reply recoverable. The score, 0/2, is read.

**3. Parser on real replies.** All four readings follow the protocol, none occurred in Grok's 36 replies, and each fails safe: no wrong score is imported. None needs a new parser version now. Two messages should improve at the next one (finding 11).
- **Invalid id.** `eda4b` makes the header fail the `BEGIN SCORES v<version> request=<uuid>` grammar. The candidate is set aside (§5 step 4, §9a) and is not a candidate "for another request id". With nothing left, step 6 gives "No score block found". "This reply belongs to a different grading request" would be wrong too, since the id belongs to no request. Rejecting a damaged id is right; the message is what misleads. It happened once in 144 replies.
- **Corrected second block** (Claude dev-a 08). Parsed rows include tags, so two blocks with equal scores and different tags are not equivalent (§5 step 6), and the student picks one. It happened once in 144 replies and costs one click. No change.
- **Contradicting headings.** §7 leaves a row's feedback unmatched when its heading's score disagrees with the block. This happened in five rows of four replies (Claude dev-a 04, dev-b 05 and holdout-b 05; Gemini holdout-a 04). In both held-out cases the block, not the heading, matched the gold, so the guard chose well. But the message hides the contradiction, which a student should see (finding 11).
- **Gemini's cut-off drafts** (dev-a 06, dev-b 06). The draft stops mid-line, and the fresh `BEGIN FEEDBACK` is glued to the end of that line, so it does not start a line and is not a boundary (§7).
  - The pair is the first `BEGIN FEEDBACK` and the single `END FEEDBACK`.
  - Rows headed in both the draft and the full text have two headings and are unmatched: I01 in dev-a 06, and I01 to I03 in dev-b 06. The rest match.
  - Scores come from the one block.
  - It is Gemini only and development only. No change.

**4. Gold on the disagreement rows.** All five golds are right. Only two chatbot scores have a lenient reading behind them, and no verdict changes under any reading I can defend.
- **wea11 (gold 0).** Right.
  - The streak holders started behind and ended far ahead, which makes the streaks look more effective, not less.
  - So the fact gives no reason to doubt the streaks (criterion 1), and it cannot make starting level a better explanation of the gap (criterion 2).
  - The 2/2 from ChatGPT, Claude and Gemini is not defensible.
  - But the prompt never states the direction. "Gives a real reason to doubt" implies it, and the explicit rule is only in the exercise's `difficulty_note`, which graders never see (finding 9).
- **fla14 (gold 0).** Right.
  - The answer says the ad assumes that the better speakers kept the streaks, which is the very alternative the ad ignores. It then asserts the ad's conclusion.
  - It doesn't identify the move from scores to cause (criterion 1), and it rejects the open alternative instead of offering it (criterion 2).
  - A 1 is arguable only on a keyword reading of criterion 1, since the answer does name the scores and the causal claim.
  - A 2 (ChatGPT, holdout-b) is not defensible. This is the keyword-contradiction answer type doing its job.
- **str12 (gold 1).** Right.
  - The fact closes off other sources of hare-marked paper, one of the main kinds in the key, but the answer never says how that bears on the date.
  - The key says "A qualifying new fact whose bearing is not explained earns 1", and the 1/2 anchor has the same shape.
  - A 2 is the most defensible chatbot score of the five rows, because "it all came from the holt mill" lets a lenient reader supply the link. It is still the weaker reading.
- **con12 (gold 0).** Right. The key rules out "a call for the society to support the plan" in both the accept text and the rubric. Gemini's 1/1 contradicts its own `overstated` tag and tip.
- **asm11 (gold 0).** Right.
  - "Turning the silo into apartments still keeps whatever makes it historically important" is the argument's intermediate conclusion. The answer follows it with a stated premise and the main conclusion, so the disqualifier applies.
  - The 1/2 anchor makes that claim about any old building. This answer makes it about this silo, so it restates the argument instead of naming an assumption.
  - Gemini's 2/2 is not defensible.
- **Effect on the counts.** Even with str12 at {1, 2} and fla14 at {0, 1}, ChatGPT holdout-b keeps 2 false passes and still fails, and Gemini's three false passes don't move. Grok matched the gold on all five rows in both runs.

**5. Validity of the pass.** Outcome 1 with Grok is justified as what §9 says it is: a screen for the owner's own study, in the configuration tested. The threats limit how far the claim reaches, not whether Grok passed.
- **20 rows a run.**
  - With no disagreements in 20 rows, the one-sided 95% bound on Grok's disagreement rate is 14% a run.
  - With no false passes on 13 below-full rows, the bound on its false-pass rate is 21% a run.
  - Pooling the two runs looks tighter (11% for false passes), but both runs grade the same 20 answers.
  - The development runs add real weight. Nothing in Grok's setup was tuned on them, and all four chatbots got the same prompts. There, Grok matched 85 of 86 rows with a single gold score (the other was one point high, not a pass/fail error) and stayed within the acceptable set on all 14 other rows. Every reply was clean.
- **Synthetic answers.** This is the biggest limit. Claude wrote the answers to fit the §9 answer types. Real answers are longer and messier, and graders may be more lenient on them. The decision already rules out reading the pass as more than a screen. While studying, the owner could note any grade they disagree with, as ongoing evidence until M3 brings real answers.
- **Gold from Claude.**
  - Agreement is with Claude's reading of the keys, checked by a second Claude session, and my reading of the five disputed rows is a third.
  - No person graded a blind subset. §9 asks for one where practical, and the 2026-10-06 decision explains why the owner's scores aren't a benchmark yet.
  - Grok comes from a different developer, and it agreed on all 40 rows. That is mild evidence that this reading of the keys isn't one only Claude would give.
- **Claude doing the pasting.** The replies look untouched. They keep CRLF line endings, a mistyped id that cost ChatGPT, Gemini's glued drafts, and one empty ChatGPT reply saved empty. But the pasting session cloned the public branch, which held the gold, and Grok's private chats leave nothing to check a reply against (finding 7).
- **Grok's Auto mode.** Auto picks among models that xAI can change without any visible label, so the pass describes Grok as it behaved from 2026-10-06 to 2026-10-08. The claim needs a date and a cheap drift check (finding 6). The log also says the mode was switched from Expert to Auto at dev-a 01, so a student's Grok may not start in Auto.
- **Gemini chats saved to history.** This departs from the protocol: Gemini offered no temporary chat and no memory switch. The log records it. It could only have affected Gemini, which didn't pass.
- **ChatGPT receiving the prompt as an attachment.** ChatGPT does this with a long paste for any student, so it is realistic, and the log records it. It bears on ChatGPT only. The damaged id came in a request that went as an attachment, but nothing shows the attachment caused it.
- **Claude on a paid account.** Claude's numbers don't measure the free plan. The entry says so, and Claude is reported apart and can't select outcome 1.
- **Not in the packet's list.**
  - Choosing the best of four chatbots on the same held-out rows flatters the winner (finding 10).
  - The gold was public during the runs (finding 7).
  - The two orders overlap on the hardest rows (finding 12).
  - None of these overturns the pass.

**6. Wording.**
- The decision entry is accurate and mostly well scoped, with small slips in both directions (finding 4).
- The Grade screen line is the real problem (finding 1). It presents a 20-answer screen as general agreement with the keys and leaves out the conditions, and on a public page it reads as an endorsement.
- The README now contradicts the outcome (finding 5).
- Each finding proposes replacement text.

**7. What M0b still needs.**
- **The phone pastes.** As the roadmap is written, they keep M0b from being done. M0b asks two questions, and only the first has an answer (finding 3).
- **Held-out parse fixtures.** The held-out runs need hand-checked expected parse results. The roadmap requires them, and the test currently skips them without notice (finding 2).
- **The held-out exercises.** Declare them regression material. They stay in the app as ordinary study exercises and can serve parser re-scoring and drift checks. They can't support a new claim, so the second pilot that SPEC §8 requires uses fresh ones (finding 10).
- **The key-clarity notes.** They can be applied now, but freeze the pilot's snapshots first. Otherwise the first edit to one of the 28 registered tasks turns CI red and stops `pilot:score` (finding 8). Add the held-out observations and move the notes into the repository (finding 9).

**8. Anything else.**
- Findings 2, 5, 12 and 14 cover the rest of what I found.
- `.gitattributes` keeps replies byte for byte, and I confirmed CRLF in the saved files.
- `pilot/README.md` and `docs/SPEC.md` §5.2 describe the change accurately.
- `holdout-disagreements.md` lists every held-out disagreement by ChatGPT and Gemini with its feedback, plus the four unread rows.
- The merge of content batch 3 touches no registered task.

### Findings

1. **major**: `src/ui/pages/RequestPage.tsx` lines 47 to 53 and 293 to 297 (the chatbot line); `docs/SPEC.md` §5.2 item 3.
   - **Problem.** The line reads "A checked chatbot's free version graded Premise's test answers in line with the answer keys."
     - It presents a screen of 20 synthetic answers a run as general agreement with the keys. "Test answers" can also read as the student's own answers.
     - It leaves out what the decision rests on: Auto mode, a private chat, the website, 4 answers per prompt, prompt v4 and October 2026. The mark shows on every request, although Settings allows 1 to 8 answers per prompt and the decision rules out treating a changed batch size or prompt version as checked.
     - It gives the student nothing to do, when the useful advice is to read the feedback before confirming.
     - The site is public (the README says it is live at brian-se0.github.io/premise), so the line reads as a recommendation. SPEC §7 ("chatbot endorsements"), SPEC §8 ("Recommending any chatbot to other students is a separate decision") and GRADING_PROTOCOL §9 ("do not make the chatbot a recommendation to anyone else") all keep that out.
   - **Fix.**
     - Replace the sentence with: "Checked means that in a small test in October 2026, Grok's free website (private chat, Auto mode, 4 answers per prompt) gave sample answers the same scores as Premise's answer keys. Any chatbot can misgrade, so read the feedback before you confirm."
     - Either show the mark only on prompt-v4 requests of at most 4 rows, or let "4 answers per prompt" in the line carry the condition. The first is accurate; the second needs no code.
     - Add a test for the mark and the line.
     - In SPEC §5.2 item 3, write: "A chatbot that passed the grading check is marked checked, for the setup it was checked in; so far that is Grok (`DECISIONS.md`, 2026-10-08)."

2. **major**: `tests/fixtures/pilot/holdout-a/` and `holdout-b/`; `tests/unit/pilot-fixtures.test.ts` line 12; `docs/GRADING_PROTOCOL.md` §10; `docs/ROADMAP.md` M0b.
   - **Problem.** The 40 held-out replies, which the outcome rests on, have no `expected.json`. M0b requires every "hand-checked parse result" to be saved, and §10 says the parser must reproduce them.
     - The test keeps only runs that have an `expected.json`, so the missing files are skipped without notice.
     - The score report and the disagreement file the owner saw exist only in the project folder, outside the repository.
     - A parser change could therefore alter Grok's held-out numbers while CI stays green.
   - **Fix.**
     - Add `expected.json` for both held-out runs. My reading of all 40 replies agrees with the parser's, and answer 2 lists the five places where a reply says something its parse doesn't take. The files can be generated and checked against that list.
     - Make the test fail when a run folder has replies but no `expected.json`.
     - Commit the `pilot:score` output and `holdout-disagreements.md` beside `pilot/LOG.md` as the outcome's record.

3. **major**: `docs/ROADMAP.md` M0b; `docs/DECISIONS.md` 2026-10-06 (the gold-scores entry: "the owner pastes a few on their phone, since the check also measures whether the copy-paste loop is tolerable"); `pilot/README.md` (run rules).
   - **Problem.** No phone paste has happened.
     - M0b asks whether the copy-paste loop is tolerable, but Claude did every paste, on the PC.
     - The log records that session's friction: ChatGPT's limit of about ten replies a window, Gemini needing its tab in front, and long pastes turned into attachments. Nothing records the owner's own experience.
     - A phone's copy control may also change line breaks or Markdown, which the parser depends on, and the owner may well study on a phone.
   - **Fix.**
     - The owner pastes three to five saved held-out prompts into Grok on the phone (private chat, Auto mode), copies each reply with the app's own control, and posts it in the project thread to be saved.
     - Record the parse outcome, the time each request took and any friction in `pilot/LOG.md`, and try the whole loop once through the live Grade screen.
     - Alternatively, record a decision moving the loop question into M2 and M3 use.
     - Until one of these is done, don't describe M0b as done. These pastes measure the loop; they don't extend "checked" to the phone app.

4. **minor**: `docs/DECISIONS.md`, 2026-10-08 entry.
   - **Problem.** The entry is accurate and mostly well scoped, with small slips in both directions.
     - The **Why** says "Grok was the only chatbot other than Claude to meet every screening target in both orders". That reads as if Claude met them all, but Claude missed two in holdout-a.
     - §9 says "Report the counts and this bound". The entry gives no bound, and it leaves out the development results, which strengthen the pass.
     - "Free" is inferred: the plan wasn't shown, though the menu offered "Upgrade plan". "Auto" picks among models rather than naming one, and the entry doesn't date the claim.
     - The entry names parser v4 and "on a PC", but **Rules out** doesn't cover a parser change or a different client.
     - The ChatGPT holdout-a line names three of the four targets it missed. It leaves out the manual-outcome target (1/5).
     - Nothing says that no person graded a blind subset, or what M0b still owes.
   - **Fix.** Edit in place:
     - Opening sentence: "...naming Grok as tested from 2026-10-06 to 2026-10-08: the free web version on a PC (signed in; the plan isn't shown, but the menu offers an upgrade), in a private chat in Auto mode, ..."
     - Grok bullet, add: "With 0 false passes on 13 below-full rows a run, the one-sided 95% bound on its false-pass rate is 21% a run; the two runs grade the same 20 answers. In development, in the same setup, it matched 85 of 86 rows with a single gold score and made no pass/fail error."
     - ChatGPT holdout-a: add the manual-outcome target (1/5).
     - **Why:** "Grok was the only chatbot to meet every screening target in both orders; Claude, reported apart, missed two in holdout-a."
     - **Rules out**, last item: "treating a changed Grok model or mode, another client such as the phone app, or a new prompt version or batch size as checked without a new check on fresh held-out exercises; or treating a new parser version as checked until it re-scores the saved held-out replies within every target."
     - Closing line: "No person graded a blind subset. The held-out exercises are now regression material. Still open in M0b: the owner's phone pastes and the held-out runs' expected parse results."

5. **minor**: `README.md` line 20 ("How it works", step 3).
   - **Problem.** "The free version of ChatGPT, Claude, Gemini or Grok works, and so can a model running on your own computer." This line dates from 9062e4e, before the check. It now contradicts the outcome: three of the four chatbots missed a target, and local models are untested.
   - **Fix.** "Paste it into any chatbot. So far only Grok's free website has passed Premise's grading check (October 2026). Read the feedback there."

6. **minor**: `docs/DECISIONS.md` 2026-10-08 (**Rules out**); `pilot/README.md`.
   - **Problem.** The decision says a changed Grok model no longer counts as checked. But Auto can change models without any visible sign, so the rule can never trigger.
   - **Fix.** Add a drift check.
     - Every month or two, or when xAI announces a new default model, the owner pastes holdout-b requests 02 and 04 into Grok in the same setup and compares the scores with the gold. Those two requests hold four of the five rows ChatGPT and Gemini missed: wea11, fla14, asm11 and str12.
     - Any false pass means the mark comes off until a new check.
     - This uses regression material, so it detects drift, not generalization. A scheduled reminder would keep it from being forgotten.

7. **minor**: `pilot/answers/*.yaml` (public on the PR branch since 7094d21); `/mnt/project-files/grading-check/pc-run-brief*.md` ("the public repo"); `docs/GRADING_PROTOCOL.md` §9 (gold labels, "For a later check").
   - **Problem.** The gold scores and their reasons were publicly readable during every run.
     - Grok's notes say "No web search switch offered", so in principle a grader could have found them. The pasting session cloned them.
     - I found no sign that either mattered:
       - Every reply is noted as not searching the web.
       - My phrase check of each held-out feedback against the hidden `why` text finds only paraphrases of the answer or the rubric.
       - Grok and ChatGPT show similar rates: 10 and 9 of 40 rows share a five-word phrase with a `why`.
       - Grok's longest overlap, on con14, restates the answer's own words.
   - **Fix.** Add to §9, for the next check: commit only the salted digest before the runs, and commit the answer files after the last reply is saved. The pasting session then copies only the fixture folders.

8. **minor**: `tests/unit/prompt.test.ts` lines 205 to 224; `pilot/load.ts` lines 108 to 123; `key-clarity-notes.md`.
   - **Problem.** The prompt test requires each pilot task's current snapshot hash to equal the fixture's, and `pilot:score` refuses a changed registered key. With a DECISIONS entry, keys may now change (§9). But the first key-clarity fix to any of the 28 registered tasks will turn CI red and leave the recorded results irreproducible.
   - **Fix.** Before that first edit, save the 28 registered snapshots with the fixtures, for example in `tests/fixtures/pilot/snapshots.json`, checked against `registration.ts`, and have the test and the pilot scripts read them. Key fixes then follow `EXERCISE_FORMAT.md` §6 and the usual checks by the owner and a reviewer.

9. **minor**: `/mnt/project-files/grading-check/key-clarity-notes.md`; `content/exercises/arg-0020.md` (weaken, flaw); `content/exercises/arg-0024.md` (assumption).
   - **Problem.** The notes have no section from the held-out runs, and they live outside the repository. The held-out runs add these points:
     - arg-0020.weaken: the direction rule is only in `difficulty_note`, which graders never see. In holdout-b, three of the four chatbots gave wea11 2/2.
     - arg-0020.flaw: no line of the key says that an answer that reverses the ad's inference fails criterion 1. fla14 drew three 1s and a 2.
     - arg-0024.assumption: the wording of the 1/2 anchor is close to the intermediate conclusion that asm11 restates.
     - The str12 point (arg-0027.strengthen) is already in the notes.
   - **Fix.**
     - Add these under "From the held-out runs" and move the file into the repository.
     - After finding 8, add to arg-0020.weaken's accept text: "A starting difference that favors the other group (the streak holders began behind) earns 0: it makes the streaks look more effective, not less."

10. **minor**: `docs/GRADING_PROTOCOL.md` §9 ("Split by exercise"); `docs/DECISIONS.md` 2026-10-08.
    - **Problem.** §9 turns a holdout into regression material "once holdout results have influenced a change". Here the results chose among four chatbots rather than changing anything, so the rule doesn't plainly apply. The effect is the same, though: picking the best of four on the same 20 answers flatters the winner, so these rows can't support a new claim about Grok.
    - **Fix.**
      - Record arg-0020, arg-0024 and arg-0027 as regression material, used for parser re-scoring and drift checks.
      - Widen §9's rule to "influenced a change or a choice among chatbots".
      - The second pilot that SPEC §8 requires should use exercises that no chatbot has graded for the project.

11. **minor**: `src/domain/scoreParser.ts` (messages); `docs/GRADING_PROTOCOL.md` §5 step 6 and §7.
    - **Problem.** Both readings below follow the protocol, and neither happened with Grok, but the messages mislead.
      - A block with a damaged id produces "No score block found" while the block is plainly there.
      - When a heading's score contradicts the block, the message says only that feedback couldn't be matched. It hides that the chatbot gave two different scores.
    - **Fix.** Don't make a new parser version just for this. In the next one, name both cases and add a reply fixture for each. Under finding 4, that version also re-scores the saved held-out replies.
      - "Found a score block, but its first line doesn't match this request. Check that the request id was copied exactly, or enter the scores yourself."
      - "The feedback for this item gives 2/2, but the score block gives 0/2. The block's score is used; read the full reply before you confirm."

12. **nit**: `pilot/runs/holdout-a.yaml` and `holdout-b.yaml`.
    - **Problem.** wea11, con13 and fla14 share request 02 in both orders, and fla14 is I04 both times.
      - Across the two orders, 8 of 30 row pairs share a request.
      - I simulated random orders under the one-answer-per-task rule. They average about 5.5 shared pairs, and 8 or more come up about one draw in six, so this is within chance.
      - Even so, the second order changed little of the context around the two rows other chatbots missed most. Grok's result doesn't depend on it.
    - **Fix.** Next time, redraw the second order until no three rows share a request in both orders.

13. **nit**: `tests/fixtures/pilot/holdout-b/request-05.reply.claude-1.txt`; `docs/DECISIONS.md` (Claude bullet).
    - **Problem.** On str14 (gold 0), Claude's feedback says 2/2 with both criteria "Met", while its block says 0/2. The parser rightly takes the block, so holdout-b shows one false pass. Going by its feedback, holdout-b would have two false passes and miss two targets. That doesn't touch the outcome, but "holdout-b met every target" overstates Claude's consistency.
    - **Fix.** Add "(counting one row where its feedback gave 2/2 and its block 0/2)" to the Claude bullet.

14. **nit**: `pilot/LOG.md`, held-out entry ("prompts from 5ab9d4a").
    - **Problem.** The prompts were built and frozen in 745c10a. 5ab9d4a is the commit the PC session cloned, and it leaves them unchanged.
    - **Fix.** Write "prompts built in 745c10a (cloned at 5ab9d4a, which leaves them unchanged)".

### Verdict

The outcome stands. Outcome 1 with Grok, in the configuration tested, is what the runs show and what §9 allows. The decision entry, and above all the Grade screen line, should be reworded (findings 1 and 4). M0b should not be called done until the phone part and the held-out fixtures are handled (findings 2 and 3). Nothing here calls for reopening the outcome.

## Triage

Fixes are in the commit that adds this record unless noted. The outcome stands; nothing here changes a gold score, a label or a registered key.

1. **Accepted.** The Grade screen line now reads: "Checked means that in a small test in October 2026, Grok's free website (private chat, Auto mode, up to 4 answers per prompt) gave sample answers the same scores as Premise's answer keys. Any chatbot can misgrade, so read the feedback before you confirm." The checked setup lives in `src/domain/chatbots.ts`, and the mark and its sentence show only on prompt-v4 requests of at most 4 answers (`checkedFor`, tested in `tests/unit/chatbots.test.ts`). The closing sentence shows on every request. `tests/e2e/grading.spec.ts` checks both on a two-answer request. `docs/SPEC.md` §5.2 item 3 uses the proposed wording.
2. **Accepted.** `tests/fixtures/pilot/holdout-a/expected.json` and `holdout-b/expected.json` hold the parser's result for all 40 held-out replies; a separate script checked them against the five places in answer 2 and found no difference. `tests/unit/pilot-fixtures.test.ts` now fails a run folder that has replies but no `expected.json` (checked by removing one). The `npm run pilot:score` output and the disagreement file the owner saw are in `pilot/results/`.
3. **Open, for the owner.** The three prompts are ready (holdout-b 01, 03 and 05, in the project's shared folder under `grading-check/phone/`), and the owner has been asked to paste them into Grok's phone app in a private chat in Auto mode and post each reply in the project thread. The replies will be saved as `grok-phone-1`, which the report keeps apart from Grok's verdict (`pilot/README.md`), with the time and friction in `pilot/LOG.md`. The other route is a decision moving the loop question into M2 and M3 use. `docs/DECISIONS.md` lists the phone pastes as still open in M0b.
4. **Accepted.** The 2026-10-08 entry is edited in place with each proposed sentence: the dates and the plan, the 21% bound and the development result, the manual-outcome target, the Claude note from finding 13, the new **Why**, the client and parser limits in **Rules out**, and a closing paragraph. Since finding 2 is fixed here, the closing paragraph lists only the phone pastes as open. It is the same decision, worded to match the runs; the owner approves the wording with this change.
5. **Accepted.** `README.md` step 3: "Any chatbot takes it, but so far only Grok's free website has passed Premise's grading check (October 2026). Read the feedback there."
6. **Accepted.** `pilot/README.md` "After the outcome" sets the drift check: holdout-b requests 02 and 04 every month or two, and when xAI announces a new default model, saved as `grok-drift-<n>`; any false pass takes the mark off until a new check. A run of the report on a copy of `holdout-b` with a two-reply run under a separate label left Grok's verdict unchanged. Whether to set a recurring reminder is the owner's call.
7. **Accepted for later checks.** §9 "Gold labels": only the salted digest is committed before the runs, the answer files after the last reply, and the pasting session copies only the fixture folders.
8. **Accepted.** `tests/fixtures/pilot/snapshots.json` holds the 28 registered snapshots. `loadFrozenSnapshots` (`pilot/load.ts`) refuses one that no longer hashes to its saved hash, isn't the registered key, or is missing, and `loadSnapshots` gives every registered task its saved snapshot. The pilot scripts, `tests/unit/prompt.test.ts` and `tests/unit/pilot-fixtures.test.ts` read them, and `tests/unit/pilot-report.test.ts` covers an altered and a short file. A key fix to a registered task now follows `docs/EXERCISE_FORMAT.md` §6 without touching the check.
9. **Accepted in part.** The notes are now `pilot/key-clarity-notes.md`, with a section from the held-out runs. The proposed accept-text line for arg-0020.weaken is a key change, so it waits for the owner's approval as a separate content change.
10. **Accepted.** §9 "Split by exercise" now reads "influenced a change or a choice among chatbots". `docs/DECISIONS.md` and `pilot/README.md` record arg-0020, arg-0024 and arg-0027 as regression material for parser re-scoring and drift checks, and `pilot/README.md` says a new claim, such as the second pilot in SPEC §8, needs exercises no chatbot has graded for the project.
11. **Deferred to the next parser version**, as proposed. That version names a damaged request id ("Found a score block, but its first line doesn't match this request. Check that the request id was copied exactly, or enter the scores yourself.") and a heading that contradicts its block ("The feedback for this item gives 2/2, but the score block gives 0/2. The block's score is used; read the full reply before you confirm."), with a reply fixture for each, and re-scores the saved held-out replies (`pilot/README.md`, "Parser changes").
12. **Accepted for later checks.** `pilot/README.md` (`runs/`): redraw the second order until no three rows share a request in both orders.
13. **Accepted.** The Claude bullet in `docs/DECISIONS.md` carries the note.
14. **Accepted.** `pilot/LOG.md`: "prompts built in 745c10a (cloned at 5ab9d4a, which leaves them unchanged)".

The reviewer's suggestion under answer 5, that the owner note any grade they disagree with while studying, is left to the owner.
