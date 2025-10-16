import { readItem, readItems } from "@directus/sdk";

import { type ItemsQuery, directus } from "@/lib/directus";

export interface Post {
  date_created?: string;
  categories?: Array<number | {
    post_categories_slug: string;
  }>;
  content?: string; // Markdown content
  description?: string; // Short description/excerpt
  thumbnail?: string | {
    filename_disk: string;
    height: number;
    width: number;
  };
  slug?: string;
  title?: string;
  status?: string; // Published status
}

export async function getPosts(options?: ItemsQuery): Promise<Array<Post>> {
  return directus.request(readItems("posts", {
    ...options,
    filter: {
      ...options?.filter,
      status: {
        _eq: "published",
      },
    },
  }));
}

export async function getPostBySlug(
  slug: Post["slug"],
  options?: ItemsQuery,
): Promise<Post> {
  if (!slug) throw new Error("Invalid slug");
  const posts = await directus.request(readItems("posts", {
    ...options,
    filter: {
      ...options?.filter,
      slug: {
        _eq: slug,
      },
      status: {
        _eq: "published",
      },
    },
    limit: 1,
  }));

  if (!posts || posts.length === 0) {
    throw new Error(`Post with slug "${slug}" not found`);
  }

  return posts[0];
}
