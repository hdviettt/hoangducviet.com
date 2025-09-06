import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getItemById } from "@/lib/directus";
import { getPostBySlug } from "@/lib/posts";
// import { getGlobalMetadata } from "@/lib/directus";

export const runtime = 'edge';

interface PostParams {
  params: {
    postSlug: string;
  }
}

export async function generateMetadata({ params }: PostParams): Promise<Metadata> {
  try {
    const post = await getPostBySlug(params.postSlug, {
      fields: ["title"],
    });
    // const global = await getGlobalMetadata();
    return {
      title: `${post.title}`,
    }
  } catch (error) {
    return {
      title: "Post",
    }
  }
}

export default async function PostPage({ params }: PostParams) {
  let data: any = null;
  let categories: any[] = [];
  let thumbnailUrl: string | null = null;

  try {
    data = await getPostBySlug(params.postSlug, {
      fields: ["title", "body", "date_created", "thumbnail.filename_disk", "thumbnail.height", "thumbnail.width", "categories.post_categories_slug"],
    });

    const categorySlugs = data.categories?.filter((category: any) => typeof category === 'object').map(({ post_categories_slug }: any) => post_categories_slug);

    if (categorySlugs && categorySlugs.length > 0) {
      categories = await Promise.all(categorySlugs.map(async (categorySlug: string) => {
        try {
          return await getItemById('post_categories', categorySlug, { fields: ['title'] });
        } catch {
          return null;
        }
      }));
      categories = categories.filter(Boolean);
    }

    // Get thumbnail URL
    thumbnailUrl = data.thumbnail && typeof data.thumbnail === 'object'
      ? `${process.env.NEXT_PUBLIC_DIRECTUS_API_ENDPOINT}/assets/${data.thumbnail.filename_disk}`
      : null;
  } catch (error) {
    console.error("Error fetching post:", error);
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="text-gray-500">Post not found</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fadeIn">
        {/* Back button */}
        <Link
          href="/posts"
          className="inline-block text-xs text-white hover:bg-white hover:text-black px-2 py-1 mb-8 transition-colors border border-white font-mono uppercase"
        >
          [Back]
        </Link>

        {/* Article Header */}
        <header className="mb-6 md:mb-10 pb-4 md:pb-6 border-b border-border/20">
          <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 text-foreground">{data.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <time dateTime={data.date_created} className="font-mono text-xs">
              {data.date_created &&
                new Date(data.date_created).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
            </time>
            {categories.length > 0 && (
              <>
                <span className="text-white">|</span>
                <div className="flex items-center gap-2">
                  {categories.map(({ title }) => (
                    <span key={title} className="px-2 py-1 bg-black text-white border border-white text-xs font-mono uppercase">
                      {title}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </header>

        {/* Thumbnail Image */}
        {thumbnailUrl && data.thumbnail && typeof data.thumbnail === 'object' && (
          <div className="mb-6 md:mb-10 overflow-hidden border-2 md:border-4 border-white">
            <Image
              src={thumbnailUrl}
              alt={data.title || ''}
              width={data.thumbnail.width || 800}
              height={data.thumbnail.height || 400}
              className="w-full h-auto transition-transform duration-500 hover:scale-105"
              priority
            />
          </div>
        )}

        {/* Article Content */}
        {data.body && (
          <div
            className="prose prose-invert prose-sm md:prose-lg max-w-none 
              prose-headings:font-bold prose-headings:text-foreground prose-headings:mb-6
              prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-a:transition-colors
              prose-strong:text-foreground prose-strong:font-semibold
              prose-code:text-blue-400 prose-code:bg-secondary/50 prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-sm
              prose-pre:bg-secondary/30 prose-pre:border prose-pre:border-border/20 prose-pre:rounded-lg
              prose-blockquote:border-l-4 prose-blockquote:border-blue-400/50 prose-blockquote:pl-6 prose-blockquote:italic
              prose-ul:text-muted-foreground prose-ol:text-muted-foreground
              prose-li:marker:text-blue-400/50 prose-li:mb-2
              prose-hr:border-border/20 prose-hr:my-8"
            dangerouslySetInnerHTML={{ __html: data.body }}
          />
        )}
      </div>
    </div>
  );
}