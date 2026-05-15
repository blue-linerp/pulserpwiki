"use client";

import React from "react";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import type { Infobox, InfoboxField } from "@/data/types";
import { slugify } from "@/lib/slug";
import { isDepartmentStyleInfobox } from "@/data/infoboxTemplates";
import DepartmentInfoboxBody, {
  type DepartmentInfoboxGroup,
  type DepartmentInfoboxItem,
} from "./DepartmentInfoboxBody";
import InfoboxGallerySlideshow, { type InfoboxGalleryItem } from "./InfoboxGallerySlideshow";

const WIKI_LINK_RE = /\[\[([^\]\n]+?)\]\]/g;
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

const HORIZONTAL_HEADINGS = new Set([
  "Law Enforcement Detail",
  "Department of Accountability Detail",
  "Department of Corrections Detail",
  "Emergency Medical Services Detail",
  "Los Santos Medical Group Detail",
  "Los Santos Police Dispatch Detail",
  "Department of Justice Detail",
]);

function parseWikiImageOpts(filename: string, optsStr: string): { src: string; width?: number; height?: number; align: string } {
  const opts = optsStr ? optsStr.split("|").map((o) => o.trim().toLowerCase()) : [];
  let width: number | undefined, height: number | undefined, align = "center";
  for (const o of opts) {
    if (o === "left" || o === "right" || o === "center") { align = o; continue; }
    const sz = o.match(/^(\d+)x(\d+)px$/);
    if (sz) { width = parseInt(sz[1]); height = parseInt(sz[2]); continue; }
    const sz2 = o.match(/^(\d+)px$/);
    if (sz2) { width = parseInt(sz2[1]); continue; }
  }
  const src = resolveImageSrc(filename);
  return { src, width, height, align };
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

/**
 * Client-side `[[Page Title]]` parser. The live page will additionally
 * auto-link bare title substrings; the preview only resolves explicit
 * wikilinks since the DB title index isn't available client-side.
 */
function renderWikiText(text: string, keyPrefix: string): React.ReactNode {
  if (!text) return text;
  const out: React.ReactNode[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  let counter = 0;
  WIKI_LINK_RE.lastIndex = 0;

  while ((m = WIKI_LINK_RE.exec(text)) !== null) {
    if (m.index > lastIndex) out.push(text.slice(lastIndex, m.index));
    const parts = m[1].split("|").map((part) => part.trim());
    const target = parts[0];
    const display = parts.length > 1 ? parts.slice(1).join("|") : target;
    if (/^file:/i.test(target)) {
      const filename = target.replace(/^file:/i, "").trim();
      const imgInfo = parseWikiImageOpts(filename, display);
      const justifyClass = imgInfo.align === "center" ? "justify-center" : imgInfo.align === "right" ? "justify-end" : "justify-start";
      out.push(
        <span key={`${keyPrefix}-img-${counter++}`} className={`inline-flex ${justifyClass} items-center shrink-0`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgInfo.src}
            alt={filename}
            style={{ width: imgInfo.width, height: imgInfo.height }}
            className="object-contain"
          />
        </span>
      );
      const caption = parts
        .slice(1)
        .filter((part) => !/^(\d+x\d+px|\d+px|left|right|center)$/i.test(part))
        .join(" ")
        .trim();
      if (caption) out.push(<span key={`${keyPrefix}-cap-${counter++}`}>{caption}</span>);
    } else {
      out.push(
        <Link
          key={`${keyPrefix}-${counter++}`}
          href={`/wiki/${slugify(target)}`}
          className="text-pulse-400 hover:text-pulse-300 underline decoration-pulse-700/50 hover:decoration-pulse-500 underline-offset-2"
        >
          {display}
        </Link>
      );
    }
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) out.push(text.slice(lastIndex));
  return out.length > 1 ? (
    <span className="inline-flex items-center justify-start gap-1.5 w-full align-middle">
      {out}
    </span>
  ) : (
    out
  );
}

/**
 * Client-side preview of the WikiInfobox.
 * Matches the live rendering closely but only handles explicit `[[...]]`
 * wikilinks (server adds title-substring auto-linking on save).
 */
function renderValue(value: string): React.ReactNode {
  if (!value) return null;
  const { items, rest } = parseGallery(value);
  const lines = rest.split("\n");
  const out: React.ReactNode[] = items.length ? [<InfoboxGallerySlideshow key="gallery" items={items} />] : [];
  let listBuf: string[] | null = null;

  const flush = () => {
    if (listBuf) {
      const buf = listBuf;
      out.push(
        <ul key={out.length} className="list-disc pl-5 space-y-0.5">
          {buf.map((it, i) => (
            <li key={i}>{renderWikiText(it, `li-${out.length}-${i}`)}</li>
          ))}
        </ul>
      );
      listBuf = null;
    }
  };

  for (const line of lines) {
    if (line.startsWith("- ")) (listBuf ??= []).push(line.slice(2));
    else if (line.trim() === "") flush();
    else {
      flush();
      out.push(
        <div key={out.length}>{renderWikiText(line, `t-${out.length}`)}</div>
      );
    }
  }
  flush();
  return out;
}

export default function WikiInfoboxPreview({ box }: { box: Infobox }) {
  const fields: InfoboxField[] = box.fields || [];
  const isDepartment = isDepartmentStyleInfobox(box);
  const imageGallery = parseGallery(box.imageUrl || box.imageLabel || "");
  const hasImageGallery = imageGallery.items.length > 0;

  return (
    <aside className={isDepartment ? "department-infobox panel overflow-hidden" : "panel overflow-hidden"}>
      <div className={isDepartment ? "department-infobox-title" : "bg-gradient-to-r from-pulse-700 to-crimson px-4 py-3 border-b border-pulse-900/60"}>
        <h3 className="font-display font-bold text-white text-base uppercase tracking-wide text-center">
          {box.title || "Untitled"}
        </h3>
      </div>
      {hasImageGallery ? (
        <InfoboxGallerySlideshow items={imageGallery.items} />
      ) : box.imageUrl ? (
        <div className={isDepartment ? "department-infobox-image" : "aspect-square bg-panel2 border-b border-line overflow-hidden"}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={box.imageUrl}
            alt={box.imageLabel || box.title}
            className="w-full h-full object-cover"
          />
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
      {isDepartment && box.imageLabel && (
        <div className="department-infobox-caption">{box.imageLabel}</div>
      )}
      {isDepartment ? (
        (() => {
          const top: DepartmentInfoboxItem[] = [];
          const groups: DepartmentInfoboxGroup[] = [];
          let current: DepartmentInfoboxGroup | null = null;
          for (const f of fields) {
            if (f.kind === "heading") {
              current = { heading: f.value || f.label, items: [] };
              groups.push(current);
            } else {
              const node =
                renderValue(f.value) || <span className="text-zinc-600">—</span>;
              const item = { label: f.label, value: node };
              if (current) current.items.push(item);
              else top.push(item);
            }
          }
          return <DepartmentInfoboxBody topFields={top} groups={groups} />;
        })()
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
                            {renderValue(f.value) || <span className="text-zinc-600">—</span>}
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
                          {renderValue(col.value) || <span className="text-zinc-600">—</span>}
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
