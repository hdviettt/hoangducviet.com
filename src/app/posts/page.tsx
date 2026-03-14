import PostsList from "@/components/posts/PostsList";
import { getPosts } from "@/lib/posts";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Articles",
  description: "All blog posts and articles",
};

export default async function PostsPage() {
  let posts: any[] = [];
  let categories: string[] = [];

  try {
    posts = await getPosts({ withCategories: true });

    // Extract unique category titles
    const categoriesSet = new Set<string>();
    for (const post of posts) {
      if (post.categories && Array.isArray(post.categories)) {
        for (const cat of post.categories) {
          if (cat.title) {
            categoriesSet.add(cat.title);
          }
        }
      }
    }
    categories = Array.from(categoriesSet).sort();
  } catch (error) {
    console.error("Error fetching posts:", error);
    posts = [];
    categories = [];
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <PostsList posts={posts} categories={categories} />
    </div>
  );
}
