import { NextRequest, NextResponse } from "next/server";
import { geocodePostcode } from "@/lib/geocode";
import { searchNearby } from "@/lib/search";

export async function GET(req: NextRequest) {
  const postcode = req.nextUrl.searchParams.get("postcode");
  if (!postcode) {
    return NextResponse.json(
      { error: "Missing postcode parameter" },
      { status: 400 }
    );
  }

  const geo = await geocodePostcode(postcode);
  if (!geo) {
    return NextResponse.json(
      { error: "Invalid or unrecognised postcode" },
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
