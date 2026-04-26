import type { Metadata } from "next";
import PostsList from "@/components/posts/PostsList";
import { getGlobalMetadata } from "@/lib/global";
import { type FeedItem, getFeedItems } from "@/lib/posts";

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

  return <PostsList items={items} />;
}
