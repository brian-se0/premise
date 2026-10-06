# Peer consultation: a formal method for the exam

A two-round consultation with GPT-6 Pro on 2026-10-06, run in one chat through the owner's Brave browser (https://chatgpt.com/c/6ac538ec-1278-83e8-9aa4-213efc7c0beb), maximum thinking effort. The owner asked for "a maximally mathematical approach", limited to what is strictly beneficial, and for Claude and Pro to agree on a direction before reporting. Outcome: `docs/METHOD.md` and the `DECISIONS.md` entry of 2026-10-06. Both prompts were sent inline; both replies were copied with ChatGPT's copy button and checked against the page by exact string comparison (SHA-256 of the copied text: round 1 `29fa9fb28faa2698c7e9c50d0e5aba572fe2f1f51c9780dcc3b5f7caa61eace5`, round 2 `fc157f0035b0467e0ca22c7b1fd33cf5b6afc665a652d2aa6abd69ae2ffac14e`). The relay escaped `>` in round 1's reply; it is restored below.

## Round 1 packet

# Direction check: a formal ("mathematical") method for Premise

You are a peer reviewer for Premise, a free, open-source trainer for the reasoning skills tested by law school admission exams. I am Claude, building it with its owner. The owner, a beginner at the exam, wants us to agree on a direction before more exercises are written. Their words:

> "Taking a maximally mathematical approach to take this exam in the most formulaic, organized, systemic way possible. Perhaps it looks like translating a sentence into a line with math symbols then applying De Morgan's to squeeze out an answer? Or something more or less involved? We want to limit this approach so that it's strictly beneficial for users, and not over complicating the exam with math just for the sake of math."

Please critique my proposal below, correct anything wrong, and say where you would draw the line differently. We want to agree on one direction before reporting to the owner.

## What Premise is today

- Students read short original arguments (60 to 180 words) and **write** the conclusion, a necessary assumption, the flaw, a strengthener or a weakener in their own words. A "Copy for grading" button builds a prompt they paste into any chatbot; the reply ends in a fixed score block the app parses. No server, no AI API, no network: a static site with on-device storage and spaced repetition.
- Positioning: targeted reasoning repair for students past the basics (find the move a student keeps missing, give one correction, recheck it on a fresh argument), plus a short final-weeks mode.
- Hard limits: no official or prep-company questions, explanations or paraphrases; no exam branding; free response, not a multiple-choice bank; students keep taking official practice tests elsewhere.
- 20 published exercises, 8 drafts, 10 more in review. Optional reading, pinned to the current main:
  - Spec: https://raw.githubusercontent.com/brian-se0/premise/6c9db63059da2b39a72dec9f3c3ce1492dc78d35/docs/SPEC.md
  - Decisions: https://raw.githubusercontent.com/brian-se0/premise/6c9db63059da2b39a72dec9f3c3ce1492dc78d35/docs/DECISIONS.md
  - Content guidelines: https://raw.githubusercontent.com/brian-se0/premise/6c9db63059da2b39a72dec9f3c3ce1492dc78d35/docs/CONTENT_GUIDELINES.md
  - Skills and error tags: https://raw.githubusercontent.com/brian-se0/premise/6c9db63059da2b39a72dec9f3c3ce1492dc78d35/content/taxonomy.yaml
  - Exercises: https://github.com/brian-se0/premise/tree/6c9db63059da2b39a72dec9f3c3ce1492dc78d35/content/exercises

## My proposal: formal where form decides

Thesis: the exam's argument questions reward one move above all, comparing exactly what the evidence establishes with exactly what the conclusion claims. A formal tool earns its place only when it makes that comparison faster or more accurate than careful English. That holds for a few argument shapes and not for most. So: one frame for every argument, and three small kits that switch on only when trigger words appear.

### 1. The frame (every argument, no notation)

Evidence ⊢ Claim. Each skill is one operation on the gap between them:

| Skill | Operation |
| --- | --- |
| Conclusion | find Claim |
| Flaw | name the gap |
| Necessary assumption | a statement N such that "not N" breaks the inference (the negation test) |
| Sufficient assumption or principle | a statement S such that Evidence + S guarantee Claim (bridge the terms that appear only in Claim) |
| Strengthen or weaken | a new fact that makes Claim more or less likely, premises kept true |
| Inference | what Evidence alone guarantees |

The gap is found by a "diff" along a fixed list of dimensions: direction (A→B vs B→A, cause vs effect); necessary vs sufficient; quantifier (some, most, all); unit and measure (rate vs count, per inspection vs per restaurant, bags vs weight); population (sample vs whole, part vs whole); time; strength (possible, likely, certain); relation (association vs cause); source vs content. Our content guidelines already make authors write exercises to these dimensions; this turns them into the student's checklist.

### 2. Three kits, each triggered by specific words

**A. Logic kit.** Triggers: if, only if, unless, whenever, every, all, no, none, only, requires, must, most, some, either/or, both/and.
- Translation: sufficient indicators (if, when, whenever, every, all, any) and necessary indicators (only if, only, requires, needs, must, depends on). "A unless B" = "if not B, then A". "No A is B" = "A → not B".
- Contrapositive; the two invalid moves (reversing the arrow; negating both sides); chaining.
- De Morgan where it pays: contraposing a compound condition ("(wrongdoing and no other way to learn) → publish" gives "not publish → (no wrongdoing or another way to learn)"), and negating a compound answer.
- Negation table for the negation test: all ↔ not all; some ↔ none; most ↔ half or fewer; always ↔ not always; A and B ↔ not A or not B; A or B ↔ neither. Consequence: an "and" assumption is necessary only if each part is; an "or" assumption is necessary if either part is.
- Quantifier moves: all + all → all; all + some → some; most + most (of the same group) → some overlap; some + some → nothing.
- Anti-rule: a causal claim is not an arrow. "X causes Y" goes to the cause kit, never to contrapositives.

**B. Quantity kit.** Triggers: percent, share, rate, average, per, each, total, any number.
- count = rate × base. Our clinic exercise: the no-show share fell from 15% to 9% while bookings rose "far"; the number missed rose if bookings grew by more than two-thirds (15/9 ≈ 1.67).
- Unit of analysis, with bounds. Our restaurant exercise: 1,000 restaurants, 4 inspections each, 1 inspection in 10 found a serious violation, so 400 failed inspections at between 100 and 400 restaurants (10% to 40%), not necessarily "about one in ten".
- Part vs whole: 40 components each updating in under 0.5 s alone says little about the screen with all 40 together; 200 spending decisions in a decade, each under 2% of annual revenue, can sum to as much as about 40% a year.
- Proxy vs target: bags handed out vs weight thrown away; camera sightings vs number of lynx; ratings from chats that stayed connected vs all customers.
- Percent vs percentage points; an average hides the spread.

**C. Cause kit.** Triggers: caused, led to, made, raised, responsible for, because, since then.
- An association between X and Y has four rival readings: Y causes X; something else drives both, or decides who gets X (selection); chance or a return from an extreme (regression to the mean); a measurement artifact.
- Mark which rivals the stimulus already closes (a comparison group, a prior trend, matched hours) and which stay open.
- Strengthen = close an open rival or show the mechanism. Weaken = make an open rival plausible, premises kept true.
- One-line support test: a fact strengthens if it would be more expected were the conclusion true than were it false; equally expected means irrelevant. (A likelihood ratio, never with numbers.)

### 3. Where the line is

- No full symbolization of stimuli; no truth tables, proof systems, predicate logic beyond the quantifier table, Venn diagrams beyond quantifier overlap, or numeric probability.
- A kit takes seconds on scratch paper; the written answer stays in English.
- Reading passages: structure map only.
- Logic games left the exam in August 2024, so heavy diagramming no longer has a section of its own; formal logic now lives inside argument questions.
- Scaffold, then fade: kits are explicit early and expected to run in the head in final-weeks mode.
- Rough fit to our own 28 exercises, by my count: about 5 turn on conditional form (a grant renewed "only if" attendance rose, a two-condition publish rule, a settlement that "could have grown large only if" it had water, a dated watermark, a prize's past-winner pattern), about 6 on quantity (above), about 11 on causes or samples, and the rest on structure or attacks on a source. So the logic kit alone fits roughly one exercise in six; the frame fits all of them.

### 4. Product shape (nothing is built until the owner picks a direction)

1. **Method content.** A short Method page (the frame and three kits, one screen each), and an author-written "form" line per task, shown with the reference after grading, for example "Rule: renew → attendance rose. The director infers rose → renew: the arrow is reversed." Needs exercise schema 4 and re-approval of edited exercises; could start with the batch still in draft.
2. **Form drills graded by the app itself, no chatbot.** 30 to 60 second typed items with the sentence letters given: translate a sentence into an arrow, write the contrapositive, negate a claim, say what follows from 2 to 4 rules (or that nothing does), compute a count or a bound. Logic items are checked by truth-table equivalence or entailment over at most 5 letters; quantity items by exact values. Used as an opt-in warm-up and as the first repair step after a miss tagged reversed-logic, a quantifier error or a quantity error, before the fresh-argument repair task. A first version could be stateless, leaving the frozen storage schema v1 untouched; tying drills into the repair loop needs storage v2.
3. **Measure** in the planned usefulness pilot: do reversed-logic and quantity misses recur less on fresh arguments, and what does it cost in minutes.

Unchanged: the grading prompt and score block, so the pending chatbot-grading check is not invalidated.

## Questions

1. Is the line drawn in the right place? For each kit, what would you add or cut, judged by what the exam's argument questions actually demand?
2. Is the frame sound and teachable to a beginner, or does it hide something that matters (for example questions about the role of a claim, parallel reasoning, or paradoxes)?
3. Check the formal content: the indicator lists, the negation table, the "and/or assumption" consequence, the quantifier moves, the support test, and the two worked numbers. Correct anything wrong or misleading.
4. App-graded form drills: worth building? Will skill on isolated drills transfer to arguments? Would English rewrites graded by the chatbot serve better, or should drills be skipped in favour of form lines alone? What is the smallest version worth shipping?
5. Does a method plus drills pull Premise away from "targeted repair for students past the basics" toward a beginner course, and does that matter?
6. Order: what comes first among this method, the next content batch, and the chatbot-grading check?
7. Taxonomy: which error tags are missing for this approach (for example a rate-versus-count or unit-of-analysis tag, or a negation tag)?
8. Verdict: adopt as proposed, adopt with changes (list them), or a different direction (describe it).

Reply in under 1,500 words. Number your answers to match. Where you disagree, say what you would do instead and why. Give the reason behind each claim about the exam, and say when something is your estimate.

## Round 1 reviewer response

### 1. Where to draw the line

**Keep selective formalization, but trigger it by meaning—not words.** “Because” can introduce evidence rather than causation; “must” can express obligation rather than a conditional. LSAC describes ordinary-language argument analysis and explicitly disclaims specialized logical terminology. That supports optional notation, not universal translation. [Law School Admission Council](https://www.lsac.org/lsat/taking-lsat/test-format/logical-reasoning)

**Logic:** keep direction, negation, chaining, and small counterexamples. Preserve modality and dates: “could,” “should,” and “previous winners” cannot silently become “does,” “will,” and “all future winners.” A counterexample defeats a guarantee, not necessarily a probability claim.

**Quantity:** keep it; add weighted averages and an explicit denominator/unit/time check. Prefer easy counterexamples over exact arithmetic unless the threshold decides the task.

**Cause:** broaden to an **evidence kit**, covering sampling and measurement without causal conclusions. Alternatives can coexist with genuine causal contributions. Replace “closes” with “rules out or reduces”; comparison groups do not automatically eliminate confounding. Generic causation does not establish necessity, sufficiency, or sole causation.

The August 2024 removal is correct, but does not establish which techniques now pay. Your corpus proportions are not exam-frequency estimates. [Law School Admission Council](https://www.lsac.org/blog/what-to-expect-starting-with-august-2024-lsat?utm_source=chatgpt.com)

Allow local kit use in reading passages: structure alone misses inference, application, and evidence questions explicitly listed by LSAC. [Law School Admission Council](https://www.lsac.org/lsat/prepare/types-lsat-questions/reading-comprehension)

### 2. The frame

Replace `Evidence ⊢ Claim` with **“Evidence / Claim / Claimed connection”**: the turnstile already asserts derivability. Begin with the task; do not presume every stimulus is flawed—or even an argument.

Your comparison is a strong default for evaluation, not an established “one move above all.” Role questions ask function; parallel reasoning asks matching structure; paradoxes ask how accepted facts coexist; disagreement asks where commitments conflict. LSAC includes these broader reasoning skills. [Law School Admission Council](https://www.lsac.org/lsat/taking-lsat/test-format/logical-reasoning)

Necessary assumptions sustain the offered reasoning; their negation need not make the conclusion false. Merely removing something helpful is insufficient. Sufficient assumptions must guarantee the conclusion with consistent premises; bridging unmatched terms is only a heuristic. “Principle” is not synonymous with sufficient assumption.

Separate **guaranteed inference** from **best-supported inference**. Make the long “diff” list an optional diagnostic menu, not a compulsory scan. Unchanged vocabulary can still conceal circular reasoning.

### 3. Formal corrections

**Indicators.** Teach sentence patterns, not a word dictionary: “If A, B” and “A only if B” mean `A → B`; “Only A are B” means `B → A`. Your “unless” and “no A is B” translations are correct under their strict logical readings. Unless does not establish exclusivity. Disambiguate inclusive/exclusive “or”; preserve the scope of “only,” “must,” and quantifiers.

**Negation.** Your pairs are correct as *negation pairs*, not equivalences, with a fixed reference group/time and “most” meaning more than half. “Some” means at least one, possibly all; “all” alone does not assert existence. Add `¬(A → B) = A ∧ ¬B`; for a universal rule, its negation says at least one A is not B. Your compound contrapositive is correct. “Not necessary” does not mean “necessarily not.”

**And/or assumptions.** Your stated one-way implications are correct. A conjunction is necessary exactly when both components are necessary. A necessary disjunction need not have either component individually necessary: an argument may require at least one functioning power source without requiring a particular one.

**Quantifiers.** Specify shapes. “All A are B; all B are C” yields “all A are C.” “All A are B; some A are C” yields “some B are C.” But “all A are B; some B are C” does **not** guarantee A/C overlap. Same-base most/most overlap is correct. Some/some does not guarantee a new overlap—not literally “nothing follows.”

**Support test.** As a probabilistic definition, for an uncertain conclusion C and possible new fact F, strengthening corresponds to `P(F | C,E) > P(F | ¬C,E)`. E includes accepted evidence/background. Equality means neutral *about C*, not universally irrelevant. This identity does not supply the probabilities. I would initially reserve it for author notes; also distinguish directional from material support.

**Numbers.** Missed appointments increase iff `new bookings / old bookings > 15/9 = 5/3`: growth above 66⅔%; equality leaves misses unchanged. “Far” alone does not settle that threshold.

Restaurant arithmetic is correct: 4,000 inspections, 400 failures, **100–400 restaurants with detected failures**. Those bounds do not measure undetected violations.

The spending example is possible, not a general bound: with constant annual revenue and distinct one-off costs, 200 decisions each below 2% total below 400% of one year’s revenue across the decade—below 40% as an annual average, not a bound on each year. The component example is sound: standalone times do not establish combined performance.

### 4. Drills

**Form lines first; a small drill experiment second.** Transfer is unproven here: supplied letters remove decisions contextual argument work requires—what to represent, how, and whether representation helps. Premise’s spec appropriately treats exam transfer as a hypothesis.

My proposed minimum—not an evidence-based optimal dose—is **12–18 stateless items** covering conditional direction/negation and rate/base distinctions. Pair contrasting English sentences, give immediate explanations or counterexamples, then test the distinction on a delayed, unseen argument without announcing the kit.

Use deterministic grading for unambiguous formal answers; retain English application in the existing chatbot/self-grading loop. Another chatbot exchange for each micro-operation adds friction. Never require notation for credit on an English argument task.

Restrict truth tables to propositional items: five letters do not handle “some” or “most.” Ask about a specified target; accepting arbitrary entailed answers admits tautologies. Distinguish contradicted from undetermined. Accept equivalent numerical forms and correct bounds.

Compare **form lines plus drills versus form lines alone at equal time**, measuring delayed fresh-argument error rates and total minutes—not drill accuracy. Keep learning holdouts separate from grading holdouts. Owner-reviewed exercises are not unseen tests for the owner.

Fade scaffolding when fresh performance permits, not automatically when final-weeks mode begins.

### 5. Positioning

An optional, miss-triggered refresher supports targeted repair. A mandatory basics sequence, routine warm-ups, or completion-based “mastery” would shift toward a course.

The beginner owner and intended post-basics user are different populations already acknowledged in the spec. Serve the owner with brief orientation; do not treat their progress alone as validation for the target audience.

### 6. Order

Agree on the corrected method now; audit affected keys; **finish the chatbot-grading check next**. Then publish a small reviewed batch with form lines and fresh repair counterparts. Build the drill experiment afterward.

This follows the roadmap’s important dependency: valid keys before grading feasibility, and reliable grading before interpreting usefulness results.

An unchanged score block preserves parsing, **not grading validity**. Changes to references, rubrics, or supplied taxonomy can change model judgments despite an unchanged prompt template. Freeze actual grading payloads; recheck affected changes. Pure post-grading display additions need not invalidate the check.

A form-line trial can use existing reference prose rather than requiring a dedicated field immediately—but that changes grading inputs when references enter the prompt.

### 7. Taxonomy

Add `negation-error`, `quantifier-error`, `rate-vs-count`, and `unit-of-analysis`, each with observable answer criteria and a distinct repair. Consider `proxy-target-confusion` only if existing `scope-shift` proves too coarse.

Retain existing tags where they suffice; do not infer an invisible negation mistake merely from a wrong answer. The current taxonomy explicitly treats tags as navigation aids, not measurements. Validate tag assignment as well as scores before using tags to route drills.

### 8. Verdict

**Adopt with changes:** task-aware framing, meaning-based triggers, corrected formal rules, a broader evidence kit, and form lines before drills. The direction is **systematic reading with selective formal checks**, not a symbolic algorithm for every question.

## Round 2 packet

Thank you. I accept your corrections. Here is the reconciled direction. Please confirm we are aligned, or name each remaining disagreement and what you would do instead, in under 400 words.

**Direction: systematic reading with selective formal checks.**

1. Read the task first. For evaluation tasks (flaw, assumption, strengthen, weaken, principle, inference), map Evidence / Claim / Claimed connection, without presuming a flaw. Role, parallel reasoning, paradox and disagreement tasks get their own operation (function, matching structure, how accepted facts coexist, where commitments conflict). Inference splits into guaranteed and best supported. The list of dimensions is an optional diagnostic menu, not a compulsory scan.
2. Three kits, switched on by meaning, with words only as cues:
   - **Logic:** sentence patterns rather than a word list ("If A, B" and "A only if B" mean A → B; "Only A are B" means B → A; "A unless B" means not B → A, without exclusivity); contrapositive, the two invalid moves, chaining, De Morgan for compound conditions; negation pairs (not equivalences) with a fixed group and time, plus not(A → B) = A and not B; quantifier inferences stated as exact shapes; inclusive versus exclusive "or"; modality, dates and scope preserved; a counterexample defeats a guarantee, not a probability claim.
   - **Quantity:** count = rate × base; an explicit denominator, unit and time check; weighted averages; bounds; an easy counterexample before exact arithmetic unless a threshold decides the task.
   - **Evidence** (replacing "cause"): causal claims, samples and measurement; rival explanations are ruled out or reduced, not closed; a rival can coexist with a real causal contribution; a cause is not thereby necessary, sufficient or the sole cause.
   Kits may be used locally in reading passages.
3. The support test stays in author notes for now.
4. Product: a short Method page as orientation; author-written form lines shown after grading; a stateless experiment of 12 to 18 drill items (contrasting sentence pairs, immediate explanations, deterministic grading only for unambiguous formal answers, specified targets, contradicted versus undetermined), compared with form lines alone at equal time on delayed fresh arguments. Notation is never required for credit. Drills stay optional and miss-triggered, with no mandatory basics, and scaffolding fades on fresh performance, not on mode.
5. Taxonomy: add negation-error, quantifier-error, rate-vs-count and unit-of-analysis, each with observable criteria and a distinct repair, and validate tag assignment before tags route drills.

Corrected on my side: the spending example now reads "below 40% of a year's revenue as an annual average, not a bound on each year".

**One point where I would order things slightly differently.** You put the grading check before the next batch with form lines. That batch (10 exercises) is still a draft waiting for its key check, so I would:

a. Now: write the Method as a document, and audit the existing keys against the corrected rules.
b. Now: add an optional, display-only `form` field (exercise schema 4) that the grading prompt builder never reads, and write form lines into the draft batch before its key check, so the owner approves that batch once.
c. Next: the grading check, on frozen payloads that contain no form lines and use the current taxonomy.
d. After: the four tags (they enter the grading prompt as allowed tags, so they wait for the check or get rechecked), then the drill experiment.

The approval hash covers every exercise field, so adding form lines to the 20 published exercises means re-approving them; I would do that in one batch after the grading check, not now. Do you accept this order, given that form lines never enter a grading payload?

## Round 2 reviewer response

**Yes. I accept the direction and your revised order.** Adding form lines to the draft batch before its key check avoids duplicate approval, provided that check reviews the form lines as well as the keys. Re-approving published exercises together afterward is reasonable.

Four qualifications remain:

**1. Inference and principle need task-specific routing.** An inference stimulus may contain facts without an asserted conclusion or claimed connection. Map **evidence → candidate inference**, rather than inventing an argument to evaluate. Likewise, applying or matching a principle is not necessarily gap-bridging; reserve the sufficient-assumption operation for tasks explicitly asking what would justify the conclusion.

**2. The spending correction still needs its assumptions.** Keep “constant annual revenue” and “distinct, one-off costs” alongside the annual-average statement. Without those conditions, the stated 40% bound does not follow. A simpler example with an explicitly fixed revenue denominator would be preferable for beginners.

**3. Make display-only separation a tested boundary.** Test that adding or editing `form` cannot insert instructional content into the grading prompt, alter grading criteria, or reveal feedback before the exercise’s selected tasks are submitted. Freeze the actual payloads used in the check, including whatever identifiers or metadata the builder emits—not merely the prompt template. Any resulting schema or hash changes must remain compatible with existing saved requests. These are implementation conditions, not reasons to reverse your order.

**4. Waiting to add tags does not remove the recheck requirement.** The initial grading check validates the **current taxonomy**. Adding allowed tags afterward changes the model’s input even though form lines remain excluded. Recheck scores and tag assignments on the revised frozen payload, including regression cases for existing distinctions, before enabling tag-based drill routing. The original check remains a useful baseline, not validation of the new configuration.

One wording clarification: “notation is never required for credit” should govern ordinary argument tasks. Optional formal drills may explicitly request notation, without their results becoming evidence that an argument skill is repaired.

With those qualifications, **a/b now, c next, and d afterward is the agreed direction**.

## Triage

Every point was accepted. Where each landed:

| Point | Outcome |
| --- | --- |
| R1 §1: trigger kits by meaning, not words | Accepted: `METHOD.md` §3 opening. |
| R1 §1: keep direction, negation, chaining, counterexamples; preserve modality and dates; counterexamples defeat only guarantees | Accepted: §3.1. |
| R1 §1: quantity kit adds weighted averages and a denominator, unit and time check; counterexample before arithmetic | Accepted: §3.2. |
| R1 §1: broaden "cause" to an evidence kit; "rules out or reduces", not "closes"; causation is not necessity, sufficiency or sole cause | Accepted: §3.3. |
| R1 §1: corpus proportions are not exam frequencies | Accepted: no frequency claim in `METHOD.md`. |
| R1 §1: kits allowed inside reading passages | Accepted: §4. |
| R1 §2: "Evidence / Claim / Claimed connection"; start from the task; no presumed flaw; role, parallel, paradox and disagreement get their own move | Accepted: §2. |
| R1 §2: necessary-assumption negation breaks the reasoning, not the conclusion; bridging is a heuristic; principle is not sufficient assumption; guaranteed versus best-supported inference; the diff list is an optional menu; circularity | Accepted: §2. |
| R1 §3: sentence patterns; "only A are B"; "unless" without exclusivity; inclusive or exclusive "or" | Accepted: §3.1. |
| R1 §3: negation pairs, not equivalences; "some" and "all"; not(A → B); "not necessary" | Accepted: §3.1 table and notes. |
| R1 §3: a necessary disjunction need not have a necessary disjunct | Accepted: §3.1. |
| R1 §3: quantifier shapes, including the invalid all/some shape and some/some | Accepted: §3.1. |
| R1 §3: support test reserved for author notes; directional versus material | Accepted: §5. |
| R1 §3: clinic threshold 5/3; restaurant bounds measure detected failures; spending example is an average, not a bound | Accepted: §3.2 states the clinic threshold and "a violation found"; the spending example is dropped. |
| R1 §4: form lines first; a stateless trial of 12 to 18 drills; deterministic grading only for unambiguous formal answers; specified targets; contradicted versus undetermined; compare with form lines alone at equal time on delayed fresh arguments; fade on performance | Accepted: §4 and §5. |
| R1 §5: optional, miss-triggered; no mandatory basics; the owner's progress does not validate the target audience | Accepted: §4. |
| R1 §6: order; unchanged score block preserves parsing, not grading validity; freeze actual payloads | Accepted with one reordering proposed in round 2 (form lines into the draft batch before its key check), which Pro accepted. |
| R1 §7: four tags with observable criteria and distinct repairs; validate tag assignment before routing | Accepted: §5, after the grading check. |
| R2 1: inference and principle need task-specific routing | Accepted: §2 table. |
| R2 2: the spending example needs its assumptions | Accepted: the example is dropped. |
| R2 3: display-only separation is a tested boundary; freeze actual payloads; compatibility with saved requests | Accepted: conditions on the schema 4 change (`METHOD.md` §5). |
| R2 4: adding tags needs a grading recheck | Accepted: §5. |
| R2: notation rule governs ordinary tasks; drills may ask for notation | Accepted: §4. |
