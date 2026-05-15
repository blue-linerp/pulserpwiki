import type { WikiPage } from "@/data/types";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Convert the legacy intro + sections representation of a page into
 * HTML compatible with the TipTap rich editor. Lines starting with "- "
 * become list items, blank lines start a new paragraph, otherwise each
 * non-empty line is a paragraph.
 */
export function articleToHtml(page: WikiPage): string {
  if (page.content && page.content.trim()) return page.content;

  const parts: string[] = [];
  for (const p of page.intro ?? []) {
    const t = p.trim();
    if (t) parts.push(`<p>${escapeHtml(t)}</p>`);
  }

  for (const s of page.sections ?? []) {
    parts.push(`<h2>${escapeHtml(s.heading)}</h2>`);
    let inList = false;
    for (const line of s.body) {
      if (line.startsWith("- ")) {
        if (!inList) {
          parts.push("<ul>");
          inList = true;
        }
        parts.push(`<li>${escapeHtml(line.slice(2))}</li>`);
      } else {
        if (inList) {
          parts.push("</ul>");
          inList = false;
        }
        const t = line.trim();
        if (t) parts.push(`<p>${escapeHtml(t)}</p>`);
      }
    }
    if (inList) parts.push("</ul>");
  }

  return parts.join("");
}

/**
 * Replace `[[Page Title]]` and `[[Title|Display]]` patterns inside an
 * already-rendered HTML string with `<a>` tags. Used at view time so
 * editors can keep typing wikilink shorthands inside the rich editor.
 */
export function applyWikilinks(
  html: string,
  index: Map<string, string>,
  currentSlug?: string
): string {
  if (!html) return html;
  return html.replace(
    /\[\[([^\]|\n]+?)(?:\|([^\]\n]+?))?\]\]/g,
    (_, target: string, display?: string) => {
      const t = String(target).trim();
      const d = (display ?? target).trim();
      const tLc = t.toLowerCase();
      const slug =
        index.get(tLc) ??
        t
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-");
      const known = index.has(tLc);
      const isSelf = known && index.get(tLc) === currentSlug;
      if (isSelf) {
        return `<span class="font-semibold text-zinc-100">${escapeHtml(d)}</span>`;
      }
      const cls = known
        ? "text-pulse-400 hover:text-pulse-300 underline decoration-pulse-700/50 hover:decoration-pulse-500 underline-offset-2"
        : "text-pulse-500 hover:text-pulse-400 underline decoration-dashed decoration-pulse-700/60 underline-offset-2";
      return `<a href="/wiki/${slug}" class="${cls}">${escapeHtml(d)}</a>`;
    }
  );
}
