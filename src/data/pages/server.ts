// Server-only module — must not be imported by client components.
import type { WikiPage } from "../types";
import { staticPages, getStaticPage } from "./index";
import { Pages } from "@/lib/db";
import { unstable_cache } from "next/cache";

export { getStaticPage };

// Fetch ALL db state in two queries instead of N+1 queries per static page
async function fetchAllDbState(): Promise<{
  pageMap: Map<string, string>;
  hiddenSet: Set<string>;
  customRows: string[];
}> {
  const [allPages, allHidden, allCustom] = await Promise.all([
    Pages.allRows(),
    Pages.allHidden(),
    Pages.allCustom(),
  ]);

  const pageMap = new Map(allPages.map((r) => [r.slug, r.data]));
  const hiddenSet = new Set(allHidden.map((r) => r.slug));
  const customRows = allCustom.map((r) => r.data);

  return { pageMap, hiddenSet, customRows };
}

export const getAllPages = unstable_cache(
  async (): Promise<WikiPage[]> => {
    const { pageMap, hiddenSet, customRows } = await fetchAllDbState();

    const merged: WikiPage[] = [];
    for (const p of staticPages) {
      if (hiddenSet.has(p.slug)) continue;
      const override = pageMap.get(p.slug);
      if (override) {
        try { merged.push(JSON.parse(override) as WikiPage); continue; } catch {}
      }
      merged.push(p);
    }
    for (const data of customRows) {
      try { merged.push(JSON.parse(data) as WikiPage); } catch {}
    }
    return merged;
  },
  ["all-pages"],
  { revalidate: 30, tags: ["wiki-pages"] }
);

export async function getPage(slug: string): Promise<WikiPage | undefined> {
  if (await Pages.isHidden(slug)) return undefined;
  const row = await Pages.get(slug);
  if (row) {
    try { return JSON.parse(row.data) as WikiPage; } catch {}
  }
  return getStaticPage(slug);
}

export async function getCustomPagesByCategory(category: string): Promise<WikiPage[]> {
  return (await Pages.byCategory(category))
    .map((r) => {
      try { return JSON.parse(r.data) as WikiPage; } catch { return null; }
    })
    .filter((p): p is WikiPage => p !== null);
}