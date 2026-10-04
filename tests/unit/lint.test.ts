// The ESLint rules that keep src/domain pure catch the obvious escapes and allow hashing.

import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const eslint = new ESLint();

async function problems(code: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath: 'src/domain/__lint_fixture__.ts' });
  return result!.messages.map((m) => m.ruleId ?? m.message);
}

describe('domain purity lint', () => {
  it.each([
    ['clock', 'export const t = Date.now();'],
    ['clock via Date()', 'export const t = Date();'],
    ['clock via new Date()', 'export const t = new Date();'],
    ['performance', 'export const t = performance.now();'],
    ['randomness', 'export const r = Math.random();'],
    ['random ids', 'export const id = crypto.randomUUID();'],
    ['network via globalThis', "export const p = globalThis.fetch('x');"],
    ['storage', "export const v = sessionStorage.getItem('x');"],
    ['DOM', 'export const d = document.title;'],
    ['Node import', "import { readFileSync } from 'node:fs';\nexport const f = readFileSync;"],
    ['storage import', "import { openDb } from '../storage/db.ts';\nexport const o = openDb;"],
    ['UI library import', "import { useState } from 'react';\nexport const u = useState;"],
  ])('rejects %s', async (_, code) => {
    expect(await problems(code)).not.toEqual([]);
  });

  it('allows deterministic hashing and dates built from given values', async () => {
    expect(
      await problems(
        "export const h = crypto.subtle.digest('SHA-256', new TextEncoder().encode('x'));\nexport const d = new Date('2026-10-04');",
      ),
    ).toEqual([]);
  });
});
