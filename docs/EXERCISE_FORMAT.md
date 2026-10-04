# Exercise Format

Status: draft v0.2 (2026-10-04, revised after peer review round 1). Schema version: `2`. This is a contract: the build script, the prompt builder and contributors all depend on it. Changing it requires a `DECISIONS.md` entry and a peer review.

## 1. Files

One exercise per file: `content/exercises/<id>.md`. YAML front matter holds metadata and tasks; the Markdown body is the stimulus shown to the student.

The stimulus is rendered with a safe Markdown subset: paragraphs, emphasis, and ordered or unordered lists. No raw HTML, links, images or embeds.

## 2. Ids

- Exercise id: `arg-0001` for arguments, `psg-0001` for passages. Four digits, zero-padded, never reused.
- Task key: lowercase letters, digits and hyphens, starting with a letter, unique within the exercise (`conclusion`, `assumption`, `flaw-2`).
- Task id (used everywhere else): `<exercise-id>.<task-key>`, e.g. `arg-0001.assumption`.

## 3. Schema

```yaml
---
schema: 2
id: arg-0001
status: draft                # draft | published | retired
kind: argument               # argument | passage
difficulty: 2                # 1 (easiest) … 5
topics: [education]          # free-form, for browsing
source:
  type: original             # original | public-domain | cc-by
  title: null                # required unless original
  creator: null              # author or issuing body; required unless original
  year: null                 # publication year of the exact edition used; required for public-domain
  locator: null              # URL or citation of the exact edition, with page or section
  license_uri: null          # required for cc-by (e.g. https://creativecommons.org/licenses/by/4.0/)
  attribution: null          # credit line exactly as it must be shown; required unless original
  rights_basis: null         # why it's usable, e.g. "17 U.S.C. §105, authored by a federal employee"
  modifications: null        # what was changed from the source, or null if unchanged
contributors: [saint]        # humans who wrote or substantially rewrote this exercise
ai_assistance:               # disclose any AI drafting
  used: true
  notes: Stimulus and rubric drafted by Claude, then edited.
approved_by: null            # maintainer handle; required to publish
approved_at: null            # date of approval
tasks:
  - key: conclusion
    skill: conclusion        # from taxonomy.yaml
    prompt: State the argument's main conclusion in one sentence.
    max: 2                   # = number of rubric criteria (each worth 1 point); 1–4
    reference: >-
      Harlow's school board should not adopt the four-day school week.
    accept: >-               # required for open-ended skills; describe the logical properties a correct answer has
      Any wording that says Harlow should not adopt the four-day week.
    disqualifiers:           # optional: conditions that make the whole task score 0
      - States the opposite recommendation (that Harlow should adopt it).
    rubric:                  # each criterion is worth exactly 1 point
      - Names the recommendation about Harlow's schedule, not a premise or the evidence about other districts.
      - States only that recommendation, without adding claims the author does not make.
    anchors:                 # one example per possible score, 0..max
      - points: 2
        answer: Harlow shouldn't switch to a four-day week.
      - points: 1
        answer: Harlow shouldn't switch because neighboring districts' scores fell.
        note: correct conclusion but folds in a premise
      - points: 0
        answer: Reading scores fell in nearby districts after the switch.
        note: a premise, not the conclusion
    likely_errors: [premise-as-conclusion, counterpoint-as-conclusion, overstated]
---
Stimulus text. Arguments: 60–180 words. Passages: 350–550 words, 3–5 paragraphs.
```

## 4. Validation rules (enforced by `npm run content`)

1. Front matter matches the schema; unknown keys are errors.
2. `id` matches the filename and is unique; task keys are unique within the file.
3. Every `skill` and `likely_errors` tag exists in `content/taxonomy.yaml`.
4. `max` equals the number of rubric criteria.
5. `anchors` has exactly one entry for each score from 0 to `max`.
6. `accept` is present and non-empty for skills marked `open_ended` in the taxonomy.
7. `status: published` requires `approved_by` and `approved_at`.
8. `source.type` other than `original` requires `title`, `creator`, `attribution` and `rights_basis`; `public-domain` also requires `year`; `cc-by` also requires `license_uri`.
9. Word counts are within the ranges above (warning, not error).
10. Body and all task text contain no blocked strings: `LSAT`, `LSAC`, `PrepTest`, `Law School Admission` (case-insensitive). This is a screen, not proof of clean provenance.

## 5. Skills (v1)

| Skill | Kind | Open-ended | Prompt wording |
| --- | --- | --- | --- |
| `conclusion` | argument | no | State the argument's main conclusion in one sentence. |
| `assumption` | argument | yes | State an assumption the argument needs: a claim that, if false, would make the argument fall apart. (A necessary assumption; it need not make the argument airtight.) |
| `flaw` | argument | no | Describe the main reasoning error in one or two sentences. |
| `weaken` | argument | yes | Give a new fact that, if true, would materially weaken the argument, and explain how. Treat the stated premises as true. |
| `strengthen` | argument | yes | Give a new fact that, if true, would materially strengthen the argument, and explain how. Treat the stated premises as true. |
| `principle` | argument | yes | State a general rule that, together with the stated facts, would justify the conclusion. Restating the conclusion does not count. |
| `main-point` | passage | no | State the passage's main point in one sentence. |
| `structure` | passage | no | Give the role of each paragraph in a few words each. |
| `attitude` | passage | no | Describe the author's attitude toward the named subject, citing one phrase. |

For open-ended skills, the reference is illustrative. `accept` describes the logical properties every correct answer shares, and the anchors should include at least one full-credit answer that differs from the reference.

## 6. Changing published exercises

- Wording fixes that do not change what a task tests: edit in place.
- Any change to what a task tests, its max, rubric or anchors in a way that changes scores: create a new task key (e.g. `flaw-2`) and retire the old one. Old attempts keep their frozen snapshot, so history stays readable.
- Retired tasks are never offered for new study but remain readable in history.
- Drafts are built only in development; production builds include `published` and `retired` exercises only.
