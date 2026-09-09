"use client";

import { Icon } from "@/components/ui/Icon";
import { widgetRegistry } from "@/components/widgets/registry";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import { useMemo, useState } from "react";

/**
 * Notebook cells for the two fences that are not really code.
 *
 * ```render holds raw inline SVG and ```widget:<name> holds JSON props for a
 * registered component. In the editor both were walls of source: one post has
 * nine render fences, each 237px of `<path d="M215.5,69.0 ...">` sitting
 * between two sentences.
 *
 * This shows the output and keeps the source one click away, which is the
 * shape nbformat uses: source and outputs as sibling fields, output optional.
 *
 * Nothing here touches the node type, its attributes, or the markdown
 * serialiser. It is a node VIEW, so the fence still round-trips byte for byte;
 * `scripts/roundtrip-check.cjs` is the gate that says so, and it has to stay at
 * 28 of 28 after any change to this file.
 *
 * Every other language falls through to a plain pre/code with the same
 * contentDOM the default renders, so lowlight's decorations still land.
 */

function isCell(language: string | null | undefined) {
  const lang = language ?? "";
  return lang === "render" || lang.startsWith("widget");
}

function RenderPreview({ source }: { source: string }) {
  const trimmed = source.trim();
  if (!trimmed) {
    return <Empty>Nothing to render yet.</Empty>;
  }
  if (!/^<(svg|div|figure|img|picture|video|section)\b/i.test(trimmed)) {
    return <Broken>Does not start with an element this can render.</Broken>;
  }
  return (
    // The published page renders this exact string through RenderedVisual, so
    // the editor showing it is not a new trust decision.
    <div
      className="fence-cell__out"
      dangerouslySetInnerHTML={{ __html: trimmed }}
    />
  );
}

function WidgetPreview({
  language,
  source,
}: {
  language: string;
  source: string;
}) {
  const name = language.includes(":") ? language.split(":")[1] : "";
  const known = Boolean(
    name && widgetRegistry[name as keyof typeof widgetRegistry],
  );
  const parsed = useMemo(() => {
    if (!source.trim()) return { ok: true as const, note: "no props" };
    try {
      JSON.parse(source);
      return { ok: true as const, note: "props parse" };
    } catch (e) {
      return { ok: false as const, note: (e as Error).message };
    }
  }, [source]);

  if (!known) {
    return <Broken>No widget named “{name || "?"}” is registered.</Broken>;
  }
  if (!parsed.ok) {
    return <Broken>Props are not valid JSON: {parsed.note}</Broken>;
  }
  return (
    <Empty>
      <span className="text-md-primary">{name}</span> widget, {parsed.note}. It
      renders on the page, not here.
    </Empty>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="fence-cell__note">{children}</div>;
}
function Broken({ children }: { children: React.ReactNode }) {
  return (
    <div className="fence-cell__note fence-cell__note--bad">
      <Icon name="warning" size={14} />
      <span>{children}</span>
    </div>
  );
}

function FenceCellView(props: {
  node: { attrs: { language?: string | null }; textContent: string };
}) {
  const language = props.node.attrs.language ?? "";
  const cell = isCell(language);
  const [showSource, setShowSource] = useState(!cell);
  const source = props.node.textContent;
  const lines = source ? source.split("\n").length : 0;

  if (!cell) {
    // Plain code block: same shape the default node view produces, so the
    // lowlight decorations still apply.
    return (
      <NodeViewWrapper as="div">
        <pre>
          <NodeViewContent<"code"> as="code" />
        </pre>
      </NodeViewWrapper>
    );
  }

  const label = language === "render" ? "render" : language;

  return (
    <NodeViewWrapper as="div" className="fence-cell">
      <div className="fence-cell__bar" contentEditable={false}>
        <span className="fence-cell__lang">{label}</span>
        <span className="fence-cell__meta">
          {lines} line{lines === 1 ? "" : "s"}
        </span>
        <button
          type="button"
          onClick={() => setShowSource((s) => !s)}
          className="fence-cell__toggle"
          title={showSource ? "Show output" : "Show source"}
        >
          <Icon name={showSource ? "visibility" : "edit"} size={14} />
          <span>{showSource ? "output" : "source"}</span>
        </button>
      </div>

      {!showSource && (
        <div contentEditable={false} className="fence-cell__preview">
          {language === "render" ? (
            <RenderPreview source={source} />
          ) : (
            <WidgetPreview language={language} source={source} />
          )}
        </div>
      )}

      {/* contentDOM must stay in the tree for editing; it is hidden, not
          removed, when the output is showing. */}
      <pre className={showSource ? "" : "fence-cell__source--hidden"}>
        <NodeViewContent<"code"> as="code" />
      </pre>
    </NodeViewWrapper>
  );
}

export const FenceCell = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(FenceCellView);
  },
});
