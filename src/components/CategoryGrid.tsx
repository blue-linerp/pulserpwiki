import Link from "next/link";
import { categories } from "@/data/categories";

export default function CategoryGrid() {
  return (
    <div className="relative border border-pulse-800/60 bg-panel/60 p-6 md:p-8">
      {/* Corner accents */}
      <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-pulse-500" />
      <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-pulse-500" />
      <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-pulse-500" />
      <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-pulse-500" />

      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="font-display font-black text-pulse-500 text-sm uppercase tracking-[0.3em]">
          Contents
        </h2>
        <div className="mt-1.5 mx-auto w-full max-w-xs h-px bg-gradient-to-r from-transparent via-pulse-600 to-transparent" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {categories.map((c) => {
          return (
            <Link
              key={c.slug}
              href={c.href}
              className="group flex flex-col items-center gap-3 p-4 hover:bg-panel2/40 transition"
            >
              {/* Image — no wrapper box, just the image itself */}
              {c.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.imageUrl}
                  alt={c.title}
                  className="w-28 h-28 object-contain group-hover:scale-105 transition-transform"
                />
              ) : c.icon ? (
                <c.icon className="w-28 h-28 text-pulse-600 group-hover:text-pulse-400 transition" strokeWidth={1.25} />
              ) : null}

            </Link>
          );
        })}
      </div>
    </div>
  );
}
