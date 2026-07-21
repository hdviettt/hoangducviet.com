import type { Metadata } from "next";

import PostDetail from "@/components/posts/PostDetail";
import { getGlobalMetadata } from "@/lib/global";
import { getPostBySlug, getPosts } from "@/lib/posts";
import { socialImages } from "@/lib/og";

export const dynamic = "force-dynamic";

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
}

export async function generateMetadata({
  params,
}: PostParams): Promise<Metadata> {
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
    const ogImages = socialImages(post.thumbnail, baseUrl, post.title || "");
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

export default function PostPage({ params }: PostParams) {
  return <PostDetail postSlug={params.postSlug} />;
}
