/**
 * src/app/api/admin/settings/route.ts
 * Stores arbitrary key-value site settings in Turso.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, ensureSchema } from "@/lib/db";
import { invalidateSettingsCache } from "@/lib/siteSettings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function ensureSettingsTable() {
  await ensureSchema();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
}

export async function GET() {
  await ensureSettingsTable();
  const r = await db.execute("SELECT key, value FROM site_settings");
  const settings: Record<string, string> = {};
  for (const row of r.rows) settings[String(row.key)] = String(row.value);
  return NextResponse.json({ settings });
}

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me || me.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await ensureSettingsTable();
  let body: Record<string, string> = {};
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  for (const [key, value] of Object.entries(body)) {
    await db.execute({
      sql: `INSERT INTO site_settings(key, value) VALUES (?,?)
            ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
      args: [key, String(value)],
    });
  }
  invalidateSettingsCache();
  return NextResponse.json({ ok: true });
}