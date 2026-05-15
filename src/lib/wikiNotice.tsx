"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import {
  NodeViewWrapper,
  NodeViewContent,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import { useRef } from "react";

/* ---- React node view rendered inside the editor ---- */
function WikiNoticeView({ node, updateAttributes, editor }: NodeViewProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const imageSrc: string = node.attrs.imageSrc || "";

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const upload = (
      editor?.storage as { wikiNotice?: { uploadImage?: (f: File) => Promise<string | null> } }
    )?.wikiNotice?.uploadImage;
    if (!upload) return;
    const url = await upload(file);
    if (url) updateAttributes({ imageSrc: url });
    e.target.value = "";
  }

  return (
    <NodeViewWrapper as="div" className="wiki-notice" data-wiki-notice="">
      <button
        type="button"
        className="wiki-notice-badge"
        onClick={() => fileRef.current?.click()}
        title="Click to change image"
        contentEditable={false}
      >
        {imageSrc ? (
          <img src={imageSrc} alt="Notice badge" className="wiki-notice-img" />
        ) : (
          <svg viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="27" cy="27" r="27" fill="#1a0505" />
            <text
              x="27"
              y="32"
              textAnchor="middle"
              fontSize="14"
              fontWeight="bold"
              fill="#f87171"
              fontFamily="sans-serif"
            >
              PR
            </text>
          </svg>
        )}
        <span className="wiki-notice-badge-overlay" aria-hidden="true">
          ✎
        </span>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </button>
      <div className="wiki-notice-body">
        <p className="wiki-notice-title">PulseRP</p>
        <div className="wiki-notice-text">
          <NodeViewContent as="span" />
        </div>
      </div>
    </NodeViewWrapper>
  );
}

/* ---- TipTap Node extension ---- */
export const WikiNoticeNode = Node.create({
  name: "wikiNotice",
  group: "block",
  content: "inline*",

  addStorage() {
    return { uploadImage: null as ((f: File) => Promise<string | null>) | null };
  },

  addAttributes() {
    return {
      imageSrc: {
        default: "",
        parseHTML: (el) =>
          (el.querySelector(".wiki-notice-img") as HTMLImageElement)?.src || "",
        renderHTML: (attrs) =>
          attrs.imageSrc ? { "data-image-src": attrs.imageSrc } : {},
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-wiki-notice]",
        contentElement: ".wiki-notice-text",
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const src: string = node.attrs.imageSrc || "";

    const badge = src
      ? [
          "div",
          { class: "wiki-notice-badge" },
          [
            "img",
            {
              src,
              alt: "Notice badge",
              class: "wiki-notice-img",
            },
          ],
        ]
      : [
          "div",
          { class: "wiki-notice-badge" },
          [
            "svg",
            {
              viewBox: "0 0 54 54",
              fill: "none",
              xmlns: "http://www.w3.org/2000/svg",
              width: "54",
              height: "54",
            },
            [
              "circle",
              {
                cx: "27",
                cy: "27",
                r: "27",
                fill: "#1a0505",
              },
            ],
            [
              "text",
              {
                x: "27",
                y: "32",
                "text-anchor": "middle",
                "font-size": "14",
                "font-weight": "bold",
                fill: "#f87171",
                "font-family": "sans-serif",
              },
              "PR",
            ],
          ],
        ];

    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-wiki-notice": "",
        class: "wiki-notice",
      }),
      badge,
      [
        "div",
        { class: "wiki-notice-body" },
        ["p", { class: "wiki-notice-title" }, "PulseRP"],
        ["div", { class: "wiki-notice-text" }, 0],
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(WikiNoticeView);
  },
});

/* Default content for a fresh notice */
export const DEFAULT_NOTICE_CONTENT = {
  type: "wikiNotice" as const,
  content: [
    {
      type: "text",
      text: "Please do not put FALSE or UNCONFIRMED INFORMATION on this page.",
    },
  ],
};
