# Funeral Pricing

## Domain
https://funeralpricing.co.uk/

## GSC Property
`sc-domain:funeralpricing.co.uk`

## Platform
Next.js (deployed on Vercel)

## Work
- SEO (content, meta, schema)

## Notes
- Funeral price comparison site
- Next.js app in this folder — use `npm run dev` to run locally
- Database: Neon PostgreSQL

## App Structure
- `src/app/[city]/page.tsx` — City landing pages (main SEO pages)
- `src/app/funeral-directors/[id]/page.tsx` — Individual funeral director pages
- `src/app/funeral-costs-by-county/[county]/page.tsx` — County comparison pages
- `src/app/areas/page.tsx` — Full directory (A-Z towns)
- `src/app/search/page.tsx` — Postcode search (client-side)
- `src/app/blog/` — Blog posts
- `src/components/Header.tsx` — Shared header
- `src/data/town-content.ts` — SEO copy per town
- `src/lib/search.ts` — DB queries (towns, nearby search)
- `src/lib/counties.ts` — County aggregation queries

## GSC
- MCP server connected — use `mcp__gscServer__*` tools
- Property: `sc-domain:funeralpricing.co.uk`

## Known Issues / Backlog
- Scraper: chain sites (Co-op, Dignity) need root domain stripping — see ~/Desktop/Projects/funeral-pricing/scripts/
