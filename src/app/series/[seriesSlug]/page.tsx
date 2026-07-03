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
    const seriesUrl = `${baseUrl}/series/${params.seriesSlug}`;
    const description = seriesItem.summary || "";

    return {
      title: `${seriesItem.title} | ${siteTitle}`,
      description,
      alternates: { canonical: `/series/${params.seriesSlug}` },
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
  const seriesUrl = `${baseUrl}/series/${params.seriesSlug}`;

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

  return (
    <div className="pt-12 sm:pt-16 md:pt-24 pb-24 md:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Back — there's only one place to go back to: home */}
      <Link
        href="/"
        className="group inline-flex items-center gap-2 md-label-large text-md-on-surface-variant hover:text-md-on-surface transition-colors mb-10 md:mb-16"
      >
        <Icon
          name="arrow_back"
          size={18}
          className="text-primary/60 group-hover:text-primary transition-colors"
        />
        home
      </Link>

      {/* Flagship hero — overline, display heading, lede summary, primary CTA */}
      <header className="mb-12 sm:mb-16 md:mb-20 max-w-3xl">
        <span className="md-label-medium uppercase tracking-widest text-primary mb-3 block">
          {isSeries ? `series · ${posts.length} parts` : "series"}
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-[56px] md:leading-[64px] font-normal tracking-tight text-md-on-surface">
          {seriesItem.title}
        </h1>

        {seriesItem.summary && (
          <p className="mt-6 text-lg md:text-xl leading-relaxed text-md-on-surface-variant max-w-2xl">
            {seriesItem.summary}
          </p>
        )}

        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          {seriesDate && (
            <time
              dateTime={seriesItem.date_created ?? ""}
              className="tabular-nums text-md-on-surface-variant/70"
            >
              {seriesDate}
            </time>
          )}
          {seriesItem.url && (
            <a
              href={seriesItem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline transition-colors"
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

        {firstPost && (
          <Link
            href={`/posts/${firstPost.slug}`}
            className="mt-8 inline-flex items-center gap-2 h-12 px-6 rounded-full bg-md-primary text-md-on-primary md-label-large hover:shadow-md-1 hover:brightness-105 transition-all duration-200 ease-md-standard"
          >
            {isSeries ? "Start reading — Part 1" : "Start reading"}
            <Icon name="arrow_forward" size={18} />
          </Link>
        )}
      </header>

      {/* Long-form description */}
      {seriesItem.description && (
        <div
          className="article-content mb-16 md:mb-20 max-w-2xl"
          dangerouslySetInnerHTML={{ __html: seriesItem.description }}
        />
      )}

      {/* Parts — a numbered syllabus that reads as one curriculum */}
      {posts.length > 0 && (
        <section className="max-w-2xl">
          <h2 className="md-label-medium uppercase tracking-widest text-md-on-surface-variant mb-2 block pb-3 border-b border-md-outline-variant">
            {isSeries ? "the series" : "posts in this series"}
          </h2>

          <ol className="flex flex-col">
            {posts.map((post: any, i: number) => {
              const d = post.date_created ? new Date(post.date_created) : null;
              const date = d
                ? d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "";
              const cleanTitle = isSeries
                ? stripPartPrefix(post.title)
                : post.title;
              const views = post.slug ? (viewCounts[post.slug] ?? 0) : 0;

              return (
                <li key={post.slug}>
                  <Link
                    href={`/posts/${post.slug}`}
                    className="group grid grid-cols-[2rem_1fr] gap-4 md:gap-6 -mx-3 px-3 py-5 rounded-xl border-b border-md-outline-variant hover:bg-md-surface-container-low transition-colors duration-200 ease-md-standard"
                  >
                    <span className="md-title-medium tabular-nums text-primary/50 group-hover:text-primary transition-colors duration-200 pt-0.5">
                      {isSeries ? String(i + 1).padStart(2, "0") : "→"}
                    </span>
                    <div className="min-w-0">
                      <h3 className="md-title-large font-medium tracking-tight text-md-on-surface group-hover:text-primary transition-colors duration-200">
                        {cleanTitle}
                      </h3>
                      {post.description && (
                        <p className="mt-1.5 md-body-medium text-md-on-surface-variant line-clamp-2">
                          {post.description}
                        </p>
                      )}
                      <div className="mt-2.5 flex items-center gap-3 flex-wrap md-label-small tabular-nums text-md-on-surface-variant/70">
                        {date && <span>{date}</span>}
                        {views > 0 && <ViewCount count={views} />}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </div>
  );
}
