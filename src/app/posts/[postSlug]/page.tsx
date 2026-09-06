import type { Metadata } from "next";
import { cookies } from "next/headers";

import PostDetail from "@/components/posts/PostDetail";
import { getGlobalMetadata } from "@/lib/global";
import { socialImages } from "@/lib/og";
import { getPostBySlug, getPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

// A logged-in admin previewing a draft carries the same session cookie the
// middleware checks for /admin. Verifying it server-side is what keeps drafts
// from leaking to anyone who guesses `?preview=1`.
function isAdminRequest(): boolean {
  const secret = process.env.SESSION_SECRET;
  return Boolean(secret) && cookies().get("admin_session")?.value === secret;
}

export async function generateStaticParams() {
  try {
    const allPosts = await getPosts();
    return allPosts.map((post) => ({ postSlug: post.slug! }));
  } catch {
    return [];
  }
}

interface PostParams {
  params: { postSlug: string };
  searchParams?: { preview?: string };
}

export async function generateMetadata({
  params,
  searchParams,
}: PostParams): Promise<Metadata> {
  // A preview is a private, unpublished view — never let it be indexed.
  if (searchParams?.preview === "1") {
    return { title: "Preview", robots: { index: false, follow: false } };
  }
  try {
    const [post, globalData] = await Promise.all([
      getPostBySlug(params.postSlug),
      getGlobalMetadata(),
    ]);
    const siteTitle =
      globalData && globalData.length > 0 ? globalData[0].title : "Blog";
    const siteDescription =
      globalData && globalData.length > 0 ? globalData[0].tagline : "";

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://hoangducviet.com";
    // Covers are SVG, which social crawlers refuse to render. Share the PNG
    // twin from /og/ instead so the card is not blank.
    const ogImages = socialImages(
      post.thumbnail,
      baseUrl,
      post.title || "",
      post.slug,
    );
    // Every post canonicalizes at /posts/[slug]. Series membership no longer
    // creates a nested URL — the series page simply links here.
    const canonicalPath = `/posts/${params.postSlug}`;
    const postUrl = `${baseUrl}${canonicalPath}`;

    return {
      title: `${post.title} | ${siteTitle}`,
      description: post.description || siteDescription,
      alternates: { canonical: canonicalPath },
      openGraph: {
        title: post.title,
        description: post.description || siteDescription,
        url: postUrl,
        siteName: siteTitle,
        type: "article",
        images: ogImages,
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.description || siteDescription,
        images: ogImages.map((i) => i.url),
      },
    };
  } catch (_error) {
    return { title: "Post" };
  }
}

export default function PostPage({ params, searchParams }: PostParams) {
  const preview = searchParams?.preview === "1" && isAdminRequest();
  return <PostDetail postSlug={params.postSlug} preview={preview} />;
}
