# Current East Coast Foam production site inventory

This inventory is a migration baseline captured from the current production WordPress site. It is intentionally not a content-approval record.

## Production boundary

Current production:

- Website: `https://eastcoastfoamllc.com/`
- Platform: WordPress / GoDaddy-hosted environment
- Public phone observed: `(843) 263-4933`
- Public email observed: `ecfoam@outlook.com`
- Facebook: `https://www.facebook.com/foamit247`

Do not modify production hosting, authoritative DNS, mail records, or registrar state during demo development.

## Confirmed primary URLs

Preserve these URL paths at production cutover wherever practical:

| Current path | Purpose | Migration intent |
| --- | --- | --- |
| `/` | Home | Preserve |
| `/about-us/` | About | Preserve |
| `/services/` | Services index | Preserve |
| `/open-cell-spray-foam-insulation/` | Open-cell spray foam | Preserve |
| `/closed-cell-spray-foam-insulation/` | Closed-cell spray foam | Preserve |
| `/polyurea-coatings/` | Polyurea coatings | Preserve |
| `/fiberglass-batt-insulation/` | Fiberglass batt insulation | Preserve |
| `/insulation-removal-services/` | Insulation removal | Preserve |
| `/spray-foam-roofing/` | Roofing foam | Preserve |
| `/silicone-roof-coating/` | Silicone/acrylic roof coatings | Preserve |
| `/blog/` | Blog | Preserve or redirect intentionally after content review |
| `/contact-us/` | Contact / quote | Preserve |

## Before production cutover

The list above is not a substitute for a complete crawl. Before production migration, capture and reconcile:

- full XML sitemap(s) and crawlable URL inventory;
- individual blog/article URLs;
- indexed service-area or landing pages;
- canonical URLs, page titles, descriptions, headings, and structured data;
- current redirects and 404 behavior;
- image URLs and owner-approved reusable media;
- analytics/search-console configuration where accessible;
- form destinations and current lead-routing behavior;
- DNS records including MX/SPF/DKIM/DMARC and third-party verification records;
- Google Business Profile / review links and other local citations;
- externally linked URLs that should receive explicit redirects if their path changes.

## Content reuse boundary

Do not assume WordPress theme, plugin, stock-photo, font, or third-party design licenses transfer with the business content. Reimplement the Classical experience using LDW-owned code and only reuse logos, photography, copy, reviews, certifications, and other assets after confirming East Coast Foam owns or is authorized to reuse them.

## SEO cutover rule

The Classical production migration should favor URL preservation. When a URL cannot be preserved, create a deliberate one-to-one permanent redirect to the closest replacement and validate it before retiring WordPress.
