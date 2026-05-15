import PageEditor from "@/components/PageEditor";
import { getPage } from "@/data/pages/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default function EditPage({ params }: { params: { slug: string } }) {
  const page = getPage(params.slug);
  if (!page) return notFound();
  return <PageEditor initial={page} mode="edit" canDelete />;
}
