# Exercise Format

Status: draft v0.6 (2026-10-06, form lines). Schema versions: `3` and `4`; schema 4 is schema 3 plus optional form lines (§3.1). This is a contract: the build script, the prompt builder and contributors all depend on it. Changing it requires a `DECISIONS.md` entry and a peer review.

## 1. Files

One exercise per file: `content/exercises/<id>.md`. YAML front matter holds metadata and tasks; the Markdown body is the stimulus shown to the student.

The stimulus is rendered with a safe Markdown subset: paragraphs, emphasis, and ordered or unordered lists. No raw HTML, links, images or embeds.

The stimulus **text** used in snapshots and grading prompts is the body trimmed, with paragraphs separated by one blank line and the line breaks inside a paragraph replaced by single spaces. (Lists inside passages will need their own rule when passage skills arrive in M6.)

## 2. Ids

- Exercise id: `arg-0001` for arguments, `psg-0001` for passages. Four digits, zero-padded, never reused.
- Task key: lowercase letters, digits and hyphens, starting with a letter, unique within the exercise (`conclusion`, `assumption`, `flaw-2`).
- Task id (used everywhere else): `<exercise-id>.<task-key>`, e.g. `arg-0001.assumption`.

## 3. Schema

```yaml
---
schema: 4                    # 3 or 4; form lines need 4 (§3.1)
id: arg-0001
status: draft                # draft | published | retired
kind: argument               # argument | passage
difficulty: 2                # 1 (easiest) … 5; the stimulus's difficulty, and the default for its tasks
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
contributors: [brian-se0]    # humans who wrote or substantially rewrote this exercise
ai_assistance:               # disclose any AI drafting
  used: true
  notes: Stimulus and rubric drafted by Claude, then edited.
approved_by: null            # maintainer handle from content/maintainers.yaml; required to publish
approved_at: null            # date of approval
approved_revision: null      # content revision printed by `npm run content` at approval; required to publish
tasks:
  - key: conclusion
    status: active           # active | retired (default active)
    skill: conclusion        # from taxonomy.yaml
    difficulty: 2            # optional: this task's difficulty if it differs from the exercise's (author-predicted until tested)
    difficulty_note: null    # optional: what makes it hard, e.g. "intermediate conclusion confusable with the main one"
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
    form: >-                 # optional, schema 4 only: one line, at most 300 characters (§3.1)
      Claim: Harlow should not adopt the four-day week. The reading scores are evidence; the teacher point is a concession.
---
Stimulus text. Arguments: 60–180 words. Passages: 350–550 words, 3–5 paragraphs.
```

### 3.1 Form lines (schema 4)

A form line is one author-written line giving the skeleton a task turns on, in the terms of `METHOD.md` §3. It is display only:

- The app shows the task's current form line with the reference answer after the task's grade is accepted, never while the student is answering or before grading.
- It is not part of the snapshot payload (`ARCHITECTURE.md` §4.1), so it never enters a grading prompt, never changes a snapshot hash and is never a rubric criterion. Saved grading requests are unaffected by adding or editing one.
- It is part of the content revision (§4 rule 7), so adding or editing one needs approval like any other edit, and a key check reviews form lines with the keys.
- `form` is valid only under `schema: 4`. A schema 3 file is unchanged and needs no re-approval; moving a file to schema 4 to add form lines is an edit that does.

## 4. Validation rules (enforced by `npm run content`)

1. Front matter matches the schema; unknown keys are errors. A `form` line needs `schema: 4`, is a single line and is at most 300 characters.
2. `id` matches the filename and is unique; task keys are unique within the file.
3. Every `skill` and `likely_errors` tag exists in `content/taxonomy.yaml`.
4. `max` equals the number of rubric criteria.
5. `anchors` has exactly one entry for each score from 0 to `max`.
6. `accept` is present and non-empty for skills marked `open_ended` in the taxonomy.
7. `status: published` or `retired` requires `approved_by`, `approved_at` and `approved_revision`, and `approved_revision` must equal the exercise's current **content revision**: a SHA-256, computed by the build and printed for each exercise, over the stimulus body and every front-matter field except `status`, `approved_by`, `approved_at` and `approved_revision` (serialized as in `ARCHITECTURE.md` §4.1). Any other edit, including difficulty, contributors, adding a task or retiring one, therefore requires re-approval.
8. `approved_by` must be listed in `content/maintainers.yaml`. If any contributor is not a maintainer, `approved_by` must be a maintainer who is not among the contributors.
9. `source.type` other than `original` requires `title`, `creator`, `locator`, `attribution` and `rights_basis`; `public-domain` also requires `year`; `cc-by` also requires `license_uri`.
10. Rubric criteria test only what the task prompt asks for (checked by the author, `CONTENT_GUIDELINES.md` §7; not machine-checkable).
11. The grading prompt for any single task, with a 2,000-character answer, fits the prompt budget in `GRADING_PROTOCOL.md` §2.
12. A task key that was ever published is never reused for different content, and a retired task cannot become active again. The build enforces the mechanical part against `content/published-tasks.json` (`DECISIONS.md`, Published-task ledger): same skill and max under a key, every published revision and every retirement recorded, no return from retired, and nothing retired that was never published. Whether reworded content still tests the same thing is checked at approval.
13. Word counts are within the ranges above (warning, not error).
14. Body and all task text, form lines included, contain no blocked strings: `LSAT`, `LSAC`, `PrepTest`, `Law School Admission` (case-insensitive). This is a screen, not proof of clean provenance.

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

- Wording fixes that do not change what a task tests: edit in place and re-approve (the content revision changes).
- Any change to what a task tests, its max, rubric or anchors in a way that changes scores: add a new task key (e.g. `flaw-2`) and set the old task's `status: retired`. Old attempts keep their frozen snapshot, so history stays readable.
- A task is **available** for study only when its exercise is `published` and the task is `active`.
- Retired tasks, tasks of retired exercises, and tasks no longer present in the content are excluded from all new sessions and from due counts. Their cards and history are kept and shown in history. Cards are never transferred to a replacement task key; the replacement starts fresh.
- Drafts are built only in development; production builds include `published` and `retired` exercises only.

## 7. Credit line

One shared function, `formatCredit(source)`, produces the credit shown in the app and placed in the grading prompt (`Source:` line). It returns null for `original`. Otherwise:

`{attribution}. {license}. {changes}`

- `license`: "Public domain in the United States" for `public-domain`; "CC BY 4.0, {license_uri}" for `cc-by`.
- `changes`: "Adapted: {modifications}" when `modifications` is set, otherwise "Unmodified".

The credit is part of the task snapshot (`ARCHITECTURE.md` §4.1).
