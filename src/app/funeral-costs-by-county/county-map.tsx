"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { priceToColour, NO_DATA_COLOUR } from "@/lib/map-utils";
import type { CountyAverage } from "@/lib/counties";

interface CountyMapData {
  viewBox: string;
  counties: Record<string, string>;
}

interface Props {
  data: CountyAverage[];
}

type PriceType = "direct_cremation" | "standard_funeral";

export default function CountyMap({ data }: Props) {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const [mapData, setMapData] = useState<CountyMapData | null>(null);
  const [hovered, setHovered] = useState<CountyAverage | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [priceType, setPriceType] = useState<PriceType>("standard_funeral");

  useEffect(() => {
    fetch("/data/uk-counties.json")
      .then((r) => r.json())
      .then(setMapData);
  }, []);

  // Build lookup from county name → data
  const dataMap = new Map<string, CountyAverage>();
  for (const d of data) {
    dataMap.set(d.county, d);
  }

  // Calculate min/max for colour scale
  const prices = data
    .map((d) =>
      priceType === "direct_cremation"
        ? d.avg_direct_cremation
        : d.avg_standard_funeral
    )
    .filter((p): p is number => p != null);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  const getColour = useCallback(
    (county: string): string => {
      const d = dataMap.get(county);
      if (!d) return NO_DATA_COLOUR;
      const price =
        priceType === "direct_cremation"
          ? d.avg_direct_cremation
          : d.avg_standard_funeral;
      if (price == null) return NO_DATA_COLOUR;
      return priceToColour(price, min, max);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [priceType, min, max, data]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    },
    []
  );

  if (!mapData) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-border bg-white">
        <p className="text-sm text-gray">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setPriceType("standard_funeral")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            priceType === "standard_funeral"
              ? "bg-navy text-white"
              : "bg-white text-foreground border border-border hover:bg-background"
          }`}
        >
          Standard Funeral
        </button>
        <button
          onClick={() => setPriceType("direct_cremation")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            priceType === "direct_cremation"
              ? "bg-navy text-white"
              : "bg-white text-foreground border border-border hover:bg-background"
          }`}
        >
          Direct Cremation
        </button>
      </div>

      {/* Map */}
      <div className="relative overflow-hidden rounded-lg border border-border bg-white">
        <svg
          ref={svgRef}
          viewBox={mapData.viewBox}
          className="mx-auto max-h-[500px] w-auto"
          onMouseMove={handleMouseMove}
        >
          {Object.entries(mapData.counties).map(([name, path]) => {
            const countyData = dataMap.get(name);
            return (
              <path
                key={name}
                d={path}
                fill={getColour(name)}
                stroke="#fff"
                strokeWidth="0.5"
                className="cursor-pointer transition-opacity hover:opacity-80"
                onMouseEnter={() => setHovered(countyData ?? null)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => {
                  if (countyData) {
                    router.push(
                      `/funeral-costs-by-county/${countyData.slug}`
                    );
                  }
                }}
              />
            );
          })}
        </svg>

        {/* Desktop tooltip */}
        {hovered && (
          <div
            className="pointer-events-none absolute z-10 hidden rounded-lg border border-border bg-white p-3 shadow-md md:block"
            style={{
              left: Math.min(mousePos.x + 12, (svgRef.current?.clientWidth ?? 400) - 200),
              top: mousePos.y + 12,
            }}
          >
            <p className="text-sm font-semibold text-foreground">
              {hovered.county}
            </p>
            <div className="mt-1.5 space-y-1 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-gray">Direct Cremation</span>
                <span className="font-medium text-foreground">
                  {hovered.avg_direct_cremation != null
                    ? `£${hovered.avg_direct_cremation.toLocaleString()}`
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray">Standard Funeral</span>
                <span className="font-medium text-foreground">
                  {hovered.avg_standard_funeral != null
                    ? `£${hovered.avg_standard_funeral.toLocaleString()}`
                    : "—"}
                </span>
              </div>
              <p className="pt-1 text-gray">
                {hovered.home_count} funeral director
                {hovered.home_count !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}

        {/* Mobile tooltip (fixed bar) */}
        {hovered && (
          <div className="border-t border-border bg-white p-3 md:hidden">
            <p className="text-sm font-semibold text-foreground">
              {hovered.county}
            </p>
            <div className="mt-1 flex gap-4 text-xs">
              <span>
                <span className="text-gray">DC: </span>
                <span className="font-medium">
                  {hovered.avg_direct_cremation != null
                    ? `£${hovered.avg_direct_cremation.toLocaleString()}`
                    : "—"}
                </span>
              </span>
              <span>
                <span className="text-gray">SF: </span>
                <span className="font-medium">
                  {hovered.avg_standard_funeral != null
                    ? `£${hovered.avg_standard_funeral.toLocaleString()}`
                    : "—"}
                </span>
              </span>
              <span className="text-gray">
                {hovered.home_count} director
                {hovered.home_count !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Colour legend */}
      <div className="flex items-center gap-2 text-xs text-gray">
        <span>£{min.toLocaleString()}</span>
        <div
          className="h-3 flex-1 rounded"
          style={{
            background: `linear-gradient(to right, #39D353, #4cbb95, #002D72)`,
          }}
        />
        <span>£{max.toLocaleString()}</span>
        <span className="ml-2 flex items-center gap-1">
          <span
            className="inline-block h-3 w-3 rounded"
            style={{ background: NO_DATA_COLOUR }}
          />
          No data
        </span>
      </div>
    </div>
  );
}
