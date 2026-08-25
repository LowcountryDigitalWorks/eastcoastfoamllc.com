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
  { path: '/future/service-area', h1: /Service Area/ },
  { path: '/future/resources', h1: /Start with the questions that matter to your project/ },
  { path: '/future/contact', h1: /Keep East Coast Foam close to the project/ },
  { path: '/future/estimate', h1: /Tell us about the project/ }
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
  await expect(page.locator('.future-v1__proof-materials img')).toHaveCount(3);
  await expect(page.locator('.future-v1__proof')).not.toContainText('Google Reviews');
  await expect(page.locator('.future-v1__reviews--home .google-review-carousel')).toHaveCount(1);
  await expect(page.locator('.future-v1__work-proof-vehicle img')).toHaveAttribute('src', /EAST-COAST-FOAM-LLC-1\.webp/);
  await expect(page.locator('.future-v1__work-proof-links')).toContainText('Meet East Coast Foam');

  await page.goto('/future/projects', { waitUntil: 'load' });
  await expect(page.locator('.future-v1__project-grid')).toBeVisible();
  await expect(page.locator('.future-v1__project-permission-note')).toBeVisible();
  await expect(page.locator('.future-v1__project-grid')).not.toContainText(/Beaufort area|Lowcountry|Service area|completed/i);

  await page.goto('/future/about', { waitUntil: 'load' });
  await expect(page.locator('.future-v1__about-photo img')).toHaveAttribute('src', /EAST-COAST-FOAM-LLC-1\.webp/);
  await expect(page.locator('main')).not.toContainText(/owner biography|after Casey confirms|current public site/i);
  await expect(page.locator('.future-v1__partner-grid a')).toHaveCount(3);
});

test('Future contact provides a usable bundled QR, owner-confirmed address, and save/contact path', async ({ page, request }) => {
  await page.goto('/future/contact', { waitUntil: 'load' });
  await expect(page.getByRole('link', { name: /Download Contact Card/ }).first()).toHaveAttribute('href', '/future/contact.vcf');
  await expect(page.locator('[data-contact-qr-code] svg')).toHaveAttribute('data-contact-qr-svg', '');
  await expect(page.locator('[data-contact-qr]')).toContainText('Scan to download and save East Coast Foam’s contact card.');
  await expect(page.getByRole('link', { name: /1352 Trask Pkwy, Seabrook, SC 29940/ }).first()).toHaveAttribute('href', /1352\+Trask\+Pkwy/);
  expect(await page.content()).not.toContain('api.qrserver.com');
  expect(await page.content()).not.toContain('3 Broad River');
  const vcard = await request.get('/future/contact.vcf');
  expect(vcard.ok()).toBeTruthy();
  const vcardText = await vcard.text();
  expect(vcardText).toContain('EMAIL;TYPE=INTERNET:hello@eastcoastfoamllc.com');
  expect(vcardText).toContain('1352 Trask Pkwy;Seabrook;SC;29940');
});

test('Guided Estimate retains a complete local-only request through review and receipt', async ({ page }) => {
  const nonGetRequests: string[] = [];
  page.on('request', (request) => { if (request.method() !== 'GET') nonGetRequests.push(`${request.method()} ${request.url()}`); });
  await page.goto('/future/estimate', { waitUntil: 'load' });
  const form = page.locator('[data-estimate-form]');
  await expect(form).not.toHaveAttribute('action', /.+/);
  await expect(page.getByText('Interactive preview — nothing entered here is sent yet.')).toBeVisible();

  const projectChoices = ['New Construction', 'Existing Home', 'Attic', 'Crawlspace', 'Garage / Shop', 'Roof', 'Commercial Property', 'Other', 'Not Sure'];
  for (const choice of projectChoices) {
    const input = form.locator(`input[name="projectType"][value="${choice}"]`);
    await input.check();
    await expect(input).toBeChecked();
  }
  await form.locator('input[name="projectType"][value="Existing Home"]').check();
    await expect(page.getByText('Question 1 of 3', { exact: true })).toBeVisible();
  await form.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('Question 2 of 3', { exact: true })).toBeVisible();
  await form.locator('input[name="goals"][value="Improve comfort / existing insulation"]').check();
  await form.locator('input[name="goals"][value="Address a crawlspace"]').check();
  await form.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('Question 3 of 3', { exact: true })).toBeVisible();
  const openCell = form.locator('input[name="services"][value="Open-Cell Spray Foam"]');
  const notSure = form.locator('input[name="services"][value="Not Sure"]');
  await openCell.check(); await notSure.check(); await expect(openCell).not.toBeChecked(); await expect(notSure).toBeChecked();
  await openCell.check(); await expect(notSure).not.toBeChecked();
  await form.getByRole('button', { name: 'Continue' }).click();

  await form.getByLabel(/City or community/).fill('Outsideville');
  await form.getByLabel(/ZIP code/).fill('29920');
  await expect(page.getByText('This may be outside our normal service area')).toBeVisible();
  await form.locator('input[name="access"][value="Guard gate"]').check();
  await expect(page.getByText('East Coast Foam can confirm gate codes')).toBeVisible();
  await expect(form.locator('input[name*="gate" i]')).toHaveCount(0);
  await form.getByRole('button', { name: 'Continue' }).click();

  await form.locator('input[name="timing"][value="ASAP"]').check();
  await form.getByLabel(/Approximate project size/).fill('1,500');
  await form.getByLabel(/Anything else we should know/).fill('Please review crawlspace access.');
  await expect(page.getByRole('link', { name: /Need to talk sooner/ })).toBeVisible();
  await form.getByRole('button', { name: 'Continue' }).click();

  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL5/QAAAABJRU5ErkJggg==', 'base64');
  const pdf = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');
  await expect(form.locator('[data-photo-input]')).not.toHaveAttribute('capture', /.+/);
  await expect(form.locator('[data-camera-input]')).toHaveAttribute('capture', 'environment');
  await form.locator('[data-photo-input]').setInputFiles([{ name: 'crawlspace.png', mimeType: 'image/png', buffer: png }, { name: 'attic.png', mimeType: 'image/png', buffer: png }]);
  await form.locator('[data-document-input]').setInputFiles([{ name: 'floor-plan.pdf', mimeType: 'application/pdf', buffer: pdf }, { name: 'roof-report.pdf', mimeType: 'application/pdf', buffer: pdf }]);
  await expect(page.locator('.future-v1__selected-file--photo')).toHaveCount(2);
  await expect(page.locator('.future-v1__selected-file--document')).toHaveCount(2);
  await page.getByRole('button', { name: 'Remove attic.png' }).click();
  await expect(page.locator('.future-v1__selected-file--photo')).toHaveCount(1);
  await form.getByRole('button', { name: 'Continue' }).click();

  await form.getByRole('button', { name: 'Review Request' }).click();
  await expect(page.getByText('Enter a full name with at least two meaningful characters.')).toBeVisible();
  await form.getByLabel('Full name').fill('Jordan Example');
  await form.getByLabel('Phone').fill('+1 (843) 555-0123');
  await expect(form.getByLabel('Phone')).toHaveValue('(843) 555-0123');
  await form.getByRole('button', { name: /Add extension/ }).click();
  await form.getByLabel('Ext.').fill('42');
  await form.locator('input[name="contactPreference"][value="Email"]').check();
  await form.getByRole('button', { name: 'Review Request' }).click();
  await expect(page.getByText('Enter a valid email address when Email is preferred.')).toBeVisible();
  await form.locator('input[name="email"]').fill('jordan@example.com');
  await form.locator('input[name="contactPreference"][value="Text"]').check();
  await expect(page.getByText(/Text preference is noted/)).toBeVisible();
  await form.getByLabel(/Best time to reach you/).fill('Weekday afternoons');
  await form.locator('select[name="leadSource"]').selectOption('Friend / Referral');
  await form.getByLabel(/Who can we thank/).fill('Taylor');
  await form.getByRole('button', { name: 'Review Request' }).click();

  const review = page.locator('[data-estimate-review]');
  await expect(review).toBeVisible();
  await expect(review.locator('[data-review-files]')).toContainText('floor-plan.pdf');
  await expect(review.locator('[data-review-files]')).toContainText('roof-report.pdf');
  await review.getByRole('button', { name: 'Edit' }).nth(1).click();
  await expect(form.getByLabel(/City or community/)).toHaveValue('Outsideville');
  await form.getByRole('button', { name: 'Continue' }).click();
  await form.getByRole('button', { name: 'Continue' }).click();
  await form.getByRole('button', { name: 'Continue' }).click();
  await form.getByRole('button', { name: 'Review Request' }).click();
  await review.getByRole('button', { name: 'Finish Preview' }).click();
  const receipt = page.locator('[data-owner-receipt]');
  await expect(receipt).toContainText('Jordan Example');
  await expect(receipt).toContainText('1 project photo · 2 PDF documents');
  await expect(page.getByText('Schedule a Site Evaluation')).toBeVisible();
  await expect(page.getByText('Future option')).toBeVisible();
  expect(nonGetRequests).toEqual([]);
});

test('Guided Estimate supports keyboard-safe validation, back navigation, and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/future/estimate', { waitUntil: 'load' });
  const form = page.locator('[data-estimate-form]');
  await form.getByRole('button', { name: 'Continue' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Choose what you are working on to continue.')).toBeVisible();
  await form.locator('input[name="projectType"][value="Not Sure"]').check();
  await form.getByRole('button', { name: 'Continue' }).click();
  await form.getByRole('button', { name: 'Continue' }).click();
  await form.getByRole('button', { name: 'Continue' }).click();
  await form.getByLabel(/City or community/).fill('Beaufort');
  await form.getByLabel(/ZIP code/).fill('29906');
  await form.getByRole('button', { name: 'Continue' }).click();
  await form.getByRole('button', { name: 'Back' }).click();
  await expect(form.getByLabel(/City or community/)).toHaveValue('Beaufort');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
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
    await menu.getByRole('button', { name: /Services/ }).click();
    await expect(menu.getByRole('button', { name: /Services/ })).toHaveAttribute('aria-expanded', 'true');
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

test('Future service-area map remains below the open mobile navigation and restores page interaction on close', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/future/service-area', { waitUntil: 'load' });
  const toggle = page.getByRole('button', { name: 'Menu' });
  await toggle.click();
  const menu = page.getByRole('navigation', { name: 'Future mobile navigation' });
  await expect(menu).toBeVisible();
  expect(await page.locator('body').evaluate((body) => body.classList.contains('future-menu-open'))).toBeTruthy();
  const menuBox = await menu.boundingBox();
  expect(menuBox).toBeTruthy();
  const elementIsInMenu = await page.evaluate(({ x, y }) => {
    const nav = document.querySelector('#future-mobile-navigation');
    const element = document.elementFromPoint(x, y);
    return Boolean(nav && element && nav.contains(element));
  }, { x: (menuBox?.x ?? 0) + 20, y: (menuBox?.y ?? 0) + 20 });
  expect(elementIsInMenu).toBeTruthy();
  await page.keyboard.press('Escape');
  expect(await page.locator('body').evaluate((body) => body.classList.contains('future-menu-open'))).toBeFalsy();
});

test('Chooser separates website directions from Casey-facing workflow concepts', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  const directions = page.locator('.chooser-grid');
  await expect(directions.getByRole('link', { name: /Classical/ })).toHaveAttribute('href', '/classical');
  await expect(directions.getByRole('link', { name: /Future/ })).toHaveAttribute('href', '/future');
  const concepts = page.getByRole('region', { name: /Business workflow concepts/ });
  await expect(concepts).toBeVisible();
  await expect(concepts.getByRole('link', { name: /Owner Workspace/ })).toHaveAttribute('href', '/future/owner');
  await expect(concepts.getByRole('link', { name: /Project Capture/ })).toHaveAttribute('href', '/future/capture');
  await expect(page.locator('.chooser-grid')).toHaveCount(1);
  await expect(page.locator('.chooser__concept-grid')).toHaveCount(1);
});

test('Workflow concepts are disclosed, cross-linked, and stay outside Future navigation', async ({ page }) => {
  for (const [path, heading, crossLink] of [
    ['/future/owner', /One useful view of work needing attention/, /Project Capture concept/],
    ['/future/capture', /Capture project proof while the work is still in front of you/, /Owner Workspace concept/]
  ] as const) {
    await page.goto(path, { waitUntil: 'load' });
    await expect(page.locator('main h1')).toHaveText(heading);
    await expect(page.getByText(/Concept — not connected/)).toBeVisible();
    await expect(page.locator('.future-concept__disclosure')).toBeVisible();
    await expect(page.getByRole('link', { name: crossLink })).toBeVisible();
    await expect(page.locator('.future-concept__switcher')).toBeVisible();
    await expect(page.locator('.future-concept__vision img')).toBeVisible();
    await expect(page.locator('main form')).toHaveCount(0);
    const navigation = page.getByRole('navigation', { name: 'Future navigation' });
    await expect(navigation.locator('a[href="/future/owner"],a[href="/future/capture"]')).toHaveCount(0);
  }

  await page.goto('/future/capture', { waitUntil: 'load' });
  const sync = page.locator('.future-concept__sync');
  await expect(sync.getByText('Saved on this device')).toBeVisible();
  await expect(sync.getByText('Waiting for connection')).toBeVisible();
  await expect(sync.getByText('Uploading')).toBeVisible();
  await expect(sync.getByText('Sent')).toBeVisible();
  await expect(page.getByText('Save for Later')).toBeVisible();
  await expect(page.getByText('I’ll Handle Publishing')).toBeVisible();
  await expect(page.getByText('Send to LDW')).toBeVisible();
  await expect(page.getByText('Publish Now')).toHaveCount(0);
  await expect(page.locator('.future-concept__capture-support')).toContainText('(843) 263-4933');
  await expect(page.locator('main')).not.toContainText('843-987-6300');
});

test('Future desktop polish keeps navigation singular and makes call and trust paths clear', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/future', { waitUntil: 'load' });
  await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
  await expect(page.locator('.future-v1__hero-actions')).toContainText('(843) 263-4933');

  await page.goto('/future/reviews', { waitUntil: 'load' });
  await expect(page.getByText('5.0 rating from 2 reviews')).toBeVisible();
  await expect(page.getByText('BBB lists East Coast Foam as not BBB Accredited')).toBeVisible();

  await page.goto('/future/contact', { waitUntil: 'load' });
  await expect(page.getByRole('link', { name: /Download Contact Card/ })).toHaveCount(1);

  await page.goto('/future/service-area', { waitUntil: 'load' });
  await expect(page.getByText('Don’t see your community listed?')).toBeVisible();

  await page.goto('/future/resources', { waitUntil: 'load' });
  await expect(page.getByRole('heading', { name: /Start with the assembly and the project question/ })).toBeVisible();
});

test('Workflow concept routes are accessible and overflow-free on narrow mobile', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  for (const path of ['/future/owner', '/future/capture']) {
    await page.goto(path, { waitUntil: 'load' });
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(results.violations, path).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), path).toBeLessThanOrEqual(1);
  }
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
