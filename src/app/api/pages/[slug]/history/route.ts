/**
 * GET    /api/pages/[slug]/history       — list edit history (admin only)
 * POST   /api/pages/[slug]/history       — body { restore: <history_id> } restores a past version (admin only)
 */
import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { Pages, db, ensureSchema } from "@/lib/db";
import { getStaticPage } from "@/data/pages/server";
import type { WikiPage } from "@/data/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function requireAdmin() {
  const me = await getCurrentUser();
  if (!me || me.role !== "admin") return null;
  return me;
}

interface HistoryEntryDTO {
  id: number;
  updated_at: number;
  summary: string | null;
  editor: {
    steamId: string | null;
    persona: string | null;
    avatar: string | null;
  };
  size: number;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await ensureSchema();
  const rows = await Pages.history(params.slug, 200);

  // Resolve editor identities in a single batch query.
  const ids = Array.from(
    new Set(rows.map((r) => r.updated_by).filter((v): v is string => !!v))
  );
  const personas = new Map<string, { persona: string | null; avatar: string | null }>();
  if (ids.length) {
    const placeholders = ids.map(() => "?").join(",");
    const r = await db.execute({
      sql: `SELECT steam_id, persona, avatar FROM users WHERE steam_id IN (${placeholders})`,
      args: ids,
    });
    for (const row of r.rows) {
      personas.set(String(row.steam_id), {
        persona: row.persona != null ? String(row.persona) : null,
        avatar: row.avatar != null ? String(row.avatar) : null,
      });
    }
  }

  const entries: HistoryEntryDTO[] = rows.map((r) => {
    const u = r.updated_by ? personas.get(r.updated_by) : undefined;
    return {
      id: r.id,
      updated_at: r.updated_at,
      summary: r.summary,
      size: r.data.length,
      editor: {
        steamId: r.updated_by,
        persona: u?.persona ?? null,
        avatar: u?.avatar ?? null,
      },
    };
  });

  return NextResponse.json({ entries });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const me = await requireAdmin();
  if (!me) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: { restore?: number } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const id = Number(body.restore);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Missing 'restore' history id" }, { status: 400 });
  }

  const entry = await Pages.historyEntry(id);
  if (!entry || entry.slug !== params.slug) {
    return NextResponse.json({ error: "History entry not found for this page" }, { status: 404 });
  }

  let parsed: WikiPage;
  try {
    parsed = JSON.parse(entry.data) as WikiPage;
  } catch {
    return NextResponse.json({ error: "History entry is corrupt" }, { status: 500 });
  }

  const isCustom = !getStaticPage(params.slug);
  const summary = `Restored revision from ${new Date(entry.updated_at).toISOString()}`;
  await Pages.upsert(params.slug, parsed, isCustom, me.steam_id, summary);
  await Pages.unhideStatic(params.slug);
  revalidateTag("wiki-pages");
  return NextResponse.json({ ok: true, restored: entry.id });
}

