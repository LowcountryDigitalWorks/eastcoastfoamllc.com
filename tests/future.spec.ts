import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const serviceRoutes = [
  'open-cell-spray-foam-insulation',
  'closed-cell-spray-foam-insulation',
  'polyurea-coatings',
  'fiberglass-batt-insulation',
  'insulation-removal-services',
  'spray-foam-roofing',
  'silicone-roof-coating'
];

const futureHubs = [
  { path: '/future', h1: /Spray Foam & Insulation Built for the Lowcountry/ },
  { path: '/future/services', h1: /Find the service conversation that fits the work/ },
  { path: '/future/projects', h1: /See East Coast Foam service photography/ },
  { path: '/future/about', h1: /Local expertise. Direct accountability/ },
  { path: '/future/reviews', h1: /Customer feedback, in their own words/ },
  { path: '/future/service-area', h1: /South Carolina Lowcountry & Coastal Georgia/ },
  { path: '/future/resources', h1: /Start with the questions that matter to your project/ },
  { path: '/future/contact', h1: /Keep East Coast Foam close to the project/ },
  { path: '/future/estimate', h1: /Start with the project in front of you/ }
];

test('Future hub routes have unique customer-facing structure and preserve preview safeguards', async ({ page }) => {
  const titles = new Set<string>();
  for (const route of futureHubs) {
    const response = await page.goto(route.path, { waitUntil: 'load' });
    expect(response?.ok(), route.path).toBeTruthy();
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('main h1')).toHaveText(route.h1);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex.*nofollow/);
    await expect(page.locator('body')).not.toContainText(/\b(demo|concept|placeholder|migration preview|development version)\b/i);
    titles.add(await page.title());
  }
  expect(titles.size).toBe(futureHubs.length);
});

test('Future stays independent of Classical and exposes seven purpose-built service pages', async ({ page }) => {
  await page.goto('/future/services', { waitUntil: 'load' });
  for (const slug of serviceRoutes) await expect(page.locator(`main a[href="/future/${slug}"]`).first()).toBeVisible();
  expect(await page.locator('main').innerHTML()).not.toContain('/classical/');

  for (const slug of serviceRoutes) {
    await page.goto(`/future/${slug}`, { waitUntil: 'load' });
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('.future-v1__service-detail-copy')).toBeVisible();
    await expect(page.locator('.future-v1__service-faq details')).toHaveCount(3);
    await expect(page.locator('.future-v1__related-services a')).toHaveCount(3);
    expect(await page.locator('main').innerHTML()).not.toContain('/classical/');
  }
});

test('Future trust, project, and about content use real approved source material without fake project metadata', async ({ page }) => {
  await page.goto('/future', { waitUntil: 'load' });
  await expect(page.locator('.future-v1__proof-local')).toContainText('locally owned and operated');
  await expect(page.locator('.future-v1__proof-review')).toHaveAttribute('href', '/future/reviews');
  await expect(page.locator('.future-v1__proof-materials img')).toHaveCount(3);
  await expect(page.locator('.future-v1__work-proof-vehicle img')).toHaveAttribute('src', /EAST-COAST-FOAM-LLC-1\.webp/);
  await expect(page.locator('.future-v1__work-proof-links')).toContainText('Meet East Coast Foam');

  await page.goto('/future/projects', { waitUntil: 'load' });
  await expect(page.locator('.future-v1__project-grid')).toBeVisible();
  await expect(page.locator('.future-v1__project-permission-note')).toBeVisible();
  await expect(page.locator('.future-v1__project-grid')).not.toContainText(/Beaufort area|Lowcountry|Service area|completed/i);

  await page.goto('/future/about', { waitUntil: 'load' });
  await expect(page.locator('.future-v1__about-photo img')).toHaveAttribute('src', /EAST-COAST-FOAM-LLC-1\.webp/);
  await expect(page.locator('.future-v1__story-note')).toContainText('Owner biography');
  await expect(page.locator('.future-v1__partner-grid a')).toHaveCount(3);
});

test('Future contact provides a usable save/contact path and a runtime-specific QR destination', async ({ page, request }) => {
  await page.goto('/future/contact', { waitUntil: 'load' });
  await expect(page.getByRole('link', { name: /Save contact/ })).toHaveAttribute('href', '/future/contact.vcf');
  await expect(page.locator('[data-contact-qr] img')).toHaveAttribute('src', /api\.qrserver\.com/);
  await expect(page.getByRole('link', { name: /Open contact page/ })).toHaveAttribute('href', '/future/contact');
  const vcard = await request.get('/future/contact.vcf');
  expect(vcard.ok()).toBeTruthy();
  expect(await vcard.text()).toContain('EMAIL;TYPE=INTERNET:hello@eastcoastfoamllc.com');
});

test('Future desktop navigation uses only Future destinations in customer-intent order', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/future', { waitUntil: 'load' });
  const navigation = page.getByRole('navigation', { name: 'Future navigation' });
  for (const [label, href] of [['Projects', '/future/projects'], ['About', '/future/about'], ['Reviews', '/future/reviews'], ['Service Area', '/future/service-area'], ['Guides', '/future/resources'], ['Contact', '/future/contact']] as const) {
    await expect(navigation.getByRole('link', { name: label, exact: true })).toHaveAttribute('href', href);
  }
  await navigation.locator('summary').click();
  for (const slug of serviceRoutes) await expect(navigation.locator(`a[href="/future/${slug}"]`)).toBeVisible();
  await expect(navigation.getByRole('link', { name: 'Request an Estimate', exact: true })).toHaveAttribute('href', '/future/estimate');
});

test('Future mobile menu is visible at iPhone and narrow widths and sticky actions follow real conversion controls', async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 375, height: 812 }, { width: 320, height: 700 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/future', { waitUntil: 'load' });
    const toggle = page.getByRole('button', { name: 'Menu' });
    const menu = page.getByRole('navigation', { name: 'Future mobile navigation' });
    await expect(toggle).toBeVisible();
    await expect(toggle.locator('svg')).toBeVisible();
    await expect(toggle).toHaveCSS('color', 'rgb(255, 255, 255)');
    expect((await toggle.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    await toggle.click();
    await expect(menu).toBeVisible();
    await menu.getByRole('button', { name: 'Show service pages' }).click();
    for (const slug of serviceRoutes) await expect(menu.locator(`a[href="/future/${slug}"]`)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(toggle).toBeFocused();

    const actions = page.locator('.future-v1__mobile-actions');
    await page.locator('.future-v1__proof').scrollIntoViewIfNeeded();
    await expect(actions).not.toHaveAttribute('data-hidden', '');
    await expect(actions.getByRole('link', { name: 'Call' })).toHaveAttribute('href', 'tel:+18432634933');
    await expect(actions.getByRole('link', { name: 'Request Estimate' })).toHaveAttribute('href', '/future/estimate');
    await expect(actions).not.toContainText('→');
    await page.locator('#estimate').scrollIntoViewIfNeeded();
    await expect(actions).toHaveAttribute('data-hidden', '');
  }
  await page.goto('/future/estimate', { waitUntil: 'load' });
  await expect(page.getByRole('region', { name: 'Contact East Coast Foam' })).toHaveCount(0);
});

test('Future has no persistent horizontal overflow at desktop, Android, iPhone, and narrow mobile widths', async ({ page }) => {
  const paths = [...futureHubs.map((item) => item.path), ...serviceRoutes.map((slug) => `/future/${slug}`)];
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 375, height: 812 }, { width: 320, height: 700 }]) {
    await page.setViewportSize(viewport);
    for (const path of paths) {
      await page.goto(path, { waitUntil: 'load' });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${path} at ${viewport.width}px`).toBeLessThanOrEqual(1);
    }
  }
});

test('Future hubs, service pages, and open mobile menu have no WCAG A/AA smoke-test violations', async ({ page }) => {
  for (const path of [...futureHubs.map((item) => item.path), ...serviceRoutes.map((slug) => `/future/${slug}`)]) {
    await page.goto(path, { waitUntil: 'load' });
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(results.violations, path).toEqual([]);
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/future', { waitUntil: 'load' });
  await page.getByRole('button', { name: 'Menu' }).click();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
});
