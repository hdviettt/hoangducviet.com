import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
  content: string;
}

// Helper function to generate heading IDs from text
const generateId = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export default function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({children, ...props}: any) => {
          const text = typeof children === 'string' ? children : String(children);
          const id = generateId(text);
          return <h1 id={id} {...props}>{children}</h1>;
        },
        h2: ({children, ...props}: any) => {
          const text = typeof children === 'string' ? children : String(children);
          const id = generateId(text);
          return <h2 id={id} {...props}>{children}</h2>;
        },
        h3: ({children, ...props}: any) => {
          const text = typeof children === 'string' ? children : String(children);
          const id = generateId(text);
          return <h3 id={id} {...props}>{children}</h3>;
        },
        h4: ({children, ...props}: any) => {
          const text = typeof children === 'string' ? children : String(children);
          const id = generateId(text);
          return <h4 id={id} {...props}>{children}</h4>;
        },
        h5: ({children, ...props}: any) => {
          const text = typeof children === 'string' ? children : String(children);
          const id = generateId(text);
          return <h5 id={id} {...props}>{children}</h5>;
        },
        h6: ({children, ...props}: any) => {
          const text = typeof children === 'string' ? children : String(children);
          const id = generateId(text);
          return <h6 id={id} {...props}>{children}</h6>;
        },
        img: ({src, alt, ...props}: any) => {
          return (
            <figure className="my-6">
              <img src={src} alt={alt || ''} className="w-full h-auto" {...props} />
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
