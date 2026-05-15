"use client";

import { useState } from "react";
import { slugify } from "@/lib/slug";

export default function TableOfContents({ headings }: { headings: string[] }) {
  const [open, setOpen] = useState(true);
  if (!headings.length) return null;

  return (
    <nav className="float-left mr-6 mb-4 min-w-[240px] max-w-[300px] border border-crimson/50 bg-[#1a0d0d] clear-left shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#2a0f0f] border-b border-crimson/40">
        <span className="font-display font-semibold text-zinc-100 text-sm tracking-wide">≡ Contents</span>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-[11px] text-zinc-400 hover:text-white border border-zinc-600 hover:border-zinc-400 px-2 py-0.5 rounded transition"
          aria-label={open ? "Hide contents" : "Show contents"}
        >
          {open ? "[−]" : "[+]"}
        </button>
      </div>

      {/* List */}
      {open && (
        <ol className="p-2 space-y-1">
          {headings.map((h, i) => {
            const id = slugify(h);
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    history.replaceState(null, "", `#${id}`);
                  }}
                  className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-[14px] text-zinc-200 rounded border border-transparent bg-[#220a0a] hover:bg-[#3a1212] hover:border-crimson/60 hover:text-white transition"
                >
                  <span className="text-crimson tabular-nums font-semibold shrink-0">{i + 1}.</span>
                  <span className="truncate">{h}</span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </nav>
  );
}

