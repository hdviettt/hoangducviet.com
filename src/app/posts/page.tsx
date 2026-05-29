import PostsList from "@/components/posts/PostsList";
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

  return <PostsList items={items} viewCounts={viewCounts} />;
}
