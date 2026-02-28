import { neon } from "@neondatabase/serverless";
async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const counties = ["Kent","Lancashire","Hampshire","Essex","Surrey","West Sussex","Devon","Cornwall"];
  for (const county of counties) {
    const rows = await sql`
      SELECT
        COUNT(*) as homes,
        ROUND(AVG(price_direct_cremation::numeric), 0) as avg_dc,
        ROUND(AVG(price_standard_funeral::numeric), 0) as avg_sf,
        ROUND(MIN(price_direct_cremation::numeric), 0) as min_dc,
        ROUND(MIN(price_standard_funeral::numeric), 0) as min_sf,
        ROUND(MAX(price_direct_cremation::numeric), 0) as max_dc,
        ROUND(MAX(price_standard_funeral::numeric), 0) as max_sf,
        COUNT(price_direct_cremation) as dc_count,
        COUNT(price_standard_funeral) as sf_count
      FROM funeral_homes
      WHERE county = ${county}
        AND (price_direct_cremation IS NOT NULL OR price_standard_funeral IS NOT NULL)
    `;
    console.log(`${county}: ${JSON.stringify(rows[0])}`);
  }
}
main().catch(console.error);
