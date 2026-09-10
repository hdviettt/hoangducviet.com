import type { ProjectStackGroup } from "@/db/schema";

// Canonical identity facts for Hoang Duc Viet — the single source of truth for
// both the visible hero (page.tsx) and the JSON-LD entity graph (jsonld.ts) so
// the two can never drift. Consistency across every surface is what lets Google
// and AI retrieval reconcile all mentions into one real-world entity.
//
// Entity @id anchors are pinned to the production origin (NOT the env base URL)
// so every page references the exact same Person node string, regardless of
// where a preview/staging build is served from.

export const SITE_ORIGIN = "https://hoangducviet.com";

export const PERSON_ID = `${SITE_ORIGIN}/#person`;
export const WEBSITE_ID = `${SITE_ORIGIN}/#website`;
export const PROFILEPAGE_ID = `${SITE_ORIGIN}/#profilepage`;
export const ORG_ID = "https://seongon.com/#organization";

export const IDENTITY = {
  name: "Hoang Duc Viet",
  // Vietnamese diacritics variant — declared as alternateName so both spellings
  // resolve to the same entity instead of fracturing into two.
  alternateName: "Hoàng Đức Việt",
  givenName: "Duc Viet",
  familyName: "Hoang",
  username: "hdviet",
  jobTitle: "AI Leader",
  email: "viethd2704@gmail.com",
  employer: { name: "SEONGON", url: "https://seongon.com" },
  description:
    "AI leader who ships production systems: a search engine built from scratch, an agentic deck-builder, and a company-wide AI platform serving 120 people across 30 teams.",
  knowsAbout: [
    "Agentic SEO",
    "Search Engine Optimization",
    "Information Retrieval",
    "Search ranking algorithms",
    "Agentic AI systems",
  ],
} as const;

// Visible social links in the hero. Ordered as displayed. Icons are attached in
// page.tsx (kept out of this lib so no UI dependency leaks in here).
export const SOCIAL_PROFILES = [
  { label: "GitHub", href: "https://github.com/hdviettt" },
  { label: "Facebook", href: "https://www.facebook.com/hoangducviettt/" },
  { label: "Instagram", href: "https://www.instagram.com/_hdviet/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/hdviet/" },
] as const;

// The high-authority SEONGON expert profile — already indexed and cited in AI
// Overviews. Listing it in sameAs lets that authority reconcile with this
// domain as the canonical entity home.
export const SEONGON_EXPERT_URL =
  "https://seongon.com/chuyen-gia/hoang-duc-viet";

// Wikidata item (Q140412844). Its `official website` (P856) points back to this
// site, so listing it here closes a fully bidirectional site <-> Knowledge-Graph
// loop — the strongest reconciliation pair we control end to end.
export const WIKIDATA_URL = "https://www.wikidata.org/wiki/Q140412844";

// sameAs = every URL that provably denotes this same person: socials + the
// SEONGON expert profile + the Wikidata item.
export const SAME_AS: string[] = [
  ...SOCIAL_PROFILES.map((p) => p.href),
  SEONGON_EXPERT_URL,
  WIKIDATA_URL,
];

// What Viet actually builds with, grouped the way he would say it out loud.
//
// Every entry is either named on a project's own "Built with" panel under /work
// or is a default he reaches for across enough of them to count. Nothing
// aspirational goes in here: the project pages are the receipts, and a stack
// that lists something no project uses is the one claim on this site a reader
// can disprove in two clicks.
//
// The shape is ProjectStackGroup, so the About page renders through the same
// Chips component the project pages use and a tool looks identical wherever you
// meet it. `import type` keeps the schema module out of the emitted bundle.
export const TECH_STACK: ProjectStackGroup[] = [
  {
    group: "Languages",
    items: [{ name: "Python" }, { name: "TypeScript" }, { name: "SQL" }],
  },
  {
    group: "Models",
    items: [
      { name: "Claude" },
      { name: "GPT" },
      { name: "Gemini" },
      { name: "Grok" },
      { name: "Qwen" },
      { name: "Voyage" },
    ],
  },
  {
    group: "Agents",
    items: [
      { name: "Claude Agent SDK" },
      { name: "Vercel AI SDK" },
      { name: "MCP" },
      { name: "Agno" },
      { name: "n8n" },
    ],
  },
  {
    group: "Machine learning",
    items: [
      { name: "underthesea" },
      { name: "UMAP" },
      { name: "HDBSCAN" },
      { name: "ONNX Runtime" },
      { name: "Unsloth" },
    ],
  },
  {
    group: "Application",
    items: [
      { name: "Next.js" },
      { name: "React" },
      { name: "Tailwind" },
      { name: "FastAPI" },
      { name: "Drizzle" },
      { name: "Bun" },
    ],
  },
  {
    group: "Data",
    // One chip, not two. `pgvector` resolves to the same elephant as
    // `PostgreSQL`, and two identical logos side by side read as a rendering
    // bug; the project pages already write it as one item for that reason.
    items: [
      { name: "PostgreSQL + pgvector" },
      { name: "Supabase" },
      { name: "Redis" },
    ],
  },
  {
    group: "Infrastructure",
    items: [{ name: "Railway" }, { name: "Docker" }, { name: "Cloudflare R2" }],
  },
];
