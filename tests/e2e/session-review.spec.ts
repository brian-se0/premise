import { expect, test, type Page } from '@playwright/test';

test.skip(!process.env.E2E_DRAFTS, 'needs a build with draft exercises (E2E_DRAFTS=1)');

async function openExercise(page: Page, exerciseId: string): Promise<string> {
  await page.goto(`#/library/${exerciseId}`);
  await page.getByRole('button', { name: 'Practice this exercise' }).click();
  await expect(page.getByLabel('Your answer')).toBeVisible();
  return page.url();
}

async function sessionEnded(page: Page, sessionUrl: string): Promise<boolean> {
  const id = sessionUrl.split('#/session/')[1]!;
  return page.evaluate(async (sessionId) => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('premise');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      const tx = database.transaction('sessions', 'readonly');
      const session = await new Promise<{ endedAt: string | null } | undefined>((resolve, reject) => {
        const request = tx.objectStore('sessions').get(sessionId);
        request.onsuccess = () => resolve(request.result as { endedAt: string | null } | undefined);
        request.onerror = () => reject(request.error);
      });
      return !!session?.endedAt;
    } finally {
      database.close();
    }
  }, id);
}

for (const { exerciseId, lastTask } of [
  { exerciseId: 'arg-0007', lastTask: 1 },
  { exerciseId: 'arg-0001', lastTask: 2 },
]) {
  test(`another tab finishing task ${lastTask} of ${lastTask} offers a way forward`, async ({ page, context }) => {
    const sessionUrl = await openExercise(page, exerciseId);
    if (lastTask === 2) {
      await page.getByLabel('Your answer').fill('My first answer.');
      await page.getByRole('button', { name: 'Submit', exact: true }).click();
      await expect(page.getByText('Task 2 of 2')).toBeVisible();
    }
    await page.getByLabel('Your answer').fill('My local last answer.');
    await expect(page.getByText('Saved', { exact: true })).toBeVisible();

    const other = await context.newPage();
    await other.goto(sessionUrl);
    await other.getByLabel('Your answer').fill('The submitted last answer.');
    await other.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(other.getByRole('heading', { name: 'Session done' })).toBeVisible();
    await expect.poll(() => sessionEnded(other, sessionUrl)).toBe(true);

    await expect(page.getByText('This task was submitted in another tab.')).toBeVisible();
    await expect(page.getByText('My local last answer.')).toBeVisible();
    const confirmation = page.waitForEvent('dialog');
    const continueClick = page.getByRole('button', { name: 'Continue without this copy' }).click();
    expect((await confirmation).message()).toContain('Copy it before continuing');
    await (await confirmation).accept();
    await continueClick;
    await expect(page.getByRole('heading', { name: 'Session done' })).toBeVisible();
  });
}

test('navigation and reload wait for a pending cross-tab draft check', async ({ page, context }) => {
  await page.addInitScript(() => {
    const original = IDBObjectStore.prototype.get;
    const onSuccess = Object.getOwnPropertyDescriptor(IDBRequest.prototype, 'onsuccess')!;
    const state = window as typeof window & {
      holdVerification?: boolean;
      verificationPending?: boolean;
      releaseVerification?: () => void;
    };
    IDBObjectStore.prototype.get = function (this: IDBObjectStore, key: IDBValidKey | IDBKeyRange) {
      const request = original.call(this, key);
      if (
        this.name !== 'attempts' ||
        this.transaction.mode !== 'readonly' ||
        !this.transaction.objectStoreNames.contains('sessions') ||
        !state.holdVerification
      )
        return request;

      const keepAlive = () => {
        if (!state.holdVerification) return;
        const pulse = original.call(this, key);
        pulse.onsuccess = keepAlive;
      };
      let assigned: ((event: Event) => void) | null = null;
      Object.defineProperty(request, 'onsuccess', {
        configurable: true,
        get: () => assigned,
        set: (listener: ((event: Event) => void) | null) => {
          assigned = listener;
          onSuccess.set!.call(request, (event: Event) => {
            if (!state.holdVerification) {
              assigned?.(event);
              return;
            }
            state.verificationPending = true;
            keepAlive();
            state.releaseVerification = () => {
              state.holdVerification = false;
              assigned?.(event);
            };
          });
        },
      });
      return request;
    };
  });

  const sessionUrl = await openExercise(page, 'arg-0001');
  await page.getByLabel('Your answer').fill('My original saved answer.');
  await expect(page.getByText('Saved', { exact: true })).toBeVisible();
  const other = await context.newPage();
  await other.goto(sessionUrl);
  await expect(other.getByLabel('Your answer')).toHaveValue('My original saved answer.');

  await page.evaluate(() => ((window as typeof window & { holdVerification?: boolean }).holdVerification = true));
  await other.getByLabel('Your answer').fill('The other tab replaced the saved draft.');
  await expect(other.getByText('Saved', { exact: true })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => (window as typeof window & { verificationPending?: boolean }).verificationPending))
    .toBe(true);
  await expect(page.getByRole('alert')).toHaveCount(0);

  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Library' }).click();
  await expect(page).toHaveURL(sessionUrl);
  await expect(page.getByLabel('Your answer')).toHaveValue('My original saved answer.');

  let warning: string | null = null;
  page.once('dialog', async (dialog) => {
    warning = dialog.type();
    await dialog.dismiss();
  });
  await page.reload({ timeout: 5_000 }).catch(() => undefined);
  expect(warning).toBe('beforeunload');
  await expect(page.getByLabel('Your answer')).toHaveValue('My original saved answer.');

  await page.evaluate(() => (window as typeof window & { releaseVerification?: () => void }).releaseVerification?.());
  await expect(page.getByRole('alert').filter({ hasText: 'This answer changed in another tab.' })).toBeVisible();
  await expect(page.getByText('Your answer could not be saved before leaving.')).toBeVisible();
  await expect(page.getByLabel('Your answer')).toHaveValue('My original saved answer.');
});

test('hiding or closing a phone tab flushes a draft before the autosave timer', async ({ page }) => {
  await openExercise(page, 'arg-0001');
  await page.clock.pauseAt(new Date());
  await page.getByLabel('Your answer').fill('Saved when hidden.');
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.getByText('Saved', { exact: true })).toBeVisible();

  await page.getByLabel('Your answer').fill('Saved on pagehide.');
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
  await expect(page.getByText('Saved', { exact: true })).toBeVisible();
  await page.clock.resume();
  await page.reload();
  await expect(page.getByLabel('Your answer')).toHaveValue('Saved on pagehide.');
});
