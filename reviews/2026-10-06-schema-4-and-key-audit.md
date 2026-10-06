# Schema 4 and the Method key audit

Date: 2026-10-06. Reviewer: GPT-6 Pro, continuing the formal-method consultation (`reviews/2026-10-06-formal-method.md`). Implementer: Claude. Process: `docs/PEER_REVIEW.md`.

## 1. Role and ask

You agreed the selective formal method with Claude in two rounds, and the owner adopted it with your order: (a) the Method document and an audit of the published answer keys now; (b) an optional, display-only `form` field (exercise schema 4), written into the draft batch before its key check; (c) the grading check on frozen payloads with no form lines; (d) the new tags with a grading recheck, then the drill trial. This packet covers the audit from (a) and the contract change from (b).

- **Part A, schema 4.** It changes `EXERCISE_FORMAT.md`, so the peer-review rule applies. Is the display-only boundary real and tested? Can anything let a form line reach a grading payload, show before grading, or slip past approval?
- **Part B, the key audit.** Ten findings in eight published exercises, with fixes. The fixes change grading-payload fields, so they must land before (c) freezes payloads. Is each finding real and each fix right and minimal? Does each count as a wording fix that keeps its task key?

Every file named here can be read at the commit given in the message that sent you this packet: `https://raw.githubusercontent.com/brian-se0/premise/<commit>/<path>`. The method is `docs/METHOD.md`; the exercises are `content/exercises/arg-00NN.md`.

## 2. Context

- Premise is a static web app. Students answer original arguments in writing; any chatbot grades the answer from a prompt the app builds, and the student pastes the reply back. Each task's grading payload (its snapshot) holds exactly: the format, task and exercise ids, kind, skill, difficulty, stimulus, credit, prompt, max, reference, `accept`, disqualifiers, rubric, anchors with their notes, and the allowed error tags (`src/domain/snapshot.ts`). `difficulty_note` and `form` are not in it.
- A published exercise needs `approved_revision` equal to its content revision (SHA-256 over the body and every front-matter field except status and approval bookkeeping), so any edit needs the owner's re-approval. The published-task ledger records every snapshot hash a task has had.
- 2026-10-05 rule (`DECISIONS.md`): a rubric fix that changes the score of some non-anchor answers is still a wording fix (task key kept, re-approved in place) when the task's prompt and `accept` text already called for that scoring. A fix that changes what the prompt or `accept` text asks for needs a new task key.
- The owner is an LSAT beginner and cannot judge keys as an expert. Your check is the expert check before they re-approve.

## 3. Part A: exercise schema 4

### What changed (commit `6869837`, on top of the Method commit `88fee6b`)

1. `scripts/contentSchema.ts`: `schema` is 3 or 4. A task may carry `form`: trimmed, non-empty, at most 300 characters, no line breaks. `form` under `schema: 3` is an error, so a schema 3 file keeps its approved bytes.
2. `src/domain/types.ts`: `Task.form?: string`, commented "never in a snapshot".
3. `scripts/content.ts`: form lines join the blocked-string screen (rule 14).
4. `src/domain/snapshot.ts`: unchanged. The payload is built by copying named fields, so `form` is excluded by construction.
5. `src/ui/pages/RequestPage.tsx`: `formLineOf` reads the task's form line from the current content bundle by exercise id and task key. A row shows it only in state `accepted` (a grade the student confirmed), inside the collapsed "Reference answer" details, under the reference.
6. Docs: `EXERCISE_FORMAT.md` v0.6 (§3.1 Form lines; rules 1 and 14), `ARCHITECTURE.md` §4.1, `DECISIONS.md` (2026-10-06 entries), `METHOD.md` §5.
7. Tests. Unit (`tests/unit/content.test.ts`): rule 14 catches a blocked string in a form line; a form line must be one line and at most 300 characters; `form` under schema 3 fails; adding a form line changes the content revision but leaves the snapshot payload, its hash and the full grading prompt byte-identical (checked with a marker string). Browser (`tests/e2e/grading.spec.ts`): with a draft exercise carrying a form line, the line is absent from the answer page and the copied prompt, and appears with the reference only after the grade is accepted.

### Choices to challenge

- **A1. Current bundle, not frozen.** An old request shows the task's current form line beside its own frozen reference. After a wording fix the two can differ slightly. Freezing the line would mean putting it in the payload or adding a second store, and the line teaches rather than grades.
- **A2. Accepted rows only.** Nothing shows for pending, needs-review or discarded rows.
- **A3. Migration.** Schema 3 files stay valid. Published files move to schema 4 only in a re-approval batch; per your round 2 answer, that batch comes after the grading check.
- **A4. Limits.** One line, at most 300 characters, no markup. The 20 batch 3 drafts run 114 to 215 characters.

## 4. Part B: key audit of the 20 published exercises (40 tasks)

### How it was done

Two independent Claude checks, one for arg-0009 to arg-0018 and one for arg-0019 to arg-0028. Each read `METHOD.md`, `CONTENT_GUIDELINES.md` §3.1, §3.2 and §5, and the batch 1 and 2 reviews and the rubric-wording record; graded every anchor against its rubric; and negated every assumption reference and full-credit anchor. Claude then checked each finding against the files.

Result: 10 findings in 10 tasks (8 exercises). Four could change the score of some answers that are not anchors (B1 to B4); six are wording only (B5 to B10). No anchor's stated score is wrong. The other 30 tasks have no finding.

### Findings and fixes

**B1. arg-0012.strengthen `accept`, plus both tasks' `difficulty_note`.** Could change scores.
- The stimulus rules out citywide changes only "as the main cause of the decline on the eight streets". The keys drop that limit: the strengthen `accept` says "The citywide comparison and the analysis ruling out citywide changes are already given and are not new", so a new fact such as "citywide changes account for almost none of the decline on the eight streets" (which goes further and reduces an open rival) may be graded 0 as not new. METHOD §3.3: rivals ruled out or reduced; §5: scope kept.
- Fix: add "as the main cause" after "ruling out citywide changes" in the strengthen `accept` and `difficulty_note`, and after "Citywide changes are ruled out" in the weaken `difficulty_note` (not in the payload; it rides along).

**B2. arg-0015.assumption `accept`, bridge (c).** Could change scores.
- Before: "(c) the goats' removal, not some other change on those three islands alone (such as replanting), accounts for at least part of their recovery."
- Read literally, it also requires that no other change accounts for any of the recovery. Negate that half (replanting helped too) and the removal can still account for part, so that half is not necessary (METHOD §3.1, an "and" assumption is necessary only if each half is; §3.3, a rival can be true alongside a real cause). An answer such as "no replanting or other change happened on the three islands" is stronger than needed and should earn 1; bridge (c) invites a 2. Rubric criterion 2 already states the right test ("would owe nothing to the goats' removal").
- After: "(c) the goats' removal accounts for at least part of the recovery on the three islands, so that recovery is not wholly the work of some other change on those islands alone (such as replanting)."

**B3. arg-0021.flaw, the 0-point anchor's note.** Could change scores.
- Before: "misses the inference: the policy looks at the change over the previous year, which the stimulus gives, so whether attendance keeps rising has no bearing on this year's renewal"
- The policy makes a rise necessary, not sufficient, and the reference itself says the council "could still refuse the grant for some other reason"; falling attendance now could be such a reason. "No bearing" treats the policy as the whole rule for renewal, the error this task teaches. An answer such as "the council could still refuse despite the rise, for example because attendance is falling now" earns criterion 2 under the `accept` text, but a grader reading this note may withhold it.
- After: "misses the inference: the policy's condition is the rise over the previous year, which the stimulus gives; the answer is about whether attendance will keep rising, not about why that rise does not guarantee renewal"

**B4. arg-0025.weaken, rubric criteria 1 and 2.** Could change scores.
- Before, criterion 1: "… that points to the failed inspections being spread across more restaurants than one in ten." The `accept` text and criterion 2 say "clearly more than one restaurant in ten", and the conclusion is "about one in ten", so a share just above 10% does not weaken it (METHOD §3.2 thresholds; `CONTENT_GUIDELINES.md` §5, material effect). "Not every restaurant that failed did so all four times" forces at least 101 restaurants, meets criterion 1 as written and earns 1; under the `accept` text it earns 0.
- After, criterion 1: "… spread across clearly more than one restaurant in ten."
- Also, criterion 2 says "why it means the failed inspections were spread across clearly more than one restaurant in ten", which asks a weakener to prove its point (`CONTENT_GUIDELINES.md` §3.1). After: "why it makes it likely that the failed inspections were …". Anchors are unchanged under both edits.

**B5. arg-0011.assumption `accept`.** Wording only.
- Before: "earns 2: if most such sites stayed small, the premises would not make a large settlement probable."
- The claim being credited is "such sites more often grew large than stayed small". Its negation is "no more often", which includes an even split; "most stayed small" is the extreme (METHOD §3.1 negation table). The 2 stands either way.
- After: "earns 2: if such sites grew large no more often than they stayed small, the premises would not make a large settlement probable."

**B6. arg-0010.weaken reference.** Wording only.
- Before: "So far fewer unhappy customers reached the survey, …"
- The fact gives departure rates (60 against 10 percent), and chat volume is not given, so the number of unhappy customers reaching the survey could even rise; the weakener works through shares (METHOD §3.2, count = rate × base).
- After: "So a far smaller share of unhappy customers reached the survey (40 percent, against 90 percent), …"

**B7. arg-0015.strengthen reference, `accept` and `difficulty_note`.** Wording only.
- Reference before: "That shows saltbush can recover on those islands themselves once goats are kept off." The fact is one fenced plot on one of the four islands, and "shows" is proof language. After: "That is evidence from one of the four islands that saltbush can recover there once goats are kept off, which makes recovery on the four more likely."
- `accept` before: "evidence that the goats, not something else, explain the recovery on the three (it began soon after the removal)". Its example only makes the goats' role more likely. After: "evidence that the goats' removal explains at least part of the recovery on the three (it began soon after the removal)".
- `difficulty_note` before: "or shows that the goats' removal, not something else, explains the recovery on the three." After: "or makes it more likely that the goats' removal explains at least part of the recovery on the three (for example, by ruling out or reducing another explanation)."

**B8. arg-0022.weaken reference.** Wording only.
- Before: "Most working people in Ardley commute to jobs in the city and get home too late to shop at an evening market. Ardley has few of the shoppers who made the move pay off in Pell, so the move might not raise its sales at all."
- "Most cannot" gives "fewer than half can", not "few" (METHOD §3.1, exact quantifier shapes), and the reference is shown to students.
- After, second sentence: "So most of them are not the kind of shopper who made the move pay off in Pell, and the move might not raise its sales at all."

**B9. arg-0022.strengthen `accept`.** Wording only.
- Before: "the move would not cost Ardley's market its current shoppers (they could come on Thursday evenings too); nothing in Ardley would keep evening shoppers away (no other evening market nearby)"
- "Could come" becomes "would not cost", and availability is not attendance; removing one obstacle becomes "nothing". The batch 2 fix B2-8 corrected the same overstatement in the anchor only.
- After: "facts making it less likely that the move would cost Ardley's market its current shoppers (most are free on Thursday evenings too); facts removing a reason evening shoppers would stay away (no other evening market nearby)"

**B10. arg-0026.strengthen `accept`.** Wording only.
- Before: "households did not replace the bags with other plastic (sales of plastic bin liners held steady, shoppers switched to cloth bags); the fee, not something else, cut the number of bags (in nearby towns without a fee, the number held steady)"
- Each label claims an elimination that its example only makes less likely (METHOD §3.3: a comparison group reduces other explanations; it does not eliminate them). The batch 2 fix B2-13 corrected the same overstatement in the anchor only.
- After: "facts making replacement with other plastic less likely (sales of plastic bin liners held steady, shoppers switched to cloth bags); facts making a cause other than the fee less likely (in nearby towns without a fee, the number held steady)"

### Considered and not reported

- arg-0009.flaw, criterion 2's example "such as their teenagers already wanting more library time": a standing condition, not a change, so on its own it cannot produce a rise; not a clear Method conflict.
- arg-0012.strengthen, criterion 2 says "main cause" where the claim is "most of the decline": a negligible difference.
- arg-0014.weaken, the 2-point anchor compares one month with a monthly average: a comparable unit, and a weakener need not prove.
- arg-0016.weaken reference, "about 0.1 seconds" against "four seconds": approximate but harmless.
- arg-0022.weaken, the 0-point anchor's "would have risen anyway" is read as denying the causal premise: fair for a single event, and the anchor is not about Ardley anyway.
- arg-0023.weaken: "need not mean there are fewer lynx" sits on a fact that makes another explanation plausible, so it is a real weakener. The 2-point anchor's "photos" for the stimulus's "occasions" is treated as the same throughout.
- arg-0025.weaken reference, "almost no … nearly 400" is loose, but "far more than one in ten" holds.
- arg-0027.strengthen `accept`: "closing off" goes with an example that fully rules out the named alternative.

Arithmetic and negations checked without a finding include arg-0014 (the 5/3 threshold), arg-0021.assumption (De Morgan on "no lack of money or binding limit"), arg-0023.weaken (120 to 58 is a fall of 51.7%; without the family, 60 to 58), arg-0025.flaw (400 failures on 100 to 400 restaurants), arg-0026.strengthen (1/3 × 80% ≈ 27%) and arg-0027.assumption (1801 − 1788 = 13 years).

### Plan for the fixes

All ten land together, with the owner's re-approval of the eight exercises in place (task keys kept), before the grading check freezes payloads. Form lines for the 40 published tasks wait for the re-approval batch after the grading check, as agreed in round 2.

## 5. Questions

1. Part A: is the display-only boundary sound and tested enough? Do you accept A1 to A4?
2. B1 to B10: is each finding real and each fix right? Give corrected wording where it is not.
3. Do B1 to B4 count as wording fixes under the 2026-10-05 rule, or does any need a new task key?
4. Optional: anything in the 40 published keys the audits missed under METHOD §3 and §5?

## 6. Response format

Numbered findings, each with severity (`blocker`, `major`, `minor`, `nit`), the part and file, the problem and a proposed fix. Then one line each for A1 to A4 and B1 to B10: agree, change (with wording), or reject (with the reason).
