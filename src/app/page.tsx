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
      process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com";
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com";
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

      {/* Hero — tight composition. Deck vibe via the faded label + bold
          name, but sized so the post list lands in the first viewport on
          short laptops. */}
      <section className="pt-8 sm:pt-10 md:pt-12 pb-10 md:pb-12">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 max-w-3xl">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={mainProfile.name || "Profile"}
              width={160}
              height={160}
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover shrink-0 rounded-full animate-in fade-in zoom-in-95 duration-500 fill-mode-backwards"
              priority
            />
          )}
          <div className="flex-1 min-w-0">
            <span className="md-label-medium uppercase tracking-widest text-md-on-surface-variant mb-2 block animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100 fill-mode-backwards">
              personal blog
            </span>
            {mainProfile?.name && (
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight mb-4 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-200 fill-mode-backwards">
                {mainProfile.name}
              </h1>
            )}
            {mainProfile?.description && (
              <div
                className="text-sm sm:text-base text-foreground/75 leading-relaxed [&_a]:text-primary [&_a]:no-underline [&_a:hover]:underline [&_p]:mb-4 [&_p:last-child]:mb-0 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-300 fill-mode-backwards"
                dangerouslySetInnerHTML={{ __html: mainProfile.description }}
              />
            )}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-400 fill-mode-backwards">
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
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={label}
                >
                  <Brand className="w-5 h-5" />
                </a>
              ))}
              <span className="w-px h-4 bg-border" />
              <a
                href="mailto:viethd2704@gmail.com"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Icon name="mail" size={18} />
                <span>viethd2704@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Writing — single chronological list, year-grouped. Series collapse
          to a SeriesBlock with parts visible inline; standalone posts render
          as flat rows. */}
      {itemsByYear.length > 0 && (
        <div className="space-y-12 sm:space-y-16">
          {itemsByYear.map(({ year, items }) => (
            <section key={year}>
              <h2 className="md-label-large uppercase tracking-widest text-md-on-surface-variant mb-4 md:mb-6 pb-3 border-b border-md-outline-variant">
                {year}
              </h2>

              <ul className="[&>li]:py-1 first:[&>li]:pt-0 last:[&>li]:pb-0">
                {items.map((item) => {
                  if (item.kind === "series") {
                    return (
                      <li key={`series-${item.series.slug}`}>
                        <SeriesBlock
                          series={item.series}
                          parts={item.parts}
                          firstDate={item.firstDate}
                          lastDate={item.lastDate}
                          viewCount={seriesViewTotal(item)}
                        />
                      </li>
                    );
                  }
                  const date = item.post.date_created
                    ? new Date(item.post.date_created).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" },
                      )
                    : "";
                  const views = item.post.slug
                    ? (viewCounts[item.post.slug] ?? 0)
                    : 0;
                  return (
                    <li key={item.post.slug}>
                      <Link
                        href={`/posts/${item.post.slug}`}
                        className="block py-5 md:py-6 group"
                      >
                        {/* Meta row — date + view count above the title,
                            mirroring SeriesBlock's compact header. */}
                        <div className="flex items-center gap-3 flex-wrap mb-3">
                          <span className="text-xs text-muted-foreground/60 tabular-nums">
                            {date}
                          </span>
                          {views > 0 && (
                            <span className="text-xs text-muted-foreground/60">
                              <ViewCount count={views} />
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl md:text-2xl font-medium tracking-tight text-md-on-surface group-hover:text-primary transition-colors duration-200">
                          {item.post.title}
                        </h3>
                        {item.post.description && (
                          <p className="mt-2 text-sm text-md-on-surface-variant leading-relaxed max-w-2xl">
                            {item.post.description}
                          </p>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
