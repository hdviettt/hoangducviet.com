import PostsList from "@/components/posts/PostsList";
import { type FeedItem, getFeedItems } from "@/lib/posts";
import { getGlobalMetadata } from "@/lib/global";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const global = await getGlobalMetadata();
    const siteTitle =
      global && global.length > 0 ? global[0].title : "Blog";
    return {
      title: `Posts - ${siteTitle}`,
      description: "All blog posts and articles",
      alternates: { canonical: "/posts" },
    };
  } catch {
    return { title: "Posts" };
  }
}

export default async function PostsPage() {
  let items: FeedItem[] = [];

  try {
    items = await getFeedItems();
  } catch (error) {
    console.error("Error fetching posts:", error);
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <PostsList items={items} />
    </div>
  );
}
