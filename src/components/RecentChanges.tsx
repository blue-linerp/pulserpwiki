import Link from "next/link";
import { Activity } from "lucide-react";
import { db, ensureSchema } from "@/lib/db";
import type { DbUser } from "@/lib/db";

interface RecentChange {
  title: string;
  slug: string;
  updatedAt: number;
  updatedBy: string | null;
  persona: string | null;
}

async function getRecentChanges(limit = 10): Promise<RecentChange[]> {
  await ensureSchema();

  const [pagesRes, usersRes] = await Promise.all([
    db.execute(
      `SELECT slug, data, updated_at, updated_by
       FROM pages
       ORDER BY updated_at DESC
       LIMIT ${limit}`
    ),
    db.execute("SELECT steam_id, persona FROM users"),
  ]);

  const userMap = new Map<string, string>();
  for (const row of usersRes.rows) {
    if (row.steam_id && row.persona) {
      userMap.set(String(row.steam_id), String(row.persona));
    }
  }

  return pagesRes.rows.map((row) => {
    let title = String(row.slug);
    try {
      const d = JSON.parse(String(row.data)) as { title?: string };
      if (d.title) title = d.title;
    } catch {}

    const updatedBy = row.updated_by ? String(row.updated_by) : null;
    const persona = updatedBy ? (userMap.get(updatedBy) ?? updatedBy) : null;

    return {
      title,
      slug: String(row.slug),
      updatedAt: Number(row.updated_at),
      updatedBy,
      persona,
    };
  });
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ms).toLocaleDateString();
}

export default async function RecentChanges({ limit = 6 }: { limit?: number }) {
  const changes = await getRecentChanges(limit);

  return (
    <section className="panel p-4">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-line">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-pulse-500" />
          <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wide">
            Recent Changes
          </h3>
        </div>
        <Link href="/wiki/recent-changes" className="text-xs text-pulse-500 hover:text-pulse-400">
          View all
        </Link>
      </div>

      {changes.length === 0 ? (
        <p className="text-xs text-zinc-500 py-2">No changes yet.</p>
      ) : (
        <ul className="divide-y divide-line">
          {changes.map((c) => (
            <li key={c.slug} className="py-2.5 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/wiki/${c.slug}`}
                  className="text-sm font-medium text-white hover:text-pulse-400"
                >
                  {c.title}
                </Link>
                <span className="shrink-0 text-[11px] text-zinc-500">
                  {timeAgo(c.updatedAt)}
                </span>
              </div>
              {c.persona && (
                <p className="text-[11px] text-zinc-600 mt-0.5">
                  edited by <span className="text-zinc-400">{c.persona}</span>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}