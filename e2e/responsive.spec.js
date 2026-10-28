import { expect, test } from '@playwright/test';
import { vehicleCards, waitForVehicles } from './helpers.js';

// Runs on a phone-sized screen (see playwright.config.js).

test('mobile menu opens, navigates and closes', async ({ page }) => {
  await page.goto('/');
  const menuButton = page.getByRole('button', { name: 'Open menu' });
  await expect(menuButton).toBeVisible();
  await menuButton.click();

  const menu = page.locator('#mobile-menu');
  await expect(menu).toBeVisible();
  await menu.getByRole('link', { name: 'Browse' }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(menu).toBeHidden();
});

test('pages fit the phone screen without sideways scrolling', async ({ page }) => {
  for (const path of ['/', '/dashboard', '/login']) {
    await page.goto(path);
    if (path === '/dashboard') await waitForVehicles(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `${path} scrolls sideways`).toBeLessThanOrEqual(1);
  }
});

test('vehicle cards stack in one column on a phone', async ({ page }) => {
  await page.goto('/dashboard');
  await waitForVehicles(page);
  const cards = vehicleCards(page);
  test.skip((await cards.count()) < 2, 'Needs at least two vehicles');
  const first = await cards.nth(0).boundingBox();
  const second = await cards.nth(1).boundingBox();
  expect(second.y).toBeGreaterThan(first.y + first.height - 1);
});
