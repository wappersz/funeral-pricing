/**
 * Backfill the `county` column on funeral_homes using postcodes.io.
 *
 * Usage:
 *   npx tsx scripts/backfill-counties.ts
 *
 * Required env:
 *   DATABASE_URL — Neon connection string (from .env.local)
 *
 * The script:
 *   1. Adds the county column if it doesn't exist
 *   2. Queries all homes with a postcode but no county
 *   3. Bulk-lookups postcodes via postcodes.io (100 at a time)
 *   4. Extracts admin_county (falls back to admin_district for metro areas)
 *   5. Updates each row
 */

import * as fs from "fs";
import * as path from "path";
import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("Set DATABASE_URL env variable (or source .env.local)");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const BATCH_SIZE = 100;
const DELAY_MS = 150;
const PROGRESS_FILE = path.join(__dirname, "counties-progress.json");

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

async function bulkLookupPostcodes(
  postcodes: string[]
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  const res = await fetch("https://api.postcodes.io/postcodes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postcodes }),
  });
  if (!res.ok) return results;
  const data = await res.json();
  for (const item of data.result) {
    if (item.result) {
      const county =
        item.result.admin_county || item.result.admin_district || null;
      if (county) {
        results.set(item.query, county);
      }
    }
  }
  return results;
}

async function main() {
  console.log("=== County Backfill ===\n");

  // Ensure column exists
  await sql`ALTER TABLE funeral_homes ADD COLUMN IF NOT EXISTS county TEXT`;
  await sql`CREATE INDEX IF NOT EXISTS idx_funeral_homes_county ON funeral_homes (county)`;
  console.log("Column and index ready.\n");

  // Load progress
  const progress = loadProgress();
  const processedSet = new Set(progress.processedIds);

  // Get all homes needing county
  const rows = await sql`
    SELECT id, postcode FROM funeral_homes
    WHERE county IS NULL AND postcode IS NOT NULL AND postcode != ''
    ORDER BY id
  `;

  const toProcess = rows.filter((r: any) => !processedSet.has(r.id));
  console.log(`Total needing county: ${rows.length}`);
  console.log(`Already processed: ${processedSet.size}`);
  console.log(`Remaining: ${toProcess.length}\n`);

  if (toProcess.length === 0) {
    console.log("Nothing to do!");
    return;
  }

  let updated = 0;
  let noCounty = 0;

  // Process in batches
  for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
    const batch = toProcess.slice(i, i + BATCH_SIZE) as any[];
    const postcodes = batch.map((r) => r.postcode);

    process.stdout.write(
      `  [${i + 1}-${Math.min(i + BATCH_SIZE, toProcess.length)}/${toProcess.length}] Looking up ${batch.length} postcodes ... `
    );

    const countyMap = await bulkLookupPostcodes(postcodes);

    for (const row of batch) {
      const county = countyMap.get(row.postcode);
      if (county) {
        await sql`UPDATE funeral_homes SET county = ${county} WHERE id = ${row.id}`;
        updated++;
      } else {
        noCounty++;
      }
      progress.processedIds.push(row.id);
      processedSet.add(row.id);
    }

    console.log(`${countyMap.size} counties found`);

    if (i % 500 === 0) saveProgress(progress);
    await sleep(DELAY_MS);
  }

  saveProgress(progress);

  console.log(`\n=== Done ===`);
  console.log(`Updated: ${updated}`);
  console.log(`No county found: ${noCounty}`);

  // Show distribution
  const dist = await sql`
    SELECT county, COUNT(*)::int AS cnt
    FROM funeral_homes
    WHERE county IS NOT NULL
    GROUP BY county
    ORDER BY cnt DESC
    LIMIT 20
  `;
  console.log("\nTop 20 counties:");
  for (const row of dist as any[]) {
    console.log(`  ${row.county}: ${row.cnt}`);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
