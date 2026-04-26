import { getSeriesBySlug, getSeriesList } from "@/lib/series";
import { getGlobalMetadata } from "@/lib/global";
import { createBreadcrumbSchema } from "@/lib/jsonld";
import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
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
        className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-10 md:mb-16"
      >
        <span className="text-primary/60 group-hover:text-primary transition-colors">
          ←
        </span>
        home
      </Link>

      {/* Series Header — deck-label + display title */}
      <header className="mb-12 sm:mb-16 md:mb-28">
        <span className="deck-label">
          {isSeries ? `series · ${posts.length} parts` : "series"}
        </span>
        <h1 className="deck-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 sm:mb-8 md:mb-10">
          {seriesItem.title}
        </h1>

        {seriesItem.summary && (
          <div className="mb-8 max-w-2xl">
            <span className="deck-label">tl;dr</span>
            <p className="text-base sm:text-lg text-foreground/80 leading-relaxed">
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
              <ExternalLink className="w-3.5 h-3.5" />
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
          <h2 className="deck-label">
            {isSeries ? "all parts" : "posts in this series"}
          </h2>

          <ol className="divide-y divide-border/50">
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
                      <span className="text-base md:text-lg tabular-nums font-semibold text-primary/40 group-hover:text-primary transition-colors w-10 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    )}
                    <span className="flex-1 min-w-0 text-xl md:text-2xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {isSeries ? cleanTitle : post.title}
                    </span>
                    <span className="text-xs md:text-sm tabular-nums text-muted-foreground/60 shrink-0">
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
