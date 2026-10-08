import { describe, expect, it } from 'vitest';
import { CHATBOTS, checkedFor } from '../../src/domain/chatbots.ts';

const bot = (name: string) => CHATBOTS.find((c) => c.name === name)!;

describe('chatbot links', () => {
  it('links all four frontier chatbots', () => {
    expect(CHATBOTS.map((c) => c.name)).toEqual(['ChatGPT', 'Claude', 'Gemini', 'Grok']);
  });

  it('marks Grok checked only in the setup the grading check covered', () => {
    expect(checkedFor(bot('Grok'), 'v4', 4)).toBe(true);
    expect(checkedFor(bot('Grok'), 'v4', 1)).toBe(true);
    expect(checkedFor(bot('Grok'), 'v4', 5)).toBe(false);
    expect(checkedFor(bot('Grok'), 'v3', 4)).toBe(false);
    for (const name of ['ChatGPT', 'Claude', 'Gemini']) expect(checkedFor(bot(name), 'v4', 4)).toBe(false);
  });
});
