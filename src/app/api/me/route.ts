import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  let u = null;
  try {
    u = getCurrentUser();
  } catch {
    return NextResponse.json({ user: null });
  }
  if (!u) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      steamId: u.steam_id,
      persona: u.persona,
      avatar: u.avatar,
      profileUrl: u.profile_url,
      role: u.role,
    },
  });
}
