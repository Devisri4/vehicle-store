import { expect, test } from '@playwright/test';
import { parsePrice, vehicleCards, waitForVehicles } from './helpers.js';

// Everything a visitor can do without an account.

test('homepage shows the hero, photo and browse link', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/VehicleStore/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Find your next vehicle');

  const hero = page.getByRole('img', { name: /sports coupe/i });
  await expect(hero).toBeVisible();
  // The photo really loaded (not a broken image)
  expect(await hero.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);

  await page.getByRole('link', { name: 'Browse vehicles' }).first().click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('heading', { name: 'Available vehicles' })).toBeVisible();
});

test('visitors can browse vehicles without logging in', async ({ page }) => {
  await page.goto('/dashboard');
  await waitForVehicles(page);
  await expect(page.getByText(/\d+ vehicles? found/)).toBeVisible();
  await expect(vehicleCards(page).first()).toBeVisible();
  await expect(page.getByRole('banner').getByRole('link', { name: 'Log in' })).toBeVisible();
});

test('search with no matches shows the empty state and can be cleared', async ({ page }) => {
  await page.goto('/dashboard');
  await waitForVehicles(page);
  await page.getByLabel('Search vehicles').fill('zzz-no-such-vehicle');
  await expect(page).toHaveURL(/q=zzz-no-such-vehicle/);
  await expect(page.getByText('No vehicles match your filters')).toBeVisible();

  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await waitForVehicles(page);
  await expect(vehicleCards(page).first()).toBeVisible();
});

test('sorting by price puts the cheapest vehicle first', async ({ page }) => {
  await page.goto('/dashboard');
  await waitForVehicles(page);
  await page.getByLabel('Sort by').selectOption('price_asc');
  await expect(page).toHaveURL(/sort=price_asc/);

  // Poll until the re-sorted list has rendered
  const prices = () => vehicleCards(page).locator('p').filter({ hasText: '₹' }).allTextContents();
  await expect
    .poll(async () => {
      const values = (await prices()).map(parsePrice);
      return values.length > 0 && values.every((value, i) => i === 0 || values[i - 1] <= value);
    })
    .toBe(true);
});

test('type filter only shows that type', async ({ page }) => {
  await page.goto('/dashboard?type=Car');
  await waitForVehicles(page);
  const count = await vehicleCards(page).count();
  test.skip(count === 0, 'No cars listed right now');
  // Each card shows its type as a badge on the photo
  for (const card of await vehicleCards(page).all()) {
    await expect(card.getByText('Car', { exact: true })).toBeVisible();
  }
});

test('vehicle page shows photos, specs, seller card and a login prompt', async ({ page }) => {
  await page.goto('/dashboard');
  await waitForVehicles(page);
  await vehicleCards(page).first().click();

  await expect(page).toHaveURL(/\/vehicles\/\d+$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Key specifications' })).toBeVisible();
  await expect(page.getByText('Sold by')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Log in to contact' })).toBeVisible();
});

test('unknown pages and vehicles show friendly not-found screens', async ({ page }) => {
  await page.goto('/this-page-does-not-exist');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();

  await page.goto('/vehicles/999999999');
  await expect(page.getByRole('heading', { name: 'Vehicle not found' })).toBeVisible();
});

test('health check reports the database is reachable', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.ok()).toBe(true);
  const body = await response.json();
  expect(body.ok).toBe(true);
  expect(typeof body.vehicles).toBe('number');
});
