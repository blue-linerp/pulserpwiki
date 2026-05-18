"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings2,
  Users,
  Images,
  ShieldCheck,
} from "lucide-react";

const TABS: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { href: "/admin",          label: "Dashboard",     icon: LayoutDashboard },
  { href: "/admin/settings", label: "Site Settings", icon: Settings2 },
  { href: "/admin/users",    label: "Users",         icon: Users },
  { href: "/admin/images",   label: "Images",        icon: Images },
];

export default function AdminNav() {
  const pathname = usePathname() ?? "";
  return (
    <div className="panel overflow-hidden mb-4">
      <div className="px-4 py-3 border-b border-line flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-pulse-500" />
        <span className="font-display font-bold text-white text-sm uppercase tracking-wider">
          Admin
        </span>
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
          Restricted area
        </span>
      </div>
      <nav className="flex flex-wrap gap-0.5 px-2 py-1.5 bg-panel2/40">
        {TABS.map((t) => {
          const active =
            t.href === "/admin"
              ? pathname === "/admin"
              : pathname === t.href || pathname.startsWith(t.href + "/");
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition border ${
                active
                  ? "bg-pulse-900/25 border-pulse-700/60 text-white shadow-glow"
                  : "border-transparent text-zinc-300 hover:text-white hover:bg-panel2"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
