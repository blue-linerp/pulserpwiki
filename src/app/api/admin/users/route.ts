/**
 * src/app/api/admin/users/route.ts
 */
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { Users } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function serializeUser(u: Awaited<ReturnType<typeof Users.all>>[number]) {
  return {
    steamId: u.steam_id,
    persona: u.persona,
    avatar: u.avatar,
    profileUrl: u.profile_url,
    role: u.role,
    createdAt: u.created_at,
  };
}

export async function GET() {
  const me = await getCurrentUser();
  if (!me || me.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await Users.all();
  if (!users.some((u) => u.steam_id === me.steam_id)) users.unshift(me);

  return NextResponse.json({
    currentSteamId: me.steam_id,
    users: users.map(serializeUser),
  });
}

export async function PATCH(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me || me.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { steamId?: string; role?: "admin" | "user" } = {};
  try { body = (await req.json()) as typeof body; }
  catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }

  const { steamId, role } = body;
  if (!steamId || typeof steamId !== "string") {
    return NextResponse.json({ error: "Missing Steam ID." }, { status: 400 });
  }
  if (role !== "admin" && role !== "user") {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const target = await Users.get(steamId);
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

  if (steamId === me.steam_id && role !== "admin") {
    return NextResponse.json({ error: "You cannot remove your own admin access." }, { status: 400 });
  }

  const updated = await Users.setRole(steamId, role);
  if (!updated) return NextResponse.json({ error: "Update failed." }, { status: 500 });

  return NextResponse.json({ user: serializeUser(updated) });
}
