# Rubric wording fixes to published exercises (2026-10-05)

GPT-6 Pro's batch 2 key check (`reviews/2026-10-05-content-batch-2.md`, triage B2-1 to B2-18) found two wording patterns that batch 1 also uses. This change applies the same fixes to the published batch 1 exercises, plus small fixes from a Claude check of the result, some of which also apply to batch 2.

## Changes

| Exercises | Change | Why |
| --- | --- | --- |
| arg-0009, 0010, 0012 (both tasks), 0014, 0015, 0016, 0018 | Strengthen and weaken criterion 1 now asks for a fact that makes the conclusion materially more likely, or gives a material reason to doubt it, instead of a fact that "bears on whether" it holds. arg-0010's weaken says "could give a material reason to doubt", because its `accept` gives 1 point to a fact whose direction the answer leaves open. | "Bears on" credits a fact pointing the wrong way, and the prompts already ask for a material effect. |
| arg-0010, 0011, 0013, 0015 (assumption) | The disqualifier applies only when the answer offers nothing but a stated premise or the conclusion; arg-0013's also names the claim its prompt grants. | The old wording could zero an answer that mentions a premise while also giving a real assumption. |
| arg-0015 (assumption) | Criterion 1's second example is now "that there would be saltbush plants or seeds there to regrow from". | The old example, "that saltbush could still regrow there", is close to the conclusion, which the new disqualifier names. |
| arg-0010 (weaken) | Criterion 2 is not met by an explanation that holds only if the fact points a way the answer leaves open. | Keeps such answers at the 1 point `accept` gives them. |
| arg-0009, 0010, 0012, 0015, 0016, 0018, 0019, 0022, 0023, 0026 (both tasks), 0027 | The 1-point sentence in `accept` says "a qualifying fact" instead of "a relevant fact". | "Relevant" matched the old criterion and could read as crediting a wrong-direction fact. |
| arg-0018 (strengthen) | The 1-point anchor is now "Most of the people who answered had visited the parks in summer." | "Had been to the parks" was weak enough that a strict grader could find it not material. |

## Check

A separate Claude check graded all 36 anchors of the 12 changed batch 1 tasks against the new rubric, disqualifiers and `accept` text. Every anchor keeps its fixed score. It found one contradiction (arg-0015's criterion 1 example against the new disqualifier) and four minor issues (arg-0013's disqualifier, the "relevant" sentences, arg-0018's 1-point anchor, arg-0010's criterion 2), all fixed as above.

## Changing published tasks

`docs/EXERCISE_FORMAT.md` §6 allows wording fixes that do not change what a task tests to be edited in place and re-approved, and requires a new task key for rubric changes that change scores. These changes do change the score of some answers that are not anchors: a wrong-direction fact no longer meets criterion 1, and an answer that mentions a premise alongside a real assumption is no longer zeroed. In each case the prompt and the `accept` text already called for that score, so the fix makes the rubric say what the key already meant. Whether that counts as a wording fix is the owner's call, recorded with the re-approval.
