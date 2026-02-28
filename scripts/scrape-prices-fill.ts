/**
 * Second-pass scraper: fill in whichever price is missing for homes
 * that already have one price but not the other.
 *
 * Usage:
 *   npx tsx scripts/scrape-prices-fill.ts
 *
 * Required env (from .env.local):
 *   ANTHROPIC_API_KEY
 *   DATABASE_URL
 */

import * as fs from "fs";
import * as path from "path";
import { neon } from "@neondatabase/serverless";
import Anthropic from "@anthropic-ai/sdk";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error("Set DATABASE_URL"); process.exit(1); }
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) { console.error("Set ANTHROPIC_API_KEY"); process.exit(1); }

const sql = neon(DATABASE_URL);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

const FETCH_DELAY_MS = 200;
const MAX_TEXT_LENGTH = 4000;
const PROGRESS_FILE = path.join(__dirname, "prices-fill-progress.json");

const PRICING_SUBPATHS = [
  // CMA-mandated standardised price list (UK legal requirement)
  "/standardised-price-list",
  "/standardised-price-list/",
  "/standardised-prices",
  "/our-standardised-price-list",
  "/cma-price-list",
  "/price-information",
  // Common pricing pages
  "/prices", "/price-list", "/pricing", "/fees", "/our-fees",
  "/funeral-costs", "/our-prices", "/funeral-prices",
  "/services/prices", "/about/prices", "/services", "/packages", "/costs",
];

interface Progress { processedIds: number[]; }
function loadProgress(): Progress {
  if (fs.existsSync(PROGRESS_FILE)) return JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf-8"));
  return { processedIds: [] };
}
function saveProgress(p: Progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2));
}
function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&pound;/g, "£").replace(/&nbsp;/g, " ")
    .replace(/[ \t]+/g, " ").replace(/\n\s*\n/g, "\n").trim();
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FuneralPriceBot/1.0; +https://funeralpricing.co.uk)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return null;
    return await res.text();
  } catch { return null; }
}

async function getPageText(websiteUrl: string): Promise<string | null> {
  let baseUrl = websiteUrl.trim();
  if (!baseUrl.startsWith("http")) baseUrl = "https://" + baseUrl;
  baseUrl = baseUrl.replace(/\/+$/, "");

  const homeHtml = await fetchPage(baseUrl);
  if (homeHtml) {
    const homeText = htmlToText(homeHtml);
    if (homeText.includes("£")) return homeText.slice(0, MAX_TEXT_LENGTH);
  }

  for (const subpath of PRICING_SUBPATHS) {
    await sleep(FETCH_DELAY_MS);
    const html = await fetchPage(baseUrl + subpath);
    if (html) {
      const text = htmlToText(html);
      if (text.includes("£")) return text.slice(0, MAX_TEXT_LENGTH);
    }
  }

  if (homeHtml) return htmlToText(homeHtml).slice(0, MAX_TEXT_LENGTH);
  return null;
}

interface PriceResult {
  direct_cremation: number | null;
  standard_funeral: number | null;
}

async function extractPrices(pageText: string): Promise<PriceResult> {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    messages: [{
      role: "user",
      content: `You are extracting funeral prices from a UK funeral director's website text.

Find these two prices:
1. **Direct cremation** (also called "unattended cremation" or "simple cremation") — cheapest cremation with no ceremony
2. **Standard funeral** (also called "attended funeral", "simple funeral", "basic funeral") — cheapest attended funeral with a ceremony

Rules:
- Always pick the CHEAPEST / most basic option for each category
- Prices are in GBP (£). Return the number only, no currency symbol
- If a price range is given (e.g. "from £995"), use the lowest number
- If you cannot find a price for a category, return null
- Do NOT guess or make up prices — only extract what's explicitly stated

Return ONLY valid JSON:
{"direct_cremation": <number|null>, "standard_funeral": <number|null>}

Website text:
${pageText}`,
    }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { direct_cremation: null, standard_funeral: null };
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      direct_cremation: typeof parsed.direct_cremation === "number" ? Math.round(parsed.direct_cremation) : null,
      standard_funeral: typeof parsed.standard_funeral === "number" ? Math.round(parsed.standard_funeral) : null,
    };
  } catch {
    return { direct_cremation: null, standard_funeral: null };
  }
}

async function main() {
  console.log("=== Fill Missing Prices ===\n");

  const progress = loadProgress();
  const processedSet = new Set(progress.processedIds);

  // Homes with a website that have EXACTLY ONE price — the other needs filling in.
  // Skip homes with no prices at all (those were handled by scrape-prices.ts).
  // Skip French entries (non-UK postcodes / French names).
  const rows = await sql`
    SELECT id, name, website_url, price_direct_cremation, price_standard_funeral
    FROM funeral_homes
    WHERE website_url IS NOT NULL AND website_url != ''
      AND postcode ~ '^[A-Z]'
      AND (
        (price_direct_cremation IS NOT NULL AND price_standard_funeral IS NULL)
        OR
        (price_direct_cremation IS NULL AND price_standard_funeral IS NOT NULL)
      )
    ORDER BY id
  `;

  const toProcess = rows.filter((r: any) => !processedSet.has(r.id));

  console.log(`Total with partial prices: ${rows.length}`);
  console.log(`Already processed: ${processedSet.size}`);
  console.log(`Remaining: ${toProcess.length}\n`);

  if (toProcess.length === 0) { console.log("Nothing to do!"); return; }

  let filled = 0;
  let noData = 0;
  let failed = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const row = toProcess[i] as any;
    const { id, name, website_url, price_direct_cremation, price_standard_funeral } = row;

    const missing = [];
    if (price_direct_cremation === null) missing.push("DC");
    if (price_standard_funeral === null) missing.push("SF");

    process.stdout.write(`  [${i + 1}/${toProcess.length}] ${name} (missing: ${missing.join("+")}) ... `);

    const pageText = await getPageText(website_url);
    if (!pageText) {
      console.log("FAILED (could not fetch)");
      failed++;
      progress.processedIds.push(id);
      processedSet.add(id);
      if (i % 20 === 0) saveProgress(progress);
      await sleep(FETCH_DELAY_MS);
      continue;
    }

    const prices = await extractPrices(pageText);

    // Only update fields that are currently null — COALESCE preserves existing data
    const newDC = price_direct_cremation ?? prices.direct_cremation;
    const newSF = price_standard_funeral ?? prices.standard_funeral;

    if (
      (newDC !== null && price_direct_cremation === null) ||
      (newSF !== null && price_standard_funeral === null)
    ) {
      await sql`
        UPDATE funeral_homes
        SET price_direct_cremation = ${newDC},
            price_standard_funeral = ${newSF}
        WHERE id = ${id}
      `;
      console.log(`DC: ${newDC ?? "—"} | SF: ${newSF ?? "—"}`);
      filled++;
    } else {
      console.log("no new prices found");
      noData++;
    }

    progress.processedIds.push(id);
    processedSet.add(id);
    if (i % 20 === 0) saveProgress(progress);
    await sleep(FETCH_DELAY_MS);
  }

  saveProgress(progress);

  console.log(`\n=== Done ===`);
  console.log(`Filled in prices: ${filled}`);
  console.log(`No new prices:    ${noData}`);
  console.log(`Fetch failed:     ${failed}`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
