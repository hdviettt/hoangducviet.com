import { feedRowDate } from "@/components/posts/FeedRow";
import { ViewCount } from "@/components/posts/ViewCount";
import { Icon } from "@/components/ui/Icon";
import { getGlobalMetadata } from "@/lib/global";
import { createBreadcrumbSchema, createSeriesSchema } from "@/lib/jsonld";
import { getPostViewCounts } from "@/lib/posthog-server";
import { getSeriesBySlug, getSeriesList } from "@/lib/series";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  try {
    const allSeries = await getSeriesList();
    return allSeries.map((s) => ({ seriesSlug: s.slug }));
  } catch {
    return [];
  }
}

interface SeriesParams {
  params: {
    seriesSlug: string;
  };
}

// Strip a "… #4: " part prefix so the clean topic reads on its own.
function stripPartPrefix(title: string): string {
  return (title || "").replace(/^.*?#\d+:\s*/, "");
}

export async function generateMetadata({
  params,
}: SeriesParams): Promise<Metadata> {
  try {
    const [seriesItem, globalData] = await Promise.all([
      getSeriesBySlug(params.seriesSlug),
      getGlobalMetadata(),
    ]);
    const siteTitle =
      globalData && globalData.length > 0 ? globalData[0].title : "Blog";
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://hoangducviet.com";
    const thumbnailUrl = seriesItem.thumbnail
      ? seriesItem.thumbnail.startsWith("http")
        ? seriesItem.thumbnail
        : `${baseUrl}${seriesItem.thumbnail}`
      : null;
    const seriesUrl = `${baseUrl}/collection/${params.seriesSlug}`;
    const description = seriesItem.summary || "";

    return {
      title: `${seriesItem.title} | ${siteTitle}`,
      description,
      alternates: { canonical: `/collection/${params.seriesSlug}` },
      openGraph: {
        title: seriesItem.title,
        description,
        url: seriesUrl,
        siteName: siteTitle,
        type: "website",
        images: thumbnailUrl
          ? [{ url: thumbnailUrl, alt: seriesItem.title }]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: seriesItem.title,
        description,
        images: thumbnailUrl ? [thumbnailUrl] : [],
      },
    };
  } catch (_error) {
    return {
      title: "Series",
    };
  }
}

export default async function SeriesPage({ params }: SeriesParams) {
  let seriesItem: any = null;
  let posts: any[] = [];

  try {
    seriesItem = await getSeriesBySlug(params.seriesSlug);
    posts = seriesItem.posts ?? [];
  } catch (error) {
    console.error("Error fetching series:", error);
  }

  if (!seriesItem) {
    return (
      <div className="p-8">
        <div className="text-md-on-surface-variant">
          This series doesn't exist.
        </div>
      </div>
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://hoangducviet.com";
  const seriesUrl = `${baseUrl}/collection/${params.seriesSlug}`;

  // One cached PostHog round-trip for every post in the series.
  const viewCounts = await getPostViewCounts(
    posts.map((p: any) => p.slug).filter(Boolean),
  );

  const isSeries = posts.length >= 2;
  const firstPost = posts[0];
  const seriesDate = seriesItem.date_created
    ? new Date(seriesItem.date_created).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const jsonLd: object[] = [
    createBreadcrumbSchema([
      { name: "Home", url: baseUrl },
      { name: seriesItem.title || "", url: seriesUrl },
    ]),
  ];
  if (posts.length > 0) {
    jsonLd.push(
      createSeriesSchema({
        title: seriesItem.title || "",
        url: seriesUrl,
        description: seriesItem.summary || undefined,
        image: seriesItem.thumbnail
          ? seriesItem.thumbnail.startsWith("http")
            ? seriesItem.thumbnail
            : `${baseUrl}${seriesItem.thumbnail}`
          : undefined,
        parts: posts.map((p: any) => ({
          title: (isSeries ? stripPartPrefix(p.title) : p.title) || "",
          url: `${baseUrl}/posts/${p.slug}`,
          datePublished: p.date_created || undefined,
        })),
      }),
    );
  }

  const totalViews = posts.reduce(
    (sum: number, p: any) => sum + (p.slug ? (viewCounts[p.slug] ?? 0) : 0),
    0,
  );
  return (
    <div className="pt-12 sm:pt-16 md:pt-20 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Same anatomy as the feed's series block: meta line, display title,
          summary, then the cover. */}
      <header className="mb-10 md:mb-14">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] leading-5 text-md-on-surface-variant">
          <span className="font-medium text-primary">Collection</span>
          {isSeries && <span>{posts.length} parts</span>}
          {seriesDate && (
            <time
              className="tabular-nums"
              dateTime={seriesItem.date_created ?? ""}
            >
              {seriesDate}
            </time>
          )}
          {totalViews > 0 && <ViewCount count={totalViews} />}
        </div>

        <h1 className="mt-3 text-[36px] leading-[44px] md:text-[57px] md:leading-[62px] font-medium tracking-tight text-md-on-surface">
          {seriesItem.title}
        </h1>

        {seriesItem.summary && (
          <p className="mt-4 text-[18px] leading-[30px] text-md-on-surface-variant max-w-[760px]">
            {seriesItem.summary}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 text-[15px] leading-5 font-medium">
          {firstPost && (
            <Link
              href={`/posts/${firstPost.slug}`}
              className="group inline-flex items-center gap-1.5 text-md-on-surface hover:text-primary transition-colors duration-200 ease-md-standard"
            >
              {isSeries ? "Start reading, part 1" : "Start reading"}
              <Icon
                name="arrow_forward"
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          )}
          {seriesItem.url && (
            <a
              href={seriesItem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-md-on-surface-variant hover:text-primary transition-colors"
            >
              {(() => {
                try {
                  return new URL(seriesItem.url).hostname;
                } catch {
                  return seriesItem.url;
                }
              })()}
              <Icon name="open_in_new" size={14} />
            </a>
          )}
        </div>
      </header>

      {seriesItem.description && (
        <div
          className="article-content mx-auto max-w-[720px] mb-16 md:mb-20"
          dangerouslySetInnerHTML={{ __html: seriesItem.description }}
        />
      )}

      {/* Parts carry the same card anatomy as the feed: full description, one
          hairline per card, cover on the right, image on top below sm. */}
      {posts.length > 0 && (
        <section>
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-md-on-surface-variant pb-4 border-b border-md-outline-variant">
            {isSeries ? "The series" : "Posts in this series"}
          </h2>
          <div className="[&>a]:border-b [&>a]:border-md-outline-variant">
            {posts.map((post: any, i: number) => {
              const cleanTitle = isSeries
                ? stripPartPrefix(post.title)
                : post.title;
              const views = post.slug ? (viewCounts[post.slug] ?? 0) : 0;
              return (
                <Link
                  key={post.slug}
                  href={`/posts/${post.slug}`}
                  className="group flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-8 py-8 md:py-10"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[22px] leading-7 md:text-[28px] md:leading-9 font-medium tracking-tight text-md-on-surface group-hover:text-primary transition-colors duration-200 ease-md-standard">
                      {cleanTitle}
                    </h3>
                    {post.description && (
                      <p className="mt-3 text-[16px] leading-[26px] text-md-on-surface-variant">
                        {post.description}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] leading-5 text-md-on-surface-variant">
                      {isSeries && (
                        <span className="tabular-nums">Part {i + 1}</span>
                      )}
                      <span className="tabular-nums">
                        {feedRowDate(post.date_created)}
                      </span>
                      {views > 0 && <ViewCount count={views} />}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
