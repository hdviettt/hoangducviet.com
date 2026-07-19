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
      title: `Writing - ${siteTitle}`,
      description: "Archive of all posts and series.",
      alternates: { canonical: "/posts" },
    };
  } catch {
    return { title: "Writing" };
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

  return <div className="pt-12 sm:pt-16 md:pt-20 pb-16 md:pb-20">
      <h1 className="text-[36px] leading-[44px] md:text-[57px] md:leading-[62px] font-medium tracking-tight text-md-on-surface">
        Writing
      </h1>
      <p className="mt-2 md:mt-3 text-[22px] leading-7 md:text-[28px] md:leading-9 font-normal text-md-on-surface-variant max-w-[820px] mb-10 md:mb-14">
        Every post and series, newest first
      </p>
      <FeedBlocks items={items} viewCounts={viewCounts} />
    </div>;
}
