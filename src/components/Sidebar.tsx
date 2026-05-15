"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { sidebarGroups, type SidebarGroup as SidebarGroupData, type SidebarLink } from "@/data/sidebar";
import { usePathname } from "next/navigation";

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [groups, setGroups] = useState<SidebarGroupData[]>(sidebarGroups);

  useEffect(() => {
    fetch("/api/departments", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { departments?: SidebarLink[] }) => {
        const departments = data.departments || [];
        if (!departments.length) return;
        setGroups((prev) =>
          prev.map((group) => {
            if (group.title !== "Departments") return group;
            const links = [...group.links];
            for (const department of departments) {
              if (!links.some((link) => link.href === department.href)) {
                links.push(department);
              }
            }
            return { ...group, links };
          })
        );
      })
      .catch(() => undefined);
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onClose}
        className={`lg:hidden fixed inset-0 z-30 bg-black/60 transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />
      <aside
        className={`fixed lg:sticky top-14 lg:top-14 z-30 lg:z-0 left-0 h-[calc(100vh-3.5rem)] w-72 lg:w-64 xl:w-72 bg-panel lg:bg-transparent border-r border-line transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full overflow-y-auto scrollbar-thin px-3 py-4 space-y-4">
          {groups.map((g) => (
            <SidebarGroup key={g.title} title={g.title} defaultOpen={g.defaultOpen ?? false}>
              {g.links.map((l) => (
                <SidebarLinkItem key={l.href + l.label} href={l.href} label={l.label} onNavigate={onClose} />
              ))}
            </SidebarGroup>
          ))}
        </div>
      </aside>
    </>
  );
}

function SidebarGroup({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-line rounded-md bg-panel/60 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-300 hover:text-white border-l-2 border-pulse-600"
      >
        {title}
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && <ul className="py-1">{children}</ul>}
    </div>
  );
}

function SidebarLinkItem({ href, label, onNavigate }: { href: string; label: string; onNavigate: () => void }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
  return (
    <li>
      <Link
        href={href}
        onClick={onNavigate}
        className={`block px-3 py-1.5 text-[13px] border-l-2 transition ${
          active
            ? "border-pulse-500 bg-pulse-900/15 text-white"
            : "border-transparent text-zinc-400 hover:text-white hover:bg-panel2 hover:border-pulse-700/60"
        }`}
      >
        {label}
      </Link>
    </li>
  );
}
