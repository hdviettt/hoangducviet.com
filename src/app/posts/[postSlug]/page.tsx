import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getItemById, getGlobalMetadata } from "@/lib/directus";
import { getPostBySlug } from "@/lib/posts";
import TableOfContents from "@/components/TableOfContents";

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
      fields: ["title", "body", "description", "date_created", "thumbnail.filename_disk", "thumbnail.height", "thumbnail.width", "categories.post_categories_slug"],
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
      <div className="max-w-7xl mx-auto p-6 md:p-12 animate-fadeIn">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 max-w-3xl">
            {/* Back button */}
            <Link
              href="/posts"
              className="inline-block text-[10px] text-primary-foreground px-3 py-1.5 mb-8 transition-all border-2 border-border rounded-md bg-primary shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none font-mono uppercase font-bold"
            >
              ← Back
            </Link>

            {/* Article Header */}
            <header className="mb-8 pb-6 border-b-2 border-border">
              <h1 className="text-2xl md:text-3xl font-bold mb-4 text-foreground uppercase">{data.title}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <time dateTime={data.date_created} className="font-mono text-[9px] bg-muted/30 px-2 py-1 rounded-md border-2 border-border uppercase">
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
                      <span key={title} className="px-2 py-1 bg-primary text-primary-foreground border-2 border-border text-[9px] font-mono uppercase rounded-md shadow-neo-sm">
                        {title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </header>

            {/* Thumbnail Image */}
            {thumbnailUrl && data.thumbnail && typeof data.thumbnail === 'object' && (
              <div className="mb-8 overflow-hidden border-4 border-border rounded-lg shadow-neo-md">
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
            {data.body && (
              <div
                className="article-content prose prose-base max-w-none
                  prose-headings:font-bold prose-headings:text-foreground prose-headings:mb-4 prose-headings:mt-8 prose-headings:uppercase
                  prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                  prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-4 prose-p:text-sm
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:transition-colors
                  prose-strong:text-foreground prose-strong:font-bold
                  prose-code:text-primary prose-code:bg-muted/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:border prose-code:border-border prose-code:font-mono
                  prose-pre:bg-card prose-pre:border-2 prose-pre:border-border prose-pre:rounded-lg prose-pre:shadow-neo-sm prose-pre:p-4 prose-pre:text-xs
                  prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:bg-muted/20 prose-blockquote:py-2 prose-blockquote:my-4 prose-blockquote:text-sm
                  prose-ul:text-foreground prose-ul:text-sm prose-ul:mb-4 prose-ol:text-foreground prose-ol:text-sm prose-ol:mb-4
                  prose-li:marker:text-primary prose-li:mb-1
                  prose-hr:border-border prose-hr:border-2 prose-hr:my-6
                  prose-img:border-2 prose-img:border-border prose-img:rounded-lg prose-img:shadow-neo-sm"
                dangerouslySetInnerHTML={{ __html: data.body }}
              />
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