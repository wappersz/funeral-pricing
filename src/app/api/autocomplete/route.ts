import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export interface Suggestion {
  label: string;    // display text in dropdown
  value: string;    // what fills the input
  redirect?: string; // if set, navigate here instead of running a search
}

// Matches full or partial UK postcodes: "CF3", "SW1A", "SW1A 1", etc.
const POSTCODE_PARTIAL_RE = /^[A-Z]{1,2}[0-9][0-9A-Z]?(\s*[0-9]?[A-Z]{0,2})?$/i;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const suggestions: Suggestion[] = [];

  // --- Postcode autocomplete (postcodes.io) ---
  if (POSTCODE_PARTIAL_RE.test(q)) {
    try {
      const res = await fetch(
        `https://api.postcodes.io/postcodes?q=${encodeURIComponent(q)}&limit=4`,
        { next: { revalidate: 300 } }
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.result)) {
          for (const pc of data.result) {
            suggestions.push({ label: pc.postcode, value: pc.postcode });
          }
        }
      }
    } catch {
      // postcodes.io unavailable — fall through
    }
  }

  // --- Town autocomplete from our own DB (fast, no external call) ---
  const remaining = 6 - suggestions.length;
  if (remaining > 0) {
    try {
      const rows = await sql`
        SELECT city, AVG(latitude)::float AS lat, AVG(longitude)::float AS lng
        FROM funeral_homes
        WHERE city ILIKE ${q + "%"}
          AND city != ''
          AND postcode ~ '^[A-Z]'
        GROUP BY city
        ORDER BY city
        LIMIT ${remaining}
      `;

      for (const row of rows as { city: string; lat: number; lng: number }[]) {
        const slug = row.city.replace(/ /g, "-");
        if (!suggestions.some((s) => s.value.toLowerCase() === row.city.toLowerCase())) {
          suggestions.push({
            label: row.city,
            value: row.city,
            redirect: `/${slug}`,
          });
        }
      }
    } catch {
      // DB unavailable — return postcodes only
    }
  }

  return NextResponse.json({ suggestions });
}
