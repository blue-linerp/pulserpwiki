// Server-only module — must not be imported by client components.
import type { WikiPage } from "../types";
import { staticPages, getStaticPage } from "./index";
import { Pages } from "@/lib/db";

export { getStaticPage };

export async function getPage(slug: string): Promise<WikiPage | undefined> {
  if (await Pages.isHidden(slug)) return undefined;
  const row = await Pages.get(slug);
  if (row) {
    try {
      return JSON.parse(row.data) as WikiPage;
    } catch {
      /* fallthrough */
    }
  }
  return getStaticPage(slug);
}

export async function getAllPages(): Promise<WikiPage[]> {
  const overrides = new Map<string, WikiPage>();
  for (const sp of staticPages) {
    if (await Pages.isHidden(sp.slug)) continue;
    const row = await Pages.get(sp.slug);
    if (row) {
      try { overrides.set(sp.slug, JSON.parse(row.data) as WikiPage); } catch {}
    }
  }
  const merged: WikiPage[] = [];
  for (const p of staticPages) {
    if (await Pages.isHidden(p.slug)) continue;
    merged.push(overrides.get(p.slug) ?? p);
  }
  const customRows = await Pages.allCustom();
  for (const r of customRows) {
    try { merged.push(JSON.parse(r.data) as WikiPage); } catch {}
  }
  return merged;
}

export async function getCustomPagesByCategory(category: string): Promise<WikiPage[]> {
  return (await Pages.byCategory(category))
    .map((r) => {
      try { return JSON.parse(r.data) as WikiPage; } catch { return null; }
    })
    .filter((p): p is WikiPage => p !== null);
}