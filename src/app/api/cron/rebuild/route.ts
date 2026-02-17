import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Trigger a redeploy via Vercel Deploy Hook
  if (process.env.DEPLOY_HOOK_URL) {
    await fetch(process.env.DEPLOY_HOOK_URL, { method: "POST" });
  }

  return NextResponse.json({ success: true, rebuilt: new Date().toISOString() });
}
