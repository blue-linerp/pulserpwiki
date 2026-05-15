"use client";

import React, { useMemo, useState } from "react";
import ClickableImage from "./ClickableImage";

export interface InfoboxGalleryItem {
  src: string;
  caption: string;
}

export default function InfoboxGallerySlideshow({ items }: { items: InfoboxGalleryItem[] }) {
  const validItems = useMemo(() => items.filter((item) => item.src), [items]);
  const [active, setActive] = useState(0);
  const current = validItems[active] || validItems[0];

  if (!current) return null;

  return (
    <div className="border-b border-line bg-panel2/70">
      <div className="flex items-center overflow-x-auto border-b border-line bg-black/25">
        {validItems.map((item, index) => (
          <button
            key={`${item.src}-${index}`}
            type="button"
            onClick={() => setActive(index)}
            className={`shrink-0 px-3 py-2 text-xs font-bold transition-colors border-b-2 ${
              active === index
                ? "text-red-400 border-red-500 bg-red-500/10"
                : "text-zinc-400 border-transparent hover:text-zinc-100"
            }`}
          >
            {item.caption || `Image ${index + 1}`}
          </button>
        ))}
      </div>
      <div className="relative aspect-square max-h-[500px] bg-black/40 overflow-hidden flex items-center justify-center">
        <ClickableImage
          src={current.src}
          className="w-full h-full object-cover"
          containerClassName="block w-full h-full"
        />
      </div>
    </div>
  );
}
