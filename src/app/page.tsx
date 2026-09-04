import SelectedWork from "@/components/home/SelectedWork";
import ProfileHero from "@/components/layout/ProfileHero";
import FeedBlocks from "@/components/posts/FeedBlocks";
import { getGlobalMetadata } from "@/lib/global";
import { IDENTITY } from "@/lib/identity";
import { createEntityGraph } from "@/lib/jsonld";
import { getPostViewCounts } from "@/lib/posthog-server";
import { type FeedItem, getFeedItems } from "@/lib/posts";
import { type Project, getFeaturedProjects } from "@/lib/projects";
import { getProfile } from "@/lib/profile";
import type { Metadata } from "next";

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
  let featuredProjects: Project[] = [];

  try {
    const [profileResult, itemsResult, projectsResult] = await Promise.all([
      getProfile(),
      getFeedItems(),
      getFeaturedProjects(),
    ]);
    profileData = profileResult;
    allItems = itemsResult;
    featuredProjects = projectsResult;
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

  const imageUrl = mainProfile.image || null;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://hoangducviet.com";
  const profileImageUrl = imageUrl
    ? imageUrl.startsWith("http")
      ? imageUrl
      : `${baseUrl}${imageUrl}`
    : undefined;

  const jsonLd = createEntityGraph({ image: profileImageUrl });

  // Distinct years present in the feed, newest first — a small index in the rail.
  const years = Array.from(
    new Set(
      allItems.map((it) =>
        (it.kind === "series" ? it.lastDate : it.post.date_created || "").slice(
          0,
          4,
        ),
      ),
    ),
  )
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a));

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

      {/* Selected work: featured projects, rendered from the projects table. */}
      <div className="mt-14 md:mt-20">
        <SelectedWork projects={featuredProjects} />
      </div>

      {/* Asymmetric two-zone writing index: a sticky rail (heading, standfirst,
          year index) beside the list — fills a wide viewport with structure. */}
      <section className="mt-12 max-w-[1120px] md:mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] lg:gap-x-[64px]">
          <aside className="mb-9 lg:mb-0 lg:sticky lg:top-8 lg:self-start">
            <h2 className="text-[26px] font-medium tracking-[-0.02em] text-md-on-surface">
              Articles
            </h2>
            {years.length > 1 && (
              <div className="mt-7 hidden flex-col gap-2 text-[13px] tabular-nums text-md-on-surface-variant lg:flex">
                {years.map((y, i) => (
                  <span
                    key={y}
                    className={
                      i === 0
                        ? "font-medium text-md-on-surface"
                        : "transition-colors hover:text-md-on-surface"
                    }
                  >
                    {y}
                  </span>
                ))}
              </div>
            )}
          </aside>

          <FeedBlocks items={allItems} viewCounts={viewCounts} />
        </div>
      </section>
    </div>
  );
}
