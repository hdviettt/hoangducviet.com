import FeedRow, { feedRowDate } from "@/components/posts/FeedRow";
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

  const mainProfile = profileData[0];

  // deepmind.google editorial split: the newest post is featured large on the
  // left; everything else renders as compact hairline rows on the right.
  const featuredIndex = allItems.findIndex((i) => i.kind === "post");
  const featured =
    featuredIndex >= 0
      ? (allItems[featuredIndex] as Extract<FeedItem, { kind: "post" }>)
      : null;
  const restItems = allItems.filter((_, idx) => idx !== featuredIndex);

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
        stats={[
          {
            // Blueprint roster size — told in the artifact-driven post.
            value: "55",
            label: "AI agents mapped on one operating blueprint",
            href: "/posts/an-artifact-driven-ai-initiative-blueprint",
          },
          {
            // Production count — update as the platform grows.
            value: "19",
            label: "agents running in production at SEONGON",
            href: "/posts/an-artifact-driven-ai-initiative-blueprint",
          },
          {
            value: String(allSlugs.length),
            label: "essays on search, agents, and honest failures",
            href: "/posts",
          },
        ]}
      />

      {/* Writing — deepmind.google news layout: display-size section header,
          newest post featured large on the left, the rest as hairline rows. */}
      <section className="mt-4 md:mt-8">
        <h2 className="text-[36px] leading-[44px] md:text-[57px] md:leading-[62px] font-normal tracking-tight text-md-on-surface">
          Writing
        </h2>
        <p className="mt-2 md:mt-3 text-[22px] leading-7 md:text-[28px] md:leading-9 font-normal text-md-on-surface-variant max-w-[820px]">
          Search engines, AI agents, and honest write-ups from a real AI
          initiative
        </p>

        <div className="mt-10 md:mt-16 lg:grid lg:grid-cols-[7fr_6fr] lg:gap-16 xl:gap-20 items-start">
          {/* Featured — newest post */}
          {featured && (
            <Link
              href={`/posts/${featured.post.slug}`}
              className="group block mb-12 lg:mb-0"
            >
              <h3 className="text-[28px] leading-9 md:text-[42px] md:leading-[48px] font-normal tracking-tight text-md-on-surface group-hover:text-primary transition-colors duration-200 ease-md-standard">
                {featured.post.title}
              </h3>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] leading-5 text-md-on-surface-variant">
                <span className="tabular-nums">
                  {feedRowDate(featured.post.date_created)}
                </span>
                {(viewCounts[featured.post.slug ?? ""] ?? 0) > 0 && (
                  <ViewCount count={viewCounts[featured.post.slug ?? ""] ?? 0} />
                )}
                <span className="inline-flex items-center gap-1.5 text-md-on-surface font-medium">
                  Read post
                  <Icon
                    name="arrow_forward"
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </span>
              </div>
              {featured.post.thumbnail && (
                <div className="mt-6 overflow-hidden rounded-[var(--md-sys-shape-corner-large-increased)] bg-md-surface-container">
                  {/* biome-ignore lint/a11y/useAltText: decorative cover, title is adjacent */}
                  <img
                    src={featured.post.thumbnail}
                    alt=""
                    loading="eager"
                    decoding="async"
                    className="w-full h-auto transition-transform duration-300 ease-md-standard group-hover:scale-[1.02]"
                  />
                </div>
              )}
            </Link>
          )}

          {/* Rows — everything else, hairline separated */}
          <div className="divide-y divide-md-outline-variant border-t border-b border-md-outline-variant lg:border-t-0 lg:[&>a:first-child]:pt-0">
            {restItems.map((item) => (
              <FeedRow
                key={
                  item.kind === "series"
                    ? `series-${item.series.slug}`
                    : item.post.slug
                }
                item={item}
                views={
                  item.kind === "series"
                    ? seriesViewTotal(item)
                    : (viewCounts[item.post.slug ?? ""] ?? 0)
                }
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
