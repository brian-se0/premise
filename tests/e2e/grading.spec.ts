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
    await expect(page.getByText('Saved', { exact: true })).toBeVisible();
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
  const box = page.locator('#prompt-text');
  const copied = page.getByRole('button', { name: 'Copied' });
  const accept = page.getByRole('button', { name: 'I understand, copy' });
  await page.getByRole('button', { name: /Copy for grading|Copied/ }).click();
  // Wait for the click to settle: the first copy asks for the disclosure, and a copy the browser
  // refuses opens the prompt box instead. Checking without waiting raced the render in CI.
  await expect(accept.or(copied).or(box).first()).toBeVisible();
  if (await accept.isVisible()) {
    await accept.click();
    await expect(copied.or(box).first()).toBeVisible();
  }
  if (!(await box.isVisible())) await page.getByRole('button', { name: 'Show prompt' }).click();
  await expect(box).toBeVisible();
  const normalize = (s: string) => s.replace(/\r\n/g, '\n');
  const text = normalize(await box.inputValue());
  // Chromium runs with clipboard permission, so check the copy itself, not just the fallback box.
  if ((await copied.isVisible()) && test.info().project.name === 'chromium') {
    expect(normalize(await page.evaluate(() => navigator.clipboard.readText()))).toBe(text);
  }
  return text;
}

/** Exports a backup through Settings and returns the parsed file. Leaves the page on Settings. */
async function exportFile(page: Page): Promise<Record<string, unknown[]>> {
  await page.goto('#/settings');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export a backup' }).click();
  const chunks = await (await (await download).createReadStream()).toArray();
  return JSON.parse(Buffer.concat(chunks).toString()) as Record<string, unknown[]>;
}

const GRADING_STORED = [
  'attempts',
  'requests',
  'replies',
  'gradings',
  'reviewLogs',
  'cards',
  'taskStates',
  'operations',
];

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
  const requestId = /^BEGIN SCORES v\d+ request=(\S+)/.exec(lines[begin]!)?.[1];
  return `BEGIN FEEDBACK request=${requestId}\n${feedback}\nEND FEEDBACK\n\n${block}\n`;
}

async function paste(page: Page, text: string) {
  await page.locator('#reply').fill(text);
  await page.getByRole('button', { name: 'Read scores' }).click();
}

/** The answer card for a row, matched by its heading: card text can quote other rows' ids. */
const card = (page: Page, rowId: string) =>
  page.locator('.row-card').filter({ has: page.getByRole('heading', { name: new RegExp(`^${rowId} `) }) });

const confirmButton = (page: Page) => page.getByRole('button', { name: /^Confirm/ });

test('answer, autosave, resume after reload, grade by paste, results', async ({ page }) => {
  await page.goto('#/library/arg-0001');
  await page.getByRole('button', { name: 'Practice this exercise' }).click();
  await page.getByLabel('Your answer').fill('Harlow should keep its five-day week.');
  await expect(page.getByText('Saved', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Your answer')).toHaveValue('Harlow should keep its five-day week.');
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByText('Task 2 of 2')).toBeVisible();
  await page.getByLabel('Your answer').fill('It treats a correlation as proof of causation.');
  await page.getByRole('button', { name: 'Submit', exact: true }).click();

  await toRequest(page);
  const prompt = await promptText(page);
  expect(prompt).toContain('BEGIN SCORES v2 request=');
  // Markup in a reply is shown as literal text, never rendered.
  const markup = '<b id="injected">bold</b><img src=x onerror="window.__ran=1">';
  await paste(page, `${markup}\n\n${reply(prompt, { I01: '1', I02: '1' }, { I02: 'wrong-gap' })}`);
  await expect(page.getByText(/I02 .*: 1\/2/)).toBeVisible();
  await confirmButton(page).click();
  await page.getByText('Full chatbot reply').first().click();
  await expect(page.getByText(markup).first()).toBeVisible();
  await expect(page.locator('#injected')).toHaveCount(0);
  expect(await page.evaluate(() => (window as unknown as { __ran?: number }).__ran)).toBeUndefined();
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
  await expect(confirmButton(page)).toHaveText(/2 grades/);
  await expect(confirmButton(other)).toHaveText(/2 grades/);
  // Fire all three clicks (a double click in one tab, one click in the other) without waiting for
  // either tab to settle, so every confirmation really reaches storage.
  const press = (p: Page, times: number) =>
    p.evaluate((n) => {
      const b = [...document.querySelectorAll('button')].find((x) => x.textContent?.startsWith('Confirm'))!;
      for (let i = 0; i < n; i++) b.click();
    }, times);
  await Promise.all([press(page, 2), press(other, 1)]);
  await expect(page.getByText(/0 waiting · closed/)).toBeVisible();
  await expect(other.getByText(/0 waiting · closed/)).toBeVisible();

  const file = await exportFile(page);
  expect(file.reviewLogs).toHaveLength(2);
  expect(file.gradings).toHaveLength(2);
  // Both tabs read and kept their own copy of the reply before either confirmation.
  expect(file.replies).toHaveLength(2);
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
  await card(other, 'I02').getByRole('button', { name: 'Discard' }).click();
  await expect(page.getByText('already discarded')).toBeVisible();
  await expect(confirmButton(page)).toHaveText(/1 grade$/);
  await confirmButton(page).click();
  await expect(page.getByText('Discarded: this answer counts for nothing.')).toBeVisible();
  await expect(page.getByText(/1 waiting · open/)).toBeVisible();

  // The "?" left the row needing review; it is resolved later by manual entry.
  await expect(page.getByText('The grader could not decide.')).toBeVisible();
  const first = card(page, 'I01');
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

test('undo, a preview made before a confirm and undo is stale, repeated undo and correction', async ({
  page,
  context,
}) => {
  await practice(page, 'arg-0001', ['A conclusion.', 'A flaw.']);
  const url = await toRequest(page);
  const prompt = await promptText(page);
  const text = reply(prompt, { I01: '1', I02: '0' });
  const other = await context.newPage();
  await other.goto(url);
  // The other tab reads a reply while both rows wait. This tab then grades only I02 (so the request
  // stays open in both tabs) and undoes it.
  await paste(other, reply(prompt, { I01: '1', I02: '2' }));
  await expect(confirmButton(other)).toHaveText(/2 grades/);
  await paste(page, reply(prompt, { I02: '0' }));
  await confirmButton(page).click();
  const flaw = card(page, 'I02');
  await flaw.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByText(/2 waiting · open/)).toBeVisible();

  // Both rows wait again, but the other tab's decision predates the confirm and the undo: it is
  // refused whole.
  await expect(confirmButton(other)).toHaveText(/2 grades/);
  await confirmButton(other).click();
  await expect(other.getByRole('alert')).toContainText(/changed|stale/i);
  await expect(page.getByText(/2 waiting · open/)).toBeVisible();

  // A fresh read confirms normally.
  await paste(page, text);
  await confirmButton(page).click();
  await expect(page.getByText(/0 waiting · closed/)).toBeVisible();
  await expect(other.getByText(/0 waiting · closed/)).toBeVisible();

  // Repeated correction, then undo; the other tab follows along.
  const otherFlaw = card(other, 'I02');
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
  const url = await toRequest(page);
  const prompt = await promptText(page);
  // The reply grades I01 only, so the request stays open and the same text can be pasted again.
  const text = reply(prompt, { I01: '1' });
  await paste(page, text);
  await confirmButton(page).click();
  await expect(page.getByText(/1 waiting · open/)).toBeVisible();
  await paste(page, text);
  await expect(page.getByText('already accepted')).toBeVisible();
  await expect(confirmButton(page)).toBeDisabled();
  await expect(confirmButton(page)).toHaveText(/0 grades/);
  const file = await exportFile(page);
  expect(file.gradings).toHaveLength(1);
  expect(file.reviewLogs).toHaveLength(1);
  await page.goto(url);

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

test('a preview cannot follow navigation to a different grading request', async ({ page }) => {
  await practice(page, 'arg-0001', ['A conclusion.', 'A flaw.']);
  const firstUrl = await toRequest(page);
  const firstPrompt = await promptText(page);
  await practice(page, 'arg-0002', ['Another conclusion.', 'Another flaw.']);
  const secondUrl = await toRequest(page);

  await page.goto(firstUrl);
  await paste(page, reply(firstPrompt, { I01: '1', I02: '2' }));
  await expect(confirmButton(page)).toHaveText(/2 grades/);
  // Change only the request parameter while RequestPage stays mounted. A missing key on
  // RequestBody would carry the old preview into the new request.
  await page.evaluate((url) => {
    window.location.hash = new URL(url).hash;
  }, secondUrl);
  await expect(page).toHaveURL(secondUrl);
  await expect(page.locator('#reply')).toHaveValue('');
  await expect(confirmButton(page)).toHaveCount(0);
  const file = await exportFile(page);
  expect(file.gradings).toHaveLength(0);
});

test('replacing a backup with the same IDs and revisions invalidates an older score preview', async ({
  page,
  context,
}) => {
  await practice(page, 'arg-0001', ['A conclusion.', 'A flaw.']);
  const requestUrl = await toRequest(page);
  const prompt = await promptText(page);
  await paste(page, reply(prompt, { I01: '1', I02: '2' }));
  await expect(confirmButton(page)).toHaveText(/2 grades/);

  const other = await context.newPage();
  await other.goto(requestUrl);
  const backup = await exportFile(other);
  const attempt = (backup.attempts as { answer: string }[]).find((a) => a.answer === 'A conclusion.');
  expect(attempt).toBeTruthy();
  attempt!.answer = 'A changed conclusion.';
  const request = (backup.requests as { promptText: string | null }[])[0]!;
  expect(request.promptText).toContain('A conclusion.');
  request.promptText = request.promptText!.replace('A conclusion.', 'A changed conclusion.');
  await other.getByLabel('Backup file').setInputFiles({
    name: 'changed-answer.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await expect(other.getByRole('button', { name: 'Replace everything' })).toBeVisible();
  await other.getByRole('button', { name: 'Replace everything' }).click();
  await expect(other.getByText('Imported.')).toBeVisible();

  await confirmButton(page).click();
  await expect(page.getByRole('alert')).toContainText(/changed|read the scores again/i);
  const after = await exportFile(other);
  expect(after.gradings).toHaveLength(0);
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
  const url = await toRequest(page);
  const prompt = await promptText(page);
  const before = await exportFile(page);
  await page.goto(url);
  await paste(page, reply(prompt, { I01: '1', I02: '2' }));
  await page.evaluate(() => ((window as unknown as { __fail?: boolean }).__fail = true));
  await confirmButton(page).click();
  await expect(page.getByRole('alert')).toContainText('nothing was saved');
  await expect(page.getByText(/2 waiting · open/)).toBeVisible();
  await page.evaluate(() => ((window as unknown as { __fail?: boolean }).__fail = false));
  // Read scores already kept the reply and its receipt. The failed grading transaction must add
  // no grading, card, review, second reply, or confirmRows receipt.
  const after = await exportFile(page);
  for (const table of GRADING_STORED.filter((name) => name !== 'replies' && name !== 'operations')) {
    expect(after[table], table).toEqual(before[table]);
  }
  expect(after.replies).toHaveLength((before.replies?.length ?? 0) + 1);
  const beforeOps = before.operations as { opId: string; name: string }[];
  const afterOps = after.operations as { opId: string; name: string }[];
  const addedOps = afterOps.filter((op) => !beforeOps.some((prior) => prior.opId === op.opId));
  expect(addedOps).toEqual([expect.objectContaining({ name: 'saveReply' })]);
  expect(afterOps.filter((op) => op.name === 'confirmRows')).toEqual(
    beforeOps.filter((op) => op.name === 'confirmRows'),
  );
  await page.goto(url);
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
  await expect(page.getByText('Saved', { exact: true })).toBeVisible();

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

test('a task made unavailable after planning lets the student end and grade the session', async ({ page }) => {
  await page.goto('#/');
  await page.getByRole('button', { name: "Start today's session" }).click();
  await expect(page.getByText(/Task 1 of/)).toBeVisible();
  await page.getByLabel('Your answer').fill('The first answer.');
  await expect(page.getByText('Saved', { exact: true })).toBeVisible();

  // Another tab could suspend a planned task while this session is in progress. Set that exact
  // storage state here so the next openEntry must recheck eligibility instead of trusting the plan.
  await page.evaluate(async () => {
    const open = indexedDB.open('premise');
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      open.onsuccess = () => resolve(open.result);
      open.onerror = () => reject(open.error);
    });
    const tx = database.transaction(['sessions', 'taskStates'], 'readwrite');
    const sessions = await new Promise<{ entries: { taskId: string }[] }[]>((resolve, reject) => {
      const request = tx.objectStore('sessions').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const nextTask = sessions.at(-1)?.entries[1]?.taskId;
    if (!nextTask) throw new Error('Expected a second planned task.');
    tx.objectStore('taskStates').put({ taskId: nextTask, notBefore: null, suspended: true });
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    database.close();
  });

  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Cannot open this task' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('hidden');
  await page.getByRole('button', { name: 'End session and grade' }).click();
  await expect(page.getByRole('heading', { name: 'Session done' })).toBeVisible();
  await expect(page.getByText('1 answer submitted')).toBeVisible();
  await toRequest(page);
  await expect(page.getByText(/1 waiting · open/)).toBeVisible();
});

test('the first-copy disclosure comes before the prompt leaves the page by either route', async ({ page }) => {
  await practice(page, 'arg-0001', ['A conclusion.', 'A flaw.']);
  await toRequest(page);
  const box = page.locator('#prompt-text');
  // Manual route: Show prompt asks first and shows nothing until accepted.
  await page.getByRole('button', { name: 'Show prompt' }).click();
  await expect(page.getByRole('dialog', { name: 'Before you paste' })).toBeVisible();
  await expect(box).toHaveCount(0);
  await page.getByRole('button', { name: 'I understand, show the prompt' }).click();
  await expect(box).toBeVisible();
  // Seen once, it is not asked again, and the clipboard route copies straight away.
  await page.reload();
  await page.getByRole('button', { name: 'Copy for grading' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
});

test('the clipboard route asks first too', async ({ page }) => {
  await practice(page, 'arg-0001', ['A conclusion.', 'A flaw.']);
  await toRequest(page);
  await page.getByRole('button', { name: 'Copy for grading' }).click();
  await expect(page.getByRole('dialog', { name: 'Before you paste' })).toBeVisible();
  if (test.info().project.name === 'chromium') {
    await page.evaluate(() => navigator.clipboard.writeText('untouched'));
    await expect(page.getByRole('dialog', { name: 'Before you paste' })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('untouched');
  }
  await page.getByRole('button', { name: 'I understand, copy' }).click();
  await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
});

test('a reply with no usable scores is kept and linked when the score is entered by hand', async ({ page }) => {
  await practice(page, 'arg-0001', ['A conclusion.', 'A flaw.']);
  await toRequest(page);
  await paste(page, 'Sorry, I could not grade these. <i>no block</i>');
  await expect(page.getByText('The reply is kept with this request')).toBeVisible();
  const first = card(page, 'I01');
  await first.getByRole('button', { name: 'Enter a score' }).click();
  await first.getByLabel(/Score out of/).fill('1');
  await first.getByRole('button', { name: 'Save score' }).click();
  await first.getByText('Full chatbot reply').click();
  await expect(first.getByText('Sorry, I could not grade these. <i>no block</i>')).toBeVisible();
});

test('zero usable scores survive reload and a manual grade names the selected saved reply', async ({ page }) => {
  await practice(page, 'arg-0001', ['A conclusion.', 'A flaw.']);
  await toRequest(page);
  const prompt = await promptText(page);
  await paste(page, reply(prompt, { I01: '99' }));
  await expect(page.getByText(/invalid:.*score|invalid:.*maximum/i)).toBeVisible();
  await expect(confirmButton(page)).toBeDisabled();
  await page.reload();

  const first = card(page, 'I01');
  await first.getByRole('button', { name: 'Enter a score' }).click();
  const source = first.getByRole('combobox', { name: 'Chatbot reply used for I01' });
  await expect(source).toHaveValue('');
  const savedId = await source.locator('option').nth(1).getAttribute('value');
  expect(savedId).toBeTruthy();
  await source.selectOption(savedId!);
  await first.getByLabel(/Score out of/).fill('1');
  await first.getByRole('button', { name: 'Save score' }).click();
  await first.getByText('Full chatbot reply').click();
  await expect(first.getByText('99/1')).toBeVisible();

  const file = await exportFile(page);
  const grades = file.gradings as { replyId: string | null }[];
  expect(grades).toHaveLength(1);
  expect(grades[0]?.replyId).toBe(savedId);
});

test('failed reply save never offers an unkept preview for confirmation', async ({ page }) => {
  await page.addInitScript(() => {
    const add = IDBObjectStore.prototype.add;
    IDBObjectStore.prototype.add = function (...args: Parameters<typeof add>) {
      if (this.name === 'replies' && (window as unknown as { __failReply?: boolean }).__failReply) {
        throw new DOMException('Simulated reply save failure', 'QuotaExceededError');
      }
      return add.apply(this, args);
    };
  });
  await practice(page, 'arg-0001', ['A conclusion.', 'A flaw.']);
  await toRequest(page);
  const prompt = await promptText(page);
  await page.evaluate(() => ((window as unknown as { __failReply?: boolean }).__failReply = true));
  await paste(page, reply(prompt, { I01: '1' }));
  await expect(page.getByRole('alert')).toContainText('could not be kept');
  await expect(confirmButton(page)).toHaveCount(0);
});

test('a draft that cannot be saved keeps the page open with the text; two tabs never overwrite each other', async ({
  page,
  context,
}) => {
  await page.addInitScript(() => {
    for (const name of ['put', 'add'] as const) {
      const original = IDBObjectStore.prototype[name];
      IDBObjectStore.prototype[name] = function (this: IDBObjectStore, ...args: Parameters<typeof original>) {
        if (this.name === 'attempts' && (window as unknown as { __fail?: boolean }).__fail) {
          throw new DOMException('Simulated quota error', 'QuotaExceededError');
        }
        return original.apply(this, args);
      } as typeof original;
    }
  });
  await page.goto('#/library/arg-0001');
  await page.getByRole('button', { name: 'Practice this exercise' }).click();
  await page.getByLabel('Your answer').fill('First words.');
  await expect(page.getByText('Saved', { exact: true })).toBeVisible();
  const url = page.url();

  // Saving fails: "Stop for now" stays on the page with the text instead of leaving.
  await page.evaluate(() => ((window as unknown as { __fail?: boolean }).__fail = true));
  await page.getByLabel('Your answer').fill('First words, then more.');
  await page.getByRole('button', { name: 'Stop for now' }).click();
  await expect(page.getByRole('alert')).toContainText('Could not save');
  await expect(page.getByLabel('Your answer')).toHaveValue('First words, then more.');
  await expect(page).toHaveURL(url);
  await page.evaluate(() => ((window as unknown as { __fail?: boolean }).__fail = false));
  await page.getByLabel('Your answer').fill('First words, then more, saved.');
  await expect(page.getByText('Saved', { exact: true })).toBeVisible();

  // A second tab edits the same draft. The first tab sees the live revision before it tries to
  // write, loses its old "Saved" claim, and cannot skip away from the newer answer.
  const other = await context.newPage();
  await other.goto(url);
  await expect(other.getByLabel('Your answer')).toHaveValue('First words, then more, saved.');
  await other.getByLabel('Your answer').fill('Written in the other tab.');
  await expect(other.getByText('Saved', { exact: true })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('changed in another tab');
  await expect(page.getByLabel('Your answer')).toHaveValue('First words, then more, saved.');
  await expect(page.getByRole('button', { name: 'Skip' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Stop for now' })).toBeDisabled();
  const refusedDialog = page.waitForEvent('dialog');
  const refusedClick = page.getByRole('button', { name: 'Use the saved answer' }).click();
  const refusal = await refusedDialog;
  expect(refusal.message()).toContain('Replace the text on this page');
  await refusal.dismiss();
  await refusedClick;
  await expect(page.getByLabel('Your answer')).toHaveValue('First words, then more, saved.');
  const acceptedDialog = page.waitForEvent('dialog');
  const acceptedClick = page.getByRole('button', { name: 'Use the saved answer' }).click();
  await (await acceptedDialog).accept();
  await acceptedClick;
  await expect(page.getByLabel('Your answer')).toHaveValue('Written in the other tab.');
  await expect(page.getByText('Saved', { exact: true })).toBeVisible();
  await other.reload();
  await expect(other.getByLabel('Your answer')).toHaveValue('Written in the other tab.');

  // The other tab submits; the first tab keeps its text on screen and says so.
  await other.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByText('This task was submitted in another tab.')).toBeVisible();
  await expect(page.getByText('Written in the other tab.')).toBeVisible();
});

test('replacing a backup with the same draft ID but an older revision invalidates Saved', async ({ page, context }) => {
  await page.goto('#/library/arg-0001');
  await page.getByRole('button', { name: 'Practice this exercise' }).click();
  await expect(page.getByLabel('Your answer')).toBeVisible();
  const sessionUrl = page.url();

  // Capture the newly opened draft at revision zero, then save a newer local answer.
  const other = await context.newPage();
  await other.goto(sessionUrl);
  const oldBackup = await exportFile(other);
  expect((oldBackup.attempts as { revision: number }[])[0]?.revision).toBe(0);
  await page.getByLabel('Your answer').fill('My newer saved answer.');
  await expect(page.getByText('Saved', { exact: true })).toBeVisible();

  await other.getByLabel('Backup file').setInputFiles({
    name: 'older-draft.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(oldBackup)),
  });
  await expect(other.getByRole('button', { name: 'Replace everything' })).toBeVisible();
  await other.getByRole('button', { name: 'Replace everything' }).click();
  await expect(other.getByText('Imported.')).toBeVisible();

  await expect(page.getByRole('alert')).toContainText('changed in another tab');
  await expect(page.getByText('Not saved', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Your answer')).toHaveValue('My newer saved answer.');
  await expect(page.getByRole('button', { name: 'Submit', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Skip' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Stop for now' })).toBeDisabled();
  const stored = await exportFile(other);
  expect((stored.attempts as { answer: string; revision: number }[])[0]).toMatchObject({ answer: '', revision: 0 });
});

test('replacing a backup with the same draft ID and revision but different text preserves the local copy', async ({
  page,
  context,
}) => {
  await page.goto('#/library/arg-0001');
  await page.getByRole('button', { name: 'Practice this exercise' }).click();
  await page.getByLabel('Your answer').fill('My saved answer.');
  await expect(page.getByText('Saved', { exact: true })).toBeVisible();

  const other = await context.newPage();
  const backup = await exportFile(other);
  const attempt = (backup.attempts as { answer: string; revision: number }[])[0]!;
  const revision = attempt.revision;
  attempt.answer = 'An answer in a replacement backup.';
  await other.getByLabel('Backup file').setInputFiles({
    name: 'same-revision-other-answer.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await expect(other.getByRole('button', { name: 'Replace everything' })).toBeVisible();
  await other.getByRole('button', { name: 'Replace everything' }).click();
  await expect(other.getByText('Imported.')).toBeVisible();

  await expect(page.getByRole('alert')).toContainText('changed in another tab');
  await expect(page.getByText('Not saved', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Your answer')).toHaveValue('My saved answer.');
  await expect(page.getByRole('button', { name: 'Submit', exact: true })).toBeDisabled();
  const stored = await exportFile(other);
  expect((stored.attempts as { answer: string; revision: number }[])[0]).toMatchObject({
    answer: 'An answer in a replacement backup.',
    revision,
  });
});

test('replacing a backup without the open session keeps the editor text and warns before leaving', async ({
  page,
  context,
}) => {
  const beforeSession = await exportFile(page);
  await page.goto('#/library/arg-0001');
  await page.getByRole('button', { name: 'Practice this exercise' }).click();
  await page.getByLabel('Your answer').fill('My saved text before replacement.');
  await expect(page.getByText('Saved', { exact: true })).toBeVisible();
  const sessionUrl = page.url();

  const other = await context.newPage();
  await other.goto('#/settings');
  await other.getByLabel('Backup file').setInputFiles({
    name: 'before-session.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(beforeSession)),
  });
  await expect(other.getByRole('button', { name: 'Replace everything' })).toBeVisible();
  await other.getByRole('button', { name: 'Replace everything' }).click();
  await expect(other.getByText('Imported.')).toBeVisible();

  await expect(page).toHaveURL(sessionUrl);
  await expect(page.getByLabel('Your answer')).toHaveValue('My saved text before replacement.');
  await expect(page.getByRole('alert')).toContainText('session was replaced in another tab');
  await expect(page.getByText('Not saved', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Submit', exact: true })).toBeDisabled();
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Settings' }).click();
  await expect(page).toHaveURL(sessionUrl);
  await expect(page.getByText('Your answer could not be saved before leaving.')).toBeVisible();
  await expect(page.getByLabel('Your answer')).toHaveValue('My saved text before replacement.');
});

test('replacing a backup that removes the open attempt keeps its text visible', async ({ page, context }) => {
  await page.goto('#/library/arg-0001');
  await page.getByRole('button', { name: 'Practice this exercise' }).click();
  await page.getByLabel('Your answer').fill('My answer in the removed attempt.');
  await expect(page.getByText('Saved', { exact: true })).toBeVisible();
  const sessionUrl = page.url();

  const other = await context.newPage();
  const backup = await exportFile(other);
  const session = (backup.sessions as { entries: { attemptId: string | null }[] }[])[0]!;
  expect(session.entries[0]?.attemptId).toBeTruthy();
  backup.attempts = [];
  session.entries[0]!.attemptId = null;
  await other.getByLabel('Backup file').setInputFiles({
    name: 'without-attempt.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await expect(other.getByRole('button', { name: 'Replace everything' })).toBeVisible();
  await other.getByRole('button', { name: 'Replace everything' }).click();
  await expect(other.getByText('Imported.')).toBeVisible();

  await expect(page).toHaveURL(sessionUrl);
  await expect(page.getByLabel('Your answer')).toHaveValue('My answer in the removed attempt.');
  await expect(page.getByRole('alert')).toContainText('session was replaced in another tab');
  await expect(page.getByText('Not saved', { exact: true })).toBeVisible();
});

test('header navigation flushes an immediate draft and stays put when a write fails', async ({ page }) => {
  await page.addInitScript(() => {
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...args: Parameters<typeof put>) {
      if (this.name === 'attempts' && (window as unknown as { __failDraft?: boolean }).__failDraft) {
        throw new DOMException('Simulated draft failure', 'QuotaExceededError');
      }
      return put.apply(this, args);
    };
  });
  await page.goto('#/library/arg-0001');
  await page.getByRole('button', { name: 'Practice this exercise' }).click();
  await expect(page).toHaveURL(/#\/session\//);
  const sessionUrl = page.url();
  const library = page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Library' });

  await page.getByLabel('Your answer').fill('Leave right after typing.');
  await library.click();
  await expect(page).toHaveURL(/#\/library$/);
  await page.goto(sessionUrl);
  await expect(page.getByLabel('Your answer')).toHaveValue('Leave right after typing.');

  await page.evaluate(() => ((window as unknown as { __failDraft?: boolean }).__failDraft = true));
  await page.getByLabel('Your answer').fill('This copy is still only in memory.');
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Settings' }).click();
  await expect(page).toHaveURL(sessionUrl);
  await expect(page.getByText('Your answer could not be saved before leaving.')).toBeVisible();
  await expect(page.getByLabel('Your answer')).toHaveValue('This copy is still only in memory.');

  await page.evaluate(() => ((window as unknown as { __failDraft?: boolean }).__failDraft = false));
  await page.getByRole('button', { name: 'Try saving and leave' }).click();
  await expect(page).toHaveURL(/#\/settings$/);
  await page.goto(sessionUrl);
  await expect(page.getByLabel('Your answer')).toHaveValue('This copy is still only in memory.');
});

test('a remote submission keeps a different local answer through navigation and reload warnings', async ({
  page,
  context,
}) => {
  await page.goto('#/library/arg-0001');
  await page.getByRole('button', { name: 'Practice this exercise' }).click();
  await page.getByLabel('Your answer').fill('My earlier saved answer.');
  await expect(page.getByText('Saved', { exact: true })).toBeVisible();
  const sessionUrl = page.url();

  const other = await context.newPage();
  await other.goto(sessionUrl);
  await other.getByLabel('Your answer').fill('The answer sent by the other tab.');
  await other.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByText('This task was submitted in another tab.')).toBeVisible();
  await expect(page.getByText('My earlier saved answer.')).toBeVisible();

  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Settings' }).click();
  await expect(page).toHaveURL(sessionUrl);
  await expect(page.getByText('Your answer could not be saved before leaving.')).toBeVisible();
  await page.getByRole('button', { name: 'Stay here' }).click();

  let warning: string | null = null;
  page.once('dialog', async (dialog) => {
    warning = dialog.type();
    await dialog.dismiss();
  });
  await page.reload({ timeout: 5_000 }).catch(() => undefined);
  expect(warning).toBe('beforeunload');
  await expect(page.getByText('My earlier saved answer.')).toBeVisible();
});

test('immediate reload warns before discarding an unsaved draft', async ({ page }) => {
  await page.addInitScript(() => {
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...args: Parameters<typeof put>) {
      if (this.name === 'attempts' && (window as unknown as { __failDraft?: boolean }).__failDraft) {
        throw new DOMException('Simulated draft failure', 'QuotaExceededError');
      }
      return put.apply(this, args);
    };
  });
  await page.goto('#/library/arg-0001');
  await page.getByRole('button', { name: 'Practice this exercise' }).click();
  await page.evaluate(() => ((window as unknown as { __failDraft?: boolean }).__failDraft = true));
  await page.getByLabel('Your answer').fill('Do not discard this unsaved answer.');

  let warning: string | null = null;
  page.once('dialog', async (dialog) => {
    warning = dialog.type();
    await dialog.dismiss();
  });
  await page.reload({ timeout: 5_000 }).catch(() => undefined);
  expect(warning).toBe('beforeunload');
  await expect(page.getByLabel('Your answer')).toHaveValue('Do not discard this unsaved answer.');

  await page.evaluate(() => ((window as unknown as { __failDraft?: boolean }).__failDraft = false));
  await page.getByLabel('Your answer').fill('This answer is now saved.');
  await expect(page.getByText('Saved', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Your answer')).toHaveValue('This answer is now saved.');
});
