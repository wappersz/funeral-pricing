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
 * Geocode a UK town, city or village name using Nominatim (OSM).
 * Falls back to null if the place cannot be found.
 */
export async function geocodePlace(query: string): Promise<GeoResult | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=gb`;
  const res = await fetch(url, {
    headers: { "User-Agent": "FuneralPricing/1.0 (funeralpricing.co.uk)" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  const place = data[0];
  return {
    postcode: query.trim(), // used as the display label in search results
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
