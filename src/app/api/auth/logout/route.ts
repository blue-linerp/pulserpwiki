import { NextResponse } from "next/server";
import { buildClearCookie } from "@/lib/session";
import { siteUrl } from "@/lib/steam";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.headers.append("Set-Cookie", buildClearCookie());
  return res;
}

export async function GET() {
  const res = NextResponse.redirect(`${siteUrl()}/`);
  res.headers.append("Set-Cookie", buildClearCookie());
  return res;
}
