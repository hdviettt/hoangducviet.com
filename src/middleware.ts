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

  const contentMatch = pathname.match(CONTENT_NEGOTIATED);
  if (contentMatch) {
    const [, collection, slug] = contentMatch;

    if (wantsMarkdown(request)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${collection}/${slug}/md`;
      return ensureAnonCookie(request, NextResponse.rewrite(url));
    }

    const response = NextResponse.next();
    const canonical = absoluteUrl(request, `/${collection}/${slug}`);
    const markdown = absoluteUrl(request, `/${collection}/${slug}/md`);
    const links = [
      `<${canonical}>; rel="canonical"`,
      `<${markdown}>; rel="alternate"; type="text/markdown"`,
      ...siteLinks(request),
    ];
    response.headers.set("Link", links.join(", "));
    return ensureAnonCookie(request, response);
  }

  if (SITE_LINK_PATHS.has(pathname)) {
    const response = NextResponse.next();
    response.headers.set("Link", siteLinks(request).join(", "));
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
    "/posts/:slug",
    "/projects/:slug",
    "/series/:path*",
    "/api/posts/:path*",
  ],
};
