import WorkDiagram, { type ArchSpec } from "@/components/work/WorkDiagram";

// One architecture spec per project. Default cards are soft blue (logic/agents);
// `variant: "neutral"` marks data/sources/infra; `variant: "hub"` highlights the
// one pivotal step in brand blue. `logos` shows the truthful models/services a
// step actually uses (only real brand marks; nothing is implied). `in` labels
// the edge entering a zone.

const SPECS: Record<string, ArchSpec> = {
  "mini-search-engine": {
    zones: [
      {
        label: "Ingest",
        nodes: [
          { title: "Web", sub: "the open web", icon: "globe", variant: "neutral" },
          { title: "Crawler", sub: "polite BFS", icon: "download" },
          { title: "Inverted index", sub: "145,736 terms", icon: "index", variant: "neutral", logos: ["postgres"] },
        ],
      },
      {
        label: "Rank",
        in: "top hits",
        nodes: [
          { title: "BM25 + PageRank", sub: "relevance x authority", icon: "bars" },
          { title: "Cross-encoder", sub: "neural rerank", icon: "spark", variant: "hub" },
        ],
      },
      {
        label: "Answer",
        in: "reranked",
        stack: true,
        nodes: [
          { title: "AI Overview", sub: "RAG, cited", icon: "doc" },
          { title: "AI Mode", sub: "conversational", icon: "chat" },
        ],
      },
    ],
    note: "grounded, cited answers from a self-built index",
  },

  "agentic-ai-platform": {
    zones: [
      {
        label: "Interfaces",
        nodes: [
          { title: "Lark bots", sub: "chat surface", icon: "chat" },
          { title: "Internal apps", sub: "web UIs", icon: "browser" },
        ],
      },
      {
        label: "Runtime",
        in: "request",
        note: "one .md file per agent",
        nodes: [
          { title: "Agent + skills", sub: "filesystem registry", icon: "doc", variant: "hub", logos: ["claude"] },
          { title: "Eval gate", sub: "5 of 5 to ship", icon: "shield" },
        ],
      },
      {
        label: "System",
        in: "run",
        nodes: [
          { title: "Connectors", sub: "21 tools", icon: "plug", variant: "neutral" },
          { title: "Run history", sub: "input, cost, outcome", icon: "db", variant: "neutral", logos: ["postgres"] },
        ],
      },
    ],
    note: "one runtime, procedures over prompts",
  },

  "cms-publishing-pipeline": {
    zones: [
      {
        label: "Onboarding",
        note: "runs once per website",
        nodes: [
          { title: "Sample pair", sub: "before / after", icon: "doc", variant: "neutral" },
          { title: "Model", sub: "1 call, rules", icon: "spark", variant: "hub", logos: ["claude"] },
          { title: "Pattern store", sub: "per-site", icon: "db", variant: "neutral", logos: ["postgres"] },
        ],
      },
      {
        label: "Publish",
        in: "rules",
        note: "every article, zero model calls",
        nodes: [
          { title: "Google Doc", sub: "source", icon: "doc", variant: "neutral" },
          { title: "Transform", sub: "332-line job", icon: "gear" },
          { title: "WordPress", sub: "clean draft", icon: "browser", variant: "neutral", logos: ["wordpress"] },
        ],
      },
    ],
    note: "one model call per site, zero per article",
  },

  "content-seo-ai": {
    zones: [
      {
        label: "Knowledge",
        nodes: [
          { title: "Skills", sub: "loaded whole", icon: "folder", variant: "neutral" },
          { title: "RAG store", sub: "hash-synced", icon: "db", variant: "neutral", logos: ["supabase"] },
        ],
      },
      {
        label: "Agent",
        in: "context",
        note: "model-portable harness",
        nodes: [
          { title: "Write", sub: "reason, act", icon: "pen", variant: "hub", logos: ["claude", "vercel"] },
          { title: "Review", sub: "against rules", icon: "check" },
        ],
      },
      {
        label: "Output",
        in: "draft",
        stack: true,
        nodes: [{ title: "Publishable draft", sub: "editor ships", icon: "doc" }],
      },
    ],
    note: "skills load whole, so nothing is scored away",
  },

  "keyword-clustering": {
    zones: [
      {
        label: "Embed",
        nodes: [
          { title: "Keywords", sub: "thousands", icon: "tag", variant: "neutral" },
          { title: "Embed", sub: "3,072 dims", icon: "embed", logos: ["gpt"] },
        ],
      },
      {
        label: "Cluster",
        in: "vectors",
        nodes: [
          { title: "UMAP", sub: "3,072 to ~30", icon: "reduce" },
          { title: "HDBSCAN", sub: "by density", icon: "cluster", variant: "hub" },
        ],
      },
      {
        label: "Label",
        in: "clusters",
        nodes: [
          { title: "Cheap model", sub: "names", icon: "spark", logos: ["gpt"] },
          { title: "Export", sub: "CSV, XLSX", icon: "download", variant: "neutral" },
        ],
      },
    ],
    note: "Vietnamese-first, reproducible at scale",
  },

  "seo-quoting-agent": {
    zones: [
      {
        label: "State",
        nodes: [{ title: "Quote stages", sub: "row per step", icon: "db", variant: "neutral", logos: ["postgres"] }],
      },
      {
        label: "Pipeline",
        in: "quote",
        note: "eight steps of code",
        nodes: [
          { title: "Deterministic", sub: "8 steps", icon: "code" },
          { title: "Caged model", sub: "pick rivals", icon: "lock", variant: "hub", logos: ["claude"] },
          { title: "Invariant gate", sub: "presence check", icon: "shield" },
        ],
      },
      {
        label: "Output",
        in: "gated",
        stack: true,
        nodes: [{ title: "Quote", sub: "priced", icon: "receipt", variant: "neutral" }],
      },
    ],
    note: "eight steps of code, one caged model call",
  },
};

export function hasDiagram(slug: string): boolean {
  return slug in SPECS;
}

export default function ProjectDiagram({ slug }: { slug: string }) {
  const spec = SPECS[slug];
  if (!spec) return null;
  return <WorkDiagram spec={spec} />;
}
