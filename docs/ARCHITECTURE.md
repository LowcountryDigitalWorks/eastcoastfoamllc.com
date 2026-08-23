# Architecture and migration notes

## Current demo topology

One static Astro build produces three entry points:

- `/` — private demo chooser
- `/classical` — low-risk migration concept retaining the existing site's general green/black visual language and content hierarchy
- `/future` — modern redesign and digital-operations concept

The demos share structured business, service, and project data under `src/data/`.

## Cloudflare

The current project is intentionally static-only. `wrangler.jsonc` points Workers Static Assets at `./dist`, so no Worker script or Astro Cloudflare adapter is required yet.

A future estimate endpoint, Facebook import job, or R2-backed media workflow can introduce Worker code only when a demonstrated need exists.

## Search indexing

Demo output contains `noindex,nofollow` metadata and `public/robots.txt` blocks crawling. Remove these controls only through an explicit production-release decision.

## CMS

`.pages.yml` provides an initial Pages CMS proof for business details, services, and Recent Work. The repo remains the content source of truth. Do not build an LDW CMS unless Pages CMS or another free Git-backed option demonstrates a material limitation.

## Production ownership target

1. Develop/demo under LowcountryDigitalWorks.
2. Obtain Casey approval.
3. Create an East Coast Foam-owned GitHub organization and Cloudflare account.
4. Transfer the repository to the customer organization.
5. Give LDW delegated repository/Cloudflare administrative access.
6. Deploy production into the customer-owned Cloudflare account.
7. Inventory existing URLs, DNS, mail records, analytics, and owned media before cutover.
8. Move authoritative DNS only after validation; leave domain registrar migration and email migration as separate controlled changes.
9. Retire WordPress hosting only after production validation and rollback confidence.

## Systems boundary

QuickBooks remains the system of record for accounting, estimates, invoices, payments, and any job/project capability Casey is already using successfully. Future LDW software may provide operational visibility or automation around that boundary, but should not create a second accounting ledger.
