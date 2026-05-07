import { unstable_cache } from "next/cache";

const POSTHOG_API_HOST =
  process.env.POSTHOG_API_HOST ?? "https://us.posthog.com";
const PROJECT_ID = process.env.POSTHOG_PROJECT_ID;
const API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;

// Pre-rename URL aliases. Posts in this map were renamed by
// scripts/rename-projects-to-series.cjs — their old `/posts/<old-slug>` URLs
// still have historical PostHog pageviews that must count toward the
// post's current all-time total.
const LEGACY_SLUG_ALIASES: Record<string, string[]> = {
  "web-crawling-in-search-engines": [
    "building-a-mini-search-engine-1-web-crawling-in-search-engines",
  ],
  "designing-the-web-crawler": [
    "building-a-mini-search-engine-2-designing-the-web-crawler",
  ],
  "inverted-index": ["building-a-mini-search-engine-3-inverted-index"],
  "ranking-with-bm25": ["building-a-mini-search-engine-4-ranking-with-bm25"],
  "ranking-with-pagerank": [
    "building-a-mini-search-engine-5-ranking-with-pagerank",
  ],
  "ai-overviews": ["building-a-mini-search-engine-6-ai-overviews"],
  "neural-reranking-with-bert": [
    "building-a-mini-search-engine-7-neural-reranking-with-bert",
  ],
  "ai-mode": ["building-a-mini-search-engine-8-ai-mode"],
};

// Returns a plain Record (not Map) because unstable_cache JSON-serializes
// its values — a Map round-trips to {} and loses .get(). Plain objects
// survive the cache boundary intact.
async function fetchAllPathCounts(): Promise<Record<string, number>> {
  if (!PROJECT_ID || !API_KEY) return {};

  const query = `
    SELECT properties.$pathname AS path, count() AS c
    FROM events
    WHERE event = '$pageview'
      AND (
        properties.$pathname LIKE '/posts/%'
        OR properties.$pathname LIKE '/series/%'
      )
    GROUP BY path
  `;

  try {
    const res = await fetch(
      `${POSTHOG_API_HOST}/api/projects/${PROJECT_ID}/query/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!res.ok) return {};
    const data = (await res.json()) as {
      results?: Array<[string, number]>;
    };
    const out: Record<string, number> = {};
    for (const [path, count] of data.results ?? []) {
      out[path] = count;
    }
    return out;
  } catch {
    return {};
  }
}

const getCachedPathCounts = unstable_cache(
  fetchAllPathCounts,
  ["posthog-all-paths"],
  { revalidate: 300, tags: ["posthog-views"] },
);

function totalForSlug(counts: Record<string, number>, slug: string): number {
  if (!/^[a-zA-Z0-9_-]+$/.test(slug)) return 0;
  let total = 0;
  // Current standalone URL.
  total += counts[`/posts/${slug}`] ?? 0;
  // Current series-post URLs: /series/<any>/<slug>. Only iterate paths that
  // start with /series/ to keep this O(series-paths) not O(all-paths).
  for (const path of Object.keys(counts)) {
    if (!path.startsWith("/series/")) continue;
    const parts = path.split("/");
    // parts: ["", "series", "<series-slug>", "<post-slug>"]
    if (parts.length === 4 && parts[3] === slug) total += counts[path] ?? 0;
  }
  // Pre-rename URLs for posts whose slug changed.
  const legacy = LEGACY_SLUG_ALIASES[slug];
  if (legacy) {
    for (const oldSlug of legacy) {
      total += counts[`/posts/${oldSlug}`] ?? 0;
    }
  }
  return total;
}

/**
 * All-time PostHog `$pageview` count for a single post slug. Includes the
 * current `/posts/<slug>` URL, any `/series/<x>/<slug>` URL, and pre-rename
 * legacy URLs from `LEGACY_SLUG_ALIASES`. Cached 5 minutes globally,
 * fail-silent to 0.
 */
export async function getPostViewCount(slug: string): Promise<number> {
  const counts = await getCachedPathCounts();
  return totalForSlug(counts, slug);
}

/**
 * Batch lookup for multiple slugs — uses the same cached query as
 * `getPostViewCount`, so calling this is the same cost as one PostHog call
 * regardless of how many slugs are passed.
 */
export async function getPostViewCounts(
  slugs: string[],
): Promise<Record<string, number>> {
  const counts = await getCachedPathCounts();
  const out: Record<string, number> = {};
  for (const slug of slugs) {
    out[slug] = totalForSlug(counts, slug);
  }
  return out;
}
