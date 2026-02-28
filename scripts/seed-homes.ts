import { funeralHomes } from "../src/data/homes";
import { geocodePostcodes } from "../src/lib/geocode";
import { sql, initFuneralHomesTable } from "../src/lib/db";

async function main() {
  console.log("Creating funeral_homes table...");
  await initFuneralHomesTable();

  console.log(`Geocoding ${funeralHomes.length} postcodes...`);
  const postcodes = funeralHomes.map((h) => h.postcode);
  const geoMap = await geocodePostcodes(postcodes);

  console.log(`Got coordinates for ${geoMap.size} postcodes`);

  // Clear existing data
  await sql`DELETE FROM funeral_homes`;

  let inserted = 0;
  for (const home of funeralHomes) {
    const key = home.postcode.toUpperCase().replace(/\s/g, "");
    const geo = geoMap.get(key);
    if (!geo) {
      console.warn(`  Skipping ${home.name} — could not geocode ${home.postcode}`);
      continue;
    }

    await sql`
      INSERT INTO funeral_homes
        (name, address, postcode, city, latitude, longitude,
         price_direct_cremation, price_standard_funeral, website_url, phone_number)
      VALUES
        (${home.name}, ${home.address}, ${home.postcode}, ${home.city},
         ${geo.latitude}, ${geo.longitude},
         ${home.prices.directCremation}, ${home.prices.standardFuneral},
         ${home.websiteUrl}, ${home.phoneNumber})
    `;
    inserted++;
    console.log(`  Inserted ${home.name} (${geo.latitude}, ${geo.longitude})`);
  }

  console.log(`\nDone — inserted ${inserted} funeral homes.`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
