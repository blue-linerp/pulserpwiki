"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save, RotateCcw, Shield, BookOpen,
  Layout, Link2, ChevronDown, ChevronRight, Loader2,
  CheckCircle2, Settings2, Check, X
} from "lucide-react";

// ── Sidebar structure mirrored from sidebar.ts ───────────────────────────────
const SIDEBAR_GROUPS = [
  {
    title: "Explore",
    links: [
      { label: "Main Page",       href: "/" },
      { label: "All Pages",       href: "/wiki/all-pages" },
      { label: "Recent Changes",  href: "/wiki/recent-changes" },
      { label: "Community",       href: "/wiki/community" },
      { label: "Server Rules",    href: "/wiki/server-rules" },
      { label: "Getting Started", href: "/wiki/getting-started" },
    ],
  },
  {
    title: "Wiki Content",
    links: [
      { label: "Departments",       href: "/wiki/departments" },
      { label: "Businesses",        href: "/wiki/businesses" },
      { label: "Civilian Jobs",     href: "/wiki/civilian-jobs" },
      { label: "Criminal Activities",href: "/wiki/criminal-activities" },
      { label: "Characters",        href: "/wiki/characters" },
      { label: "Locations",         href: "/wiki/locations" },
      { label: "Vehicles",          href: "/wiki/vehicles" },
      { label: "Weapons",           href: "/wiki/weapons" },
      { label: "Server Systems",    href: "/wiki/phone-system" },
    ],
  },
  {
    title: "Map",
    links: [
      { label: "Interactive Map", href: "/wiki/map" },
    ],
  },
  {
    title: "Locations",
    links: [
      { label: "All Locations",  href: "/wiki/locations" },
      { label: "Los Santos",     href: "/wiki/los-santos" },
      { label: "Blaine County",  href: "/wiki/blaine-county" },
      { label: "Sandy Shores",   href: "/wiki/sandy-shores" },
      { label: "Paleto Bay",     href: "/wiki/paleto-bay" },
      { label: "Grapeseed",      href: "/wiki/grapeseed" },
      { label: "Chumash",        href: "/wiki/chumash" },
    ],
  },
  {
    title: "Departments",
    links: [
      { label: "All Departments",                href: "/wiki/departments" },
      { label: "EMS / Medical",                  href: "/wiki/ems-medical" },
      { label: "Department of Justice",          href: "/wiki/department-of-justice" },
      { label: "Government",                     href: "/wiki/government" },
      { label: "Los Santos Police Department",   href: "/wiki/los-santos-police-department" },
    ],
  },
  {
    title: "Guides",
    links: [
      { label: "How to Join",           href: "/wiki/how-to-join" },
      { label: "Application Process",   href: "/wiki/application-process" },
      { label: "Character Creation",    href: "/wiki/character-creation" },
      { label: "New Player Guide",      href: "/wiki/getting-started" },
      { label: "Economy Guide",         href: "/wiki/banking-system" },
      { label: "Phone System",          href: "/wiki/phone-system" },
      { label: "Housing System",        href: "/wiki/housing-system" },
      { label: "Business Guide",        href: "/wiki/businesses" },
      { label: "Law Enforcement Guide", href: "/wiki/departments" },
      { label: "Criminal Guide",        href: "/wiki/criminal-activities" },
    ],
  },
];

// ── Wiki pages that can be toggled ───────────────────────────────────────────
// Slugs MUST match the real /wiki/<slug> path or toggling them has no effect.
const WIKI_PAGES: { slug: string; label: string }[] = [
  { slug: "main-page",                   label: "Main Page" },
  { slug: "all-pages",                   label: "All Pages" },
  { slug: "recent-changes",              label: "Recent Changes" },
  { slug: "community",                   label: "Community Portal" },
  { slug: "server-rules",                label: "Server Rules" },
  { slug: "getting-started",             label: "Getting Started" },
  { slug: "map",                         label: "Interactive Map" },
  { slug: "characters",                  label: "Characters" },
  { slug: "departments",                 label: "Departments" },
  { slug: "los-santos-police-department",label: "Los Santos Police Department" },
  { slug: "ems-medical",                 label: "EMS / Medical" },
  { slug: "department-of-justice",       label: "Department of Justice" },
  { slug: "government",                  label: "Government" },
  { slug: "locations",                   label: "Locations" },
  { slug: "st-fiacre",                   label: "St. Fiacre Medical Center" },
  { slug: "businesses",                  label: "Businesses" },
  { slug: "civilian-jobs",               label: "Civilian Jobs" },
  { slug: "criminal-activities",         label: "Criminal Activities" },
  { slug: "vehicles",                    label: "Vehicles" },
  { slug: "weapons",                     label: "Weapons" },
  { slug: "housing-system",              label: "Housing System" },
  { slug: "phone-system",                label: "Phone System" },
  { slug: "banking-system",              label: "Banking System" },
  { slug: "how-to-join",                 label: "How to Join" },
  { slug: "application-process",         label: "Application Process" },
  { slug: "character-creation",          label: "Character Creation" },
];

type Settings = Record<string, string>;

function key_page(slug: string)        { return `page_enabled:${slug}`; }
function key_sidebar_group(title: string) { return `sidebar_group:${title}`; }
function key_sidebar_link(href: string)  { return `sidebar_link:${href}`; }

function isEnabled(settings: Settings, k: string, def = true): boolean {
  if (!(k in settings)) return def;
  return settings[k] === "1";
}

export default function AdminControlPanel() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState<Settings>({});
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(["Pages", "Sidebar Groups"]));

  useEffect(() => {
    fetch("/api/admin/settings", { cache: "no-store", credentials: "include" })
      .then(r => r.json())
      .then(d => { setSettings(d.settings ?? {}); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function get(k: string, def = true) {
    if (k in dirty) return dirty[k] === "1";
    return isEnabled(settings, k, def);
  }

  function toggle(k: string, def = true) {
    const current = get(k, def);
    setDirty(prev => ({ ...prev, [k]: current ? "0" : "1" }));
    setSaved(false);
  }

  async function saveAll() {
    if (!Object.keys(dirty).length) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(dirty),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        alert(`Failed to save settings (${res.status}): ${txt || res.statusText}`);
        return;
      }
      setSettings(prev => ({ ...prev, ...dirty }));
      // Broadcast so client components (Sidebar) re-fetch without reload.
      try {
        window.dispatchEvent(
          new CustomEvent("pulse:settings-changed", { detail: { keys: Object.keys(dirty) } })
        );
      } catch { /* no-op */ }
      // Force Next.js to re-run server components in the current tab so
      // disabled pages flip to "Coming Soon" immediately when navigating.
      try { router.refresh(); } catch { /* no-op */ }
      setDirty({});
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(`Save failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
    }
  }

  function resetAll() {
    if (!confirm("Reset all changes since last save?")) return;
    setDirty({});
  }

  function toggleSection(title: string) {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  }

  const dirtyCount = Object.keys(dirty).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-zinc-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading settings…
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Settings2 className="w-5 h-5 text-pulse-500" />
          <div>
            <h1 className="font-display font-extrabold text-2xl text-white">Site Control Panel</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Enable or disable pages and sidebar sections.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {dirtyCount > 0 && (
            <button onClick={resetAll} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-md border border-line text-zinc-400 hover:text-white hover:border-pulse-700/60">
              <RotateCcw className="w-3.5 h-3.5" /> Reset ({dirtyCount})
            </button>
          )}
          <button
            onClick={saveAll}
            disabled={saving || dirtyCount === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md bg-pulse-600 hover:bg-pulse-500 border border-pulse-500/60 text-white shadow-glow disabled:opacity-50 transition"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saved ? "Saved!" : `Save${dirtyCount > 0 ? ` (${dirtyCount})` : ""}`}
          </button>
        </div>
      </div>

      {saved && (
        <div className="panel border-emerald-700/40 bg-emerald-900/10 text-emerald-400 p-3 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> Settings saved. Changes take effect on next page load.
        </div>
      )}

      {/* ── Wiki Pages ─────────────────────────────────────────────────── */}
      <Section
        title="Pages"
        icon={<BookOpen className="w-4 h-4" />}
        open={openGroups.has("Pages")}
        onToggle={() => toggleSection("Pages")}
        description="Disable a page to show a 'Coming Soon' placeholder instead of the content."
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {WIKI_PAGES.map(p => {
            const k = key_page(p.slug);
            const on = get(k);
            return (
              <ToggleRow
                key={p.slug}
                label={p.label}
                sublabel={`/wiki/${p.slug}`}
                enabled={on}
                onChange={() => toggle(k)}
                dirty={k in dirty}
              />
            );
          })}
        </div>
      </Section>

      {/* ── Sidebar Groups ─────────────────────────────────────────────── */}
      <Section
        title="Sidebar Groups"
        icon={<Layout className="w-4 h-4" />}
        open={openGroups.has("Sidebar Groups")}
        onToggle={() => toggleSection("Sidebar Groups")}
        description="Hide entire sidebar sections from all users."
      >
        <div className="space-y-2">
          {SIDEBAR_GROUPS.map(g => {
            const gk = key_sidebar_group(g.title);
            const groupOn = get(gk);
            return (
              <div key={g.title} className="panel p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="font-display font-semibold text-white text-sm">{g.title}</span>
                    <span className="text-[11px] text-zinc-600">{g.links.length} links</span>
                  </div>
                  <Toggle enabled={groupOn} onChange={() => toggle(gk)} dirty={gk in dirty} />
                </div>
                {/* Individual links */}
                <div className="pl-5 space-y-1 border-l border-line/60">
                  {g.links.map(l => {
                    const lk = key_sidebar_link(l.href);
                    const linkOn = get(lk);
                    return (
                      <div key={l.href} className="flex items-center justify-between py-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Link2 className="w-3 h-3 text-zinc-600 shrink-0" />
                          <span className={`text-xs truncate ${linkOn && groupOn ? "text-zinc-300" : "text-zinc-600 line-through"}`}>{l.label}</span>
                          <span className="text-[10px] text-zinc-700 truncate hidden sm:block">{l.href}</span>
                        </div>
                        <Toggle enabled={linkOn} onChange={() => toggle(lk)} dirty={lk in dirty} small />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Navigation Items ───────────────────────────────────────────── */}
      <Section
        title="Home Page Categories"
        icon={<Layout className="w-4 h-4" />}
        open={openGroups.has("Home Page Categories")}
        onToggle={() => toggleSection("Home Page Categories")}
        description="Hide category tiles from the home page Browse Categories grid."
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {[
            { id: "characters",    label: "Characters" },
            { id: "law-enforcement",label: "Law Enforcement" },
            { id: "medical",       label: "Medical" },
            { id: "government",    label: "Government" },
            { id: "groups",        label: "Criminal Activities" },
            { id: "businesses",    label: "Businesses" },
            { id: "activities",    label: "Activities" },
            { id: "weapons",       label: "Weapons" },
            { id: "vehicles",      label: "Vehicles" },
            { id: "housing",       label: "Housing" },
            { id: "jobs",          label: "Jobs" },
            { id: "rules",         label: "Rules" },
          ].map(c => {
            const k = `category_enabled:${c.id}`;
            const on = get(k);
            return (
              <ToggleRow
                key={c.id}
                label={c.label}
                sublabel={`category: ${c.id}`}
                enabled={on}
                onChange={() => toggle(k)}
                dirty={k in dirty}
              />
            );
          })}
        </div>
      </Section>

      {/* ── Site Features ──────────────────────────────────────────────── */}
      <Section
        title="Site Features"
        icon={<Settings2 className="w-4 h-4" />}
        open={openGroups.has("Site Features")}
        onToggle={() => toggleSection("Site Features")}
        description="Toggle global site features."
      >
        <div className="grid sm:grid-cols-2 gap-2">
          {[
            { k: "feature:maintenance",    label: "Maintenance Mode",        sub: "Hides site from non-admins" },
            { k: "feature:search",         label: "Search Bar",              sub: "Navbar search" },
            { k: "feature:recent_changes", label: "Recent Changes Widget",   sub: "Sidebar + home page" },
            { k: "feature:create_page",    label: "Create New Page Button",  sub: "Admin navbar button" },
            { k: "feature:edit_button",    label: "Edit Button on Pages",    sub: "Shown to admins" },
            { k: "feature:user_menu",      label: "User Menu / Steam Login", sub: "Navbar" },
            { k: "feature:toc",            label: "Table of Contents",       sub: "On article pages" },
            { k: "feature:breadcrumbs",    label: "Breadcrumbs",             sub: "Above page titles" },
            { k: "feature:tags",           label: "Tags",                    sub: "Below article content" },
            { k: "feature:infobox",        label: "Infoboxes",               sub: "Right column on articles" },
          ].map(f => {
            // Maintenance defaults to OFF; everything else defaults to ON.
            const def = f.k === "feature:maintenance" ? false : true;
            const on = get(f.k, def);
            return (
              <ToggleRow
                key={f.k}
                label={f.label}
                sublabel={f.sub}
                enabled={on}
                onChange={() => toggle(f.k, def)}
                dirty={f.k in dirty}
              />
            );
          })}
        </div>
      </Section>

      {/* Floating save bar when dirty */}
      {dirtyCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-panel border border-pulse-700/60 shadow-glow rounded-full px-5 py-2.5">
          <span className="text-xs text-zinc-300">{dirtyCount} unsaved change{dirtyCount !== 1 ? "s" : ""}</span>
          <button onClick={resetAll} className="text-xs text-zinc-500 hover:text-white">Reset</button>
          <button onClick={saveAll} disabled={saving} className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-pulse-600 hover:bg-pulse-500 text-white border border-pulse-500/60 disabled:opacity-50">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
          </button>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, icon, open, onToggle, description, children }: {
  title: string; icon: React.ReactNode; open: boolean;
  onToggle: () => void; description: string; children: React.ReactNode;
}) {
  return (
    <div className="panel overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-panel2/60 border-b border-line hover:bg-panel2 transition"
      >
        <div className="flex items-center gap-2">
          <span className="text-pulse-500">{icon}</span>
          <span className="font-display font-semibold text-white text-sm uppercase tracking-wide">{title}</span>
          <span className="text-[11px] text-zinc-600 font-normal normal-case tracking-normal hidden sm:block">— {description}</span>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

function Toggle({ enabled, onChange, dirty, small = false }: {
  enabled: boolean; onChange: () => void; dirty: boolean; small?: boolean;
}) {
  const w = small ? "w-9" : "w-11";
  const h = small ? "h-5" : "h-6";
  const knob = small ? "w-3.5 h-3.5" : "w-4 h-4";
  const slide = small ? "translate-x-4" : "translate-x-5";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
      className={`group relative inline-flex shrink-0 items-center ${w} ${h} rounded-full border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-pulse-500/50 ${
        enabled
          ? `bg-gradient-to-r from-pulse-600 to-pulse-500 border-pulse-400/60 ${
              dirty ? "shadow-[0_0_0_2px_rgba(220,38,38,0.25)]" : "shadow-[0_0_10px_rgba(220,38,38,0.35)]"
            }`
          : `bg-panel2 border-line ${dirty ? "ring-2 ring-pulse-700/40" : ""}`
      }`}
    >
      <span
        className={`absolute left-0.5 top-1/2 -translate-y-1/2 ${knob} rounded-full bg-white shadow-md transition-transform duration-150 flex items-center justify-center ${
          enabled ? slide : "translate-x-0"
        }`}
      >
        {enabled ? (
          <Check className="w-2.5 h-2.5 text-pulse-600" strokeWidth={3} />
        ) : (
          <X className="w-2.5 h-2.5 text-zinc-500" strokeWidth={3} />
        )}
      </span>
      {dirty && (
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-pulse-400 ring-2 ring-bg" />
      )}
    </button>
  );
}

function ToggleRow({ label, sublabel, enabled, onChange, dirty }: {
  label: string; sublabel: string; enabled: boolean; onChange: () => void; dirty: boolean;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onChange}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onChange();
        }
      }}
      className={`group w-full text-left flex items-center justify-between gap-3 p-3 rounded-md border transition cursor-pointer select-none ${
        dirty
          ? "border-pulse-700/70 bg-pulse-900/15"
          : enabled
          ? "border-line bg-panel2/40 hover:border-pulse-700/40 hover:bg-panel2"
          : "border-line/60 bg-panel2/20 hover:bg-panel2/40"
      }`}
    >
      <div className="min-w-0">
        <div className={`text-sm font-medium truncate ${
          enabled ? "text-white" : "text-zinc-500"
        }`}>{label}</div>
        <div className="text-[11px] text-zinc-600 truncate font-mono">{sublabel}</div>
      </div>
      {/* Stop click bubbling so we don't double-toggle. */}
      <span onClick={(e) => e.stopPropagation()}>
        <Toggle enabled={enabled} onChange={onChange} dirty={dirty} />
      </span>
    </div>
  );
}
