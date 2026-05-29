import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const CONTENT_NEGOTIATED = /^\/(posts|projects)\/([^/]+)\/?$/;
const SITE_LINK_PATHS = new Set(["/", "/posts", "/projects"]);
const ANON_COOKIE = "pb_anon";
const ANON_MAX_AGE = 365 * 24 * 60 * 60;

function wantsMarkdown(request: NextRequest): boolean {
  const accept = request.headers.get("accept") ?? "";
  return accept.toLowerCase().includes("text/markdown");
}

// Map a public content URL to the route that renders its markdown. Returns
// null for paths with no markdown representation (or that are already
// markdown). This is what powers `Accept: text/markdown` content negotiation:
// agents get markdown at the canonical URL, browsers keep HTML.
function markdownTarget(pathname: string): string | null {
  if (pathname.endsWith("/md") || pathname.endsWith(".md")) return null;
  if (pathname === "/") return "/llms.txt";

  let m = pathname.match(/^\/(posts|projects)\/([^/]+)\/?$/);
  if (m) return `/${m[1]}/${m[2]}/md`;

  // Series landing → the series markdown. (Series posts live at /posts/[slug];
  // legacy /series/[s]/[p] URLs 308-redirect there.)
  m = pathname.match(/^\/series\/([^/]+)\/?$/);
  if (m) return `/series/${m[1]}/md`;

  return null;
}

function absoluteUrl(request: NextRequest, path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? request.nextUrl.origin;
  return `${base}${path}`;
}

function siteLinks(request: NextRequest): Array<string> {
  return [
    `<${absoluteUrl(request, "/llms.txt")}>; rel="describedby"`,
    `<${absoluteUrl(request, "/sitemap.xml")}>; rel="sitemap"`,
    `<${absoluteUrl(request, "/feed.xml")}>; rel="alternate"; type="application/rss+xml"`,
  ];
}

function ensureAnonCookie(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  const existing = request.cookies.get(ANON_COOKIE)?.value;
  if (existing) return response;

  const fresh = crypto.randomUUID();
  // Mutate the request so handlers in THIS same request see the cookie.
  request.cookies.set(ANON_COOKIE, fresh);
  // Persist to the browser for subsequent requests.
  response.cookies.set(ANON_COOKIE, fresh, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: ANON_MAX_AGE,
    path: "/",
  });
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get("admin_session")?.value;
    if (!token || token !== process.env.SESSION_SECRET) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return ensureAnonCookie(request, NextResponse.next());
  }

  // Legacy nested series-post URLs (/series/[s]/[p]) now live at /posts/[p].
  // 308-redirect them to preserve SEO. Exclude /series/[s]/md (series markdown).
  const legacyPost = pathname.match(/^\/series\/[^/]+\/([^/]+)\/?$/);
  if (legacyPost && legacyPost[1] !== "md") {
    return NextResponse.redirect(
      new URL(`/posts/${legacyPost[1]}`, request.url),
      308,
    );
  }

  // Markdown for Agents: serve the markdown rendition of the same URL when
  // the client asks for `text/markdown`. HTML stays the default for browsers.
  const mdTarget = markdownTarget(pathname);
  if (mdTarget && wantsMarkdown(request)) {
    const url = request.nextUrl.clone();
    url.pathname = mdTarget;
    const rewrite = NextResponse.rewrite(url);
    rewrite.headers.set("Vary", "Accept");
    return ensureAnonCookie(request, rewrite);
  }

  const contentMatch = pathname.match(CONTENT_NEGOTIATED);
  if (contentMatch) {
    const [, collection, slug] = contentMatch;
    const response = NextResponse.next();
    const canonical = absoluteUrl(request, `/${collection}/${slug}`);
    const markdown = absoluteUrl(request, `/${collection}/${slug}/md`);
    response.headers.set(
      "Link",
      [
        `<${canonical}>; rel="canonical"`,
        `<${markdown}>; rel="alternate"; type="text/markdown"`,
        ...siteLinks(request),
      ].join(", "),
    );
    response.headers.set("Vary", "Accept");
    return ensureAnonCookie(request, response);
  }

  if (SITE_LINK_PATHS.has(pathname)) {
    const response = NextResponse.next();
    response.headers.set("Link", siteLinks(request).join(", "));
    response.headers.set("Vary", "Accept");
    return ensureAnonCookie(request, response);
  }

  return ensureAnonCookie(request, NextResponse.next());
}

export const config = {
  matcher: [
    "/",
    "/posts",
    "/projects",
    "/admin/:path*",
    "/posts/:path*",
    "/projects/:path*",
    "/series/:path*",
    "/api/posts/:path*",
  ],
};
