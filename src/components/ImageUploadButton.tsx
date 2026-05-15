"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Upload, X, Copy, Check, ImageIcon, Loader2, CloudUpload } from "lucide-react";
import type { MeResponse } from "./UserMenu";

interface UploadedFile {
  url: string;
  name: string;
  width?: number;
  height?: number;
}

function wikiMarkup(f: UploadedFile): string {
  const filename = f.url.replace(/^\//, ""); // strip leading /
  const size = f.width && f.height ? `|${f.width}x${f.height}px` : f.width ? `|${f.width}px` : "";
  return `[[File:${filename}|frameless|center${size}]]`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  return (
    <button
      onClick={copy}
      title="Copy"
      className="shrink-0 p-1 rounded hover:bg-panel2 text-zinc-400 hover:text-white transition"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function ImageUploadButton() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<UploadedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: MeResponse) => {
        if (d.user?.role === "admin") setIsAdmin(true);
      })
      .catch(() => {});
  }, []);

  const upload = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files);
    setError(null);
    setUploading(true);
    for (const file of arr) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        setError(err.error || "Upload failed");
        setUploading(false);
        return;
      }
      const data = await res.json() as { url: string };
      // Detect image dimensions
      const img = new Image();
      img.src = data.url;
      const dims = await new Promise<{ w?: number; h?: number }>((resolve) => {
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => resolve({});
        setTimeout(() => resolve({}), 3000);
      });
      setResults((prev) => [
        { url: data.url, name: file.name, width: dims.w, height: dims.h },
        ...prev,
      ]);
    }
    setUploading(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length) upload(e.dataTransfer.files);
    },
    [upload]
  );

  if (!isAdmin) return null;

  return (
    <>
      {/* Floating action button */}
      <button
        onClick={() => setOpen(true)}
        title="Upload Image"
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-pulse-600 hover:bg-pulse-500 border border-pulse-500/60 shadow-glow text-white flex items-center justify-center transition"
      >
        <CloudUpload className="w-5 h-5" />
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="panel w-full max-w-lg flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3 border-b border-line bg-panel2/60">
              <div className="flex items-center gap-2">
                <CloudUpload className="w-4 h-4 text-pulse-500" />
                <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wide">
                  Upload Image
                </h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded hover:bg-panel2 text-zinc-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </header>

            <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Drop zone */}
              <div
                ref={dropRef}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-3 px-6 py-10 rounded-lg border-2 border-dashed cursor-pointer transition ${
                  dragging
                    ? "border-pulse-500 bg-pulse-900/20"
                    : "border-line hover:border-pulse-700/60 hover:bg-panel2/40"
                }`}
              >
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-pulse-400 animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 text-zinc-500" />
                )}
                <div className="text-center">
                  <p className="text-sm text-zinc-200 font-medium">
                    {uploading ? "Uploading…" : "Drop images here or click to browse"}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">PNG, JPG, SVG, WebP, GIF — max 4 MB</p>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      upload(e.target.files);
                      e.target.value = "";
                    }
                  }}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-900/30 border border-red-700/50 text-red-300 text-sm">
                  <X className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Results */}
              {results.length > 0 && (
                <div className="space-y-3">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500 px-0.5">
                    Uploaded ({results.length})
                  </div>
                  {results.map((f, i) => (
                    <div key={i} className="panel p-3 flex gap-3">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 shrink-0 rounded bg-panel2 border border-line flex items-center justify-center overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={f.url}
                          alt=""
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="text-xs font-medium text-zinc-200 truncate">{f.name}</div>
                        {f.width && f.height && (
                          <div className="text-[11px] text-zinc-500">{f.width} × {f.height}px</div>
                        )}
                        {/* URL row */}
                        <div className="flex items-center gap-1">
                          <code className="flex-1 text-[11px] bg-panel2 border border-line rounded px-2 py-1 text-zinc-300 truncate">
                            {f.url}
                          </code>
                          <CopyButton text={f.url} />
                        </div>
                        {/* Wiki markup row */}
                        <div className="flex items-center gap-1">
                          <code className="flex-1 text-[11px] bg-panel2 border border-line rounded px-2 py-1 text-pulse-300 truncate">
                            {wikiMarkup(f)}
                          </code>
                          <CopyButton text={wikiMarkup(f)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results.length === 0 && !uploading && (
                <div className="flex items-center gap-2 text-zinc-600 text-xs px-0.5">
                  <ImageIcon className="w-4 h-4" />
                  Uploaded images will appear here with their URL and wiki markup.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
