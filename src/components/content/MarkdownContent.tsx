import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import RenderedVisual from "./RenderedVisual";
import WidgetBlock from "../widgets/WidgetBlock";

interface MarkdownContentProps {
  content: string;
}

// Helper function to generate heading IDs from text
const generateId = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

// Raw HTML is deliberately not rendered (no rehype-raw — the `render` code
// fence is the only gate for HTML). Table cells are the one place authors
// legitimately reach for <br> to stack items, so turn those literal strings
// into real line breaks instead of showing "<br>" as text.
const BR_SPLIT = /<br\s*\/?>/i;
const breakCellText = (node: ReactNode, keyPrefix = "c"): ReactNode => {
  if (typeof node === "string" && BR_SPLIT.test(node)) {
    const parts = node.split(new RegExp(BR_SPLIT.source, "gi"));
    return parts.flatMap((part, i) =>
      i === 0
        ? [part]
        : [<br key={`${keyPrefix}-br-${i}`} />, part],
    );
  }
  if (Array.isArray(node)) {
    return node.map((child, i) => breakCellText(child, `${keyPrefix}-${i}`));
  }
  return node;
};

const TableCell = ({
  isHeader,
  children,
  ...props
}: {
  isHeader?: boolean;
  children?: ReactNode;
} & Record<string, unknown>) => {
  const Tag = isHeader ? "th" : "td";
  return <Tag {...props}>{breakCellText(children)}</Tag>;
};

const HeadingWithAnchor = ({ level, children, ...props }: any) => {
  const text = typeof children === "string" ? children : String(children);
  const id = generateId(text);
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag id={id} className="group relative" {...props}>
      <a
        href={`#${id}`}
        className="heading-anchor absolute -left-5 top-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-opacity"
        aria-label={`Link to ${text}`}
      >
        #
      </a>
      {children}
    </Tag>
  );
};

export default function MarkdownContent({ content }: MarkdownContentProps) {
  // Fix malformed markdown where image and heading are concatenated without
  // a blank line (caused by tiptap-markdown's image serializer missing closeBlock)
  const fixedContent = content.replace(
    /(\!\[[^\]]*\]\([^)]*\))(\s*)(#{1,6}\s)/g,
    "$1\n\n$3",
  );

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        h1: (props: any) => <HeadingWithAnchor level={1} {...props} />,
        h2: (props: any) => <HeadingWithAnchor level={2} {...props} />,
        h3: (props: any) => <HeadingWithAnchor level={3} {...props} />,
        h4: (props: any) => <HeadingWithAnchor level={4} {...props} />,
        h5: (props: any) => <HeadingWithAnchor level={5} {...props} />,
        h6: (props: any) => <HeadingWithAnchor level={6} {...props} />,
        table: ({ children, ...props }: any) => {
          return (
            <div className="table-wrapper">
              <table {...props}>{children}</table>
            </div>
          );
        },
        th: (props: any) => <TableCell isHeader {...props} />,
        td: (props: any) => <TableCell {...props} />,
        // Our img renderer emits <figure>, which is invalid inside <p> and
        // triggers hydration warnings. Unwrap paragraphs whose only content
        // is an image; leave real text paragraphs untouched.
        p: ({ node, children, ...props }: any) => {
          const kids = (node?.children || []).filter(
            (c: any) => !(c.type === "text" && !String(c.value).trim()),
          );
          if (
            kids.length > 0 &&
            kids.every((c: any) => c.tagName === "img")
          ) {
            return <>{children}</>;
          }
          return <p {...props}>{children}</p>;
        },
        pre: ({ children, ...props }: any) => {
          const codeEl = Array.isArray(children) ? children[0] : children;
          const className = codeEl?.props?.className || "";
          if (className === "language-render") {
            const html = String(codeEl?.props?.children || "").replace(
              /\n$/,
              "",
            );
            return <RenderedVisual html={html} />;
          }
          if (className.startsWith("language-widget:")) {
            const widgetName = className.replace("language-widget:", "");
            const raw = String(codeEl?.props?.children || "").trim();
            let widgetProps: Record<string, unknown> = {};
            if (raw) {
              try {
                const parsed = JSON.parse(raw);
                // A bare array is the natural way to write a list-shaped
                // widget (the carousel); spreading it would turn the entries
                // into numeric props, so name it `items` instead.
                widgetProps = Array.isArray(parsed)
                  ? { items: parsed }
                  : parsed;
              } catch {
                // If not valid JSON, pass raw as "children" prop
                widgetProps = { children: raw };
              }
            }
            return <WidgetBlock name={widgetName} props={widgetProps} />;
          }
          return <pre {...props}>{children}</pre>;
        },
        img: ({ src, alt }: any) => {
          // Plain <img> with auto sizing so the browser respects the source
          // image's intrinsic aspect ratio. Hardcoding 800×600 via Next/Image
          // warped vertical screenshots and panoramic captures.
          return (
            <figure className="my-6">
              {/* biome-ignore lint/a11y/useAltText: alt is passed as prop */}
              <img
                src={src || ""}
                alt={alt || ""}
                loading="lazy"
                decoding="async"
                className="w-full h-auto rounded-[var(--md-sys-shape-corner-large-increased)]"
              />
              {alt && (
                <figcaption
                  className="text-center text-sm mt-3"
                  style={{ color: "var(--article-text)" }}
                >
                  {alt}
                </figcaption>
              )}
            </figure>
          );
        },
      }}
    >
      {fixedContent}
    </ReactMarkdown>
  );
}
