/**
 * processTemplates.ts
 * Processes {{TemplateName|arg1|arg2}} shortcodes in wiki HTML content
 * and replaces them with rendered HTML.
 *
 * Call this on page.content before passing to dangerouslySetInnerHTML.
 */

import { resolveLspdRank } from "@/data/lspdRanks";

/**
 * Replace all {{LSPDRank|code|size}} occurrences with an <img> tag.
 */
function processLspdRank(html: string): string {
  return html.replace(
    /\{\{LSPDRank\|([^|}]+)(?:\|([^}]+))?\}\}/gi,
    (_, code: string, size?: string) => {
      const rank = resolveLspdRank(code.trim());
      if (!rank) return `<span class="text-xs text-zinc-500 italic">[unknown rank: ${code}]</span>`;
      const w = size ? parseInt(size) : rank.width;
      return `<img src="${rank.imageUrl}" alt="${rank.label}" title="${rank.label}" width="${w}" class="inline-block align-middle" />`;
    }
  );
}

/**
 * Master template processor — add new templates here as needed.
 */
export function processWikiTemplates(html: string): string {
  let out = html;
  out = processLspdRank(out);
  return out;
}