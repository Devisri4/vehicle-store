import { expect, test } from '@playwright/test';
import { loginAsDemo } from './helpers.js';

// Logging in, role-based navigation and access control.
// Uses the public demo accounts and only reads data.

test('demo buyer can log in and sees buyer navigation', async ({ page }) => {
  await loginAsDemo(page, 'buyer');
  await expect(page).toHaveURL(/\/dashboard/);
  const nav = page.getByRole('navigation', { name: 'Main' });
  await expect(nav.getByRole('link', { name: 'Saved' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'My Enquiries' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Post Vehicle' })).toHaveCount(0);
});

test('demo seller lands on My vehicles with seller navigation', async ({ page }) => {
  await loginAsDemo(page, 'seller');
  await expect(page).toHaveURL(/\/seller$/);
  await expect(page.getByRole('heading', { name: 'My vehicles' })).toBeVisible();
  const nav = page.getByRole('navigation', { name: 'Main' });
  await expect(nav.getByRole('link', { name: 'Post Vehicle' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Messages' })).toBeVisible();
});

test('a buyer is redirected away from seller and admin pages', async ({ page }) => {
  await loginAsDemo(page, 'buyer');
  for (const path of ['/seller', '/post', '/seller/messages', '/admin']) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/dashboard/);
  }
});

test('a seller is redirected away from the admin panel', async ({ page }) => {
  await loginAsDemo(page, 'seller');
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/seller$/);
});

test('logged-out visitors are sent to log in for private pages', async ({ page }) => {
  for (const path of ['/enquiries', '/saved', '/account', '/seller']) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login$/);
  }
});

test('wrong password shows an error and stays on the login page', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email address').fill('demo.buyer@example.com');
  await page.getByLabel('Password').fill('definitely-wrong-password');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page.getByText('Invalid email or password.')).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test('account settings protect the shared demo password', async ({ page }) => {
  await loginAsDemo(page, 'buyer');
  await page.getByRole('link', { name: /Demo Buyer/ }).click();
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByRole('heading', { name: 'Account settings' })).toBeVisible();
  await expect(page.getByText(/shared demo account/)).toBeVisible();
  await expect(page.getByLabel('New password')).toHaveCount(0);
});

test('logout returns to the homepage as a visitor', async ({ page }) => {
  await loginAsDemo(page, 'buyer');
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('banner').getByRole('link', { name: 'Log in' })).toBeVisible();
});
