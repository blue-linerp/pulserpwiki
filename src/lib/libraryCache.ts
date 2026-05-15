/**
 * src/lib/libraryCache.ts
 * Shared module-level cache for the image library.
 * Imported by both PageEditor and RichEditor so the fetch happens once
 * across the whole app session.
 */

export interface LibraryFile {
  name: string;
  url: string;
  uploadedAt: number;
  size: number;
}

let _cache: LibraryFile[] | null = null;
let _promise: Promise<LibraryFile[]> | null = null;

export function fetchLibrary(): Promise<LibraryFile[]> {
  if (_cache) return Promise.resolve(_cache);
  if (_promise) return _promise;
  _promise = fetch("/api/uploads", { cache: "no-store" })
    .then((r) => r.json())
    .then((d: { files?: LibraryFile[] }) => {
      _cache = d.files || [];
      _promise = null;
      return _cache!;
    })
    .catch(() => { _promise = null; return []; });
  return _promise;
}

export function getLibraryCache(): LibraryFile[] | null {
  return _cache;
}

export function invalidateLibraryCache(): void {
  _cache = null;
  _promise = null;
}

/** Call this at app startup or after navigating to pre-warm the cache. */
export function prefetchLibrary(): void {
  if (!_cache && !_promise) fetchLibrary();
}