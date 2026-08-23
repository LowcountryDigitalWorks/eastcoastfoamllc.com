# Cloudflare demo deployment

This project is a static Astro build deployed with Cloudflare Workers Static Assets.

## Initial deployment

Create/import one Cloudflare Worker project from the GitHub repository.

Use these values:

| Setting | Value |
| --- | --- |
| Repository | `LowcountryDigitalWorks/eastcoastfoamllc.com` |
| Worker name | `eastcoastfoam-demo` |
| Production branch | `main` |
| Root directory | repository root / blank |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Static asset directory | `./dist` (defined in `wrangler.jsonc`) |
| Environment variables | none initially |
| Bindings | none initially |

The Cloudflare Worker/project name must remain aligned with the `name` property in `wrangler.jsonc` unless both are changed together.

## Demo routes

After deployment, the generated `workers.dev` hostname should expose:

- `/` — concept chooser
- `/classical` — Classical migration concept
- `/future` — Modern / Future concept

All demo pages contain `noindex` directives and the generated `robots.txt` blocks crawling.

## Preview branches

If Cloudflare Git-integrated preview builds are enabled, use non-production branch builds for PR/branch previews. The production deployment should continue to follow `main`.

## No bindings yet

Do not create KV, D1, R2, Queues, service bindings, or secrets for the initial static demo. Add runtime services only when an implemented feature needs them.

Likely future bindings, if approved:

- Turnstile secret/environment configuration for live estimate intake;
- email/notification configuration for validated lead delivery;
- R2 bucket for project media when repo-hosted media becomes inappropriate;
- scheduled Worker trigger for approved Facebook/project-content synchronization.

None are required for the first demo.

## Custom domains

Do not point `eastcoastfoamllc.com` at this demo Worker. Keep the generated `workers.dev` hostname or an LDW-owned demo subdomain until Casey approves a production release.

Production should ultimately deploy into an East Coast Foam-owned Cloudflare account. The customer-owned production deployment and DNS cutover are separate from this LDW demo environment.

## Production cutover guardrail

Before changing authoritative DNS, complete the current-site URL/content/DNS inventory, deploy and validate the customer-owned production Worker, confirm email records are preserved, define rollback, and only then perform a controlled cutover. Domain-registrar and mailbox migrations should be separate changes rather than bundled into the website cutover.
