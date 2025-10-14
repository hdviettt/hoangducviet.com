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

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {content}
    </ReactMarkdown>
  );
}
