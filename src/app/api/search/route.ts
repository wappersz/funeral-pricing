import { NextRequest, NextResponse } from "next/server";
import { geocodePostcode, geocodePlace, isUKPostcode } from "@/lib/geocode";
import { searchNearby } from "@/lib/search";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json(
      { error: "Missing search query" },
      { status: 400 }
    );
  }

  // Try postcode lookup first if it looks like one, then fall back to place name
  let geo = isUKPostcode(q) ? await geocodePostcode(q) : null;
  if (!geo) {
    geo = await geocodePlace(q);
  }

  if (!geo) {
    return NextResponse.json(
      { error: "We could not find that location. Please try a UK postcode or town name." },
      { status: 400 }
    );
  }

  const results = await searchNearby(geo.latitude, geo.longitude);

  return NextResponse.json({
    postcode: geo.postcode,
    latitude: geo.latitude,
    longitude: geo.longitude,
    results,
  });
}
