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

// Returns null on failure so callers can tell "PostHog didn't answer"
// apart from "these paths genuinely have zero views" — the two must not
// be cached the same way.
async function fetchAllPathCounts(): Promise<Record<string, number> | null> {
  if (!PROJECT_ID || !API_KEY) return null;

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
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      results?: Array<[string, number]>;
    };
    const out: Record<string, number> = {};
    for (const [path, count] of data.results ?? []) {
      out[path] = count;
    }
    return out;
  } catch {
    return null;
  }
}

// Module-level cache with stale-while-error semantics. The previous
// unstable_cache setup stored the empty failure fallback for 5 minutes,
// so one slow or rate-limited PostHog query blanked every view count on
// the site until the next revalidation — counts flickered off and on.
// Now a failed refresh keeps serving the last good data, and failures
// only retry after a short cooldown instead of on every request.
const TTL_MS = 5 * 60_000;
const RETRY_MS = 30_000;
let cachedCounts: Record<string, number> = {};
let lastSuccessAt = 0;
let lastAttemptAt = 0;
let inflight: Promise<void> | null = null;

async function refreshCounts(): Promise<void> {
  lastAttemptAt = Date.now();
  const fresh = await fetchAllPathCounts();
  if (fresh) {
    cachedCounts = fresh;
    lastSuccessAt = Date.now();
  }
}

async function getCachedPathCounts(): Promise<Record<string, number>> {
  const now = Date.now();
  const isFresh = now - lastSuccessAt < TTL_MS;
  const isCoolingDown = now - lastAttemptAt < RETRY_MS;
  if (!isFresh && !isCoolingDown) {
    inflight ??= refreshCounts().finally(() => {
      inflight = null;
    });
    await inflight;
  }
  return cachedCounts;
}

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
 * legacy URLs from `LEGACY_SLUG_ALIASES`. Cached 5 minutes globally; when
 * PostHog fails or times out, the last good counts keep serving (stale)
 * rather than dropping to 0.
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
