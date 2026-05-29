import SeriesBlock from "@/components/posts/SeriesBlock";
import { ViewCount } from "@/components/posts/ViewCount";
import { getGlobalMetadata } from "@/lib/global";
import { createPersonSchema, createWebSiteSchema } from "@/lib/jsonld";
import { getPostViewCounts } from "@/lib/posthog-server";
import { type FeedItem, getFeedItems } from "@/lib/posts";
import { getProfile } from "@/lib/profile";
import { Icon } from "@/components/ui/Icon";
// Brand marks aren't in Material Symbols — keep lucide for these four only.
import { Facebook, Github, Instagram, Linkedin } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
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
        type: "website",
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
        <p className="text-muted-foreground text-sm">Unable to load content.</p>
      </div>
    );
  }

  if (profileData.length === 0) {
    return (
      <div className="py-12">
        <p className="text-muted-foreground text-sm">No content available.</p>
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://hoangducviet.com";
  const profileImageUrl = imageUrl
    ? imageUrl.startsWith("http")
      ? imageUrl
      : `${baseUrl}${imageUrl}`
    : undefined;

  const jsonLd = [
    createWebSiteSchema({
      name: mainProfile.name || "Hoang Duc Viet",
      description: "Personal blog",
      url: baseUrl,
    }),
    createPersonSchema({
      name: mainProfile.name || "Hoang Duc Viet",
      url: baseUrl,
      image: profileImageUrl,
      sameAs: [
        "https://github.com/hdviettt",
        "https://www.facebook.com/hoangducviettt/",
        "https://www.instagram.com/_hdviet/",
        "https://www.linkedin.com/in/hdviet/",
      ],
    }),
  ];

  return (
    <div className="pb-16 md:pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero — Google "Featured author" pattern: vertical stack, big
          circular photo, light-weight large name, supporting role line,
          narrow bio column, socials at the bottom. */}
      <section className="pt-10 sm:pt-14 md:pt-20 pb-12 md:pb-16">
        <div className="max-w-[560px]">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={mainProfile.name || "Profile"}
              width={320}
              height={320}
              className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 object-cover rounded-full mb-6 md:mb-8 ring-1 ring-md-outline-variant animate-in fade-in zoom-in-95 duration-500 fill-mode-backwards"
              priority
            />
          )}
          {mainProfile?.name && (
            <h1 className="text-4xl sm:text-5xl md:text-[48px] md:leading-[56px] font-normal tracking-tight text-md-on-surface mb-3 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100 fill-mode-backwards">
              {mainProfile.name}
            </h1>
          )}
          {mainProfile?.description && (
            <div
              className="text-md-on-surface-variant [&_a]:text-primary [&_a]:no-underline [&_a:hover]:underline [&_p]:mb-4 [&_p:last-child]:mb-0 [&_p:first-child]:text-lg [&_p:first-child]:leading-7 [&_p:first-child]:text-md-on-surface [&_p:first-child]:mb-6 [&_p:not(:first-child)]:text-[15px] [&_p:not(:first-child)]:leading-6 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-200 fill-mode-backwards"
              dangerouslySetInnerHTML={{ __html: mainProfile.description }}
            />
          )}
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300 fill-mode-backwards">
            {[
              {
                href: "https://github.com/hdviettt",
                icon: Github,
                label: "GitHub",
              },
              {
                href: "https://www.facebook.com/hoangducviettt/",
                icon: Facebook,
                label: "Facebook",
              },
              {
                href: "https://www.instagram.com/_hdviet/",
                icon: Instagram,
                label: "Instagram",
              },
              {
                href: "https://www.linkedin.com/in/hdviet/",
                icon: Linkedin,
                label: "LinkedIn",
              },
            ].map(({ href, icon: Brand, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-md-on-surface-variant hover:text-primary transition-colors duration-200 ease-md-standard"
                aria-label={label}
              >
                <Brand className="w-5 h-5" />
              </a>
            ))}
            <span className="w-px h-4 bg-md-outline-variant" />
            <a
              href="mailto:viethd2704@gmail.com"
              className="inline-flex items-center gap-1.5 md-body-medium text-md-on-surface-variant hover:text-primary transition-colors duration-200 ease-md-standard"
            >
              <Icon name="mail" size={18} />
              <span>viethd2704@gmail.com</span>
            </a>
          </div>
        </div>
      </section>

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
                        <p className="mt-3 md-body-medium text-md-on-surface-variant line-clamp-3">
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
