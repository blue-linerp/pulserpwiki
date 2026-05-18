import Link from "next/link";
import {
  Users,
  Images,
  Settings2,
  BookOpen,
  Layout as LayoutIcon,
  FileText,
  AlertTriangle,
  Activity,
  ShieldAlert,
} from "lucide-react";
import { db, ensureSchema, Users as DbUsers, Pages as DbPages } from "@/lib/db";
import { getSettings } from "@/lib/siteSettings";

// Server component — pulls live counts and surfaces critical toggles.
export const dynamic = "force-dynamic";

async function getCounts() {
  try {
    await ensureSchema();
    const [users, customPages, hidden, settingsRow] = await Promise.all([
      DbUsers.count(),
      DbPages.allCustom().then((r) => r.length),
      DbPages.allHidden().then((r) => r.length),
      db
        .execute("SELECT COUNT(*) as c FROM site_settings")
        .then((r) => Number(r.rows[0]?.c ?? 0))
        .catch(() => 0),
    ]);
    return { users, customPages, hidden, settings: settingsRow };
  } catch {
    return { users: 0, customPages: 0, hidden: 0, settings: 0 };
  }
}

export default async function AdminDashboard() {
  const [counts, settings] = await Promise.all([getCounts(), getSettings()]);
  const maintenance = settings["feature:maintenance"] === "1";
  const disabledPages = Object.keys(settings).filter(
    (k) => k.startsWith("page_enabled:") && settings[k] === "0"
  ).length;
  const disabledSidebar = Object.keys(settings).filter(
    (k) =>
      (k.startsWith("sidebar_group:") || k.startsWith("sidebar_link:")) &&
      settings[k] === "0"
  ).length;
  const disabledCategories = Object.keys(settings).filter(
    (k) => k.startsWith("category_enabled:") && settings[k] === "0"
  ).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Hero */}
      <div className="panel p-5 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-pulse-700 via-pulse-500 to-crimson" />
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-pulse-400 font-semibold mb-1">
              Admin Dashboard
            </div>
            <h1 className="font-display font-extrabold text-2xl md:text-3xl text-white">
              Pulse RP Wiki Control Center
            </h1>
            <p className="text-sm text-zinc-400 mt-1.5 max-w-2xl">
              Manage users, pages, navigation, images, and site-wide feature
              toggles from one place. Every change here affects what readers
              see immediately.
            </p>
          </div>
          {maintenance && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-amber-500/60 bg-amber-900/20 text-amber-300 text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              Maintenance mode is ON
            </div>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Users" value={counts.users} icon={Users} />
        <Stat label="Custom pages" value={counts.customPages} icon={FileText} />
        <Stat label="Hidden pages" value={counts.hidden} icon={ShieldAlert} />
        <Stat label="Stored settings" value={counts.settings} icon={Settings2} />
      </div>

      {/* Configuration health */}
      <div className="panel p-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-400 font-semibold mb-3 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-pulse-500" /> Active overrides
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          <Pill label="Disabled pages"      n={disabledPages}      href="/admin/settings#pages" />
          <Pill label="Disabled sidebar items" n={disabledSidebar} href="/admin/settings#sidebar" />
          <Pill label="Disabled home categories" n={disabledCategories} href="/admin/settings#categories" />
        </div>
      </div>

      {/* Admin tools */}
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-400 font-semibold mb-2">
          Tools
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard
            href="/admin/settings"
            icon={Settings2}
            title="Site Settings"
            description="Enable or disable wiki pages, sidebar groups & links, home page categories, and site-wide features (search, edit button, breadcrumbs, infoboxes, etc.)."
            cta="Open settings"
            badge={
              disabledPages + disabledSidebar + disabledCategories > 0
                ? `${disabledPages + disabledSidebar + disabledCategories} overrides`
                : undefined
            }
          />
          <ToolCard
            href="/admin/users"
            icon={Users}
            title="Users"
            description="Browse all signed-in users, grant or revoke admin roles."
            cta="Manage users"
            badge={`${counts.users} total`}
          />
          <ToolCard
            href="/admin/images"
            icon={Images}
            title="Image Manager"
            description="Browse, upload and delete images that have been added to the wiki."
            cta="Open library"
          />
          <ToolCard
            href="/wiki/all-pages"
            icon={BookOpen}
            title="All Pages"
            description="Browse every wiki page. Use this with Site Settings to disable specific pages."
            cta="Open all pages"
          />
          <ToolCard
            href="/wiki/map?action=mapedit"
            icon={LayoutIcon}
            title="Map Editor"
            description="Edit categories, marker positions, and add new markers to the Los Santos interactive map."
            cta="Open map editor"
          />
          <ToolCard
            href="/wiki/recent-changes"
            icon={Activity}
            title="Recent Changes"
            description="See what's been edited recently across the wiki."
            cta="View activity"
          />
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="panel p-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-md bg-pulse-900/25 border border-pulse-700/50 flex items-center justify-center">
        <Icon className="w-4 h-4 text-pulse-400" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-semibold">
          {label}
        </div>
        <div className="text-xl font-display font-extrabold text-white leading-tight">
          {value}
        </div>
      </div>
    </div>
  );
}

function Pill({
  label,
  n,
  href,
}: {
  label: string;
  n: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between px-3 py-2 rounded-md border text-xs transition ${
        n > 0
          ? "border-pulse-700/60 bg-pulse-900/15 text-white"
          : "border-line bg-panel2 text-zinc-400 hover:text-white"
      }`}
    >
      <span>{label}</span>
      <span
        className={`font-mono font-bold ${
          n > 0 ? "text-pulse-300" : "text-zinc-500"
        }`}
      >
        {n}
      </span>
    </Link>
  );
}

function ToolCard({
  href,
  icon: Icon,
  title,
  description,
  cta,
  badge,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  cta: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group panel p-4 flex flex-col gap-2 hover:border-pulse-700/60 hover:bg-panel2/60 transition relative"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-md bg-pulse-900/25 border border-pulse-700/50 flex items-center justify-center">
          <Icon className="w-4 h-4 text-pulse-400" />
        </div>
        <h3 className="font-display font-bold text-white text-sm">{title}</h3>
        {badge && (
          <span className="ml-auto text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-pulse-900/40 border border-pulse-700/50 text-pulse-300">
            {badge}
          </span>
        )}
      </div>
      <p className="text-xs text-zinc-400 leading-relaxed flex-1">
        {description}
      </p>
      <div className="text-[11px] text-pulse-400 group-hover:text-pulse-300 font-semibold mt-1">
        {cta} →
      </div>
    </Link>
  );
}
