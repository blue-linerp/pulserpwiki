/**
 * uploadStorage.ts — Vercel Blob replacement for local disk uploads
 * Drop this at  src/lib/uploadStorage.ts
 *
 * Env vars needed (set in Vercel dashboard):
 *   BLOB_READ_WRITE_TOKEN  — created automatically when you add Vercel Blob
 *                            in your project's Storage tab.
 */

import { put, del, list } from "@vercel/blob";

// In local dev (no BLOB_READ_WRITE_TOKEN) we fall back to local disk so you
// can still run `npm run dev` without a Vercel account.
const IS_VERCEL = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

// ── local-dev fallback (only used outside Vercel) ───────────────────────────
let localFallback: typeof import("./uploadStorage.local") | null = null;
async function getLocal() {
  if (!localFallback) {
    localFallback = await import("./uploadStorage.local");
  }
  return localFallback;
}

// ── public API ───────────────────────────────────────────────────────────────

export async function saveUpload(
  buffer: Uint8Array,
  originalName: string,
  mimeType: string
): Promise<string> {
  if (!IS_VERCEL) {
    const local = await getLocal();
    return local.saveUpload(buffer, originalName, mimeType);
  }
  const blob = await put(originalName, buffer, {
    access: "public",
    contentType: mimeType,
    // addRandomSuffix avoids collisions and matches the old Date.now()-hex pattern
    addRandomSuffix: true,
  });
  return blob.url;
}

export async function deleteUpload(url: string): Promise<void> {
  if (!IS_VERCEL) {
    const local = await getLocal();
    return local.deleteUpload(url);
  }
  await del(url);
}

export interface UploadedFile {
  name: string;
  url: string;
  uploadedAt: number;
  size: number;
}

export async function listUploads(): Promise<UploadedFile[]> {
  if (!IS_VERCEL) {
    const local = await getLocal();
    return local.listUploads();
  }
  const { blobs } = await list();
  return blobs.map((b) => ({
    name: b.pathname,
    url: b.url,
    uploadedAt: new Date(b.uploadedAt).getTime(),
    size: b.size,
  }));
}
