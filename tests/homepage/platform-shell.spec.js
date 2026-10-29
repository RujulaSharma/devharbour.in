const { test, expect } = require('@playwright/test');
const navbar = page => page.locator('#dh-platform-navigation');

test('navbar provides all former sidebar destinations without a side panel', async ({ page }) => {
  await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.app > .sb')).toBeHidden();
  await expect(page.locator('#platform-sidebar-toggle,#platform-sidebar-rail')).toHaveCount(0);
  for (const [label, path, view] of [
    ['Learn', '/courses', 'learn'], ['Practice', '/practice', 'practice'], ['Timer', '/timer', 'timer'],
    ['Workspace', '/workspace', 'work'], ['Settings', '/settings', 'settings'], ['Dashboard', '/dashboard', 'home'],
  ]) {
    await navbar(page).locator('.nav-links').getByRole('link', { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(path + '$'));
    await expect(page.locator('#v-' + view)).toHaveClass(/on/);
    await expect(navbar(page)).toBeVisible();
  }
  const bounds = await page.locator('.app > main').boundingBox();
  expect(bounds.x).toBeLessThan(30);
  await page.screenshot({ path: '.local/navbar-only-desktop.png' });
});

test('navbar light/dark toggle persists and stays in sync with Settings', async ({ page }) => {
  await page.goto('/settings', { waitUntil: 'domcontentloaded' });
  const toggle = navbar(page).getByRole('button', { name: 'Toggle light and dark theme' });
  const before = await page.locator('html').getAttribute('data-theme');
  await toggle.click();
  const selected = before === 'dark' ? 'light' : 'dark';
  await expect(page.locator('html')).toHaveAttribute('data-theme', selected);
  await expect(page.locator('#swd')).toHaveAttribute('aria-checked', String(selected === 'dark'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', selected);
  await page.locator('#swd').click();
  await expect(toggle).toHaveAttribute('aria-pressed', String(selected !== 'dark'));
});

test('mobile navbar provides former sidebar routes and theme control without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.app > .sb')).toBeHidden();
  await expect(navbar(page).getByRole('button', { name: 'Toggle light and dark theme' })).toBeVisible();
  for (const [label, path] of [['Practice', '/practice'], ['Timer', '/timer'], ['Workspace', '/workspace'], ['Settings', '/settings']]) {
    await navbar(page).getByRole('button', { name: 'Toggle navigation' }).click();
    await navbar(page).locator('.mobile-menu').getByRole('link', { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(path + '$'));
    await expect(navbar(page).locator('.mobile-menu')).toHaveCount(0);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: '.local/navbar-only-mobile.png' });
});

for (const width of [1000, 390]) test(`navbar links stay directly visible at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  for (const path of ['/', '/dashboard']) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    const host = page.locator(path === '/' ? '#dh-homepage' : '#dh-platform-navigation');
    for (const name of ['Learn', 'Practice', 'Timer', 'Workspace', 'Settings', 'Certificates']) {
      const link = host.locator('.nav-links').getByRole('link', { name, exact: true });
      await expect(link).toBeVisible();
      const bounds = await link.boundingBox();
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    }
    await expect(host.getByRole('button', { name: 'Toggle light and dark theme' })).toBeVisible();
  }
  await navbar(page).locator('.nav-links').getByRole('link', { name: 'Learn', exact: true }).click();
  await expect(page).toHaveURL(/\/courses$/);
  await expect(page.locator('#v-learn')).toHaveClass(/on/);
});

test('slow remote fonts cannot prevent navbar startup', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 900 });
  let releaseFonts;
  const gate = new Promise(resolve => { releaseFonts = resolve; });
  await page.route('https://fonts.googleapis.com/**', async route => {
    await gate;
    await route.abort().catch(() => {});
  });
  try {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await expect(navbar(page).locator('.nav-links').getByRole('link', { name: 'Learn', exact: true })).toBeVisible();
    await expect(navbar(page).locator('.nav-links').getByRole('link', { name: 'Settings', exact: true })).toBeVisible();
  } finally { releaseFonts(); }
});
