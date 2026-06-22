const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Login
  await page.goto('https://kuikchat.io/login');
  await page.fill('input[type=email]', 'kuikchat.qa+alice@example.com');
  await page.fill('input[type=password]', 'KuikChat-QA-local-2026!');
  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.click('button:has-text("Log in")')
  ]);

  // Navigate to Communities
  await page.goto('https://kuikchat.io/communities', { waitUntil: 'networkidle' });
  // Open create modal
  await page.click('[data-testid="open-create-community"]');

  const name = `QA Umbrella ${Date.now()}`;
  const slug = `qa-umbrella-${Date.now()}`;

  await page.fill('#commName', name);
  await page.fill('#commSlug', slug);
  // Prefilled description is already set via default state; leave it as-is.

  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.click('button:has-text("Create Hub")'),
  ]);

  // Wait for channels list to populate
  await page.waitForTimeout(1500);

  // Screenshot showing Announcements pinned + General present
  await page.screenshot({ path: 'screenshots/communities-create.png', fullPage: true });
  console.log('Saved screenshots/communities-create.png');

  await browser.close();
})();
