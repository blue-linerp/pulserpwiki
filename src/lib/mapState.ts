"use client";

import { useEffect, useState, useCallback } from "react";
import {
  mapCategories as DEFAULT_CATEGORIES,
  mapMarkers as DEFAULT_MARKERS,
  type MapMarker,
  type MapMarkerCategory,
} from "@/data/mapMarkers";

const STORAGE_KEY = "pulse-map-state:v2";

export interface MapMeta {
  name: string;
  description: string;
  warning: string;
  progressTracking: boolean;
}

export interface MapCategoryConfig {
  id: string;
  label: string;
  color: string;
  enabled: boolean;
}

export interface MarkerOverride {
  x?: number;
  y?: number;
  categoryId?: string;
}

/** User-added marker (loose category id, optional custom icon). */
export interface CustomMarker {
  id: string;
  name: string;
  category: string;
  x: number;
  y: number;
  description?: string;
  href?: string;
  linkLabel?: string;
  image?: string;
  customIcon?: string;
}

export interface MapState {
  meta: MapMeta;
  categories: MapCategoryConfig[];
  /** keyed by marker id */
  markerOverrides: Record<string, MarkerOverride>;
  /** User-added markers persisted alongside defaults. */
  customMarkers: CustomMarker[];
}

export const DEFAULT_META: MapMeta = {
  name: "Map:Los Santos Pulse Roleplay",
  description:
    "This is an overall map of the Southern San Andreas Island canon in PulseRP. It contains landmarks and key locations.",
  warning: "WARNING: ASSUME ALL LOCATIONS SHOWN ON THIS MAP REVEAL META INFO!",
  progressTracking: false,
};

export function getDefaultCategories(): MapCategoryConfig[] {
  return DEFAULT_CATEGORIES.map((c) => ({ ...c, enabled: true }));
}

export function getDefaultState(): MapState {
  return {
    meta: { ...DEFAULT_META },
    categories: getDefaultCategories(),
    markerOverrides: {},
    customMarkers: [],
  };
}

export function useMapState() {
  const [state, setState] = useState<MapState>(getDefaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          setState((prev) => ({
            ...prev,
            ...parsed,
            meta: { ...prev.meta, ...(parsed.meta ?? {}) },
            categories: Array.isArray(parsed.categories) && parsed.categories.length
              ? parsed.categories
              : prev.categories,
            markerOverrides: parsed.markerOverrides ?? {},
            customMarkers: Array.isArray(parsed.customMarkers)
              ? parsed.customMarkers
              : [],
          }));
        }
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota */
    }
  }, [state, hydrated]);

  const reset = useCallback(() => setState(getDefaultState()), []);

  return { state, setState, hydrated, reset };
}

/** Compose default markers with stored overrides + custom user markers. */
export function effectiveMarkers(state: MapState): MapMarker[] {
  const base = DEFAULT_MARKERS.map((m) => {
    const o = state.markerOverrides[m.id];
    if (!o) return m;
    const category = (o.categoryId as MapMarkerCategory) ?? m.category;
    return {
      ...m,
      x: o.x ?? m.x,
      y: o.y ?? m.y,
      category,
    };
  });
  const custom: MapMarker[] = state.customMarkers.map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category as MapMarkerCategory,
    x: c.x,
    y: c.y,
    description: c.description,
    href: c.href,
  }));
  return [...base, ...custom];
}

/** Build a TS snippet suitable for pasting back into src/data/mapMarkers.ts. */
export function buildMarkersExport(markers: MapMarker[]): string {
  const lines: string[] = [];
  lines.push("export const mapMarkers: MapMarker[] = [");
  for (const m of markers) {
    lines.push("  {");
    lines.push(`    id: ${JSON.stringify(m.id)},`);
    lines.push(`    name: ${JSON.stringify(m.name)},`);
    lines.push(`    category: ${JSON.stringify(m.category)},`);
    lines.push(`    x: ${m.x}, y: ${m.y},`);
    if (m.description)
      lines.push(`    description: ${JSON.stringify(m.description)},`);
    if (m.href) lines.push(`    href: ${JSON.stringify(m.href)},`);
    lines.push("  },");
  }
  lines.push("];");
  return lines.join("\n");
}
