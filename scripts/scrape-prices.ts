/**
 * Scrape funeral home websites and extract pricing using Claude Haiku.
 *
 * Usage:
 *   npx tsx scripts/scrape-prices.ts
 *
 * Required env (from .env.local):
 *   ANTHROPIC_API_KEY — Anthropic API key
 *   DATABASE_URL      — Neon connection string
 *
 * The script:
 *   1. Queries DB for funeral homes with a website but no prices
 *   2. For chain sites (Co-op, Dignity, etc.), strips to root domain and checks
 *      pricing pages there (CMA law requires prices to be displayed publicly)
 *   3. Deduplicates chain domains — fetches each root domain only once, then
 *      reuses the result for all locations in that chain
 *   4. Tries an expanded list of pricing subpaths
 *   5. Sends page text to Claude Haiku to extract prices
 *   6. Updates DB with extracted prices
 *   7. Tracks progress in prices-progress.json for resumability
 */

import * as fs from "fs";
import * as path from "path";
import { neon } from "@neondatabase/serverless";
import Anthropic from "@anthropic-ai/sdk";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("Set DATABASE_URL env variable (or source .env.local)");
  process.exit(1);
}

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  console.error("Set ANTHROPIC_API_KEY env variable");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

const FETCH_DELAY_MS = 300;
const MAX_TEXT_LENGTH = 4000;
const PROGRESS_FILE = path.join(__dirname, "prices-progress.json");

// ---------------------------------------------------------------------------
// Chain root domain mapping
//
// Location-specific URLs for these chains won't have prices — CMA requires
// prices to be on the root site. Map the location hostname/pattern to the
// root pricing domain we should scrape instead.
//
// A value of null means "skip entirely" (directory/aggregator sites).
// ---------------------------------------------------------------------------

const CHAIN_ROOTS: Record<string, string | null> = {
  // Central Co-op — location pages on stores.centralengland.coop
  "stores.centralengland.coop": "https://www.centralengland.coop",
  "centralengland.coop": "https://www.centralengland.coop",
  // Heart of England Co-op
  "heartofenglandcoopfunerals.co.uk":
    "https://heartofenglandcoopfunerals.co.uk",
  // East of England Co-op
  "eastofengland.coop": "https://www.eastofengland.coop",
  // National Co-op Funeralcare (coop.co.uk/funeralcare/...)
  "coop.co.uk": "https://www.coop.co.uk",
  // Dignity Funerals
  "dignityfunerals.co.uk": "https://www.dignityfunerals.co.uk",
  // Directory / aggregator sites — skip entirely
  "funeral-notices.co.uk": null,
  "yell.com": null,
  "facebook.com": null,
  "google.com": null,
};

// URL path segments that indicate a location-specific page.
// If a URL contains any of these, strip it back to the root domain.
const LOCATION_PATH_PATTERNS = [
  "/locations/",
  "/funeral-homes/",
  "/funeral-homes-locations/",
  "/funeral-home/",
  "/our-locations/",
  "/find-us/",
  "/store/funerals/",
  "/funeralcare/funeral-directors/",
  "/crematoria-and-cemeteries/",
];

// ---------------------------------------------------------------------------
// Pricing subpaths — tried on the root domain in order
// ---------------------------------------------------------------------------

const PRICING_SUBPATHS = [
  // CMA-mandated standardised price list (UK legal requirement)
  "/standardised-price-list",
  "/standardised-price-list/",
  "/standardised-prices",
  "/our-standardised-price-list",
  "/cma-price-list",
  "/price-information",
  // Common pricing page slugs
  "/prices",
  "/price-list",
  "/pricing",
  "/our-prices",
  "/fees",
  "/our-fees",
  "/costs",
  "/our-costs",
  "/funeral-costs",
  "/funeral-prices",
  "/price-guide",
  "/funeral-price-guide",
  "/cost-of-a-funeral",
  // Under /services/
  "/services/prices",
  "/services/pricing",
  "/services/our-prices",
  "/services/funeral-costs",
  // Under /about/
  "/about/prices",
  "/about/funeral-costs",
  "/about-us/prices",
  // Funeral planning sections
  "/funeral-planning/costs",
  "/funeral-planning/prices",
  "/funeral-planning/funeral-costs",
  "/planning-a-funeral/costs",
  "/planning-a-funeral/prices",
  "/planning-a-funeral/our-costs",
  "/planning/costs",
  // Funeralcare/funeral-services prefixes
  "/funeralcare/prices",
  "/funeralcare/costs",
  "/funeralcare/planning-a-funeral/our-costs",
  "/funeralcare/planning-a-funeral/costs-and-choices",
  "/funeral-services/prices",
  "/funeral-services/costs",
  "/funeral-care/prices",
  "/funerals/prices",
  "/funerals/costs",
];

// ---------------------------------------------------------------------------
// Resolve the pricing root URL for a given website URL
//
// Returns:
//   - null            → skip this site entirely (directory / aggregator)
//   - root URL string → fetch pricing from this domain instead of the given URL
//     (may be the same as the input for independent sites)
// ---------------------------------------------------------------------------

function getPricingRootUrl(websiteUrl: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(websiteUrl);
  } catch {
    return websiteUrl;
  }

  const hostname = parsed.hostname.replace(/^www\./, "");

  // 1. Check known chain/directory domains
  for (const [pattern, root] of Object.entries(CHAIN_ROOTS)) {
    const patternClean = pattern.replace(/^www\./, "");
    if (hostname === patternClean || hostname.endsWith("." + patternClean)) {
      return root; // null = skip, string = use this root
    }
  }

  // 2. Check if the URL path looks like a location-specific page.
  //    If so, strip to root domain — the chain's pricing will be there.
  const pathname = parsed.pathname;
  for (const pattern of LOCATION_PATH_PATTERNS) {
    if (pathname.includes(pattern)) {
      return `${parsed.protocol}//${parsed.host}`;
    }
  }

  // 3. Independent site — use URL as given
  return websiteUrl;
}

// Cache key = hostname of the pricing root domain
function getCacheKey(pricingRootUrl: string): string {
  try {
    return new URL(pricingRootUrl).hostname;
  } catch {
    return pricingRootUrl;
  }
}

// ---------------------------------------------------------------------------
// Progress tracking
// ---------------------------------------------------------------------------

interface Progress {
  processedIds: number[];
}

function loadProgress(): Progress {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf-8"));
  }
  return { processedIds: [] };
}

function saveProgress(p: Progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2));
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// HTML → text
// ---------------------------------------------------------------------------

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&pound;/g, "£")
    .replace(/&nbsp;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .trim();
}

// ---------------------------------------------------------------------------
// Fetch a URL safely
// ---------------------------------------------------------------------------

async function fetchPage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; FuneralPriceBot/1.0; +https://funeralpricing.co.uk)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return null;

    return await res.text();
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// French-language detection (skip non-UK sites)
// ---------------------------------------------------------------------------

function isFrench(url: string, text?: string): boolean {
  if (/\.fr(\/|$)/i.test(url)) return true;
  if (!text) return false;
  const frenchTerms = [
    "pompes funèbres",
    "obsèques",
    "funéraire",
    "crémation",
    "inhumation",
    "cérémonie",
    "décès",
    "défunt",
  ];
  const lower = text.toLowerCase();
  return frenchTerms.filter((t) => lower.includes(t)).length >= 2;
}

// ---------------------------------------------------------------------------
// Fetch page text, trying the root pricing domain and all subpaths
//
// pricingRootUrl: the resolved root to scrape (may differ from original URL
// for chain sites). The original URL's path is ignored for chain sites.
// ---------------------------------------------------------------------------

async function getPageTextWithPrices(
  pricingRootUrl: string
): Promise<{ text: string; french: false } | { french: true } | null> {
  const base = pricingRootUrl.replace(/\/+$/, "");

  if (isFrench(base)) return { french: true };

  // Try homepage first
  const homeHtml = await fetchPage(base);
  let homeText: string | null = null;

  if (homeHtml) {
    homeText = htmlToText(homeHtml);

    if (isFrench(base, homeText)) return { french: true };

    if (homeText.includes("£")) {
      return { text: homeText.slice(0, MAX_TEXT_LENGTH), french: false };
    }
  }

  // Try all pricing subpaths
  for (const subpath of PRICING_SUBPATHS) {
    await sleep(FETCH_DELAY_MS);
    const html = await fetchPage(base + subpath);
    if (html) {
      const text = htmlToText(html);
      if (text.includes("£")) {
        return { text: text.slice(0, MAX_TEXT_LENGTH), french: false };
      }
    }
  }

  // Send homepage text anyway — Haiku may spot numbers without £ symbol
  if (homeText) {
    return { text: homeText.slice(0, MAX_TEXT_LENGTH), french: false };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Claude Haiku — extract prices from page text
// ---------------------------------------------------------------------------

interface PriceResult {
  direct_cremation: number | null;
  standard_funeral: number | null;
}

async function extractPrices(pageText: string): Promise<PriceResult> {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: `You are extracting funeral prices from a UK funeral director's website text.

Find these two prices:
1. **Direct cremation** (also called "unattended cremation" or "simple cremation") — the cheapest cremation option with no ceremony/service
2. **Standard funeral** (also called "attended funeral", "simple funeral", "basic funeral") — the cheapest attended/traditional funeral option that includes a ceremony/service

Rules:
- Always pick the CHEAPEST / most basic option for each category
- Prices are in GBP (£). Return the number only, no currency symbol
- If a price range is given (e.g. "from £995"), use the lowest number
- If you cannot find a price for a category, return null
- Do NOT guess or make up prices — only extract what's explicitly stated

Return ONLY valid JSON, no other text:
{"direct_cremation": <number|null>, "standard_funeral": <number|null>}

Website text:
${pageText}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { direct_cremation: null, standard_funeral: null };

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      direct_cremation:
        typeof parsed.direct_cremation === "number"
          ? Math.round(parsed.direct_cremation)
          : null,
      standard_funeral:
        typeof parsed.standard_funeral === "number"
          ? Math.round(parsed.standard_funeral)
          : null,
    };
  } catch {
    return { direct_cremation: null, standard_funeral: null };
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== Funeral Home Price Scraper (v2) ===\n");
  console.log("Changes: chain root domain lookup + deduplication + more subpaths\n");

  // Load progress
  const progress = loadProgress();
  const processedSet = new Set(progress.processedIds);

  // Domain deduplication cache: hostname → PriceResult | null
  // null = fetched but found no prices
  const domainPriceCache = new Map<string, PriceResult | null>();

  // Query funeral homes with website but no prices
  const rows = await sql`
    SELECT id, name, website_url
    FROM funeral_homes
    WHERE website_url IS NOT NULL
      AND website_url != ''
      AND price_direct_cremation IS NULL
      AND price_standard_funeral IS NULL
    ORDER BY id
  `;

  const toProcess = rows.filter((r: any) => !processedSet.has(r.id));

  console.log(`Total with website & no prices: ${rows.length}`);
  console.log(`Already processed: ${processedSet.size}`);
  console.log(`Remaining: ${toProcess.length}\n`);

  if (toProcess.length === 0) {
    console.log("Nothing to do!");
    return;
  }

  let extracted = 0;
  let fromCache = 0;
  let failed = 0;
  let noData = 0;
  let skippedFrench = 0;
  let skippedDirectory = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const row = toProcess[i] as any;
    const { id, name, website_url } = row;

    process.stdout.write(
      `  [${i + 1}/${toProcess.length}] ${name} (${website_url}) ... `
    );

    // Resolve the pricing root URL (strips to chain root if needed)
    let pricingRootUrl: string | null;
    try {
      pricingRootUrl = getPricingRootUrl(website_url);
    } catch {
      pricingRootUrl = website_url;
    }

    // Skip directory/aggregator sites
    if (pricingRootUrl === null) {
      console.log("SKIPPED (directory/aggregator site)");
      skippedDirectory++;
      progress.processedIds.push(id);
      processedSet.add(id);
      if (i % 20 === 0) saveProgress(progress);
      continue;
    }

    const isChain = pricingRootUrl !== website_url;
    const cacheKey = getCacheKey(pricingRootUrl);

    // --- Domain cache hit ---
    if (domainPriceCache.has(cacheKey)) {
      const cached = domainPriceCache.get(cacheKey) ?? null;
      if (cached && (cached.direct_cremation !== null || cached.standard_funeral !== null)) {
        await sql`
          UPDATE funeral_homes
          SET price_direct_cremation = ${cached.direct_cremation},
              price_standard_funeral = ${cached.standard_funeral}
          WHERE id = ${id}
        `;
        console.log(
          `DC: ${cached.direct_cremation ?? "—"} | SF: ${cached.standard_funeral ?? "—"} (cached)`
        );
        extracted++;
        fromCache++;
      } else {
        console.log("no prices found (cached)");
        noData++;
      }
      progress.processedIds.push(id);
      processedSet.add(id);
      if (i % 20 === 0) saveProgress(progress);
      continue;
    }

    // --- Fetch & extract ---
    if (isChain) {
      process.stdout.write(`[→ ${pricingRootUrl}] `);
    }

    const result = await getPageTextWithPrices(pricingRootUrl);

    if (result && "french" in result && result.french) {
      console.log("SKIPPED (French)");
      skippedFrench++;
      domainPriceCache.set(cacheKey, null);
      progress.processedIds.push(id);
      processedSet.add(id);
      if (i % 20 === 0) saveProgress(progress);
      await sleep(FETCH_DELAY_MS);
      continue;
    }

    const pageText = result && !result.french ? result.text : null;

    if (!pageText) {
      console.log("FAILED (could not fetch)");
      failed++;
      domainPriceCache.set(cacheKey, null);
      progress.processedIds.push(id);
      processedSet.add(id);
      if (i % 20 === 0) saveProgress(progress);
      await sleep(FETCH_DELAY_MS);
      continue;
    }

    const prices = await extractPrices(pageText);

    // Cache result for this domain
    domainPriceCache.set(cacheKey, prices);

    if (prices.direct_cremation !== null || prices.standard_funeral !== null) {
      await sql`
        UPDATE funeral_homes
        SET price_direct_cremation = ${prices.direct_cremation},
            price_standard_funeral = ${prices.standard_funeral}
        WHERE id = ${id}
      `;
      console.log(
        `DC: ${prices.direct_cremation ?? "—"} | SF: ${prices.standard_funeral ?? "—"}`
      );
      extracted++;
    } else {
      console.log("no prices found");
      noData++;
    }

    progress.processedIds.push(id);
    processedSet.add(id);

    if (i % 20 === 0) saveProgress(progress);
    await sleep(FETCH_DELAY_MS);
  }

  saveProgress(progress);

  console.log(`\n=== Done ===`);
  console.log(`Extracted prices:      ${extracted} (${fromCache} from domain cache)`);
  console.log(`No prices found:       ${noData}`);
  console.log(`Fetch failed:          ${failed}`);
  console.log(`Skipped (French):      ${skippedFrench}`);
  console.log(`Skipped (directories): ${skippedDirectory}`);
  console.log(`Total processed:       ${toProcess.length}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
