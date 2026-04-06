import type { Metadata } from "next";
import Link from "next/link";

import InlineTableOfContents from "@/components/posts/InlineTableOfContents";
import MarkdownContent from "@/components/content/MarkdownContent";
import PostNavigation from "@/components/posts/PostNavigation";

import { getGlobalMetadata } from "@/lib/global";
import { getAdjacentPosts, getPostBySlug, getPosts, getProjectForPost } from "@/lib/posts";
import { createBlogPostingSchema, createBreadcrumbSchema } from "@/lib/jsonld";

export async function generateStaticParams() {
  try {
    const allPosts = await getPosts();
    return allPosts.map((post) => ({ postSlug: post.slug! }));
  } catch {
    return [];
  }
}

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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com";
    const thumbnailUrl = post.thumbnail
      ? post.thumbnail.startsWith("http") ? post.thumbnail : `${baseUrl}${post.thumbnail}`
      : null;
    const postUrl = `${baseUrl}/posts/${params.postSlug}`;

    return {
      title: `${post.title} | ${siteTitle}`,
      description: post.description || siteDescription,
      alternates: { canonical: `/posts/${params.postSlug}` },
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
  let project: { slug: string; title: string } | null = null;

  try {
    [data, adjacentPosts, project] = await Promise.all([
      getPostBySlug(params.postSlug),
      getAdjacentPosts(params.postSlug),
      getProjectForPost(params.postSlug), // returns null on error
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

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com";
  const postUrl = `${baseUrl}/posts/${params.postSlug}`;
  const thumbnailUrl = data.thumbnail
    ? data.thumbnail.startsWith("http")
      ? data.thumbnail
      : `${baseUrl}${data.thumbnail}`
    : undefined;

  const jsonLd = [
    createBlogPostingSchema({
      title: data.title || "",
      description: data.description || "",
      url: postUrl,
      datePublished: data.date_created || "",
      dateModified: data.date_updated || data.date_created || "",
      image: thumbnailUrl,
      authorName: "Hoang Duc Viet",
      authorUrl: baseUrl,
    }),
    createBreadcrumbSchema([
      { name: "Home", url: baseUrl },
      { name: "Posts", url: `${baseUrl}/posts` },
      { name: data.title || "", url: postUrl },
    ]),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="py-8 sm:py-12 md:py-16">
        {/* Back button */}
        <Link
          href="/posts"
          className="inline-flex items-center gap-1 text-sm transition-colors mb-8"
          style={{ color: "var(--article-link)" }}
        >
          &larr; All posts
        </Link>

        <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-12 items-start">
          {/* Main Content */}
          <div className="min-w-0">
            {/* Article Header */}
            <header className="mb-10 sm:mb-12">
              <h1
                className="text-3xl sm:text-4xl md:text-[2.75rem] font-normal mb-4 leading-normal"
                style={{ color: "var(--article-heading)" }}
              >
                {data.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
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
                {project && (
                  <Link
                    href={`/projects/${project.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <span className="text-primary/60">#</span>
                    {project.title}
                  </Link>
                )}
              </div>
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
      </article>
    </>
  );
}
