import { sql } from "@/lib/db";

export interface GeoResult {
  postcode: string;
  latitude: number;
  longitude: number;
}

/**
 * Returns true if the string looks like a UK postcode (e.g. SW1A 1AA).
 */
export function isUKPostcode(query: string): boolean {
  return /^[A-Z]{1,2}[0-9][0-9A-Z]?\s*[0-9][A-Z]{2}$/i.test(query.trim());
}

/**
 * Look up a town/city name in our own DB first (fast).
 * Returns null if not found.
 */
async function geocodeTownFromDB(query: string): Promise<GeoResult | null> {
  try {
    const rows = await sql`
      SELECT AVG(latitude)::float AS lat, AVG(longitude)::float AS lng
      FROM funeral_homes
      WHERE city ILIKE ${query.trim()}
        AND city != ''
        AND postcode ~ '^[A-Z]'
      LIMIT 1
    `;
    const r = (rows as { lat: number; lng: number }[])[0];
    if (!r?.lat) return null;
    return { postcode: query.trim(), latitude: r.lat, longitude: r.lng };
  } catch {
    return null;
  }
}

/**
 * Geocode a UK town, city or village name.
 * Checks our own DB first (fast), then falls back to Nominatim (OSM).
 */
export async function geocodePlace(query: string): Promise<GeoResult | null> {
  const fromDB = await geocodeTownFromDB(query);
  if (fromDB) return fromDB;

  // Fall back to Nominatim for places not in our DB
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=gb`;
  const res = await fetch(url, {
    headers: { "User-Agent": "FuneralPricing/1.0 (funeralpricing.co.uk)" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  const place = data[0];
  return {
    postcode: query.trim(),
    latitude: parseFloat(place.lat),
    longitude: parseFloat(place.lon),
  };
}

/**
 * Geocode a single UK postcode using postcodes.io (free, no API key).
 */
export async function geocodePostcode(
  postcode: string
): Promise<GeoResult | null> {
  const res = await fetch(
    `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode.trim())}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (data.status !== 200 || !data.result) return null;
  return {
    postcode: data.result.postcode,
    latitude: data.result.latitude,
    longitude: data.result.longitude,
  };
}

/**
 * Bulk-geocode up to 100 UK postcodes in a single request.
 */
export async function geocodePostcodes(
  postcodes: string[]
): Promise<Map<string, GeoResult>> {
  const results = new Map<string, GeoResult>();
  const res = await fetch("https://api.postcodes.io/postcodes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postcodes }),
  });
  if (!res.ok) return results;
  const data = await res.json();
  for (const item of data.result) {
    if (item.result) {
      results.set(item.query.toUpperCase().replace(/\s/g, ""), {
        postcode: item.result.postcode,
        latitude: item.result.latitude,
        longitude: item.result.longitude,
      });
    }
  }
  return results;
}
