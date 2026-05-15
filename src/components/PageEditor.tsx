"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Trash2,
  Plus,
  X,
  Upload,
  ImageIcon,
  Loader2,
  Search,
  LayoutTemplate,
  SlidersHorizontal,
  Pencil,
  Settings,
} from "lucide-react";
import type { WikiPage, InfoboxField, Infobox } from "@/data/types";
import WikiInfoboxPreview from "./WikiInfoboxPreview";
import RichEditor from "./RichEditor";
import { articleToHtml } from "@/lib/articleHtml";
import {
  INFOBOX_TEMPLATES,
  inferInfoboxTemplate,
  templateFieldLabel,
  templateFieldSource,
  type InfoboxTemplateDefinition,
} from "@/data/infoboxTemplates";

type Mode = "edit" | "create";

interface Props {
  initial: WikiPage;
  mode: Mode;
  /** When true, the slug field is locked (editing an existing page). */
  lockSlug?: boolean;
  /** When true, shows revert/delete button. */
  canDelete?: boolean;
}

export default function PageEditor({ initial, mode, lockSlug, canDelete }: Props) {
  const router = useRouter();
  const [page, setPage] = useState<WikiPage>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<{ role: string } | null>(null);
  // Snapshot the HTML content once at mount so the editor isn't re-mounted
  // every keystroke when `page.content` changes via onChange.
  const initialContent = useMemo(() => articleToHtml(initial), [initial]);

  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setMe(d.user));
  }, []);

  const isAdmin = me?.role === "admin";
  const infoboxTemplate =
    (page.infobox?.templateKey && INFOBOX_TEMPLATES[page.infobox.templateKey as keyof typeof INFOBOX_TEMPLATES])
    || inferInfoboxTemplate(page);

  function patch(p: Partial<WikiPage>) {
    setPage((prev) => ({ ...prev, ...p }));
  }

  async function uploadImage(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.error || "Upload failed");
      return null;
    }
    const data = (await res.json()) as { url: string };
    return data.url;
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const targetSlug = page.slug || initial.slug;
      const res = await fetch(`/api/pages/${encodeURIComponent(initial.slug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...page, slug: targetSlug }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.error || `Save failed (${res.status})`);
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { slug?: string };
      router.push(`/wiki/${data.slug || targetSlug}`);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function del() {
    if (!confirm("Delete this page? Built-in pages will revert to defaults.")) return;
    setSaving(true);
    const res = await fetch(`/api/pages/${encodeURIComponent(page.slug)}`, { method: "DELETE" });
    setSaving(false);
    if (res.ok) {
      router.push("/");
      router.refresh();
    }
  }

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [minorEdit, setMinorEdit] = useState(false);

  if (me === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-400">
        Loading…
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="panel p-6 max-w-md text-center">
          <h2 className="text-lg font-semibold text-white">Admin only</h2>
          <p className="text-zinc-400 mt-1">
            You must be signed in as an administrator to edit pages.
          </p>
        </div>
      </div>
    );
  }

  function cancel() {
    if (
      page.content !== initial.content &&
      !confirm("Discard your changes?")
    ) {
      return;
    }
    router.push(mode === "create" ? "/" : `/wiki/${initial.slug}`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg pb-24">
      {/* Top header bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-panel/90 backdrop-blur">
        <div className="mx-auto max-w-[1500px] px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-3 min-w-0 flex-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 shrink-0">
              {mode === "create" ? "New Page" : "Edit Page"}
            </span>
            <input
              type="text"
              value={page.title}
              onChange={(e) => patch({ title: e.target.value })}
              className="bg-transparent border-0 focus:outline-none focus:ring-0 font-display font-bold text-2xl text-white placeholder:text-zinc-700 min-w-0 flex-1 px-0"
              placeholder="Untitled page"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-pulse-400 px-2 py-1 border border-pulse-700/40 rounded">
              <Pencil className="w-3 h-3" /> Visual Editor
            </span>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-line bg-panel2 hover:border-pulse-700/60 text-zinc-200"
            >
              <Settings className="w-3.5 h-3.5" /> Page settings
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="mx-auto max-w-[1500px] w-full px-4 mt-3">
          <div className="panel border-pulse-700/60 bg-pulse-900/20 text-pulse-200 p-3 text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Main editor area */}
      <main className="flex-1 mx-auto max-w-[1500px] w-full px-4 py-6">
        <RichEditor
          value={initialContent}
          onChange={(html: string) => patch({ content: html })}
          uploadImage={uploadImage}
          sidebarSlot={
            <ClickableInfoboxPreview
              infobox={page.infobox || { title: page.title, fields: [] }}
              template={infoboxTemplate}
              onApply={(next) => patch({ infobox: next })}
              uploadImage={uploadImage}
            />
          }
        />
      </main>

      {/* Sticky bottom action bar */}
      <footer className="fixed bottom-0 inset-x-0 z-30 border-t border-line bg-panel/95 backdrop-blur">
        <div className="mx-auto max-w-[1500px] px-4 py-3 flex items-center gap-3 flex-wrap">
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Describe what you changed"
            className="flex-1 min-w-[200px] bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-pulse-600/60"
          />
          <label className="inline-flex items-center gap-1.5 text-xs text-zinc-400 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={minorEdit}
              onChange={(e) => setMinorEdit(e.target.checked)}
              className="accent-pulse-600"
            />
            This is a minor edit
          </label>
          {canDelete && (
            <button
              type="button"
              onClick={del}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-md border border-line bg-panel2 hover:border-pulse-700/60 text-zinc-300 hover:text-white"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete / Revert
            </button>
          )}
          <button
            type="button"
            onClick={cancel}
            disabled={saving}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md border border-line text-zinc-200 hover:bg-panel2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-md bg-pulse-600 hover:bg-pulse-500 border border-pulse-500/60 text-white shadow-glow"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>
      </footer>

      {settingsOpen && (
        <SettingsDrawer
          page={page}
          initial={initial}
          lockSlug={lockSlug}
          onChange={patch}
          uploadImage={uploadImage}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}

function SettingsDrawer({
  page,
  initial,
  lockSlug,
  onChange,
  uploadImage,
  onClose,
}: {
  page: WikiPage;
  initial: WikiPage;
  lockSlug?: boolean;
  onChange: (patch: Partial<WikiPage>) => void;
  uploadImage: (file: File) => Promise<string | null>;
  onClose: () => void;
}) {
  const [relatedDraft, setRelatedDraft] = useState(() =>
    page.related.map((r) => `${r.title} | ${r.slug}`).join("\n")
  );
  const [tagDraft, setTagDraft] = useState(() => page.tags.join(", "));

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full bg-panel border-l border-line shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-4 py-3 border-b border-line bg-panel2/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-pulse-500" />
            <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wide">
              Page Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md border border-line hover:border-pulse-700/60 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Field label="Slug" hint="URL identifier — letters, numbers, dashes only.">
            <input
              type="text"
              value={page.slug}
              disabled={lockSlug}
              onChange={(e) => onChange({ slug: e.target.value })}
              className={input + (lockSlug ? " opacity-60" : "")}
              placeholder="character-zachary-kane"
            />
          </Field>
          <Field label="Subtitle">
            <input
              type="text"
              value={page.subtitle || ""}
              onChange={(e) => onChange({ subtitle: e.target.value })}
              className={input}
              placeholder="Captain — Los Santos Joint Police Department"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <input
                type="text"
                value={page.category}
                onChange={(e) => onChange({ category: e.target.value })}
                className={input}
                placeholder="Character"
              />
            </Field>
            <Field label="Updated label">
              <input
                type="text"
                value={page.updated}
                onChange={(e) => onChange({ updated: e.target.value })}
                className={input}
                placeholder="Updated today"
              />
            </Field>
          </div>
          <Field label="Description" hint="Used in search results.">
            <textarea
              value={page.description}
              onChange={(e) => onChange({ description: e.target.value })}
              className={textarea}
              rows={2}
            />
          </Field>
          <Field label="Tags (comma-separated)">
            <input
              type="text"
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onBlur={(e) =>
                onChange({
                  tags: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              className={input}
              placeholder="Police, Captain, Joint Task Force"
            />
          </Field>
          <Field label="Hero image" hint="Optional banner at the top of the article.">
            <ImageInput
              url={page.imageUrl}
              onChange={(url) => onChange({ imageUrl: url || undefined })}
              upload={uploadImage}
            />
          </Field>
          <Field
            label="Related pages"
            hint='Format: "Title | slug" — one per line.'
          >
            <textarea
              value={relatedDraft}
              onChange={(e) => {
                const nextDraft = e.target.value;
                setRelatedDraft(nextDraft);
                const lines = nextDraft
                  .split("\n")
                  .map((l) => l.trim())
                  .filter(Boolean);
                onChange({
                  related: lines
                    .map((l) => {
                      const [t, s] = l.split("|").map((x) => x.trim());
                      return t && s ? { title: t, slug: s } : null;
                    })
                    .filter((x): x is { title: string; slug: string } => x !== null),
                });
              }}
              className={textarea}
              rows={5}
            />
          </Field>
          {initial.slug !== page.slug && (
            <p className="text-[11px] text-pulse-400">
              Note: changing the slug creates a new page at that URL.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const input =
  "w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-pulse-600/60 focus:ring-2 focus:ring-pulse-600/20 transition";
const textarea = input + " font-mono text-[13px] leading-relaxed";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[11px] uppercase tracking-wider text-zinc-400">{label}</span>
        {hint && <span className="text-[10px] text-zinc-600">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function ClickableInfoboxPreview({
  infobox,
  template,
  onApply,
  uploadImage,
}: {
  infobox: Infobox;
  template: InfoboxTemplateDefinition;
  onApply: (next: Infobox) => void;
  uploadImage: (file: File) => Promise<string | null>;
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  return (
    <div className="relative">
      <div
        onClick={() => setPopoverOpen((v) => !v)}
        className="relative group cursor-pointer rounded-md"
        title="Click to edit the infobox"
      >
        <WikiInfoboxPreview box={infobox} />
        <div
          className={
            "pointer-events-none absolute inset-0 rounded-md ring-2 transition " +
            (popoverOpen
              ? "ring-pulse-500/70"
              : "ring-transparent group-hover:ring-pulse-600/40")
          }
        />
      </div>

      {popoverOpen && (
        <>
          {/* click-away catcher */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setPopoverOpen(false)}
          />
          <div className="absolute z-50 left-1/2 -translate-x-1/2 top-full mt-2">
            {/* arrow pointing up to the infobox */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 rotate-45 bg-panel border-l border-t border-line" />
            <div className="panel shadow-xl px-4 py-3 min-w-[240px]">
              <div className="flex items-center justify-between gap-4 mb-1">
                <div className="flex items-center gap-2">
                  <LayoutTemplate className="w-4 h-4 text-zinc-300" />
                  <span className="text-sm font-semibold text-white">Template</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPopoverOpen(false);
                    setEditing(true);
                  }}
                  className="px-3 py-1 text-xs font-semibold tracking-wider uppercase rounded border border-zinc-400 text-zinc-100 hover:bg-panel2 hover:border-white transition"
                >
                  EDIT
                </button>
              </div>
              <div className="text-[11px] text-zinc-500">
                Generated from:{" "}
                <span className="text-pulse-400">{template.label}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {editing && (
        <InfoboxModal
          infobox={infobox}
          template={template}
          uploadImage={uploadImage}
          onClose={() => setEditing(false)}
          onApply={(next) => {
            onApply(next);
            setEditing(false);
          }}
        />
      )}
    </div>
  );
}

function InfoboxModal({
  infobox,
  template,
  uploadImage,
  onApply,
  onClose,
}: {
  infobox: Infobox;
  template: InfoboxTemplateDefinition;
  uploadImage: (file: File) => Promise<string | null>;
  onApply: (next: Infobox) => void;
  onClose: () => void;
}) {
  const fields = infobox.fields || [];

  // Local state for the editable top-of-form fields (title/image/caption).
  const [boxTitle, setBoxTitle] = useState(infobox.title || "");
  const [boxImageUrl, setBoxImageUrl] = useState<string | undefined>(infobox.imageUrl);
  const [boxImageLabel, setBoxImageLabel] = useState(infobox.imageLabel || "");

  // Map label (lowercase) → source key for the current template.
  // Used to re-hydrate old saved fields that have a label but no source.
  const labelToSource = useMemo(() => {
    const m = new Map<string, string>();
    for (const g of template.groups) {
      for (const f of g.fields) {
        const lbl = templateFieldLabel(f).trim().toLowerCase();
        const src = templateFieldSource(f);
        if (!m.has(lbl)) m.set(lbl, src);
      }
    }
    return m;
  }, [template.groups]);

  // Resolve the canonical source key for a saved field (backward compat: old
  // fields may have only a label with no source).
  const resolveKey = useCallback(
    (f: InfoboxField) => f.source || labelToSource.get(f.label.trim().toLowerCase()) || f.label.trim(),
    [labelToSource]
  );

  // Build the initial enabled-set from existing field labels.
  const initialEnabled = useMemo(() => {
    const set = new Set<string>();
    for (const f of fields) {
      if (f.kind !== "heading" && f.label.trim()) set.add(resolveKey(f));
    }
    return set;
  }, [fields, resolveKey]);

  const [enabled, setEnabled] = useState<Set<string>>(initialEnabled);
  const [query, setQuery] = useState("");
  const isDepartmentTemplate = template.key === "department";
  const isLspdTemplate = template.key === "lspd";
  const isBcsoTemplate = template.key === "bcso";
  const isEmsTemplate = template.key === "ems";
  const templateShortName = isLspdTemplate ? "LSPD" : isBcsoTemplate ? "BCSO" : isEmsTemplate ? "EMS" : isDepartmentTemplate ? "Department" : template.label;
  // Preserve any pre-existing custom (non-template) fields so we don't lose them.
  const existingByKey = useMemo(() => {
    const m = new Map<string, InfoboxField>();
    for (const f of fields) if (f.kind !== "heading") m.set(resolveKey(f), f);
    return m;
  }, [fields, resolveKey]);

  const allTemplateLabels = useMemo(
    () => new Set(template.groups.flatMap((g) => g.fields.map(templateFieldSource))),
    [template.groups]
  );
  const customLabels = useMemo(
    () =>
      [...existingByKey.keys()].filter(
        (l) => l && !allTemplateLabels.has(l)
      ),
    [existingByKey, allTemplateLabels]
  );

  function toggle(label: string) {
    const next = new Set(enabled);
    if (next.has(label)) next.delete(label);
    else next.add(label);
    setEnabled(next);
  }

  function apply() {
    const next: InfoboxField[] = [];
    for (const group of template.groups) {
      const groupFields = group.fields.filter((field) => enabled.has(templateFieldSource(field)));
      if (groupFields.length === 0) continue;
      if (group.heading) {
        next.push({ label: "", value: group.heading, kind: "heading" });
      }
      for (const field of groupFields) {
        const label = templateFieldLabel(field);
        const source = templateFieldSource(field);
        const existing = existingByKey.get(source);
        next.push({
          label,
          source,
          value: existing?.value ?? "",
          kind: "field",
        });
      }
    }
    // Append any custom (non-template) fields the user had — preserved as-is.
    for (const label of customLabels) {
      if (enabled.has(label)) {
        const existing = existingByKey.get(label)!;
        next.push(existing);
      }
    }
    onApply({
      title: boxTitle,
      imageUrl: boxImageUrl,
      imageLabel: boxImageLabel || undefined,
      templateKey: template.key,
      fields: next,
    });
  }

  const filter = (l: string) =>
    !query.trim() || l.toLowerCase().includes(query.trim().toLowerCase());

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="panel w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-4 py-3 border-b border-line bg-panel2/60">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-pulse-500" />
            <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wide">
              Edit: {templateShortName}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={apply}
              className="px-3 py-1.5 rounded-md bg-pulse-600 hover:bg-pulse-500 text-white text-xs font-semibold border border-pulse-500/60 shadow-glow"
            >
              Apply
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-md border border-line hover:border-pulse-700/60 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[260px_1fr]">
          <aside className="border-r border-line bg-panel2/30 p-3 overflow-y-auto">
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find field"
                className={input + " pl-7 py-1.5 text-xs"}
              />
            </div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1 px-1">
              Standard fields
            </div>
            <ul className="space-y-0.5">
              {template.groups.flatMap((g) => g.fields)
                .filter((field) => filter(templateFieldLabel(field)))
                .map((field) => {
                  const label = templateFieldLabel(field);
                  const source = templateFieldSource(field);
                  return (
                  <li key={source}>
                    <label className="flex items-center gap-2 px-2 py-1 rounded hover:bg-panel2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enabled.has(source)}
                        onChange={() => toggle(source)}
                        className="accent-pulse-600"
                      />
                      <span
                        className={
                          "text-xs " +
                          (enabled.has(source) ? "text-zinc-100" : "text-zinc-500")
                        }
                      >
                        {label}
                      </span>
                    </label>
                  </li>
                  );
                })}
            </ul>
            {customLabels.filter(filter).length > 0 && (
              <>
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 mt-3 mb-1 px-1">
                  Custom fields
                </div>
                <ul className="space-y-0.5">
                  {customLabels.filter(filter).map((label) => (
                    <li key={label}>
                      <label className="flex items-center gap-2 px-2 py-1 rounded hover:bg-panel2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enabled.has(label)}
                          onChange={() => toggle(label)}
                          className="accent-pulse-600"
                        />
                        <span className="text-xs text-zinc-300">{label}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </aside>

          <section className="p-4 overflow-y-auto">
            {(isDepartmentTemplate || isLspdTemplate || isBcsoTemplate || isEmsTemplate) && (
              <div className="mb-4 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold">
                  <LayoutTemplate className="w-4 h-4 text-zinc-300" />
                  <span>{templateShortName}</span>
                </div>
                <p className="text-sm italic text-zinc-100 leading-relaxed">
                  The &quot;{templateShortName}&quot; template doesn&apos;t yet have a description, but
                  there might be some information on the{" "}
                  <span className="text-lime-400 font-semibold">template&apos;s page</span>.
                </p>
                <div className="flex border border-line bg-panel2/60 shadow-sm">
                  <div className="w-14 shrink-0 bg-orange-600 flex items-center justify-center text-white text-xl">
                    ⚠
                  </div>
                  <div className="p-3 text-sm text-zinc-100 leading-relaxed">
                    This template is missing{" "}
                    <span className="text-lime-400 font-semibold">TemplateData</span>, and
                    its parameters have been{" "}
                    <span className="text-lime-400 font-semibold">autogenerated</span>.
                    As a result the template and its parameters lack descriptions.
                    There might be additional information on the{" "}
                    <span className="text-lime-400 font-semibold">template&apos;s page</span>.
                  </div>
                </div>
              </div>
            )}
            {/* Header section: title, image, caption */}
            <div className="panel p-3 space-y-3 mb-4">
              <div className="font-display font-semibold text-pulse-300 text-[11px] uppercase tracking-wider text-center pb-2 border-b border-pulse-700/30">
                Header
              </div>
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-zinc-400">Title</div>
                <input
                  type="text"
                  value={boxTitle}
                  onChange={(e) => setBoxTitle(e.target.value)}
                  className={input + " text-sm"}
                  placeholder="Zachary Kane"
                />
              </div>
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-zinc-400">Image</div>
                <ImageInput
                  url={boxImageUrl}
                  onChange={(url) => setBoxImageUrl(url || undefined)}
                  upload={uploadImage}
                />
              </div>
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-zinc-400">Image caption (fallback)</div>
                <input
                  type="text"
                  value={boxImageLabel}
                  onChange={(e) => setBoxImageLabel(e.target.value)}
                  className={input + " text-sm"}
                  placeholder="Captain Kane portrait"
                />
              </div>
            </div>

            <p className="text-sm text-zinc-300 mb-4">
              Toggle which fields appear in the {template.label}. Unchecked
              fields are hidden. Field values you&apos;ve already entered are
              preserved. Click <b>Apply</b> to update the layout.
            </p>
            <div className="space-y-4">
              {template.groups.map((group) => {
                const visibleInGroup = group.fields.filter(
                  (field) => enabled.has(templateFieldSource(field)) && filter(templateFieldLabel(field))
                );
                if (!visibleInGroup.length) return null;
                return (
                  <div key={group.heading || "no-heading"} className="panel p-3">
                    {group.heading && (
                      <div className="font-display font-semibold text-pulse-300 text-[11px] uppercase tracking-wider mb-2 text-center pb-2 border-b border-pulse-700/30">
                        {group.heading}
                      </div>
                    )}
                    <div className="space-y-2">
                      {visibleInGroup.map((field) => {
                        const label = templateFieldLabel(field);
                        const source = templateFieldSource(field);
                        const existing = existingByKey.get(source);
                        return (
                          <div key={source} className="space-y-1">
                            <div className="text-[10px] uppercase tracking-wider text-zinc-400">
                              {label}
                            </div>
                            <input
                              type="text"
                              defaultValue={existing?.value ?? ""}
                              onChange={(e) => {
                                // Mutate the existing map so Apply persists changes.
                                const cur = existingByKey.get(source);
                                if (cur) cur.value = e.target.value;
                                else
                                  existingByKey.set(source, {
                                    label,
                                    source,
                                    value: e.target.value,
                                    kind: "field",
                                  });
                              }}
                              className={input + " text-sm"}
                              placeholder=""
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ImageInput({
  url,
  onChange,
  upload,
}: {
  url?: string;
  onChange: (url: string | null) => void;
  upload: (file: File) => Promise<string | null>;
}) {
  const [busy, setBusy] = useState(false);
  const isGallery = url?.trim().toLowerCase().startsWith("<gallery");
  return (
    <div className="space-y-2">
      <textarea
        value={url || ""}
        onChange={(e) => onChange(e.target.value || null)}
        className={`${input} min-h-[42px] resize-y`}
        placeholder="/uploads/your-image.jpg, external URL, or <gallery>...</gallery>"
      />
      <div className="flex items-center gap-2">
        <label className="inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-md border border-line bg-panel2 hover:border-pulse-700/60 text-zinc-200 cursor-pointer">
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          Upload image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setBusy(true);
              const u = await upload(f);
              setBusy(false);
              if (u) onChange(u);
              e.target.value = "";
            }}
          />
        </label>
        {url && !isGallery && (
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-10 h-10 object-cover rounded border border-line" />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Clear
            </button>
          </div>
        )}
        {url && isGallery && (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded border border-line bg-panel2 flex items-center justify-center text-[10px] text-zinc-400">
              Gallery
            </div>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Clear
            </button>
          </div>
        )}
        {!url && <ImageIcon className="w-4 h-4 text-zinc-600" />}
      </div>
    </div>
  );
}
