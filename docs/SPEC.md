# Product Spec

Status: draft v0.2 (2026-10-04, revised after peer review round 1). Working name: **Premise** (placeholder; see Open questions).

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
4. **Privacy.** Premise stores progress only on the device and transmits nothing. When the student pastes a grading prompt into another service, that service receives the answers under its own terms. This is said plainly before the first copy.
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
3. Reviews are mixed with unseen tasks practising the same skill, so the student meets new arguments, not only remembered ones. Two tasks from the same exercise are not both scheduled on the same day unless both are due.
4. All selected tasks for a stimulus are answered before any reference, feedback or grading for that stimulus is revealed.
5. Answers autosave as drafts with a visible "Saved" state. The student can submit an answer, submit it blank on purpose, or skip it. Leaving and returning resumes at the same task with drafts intact.
6. The student can stop after any exercise; submitted answers are kept for grading. A task can be suspended from its menu.
7. Grading mode: **batch** (default; grade at the end, up to the batch size, default 4) or **per exercise** (grade after each exercise's tasks).

### 5.2 Grade

1. The Grade screen lists the request's rows and offers **Copy for grading** and **Grade it myself**.
2. Copying creates the frozen grading request and puts its prompt on the clipboard. If the clipboard write fails, the prompt appears in a selectable box. Requests waiting for a reply appear in an **Awaiting grading** list on Home and can be resumed any time.
3. Links open common chatbots in a new tab. Links never carry the prompt.
4. The student pastes the chatbot's whole reply. The app shows, per row: the score or the reason it is invalid, the tags, and the matched feedback. Warnings and the full raw reply are one tap away.
5. **Confirm** saves valid rows exactly once and schedules them. Invalid, missing or "needs review" rows stay unresolved; the student can re-paste, enter a score manually, or self-grade them.
6. After confirming, each result shows the feedback, a **Try again** option for missed tasks (a coached attempt, not scheduled), **Flag** for an unfair grade or a content problem, **Correct grade**, and, for full-credit answers, an optional "That was hard" or "Too easy".
7. **Discard** abandons a request: unresolved attempts become skipped; graded ones keep their grades.

### 5.3 Review

Due cards are shown with a count on Home. A review re-presents the task as a new attempt; the previous answer and feedback stay hidden until the new answer is submitted.

### 5.4 Progress

- Per skill: first-attempt results and review results shown separately, each as "full credit on X of Y tasks", with the number of tasks and their difficulty mix.
- Pending, needs-review, coached and discarded attempts are excluded.
- Error tags from the last 30 days, presented as "things to look at" with links to the tasks, not as a diagnosis.
- Counts: tasks attempted, due today, and "stable" (scheduled interval of 21 days or more).

### 5.5 Data

- Export one JSON file with everything, including content snapshots.
- Import replaces all data after a preview and an offer to export the current data first.
- Prompt for the first export after the first graded request; remind when the last export is more than 7 days old and there is new activity.

## 6. Screens

Home (Today, Awaiting grading, due count) · Session · Grade · Results · Progress · Library · Settings · About (licenses, source link and deployed commit, privacy, how grading works, source credits).

Mobile-first; usable at 360px wide. Keyboard-navigable; WCAG 2.2 AA contrast; validated manually with a screen reader (`ARCHITECTURE.md` §11).

## 7. Out of scope for the first release

Accounts, sync, merge import, hosted AI grading, multiple-choice questions, timed full tests, writing practice, social features, native apps, progress charts beyond the counts above, chatbot endorsements, and the 100-exercise target.

## 8. Success criteria

**First release (owner use):**
- The owner uses Premise on at least 20 of 30 consecutive days.
- On the owner's grading-pilot set, the chosen chatbot meets the bar in `GRADING_PROTOCOL.md` §9.
- No data loss across the test matrix: reload mid-session, partial grading, correction, export then replace-import.
- The owner's log of workflow friction after 30 days has no unresolved item marked "would stop me using it".

**Before inviting others:** 50 published exercises across the argument skills, each approved under `CONTENT_GUIDELINES.md` §6, and a second pilot run on the holdout set.

## 9. Open questions

1. Final product name (must avoid "LSAT" and LSAC marks).
2. May the README describe the target exam by name in one descriptive sentence with a trademark disclaimer? Default: no.
3. Must public exercises have a reviewer other than their author once outside contributors exist? Default: yes from the first outside contribution; owner approval alone until then.
