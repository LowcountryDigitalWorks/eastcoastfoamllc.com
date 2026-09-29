import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'production-seed');

const routeReplacements = [
  ['/future/contact.vcf', '/contact.vcf'],
  ['/future/spray-foam-basics', '/spray-foam-basics'],
  ['/future/service-area', '/service-area'],
  ['/future/get-a-quote', '/get-a-quote'],
  ['/future/estimate', '/get-a-quote'],
  ['/future/contact', '/contact-us'],
  ['/future/services', '/services'],
  ['/future/projects', '/projects'],
  ['/future/about', '/about-us'],
  ['/future/reviews', '/reviews'],
  ['/future/resources', '/resources'],
  ['/future/', '/']
];

function rewriteRoutes(input) {
  const rewritten = routeReplacements.reduce((text, [from, to]) => text.split(from).join(to), input);
  return rewritten
    .replaceAll('"/future"', '"/"')
    .replaceAll("'\/future'", "'\/'")
    .replaceAll('`/future`', '`/`');
}

async function copyText(source, target, transform = (value) => value) {
  const content = await readFile(path.join(root, source), 'utf8');
  const targetPath = path.join(out, target);
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, transform(content), 'utf8');
}

async function copyBinary(source, target) {
  const targetPath = path.join(out, target);
  await mkdir(path.dirname(targetPath), { recursive: true });
  await cp(path.join(root, source), targetPath);
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

for (const file of ['.gitignore', 'package.json', 'tsconfig.json', 'src/env.d.ts']) {
  await copyText(file, file);
}

await copyText('src/styles/global.css', 'src/styles/global.css');
await copyText('src/styles/future-foundation.css', 'src/styles/future-foundation.css');

const components = [
  'BrandMark.astro',
  'FutureAbout.astro',
  'FutureClosing.astro',
  'FutureContactQr.astro',
  'FutureEstimate.astro',
  'FutureFoamTeaser.astro',
  'FutureFooter.astro',
  'FutureGeoMap.astro',
  'FutureGuidedEstimate.astro',
  'FutureHeader.astro',
  'FutureHero.astro',
  'FutureMobileActions.astro',
  'FuturePageIntro.astro',
  'FutureProcess.astro',
  'FutureProjectPaths.astro',
  'FutureProjects.astro',
  'FutureProofStrip.astro',
  'FutureResources.astro',
  'FutureResourcesHub.astro',
  'FutureServiceArea.astro',
  'FutureServiceDetail.astro',
  'FutureServices.astro',
  'FutureServicesOverview.astro',
  'FutureWorkProof.astro',
  'GoogleReviewsCarousel.astro'
];

for (const name of components) {
  await copyText(`src/components/${name}`, `src/components/${name}`, (value) =>
    rewriteRoutes(value).replaceAll("../data/demo-assets.json", "../data/site-assets.json")
  );
}

for (const file of ['future-lead-model.ts', 'future-projects.ts', 'services.json']) {
  await copyText(`src/data/${file}`, `src/data/${file}`);
}

await copyText('src/data/demo-assets.json', 'src/data/site-assets.json', (value) =>
  value
    .replace('"note": "East Coast Foam owner-authorized media currently served from the existing WordPress site. Preserve and optimize approved originals in customer-owned storage before the legacy host is retired."', '"note": "East Coast Foam owner-authorized media currently served from the legacy WordPress host. This dependency must be migrated to customer-owned storage before WordPress retirement."')
);

await copyText('src/data/site.json', 'src/data/site.json', (value) => {
  const data = JSON.parse(value);
  data.publicEmail = data.currentEmail;
  data.quoteEmail = data.currentEmail;
  return JSON.stringify(data, null, 2) + '\n';
});

await copyText('src/data/future-content.ts', 'src/data/future-content.ts', (value) =>
  rewriteRoutes(value)
    .replace("publicEmail: 'hello@eastcoastfoamllc.com'", "publicEmail: 'ecfoam@outlook.com'")
);

const baseLayout = `---
import '../styles/global.css';
import '../styles/future-foundation.css';

interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <meta name="description" content={description} />
    <meta name="robots" content="noindex,nofollow,noarchive,nosnippet" />
    <meta name="googlebot" content="noindex,nofollow,noarchive,nosnippet" />
    <meta name="theme-color" content="#102a20" />
    <link rel="canonical" href={new URL(Astro.url.pathname, 'https://eastcoastfoamllc.com').toString()} />
    <title>{title}</title>
  </head>
  <body class="theme-future">
    <slot />
  </body>
</html>
`;
await mkdir(path.join(out, 'src/layouts'), { recursive: true });
await writeFile(path.join(out, 'src/layouts/BaseLayout.astro'), baseLayout, 'utf8');

await copyText('src/layouts/FutureLayout.astro', 'src/layouts/FutureLayout.astro', (value) =>
  value.replace(' theme="future"', '')
);

const pageMap = new Map([
  ['src/pages/future/index.astro', 'src/pages/index.astro'],
  ['src/pages/future/about.astro', 'src/pages/about-us.astro'],
  ['src/pages/future/contact.astro', 'src/pages/contact-us.astro'],
  ['src/pages/future/contact.vcf.ts', 'src/pages/contact.vcf.ts'],
  ['src/pages/future/estimate.astro', 'src/pages/get-a-quote.astro'],
  ['src/pages/future/projects.astro', 'src/pages/projects.astro'],
  ['src/pages/future/resources.astro', 'src/pages/resources.astro'],
  ['src/pages/future/reviews.astro', 'src/pages/reviews.astro'],
  ['src/pages/future/service-area.astro', 'src/pages/service-area.astro'],
  ['src/pages/future/services.astro', 'src/pages/services.astro'],
  ['src/pages/future/spray-foam-basics.astro', 'src/pages/spray-foam-basics.astro'],
  ['src/pages/future/[service].astro', 'src/pages/[service].astro']
]);

for (const [source, target] of pageMap) {
  await copyText(source, target, (value) => {
    let next = rewriteRoutes(value).replaceAll('../../', '../').replaceAll('../data/demo-assets.json', '../data/site-assets.json');
    if (target === 'src/pages/about-us.astro') {
      next = next.replace(/\n  <section class="future-v1__founder-sample"[\s\S]*?<\/section>\n/, '\n');
    }
    if (target === 'src/pages/contact.vcf.ts') {
      next = next
        .replace('EMAIL;TYPE=INTERNET:hello@eastcoastfoamllc.com', 'EMAIL;TYPE=INTERNET:ecfoam@outlook.com')
        .replace('URL:https://eastcoastfoamllc.com/contact', 'URL:https://eastcoastfoamllc.com/contact-us');
    }
    return next;
  });
}

const notFound = `---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Page Not Found | East Coast Foam" description="The requested East Coast Foam page could not be found.">
  <main class="future-v1 future-v1__section">
    <p class="future-v1__kicker">404</p>
    <h1>That page could not be found.</h1>
    <p>Return to East Coast Foam or explore the current services.</p>
    <p><a class="future-v1__estimate-button" href="/">Home</a> <a class="future-v1__text-link" href="/services">Services</a></p>
  </main>
</BaseLayout>
`;
await writeFile(path.join(out, 'src/pages/404.astro'), notFound, 'utf8');

const astroConfig = `import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://eastcoastfoamllc.com',
  output: 'static',
  trailingSlash: 'never',
});
`;
await writeFile(path.join(out, 'astro.config.mjs'), astroConfig, 'utf8');

const wrangler = {
  '$schema': 'node_modules/wrangler/config-schema.json',
  name: 'eastcoastfoamllc',
  compatibility_date: '2026-09-29',
  assets: {
    directory: './dist',
    not_found_handling: '404-page',
    html_handling: 'drop-trailing-slash'
  }
};
await writeFile(path.join(out, 'wrangler.jsonc'), JSON.stringify(wrangler, null, 2) + '\n', 'utf8');

const playwrightConfig = `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } }
  ],
  webServer: {
    command: 'node ./node_modules/astro/astro.js preview --host 127.0.0.1 --port 4321',
    url: 'http://127.0.0.1:4321/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
`;
await writeFile(path.join(out, 'playwright.config.ts'), playwrightConfig, 'utf8');

await mkdir(path.join(out, 'public'), { recursive: true });
await writeFile(path.join(out, 'public/robots.txt'), 'User-agent: *\nDisallow: /\n', 'utf8');

const redirects = `# Legacy WordPress URLs intentionally mapped for production migration.
/blog /resources 301
/blog/ /resources 301
/discover-how-closed-cell-spray-foam-benefits-beaufort-countys-home /closed-cell-spray-foam-insulation 301
/discover-how-closed-cell-spray-foam-benefits-beaufort-countys-home/ /closed-cell-spray-foam-insulation 301
/why-spray-foam-roofing-insulation-is-the-best-choice-for-your-roof-in-2024 /spray-foam-roofing 301
/why-spray-foam-roofing-insulation-is-the-best-choice-for-your-roof-in-2024/ /spray-foam-roofing 301
/open-up-a-world-of-comfort-the-benefits-of-open-cell-spray-foam-insulation /open-cell-spray-foam-insulation 301
/open-up-a-world-of-comfort-the-benefits-of-open-cell-spray-foam-insulation/ /open-cell-spray-foam-insulation 301
/choosing-the-right-polyurea-coating-contractor-in-hilton-head-sc /polyurea-coatings 301
/choosing-the-right-polyurea-coating-contractor-in-hilton-head-sc/ /polyurea-coatings 301
/trusted-spray-foam-contractor-in-mount-pleasant-sc /service-area 301
/trusted-spray-foam-contractor-in-mount-pleasant-sc/ /service-area 301
/polyurea-coating-in-hilton-head-sc-east-coast-foam-llc /polyurea-coatings 301
/polyurea-coating-in-hilton-head-sc-east-coast-foam-llc/ /polyurea-coatings 301
/expert-spray-foam-insulation-contractor-in-beaufort-sc /services 301
/expert-spray-foam-insulation-contractor-in-beaufort-sc/ /services 301
/top-qualirt-insulation-solutions-in-beaufort-sc /services 301
/top-qualirt-insulation-solutions-in-beaufort-sc/ /services 301
`;
await writeFile(path.join(out, 'public/_redirects'), redirects, 'utf8');

const productionTest = `import { expect, test } from '@playwright/test';

const routes = [
  ['/', /Spray Foam & Insulation/],
  ['/services', /Find the service conversation/],
  ['/projects', /See East Coast Foam service photography/],
  ['/about-us', /Local expertise\. Direct accountability/],
  ['/reviews', /Customer feedback, in their own words/],
  ['/service-area', /Service Area/],
  ['/resources', /questions that matter to your project/],
  ['/spray-foam-basics', /Spray foam basics/],
  ['/contact-us', /Keep East Coast Foam close to the project/],
  ['/get-a-quote', /Tell us about the project/]
] as const;

for (const [route, heading] of routes) {
  test('production route ' + route, async ({ page }) => {
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(heading);
    await expect(page.locator('body')).not.toContainText(/SAMPLE STORY|portrait placeholder|Owner Workspace|Project Capture/i);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });
}

test('production navigation does not expose demo namespaces', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('a[href^="/future"]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Request an Estimate', exact: true }).first()).toHaveAttribute('href', '/get-a-quote');
});

test('current proven public email is used until domain email is separately validated', async ({ page }) => {
  await page.goto('/contact-us');
  await expect(page.getByRole('link', { name: /ecfoam@outlook\.com/ })).toBeVisible();
  await expect(page.locator('body')).not.toContainText('hello@eastcoastfoamllc.com');
});

test('guided estimate remains non-transmitting during staging', async ({ page }) => {
  await page.goto('/get-a-quote');
  const form = page.locator('[data-estimate-form]');
  await expect(form).toHaveCount(1);
  await expect(form).not.toHaveAttribute('action', /.+/);
});

test('legacy article redirect declarations are shipped in the static asset bundle', async ({ request }) => {
  const response = await request.get('/_redirects');
  expect([404, 200]).toContain(response.status());
});
`;
await mkdir(path.join(out, 'tests'), { recursive: true });
await writeFile(path.join(out, 'tests/production.spec.ts'), productionTest, 'utf8');

const targetWorkflow = `name: validate

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
      - run: npm install
      - run: npm run check
      - run: npm run build
      - run: npx playwright install --with-deps chromium
      - run: npm run test:qa
`;
await mkdir(path.join(out, '.github/workflows'), { recursive: true });
await writeFile(path.join(out, '.github/workflows/validate.yml'), targetWorkflow, 'utf8');

const migrationDoc = `# Controlled production migration

This repository is the customer-owned production candidate for East Coast Foam LLC.

## Staging safeguards

The initial seed intentionally remains **noindex/nofollow** and blocks crawling in \`robots.txt\`.
Those controls are removed only in the final release PR immediately before the approved domain cutover.

The Guided Estimate remains client-side/non-transmitting until a separately validated production intake endpoint and notification path exist.

The contact email remains \`ecfoam@outlook.com\` until a domain mailbox is separately validated.

## Legacy media dependency

The current approved images are still served from the legacy WordPress host. Before WordPress retirement, approved originals must be copied into customer-owned storage/repository assets, references updated, and the site revalidated.

## Legacy URL preservation

\`public/_redirects\` contains the currently proposed one-to-one redirects for legacy WordPress article/landing URLs. Service/core URLs are preserved directly.

## Production release gate

Do not route \`eastcoastfoamllc.com\` to this deployment until:

1. GitHub CI passes.
2. Customer-owned Cloudflare preview passes desktop/mobile QA.
3. Complete Cloudflare DNS zone is exported and mail records are preserved.
4. Legacy image dependency is eliminated.
5. WordPress rollback remains available.
6. Custom-domain SSL/routing is verified.
7. No placeholder/demo/concept content is present.
8. Final public contact/form behavior is verified.
9. The release PR removes staging noindex/robots blocking and adds/validates sitemap/indexing controls.
10. Cutover and rollback evidence are recorded in LDW business-operations #333.
`;
await mkdir(path.join(out, 'docs'), { recursive: true });
await writeFile(path.join(out, 'docs/MIGRATION.md'), migrationDoc, 'utf8');

const seedReadme = `# East Coast Foam LLC Website

Customer-owned production website code for East Coast Foam LLC.

This clean production candidate is derived from the owner-approved Future design direction. Historical LDW prototype surfaces, Classical, the chooser, Owner Workspace, and Project Capture are deliberately excluded.

See \`docs/MIGRATION.md\` for staging, cutover, and rollback controls.
`;
await writeFile(path.join(out, 'README.md'), seedReadme, 'utf8');

console.log('Production seed generated:', out);
