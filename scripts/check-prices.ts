import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error("Missing DATABASE_URL"); process.exit(1); }

const sql = neon(DATABASE_URL);

async function main() {
  const [counts] = await sql`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE price_direct_cremation IS NOT NULL OR price_standard_funeral IS NOT NULL) AS with_any_price,
      COUNT(*) FILTER (WHERE price_direct_cremation IS NOT NULL AND price_standard_funeral IS NOT NULL) AS with_both_prices,
      COUNT(*) FILTER (WHERE price_direct_cremation IS NULL AND price_standard_funeral IS NULL) AS no_prices,
      COUNT(*) FILTER (WHERE website_url IS NOT NULL AND website_url != '' AND price_direct_cremation IS NULL AND price_standard_funeral IS NULL) AS no_prices_has_website,
      COUNT(*) FILTER (WHERE (website_url IS NULL OR website_url = '') AND price_direct_cremation IS NULL AND price_standard_funeral IS NULL) AS no_prices_no_website
    FROM funeral_homes
  `;
  console.log("=== Price Coverage ===");
  console.log(`Total homes:              ${counts.total}`);
  console.log(`With any price:           ${counts.with_any_price}`);
  console.log(`With both prices:         ${counts.with_both_prices}`);
  console.log(`No prices at all:         ${counts.no_prices}`);
  console.log(`  → has website (can scrape): ${counts.no_prices_has_website}`);
  console.log(`  → no website:               ${counts.no_prices_no_website}`);
}

main().catch(console.error);
