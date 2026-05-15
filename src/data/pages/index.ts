// Client-safe page index. NEVER imports the DB.
import type { WikiPage } from "../types";
import { corePages } from "./core";
import { departmentPages } from "./departments";
import { systemPages } from "./systems";
import { worldPages } from "./world";

export const staticPages: WikiPage[] = [
  ...corePages,
  ...departmentPages,
  ...systemPages,
  ...worldPages,
];

const staticBySlug = new Map(staticPages.map((p) => [p.slug, p]));

export function getStaticPage(slug: string): WikiPage | undefined {
  return staticBySlug.get(slug);
}

/** Static-only search for client use. */
export function searchPages(query: string): WikiPage[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return staticPages
    .filter((p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    )
    .slice(0, 8);
}

// Legacy alias for client search component.
export const pages: WikiPage[] = staticPages;

export type { WikiPage } from "../types";

