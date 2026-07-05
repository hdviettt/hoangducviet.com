"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";

// --- In-editor video player NodeView ---

function VideoView({ node, deleteNode, selected }: any) {
  const { src, caption } = node.attrs;

  return (
    <NodeViewWrapper
      className={`my-4 relative group not-prose ${
        selected ? "ring-2 ring-md-primary rounded-lg" : ""
      }`}
      contentEditable={false}
    >
      {src ? (
        // biome-ignore lint/a11y/useMediaCaption: author-supplied clips have no track file
        <video
          src={src}
          controls
          preload="metadata"
          playsInline
          className="w-full h-auto max-h-[60vh] rounded-lg bg-black"
        />
      ) : (
        <div className="rounded-lg border border-dashed border-md-outline-variant bg-md-surface-container p-6 text-center md-body-medium text-md-on-surface-variant">
          No video source
        </div>
      )}
      {caption && (
        <p className="text-center md-body-small text-md-on-surface-variant mt-2">
          {caption}
        </p>
      )}
      <button
        type="button"
        onClick={() => deleteNode()}
        title="Remove video"
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-md-surface-container-high/90 border border-md-outline-variant text-md-on-surface-variant hover:text-md-error flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {"×"}
      </button>
    </NodeViewWrapper>
  );
}

// --- Tiptap Node ---
// Serializes to the same `widget:video` fence the public renderer already
// understands (via WidgetBlock -> Video widget), so this node only changes the
// authoring experience — stored content and published output are identical.

export const VideoEmbed = Node.create({
  name: "videoEmbed",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: "" },
      caption: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-video-embed]",
        getAttrs: (el: HTMLElement) => ({
          src: el.getAttribute("data-src") || "",
          caption: el.getAttribute("data-caption") || "",
        }),
      },
    ];
  },

  renderHTML({ node }) {
    return [
      "div",
      mergeAttributes({
        "data-video-embed": "",
        "data-src": node.attrs.src,
        "data-caption": node.attrs.caption,
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoView);
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          const data: Record<string, string> = { src: node.attrs.src || "" };
          if (node.attrs.caption) data.caption = node.attrs.caption;
          state.write("```widget:video\n" + JSON.stringify(data) + "\n```");
          state.closeBlock(node);
        },
        parse: {},
      },
    };
  },
});

// --- Markdown preprocessing ---
// Turns a stored ```widget:video\n{json}\n``` fence into a
// <div data-video-embed> element so Tiptap's parseHTML materializes it into the
// live player node when content loads. Mirrors preprocessMathInMarkdown.

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function preprocessVideoInMarkdown(markdown: string): string {
  return markdown.replace(
    /```widget:video\s*\n([\s\S]*?)\n```/g,
    (whole, json) => {
      try {
        const parsed = JSON.parse(String(json).trim());
        const src = escapeAttr(parsed.src || "");
        const caption = escapeAttr(parsed.caption || "");
        return `<div data-video-embed data-src="${src}" data-caption="${caption}"></div>`;
      } catch {
        return whole; // leave malformed fences untouched
      }
    },
  );
}
