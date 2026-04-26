import type { Metadata } from "next";
import Link from "next/link";

import InlineTableOfContents from "@/components/posts/InlineTableOfContents";
import MarkdownContent from "@/components/content/MarkdownContent";
import PostNavigation from "@/components/posts/PostNavigation";
import SeriesHeader from "@/components/posts/SeriesHeader";
import SeriesParts from "@/components/posts/SeriesParts";

import { getGlobalMetadata } from "@/lib/global";
import {
  getAdjacentPosts,
  getPostBySlug,
  getPosts,
  getProjectForPost,
  getSeriesContext,
} from "@/lib/posts";
import { createBlogPostingSchema, createBreadcrumbSchema } from "@/lib/jsonld";

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
  let series: Awaited<ReturnType<typeof getSeriesContext>> = null;

  try {
    [data, adjacentPosts, project, series] = await Promise.all([
      getPostBySlug(params.postSlug),
      getAdjacentPosts(params.postSlug),
      getProjectForPost(params.postSlug), // returns null on error
      getSeriesContext(params.postSlug),
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
      <article className="pt-12 sm:pt-16 md:pt-24 pb-24">
        {/* Back button — bracketed nav chip, slightly more present than a bare link */}
        <Link
          href="/posts"
          className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-10 md:mb-16"
        >
          <span className="text-primary/60 group-hover:text-primary transition-colors">
            ←
          </span>
          all writing
        </Link>

        <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-12 items-start">
          {/* Main Content */}
          <div className="min-w-0">
            {/* Article Header — deck-label + display title pattern */}
            <header className="mb-14 sm:mb-16 md:mb-20">
              {series && (
                <SeriesHeader
                  project={series.project}
                  partNumber={series.partNumber}
                  total={series.total}
                />
              )}
              {!series && project && (
                <Link
                  href={`/projects/${project.slug}`}
                  className="deck-label hover:text-primary transition-colors"
                >
                  {project.title}
                </Link>
              )}
              <h1
                className="deck-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-7 md:mb-10"
                style={{ color: "var(--article-heading)" }}
              >
                {data.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground/70">
                <time
                  className="tabular-nums"
                  dateTime={data.date_created ?? ""}
                >
                  {data.date_created &&
                    new Date(data.date_created).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                </time>
                {data.content && (
                  <>
                    <span className="opacity-50">·</span>
                    <span className="tabular-nums">
                      {readingTimeMinutes(data.content)} min read
                    </span>
                  </>
                )}
              </div>
            </header>

            {/* TL;DR — bordered block treatment so it reads as distinct
                from the article body. Border-left in the brand indigo, no
                background (keeps it clean against the page bg), with the
                "tl;dr" deck-label making the role explicit. */}
            {data.description && (
              <div className="mb-10 md:mb-14 max-w-2xl border-l-2 border-primary/30 pl-5 sm:pl-6 py-1">
                <span className="deck-label">tl;dr</span>
                <p className="text-base sm:text-lg text-foreground/80 leading-relaxed">
                  {data.description}
                </p>
              </div>
            )}

            {/* Article Content */}
            {data.content ? (
              <div className="article-content">
                <MarkdownContent content={data.content} />
              </div>
            ) : (
              <p className="text-muted-foreground">No content available</p>
            )}
          </div>

          {/* TOC + Series sidebar */}
          <aside className="hidden lg:block sticky top-24 self-start">
            {data.content && <InlineTableOfContents content={data.content} />}
            {series && (
              <SeriesParts
                project={series.project}
                parts={series.parts}
                currentSlug={params.postSlug}
              />
            )}
          </aside>
        </div>

        <PostNavigation
          previous={series ? series.previous : adjacentPosts.previous}
          next={series ? series.next : adjacentPosts.next}
          context={
            series
              ? { kind: "series", title: series.project.title }
              : undefined
          }
        />
      </article>
    </>
  );
}

// ~200 wpm typical adult reading speed. Strip markdown image and code-fence
// markers so they don't inflate the count. Round up so 30s reads still show 1.
function readingTimeMinutes(markdown: string): number {
  const stripped = markdown
    .replace(/```[\s\S]*?```/g, " ") // fenced code blocks
    .replace(/`[^`]*`/g, " ") // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links → keep visible text
    .replace(/[#*_>~`-]/g, " ");
  const words = stripped.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
