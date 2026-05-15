"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckSquare,
  Copy,
  FolderOpen,
  Grid3x3,
  Image as ImageIcon,
  List as ListIcon,
  Loader2,
  RefreshCcw,
  Search,
  Square,
  Trash2,
  Upload,
} from "lucide-react";

interface UploadedFile {
  name: string;
  url: string;
  uploadedAt: number;
  size: number;
}

type DeletePrompt =
  | { type: "single"; url: string }
  | { type: "bulk"; urls: string[] };

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function formatDate(ms: number): string {
  if (!ms) return "—";
  const d = new Date(ms);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function wikiMarkup(file: UploadedFile): string {
  return `[[File:${file.url}|120px|center]]`;
}

export default function ImageExplorer() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busyDelete, setBusyDelete] = useState(false);
  const [deletePrompt, setDeletePrompt] = useState<DeletePrompt | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/uploads", { cache: "no-store" });
      const data = (await res.json()) as { files?: UploadedFile[] };
      setFiles(data.files || []);
    } catch {
      setError("Failed to load uploads.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return files;
    return files.filter((f) => f.name.toLowerCase().includes(q));
  }, [files, search]);

  function toggleSelect(url: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  }

  function selectAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((f) => f.url)));
  }

  async function uploadFiles(list: FileList | File[]) {
    setError(null);
    setUploading(true);
    try {
      for (const file of Array.from(list)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as { error?: string };
          setError(j.error || `Upload failed for ${file.name}`);
          break;
        }
      }
      await load();
    } finally {
      setUploading(false);
    }
  }

  async function deleteOneConfirmed(url: string) {
    setBusyDelete(true);
    try {
      const res = await fetch("/api/uploads", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error || "Delete failed.");
        return;
      }
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(url);
        return next;
      });
      await load();
    } finally {
      setBusyDelete(false);
    }
  }

  async function deleteSelectedConfirmed(urls: string[]) {
    if (!urls.length) return;
    if (!selected.size) return;
    setBusyDelete(true);
    try {
      for (const url of urls) {
        const res = await fetch("/api/uploads", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url }),
        });
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as { error?: string };
          setError(j.error || `Delete failed for ${url}`);
          break;
        }
      }
      setSelected(new Set());
      await load();
    } finally {
      setBusyDelete(false);
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (e.dataTransfer.files?.length) void uploadFiles(e.dataTransfer.files);
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text).catch(() => undefined);
  }

  async function confirmDelete() {
    if (!deletePrompt) return;
    if (deletePrompt.type === "single") {
      await deleteOneConfirmed(deletePrompt.url);
    } else {
      await deleteSelectedConfirmed(deletePrompt.urls);
    }
    setDeletePrompt(null);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <header className="panel px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <FolderOpen className="w-5 h-5 text-pulse-500 shrink-0" />
          <div className="min-w-0">
            <h1 className="font-display font-semibold text-white truncate">Image Explorer</h1>
            <p className="text-[11px] text-zinc-500 truncate">/public/uploads · admin only</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => load()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-line text-xs text-zinc-300 hover:text-white hover:border-pulse-700/60 transition"
            title="Refresh"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <label
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white border transition cursor-pointer ${
              uploading
                ? "bg-pulse-700/40 border-pulse-700/40"
                : "bg-pulse-600 hover:bg-pulse-500 border-pulse-500/60 shadow-glow"
            }`}
            title="Upload images"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Upload
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={async (e) => {
                if (e.target.files?.length) await uploadFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </header>

      {/* Toolbar */}
      <div className="panel px-3 py-2 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <button
            onClick={selectAll}
            className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-line text-xs text-zinc-300 hover:text-white hover:border-pulse-700/60 transition"
            title={selected.size === filtered.length && filtered.length > 0 ? "Deselect all" : "Select all"}
          >
            {selected.size === filtered.length && filtered.length > 0 ? (
              <CheckSquare className="w-3.5 h-3.5 text-pulse-400" />
            ) : (
              <Square className="w-3.5 h-3.5" />
            )}
            {selected.size > 0 ? `${selected.size} selected` : "Select"}
          </button>
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search filename"
              className="w-full bg-panel2 border border-line rounded-md pl-7 pr-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-pulse-600/60"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button
              onClick={() => setDeletePrompt({ type: "bulk", urls: Array.from(selected) })}
              disabled={busyDelete}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-crimson/60 bg-crimson/10 text-xs text-red-300 hover:text-white hover:bg-crimson/30 transition disabled:opacity-50"
            >
              {busyDelete ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete selected
            </button>
          )}
          <div className="flex items-center gap-0.5 border border-line rounded-md overflow-hidden">
            <button
              onClick={() => setView("grid")}
              className={`p-1.5 ${view === "grid" ? "bg-panel2 text-pulse-400" : "text-zinc-400 hover:text-white"}`}
              title="Grid view"
            >
              <Grid3x3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-1.5 ${view === "list" ? "bg-panel2 text-pulse-400" : "text-zinc-400 hover:text-white"}`}
              title="List view"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="panel px-3 py-2 text-xs text-red-300 border border-crimson/60 bg-crimson/10">
          {error}
        </div>
      )}

      {/* Content */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="panel p-3 min-h-[300px]"
      >
        {loading ? (
          <div className="flex items-center justify-center text-zinc-500 py-12 gap-2 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-zinc-500 py-16 gap-2 text-sm">
            <ImageIcon className="w-8 h-8 text-zinc-600" />
            <p>{search ? "No images match your search." : "No uploads yet. Drop files here or click Upload."}</p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filtered.map((f) => {
              const isSelected = selected.has(f.url);
              return (
                <div
                  key={f.name}
                  className={`group panel p-2 flex flex-col gap-2 transition ${
                    isSelected ? "border-pulse-500/60 ring-1 ring-pulse-500/40" : "hover:border-pulse-700/60"
                  }`}
                >
                  <button
                    onClick={() => toggleSelect(f.url)}
                    className="relative w-full aspect-square bg-panel2 border border-line overflow-hidden rounded"
                    title={f.name}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.url} alt="" className="w-full h-full object-cover" />
                    <span
                      className={`absolute top-1.5 left-1.5 w-5 h-5 rounded border flex items-center justify-center transition ${
                        isSelected
                          ? "bg-pulse-600 border-pulse-500 text-white"
                          : "bg-black/60 border-zinc-500 text-transparent opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <CheckSquare className="w-3 h-3" />
                    </span>
                  </button>
                  <div className="min-w-0 space-y-1">
                    <div className="text-[11px] font-medium text-zinc-100 truncate" title={f.name}>
                      {f.name}
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate">
                      {formatBytes(f.size)} · {formatDate(f.uploadedAt)}
                    </div>
                    <code className="block text-[10px] bg-panel2 border border-line rounded px-1.5 py-1 text-pulse-300 truncate" title={wikiMarkup(f)}>
                      {wikiMarkup(f)}
                    </code>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => copyText(wikiMarkup(f))}
                        className="flex-1 inline-flex items-center justify-center gap-1 text-[10px] px-1.5 py-1 rounded border border-line bg-panel2 text-zinc-300 hover:text-white hover:border-pulse-700/60 transition"
                        title={wikiMarkup(f)}
                      >
                        <Copy className="w-3 h-3" /> File
                      </button>
                      <button
                        onClick={() => setDeletePrompt({ type: "single", url: f.url })}
                        disabled={busyDelete}
                        className="inline-flex items-center justify-center gap-1 text-[10px] px-1.5 py-1 rounded border border-crimson/60 bg-crimson/10 text-red-300 hover:text-white hover:bg-crimson/30 transition disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-[10px] uppercase tracking-wider text-zinc-500">
                <tr className="border-b border-line">
                  <th className="p-2 w-8"></th>
                  <th className="p-2 w-14">Preview</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Size</th>
                  <th className="p-2">Uploaded</th>
                  <th className="p-2 w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => {
                  const isSelected = selected.has(f.url);
                  return (
                    <tr key={f.name} className="border-b border-line/60 hover:bg-panel2/40">
                      <td className="p-2 align-middle">
                        <button onClick={() => toggleSelect(f.url)} className="text-zinc-400 hover:text-white">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-pulse-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-2 align-middle">
                        <div className="w-10 h-10 bg-panel2 border border-line rounded overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={f.url} alt="" className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="p-2 align-middle text-zinc-100 max-w-[360px]" title={wikiMarkup(f)}>
                        <div className="truncate">{f.name}</div>
                        <code className="block mt-1 text-[10px] text-pulse-300 truncate">{wikiMarkup(f)}</code>
                      </td>
                      <td className="p-2 align-middle text-zinc-400">{formatBytes(f.size)}</td>
                      <td className="p-2 align-middle text-zinc-400">{formatDate(f.uploadedAt)}</td>
                      <td className="p-2 align-middle text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => copyText(wikiMarkup(f))}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-line text-zinc-300 hover:text-white hover:border-pulse-700/60 transition"
                            title={wikiMarkup(f)}
                          >
                            <Copy className="w-3 h-3" /> File
                          </button>
                          <button
                            onClick={() => setDeletePrompt({ type: "single", url: f.url })}
                            disabled={busyDelete}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-crimson/60 bg-crimson/10 text-red-300 hover:text-white hover:bg-crimson/30 transition disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-[10px] text-zinc-600 text-center">
          Tip: drag and drop image files anywhere in this panel to upload.
        </p>
      </div>
      {deletePrompt && (
        <DeleteConfirmModal
          prompt={deletePrompt}
          busy={busyDelete}
          onCancel={() => setDeletePrompt(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

function DeleteConfirmModal({
  prompt,
  busy,
  onCancel,
  onConfirm,
}: {
  prompt: DeletePrompt;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const count = prompt.type === "single" ? 1 : prompt.urls.length;
  const title = count === 1 ? "Delete image?" : `Delete ${count} images?`;
  const detail =
    prompt.type === "single"
      ? prompt.url.split("/").pop() || prompt.url
      : `${count} selected image files`;

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={busy ? undefined : onCancel}
    >
      <div
        className="w-full max-w-md panel border-crimson/70 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-crimson/40 bg-[#210909] flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-crimson/20 border border-crimson/60 flex items-center justify-center">
            <Trash2 className="w-4 h-4 text-red-300" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-white text-sm">{title}</h2>
            <p className="text-[11px] text-zinc-500">This action cannot be undone.</p>
          </div>
        </div>
        <div className="px-4 py-4 space-y-3">
          <p className="text-sm text-zinc-300">
            Are you sure you want to permanently delete:
          </p>
          <div className="rounded-md border border-line bg-panel2 px-3 py-2 text-xs text-zinc-100 break-all">
            {detail}
          </div>
        </div>
        <div className="px-4 py-3 bg-panel2/40 border-t border-line flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={busy}
            className="px-3 py-1.5 rounded-md border border-line text-xs text-zinc-300 hover:text-white hover:border-zinc-500 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-crimson/70 bg-crimson/20 text-xs font-semibold text-red-200 hover:text-white hover:bg-crimson/35 transition disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}