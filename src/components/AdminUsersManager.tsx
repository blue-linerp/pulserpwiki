"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCcw, Search, ShieldCheck, ShieldOff, Users as UsersIcon } from "lucide-react";

interface AdminUser {
  steamId: string;
  persona: string | null;
  avatar: string | null;
  profileUrl: string | null;
  role: "admin" | "user";
  createdAt: number;
}

function formatDate(ms: number): string {
  if (!ms) return "—";
  const d = new Date(ms);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

export default function AdminUsersManager() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentSteamId, setCurrentSteamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data = (await res.json()) as { users?: AdminUser[]; currentSteamId?: string; error?: string };
      if (!res.ok) {
        setError(data.error || "Failed to load users.");
        return;
      }
      setUsers(data.users || []);
      setCurrentSteamId(data.currentSteamId || null);
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      (u.persona || "").toLowerCase().includes(q) ||
      u.steamId.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  }, [query, users]);

  async function setRole(user: AdminUser, role: "admin" | "user") {
    if (user.role === role) return;
    if (user.steamId === currentSteamId && role === "user") {
      setError("You cannot remove your own admin access.");
      return;
    }

    setSavingId(user.steamId);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ steamId: user.steamId, role }),
      });
      const data = (await res.json().catch(() => ({}))) as { user?: AdminUser; error?: string };
      if (!res.ok || !data.user) {
        setError(data.error || "Failed to update role.");
        return;
      }
      setUsers((prev) => prev.map((u) => (u.steamId === data.user!.steamId ? data.user! : u)));
    } finally {
      setSavingId(null);
    }
  }

  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <div className="space-y-4">
      <header className="panel px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <UsersIcon className="w-5 h-5 text-pulse-500 shrink-0" />
          <div className="min-w-0">
            <h1 className="font-display font-semibold text-white truncate">Admin Users</h1>
            <p className="text-[11px] text-zinc-500 truncate">
              Manage who can edit pages, upload files, and access admin tools.
            </p>
          </div>
        </div>
        <button
          onClick={() => load()}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-line text-xs text-zinc-300 hover:text-white hover:border-pulse-700/60 transition"
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </header>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="panel p-3">
          <div className="text-[10px] uppercase tracking-wider text-zinc-500">Total users</div>
          <div className="text-2xl font-display font-bold text-white mt-1">{users.length}</div>
        </div>
        <div className="panel p-3">
          <div className="text-[10px] uppercase tracking-wider text-zinc-500">Admins</div>
          <div className="text-2xl font-display font-bold text-pulse-300 mt-1">{adminCount}</div>
        </div>
        <div className="panel p-3">
          <div className="text-[10px] uppercase tracking-wider text-zinc-500">Regular users</div>
          <div className="text-2xl font-display font-bold text-zinc-300 mt-1">{users.length - adminCount}</div>
        </div>
      </div>

      <div className="panel px-3 py-2 flex items-center gap-2">
        <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search persona, Steam ID, or role"
          className="flex-1 bg-transparent border-0 focus:outline-none text-sm text-zinc-100 placeholder:text-zinc-600"
        />
      </div>

      {error && (
        <div className="panel px-3 py-2 text-xs text-red-300 border border-crimson/60 bg-crimson/10">
          {error}
        </div>
      )}

      <div className="panel overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center text-zinc-500 py-12 gap-2 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading users…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-zinc-500 py-12 text-sm">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[10px] uppercase tracking-wider text-zinc-500 bg-panel2/40">
                <tr className="border-b border-line">
                  <th className="p-3">User</th>
                  <th className="p-3">Steam ID</th>
                  <th className="p-3">Joined</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const isSelf = u.steamId === currentSteamId;
                  const busy = savingId === u.steamId;
                  return (
                    <tr key={u.steamId} className="border-b border-line/60 hover:bg-panel2/30">
                      <td className="p-3 align-middle">
                        <div className="flex items-center gap-3 min-w-0">
                          {u.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={u.avatar} alt="" className="w-9 h-9 rounded border border-line object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded border border-line bg-panel2" />
                          )}
                          <div className="min-w-0">
                            <div className="text-white font-medium truncate">
                              {u.persona || "Unknown user"} {isSelf && <span className="text-[10px] text-pulse-400">(you)</span>}
                            </div>
                            {u.profileUrl && (
                              <a href={u.profileUrl} target="_blank" rel="noreferrer" className="text-[11px] text-zinc-500 hover:text-pulse-300">
                                Steam profile
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 align-middle text-xs text-zinc-400 font-mono">{u.steamId}</td>
                      <td className="p-3 align-middle text-xs text-zinc-400">{formatDate(u.createdAt)}</td>
                      <td className="p-3 align-middle">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-[11px] uppercase tracking-wider ${
                            u.role === "admin"
                              ? "border-pulse-700/50 bg-pulse-900/30 text-pulse-300"
                              : "border-line bg-panel2 text-zinc-400"
                          }`}
                        >
                          {u.role === "admin" ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 align-middle text-right">
                        {u.role === "admin" ? (
                          <button
                            onClick={() => setRole(u, "user")}
                            disabled={busy || isSelf}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-line text-xs text-zinc-300 hover:text-white hover:border-crimson/60 hover:bg-crimson/10 transition disabled:opacity-50 disabled:hover:border-line disabled:hover:bg-transparent"
                            title={isSelf ? "You cannot remove your own admin access" : "Remove admin"}
                          >
                            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldOff className="w-3.5 h-3.5" />}
                            Remove Admin
                          </button>
                        ) : (
                          <button
                            onClick={() => setRole(u, "admin")}
                            disabled={busy}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-pulse-700/60 bg-pulse-900/20 text-xs text-pulse-300 hover:text-white hover:bg-pulse-700/30 transition disabled:opacity-50"
                          >
                            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                            Make Admin
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
