"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search as SearchIcon, X, Loader2 } from "lucide-react";

interface SearchResult {
  slug: string;
  title: string;
  description: string;
  category: string;
}

export default function Search({ compact = false }: { compact?: boolean }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const query = q.trim();
    if (query.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json() as SearchResult[];
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [q]);

  return (
    <div ref={ref} className={`relative ${compact ? "w-full" : "w-full max-w-md"}`}>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          value={q}
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          placeholder="Search the Pulse RP Wiki…"
          className="w-full bg-panel2 border border-line rounded-md pl-9 pr-9 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-pulse-600/60 focus:ring-2 focus:ring-pulse-600/20 transition"
        />
        {q ? (
          <button
            onClick={() => { setQ(""); setResults([]); setOpen(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200"
            aria-label="Clear"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
        {loading && (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 animate-spin" />
        )}
      </div>
      {open && q.trim().length >= 2 && (
        <div className="absolute z-50 mt-2 w-full bg-panel border border-line rounded-md shadow-2xl overflow-hidden">
          {loading && results.length === 0 ? (
            <div className="p-4 text-sm text-zinc-500 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching…
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-sm text-zinc-500">No matching pages.</div>
          ) : (
            <ul className="max-h-96 overflow-auto scrollbar-thin">
              {results.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/wiki/${p.slug}`}
                    onClick={() => { setOpen(false); setQ(""); }}
                    className="flex flex-col gap-0.5 px-4 py-3 hover:bg-panel2 border-b border-line last:border-0"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-white">{p.title}</span>
                      <span className="text-[10px] uppercase tracking-wider text-pulse-500 border border-pulse-700/40 bg-pulse-900/20 px-1.5 py-0.5 rounded">
                        {p.category}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-400 line-clamp-1">{p.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
