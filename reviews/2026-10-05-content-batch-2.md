# Peer review: answer keys for content batch 2 (arg-0019 to arg-0028)

## 1. Role and ask

You are the same senior reviewer who checked content batch 1 (arg-0009 to arg-0018). You marked all ten of those "fix", every finding was accepted but one, and the owner then approved and published them. This is the same answer-key check for ten new draft exercises (20 tasks: 6 weaken, 6 assumption, 4 strengthen, 3 flaw, 1 conclusion). Students will be graded against these keys by a chatbot, so a wrong key teaches the wrong lesson. Please be adversarial: try to break each key.

The owner is an exam beginner and will approve the batch after your check, so your review is the expert check.

## 2. What changed since batch 1

These drafts were written to the patterns you asked for at the end of your batch 1 review. Please check that they actually hold, not just that they are claimed:

- **Negation gate.** Every assumption reference and full-credit anchor was negated with the premises kept, and its note names the link that disappears. "Too strong" near misses earn 1; premises and restated conclusions earn 0.
- **Stipulated exclusions.** Where a key treats an alternative as unavailable, the stimulus states the excluding fact (for example arg-0020: no one took classes outside the app; arg-0023: every camera worked reliably in both years; arg-0022: the move itself caused Pell's rise). Partial controls (arg-0019's matching earlier trend) are not treated as conclusive.
- **Criterion-by-criterion anchors.** Each 1-point flaw anchor identifies the inference without explaining it; bare labels earn 0. Each 1-point strengthen or weaken anchor gives the right kind of fact without the explanation.
- **Three standards kept apart.** A strengthener need not prove the conclusion, a weakener need not refute it, and a necessary assumption must pass negation.
- **Exact numbers and modest labels.** Arithmetic is spelled out in the difficulty notes (arg-0023, arg-0025, arg-0026, arg-0027), and signposted mismatches are labelled 2.
- **Constrained prompts.** Two weaken tasks restrict the kind of fact (arg-0020: the users' Spanish when they began; arg-0022: facts about Ardley).

Before this packet, a separate Claude check graded every anchor and negation. It found no blockers, two major problems (arg-0020's stimulus did not fix total practice time, and arg-0021's key marked down a correct "the council could want more" answer) and fifteen minor ones; all were fixed in the files below. Please do not assume that check was complete.

## 3. What to check, for every task

1. **Correct key.** Is the reference a correct, strong answer? For flaw tasks, is it the argument's main error (and is there only one)? For conclusion tasks, is it the main conclusion, and is the rival the note names really a rival?
2. **Necessary-assumption test (assumption tasks).** Negate the reference and each full-credit anchor, keep every premise, and say whether the specific inference fails (not merely becomes weaker). Flag anything too strong, or anything that restates a premise or the conclusion.
3. **Strengthen and weaken.** Is each reference and full-credit anchor consistent with every premise, new, and material? Does `accept` wrongly exclude a correct kind of answer, or let a wrong one in? Where the prompt constrains the kind of fact, does the key respect the constraint?
4. **Anchors and rubric agree.** Grade every anchor against the rubric and say if you would give a different score than stated.
5. **Difficulty.** Is the label (1 easiest to 5) realistic compared with real exam arguments of the same type, and is the difficulty note right about what makes it hard?
6. **Stimulus.** Any ambiguity, outside knowledge needed, or a second reasoning problem that would let a different answer be correct?

## 4. Response format

For each exercise, give a one-line verdict (keep / fix / drop). Then list every task with a problem as: task id, the problem, and the exact replacement text you propose. Say nothing about tasks you would keep unchanged. End with any pattern you see across the batch that the author should change in later batches.

## 5. Rules the keys were written to (from CONTENT_GUIDELINES.md)

### 3.1 Writing to a difficulty target

Difficulty comes from precise logical discrimination, not from hiding the conclusion, adding clauses or an unforgiving rubric. Difficulty labels are author-predicted until students have attempted the task. For a task meant to be medium or hard, the author writes a short `difficulty_note` and meets the rules that apply:

- **Structure map.** Write down the main conclusion, intermediate conclusions, premises, concessions and opposing views. A hard conclusion task has at least one plausible rival (usually an intermediate conclusion or an attributed opposing view) and the note says which way support runs. Moving the recommendation to the middle is not enough.
- **Scope.** Mark the population, time period, measured quantity and claim strength in evidence and conclusion. A scope task turns on a specific mismatch, not "the groups might differ".
- **Quantifiers.** Name the boundary that matters (some, most, all, a proportion, a threshold) and check the reference against a counterexample to the tempting stronger answer.
- **Conditionals.** Translate the relationship into its direction. Match the key to the conclusion's actual strength: failing to guarantee an outcome does not refute a claim that it is likely.
- **Causes.** Rule out one plausible alternative in the stimulus and leave a consequential one open, so "correlation isn't causation" alone does not earn full credit.
- **Competing claims.** Every distracting claim has a clear role (someone else's view, a concession, background, an intermediate conclusion). Ambiguous attribution is an editing problem, not difficulty.
- **Two demands, no padding.** A hard task combines two interacting demands (for example an intermediate conclusion and a quantifier) and drops complications that serve neither. No outside knowledge.
- **Near misses.** Write at least two plausible near-miss answers and say exactly why each fails (too strong, wrong population, helpful but not required, denies a premise). Use them as anchors or in notes.
- **Strengthen and weaken.** For advanced tasks, constrain the kind of fact asked for (for example about the comparison group or the measurement) and accept every fact that satisfies the constraint.

### 3.2 The necessary-assumption check

For every assumption task, negate the reference and each full-credit anchor, keep the premises, and confirm that the specific inference fails, not merely that the conclusion becomes less likely. The assumption must not restate the conclusion or a premise, and must not be stronger than the argument needs. Not every flaw argument supports a clean assumption task; when it doesn't, leave the task out.

### 5. References, acceptance notes, anchors and rubrics

- **Reference:** what a strong student would write in a minute or two. For open-ended skills it is one example among many.
- **Counts as correct (`accept`):** the logical properties every correct answer shares, not a list of paraphrases. Required for open-ended skills.
- **Rubric:** 1–4 criteria, each worth exactly one point, each observable in the answer ("names the switch and the fall in scores"), never vague ("shows understanding"). A criterion may only require what the task prompt asks for. If full credit needs something, such as leaving out the reasons, the prompt says so.
- **Alternatives:** where a rubric credits an alternative explanation, it must be offered as a possibility, not invented evidence asserted as fact.
- **Disqualifiers:** only for misunderstandings severe enough that partial credit would mislead, e.g. stating the opposite conclusion.
- **Anchors:** one sample answer for every possible score, including at least one full-credit answer unlike the reference for open-ended skills. Reference, `accept`, rubric and anchors must agree: grade each anchor against the rubric and check you get its stated score.
- **Likely errors:** the 2–4 tags a grader is most likely to need.

Scoring: conclusion tasks are worth 1 point with one criterion; all other tasks are worth 2 points, one per rubric criterion, with anchors at 0, 1 and 2. A disqualifier caps the score at 0.

## 6. The ten exercises

### File: content/exercises/arg-0019.md

````yaml
---
schema: 3
id: arg-0019
status: draft
kind: argument
difficulty: 3
topics: [agriculture, science]
source:
  type: original
  title: null
  creator: null
  year: null
  locator: null
  license_uri: null
  attribution: null
  rights_basis: null
  modifications: null
contributors: []
ai_assistance:
  used: true
  notes: Stimulus, tasks, references, anchors and rubric drafted by Claude; awaiting human review and edits.
approved_by: null
approved_at: null
approved_revision: null
tasks:
  - key: assumption
    status: active
    skill: assumption
    difficulty: 3
    difficulty_note: >-
      Causes with a partial control: yields on the two groups of farms rising at the same rate before the
      change counts against a lasting difference between them, but it does not rule out a change the adopting
      farms made at the same time as the cover crops, such as a new seed or taking poor fields out of corn. The
      assumption must deny that such a change accounts for all of the extra rise, not that the farms changed
      nothing else.
    prompt: >-
      State an assumption the argument needs: a claim that, if false, would make the argument fall apart.
      (A necessary assumption; it need not make the argument airtight.)
    max: 2
    reference: >-
      The farms that planted cover crops did not, over the same five years, make some other change, such as
      switching to a higher-yielding seed, that by itself accounts for all of their extra rise in yields.
    accept: >-
      The inference under test is from "yields rose 12 percent on the farms that adopted cover crops and 3
      percent on the others, after rising at the same rate before" to "planting cover crops raised yields on
      the adopting farms". Any unstated claim counts whose denial, with every premise kept, would leave the
      adopters' extra rise fully explained by something other than the cover crops, so that it no longer
      supports the conclusion. Main bridges: (a) nothing else that changed for the adopting farms at about the
      same time, whether something they did (a new seed, more fertilizer, new irrigation) or something that
      happened to them (better rain in their part of the county), by itself accounts for all of the extra
      rise; (b) the extra rise in average yield does not come entirely from how the average is made up, for
      example from the adopters no longer planting corn on their poorest fields; (c) nothing that happened
      only to the other farms, such as a pest confined to their fields, by itself accounts for the whole gap.
      The claim must not be stronger than the argument needs: requiring that the adopting farms changed
      nothing else at all, or that nothing at all affected the other farms that did not also affect the
      adopting farms, earns 1. Repeating that yields on the two groups had risen at the same rate before, or
      saying that cover crops raised yields (on these farms or on every farm), earns 0.
    disqualifiers:
      - Gives a claim the argument already states, such as that yields on the two groups of farms had risen at about the same rate before the change, or merely says that the cover crops raised yields.
    rubric:
      - States a claim the argument does not state that links the adopting farms' extra rise in yields to the cover crops (for example, that no other change on those farms, or setback on the other farms, accounts for it), not a premise or a version of the conclusion.
      - States it no more strongly than the argument needs, so that if it were false the adopting farms' extra rise would be fully explained by something other than the cover crops, rather than requiring that those farms changed nothing else at all or that nothing at all affected only one group.
    anchors:
      - points: 2
        answer: >-
          The farms with cover crops didn't get their higher average yields simply by no longer planting corn on
          their worst fields.
        note: >-
          a different bridge from the reference (how the average is made up); if it were false, the extra rise
          would come from dropping poor fields, not from the cover crops
      - points: 1
        answer: The farms that planted cover crops made no other changes to how they farmed during those five years.
        note: >-
          near miss, too strong: the farms could have made small changes that do not account for the extra rise,
          and the argument would still stand
      - points: 0
        answer: Before the change, yields on the two groups of farms had been rising at about the same rate.
        note: a stated premise, not an assumption (disqualifier)
    likely_errors: [overstated, missed-alternative, restates-conclusion, wrong-gap]
  - key: strengthen
    status: active
    skill: strengthen
    difficulty: 2
    difficulty_note: >-
      Causes: the matching rise before the change already counts against a lasting difference between the two
      groups of farms, so repeating it is not new. A full-credit fact ties the extra rise to the cover crops
      themselves or removes a rival the stimulus leaves open, such as a change the adopting farms made at the
      same time. Facts that affect both groups alike, such as good weather across the county, add little.
    prompt: >-
      Give a new fact that, if true, would materially strengthen the argument, and explain how. Treat the
      stated premises as true.
    max: 2
    reference: >-
      On farms that planted cover crops on only some of their fields, yields rose more on the fields with cover
      crops than on the same farms' other fields. Those fields share the farmer, the seed and the equipment, so
      the comparison rules out changes across the whole farm and points to the cover crops.
    accept: >-
      Any new fact, consistent with the premises and not already stated in them, that makes it more likely
      that the cover crops themselves raised yields on the adopting farms, with an explanation of how. Main
      kinds: comparisons that hold other things fixed (fields with and without cover crops on the same farm);
      evidence that the adopting farms made no other change that could explain the extra rise (the same seed,
      fertilizer and irrigation as before, corn still grown on the same fields); a way the cover crops could
      raise yields that was seen on those fields (more moisture or nitrogen in the soil in spring). A fact that
      the county as a whole had good weather does little, since the comparison with the other farms already
      accounts for it; a fact that rainfall or other conditions were the same on the adopting farms as on the
      others rules out a local difference and counts. A relevant new fact whose bearing is not explained earns
      1.
    rubric:
      - Gives a new fact, consistent with the stated premises and not already stated in them, that bears on whether the cover crops raised yields on the adopting farms.
      - Explains how the fact strengthens the argument, namely why it makes the cover crops more likely to be the cause of the extra rise (for example, by holding other things fixed, by ruling out another change on the adopting farms, or by showing how the cover crops raised yields).
    anchors:
      - points: 2
        answer: >-
          The farms that started cover crops kept the same seed, fertilizer and irrigation as before, and they
          grew corn on the same fields. That rules out the obvious other reasons their yields might have jumped,
          so the cover crops are the likelier cause.
        note: a different strengthener from the reference (ruling out other changes on the adopting farms)
      - points: 1
        answer: >-
          On farms that put cover crops on only some fields, yields rose more on those fields than on the farms'
          other fields.
        note: the right kind of fact, but the answer does not explain how it supports the argument
      - points: 0
        answer: Since the change, yields on the farms with cover crops have risen by 12 percent, against 3 percent on the others.
        note: already stated in the stimulus, so not a new fact
    likely_errors: [no-reasoning, irrelevant, missed-alternative, understated]
---
Five years ago, about half of the corn farms in Dunlow County began planting cover crops, such as rye and
clover, on their fields each winter. Over the five years before that, average corn yields on the farms that
later adopted cover crops and on the county's other corn farms had risen at about the same rate. Since the
change, average yields on the adopting farms have risen by 12 percent, while on the other farms they have
risen by only 3 percent. A county agricultural adviser concludes that planting cover crops raised corn
yields on the farms that adopted them.
````

### File: content/exercises/arg-0020.md

````yaml
---
schema: 3
id: arg-0020
status: draft
kind: argument
difficulty: 3
topics: [education, technology]
source:
  type: original
  title: null
  creator: null
  year: null
  locator: null
  license_uri: null
  attribution: null
  rights_basis: null
  modifications: null
contributors: []
ai_assistance:
  used: true
  notes: Stimulus, tasks, references, anchors and rubric drafted by Claude; awaiting human review and edits.
approved_by: null
approved_at: null
approved_revision: null
tasks:
  - key: flaw
    status: active
    skill: flaw
    difficulty: 2
    difficulty_note: >-
      Causes: the stimulus rules out lessons outside the app and makes the two groups' time on the app and
      total practice time about equal, so full credit needs an alternative that is still open, such as the
      streak holders already speaking better when they started, or better speakers being the ones who keep
      long streaks.
    prompt: Describe the main reasoning error in one or two sentences.
    max: 2
    reference: >-
      The advertisement infers from the streak holders' higher scores that keeping a streak makes learners
      better speakers, without ruling out that the two groups differed in other ways; for example, users who
      already spoke Spanish better when they started may have found it easier to keep a long streak.
    accept: >-
      Any answer that identifies the move from "users with 100-day streaks scored far higher on the speaking
      test than users who never practiced more than seven days in a row" to "keeping up a streak makes
      learners far better speakers", and says why that does not follow by naming a possible explanation the
      argument leaves open: the streak holders may have spoken better from the start; being a better speaker
      may make a long streak easier or more rewarding to keep; or something else may lead some users both to
      keep streaks and to speak better (for example, a Spanish-speaking partner, or time spent where Spanish
      is spoken). Any open alternative, offered as a possibility, earns the point. Lessons or classes outside
      the app do not, since the stimulus rules them out, and neither does a difference in how long the groups
      had used the app or how much time in total they had spent practicing, both of which the stimulus fixes.
      A bare label such as "correlation is not causation", not applied to the streaks and the scores, earns 0.
    rubric:
      - Ties the error to this argument, naming the streak holders' higher scores on the speaking test and the conclusion that keeping a streak makes learners far better speakers.
      - Says why the inference fails by naming a possible explanation of the higher scores that the argument does not rule out (for example, that the streak holders already spoke better when they started, or that better speakers find a streak easier to keep), not one the stimulus rules out.
    anchors:
      - points: 2
        answer: >-
          Maybe the people who kept 100-day streaks already knew some Spanish when they started, so practicing
          felt easy and they stuck with it. Their higher test scores don't show the streak made them better;
          being better may have kept them going.
      - points: 1
        answer: >-
          The ad assumes that because the users with long streaks scored higher, the streaks are what made them
          better speakers.
        note: describes the inference but names no other possible explanation, so it does not say why it fails
      - points: 0
        answer: The streak holders were probably also taking Spanish classes, which would explain their scores.
        note: >-
          near miss: an alternative the stimulus rules out (no one in either group was taking classes or
          lessons outside the app), and it does not describe the inference
    likely_errors: [correlation-causation, missed-alternative, contradicts-premise, understated]
  - key: weaken
    status: active
    skill: weaken
    difficulty: 3
    difficulty_note: >-
      Causes, with the kind of fact constrained to the users' Spanish when they began: the stimulus already
      rules out outside lessons, so the open question is whether the gap in scores was there before the
      streaks or helped produce them. A fact about some other difference between the groups, such as time
      spent in a Spanish-speaking country, does not answer the task as asked.
    prompt: >-
      Give a new fact about how well the users in the two groups spoke Spanish when they began using Lingora
      that, if true, would materially weaken the argument, and explain how. Treat the stated premises as true.
    max: 2
    reference: >-
      When they first signed up, the users who went on to keep 100-day streaks already spoke Spanish much
      better than the other group did. The gap in last month's test scores may then simply reflect where the
      two groups started, not anything the streaks did.
    accept: >-
      Any new fact about how well the users spoke Spanish when they began using Lingora, consistent with every
      premise, that gives a real reason to doubt that the streaks account for the gap in scores, plus an
      explanation of how. Main kinds: the streak holders already spoke better at the start, so the gap may
      have been there before any streak; the gap at the start was as large as it is now, so the streaks added
      little or nothing to it; users who began with more Spanish were the ones who went on to keep long
      streaks, so speaking better may have led to the streaks rather than the reverse. A qualifying fact whose
      effect is not explained earns 1. A fact about some other difference between the groups (time abroad, a
      Spanish-speaking family) earns 0 because it does not answer the task as asked, and so does a fact that
      denies a premise, such as some users taking classes outside the app.
    disqualifiers:
      - Denies a stated premise, for example that no one in either group was taking Spanish classes or lessons outside the app.
    rubric:
      - Gives a new fact about how well the users in the two groups spoke Spanish when they began using Lingora, consistent with the stated premises, that bears on whether the streaks account for the gap in test scores.
      - Explains how that fact weakens the argument, namely why it makes it more plausible that the gap reflects how well the users spoke from the start, not what the streaks did.
    anchors:
      - points: 2
        answer: >-
          Lingora tests every user's speaking at sign-up, and on that test the streak holders were already
          ahead of the other group by as much as on last month's test. So the gap was there before any streak,
          and the streaks didn't widen it.
        note: >-
          a different weakener from the reference (a sign-up gap as large as last month's, so the streaks added
          nothing to it)
      - points: 1
        answer: The streak holders already spoke more Spanish than the other users when they started on the app.
        note: the right fact, but the answer does not explain how it undercuts the conclusion
      - points: 0
        answer: Many of the streak holders spent a month in Spain during the year.
        note: >-
          near miss: it would weaken an unconstrained version of the argument, but it is about time abroad, not
          about how well the users spoke Spanish when they began, so it does not answer the task as asked
    likely_errors: [missed-alternative, no-reasoning, contradicts-premise, irrelevant]
---
Lingora, a language-learning app, compared two groups of its users who had all been learning Spanish on the
app for about a year: those who had kept up a practice streak of at least 100 days in a row, and those who
had never practiced more than seven days in a row. The two groups had spent about the same total number of
hours practicing on the app, and none of the users in either group was taking Spanish classes or lessons
outside the app. On a speaking test given through the app last month, the streak holders scored far higher
on average. Lingora's new advertisement therefore claims that keeping up a 100-day streak makes learners
far better speakers.
````

### File: content/exercises/arg-0021.md

````yaml
---
schema: 3
id: arg-0021
status: draft
kind: argument
difficulty: 3
topics: [arts, public funding]
source:
  type: original
  title: null
  creator: null
  year: null
  locator: null
  license_uri: null
  attribution: null
  rights_basis: null
  modifications: null
contributors: []
ai_assistance:
  used: true
  notes: Stimulus, tasks, references, anchors and rubric drafted by Claude; awaiting human review and edits.
approved_by: null
approved_at: null
approved_revision: null
tasks:
  - key: flaw
    status: active
    skill: flaw
    difficulty: 2
    difficulty_note: >-
      Conditionals: the policy makes a rise in attendance necessary for renewal, and the director treats it as
      enough. The size of the rise, and its being the largest in the city, play no part in the policy.
    prompt: Describe the main reasoning error in one or two sentences.
    max: 2
    reference: >-
      The director treats a rise in attendance, which the policy requires for renewal, as if it guaranteed
      renewal; the policy says only that without a rise there is no renewal, so the council could still refuse
      the grant for some other reason.
    accept: >-
      Any answer that identifies the move from "the council renews a grant only if attendance rose, and the
      museum's attendance rose" to "the council will renew the museum's grant", and says why that does not
      follow: the policy makes a rise necessary, not sufficient, so meeting it leaves the council free to
      refuse the grant for some other reason. "Necessary but not sufficient" wording earns the point when the
      answer applies it to the attendance requirement and the renewal; a bare label that is not applied earns
      0. Answers claiming the policy itself demands a larger rise or a top ranking misread it; an answer that
      the council could still refuse despite the rise, for example because it also wants a larger rise,
      applies the necessary-not-sufficient point and earns it.
    rubric:
      - Ties the error to this argument, naming the inference from the museum's rise in attendance, which the policy requires for renewal, to the conclusion that its grant will be renewed.
      - Says why the inference fails, namely that the policy makes a rise in attendance necessary for renewal but not enough to guarantee it, so the council could still refuse the grant for another reason.
    anchors:
      - points: 2
        answer: >-
          Under the policy, a museum whose attendance didn't rise can't get its grant, but that doesn't mean
          every museum whose attendance did rise will. The director takes a requirement for renewal as a promise
          of it, and the council could still say no for other reasons.
      - points: 1
        answer: The director concludes the grant will be renewed because the museum's attendance went up.
        note: identifies the inference but does not say why the rise falls short of guaranteeing renewal
      - points: 0
        answer: Attendance might fall this year, so the director can't be sure it will keep rising.
        note: >-
          misses the inference: the policy looks at the change over the previous year, which the stimulus
          gives, so whether attendance keeps rising has no bearing on this year's renewal
    likely_errors: [reversed-logic, misread-stimulus, wrong-gap, understated]
  - key: assumption
    status: active
    skill: assumption
    difficulty: 3
    difficulty_note: >-
      Conditionals and claim strength: the argument needs only that nothing else will stop this museum's grant
      being renewed this year. The tempting general rule, that a rise in attendance always brings renewal, is
      stronger than needed. Saying the grant will be renewed, or that nothing will stop its renewal, is the
      conclusion in other words; a full-credit answer rules out a particular obstacle.
    prompt: >-
      State an assumption the argument needs: a claim that, if false, would make the argument fall apart.
      (A necessary assumption; it need not make the argument airtight.)
    max: 2
    reference: The city will have enough money in its arts budget to renew the museum's grant this year.
    accept: >-
      The inference under test is from "the council renews a grant only if attendance rose, and the museum's
      attendance rose" to "the council will renew the museum's grant". Any unstated claim counts whose denial,
      with every premise kept, would mean the grant will not be renewed despite the rise. Main kinds rule out
      a particular obstacle: the city will have the money for the grant; the museum meets any other
      requirement the council has for renewal; the council has not decided to stop funding museums. Claims
      stronger than needed earn 1, such as that every museum whose attendance rises has its grant renewed, or
      that the council never refuses a grant for any other reason: the argument needs this museum's grant to
      face no other obstacle this year, not a rule about every museum or every year. Repeating the policy or
      the rise in attendance, or saying the grant will be renewed or that nothing will stop its renewal (the
      conclusion in other words), earns 0.
    disqualifiers:
      - Gives a claim the argument already states, such as the policy or the museum's rise in attendance, or merely says that the grant will be renewed or that nothing will stop its renewal.
    rubric:
      - States a claim the argument does not state that bears on whether the museum's rise in attendance will be enough for its grant to be renewed (for example, that the city will have the money for it, or that the museum meets the council's other requirements), not a premise or a version of the conclusion.
      - States it no more strongly than the argument needs, so that if it were false the grant would not be renewed despite the rise, rather than a general rule that every museum whose attendance rises has its grant renewed.
    anchors:
      - points: 2
        answer: >-
          The museum hasn't failed any other requirement the council has for renewing a grant, such as handing
          in its accounts on time.
        note: >-
          a different bridge from the reference (the museum's own record rather than the city's budget); if it
          were false, the museum would fail a requirement and lose its grant despite the rise
      - points: 1
        answer: Every museum whose attendance goes up has its grant renewed.
        note: >-
          near miss, too strong: the argument needs only that nothing will stop this museum's renewal this year,
          not a rule for every museum
      - points: 0
        answer: The council renews a grant only when the museum's attendance has gone up.
        note: a stated premise, not an assumption (disqualifier)
    likely_errors: [overstated, reversed-logic, restates-conclusion, wrong-gap]
---
Under the city of Brask's arts policy, the city council renews a museum's yearly operating grant only if
the museum's attendance rose over the previous year. Last year, attendance at the Brask Museum of Craft
rose by 8 percent, more than at any other museum in the city. The museum's director has therefore assured
the staff that the council will renew the museum's grant this year.
````

### File: content/exercises/arg-0022.md

````yaml
---
schema: 3
id: arg-0022
status: draft
kind: argument
difficulty: 3
topics: [local business, markets]
source:
  type: original
  title: null
  creator: null
  year: null
  locator: null
  license_uri: null
  attribution: null
  rights_basis: null
  modifications: null
contributors: []
ai_assistance:
  used: true
  notes: Stimulus, tasks, references, anchors and rubric drafted by Claude; awaiting human review and edits.
approved_by: null
approved_at: null
approved_revision: null
tasks:
  - key: strengthen
    status: active
    skill: strengthen
    difficulty: 2
    difficulty_note: >-
      Analogy: the move's effect in Pell is given, so facts about Pell that do not bear on its likeness to
      Ardley add little. A full-credit fact bears on whether Ardley is like Pell in what made the move work
      there, chiefly people who could stop at the market on their way home from work, or on whether the move
      would keep Ardley's current shoppers.
    prompt: >-
      Give a new fact that, if true, would materially strengthen the argument, and explain how. Treat the
      stated premises as true.
    max: 2
    reference: >-
      Many people in Ardley work in town and pass the market site on their way home, much as in Pell. So the
      kind of shopper who made the move pay off in Pell is there in Ardley too.
    accept: >-
      Any new fact, consistent with the premises and not already stated in them, that makes it more likely
      that moving Ardley's market to Thursday evenings would raise its sales, with an explanation of how. Main
      kinds: Ardley has the kind of shopper who made the move work in Pell (people who pass the market on
      their way home from work); the move would not cost Ardley's market its current shoppers (they could come
      on Thursday evenings too); nothing in Ardley would keep evening shoppers away (no other evening market
      nearby); Pell before the move was like Ardley now (its Saturday sales had also been flat for years).
      Facts about Pell that do not bear on its likeness to Ardley add little, since the move's effect there is
      given. A relevant new fact whose bearing is not explained earns 1.
    rubric:
      - Gives a new fact, consistent with the stated premises and not already stated in them, that bears on whether moving Ardley's market to Thursday evenings would raise its sales.
      - Explains how the fact strengthens the argument, namely why it makes a rise in Ardley's sales after the move more likely (for example, by showing that Ardley has the kind of shopper who made the move work in Pell, or that the move would not drive away its current shoppers).
    anchors:
      - points: 2
        answer: >-
          Nearly all of the Ardley market's regular Saturday shoppers are free on Thursday evenings. So the move
          wouldn't lose the customers it already has, and any new evening shoppers would add to its sales.
        note: a different strengthener from the reference (keeping current shoppers rather than gaining new ones)
      - points: 1
        answer: Lots of Ardley residents drive past the market site on their way home from work.
        note: the right kind of fact, but the answer does not explain how it supports the argument
      - points: 0
        answer: After Pell moved its market to Thursday evenings, its sales rose by a third.
        note: already stated in the stimulus, so not a new fact
    likely_errors: [no-reasoning, irrelevant, scope-shift, understated]
  - key: weaken
    status: active
    skill: weaken
    difficulty: 3
    difficulty_note: >-
      Analogy, with the kind of fact constrained to Ardley: the move caused Pell's rise, so a full-credit fact
      shows that Ardley differs from Pell in something that matters to whether the move would raise sales,
      such as having few people who pass the market on their way home from work, or losing its current
      shoppers. A difference with no bearing on that, or a fact suggesting only a smaller rise than Pell's,
      does not weaken the claim that sales would rise.
    prompt: >-
      Give a new fact about Ardley that, if true, would materially weaken the argument, and explain how. Treat
      the stated premises as true.
    max: 2
    reference: >-
      Most working people in Ardley commute to jobs in the city and get home too late to shop at an evening
      market. Ardley has few of the shoppers who made the move pay off in Pell, so the move might not raise
      its sales at all.
    accept: >-
      Any new fact about Ardley, consistent with every premise, that gives a real reason to doubt that moving
      its market to Thursday evenings would raise its sales, plus an explanation of how. Main kinds: Ardley has
      few of the shoppers who made the move work in Pell (people who stop on their way home from work); the
      move would cost Ardley's market many of its current shoppers (most cannot come on Thursday evenings);
      something in Ardley would keep evening shoppers away (an established Thursday-evening market nearby). A
      fact suggesting only that Ardley's rise would be smaller than Pell's, while still a rise (for example,
      that Ardley's market is smaller), does not weaken the claim that sales would rise; a fact that Ardley
      has far fewer of the shoppers who drove Pell's rise does count. A qualifying fact whose effect is not explained earns 1. A fact that is not about
      Ardley earns 0, and so does a fact that denies a premise, for example that the move did not cause
      Pell's rise.
    disqualifiers:
      - Denies a stated premise, for example that the move itself caused the rise in the Pell market's sales.
    rubric:
      - Gives a new fact about Ardley, consistent with the stated premises, that gives a reason to doubt that moving its market to Thursday evenings would raise its sales.
      - Explains how that fact weakens the argument, namely why, even granting that the move raised sales in Pell, it makes a rise in Ardley's sales after the move less likely (for example, because Ardley lacks the shoppers who made the move work in Pell, or because the move would drive away its current shoppers).
    anchors:
      - points: 2
        answer: >-
          Most of the people who shop at Ardley's Saturday market are retired farmers who don't go out in the
          evenings. Moving to Thursday evenings would lose them, so Ardley's sales could fall rather than rise.
        note: a different weakener from the reference (losing current shoppers rather than lacking new ones)
      - points: 1
        answer: Most working people in Ardley get home from work too late to shop at an evening market.
        note: the right fact, but the answer does not explain how it undercuts the conclusion
      - points: 0
        answer: >-
          Pell's sales would have risen anyway, because a big housing estate opened next to its market that
          year.
        note: >-
          denies the premise that the move itself caused Pell's rise (disqualifier), and it is not about Ardley
    likely_errors: [contradicts-premise, no-reasoning, scope-shift, irrelevant]
---
Two years ago, the town of Pell moved its weekly farmers' market from Saturday mornings to Thursday
evenings. The market's sales then rose by a third, and a careful study showed that the move itself caused
the rise, chiefly by drawing people who stopped at the market on their way home from work. The nearby
town of Ardley, whose Saturday-morning market has had flat sales for years, is considering the same move.
An Ardley council member argues that moving its market to Thursday evenings would raise its sales as well.
````

### File: content/exercises/arg-0023.md

````yaml
---
schema: 3
id: arg-0023
status: draft
kind: argument
difficulty: 3
topics: [ecology, wildlife]
source:
  type: original
  title: null
  creator: null
  year: null
  locator: null
  license_uri: null
  attribution: null
  rights_basis: null
  modifications: null
contributors: []
ai_assistance:
  used: true
  notes: Stimulus, tasks, references, anchors and rubric drafted by Claude; awaiting human review and edits.
approved_by: null
approved_at: null
approved_revision: null
tasks:
  - key: assumption
    status: active
    skill: assumption
    difficulty: 3
    difficulty_note: >-
      Measurement: the cameras' placement, settings, view and reliability are stipulated, so the open gap is
      between how often each lynx passed the cameras and how many lynx there were. The assumption must deny
      that the average lynx was simply photographed far less often, not require that the lynx's habits stayed
      exactly the same.
    prompt: >-
      State an assumption the argument needs: a claim that, if false, would make the argument fall apart.
      (A necessary assumption; it need not make the argument airtight.)
    max: 2
    reference: >-
      On average, each lynx was not passing the camera spots so much less often in 2025 than in 2020 that this
      alone would account for the drop in photographs; for example, lynx had not started avoiding the camera
      trails.
    accept: >-
      The inference under test is from "the same forty working cameras photographed a lynx on 120 occasions in
      2020 and on 58 in 2025" to "the number of lynx in the forest has fallen substantially". Any unstated
      claim counts whose denial, with every premise kept, would let the drop in photographs be explained
      without a substantial fall in the number of lynx. The main bridge is that the lynx were not photographed
      far less often per animal in 2025 than in 2020: they did not start avoiding the camera trails or shift
      their ranges to parts of the forest without cameras, and the 2020 count was not so swollen by repeat
      photographs of a few lynx (a family denning beside one camera) that without them there would be little
      drop. The claim must not be stronger than
      the argument needs: requiring that the lynx's habits or ranges did not change at all, or that each lynx
      was photographed exactly as often, earns 1. Repeating that the cameras worked, or saying that there are
      fewer lynx, earns 0.
    disqualifiers:
      - Gives a claim the argument already states, such as that the cameras worked reliably in both years, or merely says that there are fewer lynx in the forest.
    rubric:
      - States a claim the argument does not state that links the drop in photographs to the number of lynx (for example, that the average lynx did not start passing the cameras far less often), not a premise or a version of the conclusion.
      - States it no more strongly than the argument needs, so that if it were false the drop in photographs would no longer show a substantial fall in the number of lynx, rather than requiring that the lynx's habits did not change at all.
    anchors:
      - points: 2
        answer: >-
          The 2020 photos weren't mostly of one lynx family that happened to live right beside one of the
          cameras that year.
        note: >-
          a different case from the reference (a 2020 count swollen by repeat photographs rather than lynx
          avoiding the cameras in 2025); if it were false, one family would account for most of the 2020 count
          and the drop would say little about the number of lynx
      - points: 1
        answer: The lynx in Corrin Forest move around exactly as they did in 2020, using the same trails just as often.
        note: >-
          near miss, too strong: the lynx's habits could change a little without explaining a drop of more than
          half in photographs
      - points: 0
        answer: The cameras worked properly in both years.
        note: a stated premise, not an assumption (disqualifier)
    likely_errors: [overstated, missed-alternative, restates-conclusion, wrong-gap]
  - key: weaken
    status: active
    skill: weaken
    difficulty: 2
    difficulty_note: >-
      Measurement: the cameras' settings, view and reliability are stipulated, so a report of faulty or
      blocked cameras denies a premise. A
      full-credit fact gives a reason the lynx might have been photographed less often without their numbers
      falling much, such as lynx avoiding the camera trails or a 2020 count swollen by a few animals.
    prompt: >-
      Give a new fact that, if true, would materially weaken the argument, and explain how. Treat the stated
      premises as true.
    max: 2
    reference: >-
      In 2022 a popular hiking route opened along most of the trails with cameras, and lynx avoid places where
      people walk. The lynx may simply be passing those cameras less often, so the drop in photographs need
      not mean there are fewer lynx.
    accept: >-
      Any new fact, consistent with every premise (the same forty cameras, at the same spots, worked reliably
      with unchanged settings and a clear view of their trails throughout both years), that gives a real reason to doubt that the drop in photographs reflects a
      substantial fall in the number of lynx, plus an explanation of how. Main kinds: lynx now pass the camera
      spots less often (they avoid the trails, their prey has moved elsewhere in the forest, they have shifted
      their ranges away from the cameras); the 2020 count was swollen by repeat photographs of a few lynx (a
      family denning beside one camera). A relevant fact whose effect is not explained earns 1. A fact that
      denies a premise, such as some cameras failing or being blocked by undergrowth in 2025, earns 0.
    disqualifiers:
      - Denies a stated premise, for example that some of the cameras were broken or missing for part of 2025.
    rubric:
      - Gives a new fact, consistent with the stated premises and not already stated in them, that bears on whether the drop in photographs reflects a fall in the number of lynx.
      - Explains how the fact weakens the argument, namely why it makes it more plausible that the lynx were photographed less often without their numbers falling substantially (for example, because they now avoid the camera spots, or because a few lynx swelled the 2020 count).
    anchors:
      - points: 2
        answer: >-
          In 2020 a female lynx raised kittens in a den a few meters from one camera, and that camera alone
          photographed them 60 times. Leave those out and the count went from 60 to at most 58, hardly a drop,
          so the forest may have about as many lynx as before.
        note: a different weakener from the reference (a 2020 count swollen by one family rather than lynx avoiding the cameras in 2025)
      - points: 1
        answer: A popular hiking route opened along most of the camera trails in 2022.
        note: the right kind of fact, but the answer does not explain how it bears on the number of photographs
      - points: 0
        answer: Several of the cameras broke down in the summer of 2025 and took no photos for months.
        note: denies the premise that every camera worked reliably throughout both years (disqualifier)
    likely_errors: [contradicts-premise, no-reasoning, missed-alternative, irrelevant]
---
Wildlife officers keep forty motion-triggered cameras at fixed spots along trails in Corrin Forest, and
the cameras stood at the same forty spots in 2020 and 2025. Monthly checks showed every camera working
reliably, with unchanged settings and a clear view of its trail, throughout both years. In 2020 the
cameras photographed a lynx on 120 occasions; in 2025 they did so on only 58. The forest's chief wildlife
officer concludes that the number of lynx living in Corrin Forest has fallen substantially since 2020.
````

### File: content/exercises/arg-0024.md

````yaml
---
schema: 3
id: arg-0024
status: draft
kind: argument
difficulty: 4
topics: [history, preservation]
source:
  type: original
  title: null
  creator: null
  year: null
  locator: null
  license_uri: null
  attribution: null
  rights_basis: null
  modifications: null
contributors: []
ai_assistance:
  used: true
  notes: Stimulus, tasks, references, anchors and rubric drafted by Claude; awaiting human review and edits.
approved_by: null
approved_at: null
approved_revision: null
tasks:
  - key: conclusion
    status: active
    skill: conclusion
    difficulty: 4
    difficulty_note: >-
      Structure map: main conclusion (the society should not oppose the conversion), stated first; opposing
      view (some members: keep the silo exactly as it stands, since it is the county's last wooden silo);
      concession (the conversion would replace much of the interior); premises (the charter's commitment; the
      conversion keeps the outer walls and loading machinery, which show how grain was handled); intermediate
      conclusion (the conversion would preserve what makes the silo historically important), introduced by
      "so" in the last sentence. Support runs from the intermediate conclusion back to the opening
      recommendation, which makes the intermediate conclusion the tempting rival.
    prompt: State the argument's main conclusion in one sentence.
    max: 1
    reference: The Varden Historical Society should not oppose the plan to turn the old grain silo into apartments.
    accept: >-
      Any wording that says the historical society should not oppose (or should not fight or object to) the
      plan to convert the silo into apartments. Saying that the conversion would preserve what makes the silo
      historically important is the intermediate claim offered as the reason; saying that the conversion would
      replace much of the interior is a concession; saying that the silo must be kept exactly as it stands is
      the members' view the author argues against; saying that the society should support or campaign for the
      conversion goes beyond the author, who says only that it should not oppose it.
    disqualifiers:
      - States the opposite recommendation (that the society should oppose the conversion, or that the silo must be kept exactly as it stands).
    rubric:
      - Identifies the main conclusion (that the historical society should not oppose the plan to convert the silo into apartments), not the intermediate claim that the conversion would preserve what makes the silo historically important, the concession about the interior, the members' view, or a call for the society to support the plan.
    anchors:
      - points: 1
        answer: The historical society shouldn't fight the plan to turn the silo into apartments.
      - points: 0
        answer: Turning the silo into apartments would keep what makes it historically important.
        note: near miss, the intermediate conclusion offered as the reason for the recommendation
    likely_errors: [premise-as-conclusion, counterpoint-as-conclusion, overstated]
  - key: assumption
    status: active
    skill: assumption
    difficulty: 3
    difficulty_note: >-
      Two links: from the premises to the intermediate conclusion (what the conversion keeps is all the
      charter protects in the silo), and from there to the recommendation (preserving that leaves the society
      no other reason to oppose the plan). Claims about every conversion of an old building, or that the
      interior has no value of any kind, are stronger than needed.
    prompt: >-
      State an assumption the argument needs: a claim that, if false, would make the argument fall apart.
      (A necessary assumption; it need not make the argument airtight.)
    max: 2
    reference: >-
      The parts of the silo that the conversion would replace, such as its interior, show nothing about how the
      county's people lived and worked beyond what the outer walls and loading machinery show.
    accept: >-
      The inference under test runs from "the charter commits the society to protecting buildings that show
      how the county's people lived and worked; the conversion keeps the outer walls and loading machinery,
      which show how grain was handled" through "the conversion would preserve what makes the silo
      historically important" to "the society should not oppose the conversion". Any unstated claim counts
      whose denial, with every premise kept, would break either step. Main bridges: (a) the parts the
      conversion would replace (the interior) show nothing about how the county's people lived and worked
      beyond what the outer walls and loading machinery show, so losing them takes nothing the charter
      protects; (b) the society has no other duty or commitment, such
      as keeping the county's last wooden silo unaltered, that the conversion would break. Claims stronger
      than needed earn 1, such as that converting old buildings always preserves their historical importance,
      or that the silo's interior has no value of any kind. Repeating a premise or the intermediate claim, or
      saying the society should not oppose the plan, earns 0.
    disqualifiers:
      - Gives a claim the argument already states, such as that the conversion would keep the outer walls and loading machinery or would preserve what makes the silo historically important, or merely says that the society should not oppose the plan.
    rubric:
      - States a claim the argument does not state that links what the conversion keeps to the recommendation not to oppose it (for example, that the parts it would replace show nothing about how the county's people lived and worked beyond what the parts it keeps show), not a premise, the intermediate claim or a version of the conclusion.
      - States it no more strongly than the argument needs, so that if it were false the conversion would destroy something the society is committed to protecting or would break another of its duties, rather than a claim about every conversion of an old building or that the interior has no value of any kind.
    anchors:
      - points: 2
        answer: The society has no rule or duty to keep the county's last wooden silo exactly as it is.
        note: >-
          a different bridge from the reference (the society's other commitments rather than the interior); if
          it were false, the society would have a duty the conversion breaks, whatever the outer walls and
          machinery show
      - points: 1
        answer: Turning an old building into apartments always keeps whatever makes it historically important.
        note: >-
          near miss, too strong: the argument needs this to hold for the silo, not for every conversion
      - points: 0
        answer: The conversion would keep the silo's outer walls and its loading machinery.
        note: a stated premise, not an assumption (disqualifier)
    likely_errors: [overstated, restates-conclusion, wrong-gap, irrelevant]
---
The Varden Historical Society should not oppose the plan to turn the old Varden grain silo into
apartments. Some of the society's members argue that the silo must be kept exactly as it stands, because
it is the last wooden silo in the county. Admittedly, the conversion would replace much of the silo's
interior. But the society's charter commits it to protecting buildings that show how the county's people
lived and worked, and the conversion would keep the silo's outer walls and its loading machinery, which
are what show how grain was handled there. So the conversion would preserve what makes the silo
historically important.
````

### File: content/exercises/arg-0025.md

````yaml
---
schema: 3
id: arg-0025
status: draft
kind: argument
difficulty: 3
topics: [public health, statistics]
source:
  type: original
  title: null
  creator: null
  year: null
  locator: null
  license_uri: null
  attribution: null
  rights_basis: null
  modifications: null
contributors: []
ai_assistance:
  used: true
  notes: Stimulus, tasks, references, anchors and rubric drafted by Claude; awaiting human review and edits.
approved_by: null
approved_at: null
approved_revision: null
tasks:
  - key: flaw
    status: active
    skill: flaw
    difficulty: 3
    difficulty_note: >-
      Scope of the measured quantity, with arithmetic: 4,000 inspections, of which 400 found a serious
      violation. Those 400 could have been at anywhere from 100 restaurants (each failing all four of its
      inspections, one in ten) to 400 (four in ten). So one in ten is the lowest possible share, reached only
      if every restaurant that failed did so every time, and "about one in ten" needs most of them to have
      failed repeatedly. An answer saying the share could
      be lower than one in ten has the direction wrong.
    prompt: Describe the main reasoning error in one or two sentences.
    max: 2
    reference: >-
      The writer treats the share of inspections that found a serious violation as the share of restaurants
      found to have one; since each restaurant was inspected four times, the 400 failed inspections could have
      been at as many as 400 different restaurants, four in ten, and the share is as low as one in ten only if
      every restaurant that failed did so in all four of its inspections.
    accept: >-
      Any answer that identifies the move from "one inspection in ten found a serious violation" to "about one
      restaurant in ten was found to have one", and says why that does not follow: each restaurant was
      inspected four times, so the failed inspections could have been spread across many more restaurants than
      one in ten (up to four in ten). Exact numbers are not required. An answer that says the share of
      restaurants could be lower than one in ten has the direction wrong (at least 100 restaurants, one in
      ten, must account for the 400 failed inspections), so it does not say why the inference fails. An
      answer that says only that the two shares need not match, without saying that the share of restaurants
      could be higher, earns 1.
      Objections that inspectors may have missed violations miss the error, since the conclusion concerns
      violations that were found.
    rubric:
      - Ties the error to this argument, naming the share of inspections that found a serious violation (one in ten) and the conclusion about the share of restaurants found to have one.
      - Says why the inference fails, namely that because each restaurant was inspected four times, the failed inspections could have been spread across far more restaurants than one in ten (up to four in ten).
    anchors:
      - points: 2
        answer: >-
          One in ten inspections isn't one in ten restaurants. With four inspections each, the 400 failures
          could have hit up to 400 different restaurants, which would be 40 percent of them, not 10.
      - points: 1
        answer: >-
          The writer goes from one inspection in ten finding a serious violation to one restaurant in ten having
          been found with one.
        note: identifies the inference but does not say why the share of inspections need not match the share of restaurants
      - points: 0
        answer: >-
          The inspectors may have missed some violations, so more restaurants may have had them than the figures
          show.
        note: >-
          near miss: the conclusion is about violations that were found, so violations the inspectors missed do
          not bear on it
    likely_errors: [scope-shift, misread-stimulus, wrong-gap, understated]
  - key: weaken
    status: active
    skill: weaken
    difficulty: 2
    difficulty_note: >-
      Scope of the measured quantity: the 400 failed inspections come to about one restaurant in ten only if
      most restaurants that failed did so in several of their four inspections. A full-credit fact shows the
      failures were spread across more restaurants than that. A fact suggesting the failures were concentrated
      in a few restaurants supports the conclusion instead.
    prompt: >-
      Give a new fact that, if true, would materially weaken the argument, and explain how. Treat the stated
      premises as true.
    max: 2
    reference: >-
      Almost no restaurant was found with a serious violation in more than one of its four inspections. The
      400 failed inspections were then at nearly 400 different restaurants, close to four in ten, far more
      than one in ten.
    accept: >-
      Any new fact, consistent with every premise (1,000 restaurants, four inspections each, one inspection in
      ten finding a serious violation), that gives a real reason to think the failed inspections were spread
      across clearly more than one restaurant in ten, plus an explanation of how. Main kinds: few restaurants
      failed more than one inspection; restaurants found with a violation usually passed their later
      inspections; the failures were scattered across many different restaurants. A fact suggesting the
      failures were concentrated in a few restaurants supports the conclusion and earns 0. A
      qualifying fact whose effect is not explained earns 1. A fact that denies a premise, such as some
      restaurants being inspected only once, earns 0.
    disqualifiers:
      - Denies a stated premise, for example that every restaurant was inspected four times.
    rubric:
      - Gives a new fact, consistent with the stated premises and not already stated in them, that points to the failed inspections being spread across more restaurants than one in ten.
      - Explains how the fact weakens the argument, namely why it means the failed inspections were spread across clearly more than one restaurant in ten.
    anchors:
      - points: 2
        answer: >-
          Restaurants found with a serious violation had to fix it within a week, and very few were caught with
          one again later in the year. So the 400 failed inspections were spread over hundreds of restaurants,
          far more than one in ten.
        note: a different weakener from the reference (a reason the failures were spread out, rather than the spread itself)
      - points: 1
        answer: Very few restaurants failed more than one of their inspections.
        note: the right fact, but the answer does not explain how it undercuts the conclusion
      - points: 0
        answer: Many restaurants were inspected only once last year.
        note: denies the premise that every restaurant was inspected four times (disqualifier)
    likely_errors: [contradicts-premise, no-reasoning, scope-shift, understated]
---
Halden's health department inspected each of the city's 1,000 restaurants four times last year, without
warning, and recorded whether each inspection found a serious violation, such as food stored at unsafe
temperatures. One inspection in ten found such a violation. In a newspaper column praising the city's
restaurants, a food writer concludes that only about one Halden restaurant in ten was found to have a
serious violation last year.
````

### File: content/exercises/arg-0026.md

````yaml
---
schema: 3
id: arg-0026
status: draft
kind: argument
difficulty: 2
topics: [environment, local policy]
source:
  type: original
  title: null
  creator: null
  year: null
  locator: null
  license_uri: null
  attribution: null
  rights_basis: null
  modifications: null
contributors: []
ai_assistance:
  used: true
  notes: Stimulus, tasks, references, anchors and rubric drafted by Claude; awaiting human review and edits.
approved_by: null
approved_at: null
approved_revision: null
tasks:
  - key: strengthen
    status: active
    skill: strengthen
    difficulty: 2
    difficulty_note: >-
      Measured quantity: the premise counts checkout bags handed out, while the conclusion is about all the
      plastic households throw away, and claims a great reduction brought about by the fee. A full-credit fact
      connects the two: checkout bags were a large share of that plastic, households did not replace them with
      other plastic, or the fee rather than something else cut the number of bags.
    prompt: >-
      Give a new fact that, if true, would materially strengthen the argument, and explain how. Treat the
      stated premises as true.
    max: 2
    reference: >-
      Before the fee, plastic checkout bags made up about a third of the plastic Brannock's households threw
      away. So, unless households replaced them with other plastic, an 80 percent cut would remove more than a
      quarter of all that plastic (about 27 percent), a great reduction.
    accept: >-
      Any new fact, consistent with the premises and not already stated in them, that makes it more likely
      that the fee greatly reduced the plastic Brannock's households throw away, with an explanation of how.
      Main kinds: checkout bags were a large share of that plastic; households did not replace the bags with
      other plastic (sales of plastic bin liners held steady, shoppers switched to cloth bags); the fee, not
      something else, cut the number of bags (in nearby towns without a fee, the number held steady). A
      relevant new fact whose bearing is not explained earns 1.
    rubric:
      - Gives a new fact, consistent with the stated premises and not already stated in them, that bears on whether the fee greatly reduced the plastic Brannock's households throw away.
      - Explains how the fact strengthens the argument, namely why it makes a large fall in that plastic, brought about by the fee, more likely (for example, because checkout bags were a large share of it, or because households did not replace them with other plastic).
    anchors:
      - points: 2
        answer: >-
          Most Brannock shoppers now bring cloth bags, and the town's sales of plastic bin liners and food bags
          haven't gone up. So people aren't just swapping one kind of plastic for another, and the drop in
          checkout bags really is a drop in plastic thrown away.
        note: a different strengthener from the reference (no replacement plastic rather than the bags' share of the waste)
      - points: 1
        answer: Plastic checkout bags used to make up about a third of the plastic Brannock households threw away.
        note: the right kind of fact, but the answer does not explain how it supports the argument
      - points: 0
        answer: Brannock's shops now hand out 80 percent fewer plastic bags than before the fee.
        note: already stated in the stimulus, so not a new fact
    likely_errors: [no-reasoning, scope-shift, irrelevant, understated]
  - key: weaken
    status: active
    skill: weaken
    difficulty: 2
    difficulty_note: >-
      Measured quantity: a fall in checkout bags handed out need not mean a great fall in the plastic
      households throw away. A full-credit fact shows that the bags were a small part of that plastic, that
      households replaced them with other plastic, or that something other than the fee cut the number of
      bags.
    prompt: >-
      Give a new fact that, if true, would materially weaken the argument, and explain how. Treat the stated
      premises as true.
    max: 2
    reference: >-
      Plastic checkout bags made up only about 2 percent of the plastic Brannock's households threw away. Even
      an 80 percent cut in them reduces that plastic by less than 2 percent, which is not a great reduction.
    accept: >-
      Any new fact, consistent with every premise (the fee began a year ago, and the number of checkout bags
      handed out by Brannock's shops has fallen by 80 percent since), that gives a real reason to doubt that
      the fee greatly reduced the plastic Brannock's households throw away, plus an explanation of how. Main
      kinds: checkout bags were a small share of that plastic, so even a large cut in them changes the total
      little; households now buy other plastic in their place (bin liners, heavier reusable plastic bags that
      are soon thrown away); shoppers now get plastic bags elsewhere, such as at shops outside town; something
      other than the fee cut the number of bags (the largest supermarket stopped offering plastic bags the
      same month). A relevant fact whose effect is not explained earns 1. A fact that denies a premise, such
      as the number of bags not having fallen, earns 0.
    disqualifiers:
      - Denies a stated premise, for example that the number of plastic checkout bags handed out by Brannock's shops fell by 80 percent.
    rubric:
      - Gives a new fact, consistent with the stated premises and not already stated in them, that bears on whether the fee greatly reduced the plastic Brannock's households throw away.
      - Explains how the fact weakens the argument, namely why, even granting the fall in checkout bags, it makes a great reduction in that plastic, brought about by the fee, less likely (for example, because the bags were a small share of it, or because households replaced them with other plastic).
    anchors:
      - points: 2
        answer: >-
          Many households used to reuse their checkout bags as bin liners. Now they buy plastic bin liners
          instead, which are thicker and heavier, so the plastic they throw away may hardly have changed.
        note: a different weakener from the reference (replacement plastic rather than the bags' small share)
      - points: 1
        answer: Since the fee began, sales of plastic bin liners in Brannock have doubled.
        note: the right kind of fact, but the answer does not explain how it undercuts the conclusion
      - points: 0
        answer: Shops in Brannock hand out about as many plastic bags as they did before the fee.
        note: denies the premise that the number of bags handed out fell by 80 percent (disqualifier)
    likely_errors: [contradicts-premise, no-reasoning, scope-shift, understated]
---
A year ago, the town of Brannock began requiring its shops to charge 25 cents for each plastic bag a
shopper takes at the checkout. Since then, the number of plastic checkout bags handed out by Brannock's
shops has fallen by 80 percent. The town's environmental officer concludes that the fee has greatly
reduced the amount of plastic that Brannock's households throw away.
````

### File: content/exercises/arg-0027.md

````yaml
---
schema: 3
id: arg-0027
status: draft
kind: argument
difficulty: 3
topics: [history, archives]
source:
  type: original
  title: null
  creator: null
  year: null
  locator: null
  license_uri: null
  attribution: null
  rights_basis: null
  modifications: null
contributors: []
ai_assistance:
  used: true
  notes: Stimulus, tasks, references, anchors and rubric drafted by Claude; awaiting human review and edits.
approved_by: null
approved_at: null
approved_revision: null
tasks:
  - key: assumption
    status: active
    skill: assumption
    difficulty: 3
    difficulty_note: >-
      Two inferences hang on the watermark: that the letter's paper came from the Holt mill, and that Holt's
      paper with that mark dates from 1801 or later. The complete records settle the second, so the gap is the
      first: paper with a running hare could have come from somewhere other than the region's only mill.
      Claims about every watermark anywhere are stronger than needed.
    prompt: >-
      State an assumption the argument needs: a claim that, if false, would make the argument fall apart.
      (A necessary assumption; it need not make the argument airtight.)
    max: 2
    reference: The letter's paper was made at the Holt mill, not by some other papermaker who also used a running-hare mark.
    accept: >-
      The inference under test is from "the letter's paper bears a running-hare watermark, and Holt, the
      region's only mill at the time, first used such a mark in 1801" to "the letter was written in 1801 or
      later, at least thirteen years after the year on it". Any unstated claim counts whose denial, with every
      premise kept, would leave the paper's date open. Main bridges: (a) the paper came from the Holt mill,
      not from another papermaker (outside the region) whose mark was also a running hare; (b) no papermaker
      who could have supplied paper to Tarrant was using a running-hare mark by 1788. The claim must not be
      stronger than the argument needs: requiring that no papermaker anywhere ever used a hare mark, or that
      all the paper in the archive came from Holt, earns 1. Repeating what Holt's records show, or saying
      that the letter was written after its date, earns 0.
    disqualifiers:
      - Gives a claim the argument already states, such as that the Holt mill never used the running-hare mark before 1801, or merely says that the letter was written later than its date.
    rubric:
      - States a claim the argument does not state that links the letter's running-hare watermark to the Holt mill's records (for example, that the paper came from Holt and not from another papermaker using a similar mark), not a premise or a version of the conclusion.
      - States it no more strongly than the argument needs, so that if it were false the letter's paper could have been made by 1788, rather than a claim that no papermaker anywhere ever used a hare mark.
    anchors:
      - points: 2
        answer: No paper mill that sold paper to people in Tarrant was already using a running-hare watermark in 1788.
        note: >-
          a different bridge from the reference (other suppliers' marks rather than where the paper came from);
          if it were false, the letter's paper could date from 1788
      - points: 1
        answer: Holt is the only papermaker in history ever to have used a hare as its watermark.
        note: >-
          near miss, too strong: other makers could have used a hare mark later, or far from Tarrant, without
          affecting the argument
      - points: 0
        answer: The Holt mill did not use the running-hare mark before 1801.
        note: a stated premise, not an assumption (disqualifier)
    likely_errors: [overstated, wrong-gap, restates-conclusion, missed-alternative]
  - key: strengthen
    status: active
    skill: strengthen
    difficulty: 2
    difficulty_note: >-
      Holt's records already date its running-hare paper, so repeating them is not new. A full-credit fact
      either ties the letter's paper to Holt or gives separate evidence that the letter was written in 1801 or
      later.
    prompt: >-
      Give a new fact that, if true, would materially strengthen the argument, and explain how. Treat the
      stated premises as true.
    max: 2
    reference: >-
      The hare in the letter's watermark has the same small bend in its tail as the hare on dated sheets of
      Holt paper from 1802. That ties the letter's paper to the Holt mill, whose records show it made such
      paper only from 1801 on.
    accept: >-
      Any new fact, consistent with the premises and not already stated in them, that makes it more likely
      that the letter was written in 1801 or later, with an explanation of how. Main kinds: facts tying the
      letter's paper to Holt (its watermark matches Holt's in small details; no other maker's hare mark looks
      like it); facts closing off other sources of hare-marked paper (no mill that supplied the region used a
      hare mark before 1801); separate evidence of a later date (the letter mentions something that happened
      after 1801, or its ink was first made later). A relevant new fact whose bearing is not explained earns
      1.
    rubric:
      - Gives a new fact, consistent with the stated premises and not already stated in them, that bears on whether the letter was written in 1801 or later.
      - Explains how the fact strengthens the argument, namely why it makes a date of 1801 or later more likely (for example, by tying the paper to the Holt mill or by giving separate evidence of a later date).
    anchors:
      - points: 2
        answer: >-
          The letter mentions the new bridge over the Tarrant river, and the town's records show that bridge
          opened in 1806. The letter couldn't have been written before the bridge existed, so it dates from
          1806 or later, which fits the curator's conclusion.
        note: a different strengthener from the reference (separate evidence of a later date rather than tying the paper to Holt)
      - points: 1
        answer: No other mill's hare watermark from that period looks like the one on the letter.
        note: the right kind of fact, but the answer does not explain how it supports the argument
      - points: 0
        answer: The Holt mill's records show it first used the running hare in 1801.
        note: already stated in the stimulus, so not a new fact
    likely_errors: [no-reasoning, irrelevant, missed-alternative, understated]
---
The Tarrant town archive holds a letter dated 1788 and signed with the name of the town's first mayor. Its
paper bears a watermark of a running hare. The Holt mill, the only paper mill in the region at the time,
began marking its paper with a running hare in 1801, and its records, which survive complete from the
mill's founding, show that it never used the mark before then. The archive's curator concludes that the
letter was written in 1801 or later, at least thirteen years after the year on it.
````

### File: content/exercises/arg-0028.md

````yaml
---
schema: 3
id: arg-0028
status: draft
kind: argument
difficulty: 3
topics: [ethics, journalism]
source:
  type: original
  title: null
  creator: null
  year: null
  locator: null
  license_uri: null
  attribution: null
  rights_basis: null
  modifications: null
contributors: []
ai_assistance:
  used: true
  notes: Stimulus, tasks, references, anchors and rubric drafted by Claude; awaiting human review and edits.
approved_by: null
approved_at: null
approved_revision: null
tasks:
  - key: assumption
    status: active
    skill: assumption
    difficulty: 3
    difficulty_note: >-
      Conditionals: the code makes two conditions together enough for publishing, and the editor shows
      neither directly: that putting off the repairs was wrongdoing, and that the public has no other way to
      learn of it. A claim that the memo is the public's only way to learn anything at all about the alarms is
      stronger than needed.
    prompt: >-
      State an assumption the argument needs: a claim that, if false, would make the argument fall apart.
      (A necessary assumption; it need not make the argument airtight.)
    max: 2
    reference: >-
      The public has no other way to learn that officials put off repairing the alarms, for example from
      inspection reports the city already makes public.
    accept: >-
      The inference under test is from "the code says to publish a leaked document whenever it reveals
      wrongdoing by public officials that the public has no other way to learn about; the memo shows officials
      knew the school's alarms were faulty and put off repairing them" to "under its code, the Ledger should
      publish the memo". Any unstated claim counts whose denial, with every premise kept, would mean the memo
      does not meet the code's conditions, so the code gives no reason to publish it: (a) the public has no
      other way to learn that the officials put off the repairs; (b) putting off the repairs was wrongdoing,
      for example because it was not justified by the school being closed or the alarms being covered some
      other way; (c) the officials who put off the repairs are public officials. Claims stronger than needed
      earn 1, such as that the memo is the public's only way to learn anything at all about the alarms (the
      public might know they were faulty, so long as it could not learn that officials put off the repairs),
      or that every delay in repairing school equipment is wrongdoing. Repeating the code or what the memo
      shows, saying the memo is genuine (the premise already says what it shows), or saying the Ledger should
      publish the memo, earns 0.
    disqualifiers:
      - Gives a claim the argument already states, such as the code's rule or what the memo shows, or merely says that the Ledger should publish the memo.
    rubric:
      - States a claim the argument does not state that bears on whether the memo meets the code's conditions (for example, that the public has no other way to learn of the delay, or that putting off the repairs was wrongdoing), not a premise or a version of the conclusion.
      - States it no more strongly than the argument needs, so that if it were false the memo would fail one of the code's conditions, rather than a claim that the memo is the public's only way to learn anything at all about the alarms or that every delay in repairing school equipment is wrongdoing.
    anchors:
      - points: 2
        answer: >-
          Putting off the repairs was wrong; the officials didn't have a good reason for it, like the school
          being shut for those months.
        note: >-
          a different bridge from the reference (the wrongdoing condition rather than the other-ways-to-learn
          condition); if it were false, the memo would not reveal wrongdoing and the code would not call for
          publishing it
      - points: 1
        answer: The memo is the only way the public could learn anything at all about the school's fire alarms.
        note: >-
          near miss, too strong: the public could know the alarms were faulty, and the code would still call for
          publishing, so long as it had no other way to learn that officials put off the repairs
      - points: 0
        answer: Under its code, the Ledger should publish the memo.
        note: restates the conclusion (disqualifier)
    likely_errors: [overstated, restates-conclusion, wrong-gap, reversed-logic]
  - key: weaken
    status: active
    skill: weaken
    difficulty: 2
    difficulty_note: >-
      Conditionals: the code calls for publishing when both of its conditions are met, and the editor relies on
      nothing else, so a full-credit fact shows that one may not be met: the delay was not wrongdoing, or the
      public could learn of it another way. Harm that publishing might do is not one of the code's conditions.
    prompt: >-
      Give a new fact that, if true, would materially weaken the argument, and explain how. Treat the stated
      premises as true.
    max: 2
    reference: >-
      The city posted the alarm inspection reports, including its decision to put off the repairs, on its
      public website months ago. The public already had a way to learn of the delay, so the code's condition
      is not met and the code gives no reason to publish.
    accept: >-
      Any new fact, consistent with every premise (the code's rule, and that the memo shows officials knew the
      alarms were faulty and put off repairing them), that gives a real reason to think the memo does not meet
      the code's conditions, plus an explanation of how. Main kinds: the public could already learn of the
      delay another way (published reports, a public meeting, a court filing); putting off the repairs was not
      wrongdoing (the school was closed for those months, or the repairs were put off on the fire service's
      advice while a fire watch covered the building). Facts about harm that publishing might do, or about the
      paper's other interests, do not bear on what the code calls for. A qualifying fact whose effect is not
      explained earns 1. A fact that denies a premise, such as the memo being a forgery, earns 0.
    disqualifiers:
      - Denies a stated premise, for example that the memo shows officials knew the alarms were faulty and put off repairing them.
    rubric:
      - Gives a new fact, consistent with the stated premises and not already stated in them, that bears on whether the memo meets the code's conditions for publishing (that it reveals wrongdoing by public officials that the public has no other way to learn about).
      - Explains how the fact weakens the argument, namely why it means one of the code's conditions may not be met, so the code may not call for publishing the memo.
    anchors:
      - points: 2
        answer: >-
          The school was closed for rebuilding during those six months, and nobody used the building. Putting
          off the alarm repairs until it reopened wasn't wrongdoing, so the code doesn't call for publishing.
        note: a different weakener from the reference (no wrongdoing rather than another way to learn)
      - points: 1
        answer: >-
          The city announced at a public council meeting in the spring that it was putting off the school's
          alarm repairs.
        note: the right fact, but the answer does not explain how it undercuts the conclusion
      - points: 0
        answer: Publishing the memo would embarrass the officials named in it.
        note: >-
          near miss: harm to the officials is not one of the code's conditions, so it does not bear on what the
          code calls for
    likely_errors: [irrelevant, no-reasoning, contradicts-premise, understated]
---
The Eastfield Ledger's code of practice says that the paper should publish a leaked document whenever the
document reveals wrongdoing by public officials that the public has no other way to learn about. Last week
the Ledger was given a leaked city memo showing that officials knew for six months that the fire alarms at
Elm Street School were faulty and put off repairing them. The paper's editor concludes that, under its own
code, the Ledger should publish the memo.
````

## Reviewer response

GPT-6 Pro (thinking effort 5 of 5) in the owner's ChatGPT account, 2026-10-05, sent by the device session in Brave as one attachment; it worked for 28 minutes. The reply follows verbatim, from the first rule below to the last rule before `## Triage` (SHA-256 of the text between them: `1aaf4dab70a45f94d5fd0fd896da566538607aecbd96d64225448228715c5361`, 35,591 bytes, matching the copy saved on the owner's PC). "premise-batch2-packet" is ChatGPT's citation chip for the packet.

---

## arg-0019 — fix

### `arg-0019:assumption`

**Problem:** The disqualifier can be read as imposing a zero whenever an answer mentions a stated premise—even when it also supplies a valid assumption. For example, an answer can correctly acknowledge the matching earlier trends before excluding a complete alternative explanation. Mentioning a premise is not the same as offering that premise as the assumption. This wording recurs in all six assumption tasks. premise-batch2-packet

**Replace `disqualifiers` with the following text. Apply this same replacement to the assumption tasks in arg-0021, arg-0023, arg-0024, arg-0027 and arg-0028:**

```yaml
disqualifiers:
  - Offers only a stated premise, a stated intermediate conclusion, or a restatement of the main conclusion as the proposed assumption, without a distinct unstated assumption. Mentioning a stated claim while giving a distinct assumption does not by itself trigger this cap.
```

### `arg-0019:strengthen`

**Problems:** The reference moves from “fields on the same farm” to shared seed and equipment without clearly making those controls part of the proposed fact. Same-farm comparisons do not inherently hold every treatment fixed. Also, rubric criterion 1 requires only relevance: a fact attributing the extra rise to a new seed would satisfy “bears on whether,” despite pointing in the wrong direction. That permits an evidence point for a weakener in a strengthen task. premise-batch2-packet

**Replace `reference`:**

```yaml
reference: >-
  On farms that planted cover crops on only some fields, the fields with and
  without cover crops used the same corn seed, fertilizer and irrigation during
  the five years, and the cover-crop fields had the larger rise in yield. This
  comparison holds several rival causes steady and makes a contribution from
  the cover crops more likely.
```

**Replace rubric criterion 1:**

> Gives a new fact, consistent with the stated premises and not already stated in them, that materially strengthens the inference that the cover crops raised yields on the adopting farms.

## arg-0020 — fix

### `arg-0020:flaw`

**Problem:** The key excludes an alternative the stimulus leaves open. The stimulus matches hours **on the app** and excludes outside classes or lessons; it does not match informal practice outside the app. The difficulty note and acceptance text nevertheless claim that total practice time is fixed. This also conflicts with accepting a Spanish-speaking partner or time spent where Spanish is spoken as possible alternatives. premise-batch2-packet premise-batch2-packet

**Replace `difficulty_note`:**

```yaml
difficulty_note: >-
  Causes: the stimulus matches the groups' approximate duration of app use and
  their total hours practicing on the app, and rules out outside classes or
  lessons. It does not match starting proficiency or informal practice outside
  the app. A full-credit answer applies the causal error to the streaks and
  scores and identifies an alternative that remains open.
```

**Replace `accept`:**

```yaml
accept: >-
  Accept an answer that identifies the inference from the long-streak users'
  higher speaking-test scores to the claim that keeping a streak makes learners
  far better speakers, and explains why it is not established by naming a
  possible alternative consistent with the premises. Examples include better
  starting Spanish, better speakers finding streaks easier to maintain, or more
  informal Spanish practice outside the app. Offer alternatives as possibilities,
  not invented established facts. Do not credit an explanation that depends on
  substantially different durations of app use, more total hours on the app,
  or outside classes or lessons. Extra informal practice outside the app is not
  excluded. A bare, unapplied label such as "correlation is not causation"
  earns 0.
```

### `arg-0020:weaken`

**Problems:** The constrained prompt identifies the missing baseline comparison almost completely, so my difficulty estimate is **2**, not 3. Rubric criterion 1 also admits the opposite-direction fact that the eventual streak holders started substantially *behind*. Finally, the acceptance text and full-credit note overinterpret an unchanged observed gap as showing that the streaks added nothing: maintaining a gap and causing no advantage are not equivalent. The unchanged gap is a weakener, not proof of no causal effect. premise-batch2-packet

**Set task `difficulty` to `2` and exercise-level `difficulty` to `2`. Replace `difficulty_note`:**

```yaml
difficulty_note: >-
  The prompt identifies the missing baseline comparison: how well the two groups
  spoke Spanish before using the app. The remaining demands are choosing a
  baseline difference that weakens rather than strengthens the causal inference,
  and explaining its bearing on the later score gap. An unchanged observed gap
  weakens the evidence for a streak-caused advantage but does not prove that the
  streaks had no effect.
```

**In `accept`, replace the example beginning “the gap at the start was as large” with:**

> The gap at the start was as large as the later gap, making the later comparison less persuasive as evidence that the streaks produced the advantage.

**Replace rubric criterion 1:**

> Gives a new fact about the two groups’ Spanish when they began using Lingora, consistent with the premises, that provides a material reason to doubt that the streaks account for the later score gap.

**Replace the 2-point anchor:**

```yaml
- points: 2
  answer: >-
    Lingora uses comparable speaking assessments at sign-up and after a year.
    The eventual streak holders led the other group by the same average amount
    on both assessments. Because the observed gap did not grow, the later test
    comparison gives less support to the claim that the streaks produced the
    advantage.
  note: >-
    A baseline gap as large as the later gap weakens the causal interpretation
    of that later comparison. It does not establish that the streaks had no
    effect.
```

## arg-0021 — fix

### `arg-0021:assumption`

**Problem:** Money in the city’s **arts budget** is not established as necessary for renewal. Negate the reference: that budget is insufficient, but the council can renew the grant using a different authorized funding source. Every premise survives, and the claimed obstacle need not prevent renewal. The reference therefore imposes an unstated funding mechanism rather than identifying a necessary condition. The acceptance examples should concern actual barriers, not a particular account or a decision that could be reversed. premise-batch2-packet

**Replace `reference`:**

```yaml
reference: >-
  No binding funding restriction will prevent the council from renewing this
  museum's grant this year.
```

**Replace `accept`:**

```yaml
accept: >-
  Accept an unstated claim ruling out a particular obstacle that would prevent
  this museum's renewal this year if the claim were false. Examples include
  the absence of a binding funding restriction barring this renewal, the
  museum's satisfaction of any additional mandatory renewal condition, or the
  absence of an applicable policy making this museum ineligible. The stimulus
  does not make a particular budget the sole funding source. A relevant claim
  stronger than necessary earns 1, including a requirement for adequate money
  in a particular account or a general rule that every museum with rising
  attendance receives renewal. A premise or a restatement of the conclusion
  offered as the assumption earns 0.
```

**Replace rubric criterion 1:**

> States an unstated claim ruling out a particular obstacle to this museum’s renewal, such as a binding funding restriction or failure of another mandatory renewal condition, rather than a premise or a restatement of the conclusion.

Apply the premise-only disqualifier replacement printed under `arg-0019:assumption`.

## arg-0022 — fix

### `arg-0022:strengthen`

**Problems:** Rubric criterion 1 awards a point for mere relevance, including facts that make a sales increase less likely. The full-credit anchor also turns availability into guaranteed retention: being free on Thursday does not establish that customers would continue shopping or spending as much. The fact can strengthen the argument without supporting that certainty. premise-batch2-packet

**Replace rubric criterion 1:**

> Gives a new fact, consistent with the premises and not already stated in them, that materially increases support for the claim that moving Ardley’s market to Thursday evenings would raise its sales.

**Replace the 2-point anchor:**

```yaml
- points: 2
  answer: >-
    Nearly all of the Ardley market's regular Saturday shoppers are free on
    Thursday evenings. That makes it more likely that the market could retain
    its existing customers, so new evening shoppers could produce a net sales
    increase rather than merely replace lost Saturday trade.
  note: >-
    A different strengthener from the reference: it reduces a reason to expect
    losses among current shoppers. Availability supports retention but does
    not guarantee it.
```

## arg-0023 — fix

### `arg-0023:assumption`

**Problems:** The current 2-point anchor earns **1**, not 2. Negating it establishes that one family supplied most of the 2020 photographs; it does not establish that this distorted the **change between years**. The family could also supply most of the 2025 photographs, with comparable photographs per animal and a genuine population decline. The negation note silently adds a temporal distortion that the answer does not state. The behavior examples also need magnitude qualifications: some avoidance or range change is not automatically fatal. premise-batch2-packet premise-batch2-packet

**Replace `reference`:**

```yaml
reference: >-
  Changes in the lynx's use of the camera trails did not reduce photographs per
  animal enough to explain the drop from 120 to 58 without a substantial fall
  in the forest's lynx population.
```

**Replace `accept`:**

```yaml
accept: >-
  Accept an unstated claim whose denial would remove the link between the
  photograph decline and a substantial population decline while preserving
  the camera premises. Relevant bridges concern a sufficiently large reduction
  in photographs per animal, whether from changed trail use, movement within
  the forest, or a disproportionate contribution from repeatedly photographed
  animals in 2020 relative to 2025. A claim excluding one of these explanations
  must address its size and its effect on the comparison between years.
  Requiring no behavioral change at all, or excluding a family that supplied
  most of the 2020 photographs without addressing the comparison with 2025,
  is stronger than necessary and earns 1. A stated camera premise or a
  restatement of the population conclusion offered as the assumption earns 0.
```

**Replace the 2-point anchor:**

```yaml
- points: 2
  answer: >-
    Repeated photographs of lynx denning beside a camera did not inflate the
    2020 count relative to the 2025 count enough to explain the recorded drop
    without a substantial decline in the forest's lynx population.
  note: >-
    Negating this claim supplies a sufficiently large distortion of the
    between-year comparison, not merely a high repeat-photograph count in
    one year. The photograph decline would then cease to establish the
    claimed substantial population decline.
```

Apply the premise-only disqualifier replacement.

### `arg-0023:weaken`

**Problems:** The current 2-point anchor earns **1**, not 2. After removing 60 family photographs from 2020, the baseline is 60. A corrected 2025 count of **at most 58** could be 58, 8 or 0; “hardly a drop” does not follow. For example, if 50 of the 2025 photographs were of that family, removing them would leave a decline from 60 to 8. Rubric criterion 1 also lacks weakening direction. The 1-point hiking-route anchor should state the behavioral effect rather than depend on unstated knowledge of lynx behavior. premise-batch2-packet

**Replace rubric criterion 1:**

> Gives a new fact, consistent with the premises and not already stated in them, that provides a material reason to doubt that the photograph decline reflects a substantial decline in the forest’s lynx population.

**Replace the 2-point anchor:**

```yaml
- points: 2
  answer: >-
    Sixty of the 2020 photographs were of one lynx family denning beside a
    camera. In 2025 that same family still lived in the forest but denned away
    from all the cameras and was not photographed. Excluding that family in
    both years leaves 60 photographs in 2020 and 58 in 2025, so almost all of
    the recorded drop could reflect that family's relocation rather than
    fewer lynx.
  note: >-
    The comparable adjusted counts are 120 minus 60, or 60, and 58 minus 0,
    or 58: a decline of about 3.3 percent. This weakens the population inference;
    it does not establish that the population was unchanged.
```

**Replace the 1-point anchor:**

```yaml
- points: 1
  answer: >-
    A popular hiking route opened along most of the camera trails in 2022,
    and lynx have since begun avoiding those trails.
  note: >-
    Supplies a change that could reduce camera encounters, but does not explain
    why that makes the photograph decline less reliable evidence of a
    population decline.
```

## arg-0024 — fix

### `arg-0024:conclusion`

**Problem:** My difficulty estimate is **3**, not 4. The recommendation is explicitly stated at the opening, the opposing view is attributed, and the final intermediate conclusion is signposted. Distinguishing its supporting role and preserving “not oppose” requires care, but the task does not have the interacting complexity expected at level 4 under the packet’s own guidance. premise-batch2-packet premise-batch2-packet

**Exact replacements:** Set task `difficulty` to `3` and exercise-level `difficulty` to `3`.

### `arg-0024:assumption`

**Problems:** The reference is too strong. Negating it means the removed interior supplies **some additional information** about people’s lives or work—not necessarily information essential to the silo’s historical importance. The charter protects buildings; it does not explicitly require preserving every informative detail. The inference need not fail merely because a minor additional detail is lost. premise-batch2-packet

The current 2-point anchor also needs qualification. A rule or duty can be defeasible or outweighed; its existence alone does not establish that the society must oppose this conversion. Under the stated negation gate, I would give the unqualified anchor **1**, not 2. premise-batch2-packet

**Replace `reference`:**

```yaml
reference: >-
  None of the interior features the conversion would remove is indispensable
  to the silo's historical importance under the society's charter.
```

**Replace `difficulty_note`:**

```yaml
difficulty_note: >-
  Two links are available: from retaining the walls and machinery to preserving
  the silo's charter-relevant historical importance, and from that preservation
  to the recommendation not to oppose the plan. Losing some additional
  historical information need not destroy that importance, and a competing
  consideration need not be an overriding obligation to oppose the plan.
  Necessary assumptions must address what would defeat one of these links,
  not require preservation of every informative detail or absence of every
  competing consideration.
```

**Replace `accept`:**

```yaml
accept: >-
  Accept an unstated claim whose denial would break either the preservation
  inference or the recommendation based on it. Relevant bridges include that
  the removed interior features are not indispensable to the silo's
  charter-relevant historical importance, or that the society has no overriding
  obligation to keep this particular silo unaltered even when its historical
  importance would be preserved. Do not require that the interior supplies
  no additional information or has no value of any kind. Do not treat every
  competing duty as an automatic veto. Relevant claims stronger than necessary
  earn 1. A stated premise, the stated intermediate conclusion, or the main
  recommendation offered as the assumption earns 0.
```

**Replace `rubric`:**

```yaml
rubric:
  - States an unstated claim about the importance of the removed features or an obligation bearing on opposition that bridges one of the argument's two inferences, rather than a premise or either stated conclusion.
  - Limits the claim to what the inference requires, so that its denial would defeat the claimed preservation of historical importance or introduce an overriding obligation to oppose this plan, rather than merely establish some lost information or a competing consideration.
```

**Replace the 2-point anchor:**

```yaml
- points: 2
  answer: >-
    The society has no binding, overriding obligation to keep the county's
    last wooden silo exactly as it stands.
  note: >-
    If false, an overriding obligation to preserve this silo unaltered would
    defeat the recommendation even if the conversion preserved its historical
    importance. A merely defeasible preference or duty would not establish
    that result.
```

Apply the premise-only disqualifier replacement.

## arg-0025 — keep

## arg-0026 — fix

### `arg-0026:strengthen`

**Problems:** The reference multiplies a share of discarded plastic by a reduction in the **number of bags issued**. Those are not necessarily comparable quantities: bag weight and the relationship between local shop distribution and local household disposal can change. The reported 80 percent count reduction does not establish an 80 percent reduction in household bag-waste weight. “Amount” should also be specified because the replacement-bag anchors rely on weight. premise-batch2-packet premise-batch2-packet

Rubric criterion 1 again admits opposite-direction evidence. The full-credit anchor also overstates its controls: unchanged sales of two replacement categories do not establish that no replacement plastic increased. premise-batch2-packet

**Replace the shared stimulus’s final sentence:**

> The town’s environmental officer concludes that the fee has greatly reduced the total weight of plastic that Brannock’s households throw away each year.

**Replace `reference`:**

```yaml
reference: >-
  Before the fee, checkout bags accounted for about one third, by weight, of
  the plastic Brannock households discarded. That makes a large reduction in
  checkout-bag waste potentially important to the total. An 80 percent reduction
  in this component's weight, without offsetting replacement plastic, would
  reduce the original total by about 27 percent. The reported reduction in
  bags issued does not itself establish that same reduction in waste weight.
```

**Replace `difficulty_note`:**

```yaml
difficulty_note: >-
  The premise measures the number of checkout bags issued by local shops;
  the conclusion concerns the annual weight of all plastic discarded by local
  households and attributes a large reduction to the fee. A strengthener may
  support the quantity link, the household-disposal link, the bags' importance
  in total waste, absence of replacement plastic, or causation. Multiplying
  one third by 80 percent gives about 27 percent only if the relevant bag-waste
  weight falls by 80 percent.
```

**Replace rubric criterion 1:**

> Gives a new fact, consistent with the premises and not already stated in them, that materially strengthens the claim that the fee caused a large reduction in the annual weight of plastic discarded by Brannock households.

**Replace the 2-point anchor:**

```yaml
- points: 2
  answer: >-
    Most Brannock shoppers now bring cloth bags, and the town's sales of plastic
    bin liners and food bags haven't gone up. These facts make a compensating
    increase in the named replacements less likely, strengthening the case
    that fewer checkout bags meant less plastic waste.
  note: >-
    Reduces a replacement-plastic explanation without claiming that every
    possible replacement has been ruled out or that a large total reduction
    has been proved.
```

### `arg-0026:weaken`

**Problems:** The reference should distinguish the maximum **direct contribution of eliminating bag waste** from the fee’s possible total effect. In addition, the supermarket example is not necessarily an independent alternative cause: a supermarket might stop offering bags **because of the fee**, in which case its decision is part of the fee’s effect. Rubric criterion 1 again needs weakening direction. premise-batch2-packet

**Replace `reference`:**

```yaml
reference: >-
  Before the fee, checkout bags made up only about 2 percent, by weight, of
  Brannock households' discarded plastic. Even eliminating that category
  entirely could directly remove only 2 percent of the original total.
  Therefore the fall in bags issued provides little support for a great
  reduction in total household plastic-waste weight.
```

**In `accept`, replace the supermarket example with:**

> An independent change reduced bag distribution—for example, the largest supermarket stopped offering bags under a chain-wide policy adopted before the local fee and which would have taken effect without it. Merely saying that the supermarket stopped offering bags in the same month does not establish an alternative cause; its decision could have resulted from the fee.

**Replace rubric criterion 1:**

> Gives a new fact, consistent with the premises and not already stated in them, that provides a material reason to doubt that the fee caused a large reduction in the annual weight of plastic discarded by Brannock households.

## arg-0027 — fix

### `arg-0027:assumption`

**Problems:** The current 2-point anchor earns **1**, not 2. It excludes early use of the mark by **every mill selling to Tarrant**, including suppliers that did not make this sheet. Another supplier could have used the mark in 1788 without defeating a dating inference correctly tied to this particular sheet’s manufacture at Holt. The necessary bridge must concern the actual sheet, not every possible supplier. premise-batch2-packet

The rubric also tests the wrong boundary: the conclusion is **1801 or later**, not merely “not 1788.” Paper dating from 1790 would already defeat the proposed paper-based 1801 lower bound. This is a boundary error in the test, not a claim that every necessary assumption must independently prove the entire conclusion. premise-batch2-packet premise-batch2-packet

**Replace `difficulty_note`:**

```yaml
difficulty_note: >-
  The inference links the particular sheet's watermark to Holt's production
  chronology, then uses the paper's manufacture to set a lower bound on the
  letter's writing. The relevant boundary is 1801, not merely a date later
  than 1788; 1801 minus 1788 is thirteen years. Restrictions on all suppliers
  or all watermark users are stronger than restrictions on the actual sheet.
```

**Replace `accept`:**

```yaml
accept: >-
  Accept an unstated claim whose denial would defeat the use of Holt's
  production chronology to establish an 1801-or-later lower bound for this
  particular sheet and hence for the letter's writing. Relevant claims concern
  this sheet's Holt provenance or exclude an earlier origin for this sheet
  at another maker using a running-hare mark. The denial need not establish
  that the letter really was written in 1788; it must defeat the cited dating
  inference. Excluding early use by every supplier to Tarrant, including
  suppliers that did not make this sheet, is stronger than necessary and
  earns 1. A stated production-date premise or a restatement of the letter's
  writing-date conclusion offered as the assumption earns 0.
```

**Replace rubric criterion 2:**

> States the claim no more strongly than this dating inference requires, so that its denial would defeat the use of Holt’s 1801 start date to establish the lower bound for this sheet, without imposing unnecessary restrictions on unrelated makers or suppliers.

**Replace the 2-point anchor:**

```yaml
- points: 2
  answer: >-
    The letter's sheet is not paper made before 1801 by another papermaker
    who also used a running-hare mark.
  note: >-
    Negation gives this actual sheet an earlier, non-Holt origin, making
    Holt's start date inapplicable to its manufacture. The letter could still
    have been written later on older paper, but this paper-based dating
    inference would fail. Unlike the reference, this answer does not require
    that the sheet came from Holt; it excludes the relevant earlier origin.
```

Apply the premise-only disqualifier replacement.

### `arg-0027:strengthen`

**Problems:** The current 2-point anchor earns **1**, not 2. A bridge’s opening date is not necessarily its construction date, and a letter can mention a bridge while it is planned or being built. “Mentions the new bridge” therefore does not license the claimed 1806 lower bound. The acceptance example similarly needs to distinguish describing a later event as completed from merely mentioning it. Rubric criterion 1 also admits evidence for an earlier date. premise-batch2-packet

**Replace the separate-evidence example in `accept`:**

> Separate evidence of a later date, such as the letter describing a documented post-1800 event as having already occurred, or the ink used to write the letter’s text first being produced after 1800. Merely mentioning a project that was completed later does not establish that the letter postdates its completion.

**Replace rubric criterion 1:**

> Gives a new fact, consistent with the premises and not already stated in them, that materially increases support for dating the letter’s writing to 1801 or later.

**Replace the 2-point anchor:**

```yaml
- points: 2
  answer: >-
    The letter describes the Tarrant bridge's public opening as an event that
    has already occurred, and independent town records date that opening to
    1806. This is separate evidence for writing in 1806 or later, supporting
    the curator's conclusion without relying on the watermark.
  note: >-
    The relevant evidence is a retrospective description of a dated event,
    not merely a mention of a bridge that opened later.
```

## arg-0028 — fix

### `arg-0028:assumption`

**Problems:** The reference excludes every other way of learning about the **delay**, whereas the code concerns learning about **wrongdoing**. Negate the reference: the public can already learn that repairs were postponed, but only the memo reveals the officials’ knowledge and circumstances that make the postponement wrongful. The cited rule can still apply. The reference is therefore too strong. premise-batch2-packet premise-batch2-packet

The current 2-point anchor also earns **1** under a literal negation test: “wrongdoing” and “no good reason” are not equivalent. A reason favoring delay can exist yet be outweighed by stronger reasons against it. Negating the complete anchor need not negate wrongdoing. Finally, failure of one sufficient publishing rule removes **that rule’s justification**; it does not establish that the whole code supplies no other justification. premise-batch2-packet

**Replace `reference`:**

```yaml
reference: >-
  The public could not otherwise learn that officials knowingly left the
  faulty alarms unrepaired for those six months in circumstances that made
  the delay wrongful.
```

**Replace `difficulty_note`:**

```yaml
difficulty_note: >-
  The editor invokes a sufficient publishing rule whose conditions concern
  public-official wrongdoing and the public's inability to learn that
  wrongdoing another way. Learning a repair schedule is not necessarily
  learning wrongdoing. An adequate justification would defeat the wrongdoing
  condition, but the existence of some reason favoring delay need not do so.
  Failure of a condition defeats this rule's application, not every possible
  justification for publication.
```

**Replace `accept`:**

```yaml
accept: >-
  Accept an unstated claim whose denial would defeat the editor's application
  of the cited publishing rule while preserving the premises. Relevant claims
  include that the conduct described constitutes wrongdoing, that the public
  has no other way to learn that wrongdoing, or that the relevant officials
  are public officials. Distinguish otherwise learning the wrongdoing from
  otherwise learning isolated facts about the alarms or repair schedule.
  A relevant claim stronger than necessary earns 1, including that no
  alarm-related information is otherwise available, that every repair delay
  is wrongdoing, or that there was no reason at all favoring delay. A stated
  premise or a restatement of the publication conclusion offered as the
  assumption earns 0. Failure of a condition removes the cited rule's
  justification; it does not establish that publication is forbidden or
  that no other provision could justify it.
```

**Replace `rubric`:**

```yaml
rubric:
  - States an unstated claim about whether the memo reveals public-official wrongdoing or whether the public can learn that wrongdoing another way, rather than a premise or a restatement of the conclusion.
  - States the claim no more strongly than needed for this rule's application, so that its denial defeats a condition of the cited rule rather than merely establishing another source of some alarm-related information or a consideration favoring delay.
```

**Replace the 2-point anchor:**

```yaml
- points: 2
  answer: >-
    In the circumstances, the officials' decision to postpone those repairs
    constituted wrongdoing.
  note: >-
    Negation removes the wrongdoing condition needed for the editor's
    application of the cited rule. It does not establish that publication
    would be impermissible under every possible provision.
```

**Replace the 1-point anchor’s note:**

> Too strong: the public could already know some facts about the alarms or repair schedule while the memo alone reveals the officials’ wrongdoing. Exclusive access to every alarm-related fact is unnecessary.

Apply the premise-only disqualifier replacement.

### `arg-0028:weaken`

**Problems:** The reference and 1-point anchor again equate disclosure of a postponement with disclosure of the wrongdoing revealed by the memo. The full-credit anchor treats an unused, closed school as conclusive proof that the delay was not wrongful, although the stimulus supplies no such definition of wrongdoing. Closure can support a possible innocent explanation without settling the issue. The explanations must also distinguish defeating the cited rule from establishing what the entire code does or does not require. premise-batch2-packet

**Replace `reference`:**

```yaml
reference: >-
  A publicly available city report already discloses the same facts about the
  officials' knowledge, the six-month delay and the circumstances making it
  wrongful that the memo reveals. The public therefore has another way to
  learn this wrongdoing, so the editor cannot use the cited rule's
  otherwise-unavailable-information condition to justify publishing the memo.
```

**Replace `difficulty_note`:**

```yaml
difficulty_note: >-
  A weakener can give a reason to doubt either wrongdoing or the absence of
  another way for the public to learn that wrongdoing. Disclosure of a repair
  schedule alone need not disclose wrongdoing. A possible justification for
  delay can weaken without proving innocence. Defeating a condition removes
  the cited rule's support, not every possible reason to publish.
```

**Replace `accept`:**

```yaml
accept: >-
  Accept a new fact consistent with the premises that materially weakens the
  editor's application of the cited rule, together with an explanation.
  Relevant facts may show that the public can otherwise learn the same
  wrongdoing revealed by the memo, or provide a plausible justification
  making it less likely that the delay was wrongdoing. A public announcement
  of a repair schedule need not reveal the same wrongdoing. School closure
  or alternative protection may support a possible justification, but should
  not be treated as automatically establishing that no wrongdoing occurred.
  Harm or embarrassment from publication alone does not address the cited
  rule's conditions. A qualifying fact without explanation earns 1; a fact
  contradicting a premise earns 0. The answer need not establish that
  publication is forbidden or unjustified under every possible code provision.
```

**Replace `rubric`:**

```yaml
rubric:
  - Gives a new fact, consistent with the premises, that provides a material reason to doubt that the memo reveals wrongdoing which the public has no other way to learn about.
  - Explains how that fact weakens the editor's application of the cited publishing rule, without inferring that failure of this sufficient rule necessarily forbids publication.
```

**Replace the 2-point anchor:**

```yaml
- points: 2
  answer: >-
    The school was unused and closed for rebuilding throughout those six
    months, and the alarm repairs were completed before it reopened. This
    gives a possible innocent explanation for the timing, making it less
    certain that the postponement was wrongdoing and weakening the editor's
    application of the cited rule.
  note: >-
    Weakens the wrongdoing inference without treating closure as conclusive
    proof of innocence or claiming that the entire code forbids publication.
```

**Replace the 1-point anchor:**

```yaml
- points: 1
  answer: >-
    A publicly accessible council report already gives the same account of
    the officials' knowledge, delay and wrongdoing that the memo gives.
  note: >-
    Supplies another public source of the same wrongdoing but does not
    explain why that weakens the editor's application of the cited rule.
```

## Pattern to change in later batches

The principal problem is that several negation notes test a **cleaned-up intended meaning rather than the actual answer**. Negating “no additional information” establishes some additional information, not loss of essential historical importance. Negating “no other supplier used the mark” establishes another supplier, not an earlier origin for this sheet. Negating a sentence containing two claims can falsify either claim—not just the one the note discusses. Write the literal negation first, then test whether the specified inference really fails.

The strengthen/weaken keys need a consistent separation between **a relevant fact, evidence in the requested direction, and proof**. Make the evidence criterion directional. State controls explicitly. Do not turn availability into attendance, an unchanged score gap into no causal effect, school closure into innocence, or a coincident business decision into an independent cause.

Finally, check the units, populations, dates and logical objects before writing arithmetic or exclusion notes. Bags issued are not household waste weight; an opening date is not a construction date; a corrected count “at most 58” does not establish a small decline; and public knowledge of a delay is not necessarily public knowledge of wrongdoing. Scope premise-only disqualifiers to premise-only answers, and lower difficulty when the prompt itself identifies the missing comparison.

---

## Triage

Nine exercises were marked "fix" and arg-0025 "keep". Every finding is accepted. Three things apply across the batch:

- Wording follows the content's plain style, and the reviewer's proposed anchors are rephrased as answers a student might write; the substance is the review's. Where the rewording changes a proposal's shape, the row says how.
- The directional first criterion the review asks for in several strengthen and weaken tasks is applied to every strengthen and weaken task in the batch (arg-0022's weaken and arg-0025's weaken were already directional).
- The premise-only disqualifier keeps an exercise-specific example in each task.

| # | Task | Finding | Decision | Change |
| --- | --- | --- | --- | --- |
| B2-1 | all six assumption tasks | The disqualifier can zero an answer that mentions a stated claim while also giving a valid assumption. | accepted | Each disqualifier now caps only an answer that offers nothing but a premise, a stated conclusion or a restatement, and says that mentioning a stated claim does not trigger it. |
| B2-2 | arg-0019.strengthen | The reference implies same-farm fields share seed and equipment without stating it. | accepted | The reference states that the fields got the same seed, fertilizer and irrigation. |
| B2-3 | arg-0019.strengthen | Criterion 1 credits any relevant fact, including one pointing the wrong way. | accepted | Criterion 1 requires a fact that makes the conclusion more likely. |
| B2-4 | arg-0020.flaw | The key treats total practice as fixed, but the stimulus matches only hours on the app. | accepted | Note and `accept` say what is matched (time on the app, hours on it, no outside classes) and credit informal practice outside the app as an open alternative. |
| B2-5 | arg-0020.weaken | The prompt names the missing baseline, so difficulty 3 is too high. | accepted | Task and exercise difficulty 2; new difficulty note. |
| B2-6 | arg-0020.weaken | Criterion 1 admits a starting deficit; an unchanged gap is read as proof the streaks did nothing. | accepted | Directional criterion 1; the `accept` example and the 2-point anchor say an unchanged gap weakens the causal reading without proving no effect. |
| B2-7 | arg-0021.assumption | The arts-budget reference fails negation: the grant could come from another source. | accepted | Reference: no lack of money or binding spending limit will stop renewal. `accept` and criterion 1 name actual obstacles; a particular account is now a 1-point example. The reviewer's "binding funding restriction" is reworded. |
| B2-8 | arg-0022.strengthen | Criterion 1 is not directional; the 2-point anchor turns being free on Thursdays into keeping every customer. | accepted | Directional criterion 1; the anchor says keeping current shoppers becomes more likely, and its note that it is not guaranteed. |
| B2-9 | arg-0023.assumption | The 2-point anchor earns 1: a family dominating the 2020 count says nothing about 2025; behavior claims need a size. | accepted | New reference (photographs per animal did not fall enough to explain the drop), `accept`, rubric and 2-point anchor (repeat photographs did not distort the comparison between years); the old anchor's claim is a 1-point example. |
| B2-10 | arg-0023.weaken | The 2-point anchor earns 1 ("at most 58" allows a large drop); criterion 1 is not directional; the 1-point anchor relies on outside knowledge of lynx. | accepted | New 2-point anchor (the family was not photographed in 2025: 60 against 58), directional criterion 1, and a 1-point anchor that states the lynx avoid the trails. |
| B2-11 | arg-0024.conclusion | Difficulty 4 is too high: the recommendation opens the argument and the rival is signposted. | accepted | Task and exercise difficulty 3. |
| B2-12 | arg-0024.assumption | The reference is too strong (any extra detail lost would falsify it); the 2-point anchor needs the duty to be overriding. | accepted | New reference (nothing removed is essential to the silo's importance under the charter), difficulty note, `accept`, rubric and 2-point anchor ("overriding duty"). The note and `accept` add that saying the conversion preserves the silo's importance is the intermediate conclusion. |
| B2-13 | arg-0026 stimulus, strengthen | The reference multiplies a share of waste by a cut in bags handed out; "amount" should be weight; criterion 1 is not directional; the anchor overstates its controls. | accepted | The conclusion is now about the total weight thrown away each year. The reference is conditional on bag waste falling in line, with no replacement. The difficulty note is new, criterion 1 is directional, the 2-point anchor is softened and the 1-point anchor says "by weight". The reviewer's closing caveat in the reference is folded into the condition. |
| B2-14 | arg-0026.weaken | The reference should be about the direct contribution; the supermarket example may be the fee's own effect; criterion 1 is not directional. | accepted | New reference (removing bags entirely could remove only 2 percent), an independent chain-wide policy as the example with a warning about same-month decisions, directional criterion 1. |
| B2-15 | arg-0027.assumption | The 2-point anchor earns 1 (it restricts every supplier, not this sheet); the rubric tests 1788 instead of the 1801 boundary. | accepted | New 2-point anchor about this sheet, `accept` bridges about this sheet, criterion 2 on the 1801 lower bound, new difficulty note; restricting every supplier is a 1-point example. |
| B2-16 | arg-0027.strengthen | Mentioning a bridge does not date a letter after the bridge opened; criterion 1 is not directional. | accepted | The 2-point anchor has the letter describe the opening as past; `accept` example rewritten; directional criterion 1. |
| B2-17 | arg-0028.assumption | The reference concerns learning of the delay, not of the wrongdoing; "no good reason" is not the same as wrongdoing; a failed condition removes one rule, not the whole code. | accepted | New reference and 2-point anchor (the delay was wrongdoing in the circumstances), difficulty note, `accept` (adds the public-officials bridge and that "the memo is genuine" earns 0), rubric, and the 1-point anchor's note. |
| B2-18 | arg-0028.weaken | The reference and 1-point anchor equate disclosure of the delay with disclosure of wrongdoing; the 2-point anchor treats closure as proof of innocence. | accepted | New reference and anchors, difficulty note, `accept` and rubric; criterion 2 no longer needs the answer to say the code forbids publishing. |

### Carried forward

The review's patterns also apply to published batch 1 exercises. Four of their assumption tasks use the unscoped disqualifier: arg-0010, arg-0011, arg-0013 and arg-0015. Eight strengthen and weaken tasks have a criterion 1 that is not directional: arg-0009, arg-0010, arg-0012 (both tasks), arg-0014, arg-0015, arg-0016 and arg-0018. Changing them needs the owner's re-approval, so they are left for a separate change. Pro's patterns for later batches are recorded with the content-batch notes and will go into `CONTENT_GUIDELINES.md` with batch 1's after PR #3 lands.
