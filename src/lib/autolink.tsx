import React from "react";
import Link from "next/link";
import { getAllPages } from "@/data/pages/server";
import { slugify } from "./slug";

const WIKI_LINK_RE = /\[\[([^\]|\n]+?)(?:\|([^\]\n]+?))?\]\]/g;

const LINK_RESOLVED =
  "text-pulse-400 hover:text-pulse-300 underline decoration-pulse-700/50 hover:decoration-pulse-500 underline-offset-2";
const LINK_NEW =
  "text-pulse-500 hover:text-pulse-400 underline decoration-dashed decoration-pulse-700/60 underline-offset-2";

/**
 * Build a lookup of lowercased title -> slug for all live pages.
 * Now async to match the async getAllPages().
 */
export async function buildTitleIndex(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for (const p of await getAllPages()) {
    const key = p.title.trim().toLowerCase();
    if (key.length >= 3 && !map.has(key)) map.set(key, p.slug);
  }
  return map;
}

export function autoLink(
  text: string,
  index: Map<string, string>,
  excludeSlug?: string
): React.ReactNode {
  if (!text) return text;

  const out: React.ReactNode[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  let counter = 0;
  WIKI_LINK_RE.lastIndex = 0;

  while ((m = WIKI_LINK_RE.exec(text)) !== null) {
    if (m.index > lastIndex) out.push(text.slice(lastIndex, m.index));
    const target = m[1].trim();
    const display = (m[2] ?? m[1]).trim();
    const targetLc = target.toLowerCase();
    const knownSlug = index.get(targetLc);
    const slug = knownSlug ?? slugify(target);
    const isSelf = knownSlug && knownSlug === excludeSlug;
    if (isSelf) {
      out.push(
        <span key={`w-${counter++}`} className="font-semibold text-zinc-100">
          {display}
        </span>
      );
    } else {
      out.push(
        <Link
          key={`w-${counter++}`}
          href={`/wiki/${slug}`}
          className={knownSlug ? LINK_RESOLVED : LINK_NEW}
          title={knownSlug ? undefined : `Page "${target}" not yet created`}
        >
          {display}
        </Link>
      );
    }
    lastIndex = m.index + m[0].length;
  }

  if (lastIndex < text.length) out.push(text.slice(lastIndex));
  return out;
}