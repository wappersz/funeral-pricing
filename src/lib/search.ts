import { sql } from "@/lib/db";

const RADIUS_MILES = 30;
const MAX_RESULTS = 50;
const DEGREES_PER_MILE = 1 / 69;

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
