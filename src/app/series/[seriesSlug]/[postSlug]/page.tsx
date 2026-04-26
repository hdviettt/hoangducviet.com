import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PostDetail from "@/components/posts/PostDetail";
import { getGlobalMetadata } from "@/lib/global";
import { getPostBySlug, getSeriesForPost } from "@/lib/posts";

export const dynamic = "force-dynamic";

interface SeriesPostParams {
  params: { seriesSlug: string; postSlug: string };
}

export async function generateMetadata({
  params,
}: SeriesPostParams): Promise<Metadata> {
  try {
    const [post, globalData] = await Promise.all([
      getPostBySlug(params.postSlug),
      getGlobalMetadata(),
    ]);
    const siteTitle =
      globalData && globalData.length > 0 ? globalData[0].title : "Blog";
    const siteDescription =
      globalData && globalData.length > 0 ? globalData[0].tagline : "";

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com";
    const thumbnailUrl = post.thumbnail
      ? post.thumbnail.startsWith("http")
        ? post.thumbnail
        : `${baseUrl}${post.thumbnail}`
      : null;
    const canonicalPath = `/series/${params.seriesSlug}/${params.postSlug}`;
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
        images: thumbnailUrl
          ? [{ url: thumbnailUrl, alt: post.title }]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.description || siteDescription,
        images: thumbnailUrl ? [thumbnailUrl] : [],
      },
    };
  } catch (_error) {
    return { title: "Post" };
  }
}

export default async function SeriesPostPage({ params }: SeriesPostParams) {
  // Verify the post actually belongs to the series in the URL. If the slug
  // exists but in a different series (or none), the URL is wrong → 404.
  const seriesAssoc = await getSeriesForPost(params.postSlug).catch(() => null);
  if (!seriesAssoc || seriesAssoc.slug !== params.seriesSlug) {
    notFound();
  }
  return <PostDetail postSlug={params.postSlug} />;
}
