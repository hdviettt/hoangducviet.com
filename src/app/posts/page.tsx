import FeedBlocks from "@/components/posts/FeedBlocks";
import { getGlobalMetadata } from "@/lib/global";
import { getPostViewCounts } from "@/lib/posthog-server";
import { type FeedItem, getFeedItems } from "@/lib/posts";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const global = await getGlobalMetadata();
    const siteTitle =
      global && global.length > 0 ? global[0].title : "Hoang Duc Viet";
    return {
      title: `Articles - ${siteTitle}`,
      description: "Archive of all posts and series.",
      alternates: { canonical: "/posts" },
    };
  } catch {
    return { title: "Articles" };
  }
}

export default async function PostsPage() {
  let items: FeedItem[] = [];

  try {
    items = await getFeedItems();
  } catch (error) {
    console.error("Error fetching posts:", error);
  }

  // Same single cached PostHog round-trip the homepage uses, so the archive
  // shows the same view counts.
  const slugs: string[] = [];
  for (const item of items) {
    if (item.kind === "post") {
      if (item.post.slug) slugs.push(item.post.slug);
    } else {
      for (const part of item.parts) slugs.push(part.slug);
    }
  }
  const viewCounts = await getPostViewCounts(slugs);

  // Distinct years present in the feed, newest first — mirrors the homepage rail.
  const years = Array.from(
    new Set(
      items.map((it) =>
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
    <section className="max-w-[1120px] pb-16 pt-12 sm:pt-16 md:pb-20 md:pt-20">
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] lg:gap-x-[64px]">
        <aside className="mb-9 lg:mb-0 lg:sticky lg:top-8 lg:self-start">
          <h1 className="text-[26px] font-medium tracking-[-0.02em] text-md-on-surface">
            Articles
          </h1>
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

        <FeedBlocks items={items} viewCounts={viewCounts} />
      </div>
    </section>
  );
}
