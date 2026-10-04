import { expect, test } from '@playwright/test';

test('a deep link to About loads directly and names the deployed commit', async ({ page }) => {
  await page.goto('#/about');
  await expect(page.getByRole('heading', { level: 1, name: 'About Premise' })).toBeVisible();
  await expect(page.getByText(/built from commit/)).toBeVisible();
  await expect(page.getByRole('link', { name: /GNU Affero/ })).toBeVisible();
});

test('navigation works and survives a reload', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Library' }).click();
  await expect(page).toHaveURL(/#\/library$/);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Library' })).toBeVisible();
});

test('the app makes no requests outside its own origin', async ({ page, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const foreign: string[] = [];
  page.on('request', (r) => {
    if (!r.url().startsWith(origin) && !r.url().startsWith('data:')) foreign.push(r.url());
  });
  await page.goto('#/library');
  await page.goto('#/about');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(foreign).toEqual([]);
});
