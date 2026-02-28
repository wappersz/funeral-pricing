import { neon } from "@neondatabase/serverless";

let _sql: ReturnType<typeof neon> | null = null;

export function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  if (!_sql) {
    _sql = neon(process.env.DATABASE_URL!);
  }
  return _sql(strings, ...values);
}

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS signups (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
}

export async function initFuneralHomesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS funeral_homes (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      postcode TEXT NOT NULL,
      city TEXT NOT NULL,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      price_direct_cremation INTEGER,
      price_standard_funeral INTEGER,
      website_url TEXT,
      phone_number TEXT
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_funeral_homes_lat_lng
    ON funeral_homes (latitude, longitude)
  `;
}
