/**
 * src/lib/uploadStorage.ts — Vercel Blob (prod) or local disk (dev)
 */
import { put, del, list } from "@vercel/blob";

const IS_VERCEL = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

let localFallback: typeof import("./uploadStorage.local") | null = null;
async function getLocal() {
  if (!localFallback) localFallback = await import("./uploadStorage.local");
  return localFallback;
}

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
    addRandomSuffix: true,
  });
  invalidateUploadsCache();
  return blob.url;
}

export async function deleteUpload(url: string): Promise<void> {
  if (!IS_VERCEL) {
    const local = await getLocal();
    return local.deleteUpload(url);
  }
  await del(url);
  invalidateUploadsCache();
}

export interface UploadedFile {
  name: string;
  url: string;
  uploadedAt: number;
  size: number;
}

// ── Server-side cache for the blob list ──────────────────────────────────────
// Vercel Blob list() is slow (~300-800ms). Cache it for 60s.
// Shared across all requests in the same serverless function instance.

let _listCache: { files: UploadedFile[]; at: number } | null = null;
const LIST_TTL = 60_000;

export function invalidateUploadsCache(): void {
  _listCache = null;
}

export async function listUploads(): Promise<UploadedFile[]> {
  const now = Date.now();
  if (_listCache && now - _listCache.at < LIST_TTL) {
    return _listCache.files;
  }

  let files: UploadedFile[];
  if (!IS_VERCEL) {
    const local = await getLocal();
    files = await local.listUploads();
  } else {
    const { blobs } = await list();
    files = blobs.map((b) => ({
      name: b.pathname,
      url: b.url,
      uploadedAt: new Date(b.uploadedAt).getTime(),
      size: b.size,
    }));
  }

  _listCache = { files, at: now };
  return files;
}