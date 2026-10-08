# Held-out rows where ChatGPT, Gemini or Grok disagreed with the gold

Before the outcome is recorded, §9 asks the owner to see each of these rows with the chatbot's feedback. The counts stay against the registered gold; nothing here changes it.

## asm11 · arg-0024.assumption (disqualifier) · gold 0/2

**Question:** State an assumption the argument needs: a claim that, if false, would make the argument fall apart. (A necessary assumption; it need not make the argument airtight.)

**Rubric:**
1. States a claim the argument does not state that bridges one of the argument's two steps (for example, that the features the conversion removes are not essential to the silo's historical importance, or that no overriding duty bears on opposing the plan), not a premise or either stated conclusion.
2. States it no more strongly than the argument needs, so that if it were false the conversion would remove something essential to the silo's historical importance or the society would have an overriding duty to oppose the plan, rather than merely some lost detail or a consideration that could be outweighed.

**Answer:**

> the assumption is that turning the silo into apartments still keeps whatever makes it historically important, since the walls and the loading machinery stay. so the society shouldnt fight it

**Why the gold is 0** (second scorer: 0): It offers the intermediate conclusion (the conversion preserves what makes the silo historically important), a stated premise (walls and machinery kept) and the main conclusion, with no distinct unstated claim, so the disqualifier applies.

**gemini-1, holdout-b: 2/2.** Its feedback:

> I01: 2/2
> 
> * Criterion 1: met. The student states an unstated claim bridging the argument (that converting the building preserves what makes it historically important).
> * Criterion 2: met. The claim is appropriately framed and not overly strong.
> * Tip: Make sure to clearly distinguish between necessary assumptions and stated premises or intermediate conclusions when writing out your response.

## con12 · arg-0024.conclusion (confidently-wrong) · gold 0/1

**Question:** State the argument's main conclusion in one sentence.

**Rubric:**
1. Identifies the main conclusion (that the historical society should not oppose the plan to convert the silo into apartments), not the intermediate claim that the conversion would preserve what makes the silo historically important, the concession about the interior, the members' view, or a call for the society to support the plan.

**Answer:**

> The author is arguing that the Varden Historical Society should actively support the apartment plan for the silo, since the conversion keeps the walls and loading machinery.

**Why the gold is 0** (second scorer: 0): Overstates the conclusion: the author says only that the society should not oppose the plan, and the accept text says that calling for the society to support the conversion goes beyond the author; the rubric excludes "a call for the society to support the plan".

**gemini-1, holdout-b: 1/1.** Its feedback:

> I01: 1/1
> 
> * Criterion 1 (met): Correctly identifies the main conclusion that the society should not oppose the plan.
> * Tip: Make sure not to overstate the author's recommendation—saying the society should "not oppose" a plan is not the same as saying it should "actively support" it.

## fla14 · arg-0020.flaw (keyword-contradiction) · gold 0/2

**Question:** Describe the main reasoning error in one or two sentences.

**Rubric:**
1. Ties the error to this argument, naming the streak holders' higher scores on the speaking test and the conclusion that keeping a streak makes learners far better speakers.
2. Says why the inference fails by naming a possible explanation of the higher scores that the argument does not rule out (for example, that the streak holders already spoke better when they started, or that better speakers find a streak easier to keep), not one the stimulus rules out.

**Answer:**

> The ad gets cause and effect backwards. It assumes the users who already spoke Spanish better were the ones who kept 100-day streaks, when really it's keeping the streak that made them score higher on the speaking test.

**Why the gold is 0** (second scorer: 0): Uses the key's words (already spoke better, streaks, higher scores) but reverses the logic: it misdescribes the ad's inference and endorses the ad's conclusion as true, so it does not identify the error in the move from scores to the causal claim (criterion 1), and it rejects the open alternative rather than offering it as a possible explanation (criterion 2).

**chatgpt-1, holdout-a: 1/2.** Its feedback:

> I04: 1/2
> * Criterion 1: not met. The answer does not clearly state that the ad infers that keeping the streak caused the higher speaking-test scores.
> * Criterion 2: met. It identifies the relevant alternative explanation that people who already spoke better may have been more likely to keep 100-day streaks.
> * Tip: Explicitly connect the higher scores to the ad's causal conclusion, then give the alternative explanation that better speakers may have been more likely to maintain streaks.

**chatgpt-1, holdout-b: 2/2.** Its feedback:

> I04: 2/2
> * Criterion 1: met — It explicitly connects the causal claim to the users who kept 100-day streaks and their higher speaking-test scores.
> * Criterion 2: met — It identifies the relevant alternative that the streak holders may already have spoken better, which could explain both their streaks and their higher scores.
> * Tip: State alternative explanations as possibilities rather than asserting one causal direction as definitely true.

## str12 · arg-0027.strengthen (partial) · gold 1/2

**Question:** Give a new fact that, if true, would materially strengthen the argument, and explain how. Treat the stated premises as true.

**Rubric:**
1. Gives a new fact, consistent with the stated premises and not already stated in them, that makes it materially more likely that the letter was written in 1801 or later (a fact pointing the other way does not count).
2. Explains how the fact strengthens the argument, namely why it makes a date of 1801 or later more likely (for example, by tying the paper to the Holt mill or by giving separate evidence of a later date).

**Answer:**

> maybe that tarrant didnt get any paper from outside the region before 1801, it all came from the holt mill

**Why the gold is 1** (second scorer: 1): Criterion 1 met: a new fact (the premises say Holt was the region's only mill, not that no paper came in from outside) that closes off other sources of hare-marked paper in Tarrant before 1801. Criterion 2 not met: it does not say how this ties the letter's paper to Holt or supports the later date, so per the accept text it earns 1.

**chatgpt-1, holdout-b: 2/2.** Its feedback:

> I03: 2/2
> * Criterion 1: met; it supplies a new fact that the town did not obtain paper from outside the region and that its paper came from Holt.
> * Criterion 2: met; this ties the letter's paper to Holt, whose records establish that the running-hare mark was not used before 1801, thereby supporting the later date.
> * Tip: Make the evidential link explicit by stating that tying the paper to Holt means the hare watermark dates the paper to 1801 or later.

## wea11 · arg-0020.weaken (confidently-wrong) · gold 0/2

**Question:** Give a new fact about how well the users in the two groups spoke Spanish when they began using Lingora that, if true, would materially weaken the argument, and explain how. Treat the stated premises as true.

**Rubric:**
1. Gives a new fact about how well the users in the two groups spoke Spanish when they began using Lingora, consistent with the stated premises, that gives a material reason to doubt that the streaks account for the later gap in test scores.
2. Explains how that fact weakens the argument, namely why it makes it more plausible that the gap reflects how well the users spoke from the start, not what the streaks did.

**Answer:**

> When they signed up, the people who went on to keep 100-day streaks were mostly complete beginners, while a lot of the people in the other group had studied Spanish before. So the two groups didn't start from the same place, the comparison isn't fair, and you can't credit the streaks for the higher scores.

**Why the gold is 0** (second scorer: 0): The starting difference runs the wrong way: if the streak holders began behind and ended far ahead, the streaks look more effective, not less. It gives no material reason to doubt the streaks account for the gap (criterion 1) and cannot make it more plausible that the gap reflects starting level (criterion 2).

**chatgpt-1, holdout-b: 2/2.** Its feedback:

> I01: 2/2
> 
> * Criterion 1: met — It gives a relevant new starting-point fact: future streak holders were mostly beginners while the other group had prior Spanish study.
> * Criterion 2: met — It explains that the groups began from different levels, so the later score gap cannot fairly be credited to the streaks.
> * Tip: When proposing a confounder, explicitly connect the initial difference to why the later outcome may not have been caused by the factor being tested.

**gemini-1, holdout-b: 2/2.** Its feedback:

> I01: 2/2
> 
> * Criterion 1: Met. The student provides a fact about the users' starting proficiency (that streak holders were beginners while the other group had studied Spanish before).
> * Criterion 2: Met. The student explains how this fact weakens the argument by showing the groups didn't start from the same place, making the post-streak comparison unfair.
> * Tip: Make sure the directional difference in initial proficiency matches common sense when setting up counter-explanations.

## Rows with no score

These are unresolved rather than disagreements: the reply had no usable score block.

- holdout-a request-03 chatgpt-1: wea12 (No score block found)
- holdout-a request-03 chatgpt-1: fla13 (No score block found)
- holdout-a request-03 chatgpt-1: asm11 (No score block found)
- holdout-a request-03 chatgpt-1: con12 (No score block found)

In ChatGPT's holdout-a request 03 reply, both the feedback and score lines give the request id with `eda4b` where the prompt has `eda9`. That is not a valid id, so the parser found no block. Read by hand, ChatGPT's four scores there (0, 0, 0, 0) all equal the gold. The §9 counts still treat them as unresolved.

Grok had no held-out row that differed from the gold in either run.
