const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://kuikchat.io/login');
  await page.fill('input[type=email]', 'kuikchat.qa+alice@example.com');
  await page.fill('input[type=password]', 'KuikChat-QA-local-2026!');
  await Promise.all([
    page.waitForURL('**/(app)/**', { timeout: 15000 }).catch(() => {}),
    page.click('button:has-text("Log in")'),
  ]);

  await page.goto('https://kuikchat.io/settings/storage', { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Storage', { timeout: 15000 }).catch(() => {});
  await page.screenshot({ path: 'screenshots/storage.png', fullPage: true });
  console.log('Saved screenshots/storage.png');

  await browser.close();
})();
