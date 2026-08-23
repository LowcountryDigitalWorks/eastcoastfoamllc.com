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

test('mobile navigation exposes all routes, service details, and quote CTA', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/classical', { waitUntil: 'networkidle' });

  const menuToggle = page.getByRole('button', { name: 'Menu' });
  const navigation = page.getByRole('navigation', { name: 'East Coast Foam navigation' });
  await expect(menuToggle).toBeVisible();
  await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(navigation).toBeHidden();

  await menuToggle.click();
  await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
  await expect(navigation).toBeVisible();
  for (const name of ['Home', 'About Us', 'Services', 'Blog', 'Contact Us', 'Get a Quote']) {
    await expect(navigation.getByRole('link', { name, exact: true })).toBeVisible();
  }

  const servicesToggle = navigation.getByRole('button', { name: 'Show service pages' });
  await servicesToggle.click();
  await expect(servicesToggle).toHaveAttribute('aria-expanded', 'true');
  for (const slug of serviceRoutes) {
    await expect(navigation.locator(`a[href="/classical/${slug}"]`)).toBeVisible();
  }

  await page.keyboard.press('Escape');
  await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(menuToggle).toBeFocused();

  await menuToggle.click();
  await navigation.getByRole('link', { name: 'About Us', exact: true }).click();
  await expect(page).toHaveURL(/\/classical\/about-us\/?$/);
  await expect(page.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'false');
});

test('supplier and certification artwork remains on explicit light surfaces', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/classical', { waitUntil: 'networkidle' });

  const logoSurfaces = page.locator('.classical-logo-grid > a, .classical-trust-strip__badge');
  await expect(logoSurfaces).toHaveCount(9);
  for (const surface of await logoSurfaces.all()) {
    await expect(surface).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  }

  const supplierLogos = page.locator('.classical-logo-grid--brands img');
  await expect(supplierLogos).toHaveCount(3);
  for (const logo of await supplierLogos.all()) {
    await expect(logo).toHaveCSS('filter', 'none');
    await expect(logo).toHaveAttribute('src', /^https:\/\/eastcoastfoamllc\.com\/wp-content\/uploads\//);
    await expect(logo).toHaveAttribute('alt', /\S/);
  }
});

test('website directions do not expose preview or development language', async ({ page }) => {
  for (const route of ['/', '/classical', '/future']) {
    await page.goto(route, { waitUntil: 'networkidle' });
    await expect(page.locator('body')).not.toContainText(/\b(demo|placeholder|migration preview|concept demo)\b/i);
  }
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

test('open mobile navigation has no WCAG A/AA violations', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/classical', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: 'Show service pages' }).click();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
});

test('About title band visual regression', async ({ page }) => {
  await page.goto('/classical/about-us', { waitUntil: 'networkidle' });
  await expect(page.locator('.classical-page-hero')).toHaveScreenshot('about-title-band.png');
});
