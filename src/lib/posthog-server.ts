import { unstable_cache } from "next/cache";

const POSTHOG_API_HOST =
  process.env.POSTHOG_API_HOST ?? "https://us.posthog.com";
const PROJECT_ID = process.env.POSTHOG_PROJECT_ID;
const API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;

async function queryViewCount(slug: string): Promise<number> {
  if (!PROJECT_ID || !API_KEY) return 0;

  const query = `
    SELECT count() AS c
    FROM events
    WHERE event = '$pageview'
      AND (
        properties.$pathname = concat('/posts/', {slug:String})
        OR properties.$pathname LIKE concat('/series/%/', {slug:String})
      )
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
        body: JSON.stringify({
          query: {
            kind: "HogQLQuery",
            query,
            values: { slug },
          },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(2000),
      },
    );

    if (!res.ok) return 0;
    const data = (await res.json()) as { results?: Array<Array<number>> };
    return data?.results?.[0]?.[0] ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Returns the PostHog `$pageview` count for a post slug, matching both
 * `/posts/<slug>` and `/series/<series>/<slug>` URLs.
 *
 * Cached for 5 minutes per slug. Fails silently to 0 on PostHog errors,
 * missing env vars, or timeouts — never throws.
 */
export async function getPostViewCount(slug: string): Promise<number> {
  return unstable_cache(
    async () => queryViewCount(slug),
    ["post-views", slug],
    { revalidate: 300, tags: [`views:${slug}`] },
  )();
}
