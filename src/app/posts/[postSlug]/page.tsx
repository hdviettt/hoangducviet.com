import type { Metadata } from "next";
import Link from "next/link";

import InlineTableOfContents from "@/components/posts/InlineTableOfContents";
import MarkdownContent from "@/components/content/MarkdownContent";
import PostNavigation from "@/components/posts/PostNavigation";

import { getGlobalMetadata } from "@/lib/global";
import { getAdjacentPosts, getPostBySlug } from "@/lib/posts";

interface PostParams {
  params: {
    postSlug: string;
  };
}

export async function generateMetadata({
  params,
}: PostParams): Promise<Metadata> {
  try {
    const post = await getPostBySlug(params.postSlug);
    const globalData = await getGlobalMetadata();
    const siteTitle =
      globalData && globalData.length > 0 ? globalData[0].title : "Blog";
    const siteDescription =
      globalData && globalData.length > 0 ? globalData[0].tagline : "";

    const thumbnailUrl = post.thumbnail || null;
    const postUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com"}/posts/${params.postSlug}`;

    return {
      title: `${post.title} | ${siteTitle}`,
      description: post.description || siteDescription,
      openGraph: {
        title: post.title,
        description: post.description || siteDescription,
        url: postUrl,
        siteName: siteTitle,
        type: "article",
        images: thumbnailUrl
          ? [
              {
                url: thumbnailUrl,
                alt: post.title,
              },
            ]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.description || siteDescription,
        images: thumbnailUrl ? [thumbnailUrl] : [],
      },
    };
  } catch (error) {
    return {
      title: "Post",
    };
  }
}

export default async function PostPage({ params }: PostParams) {
  let data: any = null;
  let adjacentPosts = { previous: null as any, next: null as any };

  try {
    [data, adjacentPosts] = await Promise.all([
      getPostBySlug(params.postSlug),
      getAdjacentPosts(params.postSlug),
    ]);
  } catch (error) {
    console.error("Error fetching post:", error);
  }

  if (!data) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <p className="text-muted-foreground">Post not found</p>
      </div>
    );
  }

  return (
    <>
      <div className="py-8 sm:py-12 md:py-16">
        {/* Back button */}
        <Link
          href="/posts"
          className="inline-flex items-center gap-1 text-sm transition-colors mb-8"
          style={{
            color: "var(--article-link)",
            fontFamily:
              "var(--font-inter), system-ui, -apple-system, sans-serif",
          }}
        >
          &larr; All posts
        </Link>

        <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-12 items-start">
          {/* Main Content */}
          <div className="min-w-0">
            {/* Article Header */}
            <header className="mb-10 sm:mb-12">
              <h1
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight tracking-tight"
                style={{
                  fontFamily:
                    "var(--font-inter), system-ui, -apple-system, sans-serif",
                  color: "var(--article-heading)",
                }}
              >
                {data.title}
              </h1>
              <time
                className="text-sm"
                dateTime={data.date_created ?? ""}
                style={{ color: "var(--article-text)" }}
              >
                {data.date_created &&
                  new Date(data.date_created).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
              </time>
            </header>

            {/* Article Content */}
            {data.content ? (
              <div className="article-content">
                <MarkdownContent content={data.content} />
              </div>
            ) : (
              <p className="text-muted-foreground">No content available</p>
            )}
          </div>

          {/* Table of Contents Sidebar */}
          <aside className="hidden lg:block sticky top-24 self-start">
            {data.content && <InlineTableOfContents content={data.content} />}
          </aside>
        </div>

        <PostNavigation
          previous={adjacentPosts.previous}
          next={adjacentPosts.next}
        />
      </div>
    </>
  );
}
