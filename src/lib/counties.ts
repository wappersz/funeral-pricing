import { sql } from "./db";
import { toCeremonialCounty, countyToSlug } from "@/data/county-slugs";

export interface CountyAverage {
  county: string;
  slug: string;
  avg_direct_cremation: number | null;
  avg_standard_funeral: number | null;
  home_count: number;
  priced_count: number;
}

export interface CountyHome {
  id: number;
  name: string;
  address: string;
  postcode: string;
  city: string;
  price_direct_cremation: number | null;
  price_standard_funeral: number | null;
  website_url: string | null;
  phone_number: string | null;
}

/**
 * Get average prices grouped by county.
 * Maps postcodes.io districts to ceremonial counties for map matching.
 */
export async function getCountyAverages(): Promise<CountyAverage[]> {
  const rows = await sql`
    SELECT
      county,
      ROUND(AVG(price_direct_cremation))::int AS avg_direct_cremation,
      ROUND(AVG(price_standard_funeral))::int AS avg_standard_funeral,
      COUNT(*)::int AS home_count,
      COUNT(price_direct_cremation)::int + COUNT(price_standard_funeral)::int AS priced_count
    FROM funeral_homes
    WHERE county IS NOT NULL AND county != ''
    GROUP BY county
    ORDER BY county
  `;

  // Aggregate by ceremonial county
  const map = new Map<
    string,
    {
      dcSum: number;
      dcCount: number;
      sfSum: number;
      sfCount: number;
      homeCount: number;
      pricedCount: number;
    }
  >();

  for (const row of rows as any[]) {
    const ceremonial = toCeremonialCounty(row.county);
    if (!ceremonial) continue;

    const existing = map.get(ceremonial) ?? {
      dcSum: 0,
      dcCount: 0,
      sfSum: 0,
      sfCount: 0,
      homeCount: 0,
      pricedCount: 0,
    };

    existing.homeCount += row.home_count;
    existing.pricedCount += row.priced_count;

    // We need to re-aggregate from the per-district averages weighted by count
    // For simplicity, use the raw counts from a separate query approach
    // But since we have averages * count, we can approximate:
    if (row.avg_direct_cremation != null) {
      existing.dcSum += row.avg_direct_cremation * row.home_count;
      existing.dcCount += row.home_count;
    }
    if (row.avg_standard_funeral != null) {
      existing.sfSum += row.avg_standard_funeral * row.home_count;
      existing.sfCount += row.home_count;
    }

    map.set(ceremonial, existing);
  }

  const results: CountyAverage[] = [];
  for (const [county, data] of map) {
    results.push({
      county,
      slug: countyToSlug(county),
      avg_direct_cremation:
        data.dcCount > 0 ? Math.round(data.dcSum / data.dcCount) : null,
      avg_standard_funeral:
        data.sfCount > 0 ? Math.round(data.sfSum / data.sfCount) : null,
      home_count: data.homeCount,
      priced_count: data.pricedCount,
    });
  }

  return results.sort((a, b) => a.county.localeCompare(b.county));
}

/**
 * Get all funeral homes in a ceremonial county.
 */
export async function getCountyHomes(
  ceremonialCounty: string
): Promise<CountyHome[]> {
  // We need to find all postcodes.io names that map to this ceremonial county
  // The simplest approach: query all homes with county set, filter in app
  // But better: use the DB county values directly

  // Get all postcodes.io district names for this ceremonial county
  // by checking our mapping
  const rows = await sql`
    SELECT id, name, address, postcode, city,
           price_direct_cremation, price_standard_funeral,
           website_url, phone_number, county
    FROM funeral_homes
    WHERE county IS NOT NULL AND county != ''
    ORDER BY name
  `;

  return (rows as any[]).filter((r) => {
    const mapped = toCeremonialCounty(r.county);
    return mapped === ceremonialCounty;
  });
}

/**
 * Get all unique ceremonial counties that have funeral homes.
 */
export async function getCounties(): Promise<
  Array<{ county: string; slug: string }>
> {
  const averages = await getCountyAverages();
  return averages.map((a) => ({ county: a.county, slug: a.slug }));
}
