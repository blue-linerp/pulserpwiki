/**
 * src/lib/siteSettings.ts
 */
import { db, ensureSchema } from "./db";

async function fetchSettings(): Promise<Record<string, string>> {
  try {
    await ensureSchema();
    await db.execute(`CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`);
    const r = await db.execute("SELECT key, value FROM site_settings");
    const out: Record<string, string> = {};
    for (const row of r.rows) out[String(row.key)] = String(row.value);
    return out;
  } catch {
    return {};
  }
}

// NOTE: We intentionally do NOT cache settings in memory.
// In Next.js dev with HMR, module-level caches can live in a different
// instance from the one that handles the admin POST, which made
// `invalidateSettingsCache()` effectively a no-op for some requests and
// caused toggles to "not take effect" until the TTL expired. The
// site_settings table is tiny (key/value rows), so a single SELECT per
// request is cheaper than the bug.
export async function getSettings(): Promise<Record<string, string>> {
  return fetchSettings();
}

// Kept for API compatibility — no-op now that we don't cache.
export function invalidateSettingsCache() {
  /* no-op */
}

export function isEnabled(settings: Record<string, string>, key: string, def = true): boolean {
  if (!(key in settings)) return def;
  return settings[key] === "1";
}

export function isPageEnabled(settings: Record<string, string>, slug: string): boolean {
  return isEnabled(settings, `page_enabled:${slug}`);
}

export function isSidebarGroupEnabled(settings: Record<string, string>, title: string): boolean {
  return isEnabled(settings, `sidebar_group:${title}`);
}

export function isSidebarLinkEnabled(settings: Record<string, string>, href: string): boolean {
  return isEnabled(settings, `sidebar_link:${href}`);
}

export function isCategoryEnabled(settings: Record<string, string>, id: string): boolean {
  return isEnabled(settings, `category_enabled:${id}`);
}

export function isFeatureEnabled(settings: Record<string, string>, feature: string): boolean {
  return isEnabled(settings, `feature:${feature}`);
}