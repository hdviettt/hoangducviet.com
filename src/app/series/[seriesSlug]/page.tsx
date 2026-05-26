import { getSeriesBySlug, getSeriesList } from "@/lib/series";
import { getGlobalMetadata } from "@/lib/global";
import { createBreadcrumbSchema } from "@/lib/jsonld";
import type { Metadata } from "next";
import { Icon } from "@/components/ui/Icon";
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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com";
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
        <div className="text-gray-500">Series not found</div>
      </div>
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com";
  const seriesUrl = `${baseUrl}/series/${params.seriesSlug}`;

  const jsonLd = createBreadcrumbSchema([
    { name: "Home", url: baseUrl },
    { name: seriesItem.title || "", url: seriesUrl },
  ]);

  const isSeries = posts.length >= 2;

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

      {/* M3 series header — overline label + display heading + supporting text */}
      <header className="mb-12 sm:mb-16 md:mb-24">
        <span className="md-label-medium uppercase tracking-widest text-md-on-surface-variant mb-3 block">
          {isSeries ? `series · ${posts.length} parts` : "series"}
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-[57px] md:leading-[64px] font-normal tracking-tight text-md-on-surface mb-6 sm:mb-8">
          {seriesItem.title}
        </h1>

        {seriesItem.summary && (
          <div className="mb-8 max-w-2xl">
            <span className="md-label-medium uppercase tracking-widest text-md-on-surface-variant mb-2 block">
              tl;dr
            </span>
            <p className="md-body-large text-md-on-surface-variant">
              {seriesItem.summary}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <time
            dateTime={seriesItem.date_created ?? ""}
            className="tabular-nums text-muted-foreground/70"
          >
            {seriesItem.date_created &&
              new Date(seriesItem.date_created).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
          </time>

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
      </header>

      {/* Long-form description */}
      {seriesItem.description && (
        <div
          className="article-content mb-20 max-w-2xl"
          dangerouslySetInnerHTML={{ __html: seriesItem.description }}
        />
      )}

      {/* Parts list — naked typographic list */}
      {posts.length > 0 && (
        <section className="mt-12 md:mt-20">
          <h2 className="md-label-medium uppercase tracking-widest text-md-on-surface-variant mb-4 block pb-3 border-b border-md-outline-variant">
            {isSeries ? "all parts" : "posts in this series"}
          </h2>

          <ol>
            {posts.map((post: any, i: number) => {
              const d = post.date_created ? new Date(post.date_created) : null;
              const date = d
                ? d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : "";
              const cleanTitle = (post.title || "").replace(/^.*?#\d+:\s*/, "");

              return (
                <li key={post.slug}>
                  <Link
                    href={`/series/${params.seriesSlug}/${post.slug}`}
                    className="flex items-baseline gap-5 md:gap-6 py-5 md:py-7 group"
                  >
                    {isSeries && (
                      <span className="md-title-medium md:md-title-large tabular-nums text-primary/40 group-hover:text-primary transition-colors w-10 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    )}
                    <span className="flex-1 min-w-0 text-xl md:text-2xl font-medium tracking-tight text-md-on-surface group-hover:text-primary transition-colors">
                      {isSeries ? cleanTitle : post.title}
                    </span>
                    <span className="md-body-small tabular-nums text-md-on-surface-variant shrink-0">
                      {date}
                    </span>
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
