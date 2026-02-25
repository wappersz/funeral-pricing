import { NextRequest, NextResponse } from "next/server";

export interface Suggestion {
  label: string; // display text in dropdown
  value: string; // what fills the input
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
        `https://api.postcodes.io/postcodes?q=${encodeURIComponent(q)}&limit=5`,
        { next: { revalidate: 60 } }
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
      // postcodes.io unavailable — fall through to place search
    }
  }

  // --- Place name autocomplete (Nominatim / OpenStreetMap) ---
  const remaining = 6 - suggestions.length;
  if (remaining > 0) {
    try {
      const url =
        `https://nominatim.openstreetmap.org/search` +
        `?q=${encodeURIComponent(q)}` +
        `&format=json` +
        `&countrycodes=gb` +
        `&limit=${remaining}` +
        `&addressdetails=1` +
        `&dedupe=1`;

      const res = await fetch(url, {
        headers: {
          "User-Agent": "FuneralPricing/1.0 (funeralpricing.co.uk)",
        },
        next: { revalidate: 60 },
      });

      if (res.ok) {
        const data = await res.json();
        for (const place of data) {
          const addr = place.address ?? {};

          // Prefer specific place name over generic region
          const placeName =
            addr.town ||
            addr.city ||
            addr.village ||
            addr.suburb ||
            addr.hamlet ||
            addr.municipality;

          const region =
            addr.county ||
            addr.state_district ||
            addr.state;

          if (!placeName) continue;

          const label = region ? `${placeName}, ${region}` : placeName;
          const value = placeName;

          // Deduplicate against postcodes and already-added places
          if (!suggestions.some((s) => s.value.toLowerCase() === value.toLowerCase())) {
            suggestions.push({ label, value });
          }
        }
      }
    } catch {
      // Nominatim unavailable — return what we have
    }
  }

  return NextResponse.json({ suggestions });
}
