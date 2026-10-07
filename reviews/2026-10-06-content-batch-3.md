# Peer review: answer keys for content batch 3 (arg-0029 to arg-0038)

## 1. Role and ask

You are an independent senior reviewer: a fresh Claude Opus 5.5 session at maximum effort that had no part in writing these keys. GPT-6 Pro checked content batches 1 and 2 (arg-0009 to arg-0028) and, earlier today, the selective formal method (docs/METHOD.md) and exercise schema 4, which adds a display-only form line to each task. The owner has since replaced Pro with an independent Claude reviewer, so this check is yours. Pro's lessons from those rounds are now in the content guidelines and the Method, quoted in section 5.

This is an answer-key check for ten new draft exercises (20 tasks: 6 flaw, 4 assumption, 4 strengthen, 4 weaken, 2 conclusion), with a form line on every task, so the owner approves keys and form lines once. Students will be graded against these keys by a chatbot, so a wrong key teaches the wrong lesson. Please be adversarial: try to break each key. You may read the repository at the commit named in your brief (branch content-batch-3), but do not change it.

The owner is an exam beginner and will approve the batch after your check, so your review is the expert check.

## 2. What changed since batch 2

The patterns Pro asked for at the end of its batch 2 review are now part of the content guidelines (section 5 below), and these drafts were written to them. Please check that they actually hold, not just that they are claimed:

- **Literal negation.** Each assumption reference and full-credit anchor was negated word for word, every conjunct, with the premises kept, before its note was written. The note names the evidential link that disappears. "Too strong" near misses earn 1; premises and restated conclusions earn 0.
- **Directional, material criterion 1.** Every strengthen task's first criterion reads "makes it materially more likely that … (a fact pointing the other way does not count)", and every weaken task's reads "gives a material reason to doubt that …". The 0-point strengthen anchors test this: three give a fact pointing the other way (arg-0029, arg-0034, arg-0037) and one a fact about a different question (arg-0032).
- **Scoped disqualifiers.** A premise-only disqualifier names what it covers and applies only when the answer offers nothing else.
- **A relevant fact, evidence and proof kept apart.** A strengthener need not prove the conclusion, a weakener need not refute it, and a necessary assumption must pass negation.
- **Stated controls.** Where a key treats an alternative as excluded, the stimulus states it (arg-0029: all twelve long-lived restaurants were surveyed; arg-0030: every injury is recorded; arg-0031: which passage was set in Clearline, and the reading order, were balanced; arg-0034: the two groups of companies were similar in size, industry and average pay; arg-0038: the fare cut, not any other change, caused Corran's rise). arg-0037's baseline (about 40 dead birds below each side the previous autumn) is treated as a partial control only.
- **Exact numbers and modest labels.** The arithmetic is in the difficulty notes (arg-0030's 80 percent threshold; arg-0037's counts and strike numbers). Both conclusion tasks are labelled 3, as Pro set arg-0024's similar structure, and arg-0031's flaw task is a 2 because the stimulus defines the term it turns on.
- **Form lines (new).** Every task has a `form` line (schema 4): one author-written line giving the skeleton the task turns on, in the Method's terms. The app shows it beside the reference only after the student's grade is accepted; it never enters a grading payload and is never a criterion. They were drafted by the thread that wrote the Method and edited by the author of the keys.
- **Pro's schema 4 round applied here.** Weaken criteria ask for an explanation that makes the alternative "more plausible", not "likely"; strengthen criteria keep the conclusion's own strength ("caused much of the gap", not "the cause"); notes say a comparison "reduces" a rival rather than controlling for it.
- **New flaw patterns.** The six flaw tasks each test a pattern the published content does not yet cover: survivorship (arg-0029), a base rate (arg-0030), a shifting meaning of "significant" (arg-0031), absence of evidence (arg-0032), overlooked options (arg-0033), and reverse causation behind a stated control (arg-0034).

Before this packet, a separate Claude check graded every anchor and negation. It found seven problems it rated must-fix and fourteen minor ones; all were fixed in the files below. The main ones: arg-0038's conclusion said only that crossings "would increase", so a full-credit anchor about employer-paid fares failed negation (the residents who still pay would see a cheaper fare), and the conclusion now claims "a large rise"; three flaw `accept` texts gave 0 to answers the rubric gives 1 for naming the inference; arg-0032's stimulus implied the maker's three trials were the only ones, which made a fourth study look like a premise conflict; arg-0031's stimulus did not balance which passage was set in Clearline; arg-0037's stimulus did not give the previous autumn's count, which left a rise on the west side open; and two full-credit flaw anchors did not name the argument's evidence and conclusion. Please do not assume either check was complete.

After the form lines were added, a second Claude check read every form line against its key and the Method. It found three must-fix problems (arg-0034's flaw line named only the reversed rival while the key also credits a third factor; arg-0034's strengthen line said "rule out" where the key says the fact reduces the rival; arg-0029's flaw line misused "selection" for a missing comparison) and nine minor ones, all fixed. Please check the form lines yourself as well.

## 3. What to check, for every task

1. **Correct key.** Is the reference a correct, strong answer? For flaw tasks, is it the argument's main error (and is there only one)? For conclusion tasks, is it the main conclusion, and is the rival the note names really a rival?
2. **Necessary-assumption test (assumption tasks).** Negate the reference and each full-credit anchor literally, keep every premise, and say whether the specific inference fails (not merely becomes weaker). Flag anything too strong, or anything that restates a premise or the conclusion.
3. **Strengthen and weaken.** Is each reference and full-credit anchor consistent with every premise, new, and material in the right direction? Does `accept` wrongly exclude a correct kind of answer, or let a wrong one in? Does each 0-point anchor earn 0 for the reason its note gives?
4. **Anchors and rubric agree.** Grade every anchor against the rubric and say if you would give a different score than stated.
5. **Difficulty.** Is the label (1 easiest to 5) realistic compared with real exam arguments of the same type, and is the difficulty note right about what makes it hard?
6. **Stimulus.** Any ambiguity, outside knowledge needed, or a second reasoning problem that would let a different answer be correct?
7. **Form line.** Does it state the skeleton correctly and agree with the key, in the Method's terms (an arrow only for a conditional, a rival reduced rather than closed unless the stimulus closes it, exact quantities)? Would it mislead a student who reads it after grading, for example by naming a different gap or implying a stronger answer was required?

## 4. Response format

For each exercise, give a one-line verdict (keep / fix / drop). Then list every task with a problem as: task id, the problem, and the exact replacement text you propose. Say nothing about tasks you would keep unchanged. End with any pattern you see across the batch that the author should change in later batches.

## 5. Rules the keys were written to (from CONTENT_GUIDELINES.md and METHOD.md)

### 3.1 Writing to a difficulty target

Difficulty comes from precise logical discrimination, not from hiding the conclusion, adding clauses or an unforgiving rubric. Difficulty labels are author-predicted until students have attempted the task. For a task meant to be medium or hard, the author writes a short `difficulty_note` and meets the rules that apply:

- **Structure map.** Write down the main conclusion, intermediate conclusions, premises, concessions and opposing views. A hard conclusion task has at least one plausible rival (usually an intermediate conclusion or an attributed opposing view) and the note says which way support runs. Moving the recommendation to the middle is not enough.
- **Scope.** Mark the population, time period, measured quantity and claim strength in evidence and conclusion. A scope task turns on a specific mismatch, not "the groups might differ". Check units, populations, dates and logical objects in the key as carefully as in the stimulus: bags handed out are not the weight of waste, an opening date is not a construction date, and knowing of a delay is not knowing of wrongdoing.
- **Quantifiers.** Name the boundary that matters (some, most, all, a proportion, a threshold) and check the reference against a counterexample to the tempting stronger answer.
- **Conditionals.** Translate the relationship into its direction. Match the key to the conclusion's actual strength: failing to guarantee an outcome does not refute a claim that it is likely.
- **Causes.** Rule out one plausible alternative in the stimulus and leave a consequential one open, so "correlation isn't causation" alone does not earn full credit. A partial control (a comparison group, a similar baseline) does not exclude an alternative; when the key relies on an exclusion, state the excluding fact in the stimulus.
- **Competing claims.** Every distracting claim has a clear role (someone else's view, a concession, background, an intermediate conclusion). Ambiguous attribution is an editing problem, not difficulty.
- **Two demands, no padding.** A hard task combines two interacting demands (for example an intermediate conclusion and a quantifier) and drops complications that serve neither. No outside knowledge.
- **Near misses.** Write at least two plausible near-miss answers and say exactly why each fails (too strong, wrong population, helpful but not required, denies a premise). Use them as anchors or in notes.
- **Strengthen and weaken.** For advanced tasks, constrain the kind of fact asked for (for example about the comparison group or the measurement) and accept every fact that satisfies the constraint. Keep a relevant fact, evidence and proof apart: availability is not attendance, an unchanged gap is not "no effect", a possible justification is not proof of innocence, and a business decision made in the same month may be the policy's own effect. A weakener need not refute the conclusion.
- **Labels and arithmetic.** Check every calculation and threshold in the stimulus and key exactly. Keep difficulty labels modest: a signposted mismatch is a 2, and a prompt that names the missing comparison lowers the difficulty.

### 3.2 The necessary-assumption check

For every assumption task, negate the reference and each full-credit anchor, keep the premises, and confirm that the specific inference fails, not merely that the conclusion becomes less likely. Negate the literal text of the answer, every conjunct, not what it was meant to say, and name the evidential link that disappears; "another explanation becomes possible" is not enough. Don't require a perfect alternative when a better one would do. The assumption must not restate the conclusion or a premise, and must not be stronger than the argument needs. Not every flaw argument supports a clean assumption task; when it doesn't, leave the task out.

### 5. References, acceptance notes, anchors and rubrics

- **Reference:** what a strong student would write in a minute or two. For open-ended skills it is one example among many.
- **Counts as correct (`accept`):** the logical properties every correct answer shares, not a list of paraphrases. Required for open-ended skills.
- **Rubric:** 1–4 criteria, each worth exactly one point, each observable in the answer ("names the switch and the fall in scores"), never vague ("shows understanding"). A criterion may only require what the task prompt asks for. If full credit needs something, such as leaving out the reasons, the prompt says so.
- **Alternatives:** where a rubric credits an alternative explanation, it must be offered as a possibility, not invented evidence asserted as fact.
- **Disqualifiers:** only for misunderstandings severe enough that partial credit would mislead, e.g. stating the opposite conclusion. A disqualifier for restating a premise or the conclusion names what it covers and applies only when the answer offers nothing else: "Mentioning a stated claim while also giving a distinct assumption does not trigger this."
- **Strengthen and weaken criteria:** criterion 1 is directional and material ("makes it materially more likely that…", "gives a material reason to doubt that…"), never "bears on whether…", which credits a fact pointing the wrong way. In `accept`, an unexplained fact that meets criterion 1 is "a qualifying fact" and earns 1.
- **Anchors:** one sample answer for every possible score, including at least one full-credit answer unlike the reference for open-ended skills. Reference, `accept`, rubric and anchors must agree: grade each anchor against the rubric and check you get its stated score. A partial-credit anchor meets exactly one criterion (for a flaw task, it identifies the inference without saying why it fails); a bare flaw label earns 0.
- **Likely errors:** the 2–4 tags a grader is most likely to need.

### METHOD.md §3. Three kits

Switch a kit on by meaning, with words only as cues: "must" can state an obligation, and "because" usually introduces evidence.

#### 3.1 Logic: when the answer depends on form

Cues: if, only if, unless, whenever, all, every, no, none, most, some, and, or.

- **Translate by sentence pattern**, not by word list.
  - "If A, then B" and "A only if B" both mean A → B: A guarantees B, and B is required for A.
  - "Only A are B" means B → A.
  - "A unless B" means "if not B, then A". It does not say that B rules A out.
  - "No A is B" means A → not B.
  - "Or" means at least one, possibly both, unless the sentence says otherwise.
- **Valid moves:** the contrapositive (A → B gives not B → not A) and chaining (A → B and B → C give A → C).
- **Traps:** reversing (A → B does not give B → A) and negating both sides (A → B does not give not A → not B).
- **De Morgan** where it pays: "not (A and B)" is "not A, or not B"; "not (A or B)" is "not A and not B". Use it to contrapose a rule with a compound condition and to negate a compound answer.
- **Negation pairs** for the assumption test, with the group and time held fixed. These are opposites, not equivalences, and the negation is the plain opposite, not the extreme.

  | Statement | Its negation |
  | --- | --- |
  | All A are B | At least one A is not B |
  | Some A are B (at least one, possibly all) | No A is B |
  | Most A are B (more than half) | Half or fewer of A are B |
  | Always | Not always |
  | A and B | Not A, or not B |
  | A or B | Neither A nor B |
  | If A, then B | A without B (for a rule: at least one case of A without B) |

  "Not necessary" does not mean "necessarily not". An "and" assumption is necessary exactly when each half is. An "or" assumption is necessary whenever either half is, and can be necessary when neither half is on its own (a plan may need at least one working power source without needing any particular one).
- **Quantifiers, in exact shapes:**
  - All A are B, and all B are C: all A are C.
  - All A are B, and some A are C: some B are C.
  - All A are B, and some B are C: nothing follows about A and C.
  - Most A are B, and most A are C (the same group A): some B are C.
  - Some A are B, and some A are C: no overlap of B and C is guaranteed.
  - "All" alone does not say that any A exists.
- **Keep what the sentence commits to.** "Could", "should" and "past winners" do not become "does", "will" and "all future winners". A counterexample defeats a guarantee, not a claim that something is likely.

#### 3.2 Quantity: when numbers or shares carry the argument

Cues: percent, share, rate, average, per, each, total, any number. Ask: out of what (denominator), counting what (unit), over what period? Try an easy counterexample before exact arithmetic, unless a threshold decides the question.

- **Count = rate × base.** A share can fall while the count rises. If 15% of appointments were missed before and 9% now, missed appointments rose when bookings grew by more than two-thirds (15/9 = 5/3).
- **Unit of analysis, with bounds.** 1,000 restaurants inspected 4 times each, with 1 inspection in 10 failing, gives 400 failed inspections: at 100 to 400 restaurants (10% to 40%), not necessarily one in ten.
- **Part and whole.** Parts that each pass a test alone may fail it together.
- **Proxy and target.** What was measured (bags handed out, camera sightings) may not be what is claimed (weight of waste, number of animals).
- **Averages.** An average hides the spread; an average across groups depends on each group's size. A rise from 10% to 12% is 2 percentage points, or 20%.

#### 3.3 Evidence: causes, samples and measurement

Cues: caused, led to, made, raised, responsible for, since then, a survey or sample. When two things go together, list the rivals to "X caused Y":

1. **Reversed:** Y caused X.
2. **Something else:** a third factor drives both, or decides who ends up with X (selection).
3. **Chance or a bounce-back:** a group picked at an unusual high or low tends to drift back toward normal.
4. **Measurement:** what was counted is not what the Claim is about.

Check which rivals the passage **rules out or reduces** (a comparison group, the earlier trend, matched conditions) and which stay open. A comparison group reduces other explanations; it does not eliminate them. To strengthen, rule out or reduce an open rival or show how the cause works. To weaken, make an open rival plausible, keeping every premise true. A rival can be true alongside a real cause, so a weakener need not prove the cause did nothing. "X causes Y" does not make X sufficient, necessary or the only cause, so a causal claim never becomes an arrow for the logic kit.

### METHOD.md §5. For authors (form lines and key checks)

- **Form lines.** Each task may carry one author-written line giving the skeleton the task turns on, in the kits' terms, for example "Rule: renew → attendance rose. The director infers rose → renew: the arrow is reversed." A form line is shown with the reference only after the task's grade is accepted, never enters a grading payload, and is never a criterion. It is the `form` field of exercise schema 4 (`EXERCISE_FORMAT.md` §3.1). A key check reviews the form lines along with the keys.
- **Support test (author notes only).** A new fact F strengthens a claim C, given the evidence E, when F is more expected if C is true than if it is false: P(F | C, E) > P(F | not C, E). Equality means F is neutral about C, not irrelevant to everything. The test gives a direction, not a size; rubrics still ask for a material effect (`CONTENT_GUIDELINES.md` §5).
- **Key checks.** Besides `CONTENT_GUIDELINES.md` §3.1–§3.2, check each key against §3: modality, time and scope kept; a counterexample used only against a guarantee; negations literal, with "and" and "or" handled as above; quantifier inferences in their exact shapes; arithmetic with its denominator, unit and period; rivals described as ruled out or reduced; no causal claim treated as a conditional.

## 6. The ten exercises

### File: content/exercises/arg-0029.md

````yaml
---
schema: 4
id: arg-0029
status: draft
kind: argument
difficulty: 2
topics: [food, small business]
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
      Scope of the evidence: the magazine looked only at restaurants that lasted. Ten of twelve shows that
      family recipes are common among long-lived restaurants, not that they help, unless they were less common
      among restaurants that closed. If, say, ten in twelve of the restaurants that closed also cooked from
      family recipes, the share among the survivors shows nothing about what helped them last. All twelve
      long-lived restaurants were surveyed, so the number surveyed is not the problem.
    prompt: Describe the main reasoning error in one or two sentences.
    max: 2
    reference: >-
      The magazine looks only at restaurants that have lasted; without knowing how common family recipes were
      among the restaurants that opened and later closed, the ten in twelve does not show that family recipes
      helped any restaurant stay in business.
    accept: >-
      Any answer that identifies the move from "ten of the twelve restaurants open for more than twenty years
      cook from family recipes" to "family recipes help a restaurant stay in business", and says why it does
      not follow: the magazine looked only at restaurants that lasted, so unless family recipes were less
      common among restaurants that closed, their frequency among the survivors shows nothing about what
      helped them last. Saying that family recipes may simply be just as common among Dunmore's other
      restaurants makes the same point. An answer whose only objection is another possible cause of these
      restaurants' survival, such as good locations, without the missing comparison with restaurants that did
      not last, does not identify the main error and earns at most 1. Objecting that twelve is a small sample
      misses the point, since all twelve long-lasting restaurants were surveyed.
    rubric:
      - Ties the error to this argument, naming what the magazine found about the long-lasting restaurants (ten of twelve cook from family recipes) and the conclusion that family recipes help a restaurant stay in business.
      - Says why the inference fails, namely that the magazine looked only at restaurants that lasted, so without knowing whether family recipes were less common among restaurants that closed (or among Dunmore's restaurants generally), their frequency among the survivors does not show that they helped.
    anchors:
      - points: 2
        answer: >-
          It only looks at the places that survived. If the restaurants that went under used family recipes
          just as often, ten out of twelve tells you nothing about whether the recipes help a restaurant last.
      - points: 1
        answer: >-
          The magazine goes from ten of the twelve long-lasting restaurants using family recipes to the claim
          that family recipes help a restaurant last.
        note: identifies the inference but does not say why it fails
      - points: 0
        answer: Twelve restaurants is too small a sample to prove anything.
        note: >-
          near miss: all twelve long-lasting restaurants were surveyed, so the problem is not the number
          surveyed but the missing comparison with restaurants that closed
    likely_errors: [unrepresentative-sample, missed-alternative, wrong-gap, understated]
    form: >-
      Evidence: 10 of 12 long-lived restaurants cook mainly from family recipes. Claim: family recipes help a
      restaurant last. Missing comparison: only survivors were counted; the share among restaurants that
      closed is unknown.
  - key: strengthen
    status: active
    skill: strengthen
    difficulty: 2
    difficulty_note: >-
      The missing comparison is the main gap, so the strongest strengtheners show that family recipes were
      less common among restaurants that did not last, or that restaurants using them closed less often. Facts
      that show how family recipes kept these restaurants' customers coming back, or that rule out another
      reason for their long life, also help without proving the conclusion. Repeating the ten in twelve is not
      new.
    prompt: >-
      Give a new fact that, if true, would materially strengthen the argument, and explain how. Treat the
      stated premises as true.
    max: 2
    reference: >-
      Of the Dunmore restaurants that opened in the same years as these twelve and have since closed, only
      about one in five cooked mainly from family recipes. Family recipes were then far more common among the
      restaurants that lasted than among those that failed, which supports the idea that they helped.
    accept: >-
      Any new fact, consistent with the premises and not already stated in them, that makes it more likely
      that cooking from family recipes helps a Dunmore restaurant stay in business, with an explanation of
      how. Main kinds: the comparison the argument lacks (family recipes were less common among restaurants
      that closed, or restaurants using them closed less often); a way family recipes kept these restaurants
      going (their regular customers say they come back for the family dishes). A strengthener need not prove
      the conclusion. A qualifying new fact whose bearing is not explained earns 1. A fact pointing the other
      way, such as family-recipe restaurants often closing within a few years, earns 0.
    rubric:
      - Gives a new fact, consistent with the stated premises and not already stated in them, that makes it materially more likely that cooking from family recipes helps a Dunmore restaurant stay in business (a fact pointing the other way does not count).
      - Explains how the fact strengthens the argument, namely why it makes family recipes more likely to have helped (for example, because they were less common among restaurants that closed, or because they keep customers coming back).
    anchors:
      - points: 2
        answer: >-
          Among Dunmore restaurants opened over the last thirty years, those cooking mainly from family
          recipes were twice as likely as the others to still be open ten years later. That's the comparison
          the magazine left out, and it points toward the recipes helping.
        note: >-
          a different strengthener from the reference (a survival rate for each kind of restaurant rather than
          the share among those that closed)
      - points: 1
        answer: >-
          Most of the Dunmore restaurants that closed in the last twenty years did not cook from family
          recipes.
        note: the right kind of fact, but the answer does not explain how it supports the argument
      - points: 0
        answer: Several new Dunmore restaurants that cooked from family recipes closed within a year.
        note: >-
          points the other way: family-recipe restaurants failing quickly gives a reason to doubt the
          conclusion
    likely_errors: [no-reasoning, irrelevant, missed-alternative, understated]
    form: >-
      Missing comparison: family recipes among the restaurants that closed. A fact showing they were much
      rarer there reduces the survivors-only rival.
---
Twelve of the restaurants now open in the city of Dunmore have been in business for more than twenty
years. A food magazine interviewed the owners of all twelve and found that ten of the restaurants cook
mainly from recipes handed down in the owner's family. The magazine concludes that cooking from family
recipes helps a Dunmore restaurant stay in business for a long time.
````

### File: content/exercises/arg-0030.md

````yaml
---
schema: 4
id: arg-0030
status: draft
kind: argument
difficulty: 3
topics: [sports, safety]
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
      Proportions: 48 of the 60 injuries (80 percent) happened on the beginner walls, but the conclusion is
      about the chance that a single climb ends in injury. If b is the share of climbs made on the beginner
      walls, a beginner climb is more likely to end in injury only if 48 divided by b is more than 12 divided
      by (1 minus b), that is, only if b is under 80 percent. If four in five climbs or more were made on the
      beginner walls, a climb there is no more likely to end in injury. Every injury is recorded, so answers
      about unrecorded injuries miss the point.
    prompt: Describe the main reasoning error in one or two sentences.
    max: 2
    reference: >-
      The manager treats the share of injuries that happened on the beginner walls as if it showed how risky
      each climb there is, without knowing how many climbs were made on each kind of wall; if four in five
      climbs or more were on the beginner walls, a climb there would be no more likely to end in injury than
      one on the harder walls.
    accept: >-
      Any answer that identifies the move from "48 of the 60 recorded injuries happened on the beginner walls"
      to "a climb on a beginner wall is more likely to end in injury", and says why it does not follow: the
      number of injuries on each kind of wall depends on how many climbs were made there, and if the beginner
      walls carry a large enough share of the climbing (four in five climbs or more), they could have 48 of
      the 60 injuries even if each climb there is no riskier. Exact numbers are not required. Answers saying
      that beginners may be clumsier, or that easy routes make climbers careless, offer reasons the conclusion
      might be true rather than an error in the reasoning, and earn at most 1, for naming the inference.
      Answers about unrecorded injuries conflict with the statement that every injury is recorded and also
      earn at most 1.
    rubric:
      - Ties the error to this argument, naming the evidence (48 of the 60 recorded injuries happened on the beginner walls) and the conclusion about the chance that a climb there ends in injury.
      - Says why the inference fails, namely that the injuries on each kind of wall depend on how many climbs were made there, so if the beginner walls carried a large enough share of the climbs, they could have 48 of the 60 injuries even though each climb there is no riskier.
    anchors:
      - points: 2
        answer: >-
          More injuries on the beginner walls might just mean more climbing happens there. If, say, nine
          climbs in ten are on those walls, 48 of 60 injuries actually means each beginner climb is safer.
      - points: 1
        answer: >-
          The manager goes from most of the injuries happening on the beginner walls to a climb there being
          more likely to end in injury.
        note: identifies the inference but does not say why it fails
      - points: 0
        answer: Beginners are often clumsier than experienced climbers, so they get hurt more.
        note: >-
          near miss: a reason the conclusion might be true, not an error in the reasoning
    likely_errors: [scope-shift, missed-alternative, wrong-gap, understated]
    form: >-
      Evidence: 48 of 60 injuries were on beginner walls (a share of injuries). Claim: a beginner climb is
      riskier (injuries per climb). Missing denominator: how many climbs were made on each kind of wall.
  - key: assumption
    status: active
    skill: assumption
    difficulty: 3
    difficulty_note: >-
      Quantifiers: the conclusion holds only if fewer than 80 percent of climbs were made on the beginner
      walls (fewer than four beginner climbs for each climb on the harder walls). A necessary assumption may
      set its limit at 80 percent or anywhere above it: "the beginner walls did not carry nearly all of the
      climbs" is weaker than the exact limit but still needed. A limit below 80 percent, such as "most climbs
      were on the harder walls", is stronger than needed. A claim that every injury is recorded repeats a
      premise.
    prompt: >-
      State an assumption the argument needs: a claim that, if false, would make the argument fall apart. (A
      necessary assumption; it need not make the argument airtight.)
    max: 2
    reference: Fewer than 80 percent of the climbs made at Crag Hall last year were on the beginner walls.
    accept: >-
      The inference under test is from "48 of the 60 injuries, all of which were recorded, happened on the
      beginner walls" to "a climb on a beginner wall is more likely to end in injury than one on a harder
      wall". Any unstated claim counts whose denial, with every premise kept, would defeat that inference. The
      main kind limits the share of climbs made on the beginner walls: the argument needs the share to be
      under 80 percent (fewer than four beginner climbs for every climb on the harder walls), so a claim that
      the share is below 80 percent, or below any higher figure, or that the beginner walls did not carry
      nearly all of the climbs, counts. Claims stronger than needed earn 1, such as that most climbs were on
      the harder walls, or that the two kinds of wall were used about equally. Repeating a premise or
      restating the conclusion earns 0.
    disqualifiers:
      - Offers only a stated premise (such as that 48 of the 60 injuries happened on the beginner walls) or a version of the conclusion (that a beginner climb is more likely to end in injury) as the assumption, with no distinct unstated claim. Mentioning a stated claim while also giving a distinct assumption does not trigger this.
    rubric:
      - States a claim the argument does not state that limits how much of the gym's climbing was done on the beginner walls (for example, that it was under 80 percent of all climbs), not a premise or a version of the conclusion.
      - States it no more strongly than the argument needs, so that if it were false the beginner walls would carry at least four climbs for every climb on the harder walls, rather than a claim that most climbs were on the harder walls or that the two kinds of wall were used about equally.
    anchors:
      - points: 2
        answer: The beginner walls didn't account for nearly all of the climbs made at the gym last year.
        note: >-
          weaker than the reference but still needed: if nearly all climbs were on the beginner walls, 48 of
          60 injuries would mean each climb there was less likely to end in injury
      - points: 1
        answer: Most of the climbs made at Crag Hall last year were on the harder walls.
        note: >-
          near miss, too strong: the argument holds as long as fewer than 80 percent of climbs were on the
          beginner walls, so those walls could still carry most of the climbing
      - points: 0
        answer: Of the 60 injuries recorded last year, 48 happened on the beginner walls.
        note: a stated premise, not an assumption (disqualifier)
    likely_errors: [overstated, restates-conclusion, wrong-gap, scope-shift]
    form: >-
      Risk per climb = injuries ÷ climbs. With 48 of 60 injuries (80%) on beginner walls, a beginner climb is
      riskier only if under 80% of climbs were made there.
---
The Crag Hall climbing gym records every injury that happens there, however minor. Of the 60 injuries it
recorded last year, 48 happened on its beginner walls, where the routes are easiest, and 12 on its harder
walls. The gym's manager concludes that a climb on one of the beginner walls is more likely to end in
injury than a climb on one of the harder walls.
````

### File: content/exercises/arg-0031.md

````yaml
---
schema: 4
id: arg-0031
status: draft
kind: argument
difficulty: 2
topics: [psychology, design]
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
      Shifting meaning: "statistically significant" is defined in the stimulus as unlikely to have arisen by
      chance, while "a significant difference" in the conclusion means one large enough to matter. With 2,000
      readers, even a very small average speed-up can be statistically significant, so the evidence shows a
      reliable difference, not a large one. The stimulus defines the term, which signposts the shift, so the
      task is a 2. It also balances which passage was set in Clearline and the reading order, so answers about
      an easier passage or the order miss the gap.
    prompt: Describe the main reasoning error in one or two sentences.
    max: 2
    reference: >-
      The blog slides from "statistically significant", which means only that the speed-up was unlikely to be
      due to chance, to "a significant difference", meaning a large one; with 2,000 readers even a tiny
      speed-up can be statistically significant, so the study does not show that Clearline makes much
      difference.
    accept: >-
      Any answer that identifies the move from "the difference in reading speed was statistically significant"
      to "switching would make a significant difference to how quickly people read", and says why it does not
      follow: statistical significance, as the stimulus defines it, means only that the difference was
      unlikely to be chance, not that it was large, so the speed-up could be too small to matter. Mentioning
      the number of readers is not required. Answers about the reading order or an easier Clearline passage
      conflict with the stimulus, which balances both, and earn at most 1, for naming the inference. An answer
      whose only objection is that a short test may not carry over to everyday newspaper reading names a
      weaker concern and earns at most 1.
    rubric:
      - Ties the error to this argument, naming the study's statistically significant difference and the conclusion that switching would make a significant difference to reading speed.
      - Says why the inference fails, namely that statistically significant means only unlikely to be due to chance, not large, so the speed-up could be too small to matter.
    anchors:
      - points: 2
        answer: >-
          Statistically significant just means the gap probably isn't a fluke, not that it's big. With 2,000
          people, a speed-up of a second or two could be significant in that sense and still be trivial, so
          the study doesn't show that switching would make a real difference to reading speed.
      - points: 1
        answer: >-
          The blog goes from the speed difference being statistically significant to Clearline making a
          significant difference to reading speed.
        note: identifies the inference but does not say why it fails
      - points: 0
        answer: Some readers may have read the Clearline passage second, after warming up.
        note: >-
          near miss: half the readers read their Clearline passage first, so the order was balanced and does
          not explain the result
    likely_errors: [misread-stimulus, scope-shift, wrong-gap, understated]
    form: >-
      Evidence: the speed-up is statistically significant (unlikely to be chance). Claim: a significant
      (large) difference. Shift: "significant" changes meaning, and the size of the speed-up is never given.
  - key: weaken
    status: active
    skill: weaken
    difficulty: 2
    difficulty_note: >-
      Measured size: the premises give a statistically significant difference but not its size, so a new fact
      about how small the speed-up was, or about the speed-up fading once readers were used to the typeface,
      weakens the conclusion that switching would make a significant difference. Facts about how well people
      understood the passages concern comprehension, not speed, unless the answer ties them to speed.
    prompt: >-
      Give a new fact that, if true, would materially weaken the argument, and explain how. Treat the stated
      premises as true.
    max: 2
    reference: >-
      On average, readers were only about one percent faster in Clearline, saving under two seconds on
      passages that took about three minutes to read. A difference that small is real but trivial, so
      switching would not make a significant difference to how quickly people read.
    accept: >-
      Any new fact, consistent with every premise (2,000 readers, each passage set in Clearline for half of
      them, a balanced reading order, and a statistically significant speed-up with Clearline), that gives a
      real reason to doubt that switching to Clearline would make a significant difference to how quickly
      people read newspapers, plus an explanation of how. Main kinds: the speed-up was very small; it faded
      once readers were used to Clearline; it came almost entirely from a small group of readers while most
      read no faster; it shrank or vanished when people read whole newspapers rather than short passages.
      Facts about understanding, enjoyment or cost that the answer does not tie to reading speed do not count.
      A qualifying fact whose effect is not explained earns 1. A fact that denies a premise, such as the
      difference not being statistically significant, earns 0.
    disqualifiers:
      - Denies a stated premise, for example that the readers were faster on average with Clearline or that the difference was statistically significant.
    rubric:
      - Gives a new fact, consistent with the stated premises and not already stated in them, that gives a material reason to doubt that switching to Clearline would make a significant difference to how quickly people read.
      - Explains how the fact weakens the argument, namely why, even granting a statistically significant speed-up, it makes a large effect on everyday reading speed less likely (for example, because the speed-up was tiny or faded once readers were used to the typeface).
    anchors:
      - points: 2
        answer: >-
          When the same readers were tested again after reading Clearline every day for a month, they were no
          faster with it than with the standard typeface. The first result looks like a novelty effect, so
          switching probably wouldn't change reading speed for long.
        note: a different weakener from the reference (the speed-up fading rather than being small)
      - points: 1
        answer: >-
          The average reader finished in Clearline less than two seconds sooner, on passages that took about
          three minutes to read.
        note: the right fact, but the answer does not explain how it undercuts the conclusion
      - points: 0
        answer: >-
          Readers understood passages in Clearline slightly less well than passages in the other typeface.
        note: >-
          near miss: comprehension is not reading speed, and the answer does not tie it to speed
    likely_errors: [irrelevant, no-reasoning, contradicts-premise, understated]
    form: >-
      Size, not chance: a fact showing the speed-up is tiny, or fades once readers are used to Clearline,
      leaves it statistically significant but gives material reason to doubt "a significant difference".
---
In a study, 2,000 adults each read two passages, one set in a standard newspaper typeface and the other
in a new typeface called Clearline. Each passage was set in Clearline for half of the readers, and half
of them read their Clearline passage first. On average they read faster in Clearline, and the researchers
reported that the difference was statistically significant, meaning that it was unlikely to have arisen
by chance. A design blog concludes that switching newspapers to Clearline would make a significant
difference to how quickly people read them.
````

### File: content/exercises/arg-0032.md

````yaml
---
schema: 4
id: arg-0032
status: draft
kind: argument
difficulty: 2
topics: [health, medicine]
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
      Absence of evidence: the trials measured only sleep, so their silence about the liver is not evidence
      that the liver was unharmed. The conclusion needs evidence from something that could have detected liver
      harm. The number of participants is not the main problem, since a trial of any size that never looks at
      the liver cannot show the liver is unharmed.
    prompt: Describe the main reasoning error in one or two sentences.
    max: 2
    reference: >-
      The maker treats the trials' silence about the liver as showing that Calmora does not harm it, but the
      trials measured only sleep, so they could have missed liver harm; failing to find a harm no one looked
      for does not show there is none.
    accept: >-
      Any answer that identifies the move from "none of the trials' reports mentions liver harm" to "Calmora
      is safe for the liver", and says why it does not follow: the trials measured only sleep and so were not
      looking for liver harm, and not finding a harm that no one looked for is not evidence that there is
      none. Answers saying only that 900 participants is too few, or that the trials were too short, name a
      weaker concern that would remain even if the trials had looked at the liver, and earn at most 1. Answers
      that attack the maker's motives rather than its reasoning do not say why the inference fails and earn at
      most 1, for naming the inference.
    rubric:
      - Ties the error to this argument, naming the trials' reports saying nothing about liver harm and the conclusion that Calmora is safe for the liver.
      - Says why the inference fails, namely that the trials measured only sleep, so they were not looking for liver harm and could have missed it.
    anchors:
      - points: 2
        answer: >-
          The trials only tracked sleep, so they'd never have noticed liver damage unless someone happened to
          bring it up. Their silence about the liver doesn't show Calmora is safe for it: not finding a
          problem you weren't looking for doesn't show it isn't there.
      - points: 1
        answer: >-
          The maker goes from the trials not mentioning any liver harm to Calmora being safe for the liver.
        note: identifies the inference but does not say why it fails
      - points: 0
        answer: The maker profits from selling Calmora, so its claims can't be trusted.
        note: >-
          near miss: an attack on the source's motives, not an error in the argument's reasoning
    likely_errors: [overstated, missed-alternative, attacks-source, understated]
    form: >-
      Evidence: no liver harm reported by trials that measured only sleep. Claim: safe for the liver.
      Measurement: not finding a harm no one looked for does not show there is none.
  - key: strengthen
    status: active
    skill: strengthen
    difficulty: 2
    difficulty_note: >-
      The three trials cannot show anything about the liver, so a strengthener has to come from something that
      could detect liver harm: a study that measured liver function, a reporting system that would have caught
      liver problems, or facts about how the body handles the supplement. Facts about how well Calmora helps
      sleep are not about the liver, and a fact saying the three trials did test the liver denies a premise.
    prompt: >-
      Give a new fact that, if true, would materially strengthen the argument, and explain how. Treat the
      stated premises as true.
    max: 2
    reference: >-
      A separate year-long study by university researchers gave Calmora to 500 people and tested their liver
      function every three months, finding no more liver problems than in a similar group given a dummy pill.
      That is direct evidence about the liver, which the sleep trials did not provide.
    accept: >-
      Any new fact, consistent with the premises and not already stated in them, that makes it more likely
      that Calmora is safe for the liver, with an explanation of how. Main kinds: another study that measured
      liver function in people taking Calmora and found no harm; a monitoring system that would have caught
      liver problems among Calmora's users and found none; facts about how the body handles Calmora that make
      liver harm unlikely (for example, it leaves the body without being processed by the liver). A fact
      claiming that the maker's three trials tested the liver denies the premise that they measured only
      sleep. A strengthener need not prove safety. A qualifying new fact whose bearing is not explained earns
      1. A fact pointing the other way, such as reports of liver problems in Calmora users, earns 0.
    rubric:
      - Gives a new fact, consistent with the stated premises and not already stated in them, that makes it materially more likely that Calmora is safe for the liver (a fact pointing the other way does not count).
      - Explains how the fact strengthens the argument, namely why it makes liver harm from Calmora less likely (for example, because a study that looked at the liver found none, or because liver harm would have been noticed).
    anchors:
      - points: 2
        answer: >-
          Doctors in the countries where Calmora is sold must report any suspected liver damage from
          supplements, and in ten years of sales none has been reported for Calmora, though many have been for
          other herbal products. So liver harm from it would probably have been noticed by now.
        note: >-
          a different strengthener from the reference (a reporting system that would have caught liver harm,
          rather than a study that tested the liver)
      - points: 1
        answer: A study that took liver blood tests from 300 Calmora users over a year found no liver changes.
        note: the right kind of fact, but the answer does not explain how it supports the argument
      - points: 0
        answer: In the trials, Calmora helped participants sleep about an hour longer.
        note: >-
          not about the liver: it bears on whether Calmora works, not on whether it is safe for the liver
    likely_errors: [no-reasoning, irrelevant, contradicts-premise, understated]
    form: >-
      Reduce the measurement gap: a study that actually tested liver function and found no more liver problems
      than with a dummy pill.
---
Calmora is an herbal sleep aid sold without a prescription. Its maker has run three clinical trials of
it, with 900 participants in all. The trials measured only how long the participants slept and how often
they woke during the night, and none of the trials' reports mentions any harm to the liver. The maker
concludes from these trials that the supplement is safe for the liver.
````

### File: content/exercises/arg-0033.md

````yaml
---
schema: 4
id: arg-0033
status: draft
kind: argument
difficulty: 2
topics: [transport, local government]
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
      Overlooked options: the engineer's premise says only that delays will worsen if nothing is done. The
      councillor treats the two remedies the council studied as the only things that could be done, so ruling
      them out seems to leave nothing. Cheaper measures (retiming the traffic lights, more buses, staggered
      working hours) or outside money for one of the studied remedies would each count as doing something.
      Answers disputing the cost or the engineer's forecast deny premises.
    prompt: Describe the main reasoning error in one or two sentences.
    max: 2
    reference: >-
      The councillor assumes that widening the street and building a bypass are the only ways to do something
      about the traffic, so that ruling them out means nothing can be done; cheaper measures, such as retiming
      the traffic lights or running more buses, could still keep the delays from growing.
    accept: >-
      Any answer that identifies the move from "the two remedies the council studied are unaffordable" to
      "delays are bound to keep getting worse", and says why it does not follow: the engineer says only that
      delays will worsen if nothing is done, and the councillor overlooks that something other than the two
      studied remedies could be done (a cheaper measure, or money from outside the town for one of the studied
      remedies). Naming a particular alternative is not required. Answers that dispute the cost of the
      remedies or the engineer's forecast deny premises and do not say why the inference fails; they earn at
      most 1, for naming the inference.
    rubric:
      - Ties the error to this argument, naming the two unaffordable remedies and the conclusion that delays are bound to keep getting worse.
      - Says why the inference fails, namely that the councillor treats the two studied remedies as the only things that could be done, overlooking other measures that might stop the delays from growing.
    anchors:
      - points: 2
        answer: >-
          It assumes the only fixes are widening the street or building a bypass. Even if neither is
          affordable, the town could try something cheaper, like retiming the lights or adding buses, so worse
          delays aren't inevitable.
      - points: 1
        answer: >-
          The councillor goes from the town being unable to afford the two remedies to the delays being bound
          to keep getting worse.
        note: identifies the inference but does not say why it fails
      - points: 0
        answer: The engineer's forecast could be wrong, and traffic might stop growing on its own.
        note: >-
          near miss: it disputes the engineer's forecast, a premise, instead of identifying the error in the
          councillor's reasoning
    likely_errors: [missed-alternative, contradicts-premise, wrong-gap, understated]
    form: >-
      Rule: nothing done → delays worsen. Evidence: widening and a bypass are unaffordable. Claim: delays are
      bound to worsen. Gap: it assumes those two remedies are the only things that could be done.
  - key: weaken
    status: active
    skill: weaken
    difficulty: 2
    difficulty_note: >-
      The conclusion that delays are bound to worsen needs nothing to be done. A weakener shows that something
      could still be done: an affordable measure that would cut the delays or slow their growth, or money from
      outside the town for one of the studied remedies. Saying a remedy is cheaper than the council was told
      denies a premise.
    prompt: >-
      Give a new fact that, if true, would materially weaken the argument, and explain how. Treat the stated
      premises as true.
    max: 2
    reference: >-
      The engineer estimates that retiming the traffic lights along Bridge Street, which would cost the town
      little, would cut rush-hour delays there by a fifth. Something affordable can still be done, which gives
      reason to doubt that the delays are bound to keep getting worse.
    accept: >-
      Any new fact, consistent with every premise (a decade of growing traffic, the engineer's forecast that
      delays will worsen unless something is done, and both studied remedies costing far more than the town
      can afford), that gives a real reason to doubt that the delays are bound to keep getting worse, plus an
      explanation of how. Main kinds: an affordable measure that would reduce the delays or slow their growth
      (retimed lights, more buses, staggered working hours); money from outside the town that would pay for
      widening the street or the bypass; something already planned that would take traffic off Bridge Street.
      A qualifying fact whose effect is not explained earns 1. A fact that denies a premise, such as one of
      the remedies costing little, earns 0.
    disqualifiers:
      - Denies a stated premise, for example that widening the street or building a bypass would cost far more than the town can afford.
    rubric:
      - Gives a new fact, consistent with the stated premises and not already stated in them, that gives a material reason to doubt that rush-hour delays on Bridge Street are bound to keep getting worse.
      - Explains how the fact weakens the argument, namely why it means something could still be done about the delays (for example, an affordable measure that would reduce them, or outside money for one of the studied remedies).
    anchors:
      - points: 2
        answer: >-
          The regional government has offered to pay for a bypass for Marlow, apart from a share the town can
          afford. The town may be able to build it after all, so the delays needn't keep getting worse.
        note: >-
          a different weakener from the reference (outside money for a studied remedy rather than a cheaper
          measure)
      - points: 1
        answer: >-
          Retiming the traffic lights on Bridge Street would cost little and would cut rush-hour delays there
          by a fifth.
        note: the right fact, but the answer does not explain how it undercuts the conclusion
      - points: 0
        answer: >-
          Widening Bridge Street would cost much less than the council was told, little enough for the town to
          afford.
        note: denies the premise that each remedy would cost far more than the town can afford (disqualifier)
    likely_errors: [contradicts-premise, no-reasoning, irrelevant, understated]
    form: >-
      Rule: nothing done → worse. An affordable measure that would cut delays means something can be done, so
      the rule no longer supports "bound to get worse".
---
Rush-hour traffic on Bridge Street in the town of Marlow has grown every year for a decade, and the
town's engineer reports that rush-hour delays there will keep getting worse unless something is done. The
council has studied two remedies, widening the street and building a bypass, and each would cost far more
than the town can afford. A councillor concludes that rush-hour delays on Bridge Street are bound to keep
getting worse.
````

### File: content/exercises/arg-0034.md

````yaml
---
schema: 4
id: arg-0034
status: draft
kind: argument
difficulty: 2
topics: [workplace, surveys]
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
      Causes: the survey shows that flexible hours and higher satisfaction go together, not which came first.
      The stimulus says the two groups were similar in size, industry and average pay, which reduces those
      rivals, but leaves open that companies whose employees were already satisfied, or that are better run,
      are the ones that choose to offer flexible hours. Saying only that correlation is not causation names
      the flaw without saying what else could explain the link. The survey covered 400 companies, so its size
      is not the problem.
    prompt: Describe the main reasoning error in one or two sentences.
    max: 2
    reference: >-
      The columnist infers from a one-time survey, which shows only that flexible hours and higher
      satisfaction go together, that the hours cause the satisfaction; it may be the other way round, with
      companies whose employees are already satisfied and trusted being the ones that choose to offer flexible
      hours, or both may come from something else, such as better management.
    accept: >-
      Any answer that identifies the move from "employees at companies offering flexible hours rated their job
      satisfaction higher" to "offering flexible hours makes employees more satisfied", and says why it does
      not follow: the survey shows only that the two go together, so the satisfaction could have come first,
      with companies whose employees were already satisfied being the ones that choose to offer flexible
      hours, or both could come from something else about those companies, such as better management. The
      answer must say what else could explain the link; saying only that correlation does not prove causation
      earns at most 1. An answer whose only alternative is the companies' size, industry or average pay
      conflicts with the stimulus, which says the two groups were similar in these, and earns at most 1, for
      naming the inference.
    rubric:
      - Ties the error to this argument, naming the survey finding (employees at flexible-hours companies rated their satisfaction higher) and the conclusion that offering flexible hours makes employees more satisfied.
      - Says why the inference fails, namely that the survey shows only that flexible hours and higher satisfaction go together, so the satisfaction may have come first (companies with satisfied staff choosing to offer flexible hours) or both may come from something else about those companies, such as better management.
    anchors:
      - points: 2
        answer: >-
          The survey only shows that staff at flexible-hours companies are happier, not that the hours made
          them happier. Maybe it's the other way round: companies whose staff are already happy and trusted
          are the ones that feel safe offering flexible hours.
      - points: 1
        answer: >-
          The columnist goes from employees at flexible-hours companies being more satisfied to flexible hours
          making employees more satisfied.
        note: identifies the inference but does not say why it fails
      - points: 0
        answer: The flexible-hours companies might pay more, which would explain why their staff are happier.
        note: >-
          near miss: the stimulus says the two groups of companies had similar average pay, so this
          alternative conflicts with a premise
    likely_errors: [correlation-causation, missed-alternative, contradicts-premise, understated]
    form: >-
      Evidence: in one survey, flexible hours and higher satisfaction go together (groups similar in size,
      industry and pay). Claim: the hours raise satisfaction. Open rivals: reversed (satisfied workplaces
      choose flexible hours) or a third factor such as better management.
  - key: strengthen
    status: active
    skill: strengthen
    difficulty: 2
    difficulty_note: >-
      The main gap is which came first, so the strongest strengtheners show that satisfaction rose after
      flexible hours were introduced, or compare groups where chance rather than existing satisfaction decided
      who got them. Ruling out another open explanation, such as better management, also helps. Restating that
      the groups were similar in size, industry and pay is not new, and a fact that flexible hours tend to
      follow existing satisfaction points the other way.
    prompt: >-
      Give a new fact that, if true, would materially strengthen the argument, and explain how. Treat the
      stated premises as true.
    max: 2
    reference: >-
      At the surveyed companies that switched to flexible hours in the past five years, their own earlier
      staff surveys show satisfaction no higher than at fixed-hours companies before the switch, and it rose
      after it. That suggests the flexible hours came first and raised satisfaction, rather than satisfied
      staff leading companies to offer them.
    accept: >-
      Any new fact, consistent with the premises and not already stated in them, that makes it more likely
      that offering flexible working hours makes employees more satisfied, with an explanation of how. Main
      kinds: evidence that the satisfaction followed the flexible hours rather than preceding them (ratings
      rose after companies switched, having been no higher before); a comparison in which chance, not existing
      satisfaction, decided who got flexible hours; facts ruling out another explanation the stimulus leaves
      open, such as better management at the flexible-hours companies; employees' own reports that their hours
      are a main reason for their satisfaction. A strengthener need not prove the conclusion. A qualifying new
      fact whose bearing is not explained earns 1. A fact pointing the other way, such as companies offering
      flexible hours only after their staff were already satisfied, earns 0. Repeating that the groups were
      similar in size, industry or pay is not new.
    rubric:
      - Gives a new fact, consistent with the stated premises and not already stated in them, that makes it materially more likely that offering flexible working hours makes employees more satisfied (a fact pointing the other way does not count).
      - Explains how the fact strengthens the argument, namely why it makes it more likely that offering flexible hours raised satisfaction (for example, because satisfaction rose after the hours were introduced, or because chance rather than existing satisfaction decided who got them).
    anchors:
      - points: 2
        answer: >-
          At several of the companies, flexible hours were first offered only to some teams, picked by drawing
          lots, and a year later those teams rated their satisfaction higher than the teams that kept fixed
          hours. Since chance decided which teams got them, the hours, not happier staff to begin with,
          explain the difference.
        note: >-
          a different strengthener from the reference (a comparison decided by chance rather than a
          before-and-after comparison)
      - points: 1
        answer: >-
          At companies that switched to flexible hours, satisfaction ratings rose in the year after the
          switch.
        note: the right kind of fact, but the answer does not explain how it supports the argument
      - points: 0
        answer: >-
          Most of the companies that offer flexible hours began doing so only after surveys showed their
          employees were already highly satisfied.
        note: >-
          points the other way: the satisfaction came before the flexible hours, which supports the reverse
          explanation
    likely_errors: [no-reasoning, irrelevant, missed-alternative, understated]
    form: >-
      Reduce the reversed rival: at the surveyed companies that switched, satisfaction was no higher before
      the switch and rose after it, which suggests the hours came first.
---
A survey last year of employees at 400 companies found that, on average, employees at companies offering
flexible working hours rated their job satisfaction higher than employees at companies with fixed hours.
The two groups of companies were similar in size, industry and average pay. A business columnist
concludes that offering flexible working hours makes employees more satisfied with their jobs.
````

### File: content/exercises/arg-0035.md

````yaml
---
schema: 4
id: arg-0035
status: draft
kind: argument
difficulty: 3
topics: [science, education]
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
    difficulty: 3
    difficulty_note: >-
      Structure map: opposing view (some residents: turn the observatory into a café, since the telescope is
      outdated and few people visit), stated first; main conclusion (the town should keep the observatory open
      as an observatory), stated second; concession (the telescope is no match for modern instruments);
      premises (its main use has never been research; it hosts every school in the district each year; for
      most children those evenings are the only chance to look through a telescope); intermediate conclusion
      (closing it would take away something the schools could not easily replace), introduced by "so" in the
      last sentence. Support runs from the intermediate conclusion back to the recommendation, which makes the
      last sentence the tempting rival.
    prompt: State the argument's main conclusion in one sentence.
    max: 1
    reference: The town of Ostrey should keep its old observatory open as an observatory.
    accept: >-
      Any wording that says Ostrey should keep the observatory open (or running) as an observatory. Extra
      supporting reasons do not lose credit unless they make the identified conclusion ambiguous. Saying only
      that the town should not turn the observatory into a café is weaker than the conclusion, since the
      building could still close or be put to another use. Saying that closing the observatory would take away
      something the district's schools could not easily replace is the intermediate claim offered as the
      reason; saying that the telescope is no match for modern instruments is a concession; saying that the
      observatory should become a café is the residents' view the author argues against; saying that the town
      should upgrade the telescope or add more school visits goes beyond the author.
    disqualifiers:
      - States the opposite recommendation (that the observatory should be closed or turned into a café).
    rubric:
      - Identifies the main conclusion (that Ostrey should keep the old observatory open as an observatory), not the intermediate claim that closing it would take away something the district's schools could not easily replace, the concession about the telescope, the residents' view, or a call to upgrade or expand the observatory.
    anchors:
      - points: 1
        answer: Ostrey should keep the observatory running as an observatory.
      - points: 0
        answer: >-
          Closing the observatory would take away something the district's schools couldn't easily replace.
        note: near miss, the intermediate conclusion offered as the reason for the recommendation
    likely_errors: [premise-as-conclusion, counterpoint-as-conclusion, overstated]
    form: >-
      Claim: Ostrey should keep the observatory open as an observatory. "Closing it would take away something
      the schools could not easily replace" is an intermediate conclusion; the outdated telescope is a
      concession; the café plan is the opposing view.
  - key: weaken
    status: active
    skill: weaken
    difficulty: 2
    difficulty_note: >-
      The recommendation rests on the intermediate claim that closing the observatory would take away
      something the schools could not easily replace. A weakener makes it more plausible that the stargazing
      evenings would carry on without the building staying an observatory (another provider, or a café plan
      that keeps them), or shows a serious cost of keeping it open that the argument does not weigh. Denying
      that the evenings are most children's only chance to look through a telescope denies a premise.
    prompt: >-
      Give a new fact that, if true, would materially weaken the argument, and explain how. Treat the stated
      premises as true.
    max: 2
    reference: >-
      The county science center has offered to run the same stargazing evenings, with its own telescopes, for
      every school in the district if the observatory closes. The schools could then keep the evenings, so
      closing the observatory need not take away something they could not easily replace.
    accept: >-
      Any new fact, consistent with every premise (the telescope is outdated, the observatory's main use has
      never been research, it hosts every school in the district each year, and for most of the district's
      children those evenings are the only chance to look through a telescope), that gives a real reason to
      doubt that the town should keep the observatory open as an observatory, plus an explanation of how. Main
      kinds: the stargazing evenings would carry on without it (another provider would run them, or the café
      plan would keep the telescope and the school visits); keeping the observatory open would carry a serious
      cost the argument does not weigh, such as repairs the town cannot afford. A qualifying fact whose effect
      is not explained earns 1. A fact that denies a premise, such as most children already having other
      chances to look through a telescope, earns 0.
    disqualifiers:
      - Denies a stated premise, for example that for most of the district's children the stargazing evenings are the only chance to look through a telescope.
    rubric:
      - Gives a new fact, consistent with the stated premises and not already stated in them, that gives a material reason to doubt that the town should keep the observatory open as an observatory.
      - Explains how the fact weakens the argument, namely why it makes it more plausible that the schools would keep their stargazing evenings if the observatory stopped being one, or why keeping it open carries a cost the argument does not weigh.
    anchors:
      - points: 2
        answer: >-
          The café plan would keep the dome and the telescope in place and set aside one evening a week for
          school stargazing visits. So turning it into a café wouldn't take the evenings away from the
          schools, which was the whole reason for keeping it as an observatory.
        note: >-
          a different weakener from the reference (the café plan keeping the evenings rather than another
          provider running them)
      - points: 1
        answer: >-
          The county science center has said it would run stargazing evenings for every school in the district
          if the observatory closed.
        note: the right fact, but the answer does not explain how it undercuts the conclusion
      - points: 0
        answer: Most of the district's children already get other chances to look through a telescope.
        note: >-
          denies the premise that for most of the district's children the stargazing evenings are the only
          chance to look through a telescope (disqualifier)
    likely_errors: [contradicts-premise, no-reasoning, irrelevant, understated]
    form: >-
      Connection: closing removes something the schools could not easily replace. A fact that someone else
      would run the same evenings undercuts that link.
---
Some residents of Ostrey want the town's old observatory turned into a café, arguing that its telescope
is outdated and that few people visit. But the town should keep the observatory open as an observatory.
Admittedly, its telescope is no match for modern instruments. Yet the observatory's main use has never
been research: each year it hosts every school in the district for an evening of stargazing, and for most
of the district's children those evenings are the only chance to look through a telescope. So closing it
would take away something the district's schools could not easily replace.
````

### File: content/exercises/arg-0036.md

````yaml
---
schema: 4
id: arg-0036
status: draft
kind: argument
difficulty: 3
topics: [technology, workplace]
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
    difficulty: 3
    difficulty_note: >-
      Structure map: main conclusion (Brindle should make the four-day week permanent), stated first; opposing
      view (some managers: end the trial, since customers wait longer for replies on Fridays); concession (the
      complaint is fair); premises (as many projects finished as before; staff departures fell by half;
      keeping experienced staff matters more than reply speed on one day a week); intermediate conclusion (the
      trial's benefits outweigh its cost), the last sentence. Support runs from the intermediate conclusion
      back to the opening recommendation, so the last sentence, which reads like a verdict, is the tempting
      rival.
    prompt: State the argument's main conclusion in one sentence.
    max: 1
    reference: Brindle Software should make its four-day working week permanent.
    accept: >-
      Any wording that says Brindle should make the four-day week permanent (or keep it for good). Extra
      supporting reasons do not lose credit unless they make the identified conclusion ambiguous. Saying that
      the trial's benefits outweigh its cost is the intermediate claim offered as the reason; saying that
      customers wait longer for replies on Fridays is the managers' point, which the author concedes; saying
      that the trial should end is the managers' view the author argues against; saying only that the trial
      should be extended does not match the recommendation to make the four-day week permanent.
    disqualifiers:
      - States the opposite recommendation (that Brindle should end the trial or return to a five-day week).
    rubric:
      - Identifies the main conclusion (that Brindle Software should make its four-day working week permanent), not the intermediate claim that the trial's benefits outweigh its cost, the managers' complaint about Friday replies, the managers' view that the trial should end, or a call merely to extend the trial.
    anchors:
      - points: 1
        answer: Brindle should keep the four-day week for good.
      - points: 0
        answer: The four-day week trial's benefits outweigh its cost.
        note: near miss, the intermediate conclusion offered as the reason for the recommendation
    likely_errors: [premise-as-conclusion, counterpoint-as-conclusion, overstated]
    form: >-
      Claim: Brindle should make the four-day week permanent. "Benefits outweigh cost" is an intermediate
      conclusion; the managers' call to end the trial is the opposing view, and their Friday complaint is
      conceded.
  - key: assumption
    status: active
    skill: assumption
    difficulty: 3
    difficulty_note: >-
      Two links: from the trial's results to the intermediate conclusion that its benefits outweigh its cost,
      and from that to making the four-day week permanent. The benefits must be due to the four-day week at
      least in part, must not vanish once it is no longer new, and must not be outweighed by a cost the trial
      did not show. Requiring that the four-day week was the only reason fewer staff left, or that its
      benefits will stay exactly as large, is stronger than needed. Saying that the benefits outweigh the cost
      is the intermediate conclusion.
    prompt: >-
      State an assumption the argument needs: a claim that, if false, would make the argument fall apart. (A
      necessary assumption; it need not make the argument airtight.)
    max: 2
    reference: >-
      The fall in the number of staff who left during the trial was not entirely due to something other than
      the four-day week.
    accept: >-
      The inference under test runs from "during the trial the company finished as many projects as before and
      the number of staff who left fell by half; keeping experienced staff matters more than how quickly
      customers get replies on one day a week" through "the trial's benefits outweigh its cost" to "Brindle
      should make the four-day week permanent". Any unstated claim counts whose denial, with every premise
      kept, would break either step. Main bridges: (a) the fall in departures was not entirely due to
      something other than the four-day week, such as a pay rise or fewer jobs on offer elsewhere; (b) the
      benefits would not all disappear once the four-day week was permanent and no longer new; (c) making it
      permanent would not bring a cost the trial did not show, such as losing customers over time, large
      enough to outweigh the benefits. Claims stronger than needed earn 1, such as that the four-day week was
      the only reason fewer staff left, that its benefits will stay exactly as large, or that it has no costs
      beyond slower Friday replies. A stated premise, the intermediate conclusion or the recommendation
      offered as the assumption earns 0.
    disqualifiers:
      - Offers only a stated premise (such as that the number of staff who left fell by half during the trial), the intermediate conclusion (that the trial's benefits outweigh its cost) or the main conclusion (that Brindle should make the four-day week permanent) as the assumption, with no distinct unstated claim. Mentioning a stated claim while also giving a distinct assumption does not trigger this.
    rubric:
      - States a claim the argument does not state that bridges one of the argument's two steps (for example, that the fall in departures was not entirely due to something other than the four-day week, that its benefits would not all disappear once it was no longer new, or that no cost the trial did not show would outweigh them), not a premise or either stated conclusion.
      - States it no more strongly than the argument needs, so that if it were false the trial's results would no longer support making the four-day week permanent (its benefits would not be due to it, would not last, or would be outweighed), rather than a claim that the four-day week was the only reason fewer staff left or that its benefits will stay exactly as large.
    anchors:
      - points: 2
        answer: Once the four-day week stopped being new, its benefits wouldn't all disappear.
        note: >-
          a different bridge from the reference (whether the benefits last rather than what caused the fall in
          departures); if it were false, a permanent four-day week would bring the slower Friday replies with
          none of the benefits, and the trial would no longer support making it permanent
      - points: 1
        answer: The four-day week was the only reason fewer staff left during the trial.
        note: >-
          near miss, too strong: the argument needs the four-day week to be part of the reason, not the only
          one; if a pay rise also helped, the trial could still support the recommendation
      - points: 0
        answer: During the trial, the number of staff who left fell by half.
        note: a stated premise, not an assumption (disqualifier)
    likely_errors: [overstated, restates-conclusion, wrong-gap, missed-alternative]
    form: >-
      Two steps: trial results, then "benefits outweigh cost", then "make it permanent". One needed bridge:
      the halving of departures was not entirely due to something other than the four-day week; negate it and
      the trial shows no retention benefit from it.
---
Brindle Software should make its four-day working week permanent. Some of its managers want to end the
six-month trial, pointing out that customers sometimes wait longer for replies on Fridays. That complaint
is fair, but it misses the larger picture. During the trial, the company finished as many projects as it
had in the six months before, and the number of staff who left fell by half. Since keeping experienced
staff matters more to the company's success than how quickly customers get replies on one day a week, the
trial's benefits outweigh its cost.
````

### File: content/exercises/arg-0037.md

````yaml
---
schema: 4
id: arg-0037
status: draft
kind: argument
difficulty: 3
topics: [wildlife, architecture]
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
      The comparison with the previous autumn reduces the rival of fixed differences between the two sides,
      but a change on the east side other than the film, or a difference in how reliably dead birds were
      found, could still explain the gap. Strong strengtheners count strikes directly, show that nothing else
      changed on the east side, or repeat the result by covering the other side. A fact suggesting that
      something else lowered the east-side count points the other way.
    prompt: >-
      Give a new fact that, if true, would materially strengthen the argument, and explain how. Treat the
      stated premises as true.
    max: 2
    reference: >-
      Cameras recorded every bird that struck the library's windows that autumn: 11 struck the east windows
      and 50 the west windows. So the difference lies in how many birds hit the windows, not just in how many
      dead birds were found.
    accept: >-
      Any new fact, consistent with the premises and not already stated in them, that makes it more likely
      that the dotted film greatly reduces the number of birds that fly into the windows, with an explanation
      of how. Main kinds: a direct count of strikes showing far fewer on the filmed side; evidence that
      nothing else changed on the east side (as many birds flew past each side, and no new trees, lights or
      building work appeared there); evidence that dead birds were found as reliably below each side; the
      result repeating when the film was put on other windows. A strengthener need not prove the conclusion. A
      qualifying new fact whose bearing is not explained earns 1. A fact pointing the other way, such as
      something new near the east side that could remove dead birds or keep birds away, earns 0.
    rubric:
      - Gives a new fact, consistent with the stated premises and not already stated in them, that makes it materially more likely that the dotted film greatly reduces the number of birds that fly into the windows (a fact pointing the other way does not count).
      - Explains how the fact strengthens the argument, namely why it makes it more likely that the film caused much of the gap in dead birds, or that the gap reflects fewer birds hitting the windows (for example, because strikes were counted directly, because nothing else changed on the east side, or because the result was repeated).
    anchors:
      - points: 2
        answer: >-
          When the college later covered the west windows too, the number of dead birds found below them the
          next autumn fell from 41 to 8. The drop followed the film to the other side, so it's unlikely to be
          down to something about the east side alone.
        note: >-
          a different strengthener from the reference (the result repeating on the other side rather than a
          direct count of strikes)
      - points: 1
        answer: About the same number of birds flew past each side of the library that autumn.
        note: the right kind of fact, but the answer does not explain how it supports the argument
      - points: 0
        answer: A family of foxes began living near the east side of the library last summer.
        note: >-
          points the other way: foxes could have taken dead birds from below the east windows, another
          explanation for the low count there
    likely_errors: [no-reasoning, irrelevant, missed-alternative, understated]
    form: >-
      Proxy: dead birds found below the windows. Target: birds striking the windows. A direct count of strikes
      showing a similar east-west gap (11 against 50) reduces the measurement rival.
  - key: assumption
    status: active
    skill: assumption
    difficulty: 3
    difficulty_note: >-
      Two gaps, a cause and a measure. The comparison with the previous autumn reduces the rival of fixed
      differences between the sides, but does nothing about a change on the east side other than the film,
      such as far fewer birds flying past it. And the evidence counts dead birds found, not birds that hit the
      windows, so the count could fall if dead birds went missing more often below the east windows. A
      necessary assumption rules out that one of these alone explains the gap; requiring that nothing at all
      besides the film changed on the east side, or that every dead bird was found, is stronger than needed.
    prompt: >-
      State an assumption the argument needs: a claim that, if false, would make the argument fall apart. (A
      necessary assumption; it need not make the argument airtight.)
    max: 2
    reference: >-
      The gap between the dead birds found below the east and west windows is not entirely due to some change
      on the east side other than the film, such as far fewer birds flying past that side that autumn.
    accept: >-
      The inference under test is from "9 dead birds were found below the filmed east windows and 41 below the
      bare west windows, after about 40 below each side the previous autumn" to "the dotted film greatly
      reduces the number of birds that fly into the windows". Any unstated claim counts whose denial, with
      every premise kept, would defeat that inference. Main bridges: (a) the gap is not entirely due to some
      change on the east side other than the film, such as far fewer birds flying past it or a new tree
      shielding its windows; (b) dead birds did not go missing (taken by scavengers or cleared away) so much
      more often below the east windows that this alone explains the gap; (c) the film did not merely leave
      more of the birds that hit the east windows alive while just as many hit them. Claims stronger than
      needed earn 1, such as that nothing at all besides the film changed on the east side, that every dead
      bird was found, or that exactly as many birds flew past each side. Repeating a premise or restating the
      conclusion earns 0.
    disqualifiers:
      - Offers only a stated premise (such as the counts of dead birds below each side) or a version of the conclusion (that the dotted film reduces the number of birds that fly into the windows) as the assumption, with no distinct unstated claim. Mentioning a stated claim while also giving a distinct assumption does not trigger this.
    rubric:
      - States a claim the argument does not state that rules out another explanation of the gap between the dead birds found below the east and west windows (for example, that it was not entirely due to some other change on the east side, or to dead birds going missing more often below the east windows), not a premise or a version of the conclusion.
      - States it no more strongly than the argument needs, so that if it were false the gap would be explained by something other than the film reducing the number of birds hitting the windows, rather than a claim that nothing at all besides the film changed on the east side or that every dead bird was found.
    anchors:
      - points: 2
        answer: >-
          Scavengers or cleaners didn't take away dead birds so much more often on the east side that this
          alone explains the gap.
        note: >-
          a different bridge from the reference (whether dead birds were found as reliably on each side rather
          than another change on the east side); if it were false, the gap would reflect missing birds, not
          fewer strikes
      - points: 1
        answer: Nothing besides the film changed on the east side of the library between the two autumns.
        note: >-
          near miss, too strong: a change that could not explain the gap, such as a new bench, would not hurt
          the argument
      - points: 0
        answer: Staff found 9 dead birds below the east windows and 41 below the west windows.
        note: a stated premise, not an assumption (disqualifier)
    likely_errors: [overstated, missed-alternative, restates-conclusion, wrong-gap]
    form: >-
      Comparison: east (film) 9, west (bare) 41, after about 40 each the autumn before. Two gaps: another
      east-side change, and dead birds found, not strikes. One needed bridge: the gap is not entirely due to
      another east-side change; negate it and the film explains none of it.
---
Birds often fly into the large windows of Penrose College's library. Last spring the college covered the
windows on the library's east side with a film printed with small white dots and left the west-side
windows bare. During the autumn migration that followed, staff found 9 dead birds below the east windows
and 41 below the west windows. In the previous autumn they had found about 40 below each side. The
college's grounds manager concludes that the dotted film greatly reduces the number of birds that fly
into the windows.
````

### File: content/exercises/arg-0038.md

````yaml
---
schema: 4
id: arg-0038
status: draft
kind: argument
difficulty: 3
topics: [transport, islands]
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
      Analogy: the study settles that the fare cut caused Corran's rise, so the gap is whether Lissay is like
      Corran in what made the cut work. A necessary assumption rules out a difference that would stop a
      cheaper fare from bringing a large rise on Lissay: a ferry service that could not carry many more
      crossings, or fares so often paid by someone else that halving the resident fare would barely change
      what residents pay. Requiring that Lissay's residents are like Corran's in every way that matters, that
      every resident pays the full fare, or that the ferry has empty seats on every crossing is stronger than
      needed.
    prompt: >-
      State an assumption the argument needs: a claim that, if false, would make the argument fall apart. (A
      necessary assumption; it need not make the argument airtight.)
    max: 2
    reference: Lissay's ferry service could carry many more crossings by its residents than it does now.
    accept: >-
      The inference under test is from "halving Corran's resident fare caused a 40 percent rise in residents'
      crossings, and Lissay's resident fare is the same as Corran's was before the cut" to "halving Lissay's
      resident fare would bring a large rise in the number of crossings its residents make". Any unstated
      claim counts whose denial, with every premise kept, would defeat that inference. Main bridges: (a)
      Lissay's ferry service could carry many more crossings by residents, on existing or added sailings; (b)
      not so many of Lissay's residents have their fares paid by someone else, such as an employer, that
      halving the resident fare would barely change what residents pay to cross. Claims stronger than needed
      earn 1, such as that Lissay's residents are like Corran's in every way that matters, that every Lissay
      resident pays the full fare themselves, or that the ferry has plenty of empty seats on every crossing.
      Repeating a premise or restating the conclusion earns 0.
    disqualifiers:
      - Offers only a stated premise (such as that Lissay's resident fare is the same as Corran's was before the cut) or a version of the conclusion (that halving the fare would bring a large rise in residents' crossings) as the assumption, with no distinct unstated claim. Mentioning a stated claim while also giving a distinct assumption does not trigger this.
    rubric:
      - States a claim the argument does not state that rules out a difference between Lissay and Corran that would stop a cheaper fare from bringing a large rise in crossings on Lissay (for example, that Lissay's ferry service could carry many more crossings, or that not so many residents have their fares paid by someone else that a cut would barely change what they pay), not a premise or a version of the conclusion.
      - States it no more strongly than the argument needs, so that if it were false a cheaper fare could not bring a large rise in crossings on Lissay, rather than a claim that Lissay's residents are like Corran's in every way, that every resident pays the full fare, or that the ferry has empty seats on every crossing.
    anchors:
      - points: 2
        answer: >-
          Not so many of Lissay's residents have their fares paid by employers that halving the fare would
          barely change what they pay to cross.
        note: >-
          a different bridge from the reference (who pays the fare rather than the ferry service's capacity);
          if it were false, the cut would barely change what residents pay, so Corran's result would give no
          reason to expect a large rise
      - points: 1
        answer: Lissay's residents are like Corran's residents in every way that affects how often they cross.
        note: >-
          near miss, too strong: the islands could differ in many ways, such as income or the length of the
          crossing, without stopping a cheaper fare from bringing a large rise on Lissay
      - points: 0
        answer: Halving the fare on Lissay would make its residents cross to the mainland much more often.
        note: a version of the conclusion, not an assumption (disqualifier)
    likely_errors: [overstated, restates-conclusion, wrong-gap, scope-shift]
    form: >-
      Analogy: Corran's fare cut caused a 40% rise in residents' crossings; Lissay's resident fare equals
      Corran's old one. One needed bridge: Lissay's ferry service could carry many more crossings; if not, a
      cut cannot bring a large rise.
  - key: weaken
    status: active
    skill: weaken
    difficulty: 2
    difficulty_note: >-
      The study rules out other causes of Corran's rise, so the gap is whether Lissay resembles Corran. A
      weakener names a difference that could keep a cheaper fare from bringing a large rise on Lissay: ferries
      already full, sailings too few to carry many more residents, or residents whose fares are mostly paid by
      someone else. Disputing that the fare cut caused Corran's rise denies a premise.
    prompt: >-
      Give a new fact that, if true, would materially weaken the argument, and explain how. Treat the stated
      premises as true.
    max: 2
    reference: >-
      Lissay's ferry runs only twice a week and is fully booked by residents on nearly every crossing.
      Residents could make few extra crossings even if the fare were halved, so a large rise like Corran's is
      unlikely.
    accept: >-
      Any new fact, consistent with every premise (the fare cut, not any other change, caused a 40 percent
      rise in Corran residents' crossings, and Lissay's resident fare is the same as Corran's was before the
      cut), that gives a real reason to doubt that halving Lissay's resident fare would bring a large rise in
      residents' crossings, plus an explanation of how. Main kinds: ferries already full or sailing too seldom
      to carry many more residents; residents whose fares are mostly paid by employers or others, so that a
      cut would barely change what most of them pay; little reason for Lissay's residents to cross more often,
      such as the ferry landing far from any mainland town. A qualifying fact whose effect is not explained
      earns 1. A fact that denies a premise, such as the rise on Corran having another cause, earns 0.
    disqualifiers:
      - Denies a stated premise, for example that the fare cut, not some other change, caused the rise in Corran residents' crossings.
    rubric:
      - Gives a new fact, consistent with the stated premises and not already stated in them, that gives a material reason to doubt that halving Lissay's resident fare would bring a large rise in the number of crossings its residents make.
      - Explains how the fact weakens the argument, namely why it makes Lissay unlike Corran in a way that could keep a cheaper fare from bringing a large rise (for example, because the ferries are already full or because residents' fares are mostly paid by someone else).
    anchors:
      - points: 2
        answer: >-
          Most Lissay residents who cross travel on passes paid for by their mainland employers, so halving
          the resident fare wouldn't change what most of them pay. Corran's cut worked by making trips cheaper
          for residents, so a big jump like Corran's is unlikely on Lissay.
        note: a different weakener from the reference (who pays the fare rather than how full the ferries are)
      - points: 1
        answer: Lissay's ferry is fully booked on nearly every crossing.
        note: the right fact, but the answer does not explain how it undercuts the conclusion
      - points: 0
        answer: >-
          The rise in crossings on Corran came from a new hospital opening on the mainland, not the fare cut.
        note: denies the premise that the fare cut, not any other change, caused the rise (disqualifier)
    likely_errors: [contradicts-premise, no-reasoning, scope-shift, understated]
    form: >-
      Analogy: the study settles Corran's cause, so the gap is whether Lissay is like Corran. A difference
      that could keep a cheaper fare from bringing a large rise, such as ferries already full on nearly every
      sailing, weakens it.
---
Two years ago the island of Corran halved the ferry fare its residents pay to cross to the mainland, and
over the following year residents' crossings rose by 40 percent. A study found that the fare cut, not any
other change, caused the rise. The resident fare on Lissay, a nearby island, is the same as Corran's was
before the cut. Lissay's council concludes that halving its residents' fare would also bring a large rise
in the number of crossings they make.
````

## Reviewer response

An independent Claude Opus 5.5 session at maximum effort (the project thread "Independent review of batch 3"), started for this check with no part in writing the keys or in the two earlier Claude checks, 2026-10-06. It reviewed this packet at `21664a68465f947f3331926381d26b014843b1d7` and changed nothing in the repository. The review follows verbatim between the two rules below, except that each heading is one level lower (headings inside code blocks are YAML comments and are unchanged). With the headings restored, the text is the review file as delivered: 23,038 bytes, SHA-256 `d264e183c75e0f288f4985fb2a60de69525e7d454f6822803dd7d5b867ba2565`.

---

## Batch 3 answer key check (arg-0029 to arg-0038)

Reviewer: an independent Claude Opus 5.5 session at maximum effort, started for this check, with no part in writing these keys or in the two earlier Claude checks. It replaces GPT-6 Pro for this batch. Date: 2026-10-06.

Packet: `reviews/2026-10-06-content-batch-3.md` at `21664a68465f947f3331926381d26b014843b1d7` (branch `content-batch-3`), SHA-256 `0ab28c57ccda15e9a704e1a49e307fe5236590a5efb73228bc5054205790021a`, matching the brief. The ten exercise files at that commit are byte-identical to the packet's copies, and the branch differs from `main` (`72888ad`) only by those ten files and the packet.

What was checked: sections 3 and 4 of the packet, for all 20 tasks and their form lines, against `CONTENT_GUIDELINES.md` §3.1, §3.2 and §5 and `METHOD.md` §3 and §5, with the batch 2 review and the schema 4 key audit as precedent. Every assumption reference and full-credit anchor was negated literally, every anchor was graded against its rubric and `accept` text, and every number was recomputed (48 of 60 is 80 percent, so the threshold falls at 80 percent of climbs; 1 percent of about 180 seconds is 1.8 seconds; 9 of 11 and 41 of 50 strikes found dead are both about 82 percent; 10 of 12 against about 1 in 5). All replacement text below was applied together to a scratch copy of the commit: `npm run content` accepts all 38 exercises and the 393 unit tests pass. Nothing in the repository was changed.

Severity: **must fix** means a key scores a listed or common kind of answer wrongly. **Minor** means a less common answer is scored wrongly, or a reference, label, anchor, stimulus or form line teaches something slightly wrong. The optional **nits** at the end are clarity only and do not count toward the verdicts.

### Verdicts

| Exercise | Verdict |
| --- | --- |
| arg-0029 | fix (minor: stimulus timing; strengthen 0-point anchor and form line) |
| arg-0030 | fix (minor: assumption, a limit in the wrong unit) |
| arg-0031 | fix (minor: the weaken reference overstates) |
| arg-0032 | fix (minor: strengthen, the score of a premise-denying fact) |
| arg-0033 | fix (must fix: the weaken key credits a fact that leaves the trend intact) |
| arg-0034 | keep |
| arg-0035 | fix (minor: weaken criterion 2 shuts out a valid route) |
| arg-0036 | fix (minor: the assumption key misses the experienced-staff bridge) |
| arg-0037 | fix (minor: strengthen labels overstate their examples) |
| arg-0038 | keep |

### Findings

#### arg-0029 stimulus, affecting both tasks (minor)

**Problem.** "Recipes handed down in the owner's family" lets the outcome create the property being tested. A restaurant that lasts twenty years often passes to the founder's children, and its own recipes then become recipes handed down in the owner's family. Lasting can therefore make a restaurant count as a family-recipe restaurant: a reversed rival that no key mentions. It also undercuts the strengthen reference, because restaurants that closed young never reached a second generation, so a low share of family recipes among them would be expected even if the recipes did nothing. Fixing the timing removes the rival without touching any key text.

**Replacement.** The stimulus's second sentence becomes (same length, 65 words in all):

> A food magazine interviewed the owners of all twelve and found that ten of the restaurants have cooked mainly from family recipes ever since they opened.

#### arg-0029.strengthen (minor)

**Problem 1, the 0-point anchor.** "Several new Dunmore restaurants that cooked from family recipes closed within a year." earns 0 correctly, but its note says it "gives a reason to doubt the conclusion". A few failures with no comparison is the survivorship error run backwards: it says nothing about whether family-recipe restaurants close more or less often than others, which is the lesson of this exercise. The `accept` example "family-recipe restaurants often closing within a few years" has the same gap. A comparative fact keeps the anchor at 0 for the stated reason and agrees with the lesson. It is consistent with the premises as long as most restaurants that opened used family recipes (for example, 100 family-recipe openings with 10 survivors against 10 other openings with 2).

**Replacement.** The 0-point anchor:

```yaml
      - points: 0
        answer: >-
          Among Dunmore restaurants that opened in the same years as these twelve, those cooking mainly from
          family recipes closed more often than the others.
        note: >-
          points the other way: family-recipe restaurants closing more often than others (possible if most of
          the restaurants that opened used family recipes) is a reason to doubt that the recipes help a
          restaurant last
```

In `accept`, replace "such as family-recipe restaurants often closing within a few years, earns 0." with "such as family-recipe restaurants closing more often than other restaurants, earns 0."

**Problem 2, the form line.** "Reduces the survivors-only rival" uses a term the Method does not define, and the fact does more than reduce a rival: it supplies the missing comparison, while a third factor behind both (family ownership, say) stays open.

**Replacement** (219 characters):

```yaml
    form: >-
      Missing comparison: how common family recipes were among the restaurants that closed. A fact showing
      they were much rarer there supplies it: the recipes went with lasting, though that alone does not show
      they caused it.
```

#### arg-0030.assumption (minor)

**Problem.** The conclusion is about risk per climb, so the limit has to be on the share of climbs. A student who limits the share of climbers, or of climbing time, has the right idea in the wrong unit (`METHOD.md` §3.2, unit of analysis), and the claim fails negation: if 80 percent of the gym's climbers used the beginner walls, the climbers on the harder walls could still have made enough climbs to keep the beginner walls under 80 percent of all climbs, and the argument survives. Criterion 2 already fails such an answer, but nothing tells the grader so, and criterion 1's "how much of the gym's climbing" reads as covering time.

**Replacement.** In `accept`, after "or that the beginner walls did not carry nearly all of the climbs, counts." insert:

> A limit in another unit, such as the share of the gym's climbers who used the beginner walls or the share of climbing time spent there, misses that the conclusion is about the risk per climb and earns at most 1.

#### arg-0031.weaken (minor)

**Problem.** The reference ends "so switching would not make a significant difference to how quickly people read". That denies the conclusion, which the fact does not establish (it concerns three-minute passages in a study, not newspapers), and a weakener need not refute (`CONTENT_GUIDELINES.md` §3.1; the batch 2 review's "hardly a drop"). "Real" also says more than the stimulus's own definition of statistical significance.

**Replacement:**

```yaml
    reference: >-
      On average, readers were only about one percent faster in Clearline, saving under two seconds on
      passages that took about three minutes to read. A difference that small is unlikely to be chance but
      trivial in size, so the study gives little reason to think switching would make a significant difference
      to how quickly people read.
```

#### arg-0032.strengthen (minor)

**Problem.** `accept` names the premise-denying answer ("the maker's three trials tested the liver") but not its score, and strengthen tasks have no disqualifier. A grader taking the criteria one at a time can give criterion 2 to an explained fact of that kind and award 1. The weaken tasks prevent this with their disqualifier, and the published arg-0012 and arg-0022 strengthen tasks with "earns 0".

**Replacement.** In `accept`, replace "denies the premise that they measured only sleep." with "denies the premise that they measured only sleep and earns 0."

#### arg-0033.weaken (must fix)

**Problem.** The conclusion is a trend: delays "are bound to keep getting worse". `accept` lists "an affordable measure that would reduce the delays or slow their growth" as a main kind, and the difficulty note repeats "or slow their growth". A measure that only slows the growth leaves the delays getting worse every year, so the conclusion stays true and the fact gives no reason to doubt it. `accept` therefore invites 2 points for an answer such as "More buses would slow the growth of the delays, so something can still be done", which criterion 1 rejects, while criterion 2 as written ("why it means something could still be done about the delays") rewards its explanation. The fix keeps every current anchor at its score: a cut, as in the 1-point anchor, does interrupt the trend.

**Replacement.** `accept`:

```yaml
    accept: >-
      Any new fact, consistent with every premise (a decade of growing traffic, the engineer's forecast that
      delays will worsen unless something is done, and both studied remedies costing far more than the town
      can afford), that gives a real reason to doubt that the delays are bound to keep getting worse, plus an
      explanation of how. Main kinds: an affordable measure that would cut the delays or stop them from
      growing (retimed lights, more buses, staggered working hours); money from outside the town that would
      pay for widening the street or the bypass; something already planned that would take traffic off Bridge
      Street. A measure that would only slow the growth of the delays does not count, since they would still
      keep getting worse. A qualifying fact whose effect is not explained earns 1. A fact that denies a
      premise, such as one of the remedies costing little, earns 0.
```

Rubric criterion 2:

> Explains how the fact weakens the argument, namely why it means the delays could still be kept from getting worse (for example, by an affordable measure that would cut them or stop them from growing, by outside money for one of the studied remedies, or by something already planned that would take traffic off Bridge Street).

`difficulty_note` (not in the grading payload):

```yaml
    difficulty_note: >-
      The conclusion that delays are bound to keep getting worse needs nothing to be done, and it is a claim
      about a trend. A weakener shows that something could still keep the delays from getting worse: an
      affordable measure that would cut them or stop them from growing, or money from outside the town for one
      of the studied remedies. A measure that would only slow their growth leaves them getting worse, so it
      does not weaken. Saying a remedy is cheaper than the council was told denies a premise.
```

**Recommended with it.** The reference's one-time cut of a fifth, with traffic still growing every year, invites the objection that the delays start worsening again from the lower level. A cut does interrupt "keep getting worse", so the reference is not wrong, but the model answer should meet the Method's period question (§3.2: over what period?). The 1-point anchor can stay as it is, since a cut qualifies under the new `accept`.

```yaml
    reference: >-
      The engineer estimates that retiming the traffic lights along Bridge Street, which would cost the town
      little, would cut rush-hour delays there by a fifth, enough to keep them below today's level for at
      least five years as traffic grows. Something affordable can still be done, which gives reason to doubt
      that the delays are bound to keep getting worse.
```

And the form line, so it carries the same lesson (238 characters):

```yaml
    form: >-
      Rule: nothing done → worse. An affordable measure that would cut the delays or stop their growth means
      something can be done, so the rule no longer supports "bound to get worse". One that only slows their
      growth leaves them getting worse.
```

#### arg-0035.weaken (minor)

**Problem.** Criterion 2 accepts only two routes ("namely why it makes it more plausible that the schools would keep their stargazing evenings if the observatory stopped being one, or why keeping it open carries a cost the argument does not weigh"), while the prompt, criterion 1 and the opening of `accept` credit any material reason to doubt the recommendation. A valid weakener that works another way fails criterion 2, for example: "The district has already cut all evening school trips from next year, whatever happens to the observatory, so closing it would take nothing more away from the schools." It keeps every premise and removes the argument's only reason, yet scores 1.

**Replacement.** Rubric criterion 2:

> Explains how the fact weakens the argument, namely why it gives reason to doubt that the town should keep the observatory open as an observatory (for example, because the schools would keep their stargazing evenings anyway, because closing it would take away less than the argument says, or because keeping it open carries a cost the argument does not weigh).

In `accept`, after "(another provider would run them, or the café plan would keep the telescope and the school visits);" insert "closing it would take away less than the argument says (the district has already cut all evening school trips from next year, whatever happens to the observatory);". All three anchors keep their scores.

#### arg-0036.assumption (minor)

**Problem.** The premise counts staff who left; the reason that weighs the trial counts experienced staff ("keeping experienced staff matters more to the company's success than how quickly customers get replies on one day a week"). Take the claim "the fall in departures was not entirely among staff who were not yet experienced" and negate it literally: the whole fall was among staff who were not yet experienced. Every premise stands, the trial shows no gain in what the argument says outweighs the cost, and the step to "the trial's benefits outweigh its cost" collapses, so the claim is necessary. It is probably the gap a strong student spots first, yet `accept` does not list it, and criterion 2's account of how the argument fails ("its benefits would not be due to it, would not last, or would be outweighed") does not cover it, so a grader may give it 1.

**Replacement.** `accept`:

```yaml
    accept: >-
      The inference under test runs from "during the trial the company finished as many projects as before and
      the number of staff who left fell by half; keeping experienced staff matters more than how quickly
      customers get replies on one day a week" through "the trial's benefits outweigh its cost" to "Brindle
      should make the four-day week permanent". Any unstated claim counts whose denial, with every premise
      kept, would break either step. Main bridges: (a) the fall in departures was not entirely due to
      something other than the four-day week, such as a pay rise or fewer jobs on offer elsewhere; (b) the
      benefits would not all disappear once the four-day week was permanent and no longer new; (c) making it
      permanent would not bring a cost the trial did not show, such as losing customers over time, large
      enough to outweigh the benefits; (d) the fall in departures was not entirely among staff who were not
      yet experienced, since the argument weighs the trial by the value of keeping experienced staff. Claims
      stronger than needed earn 1, such as that the four-day week was the only reason fewer staff left, that
      its benefits will stay exactly as large, or that it has no costs beyond slower Friday replies. A stated
      premise, the intermediate conclusion or the recommendation offered as the assumption earns 0.
```

Rubric criterion 2:

> States it no more strongly than the argument needs, so that if it were false the trial's results would no longer support making the four-day week permanent (its benefits would not be due to it, would not include keeping experienced staff, would not last, or would be outweighed), rather than a claim that the four-day week was the only reason fewer staff left or that its benefits will stay exactly as large.

Optional, not in the grading payload, `difficulty_note`:

```yaml
    difficulty_note: >-
      Two links: from the trial's results to the intermediate conclusion that its benefits outweigh its cost,
      and from that to making the four-day week permanent. The benefits must be due to the four-day week at
      least in part, must include keeping some experienced staff (the premise counts all staff who left, but
      the reason given values experienced staff), must not vanish once it is no longer new, and must not be
      outweighed by a cost the trial did not show. Requiring that the four-day week was the only reason fewer
      staff left, or that its benefits will stay exactly as large, is stronger than needed. Saying that the
      benefits outweigh the cost is the intermediate conclusion.
```

#### arg-0037.strengthen (minor)

**Problem.** The `accept` label "evidence that nothing else changed on the east side" and criterion 2's example "because nothing else changed on the east side" claim more than their examples show. As many birds flying past each side, and no new trees, lights or building work, make another change on the east side less likely; they do not show that nothing else changed. This is the label-and-example overstatement fixed in the published keys (audit finding B10), and the companion assumption task itself scores "Nothing besides the film changed on the east side" as too strong.

**Replacement.** In `accept`, replace "evidence that nothing else changed on the east side (as many birds flew past each side, and no new trees, lights or building work appeared there)" with "facts making another change on the east side less likely (as many birds flew past each side; no new trees, lights or building work appeared there)".

Rubric criterion 2:

> Explains how the fact strengthens the argument, namely why it makes it more likely that the film caused much of the gap in dead birds, or that the gap reflects fewer birds hitting the windows (for example, because strikes were counted directly, because another change on the east side became less likely, or because the result was repeated).

In `difficulty_note` (not in the payload), replace "show that nothing else changed on the east side" with "make another change on the east side less likely".

### Optional nits

**N1. Flaw 0-point anchors (all six flaw tasks).** Each 0-point anchor is a wrong-gap answer that also names no inference, and each note gives only the wrong-gap reason. The `accept` texts say such answers "earn at most 1, for naming the inference", so the 0 comes from criterion 1, and the note should say so; otherwise a grader can match a student's wrong-gap answer that does name the inference to the 0 anchor. This matters most for arg-0034, whose anchor ("which would explain why their staff are happier") comes close to naming the finding. Replacement notes:

```yaml
# arg-0029.flaw
        note: >-
          near miss: all twelve long-lasting restaurants were surveyed, so the problem is not the number
          surveyed but the missing comparison with restaurants that closed; it also names neither the finding
          nor the conclusion
# arg-0030.flaw
        note: >-
          near miss: a reason the conclusion might be true, not an error in the reasoning; it also does not
          name the evidence (48 of the 60 injuries)
# arg-0031.flaw
        note: >-
          near miss: half the readers read their Clearline passage first, so the order was balanced and does
          not explain the result; it also names neither the statistically significant result nor the blog's
          conclusion
# arg-0032.flaw
        note: >-
          near miss: an attack on the source's motives, not an error in the argument's reasoning; it also
          names neither the trials' silence about the liver nor the conclusion
# arg-0033.flaw
        note: >-
          near miss: it disputes the engineer's forecast, a premise, instead of identifying the error in the
          councillor's reasoning; it also names neither the unaffordable remedies nor the councillor's
          conclusion
# arg-0034.flaw
        note: >-
          near miss: the stimulus says the two groups of companies had similar average pay, so this
          alternative conflicts with a premise; it also does not name the columnist's conclusion
```

Also, arg-0029.flaw's `accept`, unlike the other five, gives no score for its wrong-gap answer: replace "since all twelve long-lasting restaurants were surveyed." with "since all twelve long-lasting restaurants were surveyed, and earns at most 1, for naming the inference."

**N2. arg-0035.conclusion `accept`.** "Saying only that the town should not turn the observatory into a café is weaker than the conclusion, since the building could still close or be put to another use" gives no score: add ", and earns 0" before its full stop.

**N3. arg-0038.weaken `accept`.** In an analogy a weakener has to be a difference from Corran, as criterion 2 says. Replace "such as the ferry landing far from any mainland town" with "such as Lissay's ferry landing far from any mainland town, unlike Corran's".

### Patterns for later batches

1. **Check a conclusion's shape over time as carefully as its units.** "Keeps getting worse" is a trend: a fact that only slows the growth leaves it true, and a one-time cut leaves the period open. For every strengthener and weakener, ask whether the fact changes the trend, the level or only the rate (arg-0033).
2. **Write criterion 2 as the target with examples, not as a closed list of routes**: "namely why it gives reason to doubt X (for example, A, B or C)". Routes joined by "or" with no "for example" fail a valid route that the prompt and criterion 1 allow (arg-0035; arg-0036's account of how the argument fails).
3. **Make each label as strong as its examples, and stop each weaken reference at a reason to doubt**: "facts making another change less likely", not "evidence that nothing else changed"; "gives little reason to think", not "would not" (arg-0037, arg-0031). This repeats audit finding B10 and Pro's batch 2 lesson that a weakener need not refute.
4. **Say in every strengthen task's `accept` what a premise-denying fact earns**, as the weaken tasks do with their disqualifier (arg-0032; arg-0029, arg-0034 and arg-0037 are silent on it too).
5. **Let anchors and stimuli practise the exercise's own lesson.** In a survivorship exercise, a "points the other way" anchor needs a comparison, not a handful of failures; and when the outcome can create the property being tested (restaurants that last come to have handed-down recipes), fix the property's timing in the stimulus (arg-0029).
6. **In flaw tasks, say in each 0-point note which criterion fails**, so that it agrees with `accept`'s "at most 1, for naming the inference" (N1).

---

## Triage

Eight exercises were marked "fix" (arg-0033 with one must-fix) and arg-0034 and arg-0038 "keep". Every finding and all three optional nits are accepted, and the review's replacement text is used word for word. Two changes go beyond it:

- arg-0029's flaw form line now says the restaurants "have cooked mainly from family recipes since opening", to match the new stimulus sentence.
- The review's pattern 4 names arg-0029, arg-0034 and arg-0037 as silent on a premise-denying fact without giving replacement text. Each of their strengthen `accept` texts now ends its list of 0-point answers with "A fact that denies a premise earns 0.", so all four strengthen tasks in the batch say it.

| # | Task | Finding | Decision | Change |
| --- | --- | --- | --- | --- |
| B3-1 | arg-0029 stimulus | "Recipes handed down in the owner's family" lets lasting create the property: a restaurant that lasts passes to the next generation. | accepted | The second sentence says the ten restaurants have cooked mainly from family recipes ever since they opened; the flaw form line follows it. |
| B3-2 | arg-0029.strengthen | The 0-point anchor (a few family-recipe restaurants closing) has no comparison, the survivorship error run backwards; the `accept` example has the same gap. | accepted | New 0-point anchor and note (family-recipe restaurants closed more often than others that opened in the same years); the `accept` example says "closing more often than other restaurants". |
| B3-3 | arg-0029.strengthen | The form line's "survivors-only rival" is not a Method term, and the fact supplies the missing comparison rather than reducing a rival. | accepted | New form line: the fact supplies the comparison, which shows the recipes went with lasting but not that they caused it. |
| B3-4 | arg-0030.assumption | A limit on the share of climbers or of climbing time is in the wrong unit and fails negation, but nothing tells the grader so. | accepted | `accept` says such a limit misses that the conclusion is about risk per climb and earns at most 1. |
| B3-5 | arg-0031.weaken | The reference denies the conclusion ("would not make a significant difference") and says "real". | accepted | The reference stops at a reason to doubt: the difference is unlikely to be chance but trivial, so the study gives little reason to think switching would matter. |
| B3-6 | arg-0032.strengthen | `accept` names the premise-denying answer but not its score, and strengthen tasks have no disqualifier. | accepted | "…measured only sleep and earns 0." |
| B3-7 | arg-0033.weaken (must fix) | The conclusion is a trend, so a measure that only slows the growth of the delays leaves it true, yet `accept` and the difficulty note credited one. | accepted | New `accept` (a cut or a stop to the growth counts; slowing it does not), criterion 2 and difficulty note; the recommended reference (the cut keeps delays below today's level for at least five years) and form line are also taken. All anchors keep their scores. |
| B3-8 | arg-0035.weaken | Criterion 2 lists two routes with no "for example", so a valid third route (closing would take away less than the argument says) scores 1. | accepted | Criterion 2 names the target with three examples; `accept` adds the third route with the district's cut to evening trips as its example. |
| B3-9 | arg-0036.assumption | The premise counts all staff who left, but the argument values experienced staff; "the fall was not entirely among staff who were not yet experienced" is necessary and unlisted. | accepted | `accept` adds bridge (d), criterion 2 adds "would not include keeping experienced staff", and the optional difficulty note is taken. |
| B3-10 | arg-0037.strengthen | "Evidence that nothing else changed on the east side" claims more than its examples show (audit finding B10). | accepted | `accept`, criterion 2 and the difficulty note say the facts make another change on the east side less likely. |
| N1 | all six flaw tasks | Each 0-point note gives only the wrong-gap reason, though `accept` caps a wrong-gap answer that names the inference at 1; arg-0029's `accept` gives no score for the sample-size answer. | accepted | Each note adds what the answer also fails to name (the evidence, the conclusion or both), which is why criterion 1 fails; arg-0029's `accept` adds "and earns at most 1, for naming the inference". |
| N2 | arg-0035.conclusion | The weaker "should not become a café" answer has no score. | accepted | ", and earns 0" added. |
| N3 | arg-0038.weaken | An analogy weakener must be a difference from Corran. | accepted | The example now reads "Lissay's ferry landing far from any mainland town, unlike Corran's". |

### Follow-up check

After the fixes, a separate Claude check confirmed that every replacement landed word for word, graded every anchor of every changed task against its current rubric and `accept` text (each earns its stated score), and found two problems and one optional gap, all fixed:

| # | Task | Finding | Fix |
| --- | --- | --- | --- |
| F-1 | arg-0029.strengthen | The 0-point note's threshold is wrong (it comes from the review). With 10 of the 12 survivors using family recipes, family-recipe restaurants close more often only if more than five in six of all openings used them; "most" is not enough (60 and 40 openings give survival rates of 10 in 60 against 2 in 40). | The note says "possible only if more than five in six of the restaurants that opened used family recipes, a higher share than among the twelve that lasted". |
| F-2 | arg-0035.weaken | The difficulty note still lists only the two old routes, against the new criterion 2. | The note gives the three routes as examples. |
| F-3 | arg-0038.weaken (optional) | The difficulty note leaves out the `accept` kind "little reason to cross more often", which N3 rewrote. | Added to the note's list. |

After all of these, `npm run content` accepts all 38 exercises, `npm run check` passes (393 unit tests), and the 36 browser tests pass with the drafts included.

### Carried forward

The review's six patterns for later batches go into the content lessons for the next batch and, with them, into `CONTENT_GUIDELINES.md` in a separate change. Two of them also apply to published exercises, which need the owner's re-approval to change and so are left for that change: five published strengthen tasks say nothing about a premise-denying fact (arg-0009, arg-0015, arg-0018, arg-0019 and arg-0027; pattern 4), and seven published flaw tasks have a 0-point note that gives only the wrong-gap reason (arg-0011, arg-0014, arg-0016, arg-0017, arg-0018, arg-0021 and arg-0025; pattern 6, which needs a change only where `accept` caps a wrong-gap answer at 1).

## Approval

The owner (brian-se0) approved all ten exercises on a decision card in the project thread at 04:32 UTC on 2026-10-07. Before the approval fields were set, each exercise's `ai_assistance.notes` was updated to say how it was drafted and checked; nothing else changed after the card. All twenty tasks are now in `content/published-tasks.json`.
