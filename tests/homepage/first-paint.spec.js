const { test, expect } = require('@playwright/test');

test('old landing page stays hidden while the new homepage bundle downloads', async ({ page }) => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route('**/homepage/homepage.js*', async route => { await gate; await route.continue(); });
  try {
    await page.goto('/', { waitUntil: 'commit' });
    await expect(page.locator('#dh-homepage-boot')).toBeVisible();
    await expect(page.locator('#intro #hz')).toBeHidden();
    await expect(page.locator('#intro .zs').first()).toBeHidden();
    await page.locator('script[src*="/homepage/homepage.js"]').waitFor({ state: 'attached' });
    const urls = await page.evaluate(() => ({
      preload: document.getElementById('dh-homepage-preload').getAttribute('href'),
      script: document.querySelector('script[src*="/homepage/homepage.js"]').getAttribute('src'),
    }));
    expect(urls.preload).toBe(urls.script);
    release();
    await expect(page.locator('#dh-homepage h1')).toBeVisible();
    await expect(page.locator('#dh-homepage-boot')).toBeHidden();
    await expect(page.locator('#intro #hz')).toBeHidden();
  } finally { release(); }
});

test('a failed bundle shows a reload option and never reveals the old homepage', async ({ page }) => {
  await page.route('**/homepage/homepage.js*', route => route.abort());
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#dh-homepage-boot')).toBeVisible();
  await expect(page.locator('#dh-homepage-boot-retry')).toBeVisible();
  await expect(page.locator('#dh-homepage-boot-message')).toContainText('reload');
  await expect(page.locator('#intro #hz')).toBeHidden();
});

test('without JavaScript the page does not display the legacy landing UI', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#dh-homepage-boot')).toBeVisible();
    expect(await page.locator('#dh-homepage-boot noscript').textContent()).toContain('Enable JavaScript');
    await expect(page.locator('#intro #hz')).toBeHidden();
  } finally { await context.close(); }
});
