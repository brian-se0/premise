# Peer consultation: difficulty and the final-weeks niche

## 1. Role and ask

You are the same senior reviewer who reviewed the Premise specs in three rounds. This is not a spec review. The owner has a product question and asked for your independent judgment. Please challenge our current direction where you disagree.

## 2. What happened

The owner (who has not yet started studying for the exam) did the first exercise in the material below, `arg-0001`. Task A asks for the main conclusion. The answer was the stimulus's last sentence, which also begins with the author's recommendation. The owner wrote:

> "oh so all i had to do was copy and paste one sentence from your original problem statement. that was so easy i overthought it. should a question as easy to answer really something we ask? would it be maximally helpful during the 'clutch' moments leading up to the exam? this is the niche we're focusing on."

Note the framing: the owner now describes the niche as **the final stretch before the exam** ("clutch moments"), when a student already knows the basics and wants the highest-value practice. The spec so far does not say this; it describes a general free-response reasoning trainer, first for the owner's own study. Settled constraints still hold: no official questions or test branding; original or public-domain arguments; the student writes answers that a chatbot grades against a rubric by copy and paste; a static app; students take official practice tests elsewhere (LawHub) to measure progress.

## 3. Our current thinking (please critique)

1. The owner is right that `arg-0001`'s conclusion task is too easy: the conclusion is last and signposted. Real exam arguments make the conclusion hard to find (placed mid-passage, after a concession, unmarked, with an intermediate conclusion or an opposing view that looks like the conclusion). `arg-0008` in the material is one attempt at that.
2. We lean towards keeping the conclusion skill only in its hard forms, because finding the conclusion is the first step of every other argument task and the step people get wrong under time pressure, and dropping signposted ones entirely.
3. For a final-weeks niche, we suspect the highest-value work is: hard arguments only; the skills that carry the most weight (flaw, necessary assumption, then strengthen and weaken); writing the answer before seeing choices ("prephrasing"); timed attempts; and immediately reviewing the specific gap the student missed. We are less sure whether free-response writing is the right tool at all in the last weeks, versus earlier in study.

## 4. Questions

1. Is "final weeks before the exam" a sound niche for this product, or does free-response reasoning practice pay off mainly earlier? If the niche is right, what should change in the product (task mix, difficulty floor, timing, session length, feedback)? If not, what niche fits the product better?
2. Should the conclusion task stay? If yes, in what form and at what difficulty? If no, what replaces it?
3. What makes an original argument genuinely hard in the way the real exam is hard, so that authors can write to a difficulty target? Please give concrete, checkable design rules (for example where the conclusion sits, distractor claims, subtle quantifiers, scope shifts), not general advice.
4. Rate each of the 8 exercises below for difficulty relative to real exam arguments (easy / medium / hard) and say in one line what would make each one harder. Flag any that are not worth keeping.
5. Anything else that would make the product "maximally helpful" to a student in the clutch period, within the settled constraints.

## 5. Response format

Answer the five questions in order, with a short verdict first for each. Be concrete. Then give one paragraph: what you would change in the spec and roadmap first.

## 6. Material


---

### File: docs/SPEC.md (sections 1 to 5)

````
# Product Spec

Status: draft v0.4 (2026-10-04, revised after peer review round 3). Working name: **Premise** (placeholder; see Open questions).

## 1. Purpose

Premise is a free, open-source trainer for the reasoning skills tested by law school admission exams. Students read short arguments and passages, **write** their analysis in their own words, and have it graded by any AI chatbot they already use, or grade it themselves against a rubric. The app tracks results and schedules reviews.

It does not simulate the official test. Students keep taking official practice tests elsewhere (LawHub) to measure progress. Premise trains the step those tests don't: producing the answer before seeing the choices. Whether this transfers to better test scores is a hypothesis the owner's own use will test, not a promise.

## 2. Users

- **Primary (first release):** the project owner, studying for the exam, on a phone and a Windows PC.
- **Later:** other self-studying test takers comfortable copying and pasting between apps.

## 3. Hard constraints

1. **No official content.** No LSAC questions, passages, explanations or paraphrases, and no prep-company content. See `CONTENT_GUIDELINES.md`.
2. **No test branding.** The name, logo, UI and marketing do not use "LSAT" or LSAC marks.
3. **No server.** Static site. No accounts, backend, AI API calls or analytics.
4. **Privacy.** Premise does not upload answers or progress; it stores them on the device and only downloads its own app files. When the student pastes a grading prompt into another service, that service receives the answers under its own terms. This is said plainly before the first copy, from the first release that can copy.
5. **Licenses.** Code: AGPL-3.0-only. Content the project can license (`content/`): CC BY-NC-SA 4.0; public-domain and CC BY source text keeps its own status.

## 4. Core concepts

| Term | Meaning |
| --- | --- |
| Exercise | One stimulus (an argument or passage) plus one or more tasks. |
| Task | One question about a stimulus, with a reference, acceptance notes, anchors and a rubric. Id: `<exercise-id>.<task-key>`. The unit of scheduling. |
| Attempt | A student's answer to one task: draft, submitted, or skipped. Coached attempts (redo after feedback) are labeled and don't count as reviews. |
| Grading request | A frozen bundle of submitted attempts sent for grading together, with its own id. |
| Grading | The accepted score and tags for one attempt, from a chatbot reply, manual entry, or self-grading. Can be "needs review". |
| Card | The spaced-repetition state of one task. |

## 5. User flows

### 5.1 Practice

1. Home offers **Today** (due reviews plus a few new tasks, mixed), **New only** (filter by skill and difficulty), or one exercise from the Library.
2. A session is an explicit ordered list of tasks, grouped by stimulus for display. Tasks of the same exercise that were not selected are not shown and not scheduled.
3. Reviews are mixed with new tasks practising the same skill. New tasks are drawn first from exercises the student has never seen, so they meet new arguments, not only remembered ones. A new task on an already-seen stimulus is allowed when nothing unseen remains, and is recorded as **familiar stimulus**. A stimulus counts as seen once any of its tasks has been shown, whatever happened to that task afterwards.
   The automatic planner never puts two tasks from the same exercise on the same day unless both are due. Opening an exercise from the Library is the student's explicit choice and may include several of its tasks.
4. All selected tasks for a stimulus are answered before any reference, feedback or grading for that stimulus is revealed.
5. Answers autosave as drafts with a visible "Saved" state. The student can submit an answer, submit it blank on purpose, or skip it. Submitted answers cannot be edited; trying again makes a new attempt. Skipping ends that task for the session. Leaving and returning resumes at the same task with drafts intact.
6. The student can stop after any exercise; submitted answers are kept for grading. A task can be suspended from its menu.
7. Grading mode: **batch** (default; grade at the end, up to the batch size, default 4) or **per exercise** (grade after each exercise's tasks).

### 5.2 Grade

1. The Grade screen lists the submitted answers and offers **Copy for grading** and **Grade it myself**. Either one first saves the frozen grading request (more than one if the answers don't fit in one prompt). Each answer belongs to one request only.
2. Copying puts the request's prompt on the clipboard; copying again gives the same prompt. If the clipboard write fails, the prompt appears in a selectable box. Requests with any row still waiting for a grade, including "needs review" rows, appear in an **Awaiting grading** list on Home and can be resumed any time.
3. Links open common chatbots in a new tab. Links never carry the prompt.
4. The student pastes the chatbot's whole reply. The app shows, per row: the score or the reason it is invalid, the tags, and the matched feedback. Warnings and the full raw reply are one tap away.
5. Before confirming, a full-credit row can be marked "That was hard" or "Too easy".
6. **Confirm** saves valid rows exactly once and schedules them. Invalid, missing or "needs review" rows stay unresolved; the student can re-paste, enter a score manually, or self-grade them. Confirming twice, from two tabs, or after the grade was undone never schedules a task twice.
7. After confirming, each result shows the feedback, a **Try again** option for missed tasks (a coached attempt, not scheduled), **Flag** for an unfair grade or a content problem (saved with a category and note, and included in exports), and **Correct grade** for the latest grade of that task.
8. A confirmed task is not offered again before the next day, even if it is due, so the student is not re-tested on an answer they just read.
9. **Discard** abandons rows that are still waiting, or the whole request: those answers count for nothing; confirmed grades are kept.

### 5.3 Review

Due cards are shown with a count on Home. A review re-presents the task as a new attempt; the previous answer and feedback stay hidden until the new answer is submitted.

### 5.4 Progress

- Per skill, shown separately:
  - **First attempts**: one per task, the first uncoached submission; "full credit on X of Y tasks", split into new-stimulus and familiar-stimulus tasks, with their difficulty mix. A discarded first submission uses up the task's first attempt and is excluded.
  - **Reviews**: "full credit on X of Y review attempts, across Z tasks".
- Pending, needs-review, coached and discarded attempts are excluded from results.
- Error tags from the last 30 days, presented as "things to look at" with links to the tasks, not as a diagnosis.
- Counts: tasks attempted, due today, and "stable" (scheduled interval of 21 days or more).

### 5.5 Data

- Export one JSON file with everything, including content snapshots.
- Import replaces all data after a preview and an offer to export the current data first.
- Prompt for the first export after the first graded request; remind when the last export is more than 7 days old and there is new activity.
````


---

### File: docs/EXERCISE_FORMAT.md (section 5, skills)

````
## 5. Skills (v1)

| Skill | Kind | Open-ended | Prompt wording |
| --- | --- | --- | --- |
| `conclusion` | argument | no | State the argument's main conclusion in one sentence. Give the conclusion only, not the reasons for it. |
| `assumption` | argument | yes | State an assumption the argument needs: a claim that, if false, would make the argument fall apart. (A necessary assumption; it need not make the argument airtight.) |
| `flaw` | argument | no | Describe the main reasoning error in one or two sentences. |
| `weaken` | argument | yes | Give a new fact that, if true, would materially weaken the argument, and explain how. Treat the stated premises as true. |
| `strengthen` | argument | yes | Give a new fact that, if true, would materially strengthen the argument, and explain how. Treat the stated premises as true. |
| `principle` | argument | yes | State a general rule that, together with the stated facts, would justify the conclusion. Restating the conclusion does not count. |
| `main-point` | passage | no | State the passage's main point in one sentence. |
| `structure` | passage | no | Give the role of each paragraph in a few words each. |
| `attitude` | passage | no | Describe the author's attitude toward the named subject, citing one phrase. |

For open-ended skills, the reference is illustrative. `accept` describes the logical properties every correct answer shares, and the anchors should include at least one full-credit answer that differs from the reference.
````


---

### File: content/taxonomy.yaml

````
# Controlled vocabulary for skills and error tags. Schema version 2.
# Adding or renaming an entry is a content-contract change: record it in docs/DECISIONS.md.
# Ids are kebab-case and never reused with a different meaning.
# Error tags describe errors observed in an answer; they are navigation aids, not measurements.

skills:
  conclusion:
    label: Identify the main conclusion
    open_ended: false
  assumption:
    label: State a necessary assumption (one the argument needs; it need not make the argument airtight)
    open_ended: true
  flaw:
    label: Describe the reasoning error
    open_ended: false
  weaken:
    label: Give a fact that materially weakens the argument, premises taken as true
    open_ended: true
  strengthen:
    label: Give a fact that materially strengthens the argument, premises taken as true
    open_ended: true
  principle:
    label: State a general rule linking the stated facts to the conclusion (not a restatement of it)
    open_ended: true
  main-point:
    label: State a passage's main point
    open_ended: false
  structure:
    label: Describe the role of each paragraph
    open_ended: false
  attitude:
    label: Describe the author's attitude
    open_ended: false

error_tags:
  # Reading the stimulus
  premise-as-conclusion: Gave a premise or sub-conclusion instead of the main conclusion
  counterpoint-as-conclusion: Gave the view the author argues against
  misread-stimulus: Misstated what the text says
  # Precision
  overstated: Answer claims more than the text supports (too strong)
  understated: Answer is too weak or vague to do the job
  scope-shift: Answer is about a different group, term or claim than the argument
  # Logic
  reversed-logic: Confused sufficient and necessary, or reversed the direction
  correlation-causation: Treated correlation or sequence as causation, or missed that flaw
  missed-alternative: Missed an alternative explanation or possibility
  unrepresentative-sample: Treated evidence from an unrepresentative group as speaking for the whole, or missed that flaw
  part-to-whole: Assumed what is true of each part is true of the whole (or the reverse), or missed that flaw
  attacks-source: Rejected a claim because of who made it rather than its merits, or missed that flaw
  wrong-gap: Identified a gap the argument does not rely on
  irrelevant: Answer does not bear on the argument's support
  contradicts-premise: Answer depends on denying a stated premise
  restates-conclusion: Answer restates the conclusion instead of linking facts to it
  # Passages
  detail-as-main-point: Gave a detail instead of the main point
  wrong-role: Misdescribed what a paragraph or claim does
  wrong-tone: Misjudged the author's attitude or its strength
  # Form
  incomplete: Did not answer every part of the task
  no-reasoning: Gave an answer without the requested explanation
````


---

### File: content/exercises/arg-0001.md

````
---
schema: 3
id: arg-0001
status: draft
kind: argument
difficulty: 2
topics: [education, policy]
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
  notes: Stimulus, references, anchors and rubric drafted by Claude; awaiting human review and edits.
approved_by: null
approved_at: null
approved_revision: null
tasks:
  - key: conclusion
    status: active
    skill: conclusion
    prompt: State the argument's main conclusion in one sentence. Give the conclusion only, not the reasons for it.
    max: 2
    reference: >-
      Harlow's school board should not adopt the four-day school week.
    accept: >-
      Any wording that says Harlow (or its school board) should not adopt, or should reject, the four-day week.
    disqualifiers:
      - States the opposite recommendation (that Harlow should adopt the four-day week).
    rubric:
      - Names the recommendation about Harlow's schedule, not a premise or the evidence about other districts.
      - States only that recommendation, without folding in premises or adding claims the author does not make.
    anchors:
      - points: 2
        answer: Harlow shouldn't switch to a four-day school week.
      - points: 1
        answer: Harlow shouldn't adopt the four-day week because reading scores fell in neighboring districts.
        note: right conclusion, but a premise is folded in
      - points: 0
        answer: Districts that moved to four-day weeks saw reading scores fall.
        note: a premise, not the conclusion
    likely_errors: [premise-as-conclusion, counterpoint-as-conclusion, overstated]
  - key: flaw
    status: active
    skill: flaw
    prompt: Describe the main reasoning error in one or two sentences.
    max: 2
    reference: >-
      The argument concludes that the four-day week caused the drop in reading scores just because the drop
      followed the switch, without ruling out other causes; for example, the money problems that led districts
      to cut costs might themselves have hurt learning.
    accept: >-
      Any answer that identifies treating "scores fell after the switch" as proof that the switch caused the fall,
      and says why that does not follow. Naming a specific alternative cause, or a relevant way Harlow may differ
      from its neighbors, is one way to say why, but it is not required. An alternative cause must be offered as a
      possibility, not asserted as fact.
    rubric:
      - Ties the error to this argument, naming the four-day week (or the switch) and the fall in reading scores.
      - Says why the inference fails, for example that the fall following the switch does not show the switch caused it, that something else could explain it, or that Harlow may differ from its neighbors.
    anchors:
      - points: 2
        answer: >-
          The author assumes the four-day week caused the reading-score decline merely because the decline
          followed the change; that sequence does not establish causation.
        note: complete without naming an alternative cause; differs from the reference
      - points: 1
        answer: It confuses correlation with causation.
        note: names the flaw type but does not tie it to this argument
      - points: 0
        answer: It ignores that the four-day week would help retain teachers.
        note: the author concedes this; it is not the reasoning error
    likely_errors: [correlation-causation, missed-alternative, wrong-gap, irrelevant]
---
Several rural districts in the region moved to a four-day school week over the past five years to save
on transportation and heating costs. In nearly every one of those districts, average reading scores
fell during the two years after the change. Supporters of the schedule in Harlow claim it would help
retain teachers, and that may be true. But Harlow's board exists first to protect student learning,
and the record from our neighbors is clear. Harlow's school board should not adopt the four-day
school week.
````


---

### File: content/exercises/arg-0002.md

````
---
schema: 3
id: arg-0002
status: draft
kind: argument
difficulty: 2
topics: [science, ecology]
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
    prompt: State the argument's main conclusion in one sentence. Give the conclusion only, not the reasons for it.
    max: 2
    reference: >-
      The Marrow Lake association should decline to fund the plan to restock the lake with hatchery trout.
    accept: >-
      Any wording that says the lake association should not fund, or should reject, the trout restocking plan.
    disqualifiers:
      - States the opposite recommendation (that the association should fund the restocking plan).
    rubric:
      - Names the recommendation about funding the restocking plan, not a premise or an intermediate claim such as that the released trout would mostly die.
      - States only that recommendation, without folding in premises or adding claims the author does not make.
    anchors:
      - points: 2
        answer: The lake association shouldn't pay for the trout restocking plan.
      - points: 1
        answer: The association should turn down the restocking plan because the young trout would starve.
        note: right conclusion, but a premise is folded in
      - points: 0
        answer: Most hatchery trout released into the lake would die before reaching maturity.
        note: an intermediate claim offered in support, not the main conclusion
    likely_errors: [premise-as-conclusion, counterpoint-as-conclusion, overstated]
  - key: assumption
    status: active
    skill: assumption
    prompt: >-
      State an assumption the argument needs: a claim that, if false, would make the argument fall apart.
      (A necessary assumption; it need not make the argument airtight.)
    max: 2
    reference: >-
      The hatchery trout would depend on the lake's mayfly larvae after release, as the lake's own young trout
      do; for example, they would not be released at a size at which they could live on other food.
    accept: >-
      Any unstated claim the argument needs for the mayfly shortage to doom the released hatchery trout. The
      main candidates are that the released trout would rely on mayfly larvae (they would not be released too
      large, or be able to switch to other food) and that the shortage will still exist when they are released.
      The claim must be one whose denial undercuts the argument, and it must not be stronger than the argument
      needs (the argument says most released trout would likely die, not that every one would).
    disqualifiers:
      - Gives a claim the argument already states, such as that mayfly larvae in the lake have fallen by more than half.
    rubric:
      - States a claim the argument does not state about whether the mayfly shortage would actually affect the released hatchery trout (for example, that they would depend on mayfly larvae, or that the shortage will persist).
      - States it no more strongly than the argument needs, so that if it were false the argument would lose its support (not, for example, that every released trout would die or that the lake has no other food at all).
    anchors:
      - points: 2
        answer: The mayfly shortage will still be going on when the hatchery fish are put into the lake.
        note: a different necessary assumption from the reference
      - points: 1
        answer: Every single hatchery trout released into Marrow Lake would starve to death.
        note: on the right gap but far stronger than the argument needs
      - points: 0
        answer: The number of mayfly larvae in the lake has dropped sharply over the last ten years.
        note: a stated premise (disqualifier)
    likely_errors: [contradicts-premise, overstated, wrong-gap, restates-conclusion]
---
Volunteers have asked the Marrow Lake association to fund a plan to restock the lake with
hatchery-raised trout, whose native population has fallen sharply. The association should decline.
Surveys show that mayfly larvae, which young trout depend on for food in their first year, have fallen
by more than half in the lake over the past decade. Hatchery trout released now would face the same
food shortage, so most would likely die before reaching maturity, just as the lake's own young trout
apparently have. A program whose fish cannot survive is not worth the association's limited money,
however good the volunteers' intentions.
````


---

### File: content/exercises/arg-0003.md

````
---
schema: 3
id: arg-0003
status: draft
kind: argument
difficulty: 2
topics: [business, surveys]
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
    prompt: Describe the main reasoning error in one or two sentences.
    max: 2
    reference: >-
      The manager draws a conclusion about the bakery's regular customers as a whole from people asked only on
      weekday mornings, who may not be typical; for example, regulars who work on weekdays and shop on
      Saturdays might be much more interested in Sunday hours.
    accept: >-
      Any answer that identifies relying on weekday-morning customers to judge the interest of the bakery's
      regular customers as a whole, and says why that does not follow: the group asked may not represent the
      rest. Naming a specific group that might answer differently is one way to say why, but it is not
      required, and such a group must be offered as a possibility, not asserted as fact.
    rubric:
      - Ties the error to this argument, naming the group surveyed (customers asked on weekday mornings) and the conclusion about Sunday demand or the bakery's regular customers.
      - Says why the inference fails, namely that the people asked may not be representative of the regular customers as a whole (for example, those who shop at other times could feel differently).
    anchors:
      - points: 2
        answer: >-
          She only polled weekday-morning shoppers, then treated their answers as if they spoke for all her
          regulars; people who never come in on weekday mornings could want Sunday hours far more.
      - points: 1
        answer: The sample is unrepresentative.
        note: names the flaw type but does not tie it to this argument
      - points: 0
        answer: Two weeks of asking customers is too small a survey to rely on.
        note: sample size is not the problem the argument has
    likely_errors: [unrepresentative-sample, scope-shift, wrong-gap, understated]
  - key: assumption
    status: active
    skill: assumption
    prompt: >-
      State an assumption the argument needs: a claim that, if false, would make the argument fall apart.
      (A necessary assumption; it need not make the argument airtight.)
    max: 2
    reference: >-
      Regular customers who shop at other times, such as weekends or weekday afternoons, are not much more
      willing to come in on Sundays than the weekday-morning customers the manager asked.
    accept: >-
      Any unstated claim the argument needs to get from "12 percent of weekday-morning customers said yes" to
      "fewer than a third of regular customers would shop on Sundays". The main candidates are that the
      customers asked roughly reflect the regular customers as a whole, and that the answers did not greatly
      understate how many would actually come. The claim must be one whose denial undercuts the argument, and it
      must not be stronger than the argument needs (it need not be an exact match or a perfect prediction).
    disqualifiers:
      - Gives a claim the argument already states, such as the one-third break-even figure or the 12 percent result.
    rubric:
      - States a claim the argument does not state linking the survey answers to how many regular customers would actually shop on Sundays (for example, that the people asked are typical of the regulars, or that their answers reflect what they would really do).
      - States it no more strongly than the argument needs, so that if it were false the argument would lose its support (not, for example, that every regular customer shops on weekday mornings or that every answer was exactly accurate).
    anchors:
      - points: 2
        answer: Not many of the customers who said no would end up coming in on Sundays anyway.
        note: a different necessary assumption from the reference
      - points: 1
        answer: All of the bakery's regular customers shop there on weekday mornings.
        note: on the right gap but much stronger than the argument needs
      - points: 0
        answer: Sunday hours would pay for themselves only if a third of regulars came in.
        note: a stated premise (disqualifier)
    likely_errors: [contradicts-premise, overstated, wrong-gap, irrelevant]
---
Brightloaf Bakery is deciding whether to open on Sundays. Its manager estimates that Sunday hours
would cover the added staffing costs only if at least a third of the bakery's regular customers shopped
there on Sundays. To measure interest, she spent two weeks asking customers at the counter between 7
and 10 a.m., Monday through Friday, whether they would come in on a Sunday. Only 12 percent said they
would. The manager concludes that Sunday opening would not pay for itself and that the bakery should
keep its current schedule.
````


---

### File: content/exercises/arg-0004.md

````
---
schema: 3
id: arg-0004
status: draft
kind: argument
difficulty: 3
topics: [history, public finance]
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
    prompt: Describe the main reasoning error in one or two sentences.
    max: 2
    reference: >-
      The argument infers that the council's spending as a whole was prudent because each decision, taken on
      its own, was modest; but what is true of each part need not be true of the whole, and two hundred small
      expenditures could add up to reckless total spending.
    accept: >-
      Any answer that identifies concluding something about the council's overall handling of money from the
      modesty of each individual spending decision, and says why that does not follow: many small decisions
      can together amount to large or imprudent spending. An example of how the totals might add up is welcome
      but not required, and must be offered as a possibility, not asserted as fact.
    rubric:
      - Ties the error to this argument, naming the individually modest spending decisions and the conclusion about the council as a whole (that it was not reckless or was prudent).
      - Says why the inference fails, namely that what holds for each decision need not hold for them together (for example, many small expenditures could add up to a reckless total).
    anchors:
      - points: 2
        answer: >-
          Just because no single payment was big doesn't mean the council's spending was sensible overall;
          hundreds of small ones could have added up to more than the town could afford.
      - points: 1
        answer: It assumes that what is true of the parts is true of the whole.
        note: names the flaw type but does not tie it to this argument
      - points: 0
        answer: It ignores the possibility that some of the council's ledgers have been lost.
        note: the argument states that the ledgers survive complete
    likely_errors: [part-to-whole, wrong-gap, understated, irrelevant]
  - key: assumption
    status: active
    skill: assumption
    prompt: >-
      State an assumption the argument needs: a claim that, if false, would make the argument fall apart.
      (A necessary assumption; it need not make the argument airtight.)
    max: 2
    reference: >-
      The council's many spending decisions did not, taken together, add up to an imprudent overall level of
      spending.
    accept: >-
      Any unstated claim the argument needs to get from "each decision was modest" to "the council was not
      reckless with public money": in substance, that the decisions taken together did not amount to reckless
      spending (for example, the combined total did not strain or exceed what the town could afford). The claim
      must be one whose denial undercuts the argument, and it must not be stronger than the argument needs.
    disqualifiers:
      - Gives a claim the argument already states, such as that no single expenditure exceeded two percent of annual revenue.
    rubric:
      - States a claim the argument does not state about the council's spending taken together, as opposed to each decision on its own (for example, its combined total or overall effect on the town's finances).
      - States it no more strongly than the argument needs, so that if it were false the argument would lose its support (not, for example, that spending stayed far below revenue in every single year).
    anchors:
      - points: 2
        answer: Over the decade, the two hundred-odd payments together did not come to more than Calder could afford.
        note: a concrete version that differs from the reference's general wording
      - points: 1
        answer: In every year of the decade, the council's total spending was well under half of the town's revenue.
        note: on the right gap but far stronger than the argument needs
      - points: 0
        answer: None of the council's expenditures was larger than two percent of the town's yearly revenue.
        note: a stated premise (disqualifier)
    likely_errors: [contradicts-premise, overstated, wrong-gap, scope-shift]
---
Historians of the river town of Calder have long described its 1840s town council as reckless with
public money. A close reading of the council's ledgers, which survive complete, shows that this
description should be abandoned. The ledgers record more than two hundred separate spending decisions
from the decade. Examined one at a time, each was modest: no single expenditure exceeded two percent
of the town's annual revenue, and most paid for ordinary repairs to roads, bridges and the market hall.
On the evidence of its own books, the council handled the town's money prudently.
````


---

### File: content/exercises/arg-0005.md

````
---
schema: 3
id: arg-0005
status: draft
kind: argument
difficulty: 3
topics: [arts, theater]
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
    prompt: State the argument's main conclusion in one sentence. Give the conclusion only, not the reasons for it.
    max: 2
    reference: >-
      The Hollow Lantern company can expect its new play to win this year's Larkspur Prize.
    accept: >-
      Any wording that says the Hollow Lantern play will (or can be expected to) win this year's Larkspur
      Prize, or that the board is right to expect it to win.
    disqualifiers:
      - States the opposite (that the play will not win, or that the board is wrong to expect it to).
    rubric:
      - Names the expectation that the Hollow Lantern play will win the Larkspur Prize, not a premise such as the six-week record or the length of the booked run.
      - States only that claim, without folding in premises or adding claims the author does not make.
    anchors:
      - points: 2
        answer: Hollow Lantern's new play should be expected to win the Larkspur Prize this year.
      - points: 1
        answer: The play will win the Larkspur Prize because its eight-week run clears the six-week bar.
        note: right conclusion, but a premise is folded in
      - points: 0
        answer: No production that ran under six weeks has ever won the Larkspur Prize.
        note: a premise, not the conclusion
    likely_errors: [premise-as-conclusion, overstated, misread-stimulus]
  - key: flaw
    status: active
    skill: flaw
    prompt: Describe the main reasoning error in one or two sentences.
    max: 2
    reference: >-
      The argument treats a run of six weeks or more, which every past winner has had, as if it were enough to
      win; it is only a requirement winners have met, and many plays that run that long may still lose.
    accept: >-
      Any answer that identifies treating the long run, a condition every past winner met, as if meeting it made
      winning likely or assured, and says why that does not follow: a condition all winners share is not one
      that guarantees winning (it is necessary, not sufficient), since plays that meet it may still lose.
    rubric:
      - Ties the error to this argument, naming the six-week (or long) run and the expectation that the play will win the prize.
      - Says why the inference fails, namely that a condition every winner met need not be enough to win (for example, many plays that run six weeks or more may still lose).
    anchors:
      - points: 2
        answer: >-
          Every winner ran at least six weeks, but that doesn't mean a six-week run gets you the prize; plenty
          of long-running plays could lose. The board treats a minimum as a ticket to victory.
      - points: 1
        answer: It confuses a necessary condition with a sufficient one.
        note: names the flaw type but does not tie it to this argument
      - points: 0
        answer: It assumes the judges are telling the truth about wanting to see long runs.
        note: not the gap the argument relies on
    likely_errors: [reversed-logic, wrong-gap, understated, irrelevant]
---
The Larkspur Prize, an arts council's award for the year's best new play, has never gone to a
production that ran for fewer than six weeks. The council's judges have said that they want to see how
a play holds up over a long run. This season, the Hollow Lantern company has booked its new play for an
eight-week run at the Corbin Street theater. Since the play clears the bar that every past winner has
met, the company's board is right to expect that it will win this year's Larkspur Prize.
````


---

### File: content/exercises/arg-0006.md

````
---
schema: 3
id: arg-0006
status: draft
kind: argument
difficulty: 1
topics: [local policy, parks, parking]
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
    prompt: State the argument's main conclusion in one sentence. Give the conclusion only, not the reasons for it.
    max: 2
    reference: >-
      The Fenwick city council should approve the plan to turn the library parking lot into a park.
    accept: >-
      Any wording that says the council should approve, or go ahead with, the park plan for the library lot.
    disqualifiers:
      - States the opposite recommendation (that the council should reject the park or keep the parking lot).
    rubric:
      - Names the recommendation that the council approve the park, not a premise or an intermediate claim such as that the merchants' objection fails or that shoppers would lose little.
      - States only that recommendation, without folding in premises or adding claims the author does not make.
    anchors:
      - points: 2
        answer: Fenwick's council should go ahead with the park.
      - points: 1
        answer: The council should approve the park because the merchants' parking objection is wrong.
        note: right conclusion, but a supporting claim is folded in
      - points: 0
        answer: Shoppers would lose very little if the lot became a park.
        note: an intermediate claim offered in support, not the main conclusion
    likely_errors: [premise-as-conclusion, counterpoint-as-conclusion, overstated]
  - key: assumption
    status: active
    skill: assumption
    prompt: >-
      State an assumption the argument needs: a claim that, if false, would make the argument fall apart.
      (A necessary assumption; it need not make the argument airtight.)
    max: 2
    reference: >-
      People who now park in the library lot could use the municipal garage without serious difficulty; for
      example, it is open to the public at a reasonable cost.
    accept: >-
      Any unstated claim the argument needs to get from "the garage has plenty of empty spaces" to "shoppers
      would lose very little": in substance, that the people who now use the library lot could practically park
      in the garage instead (it is open and affordable to them, and the extra distance is not a real hardship
      for them). The claim must be one whose denial undercuts the argument, and it must not be stronger than the
      argument needs.
    disqualifiers:
      - Gives a claim the argument already states, such as that the garage has hundreds of empty spaces or that the lot is never more than a third full.
    rubric:
      - States a claim the argument does not state about whether the people who now park in the library lot could practically park somewhere else, such as the garage (for example, that it is open to them, affordable, or close enough to be no real burden).
      - States it no more strongly than the argument needs, so that if it were false the argument would lose its support (not, for example, that every shopper would be happy to use the garage).
    anchors:
      - points: 2
        answer: The two-block walk from the garage wouldn't be a real hardship for most of the people who use the library lot.
        note: a different aspect of the gap from the reference
      - points: 1
        answer: Every shopper would be perfectly happy to park in the garage instead.
        note: on the right gap but far stronger than the argument needs
      - points: 0
        answer: The garage two blocks away has hundreds of empty spaces at all hours.
        note: a stated premise (disqualifier)
    likely_errors: [contradicts-premise, overstated, wrong-gap, irrelevant]
---
The Fenwick city council is considering a plan to turn the parking lot behind the public library into a
small park with benches and shade trees. Neighborhood groups support the plan; the only objection has
come from nearby merchants, who say shoppers would lose convenient parking. That objection does not
hold up. The city's own counts show that the library lot is never more than a third full, even on
Saturdays, and the municipal garage two blocks away has hundreds of empty spaces at every hour of the
week. Shoppers would lose very little by the change. The council should approve the park.
````


---

### File: content/exercises/arg-0007.md

````
---
schema: 3
id: arg-0007
status: draft
kind: argument
difficulty: 3
topics: [ethics, animals]
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
    prompt: Describe the main reasoning error in one or two sentences.
    max: 2
    reference: >-
      The argument dismisses the column by attacking the columnist's commitments instead of addressing her
      reasons about space and social groups; even a committed advocate can give a sound argument, so her
      possible bias does not show that her argument is weak.
    accept: >-
      Any answer that identifies rejecting the columnist's argument because of who she is or what she is
      committed to, rather than because of anything wrong with her reasons, and says why that does not follow:
      a possibly biased person's argument can still be good, so it must be judged on its reasons.
    rubric:
      - Ties the error to this argument, naming the attack on the columnist (her advocacy or anti-zoo commitment) and the dismissal of her argument about elephants.
      - Says why the inference fails, namely that it does not address her reasons, and a source's possible bias does not show that the argument itself is weak.
    anchors:
      - points: 2
        answer: >-
          Instead of showing that captive elephants actually have enough room and company, the author just
          points to the columnist's activism; her views on zoos don't make her reasons wrong.
      - points: 1
        answer: It's an ad hominem attack.
        note: names the flaw type but does not tie it to this argument
      - points: 0
        answer: It assumes that elephants in zoos are unhappy.
        note: that is the columnist's claim, not something the argument assumes
    likely_errors: [attacks-source, wrong-gap, understated, irrelevant]
  - key: assumption
    status: active
    skill: assumption
    prompt: >-
      State an assumption the argument needs: a claim that, if false, would make the argument fall apart.
      (A necessary assumption; it need not make the argument airtight.)
    max: 2
    reference: >-
      The column's reasons, that captive elephants have too little space and too small social groups, are not
      strong enough to deserve weight when judged on their own, apart from who wrote them.
    accept: >-
      Any unstated claim the argument needs to get from "the columnist may not weigh evidence fairly" to "her
      argument deserves no weight": in substance, that the argument's worth depends on trusting the columnist,
      so that it does not stand up on its own merits (for example, its claims cannot be checked independently,
      or they are not well supported). The claim must be one whose denial undercuts the argument, and it must
      not be stronger than the argument needs.
    disqualifiers:
      - Gives a claim the argument already states, such as that the columnist serves on an advocacy group's board or opposes all captivity.
    rubric:
      - States a claim the argument does not state about whether the column's argument stands on its own merits apart from the columnist's fairness (for example, whether its claims can be checked independently or are well supported).
      - States it no more strongly than the argument needs, so that if it were false the argument would lose its support (not, for example, that every claim in the column is false).
    anchors:
      - points: 2
        answer: >-
          Readers couldn't check the column's claims about elephants' living conditions for themselves; they
          would just have to take the columnist's word for it.
        note: a different necessary assumption from the reference
      - points: 1
        answer: Everything the columnist says about captive elephants is false.
        note: on the right gap but far stronger than the argument needs
      - points: 0
        answer: The columnist is on the board of a group that opposes keeping animals in captivity.
        note: a stated premise (disqualifier)
    likely_errors: [contradicts-premise, overstated, wrong-gap, scope-shift]
---
A newspaper columnist has argued that zoos should stop breeding elephants, on the grounds that elephants
in captivity suffer from too little space and social groups that are too small. Several readers found the
column persuasive. But the columnist has for years served on the board of an animal-advocacy group that
opposes keeping any animals in captivity, and she has written that zoos should not exist at all. Someone
with that commitment can hardly be expected to weigh the evidence about elephants fairly. Zoos should
therefore give the column's argument no weight.
````


---

### File: content/exercises/arg-0008.md

````
---
schema: 3
id: arg-0008
status: draft
kind: argument
difficulty: 4
topics: [health, clinics]
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
    prompt: State the argument's main conclusion in one sentence. Give the conclusion only, not the reasons for it.
    max: 2
    reference: >-
      The Westbrook clinic should keep its paper checkup reminders.
    accept: >-
      Any wording that says the clinic should keep mailing paper reminders, or should not replace them with
      text messages.
    disqualifiers:
      - States the opposite recommendation (that the clinic should switch to text messages).
    rubric:
      - Names the recommendation that the clinic keep its paper reminders, not a premise or the conceded point that texts are reliable.
      - States only that recommendation, without folding in premises or adding claims the author does not make.
    anchors:
      - points: 2
        answer: Westbrook shouldn't drop its mailed reminders in favor of texts.
      - points: 1
        answer: The clinic should keep paper reminders because older patients often have no mobile number on file.
        note: right conclusion, but a premise is folded in
      - points: 0
        answer: Text messages are faster than letters and are rarely lost.
        note: a point the author concedes, not the conclusion
    likely_errors: [counterpoint-as-conclusion, premise-as-conclusion, overstated]
  - key: assumption
    status: active
    skill: assumption
    prompt: >-
      State an assumption the argument needs: a claim that, if false, would make the argument fall apart.
      (A necessary assumption; it need not make the argument airtight.)
    max: 2
    reference: >-
      The clinic could not easily collect working mobile numbers from most of its older patients and reach
      them by text instead.
    accept: >-
      Any unstated claim the argument needs to get from "many often-overdue patients are over seventy-five and
      rarely have a mobile number on file" to "the clinic should keep paper reminders". Examples are that the
      clinic could not readily obtain usable mobile numbers for these patients, and that reminders actually
      help these patients keep up with checkups. The claim must be one whose denial undercuts the argument, and
      it must not be stronger than the argument needs.
    disqualifiers:
      - Gives a claim the argument already states, such as that many often-overdue patients are over seventy-five or that they are less likely to have a mobile number on file.
    rubric:
      - States a claim the argument does not state that links the older patients' missing mobile numbers to the need for paper reminders (for example, that the clinic could not easily get their numbers, or that being reminded actually helps them keep up with checkups).
      - States it no more strongly than the argument needs, so that if it were false the argument would lose its support (not, for example, that no patient over seventy-five owns a mobile phone).
    anchors:
      - points: 2
        answer: Getting a reminder actually makes these older patients more likely to come in for their checkups.
        note: a different necessary assumption from the reference
      - points: 1
        answer: None of the clinic's patients over seventy-five owns a mobile phone.
        note: on the right gap but far stronger than the argument needs
      - points: 0
        answer: Older patients are less likely than younger ones to have a mobile number on file.
        note: a stated premise (disqualifier)
    likely_errors: [contradicts-premise, overstated, wrong-gap, irrelevant]
---
A staff committee at the Westbrook health clinic wants to stop mailing paper reminders to patients who
are due for routine checkups and to send text messages instead, mainly to save postage. Critics of the
plan have mostly argued that texts are unreliable, and on that point the committee is right: texts
arrive faster than letters and are rarely lost. Even so, the clinic should keep its paper reminders.
Many of the patients who most often fall behind on checkups are over seventy-five, and the clinic's
records show that these patients are far less likely than younger ones to have a mobile number on file.
````


---

### File: docs/ROADMAP.md

````
# Roadmap

Status: draft v0.4 (2026-10-04, revised after peer review round 3). Milestones are ordered. Each ends with a peer review (`PEER_REVIEW.md`) before it is considered done.

## M0. Grading pilot (feasibility screen)
Test the central risk first: can a chatbot grade written answers well enough for the owner's own study, and is the copy-paste loop tolerable? No app UI or storage yet.
- 8 exercises covering `conclusion`, `flaw` and `assumption`, with anchors, drafted and approved by the owner. At least two whole exercises, covering all three skills, are set aside as the holdout.
- The owner answers them, then deliberately writes the answer types in `GRADING_PROTOCOL.md` §9: at least 12 answers per skill, with acceptable-score sets for genuinely ambiguous ones.
- The pure prompt builder (`src/domain/prompt.ts`) and snapshot hashing are written now, with unit tests, and run from a small script; there is no second builder. The owner pastes the prompts into two or three chatbots, on phone and PC, twice each with different row orders.
- Prompt wording, rubrics and the candidate chatbot configuration are frozen on the development exercises before the holdout run. A prompt change bumps the prompt version.
- Every input, prompt, raw reply and hand-checked parse result is saved under `tests/fixtures/pilot/`. Grades, disagreements, feedback matches and every moment of friction go in `pilot/LOG.md`.
- Before the holdout run: the expected parse and feedback results for the development replies are frozen as fixtures.
- **Done when** the §9 metrics are reported with counts and denominators, and one outcome is recorded in `DECISIONS.md`:
  1. **Proceed with chatbot**: name the chatbot, client, prompt version and batch size. Requires the §9 screening targets on the holdout.
  2. **Proceed with self-grading only**: the app is built with chatbot grading as an optional extra.
  3. **Revise and repeat**: change the prompt or rubrics; the old holdout becomes regression material; repeat on fresh held-out exercises.
  4. **Stop chatbot grading**: results are inconclusive or poor; rethink before building.
- M0 does not calibrate the scheduler; it has no review history. That is assessed in M3.

## M1. Scaffold and content pipeline
- Vite + React + TypeScript (strict), ESLint, Prettier, Vitest, Playwright (Chromium, WebKit), CI, GitHub Pages with hash routing.
- Zod schema for exercise format schema 3, `scripts/build-content.ts`, hashing, validation rules, drafts excluded from production.
- Basic About page: source link, deployed commit, licenses.
- **Done when:** `npm run check` passes in CI; the deployed site loads a deep link and shows the About page; each validation rule in `EXERCISE_FORMAT.md` §4 has a failing-fixture test, including task status, retired-key reuse, approval revision and the independent-approver rule.

## M2. Vertical slice
Answer → autosave → submit → copy → paste → validate → confirm once → see results → export → replace-import.
- Storage schema v1 with the invariants in `ARCHITECTURE.md` §5.1, sessions with exact resume, `prepareGrading`, the parser with the full fixture suite (including the pilot fixtures), the shared grade validator, self-grading with disqualifiers, manual entry, the grading operations in `ARCHITECTURE.md` §6.2, and the privacy disclosure before the first copy.
- Scheduling uses rating policy v1 and scheduler `fsrs-1`; the UI shows only "due again on <date>".
- **Done when:** fixture suite passes; unit tests cover each §6.2 operation with a repeated `opId` (including after a simulated crash before acknowledgement) and a stale revision; a fixture covers first review → suspend → undo → discard and checks the suspension and next-day restriction survive; import rejects deliberately inconsistent exports for each §5.1 invariant; Playwright covers double-confirm, confirm from two tabs, confirm versus discard, stale confirm after undo, repeated correction, repeated undo, identical re-paste, conflicting re-paste, partial grading, a needs-review row resolved later, reload mid-session, failure halfway through save, and export then replace-import restoring an unfinished session and a partially graded request; the owner completes one real session on their phone.

## M3. Daily use
- Today mix with new-stimulus preference, due reviews, next-day eligibility, sibling spacing, suspend, coached retries, correction and undo, flags, Awaiting grading list, backup prompts, persistent storage request.
- Review the rating policy and scheduler with real use: daily review load, repeated failures, grade corrections, and success on the first review after feedback.
- **Done when:** the owner uses it daily for two weeks, the friction log has no "would stop me" items open, and the rating-policy review is recorded in `DECISIONS.md`.

## M4. Progress, PWA and polish
- Progress counts per `SPEC.md` §5.4; PWA with prompt-to-update; full About page (how grading works, source credits); manual accessibility checks.
- **Done when:** first-release success criteria in `SPEC.md` §8 are being tracked.

## M5. Content to 50 and more skills
- Grow to 50 approved exercises; add `weaken`, `strengthen`, `principle`, then passage skills, each with its own small grading pilot before release.

## Later (not scheduled)
Transfer checks on held-out tasks, merge import or sync, optional hosted one-click grading, writing practice, contributor tooling, opening to other users.
````

## Reviewer response

GPT-6 Pro (thinking effort 5 of 5), 2026-10-04. Conversation: https://chatgpt.com/c/6ac292c7-e224-83e9-ad1c-8999ccd156ee. Worked for 9m 18s.

## 1. Is “final weeks before the exam” a sound niche?

**Verdict: It is a plausible use case for a short, targeted supplement—not yet a sound exclusive positioning, and not a reason to make everything hard.**

I would position Premise around a learner’s problem rather than their calendar:

> **“I understand explanations after reading them, but I still miss the reasoning move on the next unfamiliar argument.”**

That problem fits the product better than “I need difficult questions because the exam is close.” The owner’s reaction establishes that `arg-0001.conclusion` was insufficiently demanding for that person. It does not establish what prepared students need in their final weeks: the owner has not started studying, and this was one task. Pasted text

Free response has a plausible role late in preparation, but the relevant benefit is **exposing and repairing a specific reasoning failure**, not writing for its own sake. A student who cannot articulate why evidence supports a conclusion may benefit from doing so. A student who can already articulate it but repeatedly chooses the wrong option among close alternatives has a different bottleneck—one Premise’s current format does not directly reproduce.

Research provides a reason to test the approach, not a reason to assume it works. Butler’s experiments found that retrieval practice improved performance on new inference questions one week later compared with restudying. They did **not** establish that writing analyses of original arguments outperforms official multiple-choice practice during the final weeks. The comparison condition and learning task matter. [Andy Matuschak](https://andymatuschak.org/files/papers/Butler%20-%202010%20-%20Repeated%20Testing%20Produces%20Superior%20Transfer%20of%20Learning%20Relative%20to%20Repeated.pdf) Official practice should remain the main environment for testing transfer and practicing the actual interface; LSAC explicitly recommends official practice tests and practice under timed conditions. [LSAC](https://www.lsac.org/lsat/prepare)

For a final-weeks version, I would make these changes. The numerical defaults below are proposed pilot settings, not established optima.

**Task mix: follow recurring misses, not an asserted frequency ranking.** Start with `flaw`, `assumption`, `strengthen`, and `weaken`, with conclusion work available when indicated. But do not encode “flaw first, necessary assumption second” as a universal hierarchy. LSAC describes a broader range of reasoning skills, including inference, argument relationships, disagreement, analogy, and explanations; that description does not establish the proposed frequency ranking. [LSAC](https://www.lsac.org/lsat/taking-lsat/test-format/logical-reasoning) Within Premise’s narrower remit, prioritize the student’s repeatable, fixable errors. Bring strengthen and weaken forward rather than postponing them until after the app is substantially built.

**Difficulty floor: skip demonstrated mastery, not all easy material.** Use mostly medium and hard tasks relevant to the selected weakness. Retain a small amount of easier work for diagnosis, rebuilding a failed distinction, or checking that the student can recognize a straightforward answer and move on. A late-stage student with a basic conditional-reasoning error needs that error repaired, not concealed inside a denser passage.

**Free-response length: compress the answer, not the reasoning standard.** Ask for one precise sentence or a short structured response. For example: “The evidence concerns ___; the conclusion concerns ___; the missing link is ___.” Treat prephrasing as a provisional account of the reasoning gap—not a requirement to predict the particular fact that an author had in mind.

**Timing: distinguish learning from checking.** Offer an untimed repair attempt and a timed check on a fresh argument. For the pilot, test a 90–120-second budget for reading a new stimulus and writing a brief analysis, with an explicit overtime option. Record correctness and overtime separately. Do not call that exam-equivalent pacing, and do not mistake phone typing speed for reasoning speed.

**Session length: make the whole loop short.** Start with three or four tasks in a 10–15-minute session, including grading and review. Count chatbot switching, waiting, pasting, and resolving disputed grades in that budget. A difficult task is not valuable merely because it consumes time.

**Feedback: give one usable correction.** Identify the exact mismatch, explain why it matters, and show the smallest repair. Then check the same distinction on a fresh stimulus later. Do not make a student read a general lesson on sampling after every sampling mistake.

My preferred initial niche is therefore **post-basics, targeted reasoning repair**, usable in the final weeks but not restricted to them. Final-weeks positioning should become stronger only after prepared students demonstrate that the loop earns its time.

## 2. Should the conclusion task stay?

**Verdict: Yes—as a diagnostic and a selective argument-structure drill, not as a compulsory first task or a recurring quota.**

Copying a sentence is not inherently a defective response. When the author explicitly states the main conclusion, selecting that sentence is exactly the skill being tested. Requiring a paraphrase would add a writing demand without necessarily adding reasoning.

I disagree with the premise that real exam arguments characteristically make the conclusion difficult to locate. Some do; others put the challenge elsewhere. LSAC’s published samples include a question classified as difficult even though the argument ends with an explicitly signposted conclusion. **A plainly stated conclusion and a difficult question can coexist.** [LSAC](https://www.lsac.org/lsat/taking-lsat/test-format/logical-reasoning/logical-reasoning-sample-questions)

I would keep three uses of the task.

**An occasional quick check.** Give a new user a small variety: direct conclusion, intermediate conclusion, concession, and opposing viewpoint. Stop routinely assigning the forms they handle accurately and promptly. Do not send a trivial sentence-selection task through an elaborate chatbot grading loop when self-checking will do.

**A genuine main-versus-intermediate conclusion task.** The stronger version has an argument structure such as:

> Evidence supports an intermediate claim; that claim supports the author’s ultimate recommendation.

Ask for the main conclusion and, on selected tasks, one short explanation of why another plausible claim is subordinate. This tests the direction of support rather than whether the student notices “should” or “therefore.”

**A targeted diagnostic after another mistake.** When a flaw answer attacks the wrong inference, a conclusion check can reveal whether the student misunderstood the argument’s target. But do not make every student type a conclusion before every other task. That would impose a procedure even when it supplies no useful information.

For the hard variants, a conclusion’s middle position is insufficient. It should be genuinely confusable with a supported intermediate claim or a clearly attributed competing position. Conversely, a signposted conclusion should not disqualify an otherwise valuable assumption or weaken task.

I would also change the scoring emphasis. `arg-0001` currently gives half credit to an answer that correctly states the recommendation but adds its supporting reason. That follows the current instruction, but it mixes reasoning competence with response-format compliance. For this niche, I would usually mark the conclusion identification correct and give a separate brevity note, unless the extra material actually makes the intended conclusion ambiguous. Pasted text

**Keep the skill; remove unnecessary repetitions of an already-mastered operation.**

## 3. What makes an original argument genuinely hard?

**Verdict: Difficulty should come from precise logical discrimination—not merely from hiding the conclusion, adding clauses, or making the rubric unforgiving.**

First distinguish **stimulus difficulty**, **task difficulty**, and **grading ambiguity**. The same passage may support an easy conclusion task and a demanding assumption task. An exercise-level difficulty label cannot adequately describe both. I would add provisional task-level difficulty and a short author note explaining the intended difficulty mechanism.

These would be my checkable authoring rules:

| Design target | Authoring requirement and check |
|---|---|
| **Argument structure** | Write an answer-key map identifying the main conclusion, intermediate conclusions, premises, concessions, and opposing views. For a hard conclusion task, identify at least one plausible rival conclusion and explain the direction of support that rules it out. Merely moving the recommendation to sentence three does not qualify. |
| **Scope precision** | Mark the population, time period, measured quantity, and claim strength in both evidence and conclusion. A scope-based task must hinge on a specific mismatch—for example, recorded contact information versus actual reachability—not a vague assertion that “the groups might differ.” |
| **Quantifier boundaries** | State the relevant boundary explicitly in the key: some, most, all, a proportion, an absolute number, or a threshold. Construct a counterexample to the tempting stronger answer. If the reference itself fails that test, repair the reference before increasing difficulty. |
| **Conditional direction** | Translate the relevant relationship into its direction of implication. Distinguish a condition shared by past winners from a formal requirement for all future winners. The explanation must address the conclusion’s actual strength: failing to guarantee an outcome is not, by itself, enough to refute a claim that the outcome is likely. |
| **Causal discrimination** | Include evidence that addresses one plausible alternative while leaving another consequential alternative unresolved. The student should have to identify what remains uncontrolled, rather than succeed with “correlation is not causation” on every item. Do not treat every non-deductive inference as defective merely because certainty is unavailable. |
| **Plausible competing claims** | Every potentially distracting claim must have an identifiable role: someone else’s position, an accepted concession, a background fact, or an intermediate conclusion. Reviewers must agree about its role. Ambiguous attribution is an editing problem, not an advanced difficulty feature. |
| **Response discrimination** | Write at least two plausible near-miss answers, not merely a generic label and an obviously irrelevant answer. Explain exactly why each fails: too strong, wrong population, helpful but unnecessary, or premise-denying. Use those contrasts in feedback or in a short “explain the difference” task. |
| **Controlled complexity** | For an intended hard task, identify two interacting demands—for example, tracking an intermediate conclusion **and** preserving a quantifier. Remove extra complications that do not contribute to those demands. No specialist factual knowledge should be needed unless the stimulus supplies it. |

For `strengthen` and `weaken`, unrestricted invention introduces another problem: a student may produce a decisive but uninteresting fact that sidesteps the intended reasoning. Constrain selected advanced tasks—for example, require a fact about the comparison group or measurement procedure—and require an explanation of its effect. Make the constraint explicit, and accept every answer that actually satisfies it, not only the reference.

### The necessary-assumption standard needs particular care

“Negating this would weaken the argument” is too permissive as the sole acceptance test. A necessary assumption must be something the reasoning **depends on**, not simply something that makes the conclusion more plausible. LSAC’s explanation likewise defines the required assumption in terms of what must be true for the argument to succeed in demonstrating its conclusion. [LSAC](https://www.lsac.org/lsat/taking-lsat/test-format/logical-reasoning/logical-reasoning-sample-questions)

For each proposed assumption, require the author to:

> Negate it accurately, retain the stated premises, identify the particular inference being evaluated, and explain why that inferential route fails—not merely why confidence decreases.

This does **not** require the negation to prove the conclusion false. The conclusion could happen to be true for unrelated reasons. Nor should the assumption be required to make the entire argument airtight; that would confuse necessary and sufficient assumptions.

Finally, call these **author-predicted** difficulty levels until tested. LSAC’s sample explanations describe difficulty in terms of test-taker performance, not sentence placement. Have prepared readers attempt unfamiliar items under consistent conditions, and inspect accuracy, time, and disagreement. A task that produces disagreement because the key is defective has not earned a “hard” label. [LSAC](https://www.lsac.org/lsat/taking-lsat/test-format/logical-reasoning/logical-reasoning-sample-questions)

## 4. How difficult are the eight exercises, and which should stay?

**Verdict: None is convincingly hard as written. I would rate `arg-0008` medium and the others easy overall; several assumption tasks need repair before they should be graded at all.**

These are qualitative judgments about the supplied stimuli and intended operations, not calibrated equivalences to complete official questions. Where a rubric is questionable, I have not counted that uncertainty as difficulty.

| Exercise | Difficulty and reason | One change that would make it harder | Disposition |
|---|---|---|---|
| **`arg-0001` — school week** | **Easy.** Direct recommendation; an exposed before/after causal gap. Pasted text | Add comparison-district evidence that addresses a region-wide decline but leaves a consequential difference in which districts switched. | Keep as a baseline or repair task; remove the conclusion task from routine practice once mastered. |
| **`arg-0002` — trout** | **Easy.** The recommendation is explicit in sentence two, and the intended food-to-survival link is prominent. Pasted text | Specify release cohorts and survey timing so the missing link concerns food available to the relevant fish, not a generic shortage. | Keep only after rewriting the assumption task. |
| **`arg-0003` — bakery** | **Easy.** Weekday-morning sampling makes the selection problem conspicuous. Pasted text | Make selection depend on a less obvious mechanism, and supply subgroup sizes so the student must connect the bias to the one-third threshold. | Keep the flaw task; repair the assumption standard. |
| **`arg-0004` — council spending** | **Easy.** “Each modest expenditure” to “prudent overall” advertises the aggregation issue. Pasted text | Make the problem arise from overlapping obligations within one budget year rather than simply numerous small payments. | Keep the flaw as a baseline; drop the current assumption task. |
| **`arg-0005` — theater prize** | **Easy.** A conspicuous reversal from a shared winner characteristic to expected victory. Pasted text | First clarify completed versus booked performance; then embed the directional error in a two-step eligibility relationship. | Keep after that cleanup; useful as a conditional-reasoning benchmark. |
| **`arg-0006` — parking** | **Easy.** Explicit final recommendation; an accessible “empty spaces versus usable substitute” gap. Pasted text | Distinguish raw vacancy, public access, and the needs of a specified shopper group, leaving one decisive accessibility constraint unresolved. | Not worth recurring placement in a clutch pack as written; retain for diagnosis or rebuilding basics. |
| **`arg-0007` — columnist** | **Easy.** The source attack and dismissal of the argument are overt. Pasted text | Mix independently supported reasons with an unverified report and ask exactly which inference the source’s bias can affect. | Keep only as a baseline or contrast exercise; drop the current assumption task. |
| **`arg-0008` — reminders** | **Medium.** The concession requires some viewpoint tracking, but “Even so” and the recommendation still clearly mark the conclusion. Pasted text | Make rejecting text-only replacement support a further main recommendation, so students must distinguish the intermediate policy claim from the ultimate conclusion. | Keep as a medium structural seed; revise the assumption rubric. |

The more urgent issue is **answer-key validity**. These are the repairs I would make before the grading pilot:

**`arg-0002`: the temporal anchor is poorly matched to the wording.** A full-credit answer says the shortage will persist until release, but the stimulus describes trout released “now” and already says they would face the shortage. That is not a clean test of an unstated temporal assumption. Clarify the inference being tested and either rewrite the release timeline or use a different required bridge. Pasted text Pasted text

**`arg-0003`: “not much more willing” is not a sufficiently precise necessary-assumption reference.** The reference requires other shoppers not to be much more willing to come on Sundays, while the argument only needs overall demand to remain below one-third. Pasted text As a hypothetical boundary check, suppose the surveyed shopper category represents 80% of regulars, with 12% willing to attend, while the remaining 20% are *all* willing. Overall demand would still be only \(0.8(12\%)+0.2(100\%)=29.6\%\). A very large subgroup difference need not erase the margin. The key needs a threshold-sensitive bridge, not an undefined similarity requirement.

**`arg-0004`: the assumption reference largely restates the verdict.** “The decisions collectively did not amount to imprudent spending” is barely distinguishable from the conclusion that the council handled money prudently. This risks rewarding the same copying behavior that prompted the consultation, but under a more advanced label. I would retain the flaw and replace its companion with a tightly specified weaken or strengthen task. Pasted text Pasted text

**`arg-0007`: independent checkability is not a reliable necessary-assumption anchor.** The full-credit alternative says readers cannot independently check the column’s claims. But checkable claims can be unsupported or false, and uncheckable claims need not be worthless. The anchor does not cleanly isolate a required bridge from the columnist’s bias to the argument’s lack of merit. Its reference also approaches a restatement of the dismissal. Drop this task rather than force every flaw stimulus to support an assumption exercise. Pasted text

**`arg-0008`: the rubric strengthens both the evidence and the required assumption.** The acceptance notes describe older patients as rarely having mobile numbers on file, while the stimulus only gives a comparison with younger patients. Those are not equivalent. Moreover, being able to obtain numbers for *most* older patients would not eliminate a reason to retain paper reminders for a consequential minority. Clarify whether the conclusion concerns retaining some paper service, preserving universal paper reminders, or rejecting the proposed complete replacement. Pasted text Pasted text

These are not reasons to abandon the product. They are reasons to establish sound reference judgments **before** measuring chatbot agreement. Agreement with a defective key would make the grading pilot look successful while preserving the wrong lesson.

## 5. What else would make the product maximally helpful in the clutch period?

**Verdict: Prioritize a trustworthy correction, a fresh transfer check, and low total time cost. More difficulty and more scheduling machinery come afterward.**

### Make the unit of value a corrected recurring mistake

The useful loop is:

> A recurring miss identified during official practice → a short original drill targeting that distinction → precise feedback → a fresh argument testing the same distinction → a later check in official practice.

The student can select an abstract error category or enter a short personal note without importing official questions, explanations, or paraphrases. Keep official content outside Premise. The app’s role is the targeted intervention between practice sessions, not replacing them.

Include contrasting feedback when it is useful: “Your answer supplies something helpful; the task asks for something required.” That is more actionable than an isolated `overstated` tag. But preserve the spec’s caution that tags are observations about answers, not diagnoses of the learner. Pasted text

### Test usefulness before investing heavily in the scheduler

M0 currently tests grading feasibility and copy-paste tolerance; transfer checks are explicitly deferred to “Later.” Those are different risks. A perfectly functioning grading loop can still be an inefficient study intervention. Pasted text Pasted text

Add an early usefulness pilot with a few genuinely prepared students. The owner’s use can establish personal feasibility, but it cannot alone establish fit for a learner state the owner has not yet reached.

Compare the complete Premise loop with equal-time ordinary review. Record first-attempt performance on fresh material, elapsed time, disputed grades, and whether the targeted mistake recurs. Keep grading holdouts separate from learning-transfer holdouts. Also exclude author-exposed material from claims about cold performance: someone who approved an answer key is not encountering that task fresh.

A small pilot will not establish a causal score gain. It can still reveal whether people obtain a usable correction, whether the same error immediately recurs, and whether they consider the time worthwhile.

### Build enough unseen content to support the experiment

The current roadmap delays growth to 50 exercises and the addition of strengthen/weaken until M5. Pasted text That order is poorly matched to a final-weeks hypothesis.

At four fresh stimuli per day, a seven-day pilot needs 28 unseen exercises, plus development material and holdouts. Multiple tasks on one familiar stimulus do not replace that supply. The existing spec already distinguishes new and familiar stimuli; preserve that distinction rather than letting a small bank create apparent mastery through repeated exposure. Pasted text

### Make progress and scheduling fit the deadline

Keep first attempts, familiar-stimulus work, coached retries, and reviews separate. Add confidence and time, but avoid converting those into an unsupported readiness score. The existing separation of first attempts and reviews is a good foundation. Pasted text

For final-weeks use, cap the daily workload and prioritize unresolved, consequential distinctions. A card reaching a 21-day interval is not the relevant success criterion when the exam is nearer than that. Do not create a backlog that competes with official practice, or compress everything into repeated exposure to answers the student has just read. Let users finish a useful short session without being told they are behind.

## What I would change in the spec and roadmap first

I would revise the purpose to **“targeted reasoning repair for students who know the basics, including a time-capped final-weeks mode,”** while retaining the explicit statement that score transfer is a hypothesis. Pasted text Then I would add task-level difficulty, precise short-response expectations, and a necessary-assumption validity check; make conclusion tasks selective rather than obligatory; and bring strengthen/weaken into the early content pilot. Split M0 into content validity, grading feasibility, and learner usefulness, using corrected expert-reviewed keys and genuinely fresh transfer material. Move sufficient content creation and a small prepared-student pilot ahead of scheduler refinement and polish. Keep the static, local, copy-paste architecture. The first milestone should demonstrate **a correct, useful repair at an acceptable time cost—not merely reliable grading of eight mostly easy exercises.**

## Triage

Triaged by Claude on 2026-10-04 after the owner chose "targeted repair with a final-weeks mode" over "final weeks only". Changes land in spec v0.5.

| Point | Decision | Where |
| --- | --- | --- |
| 1. Niche: targeted repair, final weeks as a mode | Accepted (owner's choice). Focus selection, repair loop with a fresh-stimulus check, final-weeks mode (3–4 tasks, 10–15 minutes, medium/hard, optional 90–120 s timed check, daily cap). | SPEC §§1–2, 5.1, 5.4 |
| 1. Bring strengthen and weaken forward | Accepted. In M0a content and the M3 pilot, not M6. | ROADMAP M0, M3, M6 |
| 2. Conclusion task: selective diagnostic | Accepted. Offered early and after misses that attacked the wrong claim; dropped once mastered. Scored on identifying the conclusion; extra reasons don't lose credit. | SPEC §5.1; exercises |
| 3. Difficulty from logical discrimination | Accepted. Authoring rules, task-level difficulty and difficulty notes, near-miss anchors, necessary-assumption negation check. Labels are author-predicted until tested. | CONTENT_GUIDELINES §§3.1–3.2; EXERCISE_FORMAT §3 |
| 4. Eight exercises easy; five keys defective | Accepted. Keys repaired, the assumption tasks on arg-0004 and arg-0007 dropped, conclusion tasks rescored. Harder exercises still to be written in M0a. | content/exercises |
| 5. Usefulness pilot with prepared students; enough unseen content | Accepted. New M3 with 3–5 students past the basics, at least 40 exercises; approved exercises are not fresh for the owner. | ROADMAP M0, M3; SPEC §8 |
| 5. Keep official content outside Premise | Already a hard constraint; focus notes say so where typed. | SPEC §§3, 5.1 |
