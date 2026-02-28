/**
 * Fetch funeral directors across the UK using Google Places API.
 *
 * Usage:
 *   npx tsx scripts/fetch-google-places.ts
 *
 * Required env:
 *   GOOGLE_PLACES_API_KEY — API key with Places API enabled
 *   DATABASE_URL           — Neon connection string (from .env.local)
 *
 * The script:
 *   1. Generates a grid of lat/lng points covering the UK
 *   2. Runs a Nearby Search at each point for "funeral director"
 *   3. Fetches Place Details (phone, website) for each unique result
 *   4. Upserts into the funeral_homes table
 *
 * Progress is saved to scripts/places-progress.json so the script
 * can be resumed if interrupted.
 */

import * as fs from "fs";
import * as path from "path";
import { neon } from "@neondatabase/serverless";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!API_KEY) {
  console.error("Set GOOGLE_PLACES_API_KEY env variable");
  process.exit(1);
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("Set DATABASE_URL env variable (or source .env.local)");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const SEARCH_RADIUS_M = 15_000; // 15 km per search
const GRID_STEP_DEG = 0.18; // ~20 km between grid points (overlap)
const DELAY_MS = 200; // ms between API calls
const DETAIL_DELAY_MS = 100;
const PROGRESS_FILE = path.join(__dirname, "places-progress.json");

// ---------------------------------------------------------------------------
// UK bounding regions (mainland + NI)
// ---------------------------------------------------------------------------

interface Region {
  name: string;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

const UK_REGIONS: Region[] = [
  // England, Wales, Scotland mainland
  { name: "GB mainland", minLat: 49.9, maxLat: 58.7, minLng: -5.8, maxLng: 1.8 },
  // Northern Ireland
  { name: "NI", minLat: 54.0, maxLat: 55.4, minLng: -8.2, maxLng: -5.4 },
  // Scottish Highlands / NW Scotland
  { name: "NW Scotland", minLat: 57.0, maxLat: 58.7, minLng: -7.0, maxLng: -5.0 },
];

function generateGridPoints(): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = [];
  const seen = new Set<string>();

  for (const region of UK_REGIONS) {
    for (let lat = region.minLat; lat <= region.maxLat; lat += GRID_STEP_DEG) {
      // adjust longitude step for latitude
      const lngStep = GRID_STEP_DEG / Math.cos((lat * Math.PI) / 180);
      for (let lng = region.minLng; lng <= region.maxLng; lng += lngStep) {
        const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
        if (!seen.has(key)) {
          seen.add(key);
          points.push({ lat: +lat.toFixed(4), lng: +lng.toFixed(4) });
        }
      }
    }
  }

  return points;
}

// ---------------------------------------------------------------------------
// Google Places API helpers
// ---------------------------------------------------------------------------

interface NearbyResult {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: { location: { lat: number; lng: number } };
}

interface NearbyResponse {
  results: NearbyResult[];
  next_page_token?: string;
  status: string;
}

async function nearbySearch(
  lat: number,
  lng: number,
  pageToken?: string
): Promise<NearbyResponse> {
  const params = new URLSearchParams({
    location: `${lat},${lng}`,
    radius: String(SEARCH_RADIUS_M),
    keyword: "funeral director",
    type: "funeral_home",
    key: API_KEY!,
  });
  if (pageToken) params.set("pagetoken", pageToken);

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`
  );
  return res.json() as Promise<NearbyResponse>;
}

interface PlaceDetail {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  geometry: { location: { lat: number; lng: number } };
  address_components?: Array<{
    long_name: string;
    types: string[];
  }>;
}

interface DetailResponse {
  result: PlaceDetail;
  status: string;
}

async function placeDetails(placeId: string): Promise<PlaceDetail | null> {
  const params = new URLSearchParams({
    place_id: placeId,
    fields:
      "place_id,name,formatted_address,formatted_phone_number,website,geometry,address_components",
    key: API_KEY!,
  });
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?${params}`
  );
  const data = (await res.json()) as DetailResponse;
  if (data.status !== "OK") return null;
  return data.result;
}

function extractPostcode(address: string): string {
  const match = address.match(
    /[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i
  );
  return match ? match[0].toUpperCase() : "";
}

function extractCity(detail: PlaceDetail): string {
  if (!detail.address_components) return "";
  for (const comp of detail.address_components) {
    if (comp.types.includes("postal_town")) return comp.long_name;
  }
  for (const comp of detail.address_components) {
    if (comp.types.includes("locality")) return comp.long_name;
  }
  return "";
}

// ---------------------------------------------------------------------------
// Progress tracking
// ---------------------------------------------------------------------------

interface Progress {
  completedGridIndices: number[];
  discoveredPlaceIds: string[];
  detailedPlaceIds: string[];
  insertedPlaceIds: string[];
}

function loadProgress(): Progress {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf-8"));
  }
  return {
    completedGridIndices: [],
    discoveredPlaceIds: [],
    detailedPlaceIds: [],
    insertedPlaceIds: [],
  };
}

function saveProgress(p: Progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2));
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const grid = generateGridPoints();
  console.log(`Generated ${grid.length} grid points covering the UK\n`);

  const progress = loadProgress();
  const completedSet = new Set(progress.completedGridIndices);
  const placeIds = new Set(progress.discoveredPlaceIds);

  // --- Phase 1: Nearby Search across grid ---
  console.log("=== Phase 1: Nearby Search ===");
  const remaining = grid.length - completedSet.size;
  console.log(`${completedSet.size} already done, ${remaining} remaining\n`);

  for (let i = 0; i < grid.length; i++) {
    if (completedSet.has(i)) continue;

    const { lat, lng } = grid[i];
    process.stdout.write(
      `  [${i + 1}/${grid.length}] Searching ${lat},${lng} ... `
    );

    let found = 0;
    let pageToken: string | undefined;

    for (let page = 0; page < 3; page++) {
      const data = await nearbySearch(lat, lng, pageToken);

      if (data.status === "ZERO_RESULTS" || data.status === "OK") {
        for (const r of data.results) {
          if (!placeIds.has(r.place_id)) {
            placeIds.add(r.place_id);
            progress.discoveredPlaceIds.push(r.place_id);
            found++;
          }
        }
      } else if (data.status === "OVER_QUERY_LIMIT") {
        console.log(`\nRate limited — saving progress and waiting 60s...`);
        saveProgress(progress);
        await sleep(60_000);
        break;
      } else {
        console.log(`status=${data.status}`);
        break;
      }

      if (!data.next_page_token) break;
      pageToken = data.next_page_token;
      // Google requires ~2s before next_page_token becomes valid
      await sleep(2000);
    }

    console.log(`${found} new (${placeIds.size} total unique)`);
    completedSet.add(i);
    progress.completedGridIndices.push(i);

    // save every 50 grid points
    if (i % 50 === 0) saveProgress(progress);

    await sleep(DELAY_MS);
  }

  saveProgress(progress);
  console.log(`\nPhase 1 complete — ${placeIds.size} unique places found\n`);

  // --- Phase 2: Place Details + DB insert ---
  console.log("=== Phase 2: Place Details + DB Insert ===");

  // Ensure table exists
  await sql`
    CREATE TABLE IF NOT EXISTS funeral_homes (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      postcode TEXT NOT NULL,
      city TEXT NOT NULL,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      price_direct_cremation INTEGER,
      price_standard_funeral INTEGER,
      website_url TEXT,
      phone_number TEXT,
      google_place_id TEXT UNIQUE
    )
  `;

  // Add google_place_id column if it doesn't exist (idempotent)
  await sql`
    ALTER TABLE funeral_homes
    ADD COLUMN IF NOT EXISTS google_place_id TEXT UNIQUE
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_funeral_homes_lat_lng
    ON funeral_homes (latitude, longitude)
  `;

  const insertedSet = new Set(progress.insertedPlaceIds);
  const toDetail = progress.discoveredPlaceIds.filter(
    (id) => !insertedSet.has(id)
  );

  console.log(
    `${insertedSet.size} already inserted, ${toDetail.length} remaining\n`
  );

  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < toDetail.length; i++) {
    const placeId = toDetail[i];

    process.stdout.write(
      `  [${i + 1}/${toDetail.length}] ${placeId} ... `
    );

    const detail = await placeDetails(placeId);
    if (!detail) {
      console.log("skipped (no details)");
      skipped++;
      // Still mark as done so we don't retry
      progress.insertedPlaceIds.push(placeId);
      insertedSet.add(placeId);
      await sleep(DETAIL_DELAY_MS);
      continue;
    }

    const postcode = extractPostcode(detail.formatted_address);
    const city = extractCity(detail);
    const lat = detail.geometry.location.lat;
    const lng = detail.geometry.location.lng;

    // Upsert by google_place_id
    await sql`
      INSERT INTO funeral_homes
        (name, address, postcode, city, latitude, longitude,
         website_url, phone_number, google_place_id)
      VALUES
        (${detail.name}, ${detail.formatted_address}, ${postcode},
         ${city}, ${lat}, ${lng},
         ${detail.website || null}, ${detail.formatted_phone_number || null},
         ${placeId})
      ON CONFLICT (google_place_id) DO UPDATE SET
        name = EXCLUDED.name,
        address = EXCLUDED.address,
        postcode = EXCLUDED.postcode,
        city = EXCLUDED.city,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        website_url = EXCLUDED.website_url,
        phone_number = EXCLUDED.phone_number
    `;

    progress.insertedPlaceIds.push(placeId);
    insertedSet.add(placeId);
    inserted++;
    console.log(`${detail.name} — ${city} ${postcode}`);

    if (i % 50 === 0) saveProgress(progress);
    await sleep(DETAIL_DELAY_MS);
  }

  saveProgress(progress);

  console.log(`\n=== Done ===`);
  console.log(`Inserted: ${inserted}`);
  console.log(`Skipped:  ${skipped}`);
  console.log(`Total unique places found: ${placeIds.size}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
