import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getItemById, getGlobalMetadata } from "@/lib/directus";
import { getPostBySlug } from "@/lib/posts";
import TableOfContents from "@/components/TableOfContents";
import MarkdownContent from "@/components/MarkdownContent";

export const runtime = 'edge';

interface PostParams {
  params: {
    postSlug: string;
  }
}

export async function generateMetadata({ params }: PostParams): Promise<Metadata> {
  try {
    const post = await getPostBySlug(params.postSlug, {
      fields: ["title", "description", "thumbnail.filename_disk", "thumbnail.width", "thumbnail.height"],
    });
    const globalData = await getGlobalMetadata();
    const siteTitle = globalData && globalData.length > 0 ? globalData[0].title : "Blog";
    const siteDescription = globalData && globalData.length > 0 ? globalData[0].tagline : "";
    
    // Build thumbnail URL if available
    const thumbnailUrl = post.thumbnail && typeof post.thumbnail === 'object'
      ? `${process.env.NEXT_PUBLIC_DIRECTUS_API_ENDPOINT}/assets/${post.thumbnail.filename_disk}`
      : null;
    
    const postUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/posts/${params.postSlug}`;
    
    return {
      title: `${post.title} | ${siteTitle}`,
      description: post.description || siteDescription,
      openGraph: {
        title: post.title,
        description: post.description || siteDescription,
        url: postUrl,
        siteName: siteTitle,
        type: 'article',
        images: thumbnailUrl ? [{
          url: thumbnailUrl,
          width: typeof post.thumbnail === 'object' ? post.thumbnail.width : 1200,
          height: typeof post.thumbnail === 'object' ? post.thumbnail.height : 630,
          alt: post.title,
        }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.description || siteDescription,
        images: thumbnailUrl ? [thumbnailUrl] : [],
      },
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
      fields: ["title", "content", "description", "date_created", "status", "thumbnail.filename_disk", "thumbnail.height", "thumbnail.width", "categories.post_categories_slug"],
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
      <div className="max-w-4xl mx-auto px-8 md:px-16 lg:px-24 py-8 md:py-12 pb-20 md:pb-16 animate-fadeIn">
        <div className="flex gap-10">
          {/* Main Content */}
          <div className="flex-1 max-w-2xl mx-auto">
            {/* Back button */}
            <Link
              href="/posts"
              className="inline-block text-xs text-primary-foreground px-3 py-1.5 mb-8 transition-all border border-border rounded-md bg-primary hover:bg-primary/90 font-medium"
            >
              ← Back
            </Link>

            {/* Article Header */}
            <header className="mb-8 pb-6 border-b border-border">
              <h1 className="text-xl md:text-2xl font-semibold mb-4 text-foreground">{data.title}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <time dateTime={data.date_created} className="text-[11px] bg-muted/30 px-2 py-1 rounded-md border border-border text-muted-foreground">
                  {data.date_created &&
                    new Date(data.date_created).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                </time>
                {categories.length > 0 && (
                  <div className="flex items-center gap-2">
                    {categories.map(({ title }) => (
                      <span key={title} className="px-2 py-1 bg-primary text-primary-foreground border border-border text-[11px] rounded-md">
                        {title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </header>

            {/* Thumbnail Image */}
            {thumbnailUrl && data.thumbnail && typeof data.thumbnail === 'object' && (
              <div className="mb-8 overflow-hidden border border-border rounded-lg">
                <Image
                  src={thumbnailUrl}
                  alt={data.title || ''}
                  width={data.thumbnail.width || 800}
                  height={data.thumbnail.height || 400}
                  className="w-full h-auto"
                  priority
                />
              </div>
            )}

            {/* Article Content */}
            {data.content && (
              <div
                className="article-content prose prose-base max-w-none
                  prose-headings:font-semibold prose-headings:text-foreground prose-headings:mb-4 prose-headings:mt-8
                  prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                  prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-4 prose-p:text-sm
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:transition-colors
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:bg-muted/20 prose-blockquote:py-2 prose-blockquote:my-4 prose-blockquote:text-sm
                  prose-ul:text-foreground prose-ul:text-sm prose-ul:mb-4 prose-ol:text-foreground prose-ol:text-sm prose-ol:mb-4
                  prose-li:marker:text-primary prose-li:mb-1
                  prose-hr:border-border prose-hr:border prose-hr:my-6
                  prose-img:border prose-img:border-border prose-img:rounded-lg"
              >
                <MarkdownContent content={data.content} />
              </div>
            )}
          </div>

          {/* Table of Contents Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <TableOfContents />
          </aside>
        </div>
      </div>
    </div>
  );
}