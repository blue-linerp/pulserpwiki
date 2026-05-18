"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Upload,
  HelpCircle,
  GripVertical,
  Plus,
  Trash2,
  Pencil,
  MoreVertical,
  Crosshair,
  Check,
  MapPin,
  X,
  PlusCircle,
} from "lucide-react";
import MapCanvas, { type MapStyle } from "./MapCanvas";
import {
  useMapState,
  effectiveMarkers,
  buildMarkersExport,
  type MapCategoryConfig,
  type CustomMarker,
  getDefaultCategories,
} from "@/lib/mapState";
import type { MapMarker } from "@/data/mapMarkers";

const SWATCHES = [
  "#dc2626", "#f59e0b", "#22c55e", "#06b6d4", "#2563eb",
  "#7c3aed", "#a855f7", "#ec4899", "#e5e7eb", "#fbbf24",
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function MapEditor() {
  const { state, setState, reset } = useMapState();
  const [style] = useState<MapStyle>("atlas");
  const [selected, setSelected] = useState<MapMarker | null>(null);
  const [openSections, setOpenSections] = useState({ display: true, categories: true });
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [exportCopied, setExportCopied] = useState(false);
  const [pickerOn, setPickerOn] = useState(false);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);

  // --- Add Marker workflow state ---
  // 'intro'  -> show the intro popup explaining the workflow
  // 'placing' -> cursor follows pin; next map click drops the marker
  // null     -> idle
  const [addMode, setAddMode] = useState<null | "intro" | "placing">(null);
  const [editing, setEditing] = useState<{ marker: CustomMarker; isNew: boolean } | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  // Mark dirty on any state change after hydration.
  useEffect(() => {
    setDirty(true);
  }, [state]);

  const markers = useMemo(() => effectiveMarkers(state), [state]);

  const categoryColorMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of state.categories) m[c.id] = c.color;
    return m;
  }, [state.categories]);

  function categoryColor(id: string) {
    return categoryColorMap[id] ?? "#dc2626";
  }

  // Meta updaters
  function setMeta<K extends keyof typeof state.meta>(key: K, val: (typeof state.meta)[K]) {
    setState((s) => ({ ...s, meta: { ...s.meta, [key]: val } }));
  }

  // Category mutators
  function updateCategory(id: string, patch: Partial<MapCategoryConfig>) {
    setState((s) => ({
      ...s,
      categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }
  function removeCategory(id: string) {
    setState((s) => ({ ...s, categories: s.categories.filter((c) => c.id !== id) }));
  }
  function addCategory() {
    const newCat: MapCategoryConfig = {
      id: `cat-${uid()}`,
      label: "New Category",
      color: SWATCHES[state.categories.length % SWATCHES.length],
      enabled: true,
    };
    setState((s) => ({ ...s, categories: [...s.categories, newCat] }));
    setEditingCatId(newCat.id);
  }
  function moveCategory(id: string, dir: -1 | 1) {
    setState((s) => {
      const idx = s.categories.findIndex((c) => c.id === id);
      if (idx < 0) return s;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= s.categories.length) return s;
      const list = [...s.categories];
      const [item] = list.splice(idx, 1);
      list.splice(newIdx, 0, item);
      return { ...s, categories: list };
    });
  }

  // Marker drag handler
  function handleDragEnd(id: string, x: number, y: number) {
    setState((s) => ({
      ...s,
      markerOverrides: { ...s.markerOverrides, [id]: { ...s.markerOverrides[id], x, y } },
    }));
    setSelected((sel) => (sel?.id === id ? { ...sel, x, y } : sel));
  }

  function handleMapClick(x: number, y: number) {
    if (addMode === "placing") {
      const newMarker: CustomMarker = {
        id: `m-${uid()}`,
        name: "",
        category: state.categories[0]?.id ?? "landmark",
        x,
        y,
      };
      setState((s) => ({ ...s, customMarkers: [...s.customMarkers, newMarker] }));
      setAddMode(null);
      setEditing({ marker: newMarker, isNew: true });
      return;
    }
    if (pickerOn && navigator.clipboard) {
      navigator.clipboard.writeText(`x: ${x}, y: ${y}`).catch(() => undefined);
    }
  }

  function startAddFlow() {
    setSelected(null);
    setEditing(null);
    setAddMode("intro");
  }

  function cancelAddFlow() {
    setAddMode(null);
  }

  function commitMarkerEdit(updated: CustomMarker) {
    setState((s) => ({
      ...s,
      customMarkers: s.customMarkers.map((m) => (m.id === updated.id ? updated : m)),
    }));
    setEditing(null);
  }

  function cancelMarkerEdit() {
    if (editing?.isNew) {
      // Remove the just-placed marker if user cancels.
      setState((s) => ({
        ...s,
        customMarkers: s.customMarkers.filter((m) => m.id !== editing.marker.id),
      }));
    }
    setEditing(null);
  }

  function deleteEditingMarker() {
    if (!editing) return;
    if (!window.confirm("Delete this marker?")) return;
    setState((s) => ({
      ...s,
      customMarkers: s.customMarkers.filter((m) => m.id !== editing.marker.id),
    }));
    setEditing(null);
  }

  // Track cursor for the ghost-pin overlay while in 'placing' mode.
  useEffect(() => {
    if (addMode !== "placing") {
      setCursorPos(null);
      return;
    }
    const onMove = (e: MouseEvent) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAddMode(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("keydown", onKey);
    };
  }, [addMode]);

  // If user clicks an existing custom marker while idle, open the edit panel.
  function handleSelect(m: MapMarker) {
    setSelected(m);
    const custom = state.customMarkers.find((c) => c.id === m.id);
    if (custom) setEditing({ marker: custom, isNew: false });
  }

  function discardChanges() {
    if (!window.confirm("Discard all unsaved changes?")) return;
    reset();
    setDirty(false);
  }

  function save() {
    // localStorage save happens automatically via useMapState; this acts
    // as an explicit acknowledgement + export to clipboard.
    setDirty(false);
    setSavedToast(true);
    window.setTimeout(() => setSavedToast(false), 1500);
  }

  function exportTs() {
    const text = buildMarkersExport(markers);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setExportCopied(true);
        window.setTimeout(() => setExportCopied(false), 1500);
      });
    }
    // eslint-disable-next-line no-console
    console.log(text);
  }

  function resetCategories() {
    setState((s) => ({ ...s, categories: getDefaultCategories() }));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
      {/* Left sidebar — Editor controls */}
      <aside className="panel flex flex-col">
        <div className="px-3 py-3 border-b border-line">
          <div className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-pulse-500" />
            <h2 className="font-display font-bold text-white text-sm uppercase tracking-wider">
              Interactive Maps Editor
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-4">
          {/* Map Display section */}
          <SectionHeader
            title="Map Display"
            open={openSections.display}
            onToggle={() => setOpenSections((s) => ({ ...s, display: !s.display }))}
          />
          {openSections.display && (
            <div className="space-y-3">
              <Field label="Map Name">
                <input
                  value={state.meta.name}
                  onChange={(e) => setMeta("name", e.target.value)}
                  className="w-full bg-panel2 border border-line rounded-md px-2.5 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-pulse-600"
                />
              </Field>
              <Field label="Map Description">
                <textarea
                  value={state.meta.description + "\n\n" + state.meta.warning}
                  onChange={(e) => {
                    const parts = e.target.value.split(/\n{2,}/);
                    setMeta("description", parts[0] ?? "");
                    setMeta("warning", parts.slice(1).join("\n\n"));
                  }}
                  rows={5}
                  className="w-full bg-panel2 border border-line rounded-md px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-pulse-600 resize-none scrollbar-thin"
                />
              </Field>
              <Field label="Map Image">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-16 rounded border border-line bg-panel2 overflow-hidden flex items-center justify-center text-[10px] text-zinc-500 text-center px-1">
                    GTA V atlas tiles
                  </div>
                  <button
                    disabled
                    title="Tile-based map — image upload not applicable"
                    className="p-2 rounded-md border border-line bg-panel2 text-zinc-500 cursor-not-allowed"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              </Field>
              <Field label="Marker Progress Tracking" help>
                <ToggleSwitch
                  on={state.meta.progressTracking}
                  onChange={(v) => setMeta("progressTracking", v)}
                  labelOn="Progress tracking on"
                  labelOff="Progress tracking off"
                />
              </Field>
            </div>
          )}

          {/* Categories section */}
          <SectionHeader
            title="Categories"
            open={openSections.categories}
            onToggle={() => setOpenSections((s) => ({ ...s, categories: !s.categories }))}
            help
          />
          {openSections.categories && (
            <div className="space-y-1.5">
              {state.categories.map((c, i) => {
                const editing = editingCatId === c.id;
                return (
                  <div
                    key={c.id}
                    className="group flex items-center gap-1.5 px-1.5 py-1.5 rounded-md border border-line bg-panel2"
                  >
                    <div className="flex flex-col -my-1">
                      <button
                        onClick={() => moveCategory(c.id, -1)}
                        disabled={i === 0}
                        className="text-zinc-600 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed leading-none"
                        title="Move up"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => moveCategory(c.id, 1)}
                        disabled={i === state.categories.length - 1}
                        className="text-zinc-600 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed leading-none"
                        title="Move down"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                    <GripVertical className="w-3.5 h-3.5 text-zinc-600 shrink-0" />

                    {/* Color swatch with picker */}
                    <ColorPicker
                      value={c.color}
                      onChange={(v) => updateCategory(c.id, { color: v })}
                    />

                    {editing ? (
                      <input
                        autoFocus
                        value={c.label}
                        onChange={(e) => updateCategory(c.id, { label: e.target.value })}
                        onBlur={() => setEditingCatId(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") setEditingCatId(null);
                        }}
                        className="flex-1 min-w-0 bg-panel border border-line rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:border-pulse-600"
                      />
                    ) : (
                      <button
                        onClick={() => setEditingCatId(c.id)}
                        className="flex-1 min-w-0 text-left text-xs font-semibold uppercase tracking-wider text-zinc-200 truncate hover:text-white"
                        title="Rename"
                      >
                        {c.label}
                      </button>
                    )}

                    <button
                      onClick={() => removeCategory(c.id)}
                      className="text-zinc-500 hover:text-pulse-400 p-0.5"
                      title="Delete category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              <button
                onClick={addCategory}
                className="w-full flex items-center justify-center gap-1.5 px-2 py-2 rounded-md border border-dashed border-line hover:border-pulse-600 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-pulse-400 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Category
              </button>

              <button
                onClick={resetCategories}
                className="w-full text-[10px] text-zinc-500 hover:text-zinc-300 mt-1"
              >
                Reset categories to defaults
              </button>
            </div>
          )}

          {/* Add Marker */}
          <button
            onClick={startAddFlow}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-pulse-600 hover:bg-pulse-500 text-white text-xs font-bold uppercase tracking-wider shadow-glow border border-pulse-500/60 transition"
          >
            <PlusCircle className="w-4 h-4" />
            Add Marker
          </button>

          {/* Picker / export tools */}
          <div className="pt-2 border-t border-line space-y-2">
            <button
              onClick={() => setPickerOn((v) => !v)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-xs transition ${
                pickerOn
                  ? "border-pulse-500 bg-pulse-900/20 text-white"
                  : "border-line bg-panel2 text-zinc-300 hover:text-white"
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              {pickerOn ? "Picker on — click map to copy" : "Pick coordinates"}
            </button>
            <button
              onClick={exportTs}
              className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md border border-line bg-panel2 hover:bg-panel text-xs text-zinc-200"
            >
              {exportCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
              {exportCopied ? "Copied TS to clipboard" : "Export markers as TS"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-line p-3 space-y-2">
          <label className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <input type="checkbox" className="accent-pulse-600" />
            Describe changes (optional)
          </label>
          <div className="flex items-center gap-2">
            <Link
              href="/wiki/map"
              className="text-[11px] uppercase tracking-wider font-bold text-zinc-400 hover:text-white"
            >
              Exit
            </Link>
            <button
              onClick={discardChanges}
              className="text-[11px] uppercase tracking-wider font-bold text-zinc-400 hover:text-white"
            >
              Discard
            </button>
            <button
              onClick={save}
              disabled={!dirty}
              className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-pulse-600 hover:bg-pulse-500 text-white text-[11px] font-bold uppercase tracking-wider shadow-glow border border-pulse-500/60 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {savedToast ? <Check className="w-3.5 h-3.5" /> : null}
              {savedToast ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </aside>

      {/* Map */}
      <div className="panel relative overflow-hidden" style={{ minHeight: "min(82vh, 760px)" }}>
        <MapCanvas
          markers={markers}
          categoryColor={categoryColor}
          style={style}
          selectedId={selected?.id ?? null}
          onSelect={handleSelect}
          draggable={!addMode}
          onDragEnd={handleDragEnd}
          onMapClick={handleMapClick}
          onHover={setHoverCoord}
          className={`absolute inset-0 bg-[#1a0e16] ${
            addMode === "placing" ? "cursor-none" : ""
          }`}
        />

        {/* Ghost pin that follows the cursor while placing */}
        {addMode === "placing" && cursorPos && (
          <div
            className="pointer-events-none fixed z-[2000]"
            style={{
              left: cursorPos.x,
              top: cursorPos.y,
              transform: "translate(-50%, -100%)",
            }}
          >
            <svg width="36" height="50" viewBox="0 0 24 34" style={{ filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.6))" }}>
              <path d="M12 0C5.4 0 0 5.4 0 12c0 8.2 12 22 12 22s12-13.8 12-22C24 5.4 18.6 0 12 0z" fill={categoryColor(state.categories[0]?.id ?? "")} />
              <circle cx="12" cy="12" r="4.5" fill="#0b0b0d" />
              <text x="12" y="15" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="700">+</text>
            </svg>
          </div>
        )}

        {/* Intro popup for Add Marker */}
        {addMode === "intro" && (
          <div className="absolute inset-0 z-[1500] flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
            <div className="panel p-5 w-[300px] shadow-glow relative">
              <button
                onClick={cancelAddFlow}
                className="absolute top-2 right-2 text-zinc-500 hover:text-white"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex flex-col items-center text-center">
                <div className="w-9 h-9 rounded-full bg-pulse-600/15 border border-pulse-500/40 flex items-center justify-center mb-2">
                  <PlusCircle className="w-5 h-5 text-pulse-400" />
                </div>
                <h3 className="font-display font-bold text-white text-base mb-1.5">
                  Add marker
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Click anywhere on the map to add a new marker or edit an
                  existing one. To move a marker, click and drag it anywhere on
                  the map.
                </p>
                <button
                  onClick={() => setAddMode("placing")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-pulse-600 hover:bg-pulse-500 text-white text-xs font-bold uppercase tracking-wider shadow-glow border border-pulse-500/60 transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add Marker
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Placing-mode hint banner */}
        {addMode === "placing" && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1400] panel px-3 py-1.5 text-[11px] flex items-center gap-2 border-pulse-500/40">
            <MapPin className="w-3.5 h-3.5 text-pulse-400" />
            <span className="text-zinc-200 font-semibold">Click on the map to drop the new marker</span>
            <span className="text-zinc-500">— Esc to cancel</span>
          </div>
        )}

        {/* Edit Marker side panel */}
        {editing && (
          <EditMarkerPanel
            key={editing.marker.id}
            value={editing.marker}
            isNew={editing.isNew}
            categories={state.categories}
            onCancel={cancelMarkerEdit}
            onSave={commitMarkerEdit}
            onDelete={editing.isNew ? undefined : deleteEditingMarker}
          />
        )}

        {/* Top-right controls */}
        <div className="absolute top-3 right-3 z-[500] flex flex-col gap-1.5">
          <button
            className="p-1.5 rounded-md bg-pulse-600 hover:bg-pulse-500 text-white border border-pulse-500/60 shadow-glow"
            aria-label="Map menu"
            title="More"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 rounded-md bg-pulse-600 hover:bg-pulse-500 text-white border border-pulse-500/60 shadow-glow"
            aria-label="Center"
            title="Center map"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>

        {/* Hover coords */}
        {hoverCoord && (
          <div className="absolute left-3 top-3 z-[500] panel px-2 py-1 text-[11px] font-mono text-zinc-300 pointer-events-none">
            x: {hoverCoord.x.toFixed(1)} &middot; y: {hoverCoord.y.toFixed(1)}
          </div>
        )}

        {/* Selection info (only when not editing) */}
        {selected && !editing && (
          <div className="absolute left-3 bottom-3 z-[500] panel p-3 w-72 max-w-[calc(100%-1.5rem)] shadow-glow">
            <div className="flex items-start gap-2">
              <span
                className="mt-1 w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: categoryColor(selected.category) }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-white font-semibold text-sm truncate">
                  {selected.name}
                </div>
                <div className="text-[11px] font-mono text-pulse-300 mt-0.5">
                  x: {selected.x}, y: {selected.y}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  Drag pin on map to reposition.
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-zinc-500 hover:text-white"
                aria-label="Close"
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  open,
  onToggle,
  help = false,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  help?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between text-[12px] font-bold uppercase tracking-wider text-zinc-200 hover:text-white"
    >
      <span className="flex items-center gap-1.5">
        {title}
        {help && <HelpCircle className="w-3 h-3 text-zinc-500" />}
      </span>
      <ChevronUp
        className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${
          open ? "" : "rotate-180"
        }`}
      />
    </button>
  );
}

function Field({
  label,
  children,
  help = false,
}: {
  label: string;
  children: React.ReactNode;
  help?: boolean;
}) {
  return (
    <div>
      <div className="text-[11px] font-semibold text-zinc-300 mb-1 flex items-center gap-1">
        {label}
        {help && <HelpCircle className="w-3 h-3 text-zinc-500" />}
      </div>
      {children}
    </div>
  );
}

function ToggleSwitch({
  on,
  onChange,
  labelOn,
  labelOff,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  labelOn: string;
  labelOff: string;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="flex items-center gap-2 text-[11px] text-zinc-400"
    >
      <span
        className={`relative w-8 h-4 rounded-full transition ${
          on ? "bg-pulse-600" : "bg-zinc-700"
        }`}
      >
        <span
          className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${
            on ? "left-4" : "left-0.5"
          }`}
        />
      </span>
      {on ? labelOn : labelOff}
    </button>
  );
}

function EditMarkerPanel({
  value,
  isNew,
  categories,
  onSave,
  onCancel,
  onDelete,
}: {
  value: CustomMarker;
  isNew: boolean;
  categories: MapCategoryConfig[];
  onSave: (m: CustomMarker) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [draft, setDraft] = useState<CustomMarker>(value);
  const titleRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  function update<K extends keyof CustomMarker>(k: K, v: CustomMarker[K]) {
    setDraft((d) => ({ ...d, [k]: v }));
  }

  function handleFile(
    file: File | undefined,
    onResult: (dataUrl: string) => void,
    maxBytes = 10 * 1024 * 1024
  ) {
    if (!file) return;
    if (file.size > maxBytes) {
      alert(`File too large (max ${Math.round(maxBytes / 1024 / 1024)}MB).`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onResult(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  }

  const titleMissing = !draft.name.trim();
  const linkBroken = !!draft.href && !draft.linkLabel?.trim();

  return (
    <div className="absolute top-0 right-0 bottom-0 z-[1600] w-[330px] max-w-[95vw] panel border-l border-line overflow-y-auto scrollbar-thin">
      <div className="px-4 py-3 border-b border-line flex items-center justify-between">
        <h3 className="font-display font-bold text-white text-base">
          {isNew ? "Add Marker" : "Edit Marker"}
        </h3>
        <button
          onClick={onCancel}
          className="text-zinc-500 hover:text-white"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-3 space-y-4 text-sm">
        <p className="text-[10px] text-zinc-500">
          <span className="text-pulse-500">*</span> Indicates required fields
        </p>

        {/* Title */}
        <div>
          <label className="text-[11px] font-semibold text-zinc-300 mb-1 block">
            <span className="text-pulse-500">*</span> Title
          </label>
          <input
            ref={titleRef}
            value={draft.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Title"
            className="w-full bg-transparent border-0 border-b border-line focus:border-pulse-500 outline-none py-1.5 text-white placeholder:text-zinc-600"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-[11px] font-semibold text-zinc-300 mb-1 block">
            Description
          </label>
          <textarea
            value={draft.description ?? ""}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Description"
            rows={3}
            className="w-full bg-transparent border-0 border-b border-line focus:border-pulse-500 outline-none py-1.5 text-white placeholder:text-zinc-600 resize-none scrollbar-thin"
          />
        </div>

        {/* Image */}
        <div>
          <label className="text-[11px] font-semibold text-zinc-300 mb-1 block">
            Image
          </label>
          <label className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-md border border-dashed border-line hover:border-pulse-500 cursor-pointer text-xs text-zinc-400 hover:text-zinc-200 transition">
            <Upload className="w-5 h-5 text-pulse-400" />
            <span>Upload a png, jpg or svg. Max 10MB</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              className="hidden"
              onChange={(e) =>
                handleFile(e.target.files?.[0], (u) => update("image", u))
              }
            />
            {draft.image && (
              <img
                src={draft.image}
                alt=""
                className="mt-1 max-h-16 rounded border border-line"
              />
            )}
          </label>
        </div>

        {/* Link */}
        <div>
          <label className="text-[11px] font-semibold text-zinc-300 mb-1 block">
            Link (optional)
          </label>
          <input
            value={draft.href ?? ""}
            onChange={(e) => update("href", e.target.value)}
            placeholder="Page title"
            className="w-full bg-transparent border-0 border-b border-line focus:border-pulse-500 outline-none py-1.5 text-white placeholder:text-zinc-600 mb-2"
          />
          <input
            value={draft.linkLabel ?? ""}
            onChange={(e) => update("linkLabel", e.target.value)}
            placeholder="Link display text"
            className="w-full bg-transparent border-0 border-b border-line focus:border-pulse-500 outline-none py-1.5 text-white placeholder:text-zinc-600"
          />
          {linkBroken && (
            <p className="text-[10px] text-pulse-400 mt-1">
              This field is required if you link a page title.
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="text-[11px] font-semibold text-zinc-300 mb-1 block">
            <span className="text-pulse-500">*</span> Category
          </label>
          <select
            value={draft.category}
            onChange={(e) => update("category", e.target.value)}
            className="w-full bg-panel2 border border-line rounded-md px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-pulse-500"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-panel">
                {c.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-zinc-500 mt-1">
            Each marker must be associated with a category to better group
            similar markers.
          </p>
        </div>

        {/* Custom Marker Icon */}
        <div>
          <label className="text-[11px] font-semibold text-zinc-300 mb-1 block">
            Custom Marker Icon
          </label>
          <label className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-md border border-dashed border-line hover:border-pulse-500 cursor-pointer text-xs text-zinc-400 hover:text-zinc-200 transition text-center">
            <Upload className="w-5 h-5 text-pulse-400" />
            <span>Upload a svg, png, or jpg. (max: 64x64, min: 32x32)</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              className="hidden"
              onChange={(e) =>
                handleFile(
                  e.target.files?.[0],
                  (u) => update("customIcon", u),
                  256 * 1024
                )
              }
            />
            {draft.customIcon && (
              <img
                src={draft.customIcon}
                alt=""
                className="mt-1 w-8 h-8 rounded border border-line"
              />
            )}
          </label>
        </div>

        {/* Coordinates (read-only display) */}
        <div className="text-[11px] font-mono text-zinc-500">
          Position: x {draft.x}, y {draft.y}
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 px-4 py-3 border-t border-line bg-panel flex items-center gap-2">
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-pulse-400 hover:text-pulse-300 p-1.5"
            title="Delete marker"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onCancel}
          className="ml-auto text-[11px] uppercase tracking-wider font-bold text-zinc-400 hover:text-white px-2 py-1.5"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(draft)}
          disabled={titleMissing || linkBroken}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-pulse-600 hover:bg-pulse-500 text-white text-[11px] font-bold uppercase tracking-wider shadow-glow border border-pulse-500/60 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-4 h-4 rounded-full border-2 border-[#0b0b0d] shadow"
        style={{ background: value }}
        title="Change color"
      />
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 panel p-2 grid grid-cols-5 gap-1 w-[136px]">
            {SWATCHES.map((s) => (
              <button
                key={s}
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                }}
                className="w-5 h-5 rounded-full border border-line hover:scale-110 transition"
                style={{ background: s }}
              />
            ))}
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="col-span-5 w-full h-6 bg-transparent border border-line rounded cursor-pointer"
            />
          </div>
        </>
      )}
    </div>
  );
}
