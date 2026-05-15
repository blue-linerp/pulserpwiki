import { NextResponse } from "next/server";
import { getAllPages, getPage } from "@/data/pages/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const all = await getAllPages();
  const departments = all
    .filter((p) => p.slug !== "department-of-justice-legislation")
    .filter(
      (p) =>
        p.category.toLowerCase() === "department" ||
        p.infobox?.templateKey === "department" ||
        p.tags.some((tag) => tag.toLowerCase() === "department") ||
        p.slug === "los-santos-police-department"
    )
    .map((p) => ({ label: p.title, href: `/wiki/${p.slug}` }));

  const lspd = await getPage("los-santos-police-department");
  if (lspd && !departments.some((p) => p.href === `/wiki/${lspd.slug}`)) {
    departments.push({ label: lspd.title, href: `/wiki/${lspd.slug}` });
  }
  departments.sort((a, b) => a.label.localeCompare(b.label));

  return NextResponse.json({ departments });
}
