# Content Guidelines

Status: draft v0.5 (2026-10-04, after the difficulty consultation). Applies to everything under `content/`. Not legal advice; when unsure whether a source is usable, leave it out.

## 1. Allowed sources

| Source | Conditions |
| --- | --- |
| Original writing by a contributor | The default and preferred source. Licensed CC BY-NC-SA 4.0 on contribution. |
| Works by U.S. federal employees in their official duties | Not copyrightable (17 U.S.C. §105). Only text actually written by federal employees: not contractor reports, grantee papers, or third-party material quoted inside a government document. Record the authoring body and why it qualifies in `rights_basis`. |
| U.S. court opinions, federal and state | The opinion text only. Publisher-added headnotes, syllabi by private reporters, and summaries are excluded. |
| Works in the U.S. public domain by age | As of 2026-01-01: works published in 1930 or earlier. The exact edition used must also be public domain: later translations, annotations and revised editions may not be. Record `year` and `locator` for the edition used. |
| CC BY 4.0 works | Allowed with the full attribution, license link and a description of changes. |

Public-domain and CC BY source text keeps its own status inside Premise; the project's CC BY-NC-SA license covers only what contributors add (tasks, references, anchors, rubrics, and original stimuli). Credits are shown in the app with the exercise and included in the grading prompt.

U.S. public-domain status is not a worldwide determination. If a source's status is uncertain, it stays out of the published library.

## 2. Forbidden sources

- Anything from LSAC: PrepTests, LawHub, released tests, explanations, sample questions, or recognizable paraphrases of them.
- Questions or explanations from any prep company, book, course, app or forum, whatever their license.
- CC BY-SA, CC BY-ND, NonCommercial-only or other licensed material, other than CC BY. (BY-SA cannot be relicensed under NonCommercial terms.)
- Any other copyrighted text, including news, blogs and books, even short excerpts.
- AI output that resembles any of the above. If a drafted stimulus feels familiar, discard it. Blocked-word scans and familiarity checks are screens, not proof.

## 3. Writing arguments

- 60–180 words, one main conclusion, a structure a careful reader can map.
- Varied topics: science, policy, business, ethics, history, arts. No real private individuals; public figures only in neutral, factual framing.
- One main reasoning issue per argument for `flaw` tasks.
- Avoid content that turns on outside knowledge, current events, or political positions the student must agree with.

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

## 4. Writing passages

- 350–550 words, 3–5 paragraphs, with a discernible main point and author stance.
- Public-domain or CC BY sources may be trimmed and lightly edited; describe the edits in `modifications`.

## 5. References, acceptance notes, anchors and rubrics

- **Reference:** what a strong student would write in a minute or two. For open-ended skills it is one example among many.
- **Counts as correct (`accept`):** the logical properties every correct answer shares, not a list of paraphrases. Required for open-ended skills.
- **Rubric:** 1–4 criteria, each worth exactly one point, each observable in the answer ("names the switch and the fall in scores"), never vague ("shows understanding"). A criterion may only require what the task prompt asks for. If full credit needs something, such as leaving out the reasons, the prompt says so.
- **Alternatives:** where a rubric credits an alternative explanation, it must be offered as a possibility, not invented evidence asserted as fact.
- **Disqualifiers:** only for misunderstandings severe enough that partial credit would mislead, e.g. stating the opposite conclusion. A disqualifier for restating a premise or the conclusion names what it covers and applies only when the answer offers nothing else: "Mentioning a stated claim while also giving a distinct assumption does not trigger this."
- **Strengthen and weaken criteria:** criterion 1 is directional and material ("makes it materially more likely that…", "gives a material reason to doubt that…"), never "bears on whether…", which credits a fact pointing the wrong way. In `accept`, an unexplained fact that meets criterion 1 is "a qualifying fact" and earns 1.
- **Anchors:** one sample answer for every possible score, including at least one full-credit answer unlike the reference for open-ended skills. Reference, `accept`, rubric and anchors must agree: grade each anchor against the rubric and check you get its stated score. A partial-credit anchor meets exactly one criterion (for a flaw task, it identifies the inference without saying why it fails); a bare flaw label earns 0.
- **Likely errors:** the 2–4 tags a grader is most likely to need.

## 6. Provenance and approval

- `contributors` lists the humans who wrote or substantially rewrote the exercise. `ai_assistance` records whether and how AI drafted any part.
- AI-drafted text that no human substantially rewrote may not be protectable by copyright; the project does not rely on the license to protect it.
- Publishing is an explicit maintainer action: set `approved_by`, `approved_at` and `approved_revision` (printed by `npm run content`) after completing the checklist below. Any later edit to the exercise, other than its `status` and the approval fields themselves, changes the revision and requires approving again.
- Until outside contributors exist, the owner's approval is enough, even for exercises the owner wrote. Once an exercise has a contributor who is not a maintainer, the build requires an approving maintainer who is not one of its contributors (`EXERCISE_FORMAT.md` §4).

## 7. Approval checklist

- [ ] The source is allowed (§1), and its fields, credit and rights basis are complete and correct.
- [ ] The text reads naturally and contains no blocked terms or familiar-looking material.
- [ ] I answered every task myself before reading the reference, and my answer got full credit under the rubric.
- [ ] Each anchor gets exactly its stated score under the rubric.
- [ ] Every rubric requirement is asked for in the task prompt.
- [ ] Counterexamples, graded against the rubric: a correct concise answer gets full credit; an accurate answer with extra explanation gets the score the prompt implies; a self-contradictory answer using the expected keywords does not get full credit; a wholly wrong answer cannot get full credit; each disqualifier overrides any points earned.
- [ ] For open-ended tasks, at least one full-credit anchor differs substantially from the reference.
- [ ] Difficulty is plausible relative to existing exercises.
