/**
 * auth.ts — async version for Turso
 * Drop this at  src/lib/auth.ts
 */
import { getSessionCookie } from "./session";
import { Users, type DbUser } from "./db";

export async function getCurrentUser(): Promise<DbUser | null> {
  const s = getSessionCookie();
  if (!s) return null;
  const user = await Users.get(s.steam_id);
  if (user) return user;
  if (s.role) {
    return {
      steam_id: s.steam_id,
      persona: s.persona ?? null,
      avatar: s.avatar ?? null,
      profile_url: s.profile_url ?? null,
      role: s.role,
      created_at: 0,
    };
  }
  return null;
}

export async function requireAdmin(): Promise<DbUser> {
  const u = await getCurrentUser();
  if (!u || u.role !== "admin") {
    throw new Response("Forbidden", { status: 403 });
  }
  return u;
}
