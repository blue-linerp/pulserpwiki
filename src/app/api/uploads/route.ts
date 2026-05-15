import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);

export async function GET() {
  const dir = path.join(process.cwd(), "public", "uploads");
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries
        .filter((entry) => entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
        .map(async (entry) => {
          const stat = await fs.stat(path.join(dir, entry.name));
          return {
            name: entry.name,
            url: `/uploads/${entry.name}`,
            uploadedAt: stat.mtimeMs,
            size: stat.size,
          };
        })
    );
    files.sort((a, b) => b.uploadedAt - a.uploadedAt);
    return NextResponse.json({ files });
  } catch {
    return NextResponse.json({ files: [] });
  }
}

export async function DELETE(req: NextRequest) {
  const me = getCurrentUser();
  if (!me || me.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { name?: string } = {};
  try {
    body = (await req.json()) as { name?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = body.name;
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Missing file name." }, { status: 400 });
  }
  if (name.includes("/") || name.includes("\\") || name.includes("..")) {
    return NextResponse.json({ error: "Invalid file name." }, { status: 400 });
  }
  const ext = path.extname(name).toLowerCase();
  if (!IMAGE_EXTENSIONS.has(ext)) {
    return NextResponse.json({ error: "Unsupported file." }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  const target = path.resolve(path.join(dir, name));
  if (!target.startsWith(path.resolve(dir) + path.sep)) {
    return NextResponse.json({ error: "Invalid path." }, { status: 400 });
  }

  try {
    await fs.unlink(target);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }
}
