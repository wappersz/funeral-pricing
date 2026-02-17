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
