import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface Crumb { label: string; href?: string }

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center flex-wrap gap-1 text-xs text-zinc-400">
      <Link href="/" className="inline-flex items-center gap-1 hover:text-white">
        <Home className="w-3.5 h-3.5" /> Wiki
      </Link>
      {items.map((c, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          <ChevronRight className="w-3 h-3 text-zinc-600" />
          {c.href ? (
            <Link href={c.href} className="hover:text-white">{c.label}</Link>
          ) : (
            <span className="text-zinc-300">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
