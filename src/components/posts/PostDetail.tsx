import Link from "next/link";

import InlineTableOfContents from "@/components/posts/InlineTableOfContents";
import MarkdownContent from "@/components/content/MarkdownContent";
import PostNavigation from "@/components/posts/PostNavigation";
import SeriesHeader from "@/components/posts/SeriesHeader";
import SeriesParts from "@/components/posts/SeriesParts";

import {
  getAdjacentPosts,
  getPostBySlug,
  getSeriesContext,
  getSeriesForPost,
} from "@/lib/posts";
import { createBlogPostingSchema, createBreadcrumbSchema } from "@/lib/jsonld";

interface PostDetailProps {
  postSlug: string;
}

// Shared post-detail rendering used by both /posts/[postSlug] (standalone
// posts) and /series/[seriesSlug]/[postSlug] (series posts). The page-level
// route is responsible for resolving the right URL and redirect/notFound;
// this component just renders the post, its TL;DR, and series-aware nav.
export default async function PostDetail({ postSlug }: PostDetailProps) {
  let data: any = null;
  let adjacentPosts = { previous: null as any, next: null as any };
  let seriesAssoc: { slug: string; title: string } | null = null;
  let seriesCtx: Awaited<ReturnType<typeof getSeriesContext>> = null;

  try {
    [data, adjacentPosts, seriesAssoc, seriesCtx] = await Promise.all([
      getPostBySlug(postSlug),
      getAdjacentPosts(postSlug),
      getSeriesForPost(postSlug),
      getSeriesContext(postSlug),
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
  const postUrl = seriesCtx
    ? `${baseUrl}/series/${seriesCtx.series.slug}/${postSlug}`
    : `${baseUrl}/posts/${postSlug}`;
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
      { name: data.title || "", url: postUrl },
    ]),
  ];

  // Build prev/next URLs. For series posts, prev/next stay inside the series
  // (nested URL); for standalone posts, they're chronologically adjacent
  // standalone posts at /posts/[slug].
  const navContext = seriesCtx
    ? { kind: "series" as const, title: seriesCtx.series.title }
    : undefined;
  const navPrev = seriesCtx ? seriesCtx.previous : adjacentPosts.previous;
  const navNext = seriesCtx ? seriesCtx.next : adjacentPosts.next;
  const prevHref = navPrev
    ? seriesCtx
      ? `/series/${seriesCtx.series.slug}/${navPrev.slug}`
      : `/posts/${navPrev.slug}`
    : null;
  const nextHref = navNext
    ? seriesCtx
      ? `/series/${seriesCtx.series.slug}/${navNext.slug}`
      : `/posts/${navNext.slug}`
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="pt-12 sm:pt-16 md:pt-24 pb-24">
        {/* Back button — there's only one place to go back to: home */}
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-10 md:mb-16"
        >
          <span className="text-primary/60 group-hover:text-primary transition-colors">
            ←
          </span>
          home
        </Link>

        <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-12 items-start">
          {/* Main Content */}
          <div className="min-w-0">
            {/* Article Header — deck-label + display title pattern */}
            <header className="mb-14 sm:mb-16 md:mb-20">
              {seriesCtx && (
                <SeriesHeader
                  series={seriesCtx.series}
                  partNumber={seriesCtx.partNumber}
                  total={seriesCtx.total}
                />
              )}
              {!seriesCtx && seriesAssoc && (
                <Link
                  href={`/series/${seriesAssoc.slug}`}
                  className="deck-label hover:text-primary transition-colors"
                >
                  {seriesAssoc.title}
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

            {/* TL;DR — sits at the top of the article so readers can decide
                whether to commit. */}
            {data.description && (
              <div className="mb-10 md:mb-14 max-w-2xl">
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
            {seriesCtx && (
              <SeriesParts
                series={seriesCtx.series}
                parts={seriesCtx.parts}
                currentSlug={postSlug}
              />
            )}
          </aside>
        </div>

        <PostNavigation
          previous={navPrev ? { ...navPrev, href: prevHref } : null}
          next={navNext ? { ...navNext, href: nextHref } : null}
          context={navContext}
        />
      </article>
    </>
  );
}

// ~200 wpm typical adult reading speed. Strip markdown image and code-fence
// markers so they don't inflate the count. Round up so 30s reads still show 1.
function readingTimeMinutes(markdown: string): number {
  const stripped = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#*_>~`-]/g, " ");
  const words = stripped.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
