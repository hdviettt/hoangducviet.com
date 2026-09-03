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
    "AI leader who ships production systems: a search engine built from scratch, an agentic deck-builder, and a company-wide AI platform serving 117 people across 30 teams.",
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
