import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { Pages } from "@/lib/db";
import { getStaticPage } from "@/data/pages/server";
import type { WikiPage } from "@/data/types";

export const dynamic = "force-dynamic";

function ok(data: unknown) { return NextResponse.json(data); }
function fail(msg: string, status = 400) { return NextResponse.json({ error: msg }, { status }); }

function validatePage(input: unknown): WikiPage | string {
  if (!input || typeof input !== "object") return "Body must be an object.";
  const p = input as Record<string, unknown>;
  const required = ["slug", "title", "category", "description"] as const;
  for (const k of required) {
    if (typeof p[k] !== "string" || !(p[k] as string).trim()) return `Missing field: ${k}`;
  }
  const out: WikiPage = {
    slug: String(p.slug).trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, ""),
    title: String(p.title).trim(),
    subtitle: typeof p.subtitle === "string" ? p.subtitle : undefined,
    category: String(p.category).trim(),
    description: String(p.description).trim(),
    updated: typeof p.updated === "string" && p.updated ? p.updated : "Updated just now",
    tags: Array.isArray(p.tags) ? p.tags.map(String) : [],
    related: Array.isArray(p.related)
      ? (p.related as Array<Record<string, unknown>>)
          .filter((r) => r && typeof r.slug === "string" && typeof r.title === "string")
          .map((r) => ({ title: String(r.title), slug: String(r.slug) }))
      : [],
    intro: Array.isArray(p.intro) ? (p.intro as unknown[]).map(String) : undefined,
    sections: Array.isArray(p.sections)
      ? (p.sections as Array<Record<string, unknown>>)
          .filter((s) => s && typeof s.heading === "string")
          .map((s) => ({
            heading: String(s.heading),
            body: Array.isArray(s.body) ? (s.body as unknown[]).map(String) : [],
          }))
      : [],
    infobox:
      p.infobox && typeof p.infobox === "object"
        ? (() => {
            const ib = p.infobox as Record<string, unknown>;
            const fields = Array.isArray(ib.fields)
              ? (ib.fields as Array<Record<string, unknown>>)
                  .filter((f) => typeof f.label === "string" && typeof f.value === "string")
                  .map((f) => ({
                    label: String(f.label),
                    value: String(f.value),
                    kind: f.kind === "heading" ? ("heading" as const) : ("field" as const),
                  }))
              : [];
            return {
              title: typeof ib.title === "string" ? ib.title : "",
              imageLabel: typeof ib.imageLabel === "string" ? ib.imageLabel : undefined,
              imageUrl: typeof ib.imageUrl === "string" ? ib.imageUrl : undefined,
              fields,
            };
          })()
        : undefined,
    imageUrl: typeof p.imageUrl === "string" ? p.imageUrl : undefined,
    content: typeof p.content === "string" ? p.content : undefined,
  };
  if (!out.slug) return "Invalid slug.";
  return out;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const me = await getCurrentUser();
  if (!me || me.role !== "admin") return fail("Forbidden", 403);

  let body: unknown;
  try { body = await req.json(); } catch { return fail("Invalid JSON."); }
  const result = validatePage(body);
  if (typeof result === "string") return fail(result);

  const oldSlug = params.slug;
  const targetSlug = result.slug;
  const page: WikiPage = { ...result, slug: targetSlug };

  const isCustom = !getStaticPage(targetSlug);
  await Pages.upsert(targetSlug, page, isCustom, me.steam_id);
  await Pages.unhideStatic(targetSlug);
  if (oldSlug !== targetSlug) {
    await Pages.delete(oldSlug);
    if (getStaticPage(oldSlug)) {
      await Pages.hideStatic(oldSlug, me.steam_id);
    }
  }

  revalidateTag("wiki-pages");
  return ok({ ok: true, slug: targetSlug });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const me = await getCurrentUser();
  if (!me || me.role !== "admin") return fail("Forbidden", 403);

  const row = await Pages.get(params.slug);
  if (!row) return fail("Not found.", 404);
  if (row.is_custom !== 1) {
    await Pages.delete(params.slug);
    revalidateTag("wiki-pages");
    return ok({ ok: true, reverted: true });
  }
  await Pages.delete(params.slug);
  revalidateTag("wiki-pages");
  return ok({ ok: true, deleted: true });
}