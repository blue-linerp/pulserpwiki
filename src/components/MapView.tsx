"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  Bookmark,
  Pencil,
  MoreVertical,
  ChevronDown,
  Filter,
  Maximize2,
  X,
} from "lucide-react";
import MapCanvas, { type MapStyle } from "./MapCanvas";
import { useMapState, effectiveMarkers } from "@/lib/mapState";
import type { MapMarker } from "@/data/mapMarkers";

/**
 * Read-only map view modeled after Fandom's Interactive Maps.
 * Editing lives at /wiki/map?action=mapedit.
 */
export default function MapView() {
  const { state } = useMapState();
  const [style] = useState<MapStyle>("atlas");
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<MapMarker | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Initialize / sync filter state when categories change.
  useEffect(() => {
    setEnabled((prev) => {
      const next: Record<string, boolean> = {};
      for (const c of state.categories) {
        next[c.id] = c.id in prev ? prev[c.id] : c.enabled;
      }
      return next;
    });
  }, [state.categories]);

  const allMarkers = useMemo(() => effectiveMarkers(state), [state]);

  const visibleMarkers = useMemo(
    () => allMarkers.filter((m) => enabled[m.category] !== false),
    [allMarkers, enabled]
  );

  const categoryColorMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of state.categories) m[c.id] = c.color;
    return m;
  }, [state.categories]);

  function categoryColor(id: string) {
    return categoryColorMap[id] ?? "#dc2626";
  }

  function toggleCategory(id: string) {
    setEnabled((p) => ({ ...p, [id]: !p[id] }));
  }

  function toggleAll(on: boolean) {
    const next: Record<string, boolean> = {};
    for (const c of state.categories) next[c.id] = on;
    setEnabled(next);
  }

  function enterFullscreen() {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen?.();
    }
  }

  return (
    <div className="panel overflow-hidden relative">
      {/* Red accent bar */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-pulse-700 via-pulse-500 to-crimson" />

      {/* Header */}
      <div className="px-4 md:px-5 pt-4 pb-3 border-b border-line">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <h1 className="font-display font-extrabold text-xl md:text-2xl text-white tracking-tight min-w-0">
            {state.meta.name}
          </h1>
          <div className="flex items-center gap-1.5">
            <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border border-line bg-panel2 hover:bg-panel hover:border-pulse-700/60 text-zinc-300 hover:text-white transition">
              <Bookmark className="w-3.5 h-3.5 text-pulse-400" /> SAVE
            </button>
            <Link
              href="/wiki/map?action=mapedit"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border border-line bg-panel2 hover:bg-panel hover:border-pulse-700/60 text-zinc-300 hover:text-white transition"
            >
              <Pencil className="w-3.5 h-3.5 text-pulse-400" /> EDIT
            </Link>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1.5 rounded-md border border-line bg-panel2 hover:bg-panel text-zinc-400 hover:text-white transition"
              aria-label="More"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-[13px] text-zinc-400 mt-1.5 leading-relaxed">
          {state.meta.description}{" "}
          <span className="text-zinc-200 font-semibold italic">
            {state.meta.warning}
          </span>
        </p>
      </div>

      {/* Map area */}
      <div
        ref={containerRef}
        className="relative bg-[#1a0e16]"
        style={{ height: "min(78vh, 720px)" }}
      >
        {/* Filters dropdown */}
        <div className="absolute top-3 left-3 z-[500]">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider bg-pulse-600 hover:bg-pulse-500 text-white shadow-glow border border-pulse-500/60 transition"
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${
                filtersOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {filtersOpen && (
            <div className="mt-1.5 panel p-2 w-56 shadow-glow">
              <div className="flex items-center justify-between px-1 py-1 mb-1 border-b border-line">
                <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                  Filter categories
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleAll(true)}
                    className="text-[10px] text-pulse-400 hover:text-pulse-300"
                  >
                    All
                  </button>
                  <span className="text-zinc-700">|</span>
                  <button
                    onClick={() => toggleAll(false)}
                    className="text-[10px] text-zinc-500 hover:text-white"
                  >
                    None
                  </button>
                </div>
              </div>
              <ul className="max-h-72 overflow-y-auto scrollbar-thin">
                {state.categories.map((c) => {
                  const on = enabled[c.id] !== false;
                  return (
                    <li key={c.id}>
                      <button
                        onClick={() => toggleCategory(c.id)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] transition ${
                          on
                            ? "text-white hover:bg-panel2"
                            : "text-zinc-500 hover:text-zinc-200 hover:bg-panel2"
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{
                            background: on ? c.color : "transparent",
                            boxShadow: `inset 0 0 0 2px ${c.color}`,
                          }}
                        />
                        <span className="flex-1 text-left truncate">
                          {c.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Kebab + fullscreen, top-right */}
        <div className="absolute top-3 right-3 z-[500] flex flex-col gap-1.5">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1.5 rounded-md bg-pulse-600 hover:bg-pulse-500 text-white border border-pulse-500/60 shadow-glow transition"
            aria-label="Map menu"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="panel p-1 w-44">
              <button
                onClick={() => {
                  enterFullscreen();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-2 py-1.5 rounded text-xs text-zinc-300 hover:bg-panel2 hover:text-white flex items-center gap-2"
              >
                <Maximize2 className="w-3.5 h-3.5" /> Fullscreen
              </button>
              <Link
                href="/wiki/map?action=mapedit"
                className="block px-2 py-1.5 rounded text-xs text-zinc-300 hover:bg-panel2 hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                Open editor
              </Link>
            </div>
          )}
        </div>

        {/* Leaflet map */}
        <MapCanvas
          markers={visibleMarkers}
          categoryColor={categoryColor}
          style={style}
          selectedId={selected?.id ?? null}
          onSelect={(m) => setSelected(m)}
          className="absolute inset-0"
        />

        {/* Fullscreen toggle bottom-right (above zoom controls) */}
        <button
          onClick={enterFullscreen}
          className="absolute right-3 bottom-24 z-[500] p-1.5 rounded-md bg-pulse-600 hover:bg-pulse-500 text-white border border-pulse-500/60 shadow-glow"
          aria-label="Fullscreen"
          title="Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Selected marker card */}
        {selected && (
          <div className="absolute left-3 bottom-3 z-[500] panel p-3 w-72 max-w-[calc(100%-1.5rem)] shadow-glow">
            <div className="flex items-start gap-2">
              <span
                className="mt-1 w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: categoryColor(selected.category) }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                  {state.categories.find((c) => c.id === selected.category)
                    ?.label ?? selected.category}
                </div>
                <div className="text-white font-semibold text-sm truncate">
                  {selected.name}
                </div>
                {selected.description && (
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {selected.description}
                  </p>
                )}
                {selected.href && (
                  <Link
                    href={selected.href}
                    className="inline-flex items-center gap-1 mt-2 text-xs text-pulse-400 hover:text-pulse-300"
                  >
                    View page &rarr;
                  </Link>
                )}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-zinc-500 hover:text-white"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Categories accordion */}
      <div className="border-t border-line">
        <button
          onClick={() => setCategoriesOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 md:px-5 py-3 text-left hover:bg-panel2 transition"
        >
          <span className="font-display font-semibold text-white text-sm uppercase tracking-wider">
            Categories
          </span>
          <ChevronDown
            className={`w-4 h-4 text-zinc-400 transition-transform ${
              categoriesOpen ? "" : "-rotate-90"
            }`}
          />
        </button>
        {categoriesOpen && (
          <div className="px-4 md:px-5 pb-4">
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5">
              {state.categories.map((c) => {
                const count = allMarkers.filter((m) => m.category === c.id).length;
                const on = enabled[c.id] !== false;
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => toggleCategory(c.id)}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md border text-sm transition ${
                        on
                          ? "border-line bg-panel2 text-white"
                          : "border-transparent text-zinc-500 hover:text-zinc-200 hover:bg-panel2"
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          background: on ? c.color : "transparent",
                          boxShadow: `inset 0 0 0 2px ${c.color}`,
                        }}
                      />
                      <span className="flex-1 text-left truncate">{c.label}</span>
                      <span className="text-[11px] text-zinc-500">{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
