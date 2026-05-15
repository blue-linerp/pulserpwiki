import { NextResponse } from "next/server";
import { getAllPages } from "@/data/pages/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const pages = getAllPages().map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
  }));
  return NextResponse.json({ pages });
}
