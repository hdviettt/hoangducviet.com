import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import RenderedVisual from "./RenderedVisual";

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
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
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
          return <pre {...props}>{children}</pre>;
        },
        img: ({ src, alt, ...props }: any) => {
          return (
            <figure className="my-6">
              <img
                src={src}
                alt={alt || ""}
                className="w-full h-auto"
                {...props}
              />
              {alt && (
                <figcaption className="text-center text-sm text-muted-foreground mt-3">
                  {alt}
                </figcaption>
              )}
            </figure>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
