# Pilot log

One entry per run. Date, chatbot and visible model label, client (web or app, phone or PC), prompt and parser versions, settings, run file (per-reply details are in the run folder's `notes.csv`), then notes: disagreements with the owner's grades, feedback that could not be matched, and anything that made the copy-paste loop annoying (mark blockers "would stop me").

## 2026-10-06 to 2026-10-07 · development runs dev-a and dev-b

All eight runs: web on the owner's PC, pasted and copied by Claude after the owner's go-ahead (21:09 UTC 2026-10-06); prompt v4, parser v4; pasted with Ctrl+V into a new chat, saved with the chatbot's copy button, unchanged. Run files: `tests/fixtures/pilot/dev-a/` and `dev-b/`. Their `notes.csv` were converted to the columns above from the PC session's own columns, with every value kept. No reply shows signs of a web search.

### ChatGPT · chatgpt-1 in dev-a and dev-b

- Free account, temporary chat set to Unpersonalized. No model picker, Think off; the page reported gpt-5-6 for every reply except dev-a 12 (gpt-5-6-mini) and dev-a 08 (no reply). Web search has no off switch; it was not selected.
- dev-a 21:18 UTC 2026-10-06 to 04:37 UTC 2026-10-07; dev-b 04:39 to 12:34 UTC 2026-10-07.
- The free limit came after about ten replies per window: dev-a 13 and dev-b 10 to 13 waited for a reset, and dev-a 12 came from gpt-5-6-mini, so the report flags a model change in dev-a. A five-request held-out run fits in one window.
- dev-a 08: no reply after about six and a half minutes of the waiting dot, no error; saved empty.
- dev-a 01 to 03 went as a "Pasted text.txt" attachment; later pastes stayed inline.
- Every disagreement with gold is one point high: 4 rows in dev-a, 3 in dev-b (2 and 3 false passes).

### Claude · claude-1 in dev-a and dev-b (reported apart)

- The owner's paid account (Max), incognito chat, Sonnet 5.5 at Medium effort: assumed to be the free plan's default, which claude.ai does not show. No web search switch in the incognito composer.
- dev-a 21:19 to 21:59 UTC, dev-b 22:02 to 22:28 UTC, 2026-10-06. Long pastes went as an attachment.
- dev-a 08: a corrected second score block after "Wait: I must correct the tag in I01". Same scores, different tags, so the parser offers a choice (§5).
- Feedback headings that contradict the scores left rows unmatched: dev-a 04 (I01), dev-b 05 (I02, I03).
- dev-a 07 has text after END SCORES (saved as copied; the parse is unaffected).
- Disagreements go both ways: 8 rows in dev-a, 6 in dev-b.

### Gemini · gemini-1 in dev-a and dev-b

- Free account, Gemini Flash (picker: 3.6 Flash). No temporary chat in this account's Gemini, so all 26 chats are in the owner's Gemini history; no web search or memory switch.
- dev-a 21:19 to 21:59 UTC, dev-b 22:02 to 22:27 UTC, 2026-10-06.
- One refusal per run, with no limit notice: dev-a 11 and dev-b 02 say only "I'm having a hard time fulfilling your request. Can I help you with something else instead?"
- Twice the copied text holds a cut-off first draft followed by a fresh BEGIN FEEDBACK (dev-a 06, dev-b 06), which leaves some feedback unmatched.
- In dev-a 01 and 02 the reply finished only with the tab in front; 02 needed a reload to show its copy button.
- Disagreements: 2 rows in dev-a, 1 in dev-b, all one point high on weaken tasks.

### Grok · grok-1 in dev-a and dev-b

- Signed in, plan not shown (the menu offers "Upgrade plan"); private chat in Auto mode (set from Expert at dev-a 01). No web search switch.
- dev-a 21:21 to 21:59 UTC, dev-b 22:02 to 22:28 UTC, 2026-10-06.
- Every reply clean, every feedback row matched. One disagreement with gold (dev-a, one point high).

## 2026-10-07 · configuration frozen for the held-out runs

Unchanged from the development runs: prompt v4, parser v4, the keys and labels registered in `pilot/registration.ts`, and each chatbot's setup as in its entry above (ChatGPT free in a temporary chat; Claude on the owner's paid account in an incognito chat with Sonnet 5.5 at Medium effort; Gemini Flash 3.6 free in a normal chat; Grok in a private chat in Auto mode), pasted and copied the same way. The expected parse and feedback results for the 104 development replies are in each run's `expected.json`. An independent reading of every score block and feedback heading agreed with them on all 104; the four replies without a single score block (dev-a 08 ChatGPT, empty; dev-a 11 and dev-b 02 Gemini, refusals; dev-a 08 Claude, a corrected second block) were read in full.
