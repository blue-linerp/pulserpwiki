/**
 * uploadStorage.local.ts — local-disk fallback used during `npm run dev`
 * when BLOB_READ_WRITE_TOKEN is not set.
 * Drop this at  src/lib/uploadStorage.local.ts
 */

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);

async function dir(): Promise<string> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  return UPLOAD_DIR;
}

function extForMime(mime: string): string {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
  };
  return map[mime] ?? "bin";
}

export async function saveUpload(
  buffer: Uint8Array,
  _originalName: string,
  mimeType: string
): Promise<string> {
  const d = await dir();
  const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${extForMime(mimeType)}`;
  await fs.writeFile(path.join(d, name), buffer);
  return `/uploads/${name}`;
}

export async function deleteUpload(url: string): Promise<void> {
  const name = url.replace(/^\/uploads\//, "");
  if (name.includes("/") || name.includes("..")) return;
  try {
    await fs.unlink(path.join(UPLOAD_DIR, name));
  } catch {
    // ignore ENOENT
  }
}

export async function listUploads() {
  const d = await dir();
  try {
    const entries = await fs.readdir(d, { withFileTypes: true });
    const files = await Promise.all(
      entries
        .filter(
          (e) =>
            e.isFile() &&
            IMAGE_EXTENSIONS.has(path.extname(e.name).toLowerCase())
        )
        .map(async (e) => {
          const stat = await fs.stat(path.join(d, e.name));
          return {
            name: e.name,
            url: `/uploads/${e.name}`,
            uploadedAt: stat.mtimeMs,
            size: stat.size,
          };
        })
    );
    return files.sort((a, b) => b.uploadedAt - a.uploadedAt);
  } catch {
    return [];
  }
}
