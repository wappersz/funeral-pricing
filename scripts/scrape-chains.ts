/**
 * Chain-site price scraper using Playwright (headless Chromium).
 *
 * Targets funeral director chains whose pricing pages are JS-rendered
 * and cannot be fetched with a simple HTTP request.
 *
 * Two scraping modes:
 *   - standardised: chain uses the same prices at all branches.
 *     Scrape one central pricing page, apply to every branch in the DB.
 *   - per-branch:   each branch has its own pricing page (e.g. Dignity).
 *     Scrape each branch URL from the DB individually.
 *
 * Usage:
 *   cd scripts
 *   DATABASE_URL=... ANTHROPIC_API_KEY=... npx tsx scrape-chains.ts
 *
 *   Or from project root with env loaded:
 *   source .env.local && npx tsx scripts/scrape-chains.ts
 */

import * as fs from "fs";
import * as path from "path";
import { chromium, type Browser, type Page } from "playwright";
import { neon } from "@neondatabase/serverless";
import Anthropic from "@anthropic-ai/sdk";

// ---------------------------------------------------------------------------
// Env
// ---------------------------------------------------------------------------

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("Set DATABASE_URL (source .env.local first)");
  process.exit(1);
}

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  console.error("Set ANTHROPIC_API_KEY (source .env.local first)");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

const PROGRESS_FILE = path.join(__dirname, "chain-progress.json");
const PAGE_TIMEOUT_MS = 30_000;
const BETWEEN_PAGES_MS = 2_000;
const MAX_TEXT_LENGTH = 5_000;

// ---------------------------------------------------------------------------
// Chain definitions
// ---------------------------------------------------------------------------

type StandardisedChain = {
  type: "standardised";
  name: string;
  domains: string[];         // match any DB website_url containing one of these
  pricingUrls: string[];     // try these in order until prices found
};

type PerBranchChain = {
  type: "per-branch";
  name: string;
  domains: string[];         // scrape the URL already stored in the DB
};

type Chain = StandardisedChain | PerBranchChain;

const CHAINS: Chain[] = [
  // -------------------------------------------------------------------------
  // Co-op Funeralcare — BLOCKED by Cloudflare bot protection.
  // coop.co.uk returns an iframe challenge page (891 bytes) to headless browsers.
  // Their prices are standardised — manual lookup required.
  // Visit: https://www.coop.co.uk/funeralcare/planning-a-funeral/our-costs
  // -------------------------------------------------------------------------
  // { type: "standardised", name: "Co-op Funeralcare", domains: ["coop.co.uk", "funeralcare.co.uk"], pricingUrls: [] },
  // -------------------------------------------------------------------------
  // Central England Co-op — regional, standardised pricing
  // -------------------------------------------------------------------------
  {
    type: "standardised",
    name: "Central England Co-op",
    domains: ["stores.centralengland.coop", "centralengland.coop"],
    pricingUrls: [
      "https://www.centralengland.coop/community/funeral-care/our-prices",
      "https://www.centralengland.coop/community/funeral-care/prices",
      "https://www.centralengland.coop/community/funeral-care/costs",
      "https://www.centralengland.coop/funerals/prices",
      "https://www.centralengland.coop/funerals/costs",
      "https://www.centralengland.coop/funeral-care/prices",
    ],
  },
  // -------------------------------------------------------------------------
  // East of England Co-op — regional, standardised pricing
  // -------------------------------------------------------------------------
  {
    type: "standardised",
    name: "East of England Co-op",
    domains: ["eastofengland.coop"],
    pricingUrls: [
      "https://www.eastofengland.coop/funerals/support/funeral-services-pricing",
      "https://www.eastofengland.coop/funerals/funeral-prices",
      "https://www.eastofengland.coop/funerals/prices",
      "https://www.eastofengland.coop/funerals/costs",
      "https://www.eastofengland.coop/funeral-services/prices",
    ],
  },
  // -------------------------------------------------------------------------
  // Lincolnshire Co-op — regional, standardised pricing
  // -------------------------------------------------------------------------
  {
    type: "standardised",
    name: "Lincolnshire Co-op",
    domains: ["lincolnshire.coop"],
    pricingUrls: [
      "https://www.lincolnshire.coop/funeral/costs",
      "https://www.lincolnshire.coop/funeral/our-costs",
      "https://www.lincolnshire.coop/funeral/prices",
      "https://www.lincolnshire.coop/funeral-services/prices",
      "https://www.lincolnshire.coop/funerals/prices",
    ],
  },
  // -------------------------------------------------------------------------
  // Heart of England Co-op — regional, standardised pricing
  // -------------------------------------------------------------------------
  {
    type: "standardised",
    name: "Heart of England Co-op",
    domains: ["heartofenglandcoopfunerals.co.uk"],
    pricingUrls: [
      "https://heartofenglandcoopfunerals.co.uk/prices",
      "https://heartofenglandcoopfunerals.co.uk/our-prices",
      "https://heartofenglandcoopfunerals.co.uk/costs",
      "https://heartofenglandcoopfunerals.co.uk/funeral-prices",
    ],
  },
  // -------------------------------------------------------------------------
  // Dignity — per-branch pricing
  // -------------------------------------------------------------------------
  {
    type: "per-branch",
    name: "Dignity",
    domains: ["dignityfunerals.co.uk"],
  },
];

// ---------------------------------------------------------------------------
// Progress tracking
// ---------------------------------------------------------------------------

interface Progress {
  // IDs already processed (per-branch or standardised branches already updated)
  processedIds: number[];
  // Domains where we already successfully scraped central pricing
  standardisedDone: string[];
}

function loadProgress(): Progress {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf-8"));
  }
  return { processedIds: [], standardisedDone: [] };
}

function saveProgress(p: Progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2));
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// Page text extraction
// ---------------------------------------------------------------------------

async function getPageText(page: Page, url: string): Promise<string | null> {
  try {
    await page.goto(url, {
      // "load" fires as soon as the DOM is ready — "networkidle" can hang
      // indefinitely on SPAs with long-polling / websockets.
      waitUntil: "load",
      timeout: PAGE_TIMEOUT_MS,
    });

    // Give JS-rendered content extra time to paint
    await page.waitForTimeout(2_500);

    const text = await page.evaluate(() => {
      document
        .querySelectorAll("script, style, noscript, iframe")
        .forEach((el) => el.remove());
      return document.body?.innerText ?? "";
    });

    if (!text) return null;

    // Some sites use a CSS font trick that renders each digit as a separate
    // character, producing output like "£ 1 2 8 5". Collapse those back.
    const collapsed = text.replace(
      /£\s*((?:\d\s*){2,})/g,
      (_m, digits) => "£" + digits.replace(/\s/g, "")
    );

    return collapsed.slice(0, MAX_TEXT_LENGTH);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Claude Haiku price extraction
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
        content: `You are extracting funeral prices from a UK funeral director's website.

Find these two prices:
1. Direct cremation (also called "unattended cremation" or "simple cremation") — cheapest cremation option, no ceremony
2. Standard funeral (also called "attended funeral", "simple funeral") — cheapest option that includes a service/ceremony

Rules:
- Always pick the CHEAPEST / most basic option for each category
- Prices are in GBP. Return the number only, no currency symbol
- If a price range is given (e.g. "from £995"), use the lowest number
- If you cannot find a price for a category, return null
- Do NOT guess or make up prices

Return ONLY valid JSON:
{"direct_cremation": <number|null>, "standard_funeral": <number|null>}

Website text:
${pageText}`,
      },
    ],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return { direct_cremation: null, standard_funeral: null };
    const parsed = JSON.parse(match[0]);
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

function hasPrices(p: PriceResult): boolean {
  return p.direct_cremation !== null || p.standard_funeral !== null;
}

function formatPrices(p: PriceResult): string {
  return `DC: ${p.direct_cremation != null ? `£${p.direct_cremation}` : "—"}  SF: ${p.standard_funeral != null ? `£${p.standard_funeral}` : "—"}`;
}

// ---------------------------------------------------------------------------
// Domain match helper
// ---------------------------------------------------------------------------

function matchesDomain(url: string, domains: string[]): boolean {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return domains.some((d) => hostname === d || hostname.endsWith("." + d));
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== Chain Price Scraper (Playwright) ===\n");

  const progress = loadProgress();
  const processedSet = new Set(progress.processedIds);
  const standardisedDoneSet = new Set(progress.standardisedDone);

  // Fetch all unprice entries with a website URL
  const allRows = await sql`
    SELECT id, name, city, website_url
    FROM funeral_homes
    WHERE website_url IS NOT NULL
      AND website_url != ''
      AND price_direct_cremation IS NULL
      AND price_standard_funeral IS NULL
    ORDER BY id
  `;

  const browser: Browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 },
  });
  const page: Page = await ctx.newPage();

  // Block images/fonts to speed up page loads
  await page.route("**/*", (route) => {
    const type = route.request().resourceType();
    if (["image", "font", "media"].includes(type)) {
      route.abort();
    } else {
      route.continue();
    }
  });

  let totalExtracted = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  for (const chain of CHAINS) {
    const chainRows = (allRows as any[]).filter(
      (r) => !processedSet.has(r.id) && matchesDomain(r.website_url, chain.domains)
    );

    if (chainRows.length === 0) {
      console.log(`\n[${chain.name}] No unprice entries — skipping`);
      continue;
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log(`${chain.name} — ${chainRows.length} unprice entries`);
    console.log("=".repeat(60));

    // ------------------------------------------------------------------
    // Standardised: scrape once, apply to all branches
    // ------------------------------------------------------------------
    if (chain.type === "standardised") {
      const domainKey = chain.domains[0];

      let prices: PriceResult = { direct_cremation: null, standard_funeral: null };

      if (standardisedDoneSet.has(domainKey)) {
        console.log(`  Already scraped central pricing — skipping fetch`);
        totalSkipped += chainRows.length;
        continue;
      }

      // Try each candidate pricing URL
      let foundUrl = "";
      for (const url of chain.pricingUrls) {
        process.stdout.write(`  Trying ${url} ... `);
        await sleep(BETWEEN_PAGES_MS);
        const text = await getPageText(page, url);

        if (!text) {
          console.log("FAILED (no content)");
          continue;
        }

        if (!text.includes("£")) {
          console.log("no £ found");
          continue;
        }

        prices = await extractPrices(text);
        if (hasPrices(prices)) {
          console.log(`FOUND — ${formatPrices(prices)}`);
          foundUrl = url;
          break;
        } else {
          console.log("no prices extracted");
        }
      }

      if (!hasPrices(prices)) {
        console.log(`  Could not find prices for ${chain.name}`);
        totalFailed += chainRows.length;
        // Mark domain as attempted so we don't retry endlessly
        progress.standardisedDone.push(domainKey);
        standardisedDoneSet.add(domainKey);
        saveProgress(progress);
        continue;
      }

      console.log(`\n  Applying ${formatPrices(prices)} to ${chainRows.length} branches...`);

      // Bulk update all branches for this chain
      for (const row of chainRows as any[]) {
        await sql`
          UPDATE funeral_homes
          SET price_direct_cremation = ${prices.direct_cremation},
              price_standard_funeral = ${prices.standard_funeral}
          WHERE id = ${row.id}
        `;
        progress.processedIds.push(row.id);
        processedSet.add(row.id);
        totalExtracted++;
      }

      progress.standardisedDone.push(domainKey);
      standardisedDoneSet.add(domainKey);
      saveProgress(progress);

      console.log(`  Done. Updated ${chainRows.length} branches from ${foundUrl}`);
    }

    // ------------------------------------------------------------------
    // Per-branch: scrape each URL individually
    // ------------------------------------------------------------------
    if (chain.type === "per-branch") {
      for (let i = 0; i < chainRows.length; i++) {
        const row = chainRows[i] as any;
        process.stdout.write(
          `  [${i + 1}/${chainRows.length}] ${row.name}, ${row.city} ... `
        );

        await sleep(BETWEEN_PAGES_MS);
        const text = await getPageText(page, row.website_url);

        if (!text) {
          console.log("FAILED (no content)");
          totalFailed++;
          progress.processedIds.push(row.id);
          processedSet.add(row.id);
          if (i % 10 === 0) saveProgress(progress);
          continue;
        }

        const prices = await extractPrices(text);

        if (hasPrices(prices)) {
          await sql`
            UPDATE funeral_homes
            SET price_direct_cremation = ${prices.direct_cremation},
                price_standard_funeral = ${prices.standard_funeral}
            WHERE id = ${row.id}
          `;
          console.log(formatPrices(prices));
          totalExtracted++;
        } else {
          console.log("no prices found");
          totalFailed++;
        }

        progress.processedIds.push(row.id);
        processedSet.add(row.id);
        if (i % 10 === 0) saveProgress(progress);
      }

      saveProgress(progress);
    }
  }

  await browser.close();
  saveProgress(progress);

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Done.`);
  console.log(`  Extracted: ${totalExtracted}`);
  console.log(`  Failed:    ${totalFailed}`);
  console.log(`  Skipped:   ${totalSkipped}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
