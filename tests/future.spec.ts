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

test('Future homepage keeps its factual conversion structure and preview safeguards', async ({ page }) => {
  const response = await page.goto('/future', { waitUntil: 'load' });
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator('h1')).toHaveText(/Spray Foam & Insulation Built for the Lowcountry/i);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex.*nofollow/);
  await expect(page.locator('body')).not.toContainText(/\b(demo|concept|placeholder|migration preview|development version)\b/i);
  await expect(page.locator('body')).not.toContainText('ecfoam@outlook.com');

  for (const id of ['services', 'projects', 'about', 'reviews', 'service-area', 'resources', 'estimate']) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
  await expect(page.locator('.future-v1__proof-brand')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.locator('.future-v1__proof-brand img')).toHaveCSS('filter', 'none');
  await expect(page.locator('.future-v1__estimate-actions a[href^="mailto:"]')).toHaveAttribute('href', /hello@eastcoastfoamllc\.com/);
});

test('Future desktop navigation exposes the primary directions and service routes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/future', { waitUntil: 'load' });
  const navigation = page.getByRole('navigation', { name: 'Future navigation' });
  for (const label of ['Projects', 'About', 'Reviews', 'Service Area', 'Resources']) {
    await expect(navigation.getByRole('link', { name: label, exact: true })).toBeVisible();
  }
  await expect(navigation.getByRole('link', { name: 'Request an Estimate', exact: true })).toBeVisible();
  await navigation.locator('summary').click();
  for (const slug of serviceRoutes) await expect(navigation.locator(`a[href="/classical/${slug}"]`)).toBeVisible();
});

test('Future mobile menu, service details, and persistent conversion actions are usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/future', { waitUntil: 'load' });
  const toggle = page.getByRole('button', { name: 'Menu' });
  const menu = page.getByRole('navigation', { name: 'Future mobile navigation' });
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(menu).toBeVisible();
  for (const label of ['Services', 'Projects', 'About', 'Reviews', 'Service Area', 'Resources', 'Request an Estimate']) {
    await expect(menu.getByRole('link', { name: label, exact: true })).toBeVisible();
  }
  const serviceToggle = menu.getByRole('button', { name: 'Show service pages' });
  await serviceToggle.click();
  for (const slug of serviceRoutes) await expect(menu.locator(`a[href="/classical/${slug}"]`)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();

  const mobileActions = page.getByRole('region', { name: 'Contact East Coast Foam' });
  await expect(mobileActions.getByRole('link', { name: 'Call' })).toHaveAttribute('href', 'tel:+18432634933');
  await expect(mobileActions.getByRole('link', { name: 'Request Estimate' })).toHaveAttribute('href', '#estimate');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('Future homepage has no persistent horizontal overflow at desktop or mobile widths', async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/future', { waitUntil: 'load' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
});

test('Future homepage has no WCAG A/AA smoke-test violations', async ({ page }) => {
  await page.goto('/future', { waitUntil: 'load' });
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
});

test('Future mobile menu has no WCAG A/AA smoke-test violations', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/future', { waitUntil: 'load' });
  await page.getByRole('button', { name: 'Menu' }).click();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
});
