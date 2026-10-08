// The chatbots the Grade screen links (docs/SPEC.md §5.2). A chatbot that passed the grading check
// (docs/GRADING_PROTOCOL.md §9) is marked checked only on requests in the setup it was checked in.

export interface Chatbot {
  name: string;
  url: string;
  checked?: {
    /** The prompt version the check used. */
    promptVersion: string;
    /** The most answers in one prompt that the check covered. */
    maxRows: number;
    /** The setup, as the Grade screen names it. */
    setup: string;
  };
}

export const CHATBOTS: readonly Chatbot[] = [
  { name: 'ChatGPT', url: 'https://chatgpt.com/' },
  { name: 'Claude', url: 'https://claude.ai/new' },
  { name: 'Gemini', url: 'https://gemini.google.com/app' },
  // docs/DECISIONS.md, 2026-10-08.
  {
    name: 'Grok',
    url: 'https://grok.com/',
    checked: {
      promptVersion: 'v4',
      maxRows: 4,
      setup: "Grok's free website (private chat, Auto mode, up to 4 answers per prompt)",
    },
  },
];

/** Whether a chatbot was checked in the setup of a request with this prompt version and number of answers. */
export function checkedFor(chatbot: Chatbot, promptVersion: string, rows: number): boolean {
  return (
    chatbot.checked !== undefined && chatbot.checked.promptVersion === promptVersion && rows <= chatbot.checked.maxRows
  );
}
