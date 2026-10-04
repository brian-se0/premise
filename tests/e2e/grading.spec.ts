// The M2 vertical slice end to end: answer → autosave → submit → copy → paste → confirm once →
// results → export → replace-import, plus the concurrency and failure cases in ROADMAP.md M2.
// Needs draft content, so it runs only against a local build made with E2E_DRAFTS=1.

import { expect, test, type Page } from '@playwright/test';

test.skip(!process.env.E2E_DRAFTS, 'needs a build with draft exercises (E2E_DRAFTS=1)');

async function practice(page: Page, exerciseId: string, answers: string[]) {
  await page.goto(`#/library/${exerciseId}`);
  await page.getByRole('button', { name: 'Practice this exercise' }).click();
  for (const [i, a] of answers.entries()) {
    await expect(page.getByText(`Task ${i + 1} of ${answers.length}`)).toBeVisible();
    await page.getByLabel('Your answer').fill(a);
    await expect(page.getByText('Saved')).toBeVisible();
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'Session done' })).toBeVisible();
}

async function toRequest(page: Page): Promise<string> {
  await page.getByRole('button', { name: 'Grade with a chatbot' }).click();
  await expect(page).toHaveURL(/#\/request\//);
  return page.url();
}

async function promptText(page: Page): Promise<string> {
  await page.getByRole('button', { name: /Copy for grading|Copied/ }).click();
  const accept = page.getByRole('button', { name: 'I understand, copy' });
  if (await accept.isVisible()) await accept.click();
  const box = page.locator('#prompt-text');
  if (!(await box.isVisible())) await page.getByRole('button', { name: 'Show prompt' }).click();
  return box.inputValue();
}

/** A chatbot-style reply: feedback per row, then the skeleton filled with the given scores. */
function reply(prompt: string, scores: Record<string, string>, tags: Record<string, string> = {}): string {
  const lines = prompt.split('\n');
  const begin = lines.findIndex((l) => l.startsWith('BEGIN SCORES'));
  const end = lines.indexOf('END SCORES', begin);
  const rows = lines.slice(begin + 1, end).map((l) => {
    const [id, max] = /^(I\d\d) \| __\/(\d+)/.exec(l)!.slice(1) as [string, string];
    return { id, max };
  });
  const feedback = rows
    .map(
      (r) =>
        `**${r.id}: ${scores[r.id] ?? '__'}/${r.max}**\n- Criterion 1: met.\n- Tip: Name the gap in this argument.`,
    )
    .join('\n\n');
  const block = [
    lines[begin],
    ...rows.filter((r) => r.id in scores).map((r) => `${r.id} | ${scores[r.id]}/${r.max} | ${tags[r.id] ?? '-'}`),
    'END SCORES',
  ].join('\n');
  return `${feedback}\n\n${block}\n`;
}

async function paste(page: Page, text: string) {
  await page.locator('#reply').fill(text);
  await page.getByRole('button', { name: 'Read scores' }).click();
}

const confirmButton = (page: Page) => page.getByRole('button', { name: /^Confirm/ });

test('answer, autosave, resume after reload, grade by paste, results', async ({ page }) => {
  await page.goto('#/library/arg-0001');
  await page.getByRole('button', { name: 'Practice this exercise' }).click();
  await page.getByLabel('Your answer').fill('Harlow should keep its five-day week.');
  await expect(page.getByText('Saved')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Your answer')).toHaveValue('Harlow should keep its five-day week.');
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByText('Task 2 of 2')).toBeVisible();
  await page.getByLabel('Your answer').fill('It treats a correlation as proof of causation.');
  await page.getByRole('button', { name: 'Submit', exact: true }).click();

  await toRequest(page);
  const prompt = await promptText(page);
  expect(prompt).toContain('BEGIN SCORES v2 request=');
  await paste(page, reply(prompt, { I01: '1', I02: '1' }, { I02: 'wrong-gap' }));
  await expect(page.getByText(/I02 .*: 1\/2/)).toBeVisible();
  await confirmButton(page).click();
  await expect(page.getByText('Correction:').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  await expect(page.getByText(/Due again on/).first()).toBeVisible();
  await page.reload();
  await expect(page.getByText(/0 waiting · closed/)).toBeVisible();
});

test('double confirm and confirm from two tabs schedule once', async ({ page, context }) => {
  await practice(page, 'arg-0001', ['Harlow should keep its five-day week.', 'Correlation is not causation.']);
  const url = await toRequest(page);
  const prompt = await promptText(page);
  const text = reply(prompt, { I01: '1', I02: '2' });

  const other = await context.newPage();
  await other.goto(url);
  await paste(page, text);
  await paste(other, text);
  // Both tabs confirm at once; whichever loses either sees the error or finds nothing left to confirm.
  await Promise.all([
    confirmButton(page).dblclick(),
    confirmButton(other)
      .click({ timeout: 3000 })
      .catch(() => undefined),
  ]);
  await expect(page.getByText(/0 waiting · closed/)).toBeVisible();
  await expect(other.getByText(/0 waiting · closed/)).toBeVisible();

  await page.goto('#/settings');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export a backup' }).click();
  const file = JSON.parse(
    await (await (await download).createReadStream()).toArray().then((c) => Buffer.concat(c).toString()),
  );
  expect(file.reviewLogs).toHaveLength(2);
});

test('confirm versus discard, partial grading, and a needs-review row resolved later', async ({ page, context }) => {
  await practice(page, 'arg-0001', ['A conclusion.', 'A flaw.']);
  const url = await toRequest(page);
  const prompt = await promptText(page);

  // One tab previews both rows while another discards one: the preview updates to "already
  // discarded" and confirming saves only the row still waiting.
  const other = await context.newPage();
  await other.goto(url);
  await paste(page, reply(prompt, { I01: '?', I02: '2' }));
  await expect(confirmButton(page)).toHaveText(/2 grades/);
  await other.locator('.row-card').filter({ hasText: 'I02' }).getByRole('button', { name: 'Discard' }).click();
  await expect(page.getByText('already discarded')).toBeVisible();
  await expect(confirmButton(page)).toHaveText(/1 grade$/);
  await confirmButton(page).click();
  await expect(page.getByText('Discarded: this answer counts for nothing.')).toBeVisible();
  await expect(page.getByText(/1 waiting · open/)).toBeVisible();

  // The "?" left the row needing review; it is resolved later by manual entry.
  await expect(page.getByText('The grader could not decide.')).toBeVisible();
  const first = page.locator('.row-card').filter({ hasText: 'I01' });
  await first.getByRole('button', { name: 'Enter a score' }).click();
  await first.getByLabel(/Score out of/).fill('1');
  await first.getByRole('button', { name: 'Save score' }).click();
  await expect(page.getByText(/0 waiting · closed/)).toBeVisible();

  // Partial grading: one row in the reply, the other stays waiting.
  await practice(page, 'arg-0002', ['Conclusion.', 'Assumption.']);
  await toRequest(page);
  const p2 = await promptText(page);
  await paste(page, reply(p2, { I01: '0' }));
  await expect(page.getByText('missing from the reply')).toBeVisible();
  await confirmButton(page).click();
  await expect(page.getByText(/1 waiting · open/)).toBeVisible();
});

test('undo, stale confirm after undo, repeated undo and repeated correction', async ({ page, context }) => {
  await practice(page, 'arg-0001', ['A conclusion.', 'A flaw.']);
  const url = await toRequest(page);
  const prompt = await promptText(page);
  const text = reply(prompt, { I01: '1', I02: '0' });
  await paste(page, text);
  await confirmButton(page).click();
  const flaw = page.locator('.row-card').filter({ hasText: 'I02' });

  // Undo returns the row to waiting; two tabs then preview the same reply and both confirm.
  await flaw.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByText(/1 waiting · open/)).toBeVisible();
  const other = await context.newPage();
  await other.goto(url);
  await paste(page, text);
  await paste(other, text);
  await confirmButton(page).click();
  await expect(page.getByText(/0 waiting · closed/)).toBeVisible();
  await expect(other.getByText(/0 waiting · closed/)).toBeVisible();

  // Repeated correction, then undo; the other tab follows along.
  const otherFlaw = other.locator('.row-card').filter({ hasText: 'I02' });
  await expect(otherFlaw.getByRole('button', { name: 'Undo' })).toBeVisible();
  for (const score of ['1', '2']) {
    await flaw.getByRole('button', { name: 'Correct grade' }).click();
    await flaw.getByLabel(/Score out of/).fill(score);
    await flaw.getByRole('button', { name: 'Save corrected grade' }).click();
    await expect(flaw.getByText(`${score}/2`)).toBeVisible();
  }
  await flaw.getByRole('button', { name: 'Undo' }).click();
  await expect(flaw.getByRole('button', { name: 'Grade it myself' })).toBeVisible();
  await expect(otherFlaw.getByRole('button', { name: 'Grade it myself' })).toBeVisible();
});

test('identical re-paste confirms nothing new; a conflicting reply offers a choice', async ({ page }) => {
  await practice(page, 'arg-0001', ['A conclusion.', 'A flaw.']);
  await toRequest(page);
  const prompt = await promptText(page);
  const text = reply(prompt, { I01: '1', I02: '1' });
  await paste(page, text);
  await confirmButton(page).click();
  await expect(page.getByText(/0 waiting/)).toBeVisible();
  await expect(page.locator('#reply')).toHaveCount(0); // nothing left to paste for

  await practice(page, 'arg-0002', ['Conclusion.', 'Assumption.']);
  await toRequest(page);
  const p2 = await promptText(page);
  const a = reply(p2, { I01: '1', I02: '2' });
  const b = reply(p2, { I01: '0', I02: '2' });
  await paste(page, `${a}\nActually, let me revise.\n\n${b}`);
  await expect(page.getByText('more than one different score block')).toBeVisible();
  await page.getByRole('button', { name: 'Use block 2' }).click();
  await expect(page.getByText(/I01 .*: 0\/1/)).toBeVisible();
});

test('a failure halfway through saving leaves nothing half-written', async ({ page }) => {
  await page.addInitScript(() => {
    const add = IDBObjectStore.prototype.add;
    IDBObjectStore.prototype.add = function (...args: Parameters<typeof add>) {
      if (this.name === 'reviewLogs' && (window as unknown as { __fail?: boolean }).__fail) {
        throw new DOMException('Simulated failure', 'UnknownError');
      }
      return add.apply(this, args);
    };
  });
  await practice(page, 'arg-0001', ['A conclusion.', 'A flaw.']);
  await toRequest(page);
  const prompt = await promptText(page);
  await paste(page, reply(prompt, { I01: '1', I02: '2' }));
  await page.evaluate(() => ((window as unknown as { __fail?: boolean }).__fail = true));
  await confirmButton(page).click();
  await expect(page.getByRole('alert')).toContainText('nothing was saved');
  await expect(page.getByText(/2 waiting · open/)).toBeVisible();
  await page.evaluate(() => ((window as unknown as { __fail?: boolean }).__fail = false));
  await paste(page, reply(prompt, { I01: '1', I02: '2' }));
  await confirmButton(page).click();
  await expect(page.getByText(/0 waiting · closed/)).toBeVisible();
});

test('export then replace-import restores an unfinished session and a partially graded request', async ({ page }) => {
  await practice(page, 'arg-0001', ['A conclusion.', 'A flaw.']);
  await toRequest(page);
  const prompt = await promptText(page);
  await paste(page, reply(prompt, { I01: '1' }));
  await confirmButton(page).click();
  await page.goto('#/library/arg-0002');
  await page.getByRole('button', { name: 'Practice this exercise' }).click();
  await page.getByLabel('Your answer').fill('half-written draft');
  await expect(page.getByText('Saved')).toBeVisible();

  await page.goto('#/settings');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export a backup' }).click();
  const path = await (await download).path();

  // Change things, then restore.
  await page.goto('#/');
  await page.getByRole('link', { name: /Request .*: 1 waiting/ }).click();
  page.once('dialog', (d) => void d.accept());
  await page.getByRole('button', { name: 'Discard the waiting answers' }).click();
  await expect(page.getByText(/0 waiting/)).toBeVisible();

  await page.goto('#/settings');
  await page.getByLabel('Backup file').setInputFiles(path);
  await page.getByRole('button', { name: 'Replace everything' }).click();
  await expect(page.getByText('Imported.')).toBeVisible();
  await page.goto('#/');
  await expect(page.getByRole('link', { name: /Request .*: 1 waiting/ })).toBeVisible();
  await page.getByRole('link', { name: /left$/ }).click();
  await expect(page.getByLabel('Your answer')).toHaveValue('half-written draft');
});

test("per-exercise grading offers to grade each argument before the next, and today's session resumes", async ({
  page,
}) => {
  await page.goto('#/settings');
  await page.getByRole('combobox', { name: /^Grade/ }).selectOption('per-exercise');
  await page.goto('#/');
  await page.getByRole('button', { name: "Start today's session" }).click();
  await page.getByLabel('Your answer').fill('First answer.');
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Grade this argument?' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue the session' }).click();
  await expect(page.getByText('Task 2 of')).toBeVisible();
  await page.goto('#/');
  await expect(page.getByRole('link', { name: /left$/ })).toBeVisible();
});
