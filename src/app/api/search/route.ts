import { NextResponse, type NextRequest } from "next/server";
import { getAllPages } from "@/data/pages/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();
  if (q.length < 2) return NextResponse.json([]);

  const all = await getAllPages();

  const results = all
    .filter((p) => {
      const haystack = [
        p.title,
        p.subtitle ?? "",
        p.description,
        p.category,
        ...p.tags,
        p.intro?.join(" ") ?? "",
        p.infobox?.title ?? "",
        ...(p.infobox?.fields ?? []).map((f) => `${f.label} ${f.value}`),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    })
    .slice(0, 12)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      description: p.description,
      category: p.category,
    }));

  return NextResponse.json(results);
}
