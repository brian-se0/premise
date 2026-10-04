# Content Guidelines

Status: draft v0.2 (2026-10-04, revised after peer review round 1). Applies to everything under `content/`. Not legal advice; when unsure whether a source is usable, leave it out.

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

## 4. Writing passages

- 350–550 words, 3–5 paragraphs, with a discernible main point and author stance.
- Public-domain or CC BY sources may be trimmed and lightly edited; describe the edits in `modifications`.

## 5. References, acceptance notes, anchors and rubrics

- **Reference:** what a strong student would write in a minute or two. For open-ended skills it is one example among many.
- **Counts as correct (`accept`):** the logical properties every correct answer shares, not a list of paraphrases. Required for open-ended skills.
- **Rubric:** 1–4 criteria, each worth exactly one point, each observable in the answer ("names a cause other than the schedule"), never vague ("shows understanding").
- **Disqualifiers:** only for misunderstandings severe enough that partial credit would mislead, e.g. stating the opposite conclusion.
- **Anchors:** one sample answer for every possible score, including at least one full-credit answer unlike the reference for open-ended skills. Reference, `accept`, rubric and anchors must agree: grade each anchor against the rubric and check you get its stated score.
- **Likely errors:** the 2–4 tags a grader is most likely to need.

## 6. Provenance and approval

- `contributors` lists the humans who wrote or substantially rewrote the exercise. `ai_assistance` records whether and how AI drafted any part.
- AI-drafted text that no human substantially rewrote may not be protectable by copyright; the project does not rely on the license to protect it.
- Publishing is an explicit maintainer action: set `approved_by` and `approved_at` after completing the checklist below. Until outside contributors exist, the owner's approval is enough, even for exercises the owner wrote. (Open question in `SPEC.md` §9.)

## 7. Approval checklist

- [ ] The source is allowed (§1), and its fields, credit and rights basis are complete and correct.
- [ ] The text reads naturally and contains no blocked terms or familiar-looking material.
- [ ] I answered every task myself before reading the reference, and my answer got full credit under the rubric.
- [ ] Each anchor gets exactly its stated score under the rubric, and no criterion can be met by a wrong answer.
- [ ] For open-ended tasks, at least one full-credit anchor differs substantially from the reference.
- [ ] Difficulty is plausible relative to existing exercises.
