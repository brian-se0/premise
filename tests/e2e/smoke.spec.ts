import { expect, test } from '@playwright/test';

// Set by the deploy workflow so the smoke test proves the new build is the one being served.
const expectedCommit = process.env.E2E_EXPECT_COMMIT;

test('a deep link to About loads directly and names the deployed commit', async ({ page }) => {
  await page.goto('#/about');
  await expect(page.getByRole('heading', { level: 1, name: 'About Premise' })).toBeVisible();
  await expect(page.getByRole('link', { name: /GNU Affero/ })).toBeVisible();
  const link = page.getByRole('link', { name: /^[0-9a-f]{7}$/ });
  if (expectedCommit) {
    await expect(link).toHaveText(expectedCommit.slice(0, 7));
    await expect(link).toHaveAttribute('href', new RegExp(`/commit/${expectedCommit}$`));
  } else {
    await expect(page.getByText(/built from commit/)).toBeVisible();
  }
});

test('navigation works and survives a reload', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Library' }).click();
  await expect(page).toHaveURL(/#\/library$/);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Library' })).toBeVisible();
});

test('the skip link moves focus to the page without changing the route', async ({ page }) => {
  await page.goto('#/about');
  // Mobile WebKit's first Tab target depends on keyboard settings. Focus the link explicitly,
  // then activate it with the keyboard to test the app's accessible behavior.
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await skip.focus();
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#\/about$/);
  await expect(page.locator('main')).toBeFocused();
});

test('the built page carries the CSP and makes no requests outside its own origin', async ({ page, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const foreign: string[] = [];
  const violations: string[] = [];
  page.on('request', (r) => {
    const url = new URL(r.url());
    if (url.protocol !== 'data:' && url.protocol !== 'blob:' && url.origin !== origin) foreign.push(r.url());
  });
  page.on('console', (m) => {
    if (/Content Security Policy/i.test(m.text())) violations.push(m.text());
  });
  await page.goto('#/library');
  await page.goto('#/about');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveAttribute(
    'content',
    /connect-src 'none'/,
  );
  expect(foreign).toEqual([]);
  expect(violations).toEqual([]);
});
