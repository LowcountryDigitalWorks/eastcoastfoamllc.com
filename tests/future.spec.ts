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

const futurePages = [
  { path: '/future/', title: /East Coast Foam \| Spray Foam & Insulation for the Lowcountry/, h1: /Spray Foam & Insulation Built for the Lowcountry/ },
  { path: '/future/services', title: /Services \| East Coast Foam/, h1: /Find the service conversation that fits the work/ },
  { path: '/future/projects', title: /Recent Work \| East Coast Foam/, h1: /See the materials, application, and finished work/ },
  { path: '/future/about', title: /About East Coast Foam/, h1: /Local expertise. Direct accountability/ },
  { path: '/future/reviews', title: /Customer Reviews \| East Coast Foam/, h1: /Customer feedback, in their own words/ },
  { path: '/future/service-area', title: /Service Area \| East Coast Foam/, h1: /South Carolina Lowcountry & Coastal Georgia/ },
  { path: '/future/resources', title: /Resources \| East Coast Foam/, h1: /Start with the questions that matter to your project/ },
  { path: '/future/estimate', title: /Request an Estimate \| East Coast Foam/, h1: /Start with the project in front of you/ }
];

test('Future homepage is a concise orientation and routing experience with preview safeguards', async ({ page }) => {
  const response = await page.goto('/future/', { waitUntil: 'load' });
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator('h1')).toHaveText(/Spray Foam & Insulation Built for the Lowcountry/i);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex.*nofollow/);
  await expect(page.locator('body')).not.toContainText(/\b(demo|concept|placeholder|migration preview|development version)\b/i);
  await expect(page.locator('body')).not.toContainText('ecfoam@outlook.com');
  await expect(page.locator('.future-v1__work-proof-vehicle img')).toHaveAttribute('src', /EAST-COAST-FOAM-LLC-1\.webp/);
  await expect(page.locator('.future-v1__work-proof-vehicle')).toContainText('East Coast Foam on the road and at the jobsite.');
  await expect(page.getByRole('link', { name: 'Compare foam types' })).toHaveAttribute('href', '/future/resources#foam-types');
  await expect(page.locator('#resources, .future-v1__paths, .future-v1__compare, .future-v1__process')).toHaveCount(0);
  await expect(page.locator('.future-v1__closing-estimate .future-v1__estimate-button')).toHaveAttribute('href', '/future/estimate');
});

test('every Future route has unique factual metadata and one clear H1', async ({ page }) => {
  for (const route of futurePages) {
    await page.goto(route.path, { waitUntil: 'load' });
    await expect(page).toHaveTitle(route.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('main h1')).toHaveText(route.h1);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex.*nofollow/);
  }
});

test('Future route hubs expose intentional internal paths and factual content', async ({ page }) => {
  await page.goto('/future/services', { waitUntil: 'load' });
  for (const slug of serviceRoutes) await expect(page.locator(`a[href="/classical/${slug}"]`).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /Compare the existing open-cell and closed-cell overviews/ })).toHaveAttribute('href', '/future/resources#foam-types');

  await page.goto('/future/projects', { waitUntil: 'load' });
  await expect(page.locator('.future-v1__project-grid')).toBeVisible();
  await expect(page.locator('.future-v1__project-grid')).not.toContainText(/Beaufort area|Lowcountry|Service area/i);

  await page.goto('/future/about', { waitUntil: 'load' });
  await expect(page.locator('.future-v1__about-photo img')).toHaveAttribute('src', /EAST-COAST-FOAM-LLC-1\.webp/);
  await expect(page.locator('.future-v1__partner-grid a')).toHaveCount(3);

  await page.goto('/future/reviews', { waitUntil: 'load' });
  await expect(page.locator('[data-review-carousel]')).toBeVisible();

  await page.goto('/future/service-area', { waitUntil: 'load' });
  for (const area of ['Beaufort', "Lady's Island", 'Hilton Head', 'Bluffton', 'Edisto', 'Hampton County', 'Charleston', 'North Charleston', 'Mount Pleasant', 'Savannah, GA']) await expect(page.locator('.future-v1__geo-chips')).toContainText(area);

  await page.goto('/future/resources', { waitUntil: 'load' });
  await expect(page.locator('#foam-types')).toHaveAttribute('href', '/classical/open-cell-spray-foam-insulation');

  await page.goto('/future/estimate', { waitUntil: 'load' });
  await expect(page.locator('.future-v1__estimate-actions a[href^="mailto:"]')).toHaveAttribute('href', /hello@eastcoastfoamllc\.com/);
  await expect(page.getByRole('region', { name: 'Contact East Coast Foam' })).toHaveCount(0);
});

test('Future desktop navigation exposes the primary destinations and existing service routes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/future/', { waitUntil: 'load' });
  const navigation = page.getByRole('navigation', { name: 'Future navigation' });
  for (const [label, href] of [['Projects', '/future/projects'], ['About', '/future/about'], ['Reviews', '/future/reviews'], ['Service Area', '/future/service-area'], ['Resources', '/future/resources']] as const) {
    await expect(navigation.getByRole('link', { name: label, exact: true })).toHaveAttribute('href', href);
  }
  await expect(navigation.getByRole('link', { name: 'Request an Estimate', exact: true })).toHaveAttribute('href', '/future/estimate');
  await navigation.locator('summary').click();
  await expect(navigation.getByRole('link', { name: 'Explore all services' })).toHaveAttribute('href', '/future/services');
  for (const slug of serviceRoutes) await expect(navigation.locator(`a[href="/classical/${slug}"]`)).toBeVisible();
});

test('Future mobile menu, contextual sticky actions, and estimate suppression are usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/future/', { waitUntil: 'load' });
  const toggle = page.getByRole('button', { name: 'Menu' });
  const menu = page.getByRole('navigation', { name: 'Future mobile navigation' });
  await expect(toggle).toBeVisible();
  await expect(menu).toBeHidden();
  await toggle.click();
  await expect(menu).toBeVisible();
  for (const [label, href] of [['Services', '/future/services'], ['Projects', '/future/projects'], ['About', '/future/about'], ['Reviews', '/future/reviews'], ['Service Area', '/future/service-area'], ['Resources', '/future/resources'], ['Request an Estimate', '/future/estimate']] as const) await expect(menu.getByRole('link', { name: label, exact: true })).toHaveAttribute('href', href);
  await menu.getByRole('button', { name: 'Show service pages' }).click();
  for (const slug of serviceRoutes) await expect(menu.locator(`a[href="/classical/${slug}"]`)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();

  const actions = page.getByRole('region', { name: 'Contact East Coast Foam' });
  await expect(actions).toHaveAttribute('data-hidden', '');
  await page.locator('#projects').scrollIntoViewIfNeeded();
  await expect(actions).not.toHaveAttribute('data-hidden', '');
  await expect(actions.getByRole('link', { name: 'Call' })).toHaveAttribute('href', 'tel:+18432634933');
  await expect(actions.getByRole('link', { name: 'Request Estimate' })).toHaveAttribute('href', '/future/estimate');
  await page.locator('#estimate').scrollIntoViewIfNeeded();
  await expect(actions).toHaveAttribute('data-hidden', '');

  await page.goto('/future/estimate', { waitUntil: 'load' });
  await expect(page.getByRole('region', { name: 'Contact East Coast Foam' })).toHaveCount(0);
});

test('Future has no persistent horizontal overflow at desktop, Pixel, and narrow iPhone widths', async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 375, height: 812 }]) {
    await page.setViewportSize(viewport);
    for (const path of ['/future/', '/future/services', '/future/projects', '/future/about', '/future/reviews', '/future/service-area', '/future/resources', '/future/estimate']) {
      await page.goto(path, { waitUntil: 'load' });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${path} at ${viewport.width}px`).toBeLessThanOrEqual(1);
    }
  }
});

test('Future homepage, mobile menu, and route hubs have no WCAG A/AA smoke-test violations', async ({ page }) => {
  for (const path of ['/future/', '/future/services', '/future/projects', '/future/about', '/future/reviews', '/future/service-area', '/future/resources', '/future/estimate']) {
    await page.goto(path, { waitUntil: 'load' });
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(results.violations, path).toEqual([]);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/future/', { waitUntil: 'load' });
  await page.getByRole('button', { name: 'Menu' }).click();
  const mobileResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(mobileResults.violations).toEqual([]);
});
