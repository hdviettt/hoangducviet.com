import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import Image from "next/image";
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
                widgetProps = JSON.parse(raw);
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
          return (
            <figure className="my-6">
              <Image
                src={src || ""}
                alt={alt || ""}
                width={800}
                height={600}
                className="w-full h-auto rounded-lg"
                sizes="(max-width: 768px) 100vw, 720px"
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
