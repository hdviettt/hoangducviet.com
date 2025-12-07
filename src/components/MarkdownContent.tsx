"use client";

import { useEffect, useState } from "react";

interface MarkdownContentProps {
  content: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  const [ReactMarkdown, setReactMarkdown] = useState<any>(null);
  const [remarkGfm, setRemarkGfm] = useState<any>(null);

  useEffect(() => {
    // Dynamically import react-markdown and remark-gfm to avoid edge runtime issues
    Promise.all([
      import("react-markdown"),
      import("remark-gfm")
    ]).then(([md, gfm]) => {
      setReactMarkdown(() => md.default);
      setRemarkGfm(() => gfm.default);
    });
  }, []);

  if (!ReactMarkdown || !remarkGfm) {
    return <div className="text-muted-foreground text-sm">Loading content...</div>;
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
              <img src={src} alt={alt || ''} className="w-full h-auto rounded-lg" {...props} />
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
