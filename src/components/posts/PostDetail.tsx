import Link from "next/link";

import MarkdownContent from "@/components/content/MarkdownContent";
import InlineTableOfContents from "@/components/posts/InlineTableOfContents";
import { LikeButton } from "@/components/posts/LikeButton";
import PostNavigation from "@/components/posts/PostNavigation";
import SeriesHeader from "@/components/posts/SeriesHeader";
import SeriesParts from "@/components/posts/SeriesParts";
import { ViewCount } from "@/components/posts/ViewCount";
import { Icon } from "@/components/ui/Icon";

import { getAnonId } from "@/lib/anon";
import { createBlogPostingSchema, createBreadcrumbSchema } from "@/lib/jsonld";
import { getLikeState } from "@/lib/likes";
import { getPostViewCount } from "@/lib/posthog-server";
import {
  getAdjacentPosts,
  getPostBySlug,
  getSeriesContext,
  getSeriesForPost,
} from "@/lib/posts";

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

  const anonId = getAnonId();
  const [likeState, viewCount] = await Promise.all([
    getLikeState(data.id, anonId),
    getPostViewCount(postSlug),
  ]);

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://hoangducviet.com";
  const postUrl = `${baseUrl}/posts/${postSlug}`;
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
  const prevHref = navPrev ? `/posts/${navPrev.slug}` : null;
  const nextHref = navNext ? `/posts/${navNext.slug}` : null;

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
          className="group inline-flex items-center gap-2 md-label-large text-md-on-surface-variant hover:text-md-on-surface transition-colors duration-200 ease-md-standard mb-10 md:mb-16"
        >
          <Icon
            name="arrow_back"
            size={18}
            className="text-primary/60 group-hover:text-primary transition-colors"
          />
          Home
        </Link>

        {thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={data.title || ""}
            className="w-full max-h-[440px] object-cover rounded-2xl mb-10 md:mb-14 ring-1 ring-md-outline-variant"
          />
        )}

        <div className="lg:grid lg:grid-cols-[200px_minmax(0,720px)] xl:grid-cols-[220px_minmax(0,720px)] lg:gap-16 xl:gap-24 items-start">
          {/* TOC + Series sidebar — left rail, sticky */}
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

          {/* Main Content */}
          <div className="min-w-0">
            {/* Article Header — deck-label + display title pattern */}
            <header className="mb-8 sm:mb-10 md:mb-12">
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
                  className="md-label-medium uppercase tracking-widest text-md-on-surface-variant hover:text-primary transition-colors duration-200 ease-md-standard block mb-3"
                >
                  {seriesAssoc.title}
                </Link>
              )}
              <h1
                className="text-3xl sm:text-[36px] sm:leading-[44px] md:text-[44px] md:leading-[52px] font-normal tracking-tight mb-6 md:mb-8"
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
                <ViewCount count={viewCount} rightAligned />
              </div>
            </header>

            {/* TL;DR — M3 tonal callout card (primary-container tint) */}
            {data.description && (
              <aside
                aria-label="Summary"
                className="mb-12 md:mb-16 max-w-2xl rounded-2xl bg-md-primary-container/40 border border-md-primary-container p-6 md:p-7"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="bolt" size={18} filled className="text-primary" />
                  <span className="md-label-medium uppercase tracking-widest text-md-on-primary-container">
                    TL;DR
                  </span>
                </div>
                <p className="md-body-large text-md-on-surface">
                  {data.description}
                </p>
              </aside>
            )}

            {/* Article Content */}
            {data.content ? (
              <div className="article-content">
                <MarkdownContent content={data.content} />
              </div>
            ) : (
              <p className="text-muted-foreground">No content available</p>
            )}

            <div className="my-16 md:my-20">
              <LikeButton
                slug={postSlug}
                initialLiked={likeState.liked}
                initialCount={likeState.count}
              />
            </div>
          </div>
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
