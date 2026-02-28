/**
 * Build pre-projected SVG path data from UK ceremonial counties GeoJSON.
 *
 * Usage:
 *   npx tsx scripts/build-county-svg.ts
 *
 * Input:  /tmp/uk-counties-raw.geojson (downloaded from GitHub)
 * Output: public/data/uk-counties.json
 *
 * This pre-projects coordinates to SVG paths so no geo library is needed at runtime.
 */

import * as fs from "fs";
import * as path from "path";
import { geoPath, geoMercator } from "d3-geo";

const INPUT = "/tmp/uk-counties-raw.geojson";
const OUTPUT = path.join(
  __dirname,
  "..",
  "public",
  "data",
  "uk-counties.json"
);

// SVG dimensions
const WIDTH = 500;
const HEIGHT = 820;

function main() {
  console.log("Reading GeoJSON...");
  const raw = JSON.parse(fs.readFileSync(INPUT, "utf-8"));

  // Filter out null-named features and simplify
  const features = raw.features.filter(
    (f: any) => f.properties.county != null
  );
  console.log(`${features.length} counties with names`);

  // Set up projection centred on UK
  const projection = geoMercator()
    .center([-2.5, 54.5]) // Centre of UK
    .scale(2800)
    .translate([WIDTH / 2, HEIGHT / 2]);

  const pathGenerator = geoPath().projection(projection);

  // Generate SVG paths
  const counties: Record<string, string> = {};
  let skipped = 0;

  for (const feature of features) {
    const name = feature.properties.county as string;
    const d = pathGenerator(feature);
    if (d) {
      // Simplify path by rounding coordinates to integers
      const simplified = d.replace(
        /(\d+\.\d+)/g,
        (match: string) => Math.round(parseFloat(match)).toString()
      );
      counties[name] = simplified;
    } else {
      console.log(`  Skipped (no path): ${name}`);
      skipped++;
    }
  }

  const result = {
    viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
    counties,
  };

  // Ensure output dir exists
  const dir = path.dirname(OUTPUT);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(OUTPUT, JSON.stringify(result));
  const sizeKB = (fs.statSync(OUTPUT).size / 1024).toFixed(0);

  console.log(`\nWrote ${Object.keys(counties).length} counties to ${OUTPUT}`);
  console.log(`File size: ${sizeKB} KB`);
  if (skipped) console.log(`Skipped: ${skipped}`);
}

main();
