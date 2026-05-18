"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, History, MessagesSquare } from "lucide-react";
import type { MeResponse } from "./UserMenu";
import HistoryModal from "./HistoryModal";

export default function WikiActions({
  slug,
  pageTitle,
}: {
  slug: string;
  pageTitle?: string;
}) {
  const [me, setMe] = useState<MeResponse["user"]>(null);
  const [loaded, setLoaded] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: MeResponse) => setMe(d.user))
      .finally(() => setLoaded(true));
  }, []);

  const isAdmin = loaded && me?.role === "admin";

  const editClasses =
    "inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border transition " +
    (isAdmin
      ? "border-pulse-700/60 bg-pulse-900/20 hover:bg-pulse-900/40 text-pulse-300 hover:text-white shadow-glow"
      : "border-line bg-panel2 hover:bg-panel hover:border-pulse-700/60 text-zinc-300 hover:text-white");

  const historyClasses =
    "inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border transition " +
    (isAdmin
      ? "border-line bg-panel2 hover:border-pulse-700/60 hover:bg-pulse-900/20 text-zinc-300 hover:text-white"
      : "border-line/60 bg-panel2/40 text-zinc-500 cursor-not-allowed");

  return (
    <div className="flex items-center gap-1.5">
      {isAdmin ? (
        <Link href={`/wiki/${slug}/edit`} className={editClasses}>
          <Pencil className="w-3.5 h-3.5" /> Edit
        </Link>
      ) : (
        <button
          className={editClasses}
          title="Sign in as admin to edit"
          onClick={(e) => e.preventDefault()}
        >
          <Pencil className="w-3.5 h-3.5" /> Edit
        </button>
      )}
      <button
        className={historyClasses}
        onClick={() => isAdmin && setHistoryOpen(true)}
        disabled={!isAdmin}
        title={isAdmin ? "View edit history" : "Admin only"}
      >
        <History className="w-3.5 h-3.5" /> History
      </button>
      <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border border-line bg-panel2 hover:bg-panel hover:border-pulse-700/60 text-zinc-300 hover:text-white transition">
        <MessagesSquare className="w-3.5 h-3.5" /> Talk
      </button>
      {historyOpen && (
        <HistoryModal
          slug={slug}
          pageTitle={pageTitle}
          onClose={() => setHistoryOpen(false)}
        />
      )}
    </div>
  );
}
