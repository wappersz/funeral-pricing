export interface GeoResult {
  postcode: string;
  latitude: number;
  longitude: number;
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
