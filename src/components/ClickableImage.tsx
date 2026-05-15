"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Images, Info, Share2, X, ZoomIn } from "lucide-react";

interface UploadedImage {
  name: string;
  url: string;
  uploadedAt: number;
}

export default function ClickableImage({
  src,
  alt,
  style,
  className,
  containerClassName,
}: {
  src: string;
  alt?: string;
  style?: React.CSSProperties;
  className?: string;
  containerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [uploads, setUploads] = useState<UploadedImage[]>([]);
  const [index, setIndex] = useState(0);
  const gallery = useMemo(() => {
    const all = uploads.length ? uploads : [{ name: alt || src.split("/").pop() || "Image", url: src, uploadedAt: 0 }];
    if (all.some((img) => img.url === src)) return all;
    return [{ name: alt || src.split("/").pop() || "Image", url: src, uploadedAt: 0 }, ...all];
  }, [alt, src, uploads]);
  const current = gallery[index] || gallery[0];

  useEffect(() => {
    if (!open) return;
    let canceled = false;
    fetch("/api/uploads", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { files?: UploadedImage[] }) => {
        if (canceled) return;
        const files = d.files || [];
        setUploads(files);
        const nextIndex = files.findIndex((img) => img.url === src);
        setIndex(nextIndex >= 0 ? nextIndex : 0);
      })
      .catch(() => undefined);
    return () => {
      canceled = true;
    };
  }, [open, src]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + gallery.length) % gallery.length);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % gallery.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gallery.length, open]);

  function prev() {
    setIndex((i) => (i - 1 + gallery.length) % gallery.length);
  }

  function next() {
    setIndex((i) => (i + 1) % gallery.length);
  }

  return (
    <>
      <span
        className={`group relative inline-block cursor-zoom-in ${containerClassName ?? ""}`}
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt ?? ""} style={style} className={className ?? ""} />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/30 rounded">
          <ZoomIn className="w-5 h-5 text-white drop-shadow" />
        </span>
      </span>

      {open && (
        <div
          className="fixed inset-0 z-[80] bg-[#16070f]/85 backdrop-blur-[1px] text-white flex items-center justify-center p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-[calc(100vw-5rem)] h-[82vh] flex flex-col border border-crimson/50 bg-[#0d0f14] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="h-16 shrink-0 flex items-center justify-between px-4 border-b border-crimson/50 bg-[#160707]">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Images className="w-4 h-4 text-crimson" />
                  <h2 className="text-sm font-bold text-crimson truncate">{current.name}</h2>
                  <span className="text-[11px] text-zinc-500">| See full size image</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1 truncate">
                  {gallery.length > 1 ? `${index + 1} of ${gallery.length} uploaded photos` : alt || "Uploaded photo"}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <button className="hidden sm:inline-flex items-center gap-1 text-zinc-400 hover:text-white transition">
                  <Info className="w-3.5 h-3.5" /> More info
                </button>
                <button className="hidden sm:inline-flex items-center gap-1 text-zinc-400 hover:text-white transition">
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 border border-zinc-600 text-zinc-400 hover:text-white hover:border-crimson transition"
                  aria-label="Close viewer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            <main className="relative flex-1 min-h-0 flex items-center justify-center bg-[#0b0f14]">
              {gallery.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 border border-crimson/50 text-zinc-300 hover:text-white hover:bg-crimson/30 transition"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6 mx-auto" />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 border border-crimson/50 text-zinc-300 hover:text-white hover:bg-crimson/30 transition"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6 mx-auto" />
                  </button>
                </>
              )}

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.url}
                alt={current.name}
                className="max-w-[88vw] max-h-[calc(82vh-10rem)] object-contain"
              />
            </main>

            {gallery.length > 1 && (
              <footer className="h-24 shrink-0 border-t border-crimson/50 bg-[#160707] px-3 py-2">
                <div className="text-center text-[11px] text-zinc-400 mb-2">
                  <span className="text-white font-semibold">{index + 1}</span> of {gallery.length}
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {gallery.map((img, i) => (
                    <button
                      key={img.url}
                      onClick={() => setIndex(i)}
                      className={`w-14 h-14 shrink-0 border bg-[#0b0f14] transition ${
                        i === index ? "border-crimson ring-2 ring-crimson/40" : "border-zinc-700 opacity-70 hover:opacity-100 hover:border-crimson/60"
                      }`}
                      title={img.name}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </footer>
            )}
          </div>
        </div>
      )}
    </>
  );
}
