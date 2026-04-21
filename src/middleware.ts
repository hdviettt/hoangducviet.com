import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const POST_PATH = /^\/posts\/([^/]+)\/?$/;

function wantsMarkdown(request: NextRequest): boolean {
  const accept = request.headers.get("accept") ?? "";
  return accept.toLowerCase().includes("text/markdown");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get("admin_session")?.value;
    if (!token || token !== process.env.SESSION_SECRET) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  const postMatch = pathname.match(POST_PATH);
  if (postMatch && wantsMarkdown(request)) {
    const url = request.nextUrl.clone();
    url.pathname = `/posts/${postMatch[1]}/md`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/posts/:slug"],
};
