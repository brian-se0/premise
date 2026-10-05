# Peer review: answer keys for content batch 1 (arg-0009 to arg-0018)

## 1. Role and ask

You are the same senior reviewer who reviewed the Premise specs and the first eight exercises, and found real errors in five of their answer keys. This is an answer-key check of ten new draft exercises (20 tasks). Students will be graded against these keys by a chatbot, so a wrong key teaches the wrong lesson. Please be adversarial: try to break each key.

The owner is an exam beginner and will approve the batch after your check, so your review is the expert check.

## 2. What to check, for every task

1. **Correct key.** Is the reference a correct, strong answer? For flaw tasks, is it the argument's main error (and is there only one)? For conclusion tasks, is it the main conclusion, and is the rival the note names really a rival?
2. **Necessary-assumption test (assumption tasks).** Negate the reference and each full-credit anchor, keep every premise, and say whether the specific inference fails (not merely becomes weaker). Flag anything too strong, or anything that restates a premise or the conclusion.
3. **Strengthen and weaken.** Is each reference and full-credit anchor consistent with every premise, new, and material? Does `accept` wrongly exclude a correct kind of answer, or let a wrong one in? Where the prompt constrains the kind of fact, does the key respect the constraint?
4. **Anchors and rubric agree.** Grade every anchor against the rubric and say if you would give a different score than stated.
5. **Difficulty.** Is the label (1 easiest to 5) realistic compared with real exam arguments of the same type, and is the difficulty note right about what makes it hard?
6. **Stimulus.** Any ambiguity, outside knowledge needed, or a second reasoning problem that would let a different answer be correct?

## 3. Response format

For each exercise, give a one-line verdict (keep / fix / drop). Then list every task with a problem as: task id, the problem, and the exact replacement text you propose. Say nothing about tasks you would keep unchanged. End with any pattern you see across the batch that the author should change in later batches.

## 4. Rules the keys were written to (from CONTENT_GUIDELINES.md)

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

## 5. References, acceptance notes, anchors and rubrics

- **Reference:** what a strong student would write in a minute or two. For open-ended skills it is one example among many.
- **Counts as correct (`accept`):** the logical properties every correct answer shares, not a list of paraphrases. Required for open-ended skills.
- **Rubric:** 1–4 criteria, each worth exactly one point, each observable in the answer ("names the switch and the fall in scores"), never vague ("shows understanding"). A criterion may only require what the task prompt asks for. If full credit needs something, such as leaving out the reasons, the prompt says so.
- **Alternatives:** where a rubric credits an alternative explanation, it must be offered as a possibility, not invented evidence asserted as fact.
- **Disqualifiers:** only for misunderstandings severe enough that partial credit would mislead, e.g. stating the opposite conclusion.
- **Anchors:** one sample answer for every possible score, including at least one full-credit answer unlike the reference for open-ended skills. Reference, `accept`, rubric and anchors must agree: grade each anchor against the rubric and check you get its stated score.
- **Likely errors:** the 2–4 tags a grader is most likely to need.

Scoring: conclusion tasks are worth 1 point with one criterion; all other tasks are worth 2 points, one per rubric criterion, with anchors at 0, 1 and 2. A disqualifier caps the score at 0.

## 5. The ten exercises

### File: content/exercises/arg-0009.md

````yaml
---
schema: 3
id: arg-0009
status: draft
kind: argument
difficulty: 3
topics: [libraries, local policy]
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
      Causes: the stimulus rules out two rival explanations (changes to collections or staff, and teenagers
      moving their borrowing from other branches), so full credit needs an alternative that is still open. The
      way the five branches were chosen points to one.
    prompt: Describe the main reasoning error in one or two sentences.
    max: 2
    reference: >-
      The director concludes that the longer hours caused the rise in teenage borrowing just because the rise
      followed them, without ruling out other differences between the five branches and the rest; since those
      branches were picked because their teenagers most wanted later hours, teenage interest there may already
      have been growing and could have raised borrowing even without the change.
    accept: >-
      Any answer that identifies the move from "teenage borrowing rose at the five branches after their hours
      were extended" to "the longer hours caused the rise", and says why that does not follow by naming a
      possible cause the argument leaves open: something else that differs between the five branches (or their
      neighborhoods) and the other seven, or something else that changed there at the same time. The way the
      branches were chosen (where teenagers most wanted later hours) suggests one, but any open alternative,
      offered as a possibility, earns the point. Alternatives the stimulus rules out do not: changes to the
      five branches' collections or staff, and teenagers moving their borrowing from the other branches.
    rubric:
      - Ties the error to this argument, naming the rise in teenage borrowing at the five branches after their hours were extended and the conclusion that the longer hours caused it.
      - Says why the inference fails by naming a possible other cause of the rise that the argument does not rule out (for example, something else about the five branches or their neighborhoods, such as their teenagers already wanting more library time), not one the stimulus rules out.
    anchors:
      - points: 2
        answer: >-
          The five branches were picked because teenagers there were the keenest on the library, so borrowing
          there might have climbed anyway, say because more teenagers moved into those areas. The timing alone
          doesn't show the hours did it.
      - points: 1
        answer: >-
          The director assumes that because teenage borrowing went up after the hours changed, the hours must be
          the reason.
        note: describes the inference but names no other possible cause, so it does not say why it fails
      - points: 0
        answer: Teenagers probably just switched from the other branches to these ones.
        note: >-
          near miss: an alternative the stimulus rules out (teenage borrowing at the other seven branches held
          steady), and it does not describe the inference
    likely_errors: [correlation-causation, missed-alternative, contradicts-premise, understated]
  - key: strengthen
    status: active
    skill: strengthen
    difficulty_note: >-
      Causes: the stimulus already rules out changes to collections or staff and a shift from the other
      branches, so restating those is not new. A full-credit fact either ties the extra borrowing to the
      added hours or removes a rival the stimulus leaves open, such as a rise already under way at the
      chosen branches.
    prompt: >-
      Give a new fact that, if true, would materially strengthen the argument, and explain how. Treat the
      stated premises as true.
    max: 2
    reference: >-
      Almost all of the extra teenage checkouts at the five branches happened between 6 and 9 p.m., the hours
      that were added. That ties the rise to the new hours themselves; some other change at those branches
      would be expected to raise borrowing during the old hours too.
    accept: >-
      Any new fact, consistent with the premises and not already stated in them, that makes it more likely
      that the longer hours themselves caused the rise in teenage borrowing, with an explanation of how. Two
      main kinds count: facts that tie the extra borrowing to the added hours (for example, it happened mostly
      after 6 p.m., or came from teenagers who could not visit before 6), and facts that remove a rival
      explanation the stimulus leaves open (for example, teenage borrowing at those branches had been flat for
      years before the change, the number of teenagers living nearby did not grow, or no new reading program
      began near those branches). Facts the stimulus already gives, such as the unchanged collections and
      staff or the steady borrowing at other branches, are not new. A relevant new fact whose bearing is not
      explained earns 1.
    rubric:
      - Gives a new fact, consistent with the stated premises and not already stated in them, that bears on whether the longer hours caused the rise in teenage borrowing.
      - Explains how the fact strengthens the argument, namely why it makes the longer hours more likely to be the cause (for example, by tying the extra borrowing to the added hours or by ruling out another explanation the argument leaves open).
    anchors:
      - points: 2
        answer: >-
          In the three years before the change, teenage borrowing at those five branches had been flat, just like
          at the others. So the jump wasn't a trend that was already under way there, which makes the new hours
          the likelier cause.
        note: a different strengthener from the reference (ruling out an earlier trend)
      - points: 1
        answer: Most of the extra teenage checkouts happened after 6 p.m.
        note: the right kind of fact, but the answer does not explain how it supports the argument
      - points: 0
        answer: The five branches did not add any books or staff during the year.
        note: already stated in the stimulus, so not a new fact
    likely_errors: [no-reasoning, irrelevant, missed-alternative, understated]
---
Last year the Fenwick city library kept five of its twelve branches open until 9 p.m. instead of 6 p.m.
It chose the five branches where teenagers had most often asked for later hours. Over the following year,
the number of books checked out by teenagers at those five branches rose by 30 percent. Their collections
and staff were otherwise unchanged, and teenage borrowing at the other seven branches held steady, so
teenagers did not simply move their borrowing from one branch to another. The library's director
concludes that the longer hours caused the rise in teenage borrowing at the five branches.
````

### File: content/exercises/arg-0010.md

````yaml
---
schema: 3
id: arg-0010
status: draft
kind: argument
difficulty: 3
topics: [business, customer service]
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
  - key: weaken
    status: active
    skill: weaken
    difficulty_note: >-
      Scope of the measure: the survey reaches only customers who stay until the agent closes the chat,
      and a premise fixes the mix of problems. The strongest weakeners show a change in who was surveyed
      or another change in the same period; a fact about the kinds of problems denies a premise.
    prompt: >-
      Give a new fact that, if true, would materially weaken the argument, and explain how. Treat the stated
      premises as true.
    max: 2
    reference: >-
      After the script was introduced, twice as many customers as before left their chats before the agent
      closed them, mostly customers whose problems had not been solved. Those unhappy customers were never
      offered the survey, so the average rating could rise even if nobody's experience improved.
    accept: >-
      Any new fact, consistent with every premise (the averages of 3.6 and 4.3, the survey offered only to
      customers who stay until the agent closes the chat, much the same kinds of problems in both periods),
      that gives a real reason to doubt that the script made customers more satisfied with the help they get,
      plus an explanation of how. Main kinds: a change in who answered the survey (for example, more
      dissatisfied customers leaving before the end, or declining the survey, after the change), so the higher
      average could reflect who was asked rather than better help; something other than the script that
      changed between the periods and would raise ratings (for example, much shorter waits); evidence that the
      help itself did not improve (for example, more customers having to come back about the same problem). A
      relevant fact whose effect is not explained, or whose direction the answer leaves open (such as "fewer
      customers took the survey"), earns 1. A fact that denies a premise earns 0.
    disqualifiers:
      - Denies a stated premise, for example that the kinds of problems customers raised changed between the two periods.
    rubric:
      - Gives a new fact, consistent with the stated premises, that bears on whether the script made customers more satisfied with the help they get.
      - Explains how the fact weakens the argument, namely why, even granting the higher average rating, it gives reason to doubt that the script made customers more satisfied (for example, unhappy customers stopped being surveyed).
    anchors:
      - points: 2
        answer: >-
          Halvorsen hired twenty extra agents the same month, cutting the wait before a chat starts from twelve
          minutes to two. Shorter waits alone could make people rate their chats higher, so the rise needn't be
          the script's doing.
        note: a different weakener from the reference (another change in the same period)
      - points: 1
        answer: Fewer customers filled in the survey after the change.
        note: >-
          near miss: relevant, but the answer does not say which customers stopped answering or how that would
          raise the average
      - points: 0
        answer: After the change, customers mostly wrote in about simpler problems than before.
        note: contradicts the premise that the kinds of problems were much the same (disqualifier)
    likely_errors: [contradicts-premise, no-reasoning, missed-alternative, irrelevant]
  - key: assumption
    status: active
    skill: assumption
    difficulty: 4
    difficulty_note: >-
      Scope of the measure: the ratings come only from customers who stay until the agent closes the chat, and
      the conclusion is about customers' satisfaction. A full-credit answer bounds the claim by what the rise
      needs (not so large a change in who is surveyed that it accounts for the rise) instead of requiring the
      surveyed groups to be identical.
    prompt: >-
      State an assumption the argument needs: a claim that, if false, would make the argument fall apart.
      (A necessary assumption; it need not make the argument airtight.)
    max: 2
    reference: >-
      The script did not make customers with bad experiences so much more likely to leave chats before the
      agent closed them, and so miss the survey, that this alone could account for the rise from 3.6 to 4.3.
    accept: >-
      The inference under test is from "the average rating from customers offered the survey rose from 3.6 to
      4.3 after the script" to "the script has made customers more satisfied with the help they get". Any
      unstated claim counts whose denial, with every premise kept, would let the rise be explained without
      anyone being better helped. Main bridges: (a) the change did not alter who reaches the survey (by stay
      or by choice) enough to account for the rise; (b) the ratings reflect satisfaction with the help, for
      example the script did not have agents ask customers for top marks; (c) nothing else that changed in the
      same period raised ratings enough to account for the rise (the kinds of problems are already given as
      much the same). The claim must be bounded by what the argument needs: requiring that exactly the same
      kinds of customers answered in both periods, or that nothing at all changed besides the script, is too
      strong and earns 1, because small differences would not undo a rise this large.
    disqualifiers:
      - Gives a claim the argument already states, such as that the kinds of problems were much the same or the two average ratings.
    rubric:
      - States a claim the argument does not state that links the higher average rating to customers' being more satisfied with the help because of the script (for example, about who reached the survey, about what the ratings measured, or about other changes in the same period).
      - States it no more strongly than the argument needs, so that if it were false the rise could be explained without better help (for example, not so large a change that it accounts for the rise), rather than requiring the surveyed customers to be exactly alike in both periods or nothing else at all to have changed.
    anchors:
      - points: 2
        answer: >-
          The script didn't tell agents to ask customers for top scores; otherwise the higher ratings could just
          reflect being asked.
        note: a different bridge from the reference (what the ratings measure, not who answered)
      - points: 1
        answer: Exactly the same kinds of customers filled in the survey before and after the change.
        note: >-
          near miss, too strong: a small shift in who answered would not undo a rise from 3.6 to 4.3, so the
          argument does not need the groups to match exactly
      - points: 0
        answer: Customers wrote in about much the same kinds of problems before and after the change.
        note: a stated premise, not an assumption (disqualifier)
    likely_errors: [overstated, wrong-gap, irrelevant, restates-conclusion]
---
Halvorsen Software began requiring its support agents to follow a written script in live chats with
customers. In the six months before the change, customers rated their chats an average of 3.6 out of 5;
in the six months after, the average was 4.3. The ratings come from a short survey offered at the end of
every chat in which the customer stays connected until the agent closes it. Customers wrote in about much
the same kinds of problems in both periods. The head of support concludes that the script has made
customers more satisfied with the help they get.
````

### File: content/exercises/arg-0011.md

````yaml
---
schema: 3
id: arg-0011
status: draft
kind: argument
difficulty: 4
topics: [archaeology, history]
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
    difficulty: 4
    difficulty_note: >-
      Conditionals: the premise makes a year-round water source necessary for a large settlement; the
      conclusion treats having one as evidence that the settlement was probably large. The fertile-soil
      premise is a second favorable condition that adds no sufficiency, and the conclusion claims only
      probability, so the key must not rest on "it doesn't prove it".
    prompt: Describe the main reasoning error in one or two sentences.
    max: 2
    reference: >-
      The argument treats a requirement for a large settlement as evidence that there was one: a year-round
      spring was needed for a settlement to grow large, but meeting that requirement (even with good soil)
      gives little reason to think Kessel Ridge's settlement did grow large, since many sites with a reliable
      spring could have stayed small.
    accept: >-
      Any answer that identifies the move from "a settlement could grow large only if it had year-round water"
      (and Kessel Ridge had it) to "Kessel Ridge's settlement was probably large", and says why that does not
      follow: a condition that is needed for growth does not make growth likely, because sites that met it
      could still have stayed small. "Necessary but not sufficient" wording earns the point when it is applied
      to the water requirement and the claim about size. The fertile soil may be mentioned as a further
      favorable condition that also does not make a large settlement likely, but it is not required.
      Objections that the ruins have not been mapped, or that the spring's history is uncertain, miss the
      reasoning error.
    rubric:
      - Ties the error to this argument, naming the requirement (a large settlement needed a year-round water source, which Kessel Ridge had) and the conclusion that the ruins are probably those of a large settlement.
      - Says why the inference fails, namely that meeting a condition needed for a large settlement does not make a large settlement likely (for example, many sites with a reliable spring could have stayed small).
    anchors:
      - points: 2
        answer: >-
          Every big settlement in the valley needed year-round water, but lots of places with a good spring
          could still have been small villages, so having one gives little reason to think Kessel Ridge was big.
      - points: 1
        answer: It confuses a necessary condition with a sufficient one.
        note: names the logical error without tying it to the water requirement or the claim about the ruins
      - points: 0
        answer: It wrongly assumes that a large settlement needed fertile soil.
        note: misreads the argument, which relies on the water requirement and does not claim that soil was needed
    likely_errors: [reversed-logic, wrong-gap, misread-stimulus, understated]
  - key: assumption
    status: active
    skill: assumption
    difficulty: 4
    difficulty_note: >-
      Quantifiers and strength: the conclusion is "probably large", so the needed claim is about what usually
      happened at sites like Kessel Ridge, or about nothing else being missing there, not that every such site
      grew large.
    prompt: >-
      State an assumption the argument needs: a claim that, if false, would make the argument fall apart.
      (A necessary assumption; it need not make the argument airtight.)
    max: 2
    reference: >-
      Sites in the Varn valley that had a year-round spring and fertile soil did not mostly remain small; places
      like Kessel Ridge usually did grow into large settlements.
    accept: >-
      The inference under test is from "a large settlement needed year-round water; Kessel Ridge had a
      year-round spring and fertile soil" to "the Kessel Ridge ruins are probably those of a large settlement".
      Any unstated claim counts whose denial, with every premise kept, removes the reason to think the
      settlement was probably large. Main bridges: (a) sites in the valley with these conditions usually grew
      large, rather than mostly staying small; (b) Kessel Ridge was not missing some other condition that large
      settlements in the valley required (for example, enough level ground or access to trade routes). The
      claim must not be stronger than "probably" needs: saying that every site with a year-round spring grew
      large, or that Kessel Ridge certainly was large, is too strong and earns 1. Restating the conclusion, or
      repeating the premise that large settlements needed year-round water, earns 0.
    disqualifiers:
      - Gives a claim the argument already states, such as that a large settlement needed a reliable dry-season water source.
    rubric:
      - States a claim the argument does not state that links Kessel Ridge's spring and soil to its probably having been a large settlement (for example, about how often sites with such conditions grew large, or that the site lacked nothing else a large settlement required).
      - States it no more strongly than the argument needs, so that if it were false the reason to think the settlement was probably large would disappear, rather than requiring that every such site grew large or that Kessel Ridge certainly did.
    anchors:
      - points: 2
        answer: >-
          Kessel Ridge wasn't missing anything else a big settlement in the valley needed, like enough flat land
          to build on.
        note: a different bridge from the reference (nothing else required was missing)
      - points: 1
        answer: Any site in the valley with a year-round spring grew into a large settlement.
        note: >-
          near miss, too strong: if most such sites grew large but some did not, the conclusion that Kessel
          Ridge's probably did would still stand
      - points: 0
        answer: A settlement in the valley could grow large only if it had a reliable water source in the dry season.
        note: a stated premise, not an assumption (disqualifier)
    likely_errors: [overstated, restates-conclusion, wrong-gap, reversed-logic]
---
Archaeologists agree that a settlement in the Varn valley could have grown large only if it had a
reliable source of fresh water through the dry season. The site at Kessel Ridge has a spring that, to
judge from its mineral deposits, has flowed year-round for at least three thousand years, and the
ridge's soils are as fertile as any in the valley. So the ruins at Kessel Ridge, whose extent has never
been mapped, are probably those of a large settlement.
````

### File: content/exercises/arg-0012.md

````yaml
---
schema: 3
id: arg-0012
status: draft
kind: argument
difficulty: 3
topics: [transport, local policy]
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
    difficulty_note: >-
      Causes: the citywide comparison is already given, so it is not new. A full-credit fact shows the
      mechanism (drivers slowed down for the cameras) or rules out a rival the stimulus leaves open,
      such as a return to normal after an unusually bad year.
    prompt: >-
      Give a new fact that, if true, would materially strengthen the argument, and explain how. Treat the
      stated premises as true.
    max: 2
    reference: >-
      Average driving speeds on the eight streets fell sharply in the month the cameras went live and have
      stayed lower since, while speeds on similar streets without cameras did not change. That links the drop
      in crashes to drivers slowing down for the cameras.
    accept: >-
      Any new fact, consistent with the premises and not already stated in them, that makes it more likely
      that the cameras caused most of the drop in injury crashes on the eight streets, with an explanation of
      how. Main kinds: evidence of the mechanism (speeds fell on those streets when the cameras started, or
      crashes fell most where and when cameras operate); evidence that rules out an explanation the stimulus
      leaves open (crash numbers on those streets had been steady for years before, so the fall is not a
      return from an unusually bad year; no other safety work was done on those streets). The citywide
      comparison is already given and is not new. A relevant new fact whose bearing is not explained earns 1.
    rubric:
      - Gives a new fact, consistent with the stated premises and not already stated in them, that bears on whether the cameras caused most of the drop in injury crashes on the eight streets.
      - Explains how the fact strengthens the argument, namely why it makes the cameras more likely to be the main cause (for example, by showing drivers slowed down for them or by ruling out another explanation the argument leaves open).
    anchors:
      - points: 2
        answer: >-
          Crash numbers on those eight streets had been about the same every year for a decade before the
          cameras went in, so the 40 percent fall isn't just a bad year evening out.
        note: a different strengthener from the reference (ruling out a return to normal after a spike)
      - points: 1
        answer: Drivers on those eight streets now go slower than they used to.
        note: the right kind of fact, but the answer does not explain how it supports the argument
      - points: 0
        answer: Injury crashes on Marrow's other streets fell by only 5 percent.
        note: already stated in the stimulus, so not a new fact
    likely_errors: [no-reasoning, irrelevant, missed-alternative, understated]
  - key: weaken
    status: active
    skill: weaken
    difficulty: 4
    difficulty_note: >-
      Causes, with the kind of fact constrained: the citywide comparison rules out a general trend, but not
      that the eight streets were chosen after an unusual spike (so crashes there would likely fall anyway) or
      that other changes to them were already under way. The answer must be about the years before the cameras.
    prompt: >-
      Give a new fact about the eight streets in the years before the cameras were installed that, if true,
      would materially weaken the argument, and explain how. Treat the stated premises as true.
    max: 2
    reference: >-
      The residents' complaints followed an unusually bad year in which injury crashes on the eight streets
      were about double their normal level. Streets picked right after a spike tend to drift back toward their
      usual numbers anyway, so much of the 40 percent drop could have happened without the cameras.
    accept: >-
      Any new fact about the eight streets in the years before the cameras were installed, consistent with
      every premise, that gives a real reason to doubt that the cameras account for most of the decline, plus
      an explanation of how. Main kinds: crashes on those streets were unusually high just before they were
      chosen, so a fall back toward normal was likely anyway; crashes there were already falling before the
      cameras; other safety changes for those streets were planned or begun before the cameras (for example,
      a redesign approved the year before and finished soon after). A fact about another period, however
      relevant, does not answer the task as asked. A relevant fact whose effect is not explained earns 1. A
      fact that denies a premise earns 0.
    disqualifiers:
      - Denies a stated premise, for example that crashes on the city's other streets fell by only 5 percent.
    rubric:
      - Gives a new fact about the eight streets in the years before the cameras were installed, consistent with the stated premises, that bears on whether the cameras caused most of the decline.
      - Explains how the fact weakens the argument, namely why, even granting the larger drop on the eight streets, it gives reason to think much of that drop would have happened without the cameras.
    anchors:
      - points: 2
        answer: >-
          A year before the cameras, the city had already approved narrowing all eight streets and adding raised
          crossings, work that was finished just after the cameras started. Those changes could account for much
          of the drop.
        note: a different weakener from the reference (other safety work already under way)
      - points: 1
        answer: In the year before the cameras, crashes on those eight streets had been unusually high.
        note: the right fact, but the answer does not explain why that matters
      - points: 0
        answer: >-
          Since the cameras went in, many drivers avoid those streets, so there is less traffic on them to crash.
        note: >-
          near miss: a fact about the period after installation, not the years before, so it does not answer the
          task as asked
    likely_errors: [missed-alternative, no-reasoning, contradicts-premise, irrelevant]
---
Two years ago the city of Marrow installed speed cameras on eight streets where residents had complained
about speeding. Since then, injury crashes on those eight streets have fallen by 40 percent. Over the same
period, injury crashes on Marrow's other streets fell by only 5 percent, so the drop cannot be explained by
a citywide trend such as safer cars or milder weather. The city council concludes that the cameras are
responsible for most of the decline in injury crashes on the eight streets.
````

### File: content/exercises/arg-0013.md

````yaml
---
schema: 3
id: arg-0013
status: draft
kind: argument
difficulty: 4
topics: [music, criticism]
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
      Structure map: critics' view (dismiss the recording) rejected for its reason; concession (technically
      flawless); premises (fast slow movements, which carry the weight); intermediate conclusion (a listener
      would get a distorted sense of the quartets); main conclusion (newcomers should start with a different
      recording), stated twice. The intermediate conclusion is the tempting rival, and "the recording should
      not be taken seriously" is the critics' broader view, which the author does not adopt.
    prompt: State the argument's main conclusion in one sentence.
    max: 1
    reference: >-
      People hearing Beethoven's late quartets for the first time should start with a recording other than
      the Ardent Quartet's.
    accept: >-
      Any wording that says newcomers to the late quartets should not start with (or be given) the Ardent
      Quartet's recording, or should begin with a different one. Extra supporting reasons do not lose credit
      unless they make the identified conclusion ambiguous. Saying that the recording is bad, should be
      dismissed or should not be taken seriously is the critics' broader view, not the author's conclusion,
      and saying that a listener would come away with a distorted sense of the quartets is the intermediate
      claim that supports the conclusion.
    disqualifiers:
      - States the opposite recommendation (that newcomers should start with the Ardent recording).
    rubric:
      - Identifies the main conclusion (that newcomers to the late quartets should start with a different recording, not the Ardent Quartet's), not the intermediate claim that a listener would get a distorted sense of the quartets, the critics' view, or the concession that the playing is flawless.
    anchors:
      - points: 1
        answer: First-time listeners shouldn't learn the late quartets from the Ardent recording.
      - points: 0
        answer: Someone who learns the quartets from this recording will get a distorted idea of what they are.
        note: near miss, the intermediate conclusion offered as the reason for the recommendation
    likely_errors: [premise-as-conclusion, counterpoint-as-conclusion, overstated]
  - key: assumption
    status: active
    skill: assumption
    difficulty: 3
    difficulty_note: >-
      The gap is between "this recording distorts the quartets" and "start with a different one": the
      recommendation helps only if some other recording does better, and only if Beethoven's markings are a
      fair guide to how the slow movements should go.
    prompt: >-
      State an assumption the argument needs: a claim that, if false, would make the argument fall apart.
      (A necessary assumption; it need not make the argument airtight.)
    max: 2
    reference: >-
      At least one other available recording of the late quartets does not distort the slow movements in the
      same way, for example by playing them much nearer Beethoven's markings.
    accept: >-
      The inference under test is from "this recording takes the slow movements much faster than Beethoven's
      markings, and the slow movements carry the music's weight" to "newcomers should begin with a different
      recording". Any unstated claim counts whose denial, with every premise kept, removes the reason for the
      recommendation. Main bridges: (a) at least one other available recording does not have the same
      problem; (b) Beethoven's tempo markings are a fair guide to how the slow movements should be played, so
      taking them much faster does change how they come across. The claim must not be stronger than the
      argument needs: saying that most or all other recordings follow the markings exactly is too strong and
      earns 1. Claims about the cellist's pop career concern the critics' reasoning, which the author already
      rejects, and do not support the recommendation.
    disqualifiers:
      - Gives a claim the argument already states, such as that the slow movements carry the music's emotional weight or that this recording takes them faster than marked.
    rubric:
      - States a claim the argument does not state that links the fast slow movements to the recommendation that newcomers start with a different recording (for example, that another available recording does not have the same problem, or that Beethoven's markings are a fair guide to how the slow movements should go).
      - States it no more strongly than the argument needs, so that if it were false the reason for the recommendation would disappear, rather than requiring that most or all other recordings follow the markings exactly.
    anchors:
      - points: 2
        answer: >-
          Beethoven's tempo markings for those slow movements are a fair guide to how they should sound; if they
          weren't, playing faster than marked wouldn't distort anything.
        note: a different bridge from the reference (the markings, not other recordings)
      - points: 1
        answer: Every other recording plays the slow movements exactly at Beethoven's markings.
        note: >-
          near miss, too strong: one good alternative recording is enough for the recommendation to make sense
      - points: 0
        answer: The cellist's years in a pop band have no effect on how well the quartet plays.
        note: >-
          near miss: about the critics' reasoning, which the author already rejects; the recommendation rests on
          the tempos, not on the cellist
    likely_errors: [overstated, wrong-gap, irrelevant, contradicts-premise]
---
Several critics have dismissed the Ardent Quartet's new recording of Beethoven's late string quartets on
the grounds that its cellist spent ten years in a pop band. That is no reason to dismiss anything. Still,
I would not give this recording to someone hearing these quartets for the first time. Its playing is
technically flawless, but the players take almost every slow movement much faster than Beethoven's
markings indicate, and in these works the slow movements carry the music's emotional weight. A listener
who learned the quartets from this recording would come away with a distorted sense of what they are.
Newcomers to the late quartets should begin with a different recording.
````

### File: content/exercises/arg-0014.md

````yaml
---
schema: 3
id: arg-0014
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
  - key: flaw
    status: active
    skill: flaw
    difficulty: 4
    difficulty_note: >-
      Scope of the measured quantity: the evidence is a share of booked appointments, the conclusion a number
      of appointments, and the stimulus says the number booked grew a lot. The reader has to connect the
      denominator to the conclusion; percentages alone look decisive.
    prompt: Describe the main reasoning error in one or two sentences.
    max: 2
    reference: >-
      The director moves from a smaller share of booked appointments being missed to fewer appointments being
      missed, but the clinic now books far more appointments, and 9 percent of a much larger total can be as
      many missed appointments as 15 percent of the old one, or more.
    accept: >-
      Any answer that identifies the move from "the share of booked appointments that are missed fell from 15
      to 9 percent" to "fewer appointments are being missed", and says why that does not follow: the clinic
      now books far more appointments, so a smaller share of a larger total need not be a smaller number. A
      worked example is welcome but not required. Answers about patients who never book, or about whether
      evening patients differ from daytime ones, miss the error.
    rubric:
      - Ties the error to this argument, naming the fall in the share of booked appointments that are missed and the conclusion that fewer appointments are being missed.
      - Says why the inference fails, namely that because the clinic now books far more appointments, a smaller share of the total need not mean a smaller number (for example, 9 percent of nearly twice as many is more than 15 percent of the original).
    anchors:
      - points: 2
        answer: >-
          A lower no-show rate doesn't mean fewer no-shows when the clinic is booking far more appointments;
          9 percent of a lot more can easily be more than 15 percent of the old number.
      - points: 1
        answer: It confuses a percentage with a total.
        note: names the kind of error without tying it to the missed appointments or the growth in bookings
      - points: 0
        answer: Patients who miss evening appointments might be different from those who missed daytime ones.
        note: does not bear on whether the number of missed appointments fell
    likely_errors: [scope-shift, misread-stimulus, wrong-gap, understated]
  - key: weaken
    status: active
    skill: weaken
    difficulty: 3
    difficulty_note: >-
      Scope of the measured quantity: the premises fix the shares (15 and 9 percent) and say only that
      bookings grew a lot, so the weakener has to supply how much they grew, or a direct count, and
      connect it to the number of missed appointments.
    prompt: >-
      Give a new fact that, if true, would materially weaken the argument, and explain how. Treat the stated
      premises as true.
    max: 2
    reference: >-
      The clinic now books about twice as many appointments a month as it did before the change. Nine percent
      of twice as many is about 18 percent of the old monthly total, more than the 15 percent it used to miss,
      so the number of missed appointments has gone up, not down.
    accept: >-
      Any new fact, consistent with every premise (the shares of 15 and 9 percent, and far more appointments
      booked than before), that gives a real reason to doubt that fewer appointments are now being missed,
      plus an explanation of how. The main kind is how much bookings grew: if they grew by about two-thirds or
      more, the lower share means as many missed appointments or more. A direct count of missed appointments
      that is higher than before, explained as showing the number went up, also counts. Saying only that
      bookings rose a lot repeats the stimulus and earns 0; a specific growth figure without the explanation
      earns 1. A fact that disputes the measured shares denies a premise and earns 0.
    disqualifiers:
      - Denies a stated premise, for example that the share of missed appointments fell to 9 percent.
    rubric:
      - Gives a new fact, consistent with the stated premises and not already stated in them, that bears on whether fewer appointments are being missed than before.
      - Explains how the fact weakens the argument, namely why, even granting the lower share, it gives reason to think the number of missed appointments did not fall (for example, because bookings grew enough that 9 percent of the new total is at least 15 percent of the old one).
    anchors:
      - points: 2
        answer: >-
          Last month the clinic logged 300 missed appointments, against about 200 a month before evening hours
          began. So more appointments are being missed than before, even though the share is lower.
        note: a different weakener from the reference (a direct count rather than the growth in bookings)
      - points: 1
        answer: Monthly bookings at the clinic have doubled since evening hours began.
        note: the right fact, but the answer does not explain how it undercuts the conclusion
      - points: 0
        answer: Bookings have gone up a lot since evening hours began.
        note: already stated in the stimulus, so not a new fact
    likely_errors: [no-reasoning, scope-shift, contradicts-premise, understated]
---
Last year the Riverside clinic began offering appointments on weekday evenings. Since then, the share of
booked appointments that patients fail to show up for has dropped from 15 percent to 9 percent. The
evening slots have been popular, and the clinic now books far more appointments each month than it did
before the change. The clinic's director concludes that fewer appointments are being missed now than
before evening hours began.
````

### File: content/exercises/arg-0015.md

````yaml
---
schema: 3
id: arg-0015
status: draft
kind: argument
difficulty: 3
topics: [ecology, conservation]
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
      The before-and-after comparison rules out an early difference between the islands; the open gap is
      anything on the four goat islands, other than the goats, that would still block regrowth once they are
      gone.
    prompt: >-
      State an assumption the argument needs: a claim that, if false, would make the argument fall apart.
      (A necessary assumption; it need not make the argument airtight.)
    max: 2
    reference: >-
      Nothing besides the goats, such as another plant-eating animal living only on those islands, would keep
      saltbush from regrowing on the four islands once the goats were gone.
    accept: >-
      The inference under test is from "saltbush recovered on the three islands where goats were removed, from
      cover as low as on the other four" to "removing the goats from the other four islands would let saltbush
      recover there too". Any unstated claim counts whose denial, with every premise kept, means removing the
      goats would not let saltbush recover on the four islands. Main bridges: (a) nothing else on the four
      islands that is absent from the three (another grazing animal, poorer soil, less rain) would keep
      saltbush down; (b) saltbush could still regrow there, for example because plants or seeds survive on
      those islands or can reach them. The claim must not be stronger than the argument needs: saying that the
      islands are alike in every respect, or that saltbush will cover as much ground as on the three, is too
      strong and earns 1.
    disqualifiers:
      - Gives a claim the argument already states, such as that saltbush cover was similarly low on all seven islands before the removal.
    rubric:
      - States a claim the argument does not state that links the recovery on the three goat-free islands to recovery on the four goat islands (for example, that nothing else on the four would keep saltbush down, or that saltbush could still regrow there).
      - States it no more strongly than the argument needs, so that if it were false removing the goats would not let saltbush recover, rather than requiring the islands to be alike in every respect or the recovery to match the three islands'.
    anchors:
      - points: 2
        answer: >-
          Some saltbush plants or seeds still survive on the four goat islands, so there's something left to
          regrow from once the goats are gone.
        note: a different bridge from the reference (a source to regrow from)
      - points: 1
        answer: The four goat islands are identical to the three goat-free islands in soil, rainfall and every other respect.
        note: >-
          near miss, too strong: the islands can differ in ways that do not matter to saltbush and the argument
          still holds
      - points: 0
        answer: Before the goats were removed, saltbush cover was similarly low on all seven islands.
        note: a stated premise, not an assumption (disqualifier)
    likely_errors: [overstated, wrong-gap, restates-conclusion, irrelevant]
  - key: strengthen
    status: active
    skill: strengthen
    difficulty: 3
    difficulty_note: >-
      The recovery on the three goat-free islands is already given, so repeating it is not new. A full-
      credit fact connects that recovery to the four goat islands: regrowth there where goats are kept
      off, or shared conditions that allowed the recovery.
    prompt: >-
      Give a new fact that, if true, would materially strengthen the argument, and explain how. Treat the
      stated premises as true.
    max: 2
    reference: >-
      On one of the four goat islands, a plot fenced against goats ten years ago now has saltbush covering
      about half its ground, while the land around it is still mostly bare. That shows saltbush can recover on
      those islands themselves once goats are kept off.
    accept: >-
      Any new fact, consistent with the premises and not already stated in them, that makes it more likely
      that removing the goats would let saltbush recover on the four islands, with an explanation of how. Main
      kinds: evidence from the four islands themselves (saltbush regrowing where goats cannot reach); evidence
      that the four share the conditions that allowed recovery on the three (similar soil and rain, no other
      saltbush-eating animals, surviving plants or seeds); evidence that the goats, not something else, explain
      the recovery on the three (it began soon after the removal). A relevant new fact whose bearing is not
      explained earns 1.
    rubric:
      - Gives a new fact, consistent with the stated premises and not already stated in them, that bears on whether removing the goats would let saltbush recover on the four islands.
      - Explains how the fact strengthens the argument, namely why it makes recovery on the four islands after the goats are removed more likely (for example, by showing saltbush regrows there when goats are kept off, or that those islands share the conditions that allowed recovery on the three).
    anchors:
      - points: 2
        answer: >-
          The four goat islands have the same soils and rainfall as the three goat-free ones and no other animals
          that eat saltbush, so the conditions that let it come back on the three are there on the four as well.
        note: a different strengthener from the reference (shared conditions)
      - points: 1
        answer: On the goat-free islands, saltbush started spreading within two years of the goats' removal.
        note: the right kind of fact, but the answer does not explain how it supports the argument
      - points: 0
        answer: Saltbush now covers about half the ground on the three islands without goats.
        note: already stated in the stimulus, so not a new fact
    likely_errors: [no-reasoning, irrelevant, scope-shift, understated]
---
Twenty years ago, feral goats were removed from three of the seven Lisle Islands. Before the removal,
the native shrub Lisle saltbush covered only a small fraction of the ground on all seven islands. Today
it covers about half the ground on the three goat-free islands, while on the four islands that still
have goats it covers less than a tenth. Biologists studying the islands conclude that removing the goats
from the other four islands would allow saltbush to recover there as well.
````

### File: content/exercises/arg-0016.md

````yaml
---
schema: 3
id: arg-0016
status: draft
kind: argument
difficulty: 3
topics: [technology, product testing]
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
      Scope of the measured quantity: the evidence times each component run on its own, the conclusion the
      whole screen. Testing on the oldest supported phone rules out the objection about slower devices, so the
      open gap is how the forty updates combine when they run together.
    prompt: Describe the main reasoning error in one or two sentences.
    max: 2
    reference: >-
      The manager reasons from each of the forty components finishing in under half a second when run on its
      own to the whole screen finishing in under half a second, but the components may update one after
      another or slow each other down when they run together, so the screen as a whole could take far longer.
    accept: >-
      Any answer that identifies the move from "each component, run on its own, finished updating in under
      half a second" to "the map screen as a whole finishes updating within half a second", and says why that
      does not follow: what holds for each component alone need not hold when all forty update together (for
      example, their times could add up if they run one after another, or they could compete for the phone's
      processor and slow each other down). A mechanism is welcome but not required, and must be offered as a
      possibility, not asserted as fact. Objections that customers may have slower phones miss the error,
      since the test used the oldest phone the app supports.
    rubric:
      - Ties the error to this argument, naming the components timed one at a time (each under half a second on its own) and the conclusion that the whole map screen meets the half-second rule.
      - Says why the inference fails, namely that what holds for each component on its own need not hold for the screen as a whole (for example, forty updates that run one after another, or that compete for the phone when run together, could take far longer than half a second).
    anchors:
      - points: 2
        answer: >-
          Each piece being fast by itself doesn't mean the whole screen is; if the forty pieces update one after
          another, even a tenth of a second each would add up to four seconds.
      - points: 1
        answer: It assumes that what is true of the parts is true of the whole.
        note: names the flaw type but does not tie it to this argument
      - points: 0
        answer: Customers with older phones than the testers used might see much slower updates.
        note: >-
          near miss: the test used the oldest phone the app supports, the hardest case, so the choice of phone
          is not the problem
    likely_errors: [part-to-whole, wrong-gap, understated, irrelevant]
  - key: weaken
    status: active
    skill: weaken
    difficulty: 3
    difficulty_note: >-
      The premises fix each component's time on its own, so a valid weakener has to be about the components
      working together; a slow single component denies a premise.
    prompt: >-
      Give a new fact that, if true, would materially weaken the argument, and explain how. Treat the stated
      premises as true.
    max: 2
    reference: >-
      When a new location arrives, the screen's components update one after another rather than all at once,
      and most of them take more than a tenth of a second each. Forty updates in a row at that pace would take
      over four seconds, far beyond the half-second rule, even though each one alone is under half a second.
    accept: >-
      Any new fact, consistent with every premise (each component, run on its own on the oldest supported
      phone, finished updating in under half a second), that gives a real reason to doubt that the whole map
      screen finishes within half a second, plus an explanation of how. Main kinds: the components update one
      after another, so their times add up; some components must wait for others to finish before they can
      start; when they run together they compete for the phone's processor or memory and slow down; a timing
      of the whole screen on that phone came out over half a second. A relevant fact whose effect is not
      explained earns 1. A fact that denies a premise, such as a component taking longer than half a second
      on its own, earns 0.
    disqualifiers:
      - Denies a stated premise, for example that some component took longer than half a second when tested on its own.
    rubric:
      - Gives a new fact, consistent with the stated premises and not already stated in them, that bears on whether the whole map screen finishes updating within half a second.
      - Explains how the fact weakens the argument, namely why, even granting that each component is fast on its own, it gives reason to think the screen as a whole takes longer than half a second (for example, because the components' times add up or they slow each other down).
    anchors:
      - points: 2
        answer: >-
          The arrival-time estimate can't start updating until the map has finished, which takes 0.4 seconds,
          and the estimate itself takes 0.3 seconds. So the screen needs at least 0.7 seconds, over the limit.
        note: a different weakener from the reference (one component waiting on another)
      - points: 1
        answer: The components update one after another, not all at once.
        note: the right fact, but the answer does not explain how it undercuts the conclusion
      - points: 0
        answer: When tested on its own, the map component took 0.7 seconds on the oldest phone.
        note: denies the premise that every component finished in under half a second (disqualifier)
    likely_errors: [contradicts-premise, no-reasoning, irrelevant, understated]
---
Corvane is about to release a new version of its delivery-tracking app. The company's rule is that the
app's map screen must finish updating within half a second of a driver's new location arriving. The
screen is built from forty separate components, among them the map itself, the driver's marker and the
estimated arrival time. Testers ran each component on its own on the oldest phone the app supports, and
every one finished updating in under half a second. The release manager concludes that the new version's
map screen meets the half-second rule.
````

### File: content/exercises/arg-0017.md

````yaml
---
schema: 3
id: arg-0017
status: draft
kind: argument
difficulty: 4
topics: [transport, local policy]
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
      Structure map: main conclusion (the council should not count the study in the lanes' favor), stated
      first; supporters' view (the study supports the lanes); the study's finding (background); concession
      (the lanes may be worth building for other reasons); premise (the bicycle makers paid for it and profit
      from more cycling); intermediate conclusion (the finding cannot be trusted), introduced by "so" in the
      last sentence. Support runs from the intermediate conclusion back to the opening recommendation, which
      makes the intermediate conclusion the tempting rival. "The council should not build the lanes"
      overreaches, since the author leaves that decision open.
    prompt: State the argument's main conclusion in one sentence.
    max: 1
    reference: >-
      The Dunmore council should not count the bicycle makers' study in favor of the Harbor Street bike lanes,
      whatever it decides about them.
    accept: >-
      Any wording that says the council should not count the study (or give it weight) as support for the
      bike lanes. Repeating "whatever it decides" is not required. Saying that the study's finding cannot be
      trusted is the intermediate claim offered as the reason; saying that the lanes may be worth building
      for other reasons is a concession; saying that the lanes would raise shop sales is the supporters' view;
      saying that the council should not build the lanes goes beyond the author, who leaves that decision
      open.
    disqualifiers:
      - States the opposite recommendation (that the council should count the study in the lanes' favor).
    rubric:
      - Identifies the main conclusion (that the council should not count the study in favor of the bike lanes), not the intermediate claim that the study's finding cannot be trusted, the concession that the lanes may be worth building, the supporters' view, or a recommendation against building the lanes.
    anchors:
      - points: 1
        answer: The council shouldn't treat the bike makers' study as a reason to build the lanes.
      - points: 0
        answer: The study's finding about shop sales can't be trusted, because bicycle makers paid for it.
        note: near miss, the intermediate conclusion offered as the reason for the recommendation
    likely_errors: [premise-as-conclusion, counterpoint-as-conclusion, overstated]
  - key: flaw
    status: active
    skill: flaw
    difficulty: 3
    difficulty_note: >-
      Competing claims: the study has possible weaknesses of its own (other cities, sales that might have
      risen anyway), but the task is about the author's reasoning, which rejects the study only because of
      who paid for it.
    prompt: Describe the main reasoning error in one or two sentences.
    max: 2
    reference: >-
      The author rejects the study's finding because of who paid for it, without pointing to anything wrong
      with how the study was done or what it found; a funder's interest in a result is a reason to check the
      study closely, not a reason to think its finding is false.
    accept: >-
      Any answer that identifies rejecting the study's finding (or refusing it any weight) because the
      Association of Bicycle Makers paid for it, rather than because of anything wrong with the study's
      methods or results, and says why that does not follow: a funder's interest in a result may be a reason
      for caution, but it does not show the finding is false or unreliable. Answers about whether the other
      cities resemble Dunmore, or whether the lanes caused the rise in sales, describe possible weaknesses of
      the supporters' evidence, not the error in the author's reasoning.
    rubric:
      - Ties the error to this argument, naming the reason given (the study was paid for by the Association of Bicycle Makers, whose members profit from more cycling) and the dismissal of the study's finding.
      - Says why the inference fails, namely that it does not point to anything wrong with the study itself, and a funder's interest in the result does not show that the finding is false or untrustworthy.
    anchors:
      - points: 2
        answer: >-
          The author throws out the sales finding just because bike makers paid for it. That's a reason to look
          at the study carefully, but it says nothing about whether sales on those streets really rose.
      - points: 1
        answer: It attacks the source instead of the evidence.
        note: names the flaw type but does not tie it to this argument
      - points: 0
        answer: The six cities in the study may not be like Dunmore, so the result might not hold on Harbor Street.
        note: >-
          near miss: a possible weakness of the supporters' evidence, not the error in the author's reasoning,
          which rests on who paid for the study
    likely_errors: [attacks-source, wrong-gap, understated, irrelevant]
---
Whatever the Dunmore city council decides about the proposed protected bike lanes on Harbor Street, it
should not count the study that the lanes' supporters keep citing in their favor. That study found that,
in six other cities, shops on streets that gained protected lanes saw their sales rise over the next three
years. The lanes may well be worth building for other reasons, such as cyclists' safety. But the study was
paid for by the Association of Bicycle Makers, whose members profit whenever more people take up cycling,
so its finding about shop sales cannot be trusted.
````

### File: content/exercises/arg-0018.md

````yaml
---
schema: 3
id: arg-0018
status: draft
kind: argument
difficulty: 3
topics: [recreation, surveys]
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
      Scope of the population: the evidence comes from people who chose to answer a hiking magazine's website
      poll, the conclusion is about everyone who visits the parks in summer. The large number of answers is a
      distractor: the problem is who answered, not how many.
    prompt: Describe the main reasoning error in one or two sentences.
    max: 2
    reference: >-
      The editor treats the people who chose to answer a hiking magazine's website poll as if they spoke for
      all of the parks' summer visitors, but those readers may not be typical; for example, families who come
      for a day of sightseeing and never read the magazine might feel quite differently about daily limits.
    accept: >-
      Any answer that identifies drawing a conclusion about the parks' summer visitors as a whole from the
      people who chose to answer Trailhead's website poll, and says why that does not follow: those
      respondents may not be typical of summer visitors (for example, they read a hiking magazine, they chose
      to answer, or some may not visit the parks at all). Naming a group that might answer differently is one
      way to say why, but it is not required, and such a group must be offered as a possibility, not asserted
      as fact. Saying that 4,000 answers are too few misses the error: the problem is who answered, not how
      many.
    rubric:
      - Ties the error to this argument, naming the group polled (people who chose to answer Trailhead's website poll) and the conclusion about the parks' summer visitors.
      - Says why the inference fails, namely that the people who answered may not be representative of summer visitors as a whole (for example, they read a hiking magazine, chose to respond, or may not visit the parks at all).
    anchors:
      - points: 2
        answer: >-
          The poll only heard from Trailhead readers who bothered to answer online, then treated them as speaking
          for everyone who visits in summer; day-trippers who never read the magazine might feel very
          differently.
      - points: 1
        answer: The sample isn't representative.
        note: names the flaw type but does not tie it to this argument
      - points: 0
        answer: Four thousand people is too few to speak for all of the parks' visitors.
        note: >-
          near miss: sample size is not the problem the argument has; a poll this large can still mislead if
          the wrong people answer
    likely_errors: [unrepresentative-sample, scope-shift, wrong-gap, understated]
  - key: strengthen
    status: active
    skill: strengthen
    difficulty: 4
    difficulty_note: >-
      Scope, with the kind of fact constrained: the gap is between the people who answered the poll and the
      parks' summer visitors. Limiting the answer to facts about the respondents rules out simply citing
      other evidence, such as a separate survey, so the answer has to close that gap.
    prompt: >-
      Give a new fact about the people who answered the poll that, if true, would materially strengthen the
      argument, and explain how. Treat the stated premises as true.
    max: 2
    reference: >-
      The park service compared the poll's respondents with its own records and found that they closely
      matched the parks' summer visitors in where they live, their ages and how often they visit. That makes
      the poll's 78 percent a fair guide to what summer visitors as a whole think.
    accept: >-
      Any new fact about the people who answered the poll, consistent with the premises, that makes it more
      likely that most of the parks' summer visitors oppose daily limits, with an explanation of how. Main
      kinds: the respondents were mostly people who visit the parks in summer; they resembled summer visitors
      as a whole in ways likely to affect their views (how often they come, whether they hike or only drive
      through, where they live); each person could answer only once. A fact about other evidence, such as a
      separate survey at the park gates, does not answer the task as asked. A relevant fact whose bearing is
      not explained earns 1.
    rubric:
      - Gives a new fact about the people who answered the poll, consistent with the stated premises and not already stated in them, that bears on whether most of the parks' summer visitors oppose daily limits.
      - Explains how the fact strengthens the argument, namely why it makes the poll's result a better guide to the views of summer visitors as a whole (for example, by showing that the respondents were mostly summer visitors or resembled them).
    anchors:
      - points: 2
        answer: >-
          Almost everyone who answered had visited the parks the previous summer, so the poll mostly reflects
          the views of actual summer visitors rather than readers who never go.
        note: a different strengthener from the reference (the respondents were visitors)
      - points: 1
        answer: Most of the people who answered had been to the parks.
        note: the right kind of fact, but the answer does not explain how it supports the argument
      - points: 0
        answer: A survey handed out at the park gates last summer found that most visitors opposed daily limits.
        note: >-
          near miss: evidence from outside the poll rather than a fact about the people who answered it, so it
          does not answer the task as asked
    likely_errors: [no-reasoning, irrelevant, scope-shift, understated]
---
Trailhead, a magazine for hikers and campers, asked readers on its website whether the region's three
mountain parks should limit the number of visitors allowed in each day during the summer. Of the more than
4,000 people who answered, 78 percent said no. The magazine's editor concludes that most of the people who
visit the parks in summer oppose daily limits.
````

## Reviewer response

GPT-6 Pro (thinking effort 5 of 5) in the owner's ChatGPT account, 2026-10-05, sent by the device session in Brave as one attachment; it worked for 29 minutes. The reply follows verbatim, from the first rule below to the last rule before `## Triage` (SHA-256 of the text between them: `c02541bf2a19fe1faf6ef7eb4030697e0b5865f9c0b3a06925a39d69840e71e5`). "Pasted text" is ChatGPT's citation chip for the packet.

---

## arg-0009 — FIX: make the excluded alternative a premise, and repair the strengthening explanation.

### `arg-0009.flaw`

**Problem.** Steady borrowing at the other branches does not establish that no borrowing transferred: new borrowing there could replace borrowing that moved. The stimulus therefore contains a second questionable inference, while the key treats its conclusion as an independently established premise. The full-credit anchor also changes “most requests for later hours” into “keenest on the library,” which is not the stated selection criterion. Pasted text Pasted text

**Replace the stimulus’s sentence beginning “Their collections…” with:**

> Their collections and staff were otherwise unchanged, and teenage borrowing at the other seven branches held steady. An analysis of individual borrowing records also established that the increase at the five branches did not come from teenagers transferring their borrowing from other branches.

**Replace the 2-point anchor’s answer with:**

> The five branches had received the most requests for later hours, but an increase in the number of teenagers living nearby could have raised borrowing even without the change. The rise after the hours were extended therefore does not establish that the longer hours caused it.

**Replace the 0-point anchor’s note with:**

> The independently checked borrowing records rule out this proposed transfer of borrowing, and the answer does not identify the director’s unsupported causal inference.

### `arg-0009.strengthen`

**Problem.** The reference’s explanation assumes that another cause would also increase borrowing during the old hours. A different cause could operate principally in the evening. Locating borrowing after 6 p.m. can strengthen the argument, but it does not establish that competing explanations should produce a different time distribution. Pasted text

**Replace `reference` with:**

> Most of the additional borrowing came from teenagers who could not visit during the branches’ former opening hours and began borrowing during the added hours. The extended schedule gave those teenagers an opportunity to borrow that they previously lacked, making the longer hours themselves a more plausible cause of the increase.

---

## arg-0010 — FIX: distinguish problem type from difficulty, and replace the unsafe necessary-assumption tests.

### `arg-0010.weaken`

**Problem.** “Much the same kinds of problems” does not fix their difficulty, severity, or exact proportions. The 0-point anchor about simpler problems can therefore be consistent with the stimulus. **I would give it 1, not 0:** it supplies a relevant alternative explanation but does not explain its effect on the inference. The disqualifier is correspondingly too broad. Pasted text Pasted text

The reference also uses an absolute number of departures without establishing a change in the proportion or composition excluded. Twice as many departures could accompany twice as many chats. A strong selection-effect reference should specify differential departure rates. Pasted text

**Replace these fields:**

```yaml
difficulty_note: >-
  The survey excludes customers who leave before the agent closes the chat.
  The premise holds problem kinds roughly constant, not their difficulty,
  severity or exact proportions. Valid weakeners may expose selective
  nonresponse or another change that could explain the higher ratings.

reference: >-
  After the script was introduced, 60 percent of dissatisfied customers left
  before the agent closed the chat, compared with 10 percent before; the
  corresponding departure rate among satisfied customers was unchanged.
  This selectively removes more dissatisfied customers from the later survey,
  so its higher average could reflect selection rather than improved satisfaction.

accept: >-
  Any new fact consistent with every premise that gives a material reason to
  doubt that the script increased customers' satisfaction, with an explanation
  of that connection. Relevant facts may concern selective survey participation,
  another cause of higher ratings, or whether the ratings track satisfaction.
  Much the same kinds of problems does not mean identical difficulty, severity
  or proportions, so differences within the same problem kinds are not
  automatically contradictions. Facts about problem resolution must be connected
  to satisfaction rather than treating the two as identical. A relevant fact
  without an explanation earns 1. An actual contradiction of a premise earns 0.

disqualifiers:
  - Contradicts a stated premise, such as the reported average rating in either six-month period.
```

**Replace the 0-point anchor’s answer and note with:**

> **Answer:** In the six months after the script was introduced, the average survey rating was 3.0 out of 5.  
> **Note:** Contradicts the stated post-change average of 4.3.

### `arg-0010.assumption`

**Problem and negation tests.**

The reference’s negation establishes a selection effect large enough that it **could** explain the rise. That wording does not establish that selection actually explains the entire rise, rather than coexisting with genuine improvement. The acceptance test likewise mistakes permitting an alternative explanation for breaking the inference. Pasted text

The 2-point anchor fails more plainly. Negate it: **the script did tell agents to request top scores.** Customers could ignore those requests, or the requests could have a negligible effect while satisfaction genuinely increases. **That anchor earns 1, not 2:** it identifies a relevant measurement issue but states an unnecessarily strong prohibition. Pasted text

**Replace these fields:**

```yaml
difficulty: 3

difficulty_note: >-
  Distinguish a necessary measurement or causal bridge from a helpful safeguard.
  A complete artifact or wholly unrelated cause can destroy the relevant
  evidential link; the mere presence of some selection, score solicitation
  or another concurrent change need not do so.

reference: >-
  The higher average is not wholly an artifact of changes in who supplied the
  ratings or how ratings were recorded; at least some of the rise reflects
  greater satisfaction with the help received.

accept: >-
  Accept an unstated claim whose negation removes a measurement or causal link
  needed to use the rating increase as evidence that the script improved
  satisfaction. Do not award full credit merely because the negation makes an
  alternative explanation possible or makes the argument less persuasive.
  A claim may exclude a complete selection or scoring artifact, or the entire
  increase being attributable solely to changes unrelated to the script.
  It need not exclude every difference between the periods. An otherwise
  relevant but unnecessarily strong claim earns 1. Repeating a premise or
  restating the conclusion earns 0.

rubric:
  - States an unstated claim relevant to interpreting the rating increase as evidence of improved satisfaction caused by the script, rather than repeating a premise or the conclusion.
  - Passes the negation test for that evidential link without requiring the absence of every potentially relevant difference or influence.

disqualifiers:
  - Repeats a stated premise or merely restates that the script made customers more satisfied.
```

**Replace the 2-point anchor’s answer and note with:**

> **Answer:** The rise in ratings was not wholly caused by changes unrelated to the script, such as shorter waits introduced independently of it.  
> **Note:** A causal bridge, unlike the reference’s measurement bridge. Its negation attributes the entire observed rise to unrelated changes, leaving that rise without support for attributing an improvement to the script.

The replacement reference’s negation removes the genuine-satisfaction interpretation of the rise. Neither replacement requires proving that the script could not have helped anyone; the test concerns what these ratings support.

---

## arg-0011 — FIX: distinguish increased plausibility from “probably,” and replace the overbroad population assumption.

### `arg-0011.flaw`

**Problem.** The reference overstates the criticism by saying that the water requirement gives “little reason” for largeness. Satisfying a necessary condition can increase an outcome’s probability; the missing support is for the stronger claim that this settlement was **probably** large. The reference also changes a necessary reliable water source into a necessary spring. Pasted text

The stimulus leaves the settlement’s date unspecified, so a spring’s existence for three thousand years does not establish its availability during occupation. That creates another possible objection which the key improperly dismisses. Pasted text Pasted text

Finally, **the generic 1-point anchor earns 0 under the stated rubric**: it neither identifies this argument’s terms nor addresses the distinction between insufficient proof and unsupported probability. Pasted text

**Replace the stimulus’s spring-and-soil sentence with:**

> Mineral deposits show that Kessel Ridge had a year-round fresh-water spring during the settlement’s occupation, and its soils were then as fertile as any in the valley.

**Replace `reference`, `accept`, and rubric criterion 2 with:**

> **Reference:** The argument moves from conditions that permitted or favored a large settlement to the claim that a large settlement was likely. It supplies no information establishing that settlements with Kessel Ridge’s water and soil conditions were more likely to become large than remain small.
>
> **Accept:** Accept answers identifying the unsupported move from a necessary water supply and favorable soil to “probably large.” The answer must address the unsupported likelihood claim, not merely observe that a large settlement is not guaranteed. It may explain that the argument provides no relevant frequency information or other basis for favoring a large settlement over a small one. Do not require the student to claim that water and soil provide no evidence at all.
>
> **Rubric criterion 2:** Explains that the supplied conditions do not establish the claimed likelihood of a large settlement, rather than merely saying that they fail to guarantee one.

**Replace the 2-point anchor with:**

> Large settlements needed year-round water, and Kessel Ridge had it, but the argument does not establish how often sites with both that water and such fertile soil became large. Those conditions therefore do not by themselves justify calling this settlement probably large.

**Replace the 1-point anchor’s answer and note with:**

> **Answer:** The argument uses the fact that large settlements needed year-round water, and that Kessel Ridge had it, to conclude that the settlement was probably large.  
> **Note:** Identifies the premises and inference, but does not explain why the probability claim lacks support.

### `arg-0011.assumption`

**Problem and negation tests.**

The reference contains two problems. “Did not mostly remain small” is not equivalent to “usually grew large”; an even division already separates those claims. More importantly, a majority claim about all spring-fed fertile sites need not hold for the more specific evidence about Kessel Ridge. For example, ordinary fertile sites could mostly remain small while sites with soil **as fertile as any in the valley** usually become large. That counterexample preserves the actual soil premise while denying the reference’s broad majority claim. Pasted text

The existing full-credit anchor **does pass** negation: if Kessel Ridge lacked an indispensable condition for a large settlement, it could not have been large. That is the sound type of necessary-condition answer to retain.

The acceptance note also inconsistently gives 1 point to “Kessel Ridge certainly was large” while rejecting restatements of the conclusion. A stronger restatement is still not an assumption. Pasted text

**Replace these fields:**

```yaml
difficulty: 3

difficulty_note: >-
  A necessary enabling condition must not be confused with a majority claim
  about a broader class of sites or with a restatement that this settlement
  was large. Negating a genuine enabling condition makes a large settlement
  impossible without denying the stated water and soil premises.

reference: >-
  Kessel Ridge's usable space did not place an upper limit on settlement size
  below what would count as large.

accept: >-
  Accept an unstated claim whose negation, while preserving the premises,
  removes a necessary basis for the inference that Kessel Ridge was probably
  large. One valid kind rules out a site-specific constraint that would have
  made a large settlement impossible. Do not automatically credit majority
  claims about more loosely described groups of sites: their necessity must
  be tested against the exact evidence about Kessel Ridge. An otherwise
  relevant but unnecessarily strong bridge earns 1. Repeating a premise or
  asserting that Kessel Ridge was, probably was, or certainly was large earns 0.

rubric:
  - States an unstated claim bearing on the inference from Kessel Ridge's conditions to settlement size, rather than repeating a premise or the conclusion.
  - Passes the negation test without requiring universal growth, actual largeness, or a population-frequency claim not required by the evidence.

disqualifiers:
  - Repeats a premise or merely asserts that Kessel Ridge was, probably was, or certainly was large.
```

**Use this 2-point anchor, distinct from the reference’s space constraint:**

> **Answer:** The food available to the settlement was not so limited that a large settlement there would have been impossible.  
> **Note:** Negation makes a large settlement impossible because of a resource constraint, while preserving the stated water and soil facts.

The replacement reference similarly passes: negate it, and the site’s usable space rules out a large settlement.

---

## arg-0012 — FIX: make the citywide exclusion independent and apply the time constraint consistently.

### `arg-0012.weaken`

**Problem.** The 40-versus-5-percent comparison does not itself rule out a citywide influence: the two sets of streets could respond differently. The stimulus should independently establish the exclusion that the keys require. Pasted text

The full-credit anchor relies on a project’s **post-installation completion**, while the task and 0-point note reject facts about that period. Although the current wording can be read to award 2 because the answer also mentions prior approval, it teaches an unstable boundary. Make the full-credit anchor’s evidential fact entirely pre-installation. Pasted text Pasted text

The 0-point anchor has another problem: camera-induced traffic diversion can be a mechanism by which cameras reduce crashes on those streets. The conclusion concerns crash numbers there, not necessarily safer driving or citywide benefits. **Its zero is defensible, but the note misses this independent reason it is not a weakener.**

**Replace the stimulus’s sentence beginning “Over the same period…” with:**

> Over the same period, injury crashes on Marrow’s other streets fell by only 5 percent. A separate analysis ruled out citywide changes, such as safer cars or milder weather, as the main cause of the decline on the eight streets.

**Replace these task fields:**

```yaml
difficulty: 3

difficulty_note: >-
  The answer must concern pre-installation history. A prior spike or an
  established decline can explain why crashes would have fallen anyway.
  Do not make a full-credit answer depend on a new fact about a project's
  completion after installation. Citywide changes are ruled out by the
  separately stated analysis, not by the percentage comparison alone.

accept: >-
  Any new fact about the eight streets in the years before installation,
  consistent with every premise, that materially undermines attributing most
  of the later decline to the cameras, with an explanation. Examples include
  an unusual pre-installation spike, an established downward trend, or an
  earlier change whose continuing effects could explain the decline.
  A different qualifying pre-installation fact may also earn full credit.
  Do not rely on an additional post-installation fact to make the proposed
  weakener work. A qualifying relevant fact without an explanation earns 1.
  An answer containing only an out-of-period fact earns 0.

rubric:
  - Gives a new, premise-consistent fact about the eight streets in the years before installation that bears on whether the cameras caused most of the decline.
  - Explains how that qualifying pre-installation fact makes it more plausible that most of the decline would have occurred without the cameras.
```

**Replace the 2-point anchor’s answer and note with:**

> **Answer:** For four years before the cameras were installed, injury crashes on those streets had already been falling by about 25 percent a year. Continuing that trend would produce roughly a 44 percent fall over two years, so the later 40 percent decline need not chiefly reflect the cameras.  
> **Note:** A different weakener from the reference: an established downward trend rather than a return to normal after a spike.

**Replace the 0-point anchor’s answer and note with:**

> **Answer:** When the cameras went live, the city also prohibited heavy trucks on those streets. Removing the trucks could account for much of the crash reduction.  
> **Note:** This could weaken an unconstrained version of the argument, but its new fact concerns the installation period, not the preceding years, so it earns neither criterion here.

---

## arg-0013 — FIX: lower the conclusion-task estimate and repair the recommendation assumptions.

### `arg-0013.conclusion`

**Problem.** The recommendation is stated twice, including in the final sentence. There is a genuine intermediate conclusion, but identifying the main conclusion does not require the additional interacting discrimination that would justify a predicted 4. **I would label this 3.** Pasted text Pasted text

**Replacement:** Set both the exercise-level `difficulty` and this task’s `difficulty` to `3`.

### `arg-0013.assumption`

**Problem and negation tests.**

Negate the reference: **every alternative recording has the same kind of slow-movement distortion.** Another recording could nevertheless have that defect to a smaller degree and be a better introduction. Having no such defect is stronger than the comparative recommendation needs. Pasted text

Negate the full-credit anchor: **Beethoven’s markings are not a fair guide.** It does not follow that this performance’s faster tempos distort nothing; the appropriate tempos could be slower still. Moreover, the stimulus expressly advances the distorted-impression claim as an intermediate conclusion. The key should distinguish assumptions supporting that claim from assumptions connecting it to the recommendation. **The current anchor earns 1, not 2.** Pasted text Pasted text

**Replace these fields to test the recommendation link explicitly:**

```yaml
difficulty_note: >-
  Grant the author's claim that this recording gives newcomers a distorted
  impression. The remaining gap concerns why that defect supports choosing
  another recording: a comparatively better alternative must be available,
  and the distortion must matter when choosing an introduction.

prompt: >-
  Grant the author's claim that the Ardent recording would give a newcomer a
  distorted sense of the quartets. State a necessary assumption linking that
  claim to the recommendation to begin with a different recording: a claim
  whose negation would remove the stated reason for that recommendation.

reference: >-
  At least one other available recording would give newcomers a less distorted
  impression of the quartets than the Ardent recording would.

accept: >-
  Accept an unstated claim whose negation removes the granted distortion
  claim's support for choosing another recording. Relevant bridges concern
  the availability of a less-distorting alternative or the relevance of that
  distortion when choosing an introduction. Do not require a distortion-free
  alternative, exact adherence to tempo markings, or superiority of every
  alternative. Claims about whether Beethoven's markings are accurate concern
  an upstream inference that this prompt grants rather than tests.
  Repeating a premise or the recommendation earns 0.

rubric:
  - States an unstated claim about the comparative suitability of available alternatives or the relevance of distortion when choosing an introduction.
  - Its negation removes the stated basis for choosing a different recording, without requiring perfect alternatives or other unnecessarily strong conditions.
```

**Replace the 2-point anchor’s answer and note with:**

> **Answer:** Giving a newcomer a distorted first impression of the quartets is a drawback when choosing their introductory recording.  
> **Note:** A normative bridge, unlike the reference’s comparative availability claim. Negating it removes the stated reason to count the distortion against this recording.

**Replace the 1-point anchor’s answer and note with:**

> **Answer:** Every other available recording would give newcomers a less distorted impression of the quartets than the Ardent recording would.  
> **Note:** Too strong: one better alternative is enough. Some equally or more distorted alternatives would not defeat the recommendation.

The replacement reference passes the scoped test: if no available alternative gives a less distorted introduction, this defect supplies no comparative reason to choose another recording.

---

## arg-0014 — FIX: repair the partial-credit anchor and make the numerical boundary exact.

### `arg-0014.flaw`

**Problem.** **The current 1-point anchor earns 0 under the literal rubric.** “It confuses a percentage with a total” neither identifies the specific inference required by criterion 1 nor explains the larger-denominator issue required by criterion 2. The argument also explicitly flags the denominator increase; a predicted difficulty of 4 is too high for this direct mismatch. Pasted text Pasted text

**Set the exercise-level difficulty and this task’s difficulty to `2`.**

**Replace `difficulty_note` with:**

> The evidence concerns percentages and the conclusion concerns numbers of missed appointments. The explicitly increased booking total must be considered; a lower percentage does not by itself establish a lower count.

**Replace the 1-point anchor’s answer and note with:**

> **Answer:** The director infers fewer missed appointments from the fall in the missed-appointment rate from 15 percent to 9 percent.  
> **Note:** Identifies the specific inference but does not explain why the larger booking total makes it unreliable.

### `arg-0014.weaken`

**Problem.** The threshold is **at least two-thirds**, not “about two-thirds.” With the stipulated rates, a booking increase below that boundary establishes fewer missed appointments. For example, bookings rising from 2,000 to 3,300—65 percent—takes missed appointments from 300 to 297. That confirms, rather than weakens, the conclusion. The acceptance note should also expressly include an unchanged missed-appointment count. Pasted text

**Replace these fields:**

```yaml
difficulty: 2

difficulty_note: >-
  With the rates fixed at 15 and 9 percent, equal missed-appointment counts
  occur when new bookings are exactly five-thirds of old bookings.
  The answer must connect a new booking figure or a direct count to that
  exact comparison over comparable periods.

accept: >-
  Any new, premise-consistent fact that materially undermines the conclusion
  that the number of missed appointments fell, with an explanation.
  A booking increase of at least two-thirds qualifies: the new booking total
  is then at least five-thirds of the old total, so 9 percent of the new total
  is at least 15 percent of the old total. A direct count showing the same
  number of missed appointments as before, or a larger number, also qualifies.
  Comparisons must concern comparable periods. Merely repeating that bookings
  increased earns 0. A relevant new fact without an explanation earns 1.
  Contradicting either stipulated rate earns 0.
```

---

## arg-0015 — FIX: replace the local-survival assumption and clean up the baseline and partial-credit wording.

### `arg-0015.assumption`

**Problem and negation tests.**

The reference passes: its negation introduces another factor that would prevent recovery after goat removal, defeating the predicted recovery on the affected island.

The full-credit anchor does not pass. Negate it: **no saltbush plants or seeds currently survive on the four islands.** Seeds or plants could subsequently arrive; the acceptance note itself recognizes that possibility. **The anchor deserves at most 1, not 2.** On the ordinary reading of the stimulus’s present saltbush cover, its claim about surviving plants also risks repeating information already supplied. Pasted text Pasted text

The difficulty note overstates what the baseline controls: “a small fraction” on all seven islands does not establish identical initial cover or rule out other initial differences. The 1-point anchor’s “every other respect” also sweeps in goat presence and current saltbush cover, which the stimulus explicitly distinguishes. Pasted text Pasted text

**Replace `difficulty_note` and `accept` with:**

> **Difficulty note:** All seven islands had low saltbush cover before removal; this does not establish identical starting cover or identical environmental conditions. The necessary-assumption test distinguishes an obstacle that would prevent recovery from differences that merely affect its speed or extent.
>
> **Accept:** Accept an unstated condition whose negation, with the premises preserved, would prevent saltbush recovery on at least one of the four islands after goat removal. A remaining grazer or other specific obstacle must be severe enough to prevent recovery, not merely make recovery slower. A source for regrowth may consist of plants or viable seeds that survive or subsequently arrive; current local survival is not individually necessary. Do not require identical island conditions or recovery matching the other islands’ extent. Merely repeating that saltbush could recover after goat removal does not supply an assumption. An otherwise relevant but unnecessarily strong condition earns 1.

**Replace the 2-point anchor’s answer and note with:**

> **Answer:** On each of the four islands, saltbush plants or viable seeds could remain available after goat removal, or could subsequently reach the island, providing a source for recovery.  
> **Note:** Negation excludes those sources of regrowth on at least one island. The answer does not require that the source already be present locally.

**Replace the 1-point anchor’s answer and note with:**

> **Answer:** The four goat islands have exactly the same soil composition and receive exactly the same amount of rain as the three goat-free islands.  
> **Note:** Relevant but too strong: differences in soil or rainfall can coexist with successful recovery. Unlike “identical in every respect,” this answer does not contradict the stated differences in goats and saltbush cover.

---

## arg-0016 — FIX: remove the oldest-equals-slowest assumption and correct the timing claim.

### `arg-0016.flaw`

**Problem.** “Oldest supported phone” does not entail “slowest supported phone” or “hardest case.” The key imports that relationship and thereby excludes a legitimate device-generalization concern. The deadline’s scope should also be explicit. Pasted text Pasted text

**Replace the stimulus with:**

> Corvane is about to release a new version of its delivery-tracking app. The company’s release-test rule is that, on every supported phone under the specified test conditions, the map screen must finish updating within half a second of a driver’s new location arriving. The screen is built from forty separate components, among them the map itself, the driver’s marker and the estimated arrival time. Testers ran each component on its own on every supported phone under those conditions; every component finished updating in under half a second in every test. The release manager concludes that the new version’s map screen meets the half-second rule.

This preserves the parts-to-whole problem while removing the untested-device inference.

**Set the exercise-level difficulty and this task’s difficulty to `2`.**

**Replace `difficulty_note` with:**

> Every supported phone has isolated-component test results. The remaining gap is between those individual times and the whole screen’s completion time, which can include sequential work and interactions among components.

**Replace the final sentence of `accept` with:**

> Objections confined to unsupported phones do not challenge the stated rule; all supported phones were included in the stipulated isolated-component tests.

**Replace the 0-point anchor’s answer and note with:**

> **Answer:** The app might update too slowly on a phone it does not support.  
> **Note:** The stated release-test rule concerns supported phones, so this does not challenge the inference being tested.

### `arg-0016.weaken`

**Problem.** “Most” of forty updates taking more than 0.1 seconds does not imply a total above four seconds. For example, 21 updates at 0.11 seconds and 19 at 0.01 seconds total **2.5 seconds**. The weakener still works, but its arithmetic teaches the wrong quantifier inference. Pasted text

The note also wrongly says a valid weakener must concern components working together. A delay between location arrival and the start of updating, or additional screen-finalization time, can violate the end-to-end deadline without contradicting isolated component times. Pasted text

**Replace these fields:**

```yaml
difficulty: 2

difficulty_note: >-
  Isolated component times do not determine end-to-end screen latency.
  Relevant new facts may concern sequential work, component interactions,
  or delays before or after the isolated updates. A conflicting report about
  the stipulated isolated tests themselves contradicts a premise.

reference: >-
  When a new location arrives, all forty components update one after another,
  and each takes 0.1 seconds. Those updates alone take four seconds, far beyond
  the half-second limit, although every component individually meets the limit.

accept: >-
  Any new fact consistent with the stipulated isolated-component results that
  materially undermines the screen's compliance with the end-to-end deadline
  under the stated test conditions, with an explanation. Valid facts may
  concern sequential updates, dependencies, resource contention, delays before
  updating starts, additional work before the screen finishes, or a whole-screen
  timing above half a second. A relevant fact without an explanation earns 1.
  A claim that a component exceeded half a second in the stipulated isolated
  tests contradicts a premise and earns 0.

disqualifiers:
  - Contradicts the stipulated isolated-test results, such as asserting that a component took more than half a second in those tests.
```

**Replace the 0-point anchor’s answer and note with:**

> **Answer:** In the stipulated isolated tests, the map component took 0.7 seconds.  
> **Note:** Contradicts the stated result that every component finished in under half a second in those tests.

---

## arg-0017 — FIX: distinguish a reason for caution from a sufficient reason for wholesale dismissal.

### `arg-0017.flaw`

**Problem.** The reference says interested funding is not a reason to think a finding false, and the full-credit anchor says it “says nothing” about the finding. Those formulations overcorrect. A financial interest can bear on credibility without establishing falsity or justifying the refusal to give a study any weight. The flaw is the **categorical dismissal**, not considering the funding at all. Pasted text Pasted text

Under a literal application of the rubric, **the 1-point anchor earns 0**: it supplies neither the specified argument details nor the required explanation of why the funding does not establish untrustworthiness. Replace it with an answer that clearly satisfies criterion 1 alone.

**Replace `reference` with:**

> The author treats the bicycle makers’ financial interest as enough to rule out trusting the study, without identifying a defect in its methods or data. The funding can justify caution, but does not by itself establish that the finding is unreliable or deserves no evidential weight.

**Replace the 2-point anchor’s answer with:**

> The bicycle makers may profit from more cycling, but a study they fund could still have sound methods and accurate sales data. Their financial interest alone therefore does not justify the author’s refusal to give the finding any weight.

**Replace the 1-point anchor’s answer and note with:**

> **Answer:** The author dismisses the shop-sales finding because the Association of Bicycle Makers funded the study and benefits from more cycling.  
> **Note:** Identifies the reason and dismissal, but does not explain why the funding alone is insufficient to justify that dismissal.

---

## arg-0018 — FIX: state the representativeness risk accurately and remove an unsafe preapproved strengthener.

### `arg-0018.flaw`

**Problem.** The 1-point anchor asserts that the sample is unrepresentative. The evidence establishes a risk of unrepresentativeness, not that the respondents’ views actually differ from the population’s. This is also a direct voluntary-response sample-to-population problem; **I would predict difficulty 2 rather than 3**. Pasted text Pasted text

**Set the exercise-level difficulty and this task’s difficulty to `2`.**

**Replace `difficulty_note` with:**

> This is a direct inference from voluntary website respondents to summer visitors generally. The large response count does not resolve whether the respondents represent that target population.

**Replace the 1-point anchor’s answer with:**

> The sample may not be representative of the population the editor is describing.

### `arg-0018.strengthen`

**Problem.** Matching age, residence, and visit frequency can strengthen the inference, but does not establish that the poll is a “fair guide”: selection by opinion can remain within every matched category. The reference should claim increased support, not established representativeness. Pasted text

The once-only-voting example should not be preapproved. It is a procedural restriction rather than a new fact connecting respondents to summer visitors, and the stimulus already reports a percentage of **people**, not raw votes. The key supplies no independent reason that this restriction materially improves the stated inference. The respondent constraint also does not, by itself, make this a difficulty-4 task. Pasted text Pasted text

**Replace these fields:**

```yaml
difficulty: 3

difficulty_note: >-
  The fact must concern the poll's respondents and improve the connection to
  summer visitors. Establishing visitor status, population coverage or relevant
  similarities can strengthen that connection without proving that all
  self-selection bias has disappeared.

reference: >-
  The respondents closely matched the parks' summer visitors in where they
  live, their ages and how often they visit. This reduces concern about
  differences in those characteristics and makes the poll result more
  informative about summer visitors, although selection by strength of opinion
  could still remain.

accept: >-
  Any new, premise-consistent fact about the respondents that materially
  increases support for generalizing their opposition to summer visitors,
  with an explanation. Relevant facts may establish that respondents are
  summer visitors, cover a substantial share of that population, or resemble
  it in characteristics relevant to their views. Full credit does not require
  eliminating every remaining source of bias. A separate survey is outside
  the requested fact type. A procedural restriction on repeat voting does
  not automatically qualify, particularly when the premise already reports
  percentages of people rather than votes. A qualifying relevant fact without
  an explanation earns 1.
```

**Replace rubric criterion 2 with:**

> Explains how that qualifying fact about the respondents increases support for generalizing their views to the parks’ summer visitors.

---

## Patterns to change in later batches

**Necessary assumptions need a stricter drafting gate.** Several entries are helpful safeguards or plausible strengthen­ers rewritten as necessities. For each reference and full-credit anchor, record its exact negation and identify which evidential link disappears. “Another explanation becomes possible” is not enough. Do not require a perfect alternative when a better one suffices, or one particular route when several routes could satisfy the requirement. This is the test the supplied guidelines already require. Pasted text

**Stop converting partial controls into conclusive exclusions.** A comparison group, a similar baseline, a demographic match, or a device’s age establishes only what its wording supports. When an alternative must be unavailable for the exercise to have one intended gap, independently stipulate the fact that excludes it.

**Audit scoring criterion by criterion, not by intended impression.** A generic label does not automatically earn one point under a rubric requiring a specific inferential link or explanation. Construct partial-credit anchors that visibly satisfy exactly one criterion. Keep references, acceptance notes, disqualifiers, and anchors synchronized after every edit. Pasted text

**Keep the three standards distinct:** a strengthener need not prove the conclusion; a weakener need not refute it; a necessary assumption must pass negation. Several current explanations slide between those standards.

**Treat the proposed difficulty changes as editorial estimates, not calibration.** Reserve higher labels for interacting logical demands—not merely a restrictive prompt, a large number, or an explicitly signposted denominator change. Student-performance evidence is still needed to calibrate the scale. Pasted text

---

## Triage

All ten exercises were marked "fix". Every finding is accepted except one replacement anchor (B1-22), which repeats the problem the review identifies elsewhere. Two changes apply across the batch:

- The review's proposed rubric criteria ("passes the negation test") are rewritten as observable criteria that name the kinds of bridge, as `CONTENT_GUIDELINES.md` §5 asks. Wording throughout follows the content's plain style; the substance is the review's.
- Its "partial-credit anchors satisfy exactly one criterion" rule is also applied to the generic flaw-label anchors it did not flag individually: `arg-0016.flaw` in this batch and `arg-0001`, `arg-0003`, `arg-0004` and `arg-0007` from the first eight. Each now identifies the inference without explaining it.

| # | Task | Finding | Decision | Change |
| --- | --- | --- | --- | --- |
| B1-1 | arg-0009 stimulus, flaw | Steady borrowing elsewhere does not rule out a transfer between branches, yet the key treats it as settled. | accepted | The stimulus now says a records analysis ruled out a transfer; the 0-point note cites it. |
| B1-2 | arg-0009.flaw | The 2-point anchor changes the selection criterion to "keenest on the library". | accepted | The anchor uses the stated criterion (most requests for later hours). |
| B1-3 | arg-0009.strengthen | The reference assumes any rival cause would also raise borrowing in the old hours. | accepted | New reference: the extra borrowing came from teenagers who could not visit in the old hours. |
| B1-4 | arg-0010.weaken | "Much the same kinds of problems" does not fix their difficulty, so the simpler-problems anchor is consistent and earns 1; the disqualifier is too broad. | accepted | The 0-point anchor now contradicts the 4.3 average; the disqualifier names the averages; `accept` says differences within the same kinds are not contradictions. |
| B1-5 | arg-0010.weaken | The reference counts departures instead of comparing rates. | accepted | The reference compares departure rates of unhappy and happy customers. |
| B1-6 | arg-0010.assumption | The reference's negation only makes an alternative possible; the 2-point anchor (no request for top scores) fails negation. | accepted | New reference (the rise is not entirely an artifact of who answered or how ratings were collected) and 2-point anchor (not entirely due to unrelated changes); `accept`, rubric and note rewritten; difficulty 4 to 3. |
| B1-7 | arg-0011 stimulus | A spring that has flowed for 3,000 years need not have flowed while the settlement was occupied. | accepted | The stimulus says the spring flowed during occupation. |
| B1-8 | arg-0011.flaw | The reference overstates the flaw ("little reason") and swaps the water requirement for a spring. | accepted | New reference, `accept`, criterion 2 and 2-point anchor target the unsupported "probably". |
| B1-9 | arg-0011.flaw | The generic 1-point anchor earns 0 under the rubric. | accepted | The 1-point anchor identifies the inference only. |
| B1-10 | arg-0011.assumption | A majority claim about a broad group of sites is not necessary; "certainly large" was given 1. | accepted | New reference (enough usable land) and 2-point anchor (enough food); `accept`, rubric and disqualifier rewritten; difficulty 4 to 3. |
| B1-11 | arg-0012 stimulus | The 40-versus-5 comparison alone does not rule out a citywide cause. | accepted | The stimulus adds a separate analysis ruling it out; the strengthen key treats that as given. |
| B1-12 | arg-0012.weaken | The 2-point anchor depends on work finished after installation. | accepted | The 2-point anchor is a decline already under way (25 percent a year, about 44 percent over two years). |
| B1-13 | arg-0012.weaken | The 0-point note misses that diversion is a way the cameras cut crashes. | accepted | The 0-point anchor is a truck ban at installation (outside the required period); note, `accept` and rubric updated; difficulty 4 to 3. |
| B1-14 | arg-0013.conclusion | Difficulty 4 is too high with the recommendation stated twice. | accepted | Exercise and task difficulty 3. |
| B1-15 | arg-0013.assumption | The reference is stronger than needed; the markings anchor fails negation and supports the intermediate claim, not the recommendation. | accepted | The prompt grants the intermediate conclusion; new reference (a less distorting recording exists), 2-point anchor (the distortion is a drawback) and 1-point anchor (every other recording is better). |
| B1-16 | arg-0014.flaw | The generic 1-point anchor earns 0; difficulty 4 is too high for a signposted denominator. | accepted | The 1-point anchor identifies the inference only; exercise and both tasks difficulty 2. |
| B1-17 | arg-0014.weaken | The threshold is at least two-thirds growth, not about two-thirds. | accepted | Note and `accept` state the five-thirds boundary and include an unchanged count. |
| B1-18 | arg-0015.assumption | The 2-point anchor (plants survive now) fails negation and is implied by the present cover; the note overstates the baseline; "every other respect" contradicts stated differences. | accepted | New note, `accept`, criterion 2, 2-point anchor (plants or seed surviving or arriving) and 1-point anchor (same soil and rain). |
| B1-19 | arg-0016 stimulus, flaw | "Oldest supported phone" is not "slowest"; the rule's scope is unstated. | accepted | The stimulus tests every supported phone in standard tests; `accept` and 0-point anchor updated; difficulty 3 to 2. |
| B1-20 | arg-0016.weaken | The reference's arithmetic is wrong ("most over 0.1 seconds" does not give over four seconds); the note is too narrow. | accepted | The reference has each of forty updates take 0.1 seconds in sequence; note and `accept` include delays before or after; difficulty 3 to 2. |
| B1-21 | arg-0017.flaw | The reference and 2-point anchor overcorrect ("says nothing"); the generic 1-point anchor earns 0. | accepted | Reference and criterion 2: funding justifies caution, not dismissal; new 2- and 1-point anchors. |
| B1-22 | arg-0018.flaw | The 1-point anchor asserts the sample is unrepresentative; difficulty 3 is too high. | accepted in part | Difficulty 2 and the new note accepted. The proposed anchor ("may not be representative of the population") is still a generic label, which by the review's own standard (B1-9, B1-16, B1-21) earns 0; the 1-point anchor identifies the inference only. |
| B1-23 | arg-0018.strengthen | The reference overclaims a "fair guide"; one answer per person should not be preapproved; difficulty 4 is too high. | accepted | New reference, note, `accept` and criterion 2; difficulty 4 to 3. |
| B1-24 | Patterns for later batches | Negation gate, no partial controls treated as exclusions, criterion-by-criterion anchors, three distinct standards, difficulty as an estimate. | accepted | Applied to this batch and used for batch 2. Adding them to `CONTENT_GUIDELINES.md` waits until PR #3 is on main, since it edits the docs. |

### Follow-up check

After these fixes, a separate Claude pass graded every anchor literally against its rubric and re-ran the negation tests. Every anchor scored as stated. It found seven further problems, all fixed:

- `arg-0015.assumption`: the key missed the causal bridge (removing the goats explains at least part of the recovery on the three islands); added as bridge (c) in `accept` and criterion 2.
- `arg-0011.assumption`: a frequency claim limited to sites matching both premises (spring and soil as fertile as any) is necessary and now earns 2; only claims about broader groups earn 1.
- `arg-0010.weaken`: the reference's departure rates can explain much of the rise but not all of it (at most about 4.2 from 3.6), so the reference now says "much of the rise".
- `arg-0001.flaw`: `accept` now credits the Harlow-versus-neighbors gap that criterion 2 already credits.
- `arg-0009.flaw`: the reference now describes the comparison with the other seven branches, not only the timing; the 2-point anchor's alternative is teenagers moving in from outside Fenwick, since moves within the city are ruled out.
- `arg-0015.strengthen`: the note now matches `accept`, which also credits facts showing the goats' removal explains the recovery on the three islands.
