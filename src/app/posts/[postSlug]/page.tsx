import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getItemById, getGlobalMetadata } from "@/lib/directus";
import { getPostBySlug } from "@/lib/posts";
import InlineTableOfContents from "@/components/InlineTableOfContents";
import MarkdownContent from "@/components/MarkdownContent";
import ReadingProgress from "@/components/ReadingProgress";

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
      <ReadingProgress />
      <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-8 md:py-12 pb-20 md:pb-16 animate-fadeIn">
        {/* Back button */}
        <Link
          href="/posts"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-all duration-200 hover:-translate-x-1 mb-8"
        >
          <span>←</span>
          <span>Back to articles</span>
        </Link>

        <div className="flex gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="flex-1 min-w-0">

            {/* Article Header */}
            <header className="mb-12 pb-8 border-b border-border scroll-fade-in">
              <h1 className="text-3xl font-semibold mb-4 text-foreground">{data.title}</h1>
              <div className="flex flex-wrap items-center gap-3">
                <time dateTime={data.date_created} className="text-sm text-muted-foreground">
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
                      <span key={title} className="text-sm text-muted-foreground">
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
            {data.content ? (
              <div className="article-content">
                <MarkdownContent content={data.content} />
              </div>
            ) : (
              <div className="text-muted-foreground">No content available</div>
            )}
          </div>

          {/* Table of Contents Sidebar - Desktop Only */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            {data.content && <InlineTableOfContents content={data.content} />}
          </aside>
        </div>
      </div>
    </div>
  );
}