import Link from "next/link";

import MarkdownContent from "@/components/content/MarkdownContent";
import { LikeButton } from "@/components/posts/LikeButton";
import PostNavigation from "@/components/posts/PostNavigation";
import SeriesParts from "@/components/posts/SeriesParts";
import { ViewCount } from "@/components/posts/ViewCount";

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
        <p className="text-muted-foreground">This post doesn't exist.</p>
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

  // deepmind.google opens articles with a bold centered standfirst. Our posts
  // already carry one as a leading "## TL;DR ... ---" block, so lift it out of
  // the prose and let the description fill in for older posts without one.
  const { standfirst, body } = splitStandfirst(
    data.content || "",
    data.description,
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="pt-12 sm:pt-16 md:pt-20 pb-24">
        {/* deepmind.google article anatomy: centered meta → display title →
            byline → full-width rounded hero → centered standfirst → prose. */}
        <header className="mx-auto max-w-[880px] text-center mb-10 md:mb-14">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[14px] leading-5 text-md-on-surface-variant mb-5 md:mb-7">
            <time className="tabular-nums" dateTime={data.date_created ?? ""}>
              {data.date_created &&
                new Date(data.date_created).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
            </time>
            {seriesCtx && (
              <Link
                href={`/series/${seriesCtx.series.slug}`}
                className="hover:text-primary transition-colors"
              >
                {seriesCtx.series.title} · Part {seriesCtx.partNumber} of{" "}
                {seriesCtx.total}
              </Link>
            )}
            {!seriesCtx && seriesAssoc && (
              <Link
                href={`/series/${seriesAssoc.slug}`}
                className="hover:text-primary transition-colors"
              >
                {seriesAssoc.title}
              </Link>
            )}
            {data.content && (
              <span className="tabular-nums">
                {readingTimeMinutes(data.content)} min read
              </span>
            )}
            {viewCount > 0 && <ViewCount count={viewCount} />}
          </div>
          <h1
            className="text-[34px] leading-[1.12] sm:text-[44px] md:text-[54px] md:leading-[1.08] font-medium tracking-tight"
            style={{ color: "var(--article-heading)" }}
          >
            {data.title}
          </h1>
          <p className="mt-5 md:mt-7 text-[16px] leading-6 text-md-on-surface-variant">
            Hoang Duc Viet
          </p>
        </header>

        {thumbnailUrl && (
          <div className="mx-auto max-w-[1360px] mb-12 md:mb-16 overflow-hidden rounded-[var(--md-sys-shape-corner-large-increased)] bg-md-surface-container">
            {/* biome-ignore lint/a11y/useAltText: cover image, title precedes it */}
            <img
              src={thumbnailUrl}
              alt=""
              decoding="async"
              className="w-full h-auto"
            />
          </div>
        )}

        {standfirst && (
          <div className="standfirst mx-auto max-w-[720px] text-center mb-12 md:mb-16">
            <MarkdownContent content={standfirst} />
          </div>
        )}

        <div className="mx-auto max-w-[720px] min-w-0">
          {body ? (
            <div className="article-content">
              <MarkdownContent content={body} />
            </div>
          ) : (
            <p className="text-muted-foreground">No content here yet.</p>
          )}

          <div className="my-16 md:my-20">
            <LikeButton
              slug={postSlug}
              initialLiked={likeState.liked}
              initialCount={likeState.count}
            />
          </div>

          {seriesCtx && (
            <div className="mb-16">
              <SeriesParts
                series={seriesCtx.series}
                parts={seriesCtx.parts}
                currentSlug={postSlug}
              />
            </div>
          )}
        </div>

        <div className="mx-auto max-w-[880px]">
          <PostNavigation
            previous={navPrev ? { ...navPrev, href: prevHref } : null}
            next={navNext ? { ...navNext, href: nextHref } : null}
            context={navContext}
          />
        </div>
      </article>
    </>
  );
}

// Lift a leading "## TL;DR ... ---" block out of the markdown so it can render
// as the centered standfirst. Falls back to the meta description when a post
// has no TL;DR block; body stays untouched in that case.
function splitStandfirst(
  markdown: string,
  description?: string | null,
): { standfirst: string | null; body: string } {
  const m = markdown.match(/^\s*##\s*TL;DR\s*\r?\n+([\s\S]*?)\r?\n+---\s*\r?\n/);
  if (m) {
    return { standfirst: m[1].trim(), body: markdown.slice(m[0].length) };
  }
  return { standfirst: description?.trim() || null, body: markdown };
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
