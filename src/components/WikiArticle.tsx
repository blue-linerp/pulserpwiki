import Link from "next/link";
import { Clock, Tag } from "lucide-react";
import type { WikiPage } from "@/data/types";
import WikiInfobox from "./WikiInfobox";
import TableOfContents from "./TableOfContents";
import { slugify } from "@/lib/slug";
import Breadcrumbs from "./Breadcrumbs";
import WikiActions from "./WikiActions";
import { autoLink, buildTitleIndex } from "@/lib/autolink";
import { applyWikilinks } from "@/lib/articleHtml";
import { getPage } from "@/data/pages/server";

const DEPARTMENTS_LOGO = "/uploads/1778868250233-291a3b9a8adf.png";

function extractHeadings(html: string): string[] {
  const matches = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)];
  return matches
    .map((m) =>
      m[1]
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&#39;/g, "'")
        .trim()
    )
    .filter(Boolean);
}

function splitNotice(html: string): { notice: string | null; rest: string } {
  const m = html.match(/<div\b[^>]*class="[^"]*\bwiki-notice\b[^"]*"[^>]*>/i);
  if (!m || m.index === undefined) return { notice: null, rest: html };
  const startIdx = m.index;
  const tagRe = /<(\/?)div\b[^>]*>/gi;
  tagRe.lastIndex = startIdx;
  let depth = 0;
  let endIdx = -1;
  let t: RegExpExecArray | null;
  while ((t = tagRe.exec(html))) {
    if (t[1]) { depth--; if (depth === 0) { endIdx = t.index + t[0].length; break; } }
    else { depth++; }
  }
  if (endIdx === -1) return { notice: null, rest: html };
  return { notice: html.slice(startIdx, endIdx), rest: html.slice(0, startIdx) + html.slice(endIdx) };
}

function makeRenderBody(index: Map<string, string>, currentSlug: string) {
  return function renderBody(lines: string[]) {
    const out: { type: "p" | "ul"; content: string[] }[] = [];
    for (const raw of lines) {
      if (raw.startsWith("- ")) {
        const last = out[out.length - 1];
        if (last && last.type === "ul") last.content.push(raw.slice(2));
        else out.push({ type: "ul", content: [raw.slice(2)] });
      } else {
        out.push({ type: "p", content: [raw] });
      }
    }
    return out.map((b, i) =>
      b.type === "ul" ? (
        <ul key={i}>
          {b.content.map((c, j) => <li key={j}>{autoLink(c, index, currentSlug)}</li>)}
        </ul>
      ) : (
        <p key={i}>{autoLink(b.content[0], index, currentSlug)}</p>
      )
    );
  };
}

export interface ResolvedRelated {
  slug: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
}

/** Server helper — call this from your async page components. */
export async function resolveRelatedPages(page: WikiPage): Promise<ResolvedRelated[]> {
  return Promise.all(
    page.related.map(async (r) => {
      const relatedPage = await getPage(r.slug);
      return {
        slug: r.slug,
        title: r.title,
        subtitle: relatedPage?.subtitle || relatedPage?.description,
        imageUrl: relatedPage?.infobox?.imageUrl || relatedPage?.imageUrl,
      };
    })
  );
}

export default async function WikiArticle({
  page,
  relatedPages,
}: {
  page: WikiPage;
  relatedPages: ResolvedRelated[];
}) {
  const headings = page.content?.trim()
    ? extractHeadings(page.content)
    : page.sections.map((s) => s.heading);
  const linkIndex = await buildTitleIndex();
  const renderBody = makeRenderBody(linkIndex, page.slug);

  return (
    <article className="space-y-5">
      <Breadcrumbs items={[{ label: page.category, href: "/" }, { label: page.title }]} />

      <header className="border-b border-line pb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display font-extrabold text-3xl md:text-4xl text-white tracking-tight">
              {page.title}
            </h1>
            {page.subtitle && (
              <p className="text-zinc-400 mt-1.5 text-sm md:text-base">{page.subtitle}</p>
            )}
            <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {page.updated}
              </span>
              <span className="text-zinc-700">•</span>
              <span className="uppercase tracking-wider text-pulse-500">{page.category}</span>
            </div>
          </div>
          <WikiActions slug={page.slug} />
        </div>
        <div className="mt-3 h-[2px] w-24 bg-gradient-to-r from-pulse-600 to-transparent" />
      </header>

      {page.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={page.imageUrl} alt={page.title} className="w-full max-h-[360px] object-cover rounded-md border border-line" />
      )}

      <div className={`grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6${(page.content || "").includes("data-wiki-notice") ? " has-notice-grid" : ""}`}>
        <div className="min-w-0">
          {page.content && page.content.trim() ? (() => {
            const linked = applyWikilinks(page.content, linkIndex, page.slug);
            const { notice, rest } = splitNotice(linked);
            return (
              <>
                {notice && <div className="wiki-prose tiptap-output" dangerouslySetInnerHTML={{ __html: notice }} />}
                <TableOfContents headings={headings} />
                <div className="clear-both" />
                <div className="wiki-prose tiptap-output" dangerouslySetInnerHTML={{ __html: rest }} />
                <div className="clear-both" />
              </>
            );
          })() : (
            <>
              {page.intro && (
                <div className="wiki-prose">
                  {page.intro.map((p, i) => (
                    <p key={i} className="text-[15.5px] text-zinc-200">{autoLink(p, linkIndex, page.slug)}</p>
                  ))}
                </div>
              )}
              <TableOfContents headings={headings} />
              <div className="clear-both" />
              <div className="wiki-prose mt-2">
                {page.sections.map((s) => (
                  <section key={s.heading} id={slugify(s.heading)} className="scroll-mt-24">
                    <h2>{s.heading}</h2>
                    {renderBody(s.body)}
                  </section>
                ))}
              </div>
              <div className="clear-both" />
            </>
          )}

          {relatedPages.length > 0 && (
            <section className="mt-10">
              <h2 className="font-display font-semibold text-white text-lg mb-3 pb-2 border-b border-line relative">
                Related Pages
                <span className="absolute left-0 -bottom-px h-[2px] w-12 bg-pulse-600" />
              </h2>
              <ul className="grid sm:grid-cols-2 gap-2">
                {relatedPages.map((r) => {
                  const imageUrl = r.slug === "departments" ? DEPARTMENTS_LOGO : r.imageUrl;
                  return (
                    <li key={r.slug}>
                      <Link href={`/wiki/${r.slug}`} className="block panel p-3 hover:border-pulse-700/60 hover:bg-panel2 transition">
                        <div className="flex items-center gap-3">
                          {imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={imageUrl} alt="" className="w-12 h-12 rounded object-cover border border-line shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded bg-panel2 border border-line shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-white truncate">{r.title}</div>
                            <div className="text-[11px] text-zinc-500 truncate">{r.subtitle || `/wiki/${r.slug}`}</div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <div className="mt-10 pt-4 border-t border-line flex items-center flex-wrap gap-2">
            <Tag className="w-4 h-4 text-zinc-500" />
            {page.tags.map((t) => (
              <span key={t} className="text-[11px] uppercase tracking-wider px-2 py-1 rounded border border-line bg-panel2 text-zinc-300">
                {t}
              </span>
            ))}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          {page.infobox && <WikiInfobox box={page.infobox} currentSlug={page.slug} />}
        </aside>
      </div>
    </article>
  );
}