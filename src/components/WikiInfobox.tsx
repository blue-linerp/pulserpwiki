import { ImageIcon } from "lucide-react";
import React from "react";
import type { Infobox, InfoboxField } from "@/data/types";
import { autoLink, buildTitleIndex } from "@/lib/autolink";
import { isDepartmentInfobox, isBusinessInfobox } from "@/data/infoboxTemplates";
import DepartmentInfoboxBody, {
  type DepartmentInfoboxGroup,
  type DepartmentInfoboxItem,
} from "./DepartmentInfoboxBody";
import BusinessInfoboxBody, {
  type BusinessInfoboxGroup,
  type BusinessInfoboxItem,
} from "./BusinessInfoboxBody";
import ClickableImage from "./ClickableImage";
import InfoboxGallerySlideshow, { type InfoboxGalleryItem } from "./InfoboxGallerySlideshow";

const HORIZONTAL_HEADINGS = new Set([
  "Law Enforcement Detail",
  "Department of Accountability Detail",
  "Department of Corrections Detail",
  "Emergency Medical Services Detail",
  "Los Santos Medical Group Detail",
  "Los Santos Police Dispatch Detail",
  "Department of Justice Detail",
]);

const WIKI_FILE_RE = /\[\[File:([^\]\n]+?)\]\]/gi;
const GALLERY_RE = /<gallery\b[^>]*type=["']slideshow["'][^>]*>([\s\S]*?)<\/gallery>/i;

function resolveImageSrc(filename: string): string {
  return /^https?:\/\//i.test(filename)
    ? filename
    : filename.startsWith("/")
    ? filename
    : filename.startsWith("uploads/")
    ? `/${filename}`
    : `/uploads/${filename}`;
}

function parseGallery(value: string): { items: InfoboxGalleryItem[]; rest: string } {
  const match = value.match(GALLERY_RE);
  if (!match) return { items: [], rest: value };
  const items = match[1]
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("<") && !line.startsWith("}"))
    .map((line) => {
      const [filenamePart, ...captionParts] = line.split("|");
      const filename = filenamePart.replace(/^File:/i, "").trim();
      return {
        src: resolveImageSrc(filename),
        caption: captionParts.join("|").trim() || filename,
      };
    })
    .filter((item) => item.src);
  return { items, rest: value.replace(match[0], "").trim() };
}

function parseWikiImage(text: string): { src: string; width?: number; height?: number; align: string; caption?: string } | null {
  const m = text.trim().match(/^\[\[File:([^\]]+?)\]\]$/i);
  if (!m) return null;
  const parts = m[1].split("|").map((part) => part.trim());
  const filename = parts[0];
  const opts = parts.slice(1).map((o) => o.toLowerCase());
  let width: number | undefined, height: number | undefined, align = "center";
  for (const o of opts) {
    if (o === "left" || o === "right" || o === "center") { align = o; continue; }
    const sz = o.match(/^(\d+)x(\d+)px$/);
    if (sz) { width = parseInt(sz[1]); height = parseInt(sz[2]); continue; }
    const sz2 = o.match(/^(\d+)px$/);
    if (sz2) { width = parseInt(sz2[1]); continue; }
  }
  const caption = parts
    .slice(1)
    .filter((part) => !/^(\d+x\d+px|\d+px|left|right|center)$/i.test(part))
    .join(" ")
    .trim();
  const src = resolveImageSrc(filename);
  return { src, width, height, align, caption: caption || undefined };
}

type InfoboxChunk =
  | { type: "rows"; fields: InfoboxField[] }
  | { type: "horizontal"; heading: string; cols: InfoboxField[] };

function buildChunks(fields: InfoboxField[]): InfoboxChunk[] {
  const chunks: InfoboxChunk[] = [];
  let rowBuf: InfoboxField[] = [];
  for (let i = 0; i < fields.length; i++) {
    const f = fields[i];
    if (f.kind === "heading" && HORIZONTAL_HEADINGS.has(f.value || f.label)) {
      if (rowBuf.length > 0) { chunks.push({ type: "rows", fields: [...rowBuf] }); rowBuf = []; }
      const cols: InfoboxField[] = [];
      while (i + 1 < fields.length && fields[i + 1].kind !== "heading") cols.push(fields[++i]);
      chunks.push({ type: "horizontal", heading: f.value || f.label, cols });
    } else {
      rowBuf.push(f);
    }
  }
  if (rowBuf.length > 0) chunks.push({ type: "rows", fields: rowBuf });
  return chunks;
}

function renderValue(
  value: string,
  index: Map<string, string>,
  currentSlug?: string
): React.ReactNode {
  if (!value) return null;
  const { items, rest } = parseGallery(value);
  const lines = rest.split("\n");
  const out: React.ReactNode[] = items.length ? [<InfoboxGallerySlideshow key="gallery" items={items} />] : [];
  let listBuf: string[] | null = null;

  const flush = () => {
    if (listBuf) {
      out.push(
        <ul key={out.length} className="list-disc pl-5 space-y-0.5">
          {listBuf.map((it, i) => (
            <li key={i}>{autoLink(it, index, currentSlug)}</li>
          ))}
        </ul>
      );
      listBuf = null;
    }
  };

  const renderInlineFiles = (line: string, keyPrefix: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let counter = 0;
    WIKI_FILE_RE.lastIndex = 0;
    while ((match = WIKI_FILE_RE.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(autoLink(line.slice(lastIndex, match.index), index, currentSlug));
      }
      const img = parseWikiImage(match[0]);
      if (img) {
        const justifyClass = img.align === "center" ? "justify-center" : img.align === "right" ? "justify-end" : "justify-start";
        parts.push(
          <span key={`${keyPrefix}-img-${counter++}`} className={`inline-flex ${justifyClass} items-center shrink-0`}>
            <ClickableImage
              src={img.src}
              style={{ width: img.width, height: img.height }}
              className="object-contain"
            />
          </span>
        );
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < line.length) {
      parts.push(autoLink(line.slice(lastIndex), index, currentSlug));
    }
    return parts.length > 1 ? (
      <span className="inline-flex items-center justify-start gap-1.5 w-full align-middle">
        {parts}
      </span>
    ) : (
      parts
    );
  };

  for (const line of lines) {
    if (line.startsWith("- ")) {
      (listBuf ??= []).push(line.slice(2));
    } else if (line.trim() === "") {
      flush();
    } else {
      flush();
      const img = parseWikiImage(line);
      if (img) {
        const justifyClass = img.align === "center" ? "justify-center" : img.align === "right" ? "justify-end" : "justify-start";
        out.push(
          <div key={out.length} className={`flex ${justifyClass}`}>
            <ClickableImage
              src={img.src}
              style={{ width: img.width, height: img.height }}
              className="object-contain"
            />
          </div>
        );
        if (img.caption) out.push(<div key={out.length}>{autoLink(img.caption, index, currentSlug)}</div>);
      } else {
        out.push(<div key={out.length}>{renderInlineFiles(line, `inline-${out.length}`)}</div>);
      }
    }
  }
  flush();
  return out;
}

export default function WikiInfobox({
  box,
  currentSlug,
}: {
  box: Infobox;
  currentSlug?: string;
}) {
  const index = buildTitleIndex();
  const fields: InfoboxField[] = box.fields || [];
  const isDepartment = isDepartmentInfobox(box);
  const isBusiness = isBusinessInfobox(box);
  const isSpecial = isDepartment || isBusiness;
  const imageGallery = parseGallery(box.imageUrl || box.imageLabel || "");
  const hasImageGallery = imageGallery.items.length > 0;

  const boxClass = isDepartment
    ? "department-infobox panel overflow-hidden"
    : isBusiness
    ? "business-infobox panel overflow-hidden"
    : "panel overflow-hidden";

  const titleClass = isDepartment
    ? "department-infobox-title"
    : isBusiness
    ? "business-infobox-title"
    : "bg-gradient-to-r from-pulse-700 to-crimson px-4 py-3 border-b border-pulse-900/60";

  const imageClass = isDepartment
    ? "department-infobox-image"
    : isBusiness
    ? "business-infobox-image"
    : "aspect-square bg-panel2 border-b border-line overflow-hidden";

  const captionClass = isDepartment
    ? "department-infobox-caption"
    : "business-infobox-caption";

  function buildGroupedBody<I extends { label: string; value: React.ReactNode }, G extends { heading: string; items: I[] }>(
    makeItem: (label: string, value: React.ReactNode) => I,
    makeGroup: (heading: string) => G,
    Body: React.ComponentType<{ topFields: I[]; groups: G[] }>
  ) {
    const top: I[] = [];
    const groups: G[] = [];
    let current: G | null = null;
    for (const f of fields) {
      if (f.kind === "heading") {
        current = makeGroup(f.value || f.label);
        groups.push(current);
      } else {
        const node = renderValue(f.value, index, currentSlug) || <span className="text-zinc-600">—</span>;
        const item = makeItem(f.label, node);
        if (current) current.items.push(item);
        else top.push(item);
      }
    }
    return <Body topFields={top} groups={groups} />;
  }

  return (
    <aside className={boxClass}>
      <div className={titleClass}>
        <h3 className="font-display font-bold text-white text-base uppercase tracking-wide text-center">
          {box.title}
        </h3>
      </div>
      {hasImageGallery ? (
        <InfoboxGallerySlideshow items={imageGallery.items} />
      ) : box.imageUrl ? (
        <div className={imageClass}>
          <ClickableImage src={box.imageUrl} className="w-full h-full object-cover" />
        </div>
      ) : box.imageLabel ? (
        <div className="aspect-square bg-panel2 border-b border-line flex flex-col items-center justify-center text-zinc-500 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(220,38,38,0.15) 0%, rgba(0,0,0,0) 50%), repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0 8px, transparent 8px 16px)",
            }}
          />
          <ImageIcon className="w-7 h-7 mb-1 relative" />
          <span className="text-xs relative">{box.imageLabel}</span>
        </div>
      ) : null}
      {isSpecial && box.imageLabel && (
        <div className={captionClass}>{box.imageLabel}</div>
      )}
      {isDepartment ? (
        buildGroupedBody<DepartmentInfoboxItem, DepartmentInfoboxGroup>(
          (label, value) => ({ label, value }),
          (heading) => ({ heading, items: [] }),
          DepartmentInfoboxBody
        )
      ) : isBusiness ? (
        buildGroupedBody<BusinessInfoboxItem, BusinessInfoboxGroup>(
          (label, value) => ({ label, value }),
          (heading) => ({ heading, items: [] }),
          BusinessInfoboxBody
        )
      ) : (
        <div>
          {buildChunks(fields).map((chunk, ci) => {
            if (chunk.type === "rows") {
              return (
                <table key={ci} className="w-full text-[13px] table-fixed">
                  <tbody>
                    {chunk.fields.map((f, fi) => {
                      if (f.kind === "heading") {
                        return (
                          <tr key={`h-${fi}`}>
                            <td colSpan={2} className="bg-panel2/80 border-y border-pulse-700/40 px-3 py-2 text-center">
                              <span className="font-display font-semibold text-pulse-300 text-[12px] uppercase tracking-[0.12em]">
                                {f.value || f.label}
                              </span>
                            </td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={`f-${fi}`} className="bg-panel">
                          <td className="px-3 py-2 font-semibold text-zinc-200 align-top w-[42%] border-b border-line/60">{f.label}</td>
                          <td className="px-3 py-2 text-zinc-300 border-b border-line/60 border-l border-pulse-700/30 align-top">
                            {renderValue(f.value, index, currentSlug) || <span className="text-zinc-600">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              );
            }
            return (
              <div key={ci}>
                <div className="bg-panel2/80 border-y border-pulse-700/40 px-3 py-2 text-center">
                  <span className="font-display font-semibold text-pulse-300 text-[12px] uppercase tracking-[0.12em]">
                    {chunk.heading}
                  </span>
                </div>
                <table className="w-full text-[13px]">
                  <thead>
                    <tr>
                      {chunk.cols.map((col) => (
                        <th key={col.source || col.label} className="px-2 py-1.5 text-center font-semibold text-zinc-200 text-[12px] border-b border-line/60 border-r border-line/40 last:border-r-0">
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-panel">
                      {chunk.cols.map((col) => (
                        <td key={col.source || col.label} className="px-2 py-2 text-center text-zinc-300 border-r border-line/40 last:border-r-0">
                          {renderValue(col.value, index, currentSlug) || <span className="text-zinc-600">—</span>}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
