"use client";

import hljs from "highlight.js/lib/common";
import { useMemo, useState } from "react";

const LABELS: Record<string, string> = {
  py: "Python",
  python: "Python",
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  tsx: "TSX",
  jsx: "JSX",
  json: "JSON",
  bash: "Bash",
  sh: "Shell",
  shell: "Shell",
  sql: "SQL",
  html: "HTML",
  css: "CSS",
  yaml: "YAML",
  yml: "YAML",
  text: "Text",
  txt: "Text",
  plaintext: "Text",
};
const EXT: Record<string, string> = {
  python: "py",
  javascript: "js",
  typescript: "ts",
  json: "json",
  bash: "sh",
  shell: "sh",
  sql: "sql",
  html: "html",
  css: "css",
  yaml: "yml",
};

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default function CodeBlock({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const [copied, setCopied] = useState(false);
  const lang = (language || "").toLowerCase();
  const label = LABELS[lang] ?? (lang ? lang.toUpperCase() : "Code");

  const html = useMemo(() => {
    const canonical =
      lang === "py" ? "python" : lang === "js" ? "javascript" : lang;
    try {
      if (canonical && canonical !== "text" && hljs.getLanguage(canonical)) {
        return hljs.highlight(code, { language: canonical }).value;
      }
    } catch {
      /* fall through to plain */
    }
    return escapeHtml(code);
  }, [code, lang]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  };

  const download = () => {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `snippet.${EXT[lang] ?? "txt"}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-block-lang">{label}</span>
        <div className="code-block-actions">
          <button type="button" onClick={download} aria-label="Download code">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v6m0 0 3-3m-3 3-3-3" />
            </svg>
          </button>
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? "Copied" : "Copy code"}
          >
            {copied ? (
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : (
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="9" y="9" width="12" height="12" rx="2.5" />
                <path d="M5 15V5a2 2 0 0 1 2-2h10" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <pre className="code-block-pre">
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: highlight.js output, code is escaped */}
        <code className="hljs" dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}
