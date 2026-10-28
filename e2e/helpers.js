import { expect } from '@playwright/test';

// Logs in with one of the public demo accounts via the buttons on the login page.
export async function loginAsDemo(page, role) {
  await page.goto('/login');
  await page.getByRole('button', { name: role === 'seller' ? 'Demo seller' : 'Demo buyer' }).click();
  const name = role === 'seller' ? 'Demo Seller' : 'Demo Buyer';
  await expect(page.getByRole('banner').getByText(name, { exact: true })).toBeVisible();
}

// Waits for the Browse page to finish loading its vehicle grid.
export async function waitForVehicles(page) {
  await expect(page.getByRole('status', { name: 'Loading vehicles' })).toHaveCount(0);
}

// Vehicle cards are links to /vehicles/<id> (excluding /edit links).
export const vehicleCards = (page) => page.locator('main a[href^="/vehicles/"]:not([href$="/edit"])');

// "₹6,50,000" -> 650000
export const parsePrice = (text) => Number(text.replace(/[^\d]/g, ''));
