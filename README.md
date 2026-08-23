# East Coast Foam LLC Website Modernization

Customer website modernization and digital-operations proof for **East Coast Foam LLC**.

## Purpose

This repository starts as an LDW-owned development workspace for two non-indexed demonstrations of East Coast Foam's future web presence:

1. **Classical** — a clean, fast reimplementation of the current production site and information architecture, intended to make eventual cutover low-risk.
2. **Future** — a modern redesign demonstrating a stronger customer experience, guided estimate intake, recent-work storytelling, and future operational integrations.

Both demos will use a shared business/content model so phone numbers, services, service areas, project content, and other business facts do not have to be maintained twice.

## Ownership model

- Prototype/development: `LowcountryDigitalWorks/eastcoastfoamllc.com`
- Production target: customer-owned GitHub organization and customer-owned Cloudflare account
- LDW should retain delegated administrative access for managed-service work.
- The current GoDaddy/WordPress production site and DNS are **out of scope until an explicitly approved cutover**.

## Planned stack

- Astro + TypeScript
- Cloudflare Workers Static Assets
- Shared structured content
- Git-backed CMS proof (Pages CMS first; do not build a custom LDW CMS without demonstrated need)
- Cloudflare Turnstile + Worker endpoint for future estimate intake
- Cloudflare Web Analytics
- Future Cloudflare R2 media storage if project-photo volume justifies it

## Demo identities

Public-facing demo copy may show future professional addresses such as:

- `hello@eastcoastfoamllc.com`
- `quotes@eastcoastfoamllc.com`

These are presentation placeholders until East Coast Foam configures production domain email. Demo forms must not assume those mailboxes already exist.

## Guardrails

- Both demos remain `noindex` until explicitly authorized for production.
- Do not modify the live GoDaddy WordPress deployment or authoritative DNS during demo work.
- Preserve existing public URLs wherever practical during Classical migration to reduce SEO/cutover risk.
- QuickBooks remains the accounting/invoicing/payment system of record; future integrations should augment it rather than duplicate it.
- Facebook/project-photo automation should import/cache approved project media rather than make the production website depend on live Meta requests at page-render time.

## Product direction

The website is the first deliverable. Future capability should be driven by observed East Coast Foam workflow needs, with likely areas including lead intake/follow-up, estimate status, scheduling, project/crew visibility, recent-work publishing, reviews/reputation, and light operational dashboards.
