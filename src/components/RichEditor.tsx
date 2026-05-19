"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { WikiNoticeNode, DEFAULT_NOTICE_CONTENT } from "@/lib/wikiNotice";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { useEffect, useRef, useState } from "react";
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIconLucide,
  ChevronDown,
  Type,
  Minus,
  Quote,
  Eraser,
  Plus,
  X,
  Bell as BellIcon,
  Search as SearchIcon,
  Table as TableIcon,
} from "lucide-react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  onInsertInfobox?: () => void;
  uploadImage: (file: File) => Promise<string | null>;
  /** Optional sidebar (e.g. infobox preview) rendered inside the editor panel on lg+ screens. */
  sidebarSlot?: React.ReactNode;
}

export default function RichEditor({
  value,
  onChange,
  onInsertInfobox,
  uploadImage,
  sidebarSlot,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5] },
      }),
      Underline,
      WikiNoticeNode,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class:
            "text-pulse-400 hover:text-pulse-300 underline decoration-pulse-700/50 hover:decoration-pulse-500 underline-offset-2",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-md border border-line my-3 max-w-full h-auto",
        },
      }),
      TextAlign.configure({
        types: ["paragraph", "heading"],
        defaultAlignment: "left",
      }),
      Table.configure({ resizable: false, HTMLAttributes: { class: "wiki-table" } }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "tiptap focus:outline-none min-h-[400px] px-5 py-5 prose prose-invert max-w-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    immediatelyRender: false,
  });

  // Expose uploadImage to WikiNoticeNode via editor storage.
  useEffect(() => {
    if (!editor) return;
    (editor.storage as { wikiNotice?: { uploadImage: typeof uploadImage } }).wikiNotice = {
      uploadImage,
    };
  }, [editor, uploadImage]);

  // Keep the editor in sync if `value` changes externally (e.g. on load).
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value && value !== current) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="panel min-h-[440px] flex items-center justify-center text-zinc-500 text-sm">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="panel overflow-visible">
      <Toolbar
        editor={editor}
        uploadImage={uploadImage}
        onInsertInfobox={onInsertInfobox}
      />
      <TableToolbar editor={editor} />
      <div className="bg-bg/40 border-t border-line overflow-visible">
        {sidebarSlot ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] overflow-visible">
            <div className="min-w-0">
              <EditorContent editor={editor} />
            </div>
            <aside className="border-t lg:border-t-0 lg:border-l border-line bg-panel/40 p-3 lg:sticky lg:top-16 lg:self-start overflow-visible">
              {sidebarSlot}
            </aside>
          </div>
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>
    </div>
  );
}

/* -------------------- Toolbar -------------------- */

function Toolbar({
  editor,
  uploadImage,
  onInsertInfobox,
}: {
  editor: Editor;
  uploadImage: (file: File) => Promise<string | null>;
  onInsertInfobox?: () => void;
}) {
  const [libraryOpen, setLibraryOpen] = useState(false);
  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 flex-wrap bg-panel2/60">
      {libraryOpen && (
        <ImageLibraryModal
          onSelect={(url) => { editor.chain().focus().setImage({ src: url }).run(); }}
          onClose={() => setLibraryOpen(false)}
        />
      )}
      <TBtn
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="w-4 h-4" />
      </TBtn>
      <TBtn
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo2 className="w-4 h-4" />
      </TBtn>

      <Separator />

      <HeadingMenu editor={editor} />

      <Separator />

      <TBtn
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </TBtn>
      <TBtn
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </TBtn>
      <MoreFormattingMenu editor={editor} />

      <Separator />

      <TBtn
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet list"
      >
        <List className="w-4 h-4" />
      </TBtn>
      <TBtn
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Numbered list"
      >
        <ListOrdered className="w-4 h-4" />
      </TBtn>

      <Separator />

      <AlignMenu editor={editor} />

      <Separator />

      <LinkButton editor={editor} />

      <ImageButton editor={editor} uploadImage={uploadImage} onOpenLibrary={() => setLibraryOpen(true)} />

      <Separator />

      <InsertMenu
        editor={editor}
        uploadImage={uploadImage}
        onInsertInfobox={onInsertInfobox}
        onOpenLibrary={() => setLibraryOpen(true)}
      />
    </div>
  );
}

function Separator() {
  return <div className="w-px h-5 bg-line mx-1" />;
}

function TBtn({
  children,
  onClick,
  active,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={
        "inline-flex items-center justify-center w-8 h-8 rounded-md text-zinc-300 transition border " +
        (disabled
          ? "border-transparent opacity-40 cursor-not-allowed"
          : active
          ? "border-pulse-700/60 bg-pulse-900/30 text-white"
          : "border-transparent hover:bg-panel hover:text-white")
      }
    >
      {children}
    </button>
  );
}

/* -------------------- Heading menu -------------------- */

const HEADING_OPTIONS: {
  label: string;
  hint: string;
  level: 0 | 1 | 2 | 3 | 4 | 5;
  block?: "paragraph" | "blockquote" | "codeBlock";
  cls?: string;
}[] = [
  { label: "Normal text", hint: "Ctrl+0", level: 0, block: "paragraph" },
  { label: "Heading", hint: "Ctrl+2", level: 1, cls: "text-2xl font-bold" },
  { label: "Sub-heading 1", hint: "Ctrl+3", level: 2, cls: "text-xl font-bold" },
  { label: "Sub-heading 2", hint: "Ctrl+4", level: 3, cls: "text-lg font-semibold" },
  { label: "Sub-heading 3", hint: "Ctrl+5", level: 4, cls: "text-base font-semibold" },
  { label: "Sub-heading 4", hint: "Ctrl+6", level: 5, cls: "text-sm font-semibold" },
  { label: "Preformatted", hint: "Ctrl+7", level: 0, block: "codeBlock", cls: "font-mono" },
  { label: "Block quote", hint: "Ctrl+8", level: 0, block: "blockquote", cls: "italic" },
];

function HeadingMenu({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(() => setOpen(false));

  function setBlock(opt: (typeof HEADING_OPTIONS)[number]) {
    const chain = editor.chain().focus();
    if (opt.block === "codeBlock") chain.setCodeBlock().run();
    else if (opt.block === "blockquote") chain.setBlockquote().run();
    else if (opt.level === 0) chain.setParagraph().run();
    else chain.setHeading({ level: opt.level as 1 | 2 | 3 | 4 | 5 }).run();
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 h-8 px-2 rounded-md text-zinc-300 hover:bg-panel hover:text-white text-sm"
        title="Paragraph styles"
      >
        <Type className="w-4 h-4" />
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <Dropdown>
          {HEADING_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setBlock(opt)}
              className="w-full flex items-center justify-between gap-6 px-3 py-2 hover:bg-panel2 text-left"
            >
              <span className={"text-zinc-100 " + (opt.cls ?? "")}>
                {opt.label}
              </span>
              <span className="text-[11px] text-zinc-500">{opt.hint}</span>
            </button>
          ))}
        </Dropdown>
      )}
    </div>
  );
}

/* -------------------- More formatting menu -------------------- */

function MoreFormattingMenu({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(() => setOpen(false));

  const items = [
    {
      label: "Underline",
      hint: "Ctrl+U",
      icon: <UnderlineIcon className="w-4 h-4" />,
      active: editor.isActive("underline"),
      run: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      label: "Strikethrough",
      hint: "Ctrl+Shift+5",
      icon: <Strikethrough className="w-4 h-4" />,
      active: editor.isActive("strike"),
      run: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      label: "Computer code",
      hint: "Ctrl+Shift+6",
      icon: <Code className="w-4 h-4" />,
      active: editor.isActive("code"),
      run: () => editor.chain().focus().toggleCode().run(),
    },
    {
      label: "Clear formatting",
      hint: "Ctrl+\\",
      icon: <Eraser className="w-4 h-4" />,
      run: () => editor.chain().focus().unsetAllMarks().clearNodes().run(),
    },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center h-8 px-2 rounded-md text-zinc-300 hover:bg-panel hover:text-white text-sm font-semibold"
        title="More formatting"
      >
        T<ChevronDown className="w-3 h-3 ml-0.5" />
      </button>
      {open && (
        <Dropdown>
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              onClick={() => {
                it.run();
                setOpen(false);
              }}
              className={
                "w-full flex items-center justify-between gap-6 px-3 py-2 hover:bg-panel2 text-left " +
                (it.active ? "text-pulse-300" : "text-zinc-100")
              }
            >
              <span className="flex items-center gap-2">
                {it.icon}
                {it.label}
              </span>
              <span className="text-[11px] text-zinc-500">{it.hint}</span>
            </button>
          ))}
        </Dropdown>
      )}
    </div>
  );
}

/* -------------------- Alignment menu -------------------- */

function AlignMenu({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(() => setOpen(false));

  const current = (["left", "center", "right", "justify"] as const).find((a) =>
    editor.isActive({ textAlign: a })
  );
  const Icon =
    current === "center"
      ? AlignCenter
      : current === "right"
      ? AlignRight
      : current === "justify"
      ? AlignJustify
      : AlignLeft;

  const items: { label: string; value: "left" | "center" | "right" | "justify"; icon: React.ReactNode }[] = [
    { label: "Align left", value: "left", icon: <AlignLeft className="w-4 h-4" /> },
    { label: "Align center", value: "center", icon: <AlignCenter className="w-4 h-4" /> },
    { label: "Align right", value: "right", icon: <AlignRight className="w-4 h-4" /> },
    { label: "Justify", value: "justify", icon: <AlignJustify className="w-4 h-4" /> },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center h-8 px-2 rounded-md text-zinc-300 hover:bg-panel hover:text-white"
        title="Text alignment"
      >
        <Icon className="w-4 h-4" />
        <ChevronDown className="w-3 h-3 ml-0.5" />
      </button>
      {open && (
        <Dropdown>
          {items.map((it) => (
            <button
              key={it.value}
              type="button"
              onClick={() => {
                editor.chain().focus().setTextAlign(it.value).run();
                setOpen(false);
              }}
              className={
                "w-full flex items-center gap-2 px-3 py-2 hover:bg-panel2 text-left " +
                (current === it.value ? "text-pulse-300" : "text-zinc-100")
              }
            >
              {it.icon} {it.label}
            </button>
          ))}
        </Dropdown>
      )}
    </div>
  );
}

/* -------------------- Link -------------------- */

interface PageOption {
  slug: string;
  title: string;
  category: string;
}

function LinkButton({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [tab, setTab] = useState<"internal" | "external">("internal");
  const [query, setQuery] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [externalText, setExternalText] = useState("");
  const [pages, setPages] = useState<PageOption[]>([]);

  // Fetch internal pages once when dialog opens for the first time.
  useEffect(() => {
    if (!open || pages.length) return;
    fetch("/api/pages", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { pages: PageOption[] }) => setPages(d.pages || []))
      .catch(() => setPages([]));
  }, [open, pages.length]);

  function openDialog() {
    const sel = window.getSelection();
    const selText = sel?.toString().trim() || "";

    // Compute the position of the selection (or caret) in screen coords.
    let rect: DOMRect | null = null;
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const r = range.getBoundingClientRect();
      if (r && (r.width || r.height || r.top || r.left)) rect = r;
    }
    if (!rect) {
      // Fallback to the editor element's top.
      const dom = editor.view.dom as HTMLElement;
      rect = dom.getBoundingClientRect();
    }
    setPos({
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + window.scrollX,
    });
    setQuery(selText);
    setExternalText(selText);
    const currentHref = editor.getAttributes("link")?.href || "";
    setExternalUrl(currentHref.startsWith("http") ? currentHref : "");
    setTab(currentHref.startsWith("http") ? "external" : "internal");
    setOpen(true);
  }

  function applyInternal(opt: PageOption) {
    const display = window.getSelection()?.toString() || opt.title;
    const href = `/wiki/${opt.slug}`;
    const chain = editor.chain().focus();
    if (display) {
      chain.extendMarkRange("link").setLink({ href }).run();
    } else {
      // No selection — insert the title text and link it.
      chain
        .insertContent(opt.title)
        .setTextSelection({
          from: editor.state.selection.from - opt.title.length,
          to: editor.state.selection.from,
        })
        .setLink({ href })
        .run();
    }
    setOpen(false);
  }

  function applyExternal() {
    const href = externalUrl.trim();
    if (!href) return;
    const chain = editor.chain().focus();
    if (externalText && !window.getSelection()?.toString()) {
      chain
        .insertContent(externalText)
        .setTextSelection({
          from: editor.state.selection.from - externalText.length,
          to: editor.state.selection.from,
        })
        .setLink({ href })
        .run();
    } else {
      chain.extendMarkRange("link").setLink({ href }).run();
    }
    setOpen(false);
  }

  function removeLink() {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setOpen(false);
  }

  const filtered = (() => {
    const q = query.trim().toLowerCase();
    if (!q) return pages.slice(0, 40);
    return pages
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
      .slice(0, 40);
  })();

  return (
    <>
      <TBtn
        active={editor.isActive("link")}
        onClick={openDialog}
        title="Add link"
      >
        <LinkIcon className="w-4 h-4" />
      </TBtn>
      {open && pos && (
        <LinkDialog
          pos={pos}
          tab={tab}
          onTabChange={setTab}
          query={query}
          onQueryChange={setQuery}
          externalUrl={externalUrl}
          onExternalUrlChange={setExternalUrl}
          externalText={externalText}
          onExternalTextChange={setExternalText}
          filtered={filtered}
          onPick={applyInternal}
          onDone={tab === "external" ? applyExternal : () => setOpen(false)}
          onClose={() => setOpen(false)}
          onRemove={editor.isActive("link") ? removeLink : undefined}
        />
      )}
    </>
  );
}

function LinkDialog({
  pos,
  tab,
  onTabChange,
  query,
  onQueryChange,
  externalUrl,
  onExternalUrlChange,
  externalText,
  onExternalTextChange,
  filtered,
  onPick,
  onDone,
  onClose,
  onRemove,
}: {
  pos: { top: number; left: number };
  tab: "internal" | "external";
  onTabChange: (t: "internal" | "external") => void;
  query: string;
  onQueryChange: (q: string) => void;
  externalUrl: string;
  onExternalUrlChange: (u: string) => void;
  externalText: string;
  onExternalTextChange: (t: string) => void;
  filtered: PageOption[];
  onPick: (opt: PageOption) => void;
  onDone: () => void;
  onClose: () => void;
  onRemove?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Clamp horizontally so the dialog stays on screen.
  const width = 380;
  const left = Math.max(
    8,
    Math.min(pos.left, (typeof window !== "undefined" ? window.innerWidth : 1200) - width - 8)
  );

  return (
    <div
      ref={ref}
      style={{ position: "absolute", top: pos.top, left, width }}
      className="z-[60] panel shadow-2xl overflow-hidden"
    >
      {/* arrow pointing up to selection */}
      <div className="absolute -top-1.5 left-6 w-3 h-3 rotate-45 bg-panel border-l border-t border-line" />

      <header className="grid grid-cols-[auto_1fr_auto] items-center gap-2 px-3 py-2 border-b border-line bg-panel2/60">
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-panel"
          title="Cancel"
        >
          <X className="w-4 h-4" />
        </button>
        <h3 className="text-center text-sm font-semibold text-white">Add a link</h3>
        <button
          type="button"
          onClick={onDone}
          className="px-3 py-1 text-xs font-bold tracking-wider rounded bg-pulse-600 hover:bg-pulse-500 text-white border border-pulse-500/60 shadow-glow"
        >
          DONE
        </button>
      </header>

      <div className="grid grid-cols-2 border-b border-line">
        <TabBtn active={tab === "internal"} onClick={() => onTabChange("internal")}>
          Pulse Roleplay Wiki
        </TabBtn>
        <TabBtn active={tab === "external"} onClick={() => onTabChange("external")}>
          External site
        </TabBtn>
      </div>

      {tab === "internal" ? (
        <div>
          <div className="px-3 py-2 border-b border-line bg-panel/60 relative">
            <SearchIcon className="w-3.5 h-3.5 text-zinc-500 absolute left-5 top-1/2 -translate-y-1/2" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              className="w-full bg-panel2 border border-line rounded-md pl-7 pr-7 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-pulse-600/60"
              placeholder="Search pages…"
            />
            {query && (
              <button
                type="button"
                onClick={() => onQueryChange("")}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <ul className="max-h-[300px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-xs text-zinc-500">No pages match.</li>
            ) : (
              filtered.map((p) => (
                <li key={p.slug}>
                  <button
                    type="button"
                    onClick={() => onPick(p)}
                    className="w-full text-left px-3 py-1.5 hover:bg-panel2 text-pulse-400 hover:text-pulse-300 text-sm"
                  >
                    {p.title}
                  </button>
                </li>
              ))
            )}
          </ul>
          {onRemove && (
            <div className="border-t border-line px-3 py-2">
              <button
                type="button"
                onClick={onRemove}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Remove link
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 space-y-2">
          <label className="block text-[10px] uppercase tracking-wider text-zinc-400">
            URL
          </label>
          <input
            autoFocus
            type="text"
            value={externalUrl}
            onChange={(e) => onExternalUrlChange(e.target.value)}
            placeholder="https://example.com"
            className="w-full bg-panel2 border border-line rounded-md px-2 py-1.5 text-sm text-zinc-100"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onDone();
              }
            }}
          />
          <label className="block text-[10px] uppercase tracking-wider text-zinc-400">
            Display text (optional)
          </label>
          <input
            type="text"
            value={externalText}
            onChange={(e) => onExternalTextChange(e.target.value)}
            placeholder="Leave empty to keep selected text"
            className="w-full bg-panel2 border border-line rounded-md px-2 py-1.5 text-sm text-zinc-100"
          />
          <div className="flex items-center justify-between pt-1">
            {onRemove ? (
              <button
                type="button"
                onClick={onRemove}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Remove link
              </button>
            ) : (
              <span />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TabBtn({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "px-3 py-2 text-xs font-semibold transition relative " +
        (active
          ? "text-pulse-300"
          : "text-zinc-400 hover:text-zinc-200 hover:bg-panel2/50")
      }
    >
      {children}
      {active && (
        <span className="absolute left-3 right-3 -bottom-px h-[2px] bg-pulse-500 rounded-full" />
      )}
    </button>
  );
}

/* -------------------- Image -------------------- */

import { type LibraryFile, fetchLibrary, getLibraryCache } from "@/lib/libraryCache";

function ImageLibraryModal({
  onSelect,
  onClose,
}: {
  onSelect: (url: string) => void;
  onClose: () => void;
}) {
  const [files, setFiles] = useState<LibraryFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const cached = getLibraryCache(); if (cached) { setFiles(cached); setLoading(false); return; }
    fetchLibrary().then((f) => { setFiles(f); setLoading(false); });
  }, []);

  const filtered = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[80vh] bg-panel border border-line rounded-lg shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-4 py-3 border-b border-line flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <ImageIconLucide className="w-4 h-4 text-pulse-500" />
            <h3 className="font-display font-semibold text-white text-sm">Select from Library</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="pl-7 pr-3 py-1.5 text-xs bg-panel2 border border-line rounded-md text-zinc-200 focus:outline-none focus:border-pulse-600/60 w-40"
              />
            </div>
            <button onClick={onClose} className="p-1.5 rounded border border-line text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-zinc-500 text-sm">
              Loading…
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-zinc-500 text-sm py-12">No images found.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {filtered.map((f) => (
                <button
                  key={f.url}
                  type="button"
                  onClick={() => { onSelect(f.url); onClose(); }}
                  className="group relative aspect-square bg-panel2 border border-line rounded overflow-hidden hover:border-pulse-500/60 transition"
                  title={f.name}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-end p-1">
                    <span className="text-[9px] text-white/0 group-hover:text-white/90 truncate w-full transition leading-tight">
                      {f.name.split("/").pop()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ImageButton({
  editor,
  uploadImage,
  onOpenLibrary,
}: {
  editor: Editor;
  uploadImage: (file: File) => Promise<string | null>;
  onOpenLibrary: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const ref = useDismiss(() => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <TBtn
        onClick={() => setOpen((v) => !v)}
        title="Insert image"
        active={open}
      >
        <ImageIconLucide className="w-4 h-4" />
      </TBtn>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 panel py-1 shadow-xl overflow-hidden min-w-[180px]">
          <button
            type="button"
            onClick={() => { setOpen(false); inputRef.current?.click(); }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-panel2 text-left text-zinc-100 text-sm"
          >
            <ImageIconLucide className="w-4 h-4" /> Upload image
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); onOpenLibrary(); }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-panel2 text-left text-zinc-100 text-sm"
          >
            <SearchIcon className="w-4 h-4" /> Select from Library
          </button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const url = await uploadImage(f);
          if (url) editor.chain().focus().setImage({ src: url }).run();
          e.target.value = "";
        }}
      />
    </div>
  );
}

/* -------------------- INSERT menu -------------------- */

function InsertMenu({
  editor,
  uploadImage,
  onInsertInfobox,
  onOpenLibrary,
}: {
  editor: Editor;
  uploadImage: (file: File) => Promise<string | null>;
  onInsertInfobox?: () => void;
  onOpenLibrary: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(() => setOpen(false));
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 h-8 px-2 rounded-md text-zinc-300 hover:bg-panel hover:text-white text-xs font-semibold tracking-wider uppercase"
      >
        <Plus className="w-3.5 h-3.5" /> Insert <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <Dropdown>
          <button
            type="button"
            onClick={() => { setOpen(false); fileRef.current?.click(); }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-panel2 text-left text-zinc-100"
          >
            <ImageIconLucide className="w-4 h-4" /> Upload Image
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); onOpenLibrary(); }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-panel2 text-left text-zinc-100"
          >
            <SearchIcon className="w-4 h-4" /> Select from Library
          </button>
          {onInsertInfobox && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onInsertInfobox();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-panel2 text-left text-zinc-100"
            >
              <Quote className="w-4 h-4" /> Infobox…
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              editor.chain().focus().insertContent(DEFAULT_NOTICE_CONTENT).run();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-panel2 text-left text-zinc-100"
          >
            <BellIcon className="w-4 h-4" /> Notice banner
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              editor.chain().focus().setHorizontalRule().run();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-panel2 text-left text-zinc-100"
          >
            <Minus className="w-4 h-4" /> Horizontal rule
          </button>
          <TableInsertButton editor={editor} onClose={() => setOpen(false)} />
        </Dropdown>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const url = await uploadImage(f);
          if (url) editor.chain().focus().setImage({ src: url }).run();
          e.target.value = "";
        }}
      />
    </div>
  );
}


/* -------------------- Table insert -------------------- */

function TableInsertButton({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const [hoveredRow, setHoveredRow] = useState(0);
  const [hoveredCol, setHoveredCol] = useState(0);
  const ROWS = 8;
  const COLS = 8;

  return (
    <div className="px-3 py-2 border-t border-line">
      <div className="flex items-center gap-2 mb-2">
        <TableIcon className="w-4 h-4 text-zinc-400" />
        <span className="text-zinc-100 text-sm">Insert table</span>
        <span className="ml-auto text-xs text-zinc-500">
          {hoveredRow > 0 && hoveredCol > 0 ? `${hoveredRow} × ${hoveredCol}` : ""}
        </span>
      </div>
      <div
        className="grid gap-0.5"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1.25rem)` }}
        onMouseLeave={() => { setHoveredRow(0); setHoveredCol(0); }}
      >
        {Array.from({ length: ROWS * COLS }).map((_, i) => {
          const row = Math.floor(i / COLS) + 1;
          const col = (i % COLS) + 1;
          const active = row <= hoveredRow && col <= hoveredCol;
          return (
            <button
              key={i}
              type="button"
              onMouseEnter={() => { setHoveredRow(row); setHoveredCol(col); }}
              onClick={() => {
                editor.chain().focus().insertTable({ rows: hoveredRow, cols: hoveredCol, withHeaderRow: true }).run();
                onClose();
              }}
              className={`w-5 h-5 rounded-sm border transition ${
                active
                  ? "bg-pulse-600/40 border-pulse-500/60"
                  : "bg-panel2 border-line hover:border-zinc-500"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

/* -------------------- Table context toolbar -------------------- */

function TableToolbar({ editor }: { editor: Editor }) {
  if (!editor.isActive("table")) return null;
  return (
    <div className="flex items-center gap-0.5 px-2 py-1 bg-panel2/80 border-b border-line flex-wrap">
      <span className="text-[11px] text-zinc-500 uppercase tracking-wider mr-1">Table:</span>
      {[
        { label: "Add col before", run: () => editor.chain().focus().addColumnBefore().run() },
        { label: "Add col after", run: () => editor.chain().focus().addColumnAfter().run() },
        { label: "Del col", run: () => editor.chain().focus().deleteColumn().run() },
        { label: "Add row before", run: () => editor.chain().focus().addRowBefore().run() },
        { label: "Add row after", run: () => editor.chain().focus().addRowAfter().run() },
        { label: "Del row", run: () => editor.chain().focus().deleteRow().run() },
        { label: "Toggle header", run: () => editor.chain().focus().toggleHeaderRow().run() },
        { label: "Delete table", run: () => editor.chain().focus().deleteTable().run() },
      ].map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.run}
          className="inline-flex items-center h-6 px-2 rounded text-[11px] text-zinc-300 hover:bg-panel hover:text-white border border-transparent hover:border-line transition"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

/* -------------------- Shared dropdown / hook -------------------- */

function Dropdown({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute left-0 top-full mt-1 z-50 min-w-[220px] panel py-1 shadow-xl overflow-hidden">
      {children}
    </div>
  );
}

function useDismiss(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [onClose]);
  return ref;
}