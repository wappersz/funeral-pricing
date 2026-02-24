import { sql } from "@/lib/db";

const RADIUS_MILES = 30;
const MAX_RESULTS = 50;
const DEGREES_PER_MILE = 1 / 69;

export interface Town {
  name: string;
  slug: string;
  count: number;
  lat: number;
  lng: number;
}

function toSlug(name: string): string {
  return name.replace(/ /g, "-");
}

/**
 * Return all distinct UK towns that have at least one funeral home.
 * The postcode regex filters out non-UK entries (e.g. French towns).
 */
export async function getTowns(): Promise<Town[]> {
  const rows = await sql`
    SELECT city,
           COUNT(*)::int            AS count,
           AVG(latitude)::float     AS lat,
           AVG(longitude)::float    AS lng
    FROM funeral_homes
    WHERE city != ''
      AND postcode ~ '^[A-Z]'
    GROUP BY city
    ORDER BY city
  `;
  return (rows as Record<string, unknown>[]).map((r) => ({
    name: r.city as string,
    slug: toSlug(r.city as string),
    count: r.count as number,
    lat: r.lat as number,
    lng: r.lng as number,
  }));
}

/**
 * Look up a single town by its URL slug.
 * Converts slug back to a DB match by comparing with hyphens-to-spaces.
 */
export async function getTownBySlug(slug: string): Promise<Town | null> {
  const rows = await sql`
    SELECT city,
           COUNT(*)::int            AS count,
           AVG(latitude)::float     AS lat,
           AVG(longitude)::float    AS lng
    FROM funeral_homes
    WHERE city != ''
      AND postcode ~ '^[A-Z]'
      AND REPLACE(city, ' ', '-') ILIKE ${slug}
    GROUP BY city
    LIMIT 1
  `;
  const results = rows as Record<string, unknown>[];
  if (results.length === 0) return null;
  const r = results[0];
  return {
    name: r.city as string,
    slug: toSlug(r.city as string),
    count: r.count as number,
    lat: r.lat as number,
    lng: r.lng as number,
  };
}

export interface SearchResult {
  id: number;
  name: string;
  address: string;
  postcode: string;
  city: string;
  latitude: number;
  longitude: number;
  price_direct_cremation: number | null;
  price_standard_funeral: number | null;
  website_url: string | null;
  phone_number: string | null;
  distance_miles: number;
}

/**
 * Return the top UK cities by funeral home count.
 */
export async function getTopCities(
  limit = 12
): Promise<{ name: string; slug: string; count: number }[]> {
  const rows = await sql`
    SELECT city,
           COUNT(*)::int AS count
    FROM funeral_homes
    WHERE city != ''
      AND postcode ~ '^[A-Z]'
    GROUP BY city
    ORDER BY count DESC
    LIMIT ${limit}
  `;
  return (rows as Record<string, unknown>[]).map((r) => ({
    name: r.city as string,
    slug: toSlug(r.city as string),
    count: r.count as number,
  }));
}

/**
 * Fetch a single funeral home by its primary key.
 * Returns null if not found.
 */
export async function getFuneralHomeById(
  id: number
): Promise<SearchResult | null> {
  const rows = await sql`
    SELECT id, name, address, postcode, city,
           latitude, longitude,
           price_direct_cremation, price_standard_funeral,
           website_url, phone_number,
           0 AS distance_miles
    FROM funeral_homes
    WHERE id = ${id}
    LIMIT 1
  `;
  const results = rows as SearchResult[];
  return results.length > 0 ? results[0] : null;
}

/**
 * Find funeral homes within `radiusMiles` of (lat, lng) using a
 * Haversine query with bounding-box pre-filter.
 */
export async function searchNearby(
  lat: number,
  lng: number,
  radiusMiles: number = RADIUS_MILES
): Promise<SearchResult[]> {
  const latDelta = radiusMiles * DEGREES_PER_MILE;
  const lngDelta = latDelta / Math.cos((lat * Math.PI) / 180);

  const minLat = lat - latDelta;
  const maxLat = lat + latDelta;
  const minLng = lng - lngDelta;
  const maxLng = lng + lngDelta;

  const rows = await sql`
    SELECT * FROM (
      SELECT *,
        3959 * acos(
          LEAST(1, cos(radians(${lat})) * cos(radians(latitude))
          * cos(radians(longitude) - radians(${lng}))
          + sin(radians(${lat})) * sin(radians(latitude)))
        ) AS distance_miles
      FROM funeral_homes
      WHERE latitude  BETWEEN ${minLat} AND ${maxLat}
        AND longitude BETWEEN ${minLng} AND ${maxLng}
    ) AS homes_with_distance
    WHERE distance_miles <= ${radiusMiles}
    ORDER BY distance_miles
    LIMIT ${MAX_RESULTS}
  `;

  return rows as SearchResult[];
}
