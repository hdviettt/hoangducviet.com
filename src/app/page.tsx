import SeriesBlock from "@/components/posts/SeriesBlock";
import { ViewCount } from "@/components/posts/ViewCount";
import { Icon } from "@/components/ui/Icon";
import { getGlobalMetadata } from "@/lib/global";
import { IDENTITY } from "@/lib/identity";
import { createEntityGraph } from "@/lib/jsonld";
import { getPostViewCounts } from "@/lib/posthog-server";
import { type FeedItem, getFeedItems } from "@/lib/posts";
import { getProfile } from "@/lib/profile";
import ProfileHero from "@/components/layout/ProfileHero";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const [global, profileData] = await Promise.all([
      getGlobalMetadata(),
      getProfile(),
    ]);
    const siteTitle =
      global && global.length > 0 ? global[0].title : "Hoang Duc Viet";
    const siteTagline =
      global && global.length > 0
        ? global[0].tagline
        : "Hoang Duc Viet's personal blog";
    const profileImage = profileData?.[0]?.image || null;
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://hoangducviet.com";
    const imageUrl = profileImage
      ? profileImage.startsWith("http")
        ? profileImage
        : `${baseUrl}${profileImage}`
      : null;

    return {
      title: siteTitle,
      description: siteTagline,
      alternates: { canonical: "/" },
      openGraph: {
        title: siteTitle,
        description: siteTagline || "",
        url: baseUrl,
        siteName: siteTitle,
        // This page IS the person's home, so it advertises as a profile rather
        // than a generic website — reinforces the ProfilePage/Person graph.
        type: "profile",
        firstName: IDENTITY.givenName,
        lastName: IDENTITY.familyName,
        username: IDENTITY.username,
        images: imageUrl ? [{ url: imageUrl, alt: siteTitle || "" }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: siteTitle,
        description: siteTagline || "",
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch {
    return { title: "Hoang Duc Viet" };
  }
}

function itemDate(item: FeedItem): string {
  return item.kind === "series" ? item.lastDate : item.post.date_created || "";
}

function groupByYear(
  items: FeedItem[],
): Array<{ year: number; items: FeedItem[] }> {
  const yearMap = new Map<number, FeedItem[]>();
  const yearOrder: number[] = [];
  for (const item of items) {
    const iso = itemDate(item);
    const year = iso ? new Date(iso).getFullYear() : 0;
    if (!yearMap.has(year)) {
      yearMap.set(year, []);
      yearOrder.push(year);
    }
    yearMap.get(year)!.push(item);
  }
  return yearOrder.map((year) => ({ year, items: yearMap.get(year)! }));
}

export default async function Home() {
  let profileData: any[] = [];
  let allItems: FeedItem[] = [];

  try {
    const [profileResult, itemsResult] = await Promise.all([
      getProfile(),
      getFeedItems(),
    ]);
    profileData = profileResult;
    allItems = itemsResult;
  } catch (error) {
    console.error("Error fetching data:", error);
    return (
      <div className="py-12">
        <p className="text-muted-foreground text-sm">
          Couldn't load this. Try a refresh.
        </p>
      </div>
    );
  }

  if (profileData.length === 0) {
    return (
      <div className="py-12">
        <p className="text-muted-foreground text-sm">Nothing here yet.</p>
      </div>
    );
  }

  const itemsByYear = groupByYear(allItems);
  const mainProfile = profileData[0];

  // Collect every slug rendered on the homepage so we can fetch all view
  // counts in a single PostHog round-trip (cached 5 min in posthog-server).
  const allSlugs: string[] = [];
  for (const item of allItems) {
    if (item.kind === "post") {
      if (item.post.slug) allSlugs.push(item.post.slug);
    } else {
      for (const part of item.parts) allSlugs.push(part.slug);
    }
  }
  const viewCounts = await getPostViewCounts(allSlugs);
  const seriesViewTotal = (item: Extract<FeedItem, { kind: "series" }>) =>
    item.parts.reduce((sum, p) => sum + (viewCounts[p.slug] ?? 0), 0);

  const imageUrl = mainProfile.image || null;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://hoangducviet.com";
  const profileImageUrl = imageUrl
    ? imageUrl.startsWith("http")
      ? imageUrl
      : `${baseUrl}${imageUrl}`
    : undefined;

  const jsonLd = createEntityGraph({ image: profileImageUrl });

  return (
    <div className="pb-16 md:pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ProfileHero
        name={mainProfile.name}
        description={mainProfile.description}
        imageUrl={imageUrl}
      />

      {/* Writing — M3 card grid, year-grouped. Each post/series renders as
          an outlined card with hover elevation (blog.google pattern). 2-col
          on desktop, single column on mobile. */}
      {itemsByYear.length > 0 && (
        <div className="space-y-14 md:space-y-20">
          {itemsByYear.map(({ year, items }) => (
            <section key={year}>
              <h2 className="text-2xl md:text-[28px] md:leading-9 font-medium tracking-tight text-md-on-surface mb-6 md:mb-8">
                {year}
              </h2>

              <div className="grid gap-4 md:gap-5 md:grid-cols-2">
                {items.map((item) => {
                  if (item.kind === "series") {
                    return (
                      <SeriesBlock
                        key={`series-${item.series.slug}`}
                        series={item.series}
                        parts={item.parts}
                        firstDate={item.firstDate}
                        lastDate={item.lastDate}
                        viewCount={seriesViewTotal(item)}
                      />
                    );
                  }
                  const date = item.post.date_created
                    ? new Date(item.post.date_created).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" },
                      )
                    : "";
                  const views = item.post.slug
                    ? (viewCounts[item.post.slug] ?? 0)
                    : 0;
                  return (
                    <Link
                      key={item.post.slug}
                      href={`/posts/${item.post.slug}`}
                      className="group flex flex-col p-6 rounded-2xl border border-md-outline-variant bg-md-surface-container-low hover:bg-md-surface-container hover:shadow-md-1 transition-all duration-200 ease-md-standard"
                    >
                      <div className="flex flex-col flex-1">
                        {/* Meta row */}
                        <div className="flex items-center gap-3 flex-wrap mb-3">
                          <span className="md-label-small tabular-nums text-md-on-surface-variant">
                            {date}
                          </span>
                          {views > 0 && (
                            <span className="md-label-small text-md-on-surface-variant">
                              <ViewCount count={views} />
                            </span>
                          )}
                        </div>
                        <h3 className="md-title-large md:text-2xl md:leading-8 font-medium tracking-tight text-md-on-surface group-hover:text-primary transition-colors duration-200">
                          {item.post.title}
                        </h3>
                        {item.post.description && (
                          <p className="mt-3 md-body-medium text-md-on-surface-variant">
                            {item.post.description}
                          </p>
                        )}
                        <span className="mt-auto pt-5 inline-flex items-center gap-1 md-label-medium text-md-on-surface-variant group-hover:text-primary transition-colors duration-200">
                          Read post
                          <Icon
                            name="arrow_forward"
                            size={16}
                            className="transition-transform duration-200 group-hover:translate-x-0.5"
                          />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
