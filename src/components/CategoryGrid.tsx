import Link from "next/link";
import { categories } from "@/data/categories";

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {categories.map((c) => {
        const Icon = c.icon;
        return (
          <Link
            key={c.slug}
            href={c.href}
            className="group relative panel p-4 overflow-hidden hover:border-pulse-700/60 hover:bg-panel2 transition"
          >
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-pulse-600 to-transparent opacity-60 group-hover:opacity-100" />
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-pulse-600/10 blur-2xl opacity-0 group-hover:opacity-100 transition" />
            <div className="flex items-start gap-3 relative">
              <div className="shrink-0 w-10 h-10 rounded-md bg-panel2 border border-line group-hover:border-pulse-700/60 flex items-center justify-center text-pulse-500 group-hover:text-pulse-400 transition">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-display font-semibold text-white text-sm md:text-base group-hover:text-white">
                  {c.title}
                </div>
                <p className="text-[12.5px] text-zinc-400 mt-0.5 line-clamp-2">
                  {c.description}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
