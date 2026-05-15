/**
 * src/app/api/uploads/route.ts
 * Lists and deletes uploaded images via Vercel Blob (prod) or local disk (dev).
 */
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listUploads, deleteUpload } from "@/lib/uploadStorage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const files = await listUploads();
  return NextResponse.json({ files });
}

export async function DELETE(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me || me.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { url?: string; name?: string } = {};
  try {
    body = (await req.json()) as { url?: string; name?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Accept either url (Vercel Blob) or name (local dev fallback)
  const url = body.url || (body.name ? `/uploads/${body.name}` : undefined);
  if (!url) {
    return NextResponse.json({ error: "Missing file url or name." }, { status: 400 });
  }

  await deleteUpload(url);
  return NextResponse.json({ ok: true });
}