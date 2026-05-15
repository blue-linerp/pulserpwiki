"use client";

import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { X, User, Building2, Shield, MapPin } from "lucide-react";

const PAGE_TYPES = [
  {
    type: "character",
    icon: <User className="w-7 h-7" />,
    label: "Character Page",
    description: "A player-driven persona — biography, background, law enforcement record, and infobox.",
    accent: "border-pulse-600/60 hover:border-pulse-500",
    iconBg: "bg-pulse-900/40 text-pulse-400",
  },
  {
    type: "business",
    icon: <Building2 className="w-7 h-7" />,
    label: "Business Page",
    description: "A storefront, service, or enterprise — owner, staff, services, and contact details.",
    accent: "border-amber-700/50 hover:border-amber-500/70",
    iconBg: "bg-amber-900/30 text-amber-400",
  },
  {
    type: "department",
    icon: <Shield className="w-7 h-7" />,
    label: "Department Page",
    description: "A law enforcement agency, emergency service, or government body — roster and command structure.",
    accent: "border-blue-700/50 hover:border-blue-500/70",
    iconBg: "bg-blue-900/30 text-blue-400",
  },
  {
    type: "neighborhood",
    icon: <MapPin className="w-7 h-7" />,
    label: "Neighborhood / Location Page",
    description: "A district, neighborhood, or point of interest — geography, gangs, businesses, and notable residents.",
    accent: "border-emerald-700/50 hover:border-emerald-500/70",
    iconBg: "bg-emerald-900/30 text-emerald-400",
  },
] as const;

export default function NewPageModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  function choose(type: string) {
    onClose();
    router.push(`/wiki/new?type=${type}`);
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="panel w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-4 border-b border-line bg-panel2/60">
          <div>
            <h2 className="font-display font-bold text-white text-base uppercase tracking-wide">
              Create New Page
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">Choose a page type to get started</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-panel2 text-zinc-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Type cards */}
        <div className="p-4 space-y-3">
          {PAGE_TYPES.map(({ type, icon, label, description, accent, iconBg }) => (
            <button
              key={type}
              onClick={() => choose(type)}
              className={`w-full text-left flex items-start gap-4 p-4 rounded-lg border bg-panel2/40 hover:bg-panel2/80 transition ${accent}`}
            >
              <div className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${iconBg}`}>
                {icon}
              </div>
              <div className="min-w-0">
                <div className="font-display font-semibold text-white text-sm">{label}</div>
                <div className="text-xs text-zinc-400 mt-1 leading-relaxed">{description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}