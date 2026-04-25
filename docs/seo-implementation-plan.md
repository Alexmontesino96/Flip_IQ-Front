# FlipIQ Frontend SEO Plan

## Goal

Grow qualified organic traffic without polluting the index with app flows,
private pages, or transient results.

## Principles

1. Index only pages that can rank and convert.
2. Keep app flows, dashboards, checkout, and result pages out of the index.
3. Improve crawlability before adding more content.
4. Use server-rendered metadata for every indexable route.
5. Treat SEO and performance as the same system.

## Phase 1 — Indexation Architecture

### Scope

- Define which routes are indexable.
- Apply `noindex` to utility, account, checkout, and ephemeral result routes.
- Centralize noindex metadata in a reusable helper.

### Indexable routes

- `/`
- `/free`

### Non-indexable routes

- `/search`
- `/scan`
- `/result`
- `/home`
- `/history`
- `/watchlist`
- `/login`
- `/register`
- `/setup`
- `/plans`
- `/plans/success`
- `/checkout/account`
- `/shared/[token]`

### Acceptance criteria

- Non-indexable routes return metadata with `robots: noindex, nofollow`.
- Public routes remain indexable.
- No app flow relies on client-only metadata hacks.

## Phase 2 — Technical SEO Foundation

### Scope

- Add `metadataBase`, canonical defaults, and title templating.
- Add `robots.ts`.
- Add `sitemap.ts`.
- Add default Open Graph image generation.
- Create `src/lib/seo.ts` helpers for route metadata.

### Acceptance criteria

- Valid robots and sitemap endpoints exist.
- Every indexable page has canonical metadata.
- Social previews use branded OG defaults.

## Phase 3 — Public Landing Optimization

### Scope

- Split the current landing into server-rendered content plus client islands.
- Reduce client-only rendering on the homepage.
- Strengthen semantic structure: one clear H1, section headings, internal links.
- Replace placeholder footer links with real destinations.

### Acceptance criteria

- Core landing copy is present in SSR HTML.
- Homepage remains visually equivalent.
- Footer and nav expose real crawlable links.

## Phase 4 — Free Tool SEO Landing

### Scope

- Turn `/free` into a search-intent landing page around the calculator.
- Add supporting copy, FAQs, benefits, and marketplace coverage.
- Keep the calculator as the primary experience on the page.

### Target intent

- free flip profit calculator
- eBay reseller profit calculator
- Amazon flip calculator
- max buy price calculator

### Acceptance criteria

- `/free` has strong metadata, visible H1, support copy, and FAQ schema.
- Tool remains the first useful interaction.

## Phase 5 — Structured Data

### Scope

- Add JSON-LD to `/` and `/free`.
- Start with `Organization`, `WebSite`, and `SoftwareApplication`.
- Add `FAQPage` only when FAQ content exists on-page.

### Acceptance criteria

- Structured data matches visible content.
- No fabricated reviews, ratings, or unsupported claims.

## Phase 6 — Content Cluster

### Scope

- Add a small set of evergreen educational pages.
- Build internal links from homepage and tool pages.

### Candidate pages

- how to calculate max buy price
- eBay fee calculator guide
- Amazon vs eBay for resellers
- how to read sell-through rate
- best items to resell

### Acceptance criteria

- First content cluster supports commercial-intent and educational queries.
- Pages are internally linked from indexable hubs.

## Phase 7 — International SEO

### Scope

- Decide between:
  - English-only root, or
  - dedicated `/en` and `/es` routes with hreflang
- Remove mixed-language single-URL ambiguity.

### Acceptance criteria

- Each indexable URL serves one primary language.
- `html lang` matches visible content.

## Phase 8 — Performance for SEO

### Scope

- Reduce homepage JavaScript.
- Lazy-load non-critical animation.
- Review image loading and font usage.
- Improve first render for crawlers and users.

### Acceptance criteria

- Public routes keep fast first paint and stable layout.
- Client hydration is reduced on the homepage.

## Execution Order

1. Phase 1 — Indexation architecture
2. Phase 2 — Technical SEO foundation
3. Phase 3 — Public landing optimization
4. Phase 4 — Free tool landing
5. Phase 5 — Structured data
6. Phase 6 — Content cluster
7. Phase 7 — International SEO
8. Phase 8 — Performance
