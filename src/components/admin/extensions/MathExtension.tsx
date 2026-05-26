"use client";

import { Node, mergeAttributes, InputRule } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { useState, useEffect, useRef, useCallback } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

// --- Inline Math NodeView ---

function MathInlineView({ node, updateAttributes, selected }: any) {
  const [editing, setEditing] = useState(!node.attrs.latex);
  const [latex, setLatex] = useState(node.attrs.latex);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const save = useCallback(() => {
    updateAttributes({ latex });
    setEditing(false);
  }, [latex, updateAttributes]);

  if (editing) {
    return (
      <NodeViewWrapper as="span" className="inline">
        <input
          ref={inputRef}
          value={latex}
          onChange={(e) => setLatex(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              save();
            }
            if (e.key === "Escape") {
              setLatex(node.attrs.latex);
              setEditing(false);
            }
          }}
          onBlur={save}
          className="bg-muted border border-primary px-1.5 py-0.5 text-sm font-mono rounded-sm inline-block"
          style={{ width: `${Math.max(4, latex.length + 2)}ch` }}
          placeholder="E=mc^2"
        />
      </NodeViewWrapper>
    );
  }

  let html = "";
  try {
    html = katex.renderToString(node.attrs.latex || "?", {
      throwOnError: false,
    });
  } catch {
    html = `<span style="color:red">${node.attrs.latex}</span>`;
  }

  return (
    <NodeViewWrapper
      as="span"
      className={`inline cursor-pointer ${selected ? "ring-1 ring-primary ring-offset-1 rounded-sm" : ""}`}
      onClick={() => setEditing(true)}
      contentEditable={false}
    >
      <span dangerouslySetInnerHTML={{ __html: html }} />
    </NodeViewWrapper>
  );
}

// --- Block Math NodeView ---

function MathBlockView({ node, updateAttributes, selected }: any) {
  const [editing, setEditing] = useState(!node.attrs.latex);
  const [latex, setLatex] = useState(node.attrs.latex);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editing]);

  const save = useCallback(() => {
    updateAttributes({ latex });
    setEditing(false);
  }, [latex, updateAttributes]);

  if (editing) {
    return (
      <NodeViewWrapper className="my-4">
        <div className="border border-primary bg-muted/50 p-3">
          <textarea
            ref={textareaRef}
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                save();
              }
              if (e.key === "Escape") {
                setLatex(node.attrs.latex);
                setEditing(false);
              }
            }}
            onBlur={save}
            rows={3}
            className="md-field font-mono"
            placeholder="\frac{a}{b} = c"
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            Enter to save · Shift+Enter for newline · Escape to cancel
          </p>
        </div>
      </NodeViewWrapper>
    );
  }

  let html = "";
  try {
    html = katex.renderToString(node.attrs.latex || "?", {
      displayMode: true,
      throwOnError: false,
    });
  } catch {
    html = `<span style="color:red">${node.attrs.latex}</span>`;
  }

  return (
    <NodeViewWrapper
      className={`my-4 cursor-pointer text-center ${selected ? "ring-1 ring-primary ring-offset-2 rounded-sm" : ""}`}
      onClick={() => setEditing(true)}
      contentEditable={false}
    >
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </NodeViewWrapper>
  );
}

// --- Tiptap Nodes ---

export const MathInline = Node.create({
  name: "mathInline",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      latex: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "math-inline",
        getAttrs: (el: HTMLElement) => ({
          latex: el.textContent || "",
        }),
      },
    ];
  },

  renderHTML({ node }) {
    return [
      "math-inline",
      mergeAttributes(),
      node.attrs.latex,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathInlineView);
  },

  addInputRules() {
    return [
      new InputRule({
        find: /(?<!\$)\$([^\$\n]+)\$$/,
        handler: ({ state, range, match }) => {
          const latex = match[1];
          if (latex) {
            state.tr.replaceWith(
              range.from,
              range.to,
              this.type.create({ latex }),
            );
          }
        },
      }),
    ];
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          state.write(`$${node.attrs.latex}$`);
        },
        parse: {},
      },
    };
  },
});

export const MathBlock = Node.create({
  name: "mathBlock",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      latex: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "math-block",
        getAttrs: (el: HTMLElement) => ({
          latex: el.textContent || "",
        }),
      },
    ];
  },

  renderHTML({ node }) {
    return [
      "math-block",
      mergeAttributes(),
      node.attrs.latex,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathBlockView);
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          state.write(`$$\n${node.attrs.latex}\n$$`);
          state.closeBlock(node);
        },
        parse: {},
      },
    };
  },
});

// --- Markdown Preprocessing ---
// Converts $...$ and $$...$$ in markdown to HTML tags
// so Tiptap's parseHTML can pick them up on content load.

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function preprocessMathInMarkdown(markdown: string): string {
  // Block math first: $$...$$
  let result = markdown.replace(
    /\$\$([\s\S]*?)\$\$/g,
    (_, latex) => `<math-block>${escapeHtml(latex.trim())}</math-block>`,
  );
  // Inline math: $...$ (not preceded/followed by $)
  result = result.replace(
    /(?<!\$)\$(?!\$)([^\$\n]+?)\$(?!\$)/g,
    (_, latex) => `<math-inline>${escapeHtml(latex)}</math-inline>`,
  );
  return result;
}
