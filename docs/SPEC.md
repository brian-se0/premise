# Product Spec

Status: draft v0.6 (2026-10-04, security audit alignment). Working name: **Premise** (placeholder; see Open questions).

## 1. Purpose

Premise is a free, open-source trainer for the reasoning skills tested by law school admission exams. Students read short arguments and passages, **write** their analysis in their own words, and have it graded by the free version of a frontier AI chatbot (OpenAI's ChatGPT, Anthropic's Claude, Google's Gemini or xAI's Grok), or grade it themselves against a rubric. Local models running on the student's own computer are the second target; other closed models are not a target for now. The app tracks results and schedules reviews.

**Positioning: targeted reasoning repair.** Premise is for the student who understands an explanation after reading it but still misses the reasoning move on the next unfamiliar argument. It finds the step a student keeps missing, gives one precise correction, then checks the same point on a fresh argument. A time-capped **final-weeks mode** serves the last stretch before the exam.

It does not simulate the official test. Students keep taking official practice tests elsewhere (LawHub) to measure progress. Premise trains the step those tests don't: producing the answer before seeing the choices. Whether this transfers to better test scores is a hypothesis the owner's own use will test, not a promise.

## 2. Users

- **Primary (first release):** the project owner, studying for the exam from the start, on a phone and a Windows PC.
- **Target:** self-studying test takers past the basics, including those in their final weeks, comfortable copying and pasting between apps. A small group of such students tests usefulness before the app is opened to others (`ROADMAP.md` M3).

## 3. Hard constraints

1. **No official content.** No LSAC questions, passages, explanations or paraphrases, and no prep-company content. See `CONTENT_GUIDELINES.md`.
2. **No test branding.** The name, logo, UI and marketing do not use "LSAT" or LSAC marks.
3. **No server.** Static site. No accounts, backend, AI API calls or analytics.
4. **Privacy.** Premise does not upload answers or progress; it stores them on the device and only downloads its own app files. When the student pastes a grading prompt into another service, that service receives the answers under its own terms. This is said plainly before the first copy, from the first release that can copy.
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
3. Reviews are mixed with new tasks practising the same skill. New tasks are drawn first from exercises the student has never seen, so they meet new arguments, not only remembered ones. A new task on an already-seen stimulus is allowed when nothing unseen remains, and is recorded as **familiar stimulus**. A stimulus counts as seen once any of its tasks has been shown, whatever happened to that task afterwards.
   The automatic planner never puts two tasks from the same exercise on the same day unless both are due. Opening an exercise from the Library is the student's explicit choice and may include several of its tasks.
4. All selected tasks for a stimulus are answered before any reference, feedback or grading for that stimulus is revealed.
5. Answers autosave as drafts with a visible "Saved" state. The student can submit an answer, submit it blank on purpose, or skip it. Submitted answers cannot be edited; trying again makes a new attempt. Skipping ends that task for the session. Leaving and returning resumes at the same task with drafts intact.
6. The student can stop after any exercise; submitted answers are kept for grading. A task can be suspended from its menu.
7. Grading mode: **batch** (default; grade at the end, up to the batch size, default 4) or **per exercise** (grade after each exercise's tasks).
8. **Focus.** The student can pick a reasoning distinction to work on (an error tag, such as `overstated` or `reversed-logic`) or type a short note about a miss from their own official practice. The planner then favours tasks whose likely errors include it. Notes never contain official questions; the app says so where the note is typed.
9. **Repair loop.** After a missed task, the result screen gives the one correction from the grader's feedback, and the planner schedules a **fresh-stimulus task on the same skill and likely error** for a later session, before any repeat of the missed task.
10. **Conclusion tasks are selective.** They are offered as a quick diagnostic early on and after a flaw or assumption answer that attacked the wrong claim, not as a routine first step. Once the student gets them right on medium and hard stimuli, the planner stops offering them unless a later miss points back to them.
11. **Final-weeks mode** (a setting): sessions of 3–4 tasks, about 10–15 minutes including grading; only medium and hard tasks, plus easier ones only to rebuild a distinction the student just missed; an optional timed check of 90–120 seconds per task with overtime allowed and recorded separately from correctness; a daily cap on reviews, prioritising unresolved misses, and no "you are behind" backlog.

### 5.2 Grade

1. The Grade screen lists the submitted answers and offers **Copy for grading** and **Grade it myself**. Either one first saves the frozen grading request (more than one if the answers don't fit in one prompt). Each answer belongs to one request only.
2. Copying puts the request's prompt on the clipboard; copying again gives the same prompt. If the clipboard write fails, the prompt appears in a selectable box. Requests with any row still waiting for a grade, including "needs review" rows, appear in an **Awaiting grading** list on Home and can be resumed any time.
3. Links open the four frontier chatbots (ChatGPT, Claude, Gemini, Grok) in a new tab. Links never carry the prompt.
4. The student pastes the chatbot's whole reply. The app shows, per row: the score or the reason it is invalid, the tags, and the matched feedback. Warnings and the full raw reply are one tap away.
5. Before confirming, a full-credit row can be marked "That was hard" or "Too easy".
6. **Confirm** saves valid rows exactly once and schedules them. Invalid, missing or "needs review" rows stay unresolved; the student can re-paste, enter a score manually, or self-grade them. Confirming twice, from two tabs, or after the grade was undone never schedules a task twice.
7. After confirming, each result shows the feedback, a **Try again** option for missed tasks (a coached attempt, not scheduled), **Flag** for an unfair grade or a content problem (saved with a category and note, and included in exports), and **Correct grade** for the latest grade of that task.
8. A confirmed task is not offered again before the next day, even if it is due, so the student is not re-tested on an answer they just read.
9. **Discard** abandons rows that are still waiting, or the whole request: those answers count for nothing; confirmed grades are kept.

### 5.3 Review

Due cards are shown with a count on Home. A review re-presents the task as a new attempt; the previous answer and feedback stay hidden until the new answer is submitted.

### 5.4 Progress

- Per skill, shown separately:
  - **First attempts**: one per task, the first uncoached submission; "full credit on X of Y tasks", split into new-stimulus and familiar-stimulus tasks, with their difficulty mix. A discarded first submission uses up the task's first attempt and is excluded.
  - **Reviews**: "full credit on X of Y review attempts, across Z tasks".
- Pending, needs-review, coached and discarded attempts are excluded from results.
- Error tags from the last 30 days, presented as "things to look at" with links to the tasks, not as a diagnosis. For each, whether the student has since got a fresh-stimulus task with the same likely error right.
- Counts: tasks attempted, due today, and "stable" (scheduled interval of 21 days or more; hidden in final-weeks mode, where it means little).

### 5.5 Data

- Export one JSON file with everything, including content snapshots.
- Import replaces all data after a preview and an offer to export the current data first.
- Prompt for the first export after the first graded request; remind when the last export is more than 7 days old and there is new activity.

## 6. Screens

Home (Today, Awaiting grading, due count) · Session · Grade · Results · Progress · Library · Settings · About (licenses, source link and deployed commit, privacy, how grading works, source credits).

Mobile-first; usable at 360px wide. Keyboard-navigable; WCAG 2.2 AA contrast; validated manually with a screen reader (`ARCHITECTURE.md` §11).

The deployed site contains production content only. Draft exercises remain available in a local build, not on the public site (`DECISIONS.md`, 2026-10-04 production deploy decision).

## 7. Out of scope for the first release

Accounts, sync, merge import, hosted AI grading, multiple-choice questions, timed full tests, writing practice, social features, native apps, progress charts beyond the counts above, chatbot endorsements, and the 100-exercise target.

## 8. Success criteria

**First release (owner use):**
- The owner uses Premise on at least 20 of 30 consecutive days.
- The M0 pilot ended in a recorded outcome (`ROADMAP.md` M0), and the app uses the chatbot configuration, or self-grading, that outcome chose.
- No data loss across the test matrix: reload mid-session, partial grading, correction, export then replace-import.
- The owner's log of workflow friction after 30 days has no unresolved item marked "would stop me using it".

**Before opening to others:** the M3 usefulness pilot ended in a recorded "go"; at least 50 published exercises across the argument skills, each approved under `CONTENT_GUIDELINES.md` §6; and a second grading pilot run on fresh held-out exercises. Recommending any chatbot to other students is a separate decision.

## 9. Open questions

1. Final product name (must avoid "LSAT" and LSAC marks).
2. May the README describe the target exam by name in one descriptive sentence with a trademark disclaimer? Default: no.
3. Must public exercises have a reviewer other than their author once outside contributors exist? Default: per exercise, an exercise with any contributor who is not a maintainer must be approved by a maintainer who is not one of its contributors; exercises written only by maintainers may be approved by a maintainer. The content build enforces this (`EXERCISE_FORMAT.md` §4).
