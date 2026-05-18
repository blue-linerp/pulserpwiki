"use client";

import { useEffect, useState } from "react";
import { X, RotateCcw, Loader2, History as HistoryIcon, AlertTriangle, User } from "lucide-react";

interface HistoryEntry {
  id: number;
  updated_at: number;
  summary: string | null;
  size: number;
  editor: {
    steamId: string | null;
    persona: string | null;
    avatar: string | null;
  };
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryModal({
  slug,
  pageTitle,
  onClose,
}: {
  slug: string;
  pageTitle?: string;
  onClose: () => void;
}) {
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/pages/${slug}/history`, { cache: "no-store", credentials: "include" })
      .then(async (r) => {
        if (!r.ok) {
          throw new Error(
            r.status === 403
              ? "You need admin privileges to view history."
              : `Failed (${r.status})`
          );
        }
        return r.json() as Promise<{ entries: HistoryEntry[] }>;
      })
      .then((data) => {
        if (!cancelled) setEntries(data.entries);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // ESC closes
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function restore(id: number) {
    if (!confirm("Restore this revision? The current version will be overwritten (and saved to history).")) return;
    setRestoringId(id);
    try {
      const res = await fetch(`/api/pages/${slug}/history`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restore: id }),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        alert(`Restore failed (${res.status}): ${t || res.statusText}`);
        return;
      }
      window.location.href = `/wiki/${slug}`;
    } finally {
      setRestoringId(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="panel w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
      >
        <div className="px-5 py-3 border-b border-line flex items-center gap-3">
          <HistoryIcon className="w-4 h-4 text-pulse-500 shrink-0" />
          <div className="min-w-0 flex-1">
            <h2 className="font-display font-bold text-white text-sm uppercase tracking-wider">
              Edit history
            </h2>
            <div className="text-[11px] text-zinc-500 truncate">
              {pageTitle ? `${pageTitle} · ` : ""}/wiki/{slug}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-panel2 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {error ? (
            <div className="p-6 flex items-start gap-3 text-sm text-amber-300">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold">Cannot load history</div>
                <div className="text-amber-300/80 mt-1">{error}</div>
              </div>
            </div>
          ) : !entries ? (
            <div className="p-12 flex items-center justify-center text-zinc-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading history…
            </div>
          ) : entries.length === 0 ? (
            <div className="p-12 text-center text-sm text-zinc-500">
              No edit history yet for this page.
              <div className="text-[11px] text-zinc-600 mt-1">
                History is captured each time the page is saved from the editor.
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {entries.map((e, idx) => {
                const isCurrent = idx === 0;
                return (
                  <li
                    key={e.id}
                    className={`px-5 py-3 flex items-start gap-3 hover:bg-panel2/40 transition ${
                      isCurrent ? "bg-pulse-900/10" : ""
                    }`}
                  >
                    {/* Editor avatar */}
                    {e.editor.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={e.editor.avatar}
                        alt=""
                        className="w-8 h-8 rounded border border-line shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded border border-line bg-panel2 flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5 text-zinc-500" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-white truncate">
                          {e.editor.persona || e.editor.steamId || "Unknown editor"}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-pulse-900/40 border border-pulse-700/50 text-pulse-300">
                            Current
                          </span>
                        )}
                        <span
                          className="text-[11px] text-zinc-500"
                          title={formatDate(e.updated_at)}
                        >
                          {timeAgo(e.updated_at)}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5 break-words">
                        {e.summary || "No summary"}
                      </div>
                      <div className="text-[10px] text-zinc-600 mt-1 font-mono">
                        {(e.size / 1024).toFixed(1)} KB · {formatDate(e.updated_at)}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {!isCurrent && (
                        <button
                          onClick={() => restore(e.id)}
                          disabled={restoringId !== null}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] rounded-md border border-line bg-panel2 hover:border-pulse-700/60 hover:bg-pulse-900/20 hover:text-white text-zinc-300 transition disabled:opacity-50"
                          title="Restore this version (current version will be overwritten)"
                        >
                          {restoringId === e.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3 h-3" />
                          )}
                          Restore
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="px-5 py-2.5 border-t border-line text-[11px] text-zinc-500 bg-panel2/30">
          {entries
            ? `${entries.length} revision${entries.length === 1 ? "" : "s"}`
            : ""}
        </div>
      </div>
    </div>
  );
}
