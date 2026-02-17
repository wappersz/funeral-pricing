import { neon } from "@neondatabase/serverless";

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  return neon(process.env.DATABASE_URL);
}

export const sql = new Proxy({} as ReturnType<typeof neon>, {
  apply: (_target, _thisArg, args) => getDb()(...(args as [TemplateStringsArray, ...unknown[]])),
});

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS signups (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
}
