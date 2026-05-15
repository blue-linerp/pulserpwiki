import { getSessionCookie } from "./session";
import { Users, type DbUser } from "./db";

export function getCurrentUser(): DbUser | null {
  const s = getSessionCookie();
  if (!s) return null;
  return Users.get(s.steam_id) ?? null;
}

export function requireAdmin(): DbUser {
  const u = getCurrentUser();
  if (!u || u.role !== "admin") {
    throw new Response("Forbidden", { status: 403 });
  }
  return u;
}
