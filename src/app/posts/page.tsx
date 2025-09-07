import type { Metadata } from "next";
import { getPosts } from "@/lib/posts";
import { getItemById } from "@/lib/directus";
import PostsList from "@/components/PostsList";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Articles",
  description: "All blog posts and articles",
};

export default async function PostsPage() {
  let posts: any[] = [];
  let categories: string[] = [];

  try {
    // Fetch posts with categories expanded through the junction table
    posts = await getPosts({
      limit: 100,
      fields: ["*", "categories.post_categories_slug.*"],
    });

    // Extract and process categories from posts
    const categoriesSet = new Set<string>();

    for (const post of posts) {
      if (post.categories && Array.isArray(post.categories)) {
        // Transform categories to the expected format
        const processedCategories = [];
        for (const cat of post.categories) {
          if (typeof cat === 'object' && cat.post_categories_slug) {
            // The category data is already expanded
            if (typeof cat.post_categories_slug === 'object' && cat.post_categories_slug.title) {
              processedCategories.push({ title: cat.post_categories_slug.title });
              categoriesSet.add(cat.post_categories_slug.title);
            } else if (typeof cat.post_categories_slug === 'string') {
              // If not expanded, fetch it
              try {
                const categoryData = await getItemById('post_categories', cat.post_categories_slug, {
                  fields: ['title']
                });
                if (categoryData && categoryData.title) {
                  processedCategories.push({ title: categoryData.title });
                  categoriesSet.add(categoryData.title);
                }
              } catch (e) {
                console.error("Error fetching category:", e);
              }
            }
          }
        }
        post.categories = processedCategories;
      }
    }

    categories = Array.from(categoriesSet).sort();
  } catch (error) {
    console.error("Error fetching posts:", error);
    // Return empty state on error
    posts = [];
    categories = [];
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <PostsList posts={posts} categories={categories} />
    </div>
  );
}