import { NextRequest, NextResponse } from "next/server";
import { sql, initDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const trimmed = email.trim().toLowerCase();

  try {
    await initDb();
    await sql`INSERT INTO signups (email) VALUES (${trimmed})`;
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("unique")) {
      return NextResponse.json({ success: true });
    }
    throw err;
  }

  return NextResponse.json({ success: true });
}
