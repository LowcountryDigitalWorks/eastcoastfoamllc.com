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

const classicalRoutes = [
  '/classical',
  '/classical/about-us',
  '/classical/services',
  '/classical/contact-us',
  '/classical/get-a-quote',
  ...serviceRoutes.map((slug) => `/classical/${slug}`),
  '/classical/blog'
];

test.describe('Classical route and demo safeguards', () => {
  for (const route of classicalRoutes) {
    test(`${route} renders without exposing production-only behavior`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: 'load' });
      expect(response?.ok()).toBeTruthy();
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex.*nofollow/);
      await expect(page.locator('body')).not.toContainText('ecfoam@outlook.com');

      const viewportOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(viewportOverflow).toBeLessThanOrEqual(1);

      for (const form of await page.locator('form').all()) {
        await expect(form.locator('button[type="submit"]')).toBeDisabled();
      }
    });
  }
});

test('service-area map renders the Seabrook-centered radius and all listed communities', async ({ page }) => {
  await page.goto('/classical/contact-us', { waitUntil: 'domcontentloaded' });
  const map = page.locator('#classical-service-map-canvas');
  await expect(map).toHaveAttribute('data-ready', 'true', { timeout: 15_000 });
  await expect(map.locator('.leaflet-tile')).not.toHaveCount(0);
  expect(await map.locator('.leaflet-interactive').count()).toBeGreaterThanOrEqual(11);

  await expect(page.locator('.classical-service-map__chips span')).toHaveText([
    'Beaufort', "Lady's Island", 'Hilton Head', 'Bluffton', 'Savannah, GA',
    'Edisto', 'Hampton County', 'Charleston', 'North Charleston', 'Mount Pleasant'
  ]);
});

test('current homepage hero and logo assets remain exact', async ({ page }) => {
  await page.goto('/classical', { waitUntil: 'load' });
  await expect(page.locator('.classical-hero__background')).toHaveAttribute('src', 'https://eastcoastfoamllc.com/wp-content/uploads/2024/05/spray-foam-insulation.webp');
  await expect(page.locator('.classical-header .brand-mark img')).toHaveAttribute('src', 'https://eastcoastfoamllc.com/wp-content/uploads/2024/04/Logo-East-Coast-Foam-LLC.png');
});

test('current service slugs and long-form structure stay intact', async ({ page }) => {
  await page.goto('/classical/services');
  for (const slug of serviceRoutes) {
    await expect(page.locator(`.service-grid--classical a[href="/classical/${slug}"]`)).toBeVisible();
  }

  for (const slug of serviceRoutes) {
    await page.goto(`/classical/${slug}`);
    await expect(page.locator('.classical-service-copy-section')).toHaveCount(3);
    await expect(page.locator('.classical-service-faq details')).toHaveCount(4);
  }
});

test.describe('accessibility smoke checks', () => {
  for (const route of ['/classical/about-us', '/classical/services', '/classical/contact-us', '/classical/open-cell-spray-foam-insulation', '/classical/blog']) {
    test(`${route} has no WCAG A/AA violations`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'networkidle' });
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

test('About title band visual regression', async ({ page }) => {
  await page.goto('/classical/about-us', { waitUntil: 'networkidle' });
  await expect(page.locator('.classical-page-hero')).toHaveScreenshot('about-title-band.png');
});
