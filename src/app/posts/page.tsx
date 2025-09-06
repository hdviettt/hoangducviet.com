import type { Metadata } from "next";
import { getPosts } from "@/lib/posts";
import { getItemById } from "@/lib/directus";
import PostsList from "@/components/PostsList";

export const metadata: Metadata = {
  title: "Articles - VIET",
  description: "All blog posts and articles",
};

export default async function PostsPage() {
  let posts: any[] = [];
  let categories: string[] = [];
  
  try {
    // Fetch posts with categories expanded
    posts = await getPosts({
      limit: 100,
      fields: ["slug", "title", "date_created", "categories.post_categories_slug.title"],
    });

    // Extract and process categories from posts
    const categoriesSet = new Set<string>();
    
    for (const post of posts) {
      if (post.categories && Array.isArray(post.categories)) {
        // Transform categories to the expected format
        const processedCategories = [];
        for (const cat of post.categories) {
          if (typeof cat === 'object' && cat.post_categories_slug) {
            // Fetch the actual category data
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
        post.categories = processedCategories;
      }
    }
    
    categories = Array.from(categoriesSet).sort();
  } catch (error) {
    console.error("Error fetching posts:", error);
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <PostsList posts={posts} categories={categories} />
    </div>
  );
}