// Server-only module — must not be imported by client components.
import type { WikiPage } from "../types";
import { staticPages, getStaticPage } from "./index";
import { Pages } from "@/lib/db";

export { getStaticPage };

export function getPage(slug: string): WikiPage | undefined {
  if (Pages.isHidden(slug)) return undefined;
  const row = Pages.get(slug);
  if (row) {
    try {
      return JSON.parse(row.data) as WikiPage;
    } catch {
      /* fallthrough */
    }
  }
  return getStaticPage(slug);
}

export function getAllPages(): WikiPage[] {
  const overrides = new Map<string, WikiPage>();
  for (const sp of staticPages) {
    if (Pages.isHidden(sp.slug)) continue;
    const row = Pages.get(sp.slug);
    if (row) {
      try { overrides.set(sp.slug, JSON.parse(row.data) as WikiPage); } catch {}
    }
  }
  const merged: WikiPage[] = staticPages
    .filter((p) => !Pages.isHidden(p.slug))
    .map((p) => overrides.get(p.slug) ?? p);
  const customRows = Pages.allCustom();
  for (const r of customRows) {
    try { merged.push(JSON.parse(r.data) as WikiPage); } catch {}
  }
  return merged;
}

export function getCustomPagesByCategory(category: string): WikiPage[] {
  return Pages.byCategory(category)
    .map((r) => {
      try { return JSON.parse(r.data) as WikiPage; } catch { return null; }
    })
    .filter((p): p is WikiPage => p !== null);
}
