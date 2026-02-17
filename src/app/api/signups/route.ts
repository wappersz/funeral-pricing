import { NextResponse } from "next/server";
import { sql, initDb } from "@/lib/db";

export async function GET() {
  await initDb();
  const signups = await sql`SELECT id, email, created_at FROM signups ORDER BY created_at DESC`;

  return NextResponse.json(signups);
}
