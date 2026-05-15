import Link from "next/link";
import { Activity } from "lucide-react";
import { recentChanges } from "@/data/recent";

export default function RecentChanges() {
  return (
    <section className="panel p-4">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-line">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-pulse-500" />
          <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wide">Recent Changes</h3>
        </div>
        <Link href="/wiki/recent-changes" className="text-xs text-pulse-500 hover:text-pulse-400">View all</Link>
      </div>
      <ul className="divide-y divide-line">
        {recentChanges.map((c, i) => (
          <li key={i} className="py-2.5 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <Link href={c.href} className="text-sm font-medium text-white hover:text-pulse-400">
                {c.title}
              </Link>
              <span className="shrink-0 text-[11px] text-zinc-500">{c.when}</span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{c.summary}</p>
            <p className="text-[11px] text-zinc-600 mt-0.5">edited by <span className="text-zinc-400">{c.editor}</span></p>
          </li>
        ))}
      </ul>
    </section>
  );
}
