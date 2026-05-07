import { cookies } from "next/headers";

export const ANON_COOKIE = "pb_anon";

/**
 * Reads the anonymous visitor id from the `pb_anon` cookie.
 * Middleware guarantees the cookie is set before any page or route handler runs.
 * Returns `null` only if called from a context outside the middleware matcher
 * (e.g. an API route that wasn't included in the matcher) — callers should
 * treat `null` as "this visitor cannot be identified".
 */
export function getAnonId(): string | null {
  return cookies().get(ANON_COOKIE)?.value ?? null;
}
