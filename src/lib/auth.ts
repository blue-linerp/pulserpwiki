import { getSessionCookie } from "./session";
import { Users, type DbUser } from "./db";

export function getCurrentUser(): DbUser | null {
  const s = getSessionCookie();
  if (!s) return null;
  const user = Users.get(s.steam_id);
  if (user) return user;
  if (s.role) {
    return {
      steam_id: s.steam_id,
      persona: null,
      avatar: null,
      profile_url: null,
      role: s.role,
      created_at: 0,
    };
  }
  return null;
}

export function requireAdmin(): DbUser {
  const u = getCurrentUser();
  if (!u || u.role !== "admin") {
    throw new Response("Forbidden", { status: 403 });
  }
  return u;
}
