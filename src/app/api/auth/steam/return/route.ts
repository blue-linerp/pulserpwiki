/**
 * src/app/api/auth/steam/return/route.ts
 */
import { NextResponse, type NextRequest } from "next/server";
import { verifySteamOpenId, fetchSteamProfile, siteUrl } from "@/lib/steam";
import { Users } from "@/lib/db";
import { encodeSession, buildSetCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const steamId = await verifySteamOpenId(sp);
  if (!steamId) {
    return NextResponse.redirect(`${siteUrl()}/?login=failed`);
  }

  const profile = await fetchSteamProfile(steamId);
  const user = await Users.upsert({
    steam_id: steamId,
    persona: profile?.personaname ?? null,
    avatar: profile?.avatarfull ?? null,
    profile_url: profile?.profileurl ?? null,
    role: "user",
  });

  const token = encodeSession({
    steam_id: steamId,
    persona: user.persona,
    avatar: user.avatar,
    profile_url: user.profile_url,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
  });
  const res = NextResponse.redirect(`${siteUrl()}/?login=ok`);
  res.headers.append("Set-Cookie", buildSetCookie(token));
  return res;
}
