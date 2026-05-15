import { NextResponse } from "next/server";
import { buildSteamLoginUrl } from "@/lib/steam";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.redirect(buildSteamLoginUrl());
}
