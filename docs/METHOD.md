# Method

Status: v1 (2026-10-06). Agreed with GPT-6 Pro in two rounds and adopted by the owner (`DECISIONS.md`, 2026-10-06; record in `reviews/2026-10-06-formal-method.md`). §1–§4 are written for students and become the in-app Method page; §5 is for authors.

## 1. The idea

**Systematic reading with selective formal checks.** Every question gets the same organized read. A small formal tool switches on only when a sentence's meaning calls for it, takes seconds on scratch paper, and leaves the written answer in plain English. Formal logic decides a small share of argument questions; most turn on evidence (causes, samples, numbers), where a fixed checklist helps and symbols do not.

## 2. Read the task, then map

Start from what the question asks. For questions that judge reasoning, split the passage into **Evidence** (what is given as true), **Claim** (what the author concludes) and **Claimed connection** (why the author thinks the evidence supports the claim). Do not assume there is a flaw.

| The question asks you to | What you do |
| --- | --- |
| Find the conclusion | Find the Claim; every other sentence supports it, sets it up or argues against it. |
| Describe the flaw | Say where the connection fails: what the Claim says that the Evidence does not show. |
| State a necessary assumption | Find a statement the reasoning depends on. Negate it: if the reasoning collapses, it is necessary. The conclusion need not become false. |
| Say what would justify the conclusion | Find a statement that, added to the Evidence, guarantees the Claim. Bridging the terms that appear only in the Claim is a heuristic, not a test. |
| Strengthen or weaken | Add a new fact that makes the Claim more or less likely, keeping every premise true. |
| Say what must follow | Map Evidence to a candidate inference; do not invent an argument. Keep what the Evidence guarantees apart from what it best supports. |
| Apply or match a principle | Check the case against the rule's conditions. This is not always gap-filling. |
| Describe a sentence's role | Say what the sentence does for the Claim. |
| Match the reasoning | Find another argument with the same structure. |
| Resolve a paradox | Find a fact that lets the accepted facts all be true. |
| Find a disagreement | Find the claim the two speakers commit to differently. |

When a Claim feels wrong but the reason is unclear, use this menu (not a compulsory scan). Does the Claim reverse a direction, treat a requirement as a guarantee, raise "some" to "all", move from a rate to a count, from a sample to everyone, from a part to the whole, from one time to another, from "possible" to "certain", from "linked" to "caused", or from who said it to whether it is true? An unchanged vocabulary can still hide circular reasoning.

## 3. Three kits

Switch a kit on by meaning, with words only as cues: "must" can state an obligation, and "because" usually introduces evidence.

### 3.1 Logic: when the answer depends on form

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

### 3.2 Quantity: when numbers or shares carry the argument

Cues: percent, share, rate, average, per, each, total, any number. Ask: out of what (denominator), counting what (unit), over what period? Try an easy counterexample before exact arithmetic, unless a threshold decides the question.

- **Count = rate × base.** A share can fall while the count rises. If 15% of appointments were missed before and 9% now, missed appointments rose when bookings grew by more than two-thirds (15/9 = 5/3).
- **Unit of analysis, with bounds.** 1,000 restaurants inspected 4 times each, with 1 inspection in 10 failing, gives 400 failed inspections: at 100 to 400 restaurants (10% to 40%), not necessarily one in ten.
- **Part and whole.** Parts that each pass a test alone may fail it together.
- **Proxy and target.** What was measured (bags handed out, camera sightings) may not be what is claimed (weight of waste, number of animals).
- **Averages.** An average hides the spread; an average across groups depends on each group's size. A rise from 10% to 12% is 2 percentage points, or 20%.

### 3.3 Evidence: causes, samples and measurement

Cues: caused, led to, made, raised, responsible for, since then, a survey or sample. When two things go together, list the rivals to "X caused Y":

1. **Reversed:** Y caused X.
2. **Something else:** a third factor drives both, or decides who ends up with X (selection).
3. **Chance or a bounce-back:** a group picked at an unusual high or low tends to drift back toward normal.
4. **Measurement:** what was counted is not what the Claim is about.

Check which rivals the passage **rules out or reduces** (a comparison group, the earlier trend, matched conditions) and which stay open. A comparison group reduces other explanations; it does not eliminate them. To strengthen, rule out or reduce an open rival or show how the cause works. To weaken, make an open rival plausible, keeping every premise true. A rival can be true alongside a real cause, so a weakener need not prove the cause did nothing. "X causes Y" does not make X sufficient, necessary or the only cause, so a causal claim never becomes an arrow for the logic kit.

## 4. Where the line is

- No translating whole arguments into symbols, no truth tables or formal proofs, no Venn diagrams beyond the quantifier shapes, no probabilities with numbers.
- Notation is never required for credit on an argument or passage task. Only optional formal drills may ask for it, and their results are not evidence that an argument skill is repaired.
- The kits apply to single sentences inside reading passages too, when a question turns on a rule, a number or a cause.
- Scaffolding fades when results on fresh arguments show it is no longer needed, not when final-weeks mode begins.
- This is a reading method, not a beginner course: the Method page is an orientation, and anything formal beyond it is optional and offered after a matching miss.

## 5. For authors

- **Form lines.** Each task may carry one author-written line giving the skeleton the task turns on, in the kits' terms, for example "Rule: renew → attendance rose. The director infers rose → renew: the arrow is reversed." A form line is shown with the reference only after the task's grade is accepted, never enters a grading payload, and is never a criterion. It is the `form` field of exercise schema 4 (`EXERCISE_FORMAT.md` §3.1). A key check reviews the form lines along with the keys.
- **Support test (author notes only).** A new fact F strengthens a claim C, given the evidence E, when F is more expected if C is true than if it is false: P(F | C, E) > P(F | not C, E). Equality means F is neutral about C, not irrelevant to everything. The test gives a direction, not a size; rubrics still ask for a material effect (`CONTENT_GUIDELINES.md` §5).
- **Key checks.** Besides `CONTENT_GUIDELINES.md` §3.1–§3.2, check each key against §3: modality, time and scope kept; a counterexample used only against a guarantee; negations literal, with "and" and "or" handled as above; quantifier inferences in their exact shapes; arithmetic with its denominator, unit and period; rivals described as ruled out or reduced; no causal claim treated as a conditional.
- **Planned, in order** (`ROADMAP.md`): the grading check runs on frozen payloads with no form lines and the current taxonomy. After it, the error tags `negation-error`, `quantifier-error`, `rate-vs-count` and `unit-of-analysis` are added with a grading recheck of scores and tag assignment, and then a stateless trial of 12 to 18 drills graded by the app, compared with form lines alone at equal time on delayed fresh arguments.
