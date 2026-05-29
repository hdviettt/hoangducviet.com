import type { Metadata } from "next";
import { redirect } from "next/navigation";

import PostDetail from "@/components/posts/PostDetail";
import { getGlobalMetadata } from "@/lib/global";
import {
  getPostBySlug,
  getPosts,
  getSeriesForPost,
} from "@/lib/posts";

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
    const [post, globalData, seriesAssoc] = await Promise.all([
      getPostBySlug(params.postSlug),
      getGlobalMetadata(),
      getSeriesForPost(params.postSlug),
    ]);
    const siteTitle =
      globalData && globalData.length > 0 ? globalData[0].title : "Blog";
    const siteDescription =
      globalData && globalData.length > 0 ? globalData[0].tagline : "";

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://hoangducviet.com";
    const thumbnailUrl = post.thumbnail
      ? post.thumbnail.startsWith("http")
        ? post.thumbnail
        : `${baseUrl}${post.thumbnail}`
      : null;
    // Series posts have their canonical URL at /series/[s]/[p]; standalone
    // posts at /posts/[p]. The canonical URL flows into all OG/Twitter meta.
    const canonicalPath = seriesAssoc
      ? `/series/${seriesAssoc.slug}/${params.postSlug}`
      : `/posts/${params.postSlug}`;
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

export default async function PostPage({ params }: PostParams) {
  // Series posts live at /series/[seriesSlug]/[postSlug] as their canonical
  // URL. If someone hits /posts/[postSlug] for a series post, redirect.
  const seriesAssoc = await getSeriesForPost(params.postSlug).catch(() => null);
  if (seriesAssoc) {
    redirect(`/series/${seriesAssoc.slug}/${params.postSlug}`);
  }
  return <PostDetail postSlug={params.postSlug} />;
}
