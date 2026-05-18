"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogIn, LogOut, ShieldCheck, Plus, ChevronDown, Images, Users, LayoutDashboard, Settings2 } from "lucide-react";
import NewPageModal from "./NewPageModal";

export interface MeResponse {
  user: null | {
    steamId: string;
    persona: string | null;
    avatar: string | null;
    profileUrl: string | null;
    role: "admin" | "user";
  };
}

export default function UserMenu() {
  const [me, setMe] = useState<MeResponse["user"]>(null);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [newPageModal, setNewPageModal] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: MeResponse) => setMe(d.user))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload();
  }

  if (!loaded) {
    return <div className="w-24 h-8 bg-panel2 border border-line rounded-md animate-pulse" />;
  }

  if (!me) {
    return (
      <a
        href="/api/auth/steam"
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-pulse-600 hover:bg-pulse-500 border border-pulse-500/60 text-white text-xs font-semibold shadow-glow transition"
        title="Sign in with Steam"
      >
        <LogIn className="w-4 h-4" /> Sign in with Steam
      </a>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-panel2 border border-line hover:border-pulse-700/60 transition"
      >
        {me.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={me.avatar} alt="" className="w-6 h-6 rounded" />
        ) : (
          <div className="w-6 h-6 rounded bg-panel" />
        )}
        <span className="text-xs text-zinc-200 max-w-[100px] truncate">
          {me.persona || me.steamId}
        </span>
        {me.role === "admin" && (
          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-pulse-900/40 border border-pulse-700/50 text-pulse-400">
            Admin
          </span>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 panel overflow-hidden z-50">
          <div className="px-3 py-2 border-b border-line">
            <div className="text-xs text-zinc-500">Signed in as</div>
            <div className="text-sm text-white truncate">{me.persona || me.steamId}</div>
          </div>
          {me.role === "admin" && (
            <>
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-zinc-200 hover:bg-panel2"
              >
                <LayoutDashboard className="w-4 h-4 text-pulse-500" /> Admin Dashboard
              </Link>
              <Link
                href="/admin/settings"
                onClick={() => setOpen(false)}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-zinc-200 hover:bg-panel2"
              >
                <Settings2 className="w-4 h-4 text-pulse-500" /> Site Settings
              </Link>
              <button
                onClick={() => { setOpen(false); setNewPageModal(true); }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-zinc-200 hover:bg-panel2"
              >
                <Plus className="w-4 h-4 text-pulse-500" /> Create New Page
              </button>
              <Link
                href="/admin/images"
                onClick={() => setOpen(false)}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-zinc-200 hover:bg-panel2"
              >
                <Images className="w-4 h-4 text-pulse-500" /> Image Manager
              </Link>
              <Link
                href="/admin/users"
                onClick={() => setOpen(false)}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-zinc-200 hover:bg-panel2"
              >
                <Users className="w-4 h-4 text-pulse-500" /> Admin Users
              </Link>
              <div className="px-3 py-2 text-[11px] text-zinc-500 border-t border-line flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-pulse-500" />
                You have admin privileges
              </div>
            </>
          )}
          <button
            onClick={logout}
            className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-zinc-200 hover:bg-panel2 border-t border-line"
          >
            <LogOut className="w-4 h-4 text-pulse-500" /> Log out
          </button>
        </div>
      )}
      {newPageModal && <NewPageModal onClose={() => setNewPageModal(false)} />}
    </div>
  );
}
