import type { Metadata } from "next";
import Link from "next/link";

import { getGlobalMetadata } from "@/lib/directus";
import { getPostBySlug } from "@/lib/posts";
import InlineTableOfContents from "@/components/InlineTableOfContents";
import MarkdownContent from "@/components/MarkdownContent";
import ReadingProgress from "@/components/ReadingProgress";


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

  try {
    data = await getPostBySlug(params.postSlug, {
      fields: ["title", "content", "date_created"],
    });
  } catch (error) {
    console.error("Error fetching post:", error);
  }

  if (!data) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <p className="text-muted-foreground">Post not found</p>
      </div>
    );
  }

  return (
    <>
      <ReadingProgress />
      <div className="py-8 sm:py-12 md:py-16">
        {/* Back button */}
        <Link
          href="/posts"
          className="inline-block text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          ← Back to posts
        </Link>

        <div className="lg:grid lg:grid-cols-[1fr_200px] lg:gap-8 xl:gap-12 items-start">
          {/* Main Content */}
          <div className="min-w-0">
            {/* Article Header */}
            <header className="mb-8 sm:mb-10">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-medium mb-3 leading-tight">
                {data.title}
              </h1>
              <time className="text-xs sm:text-sm text-muted-foreground" dateTime={data.date_created}>
                {data.date_created && new Date(data.date_created).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </header>

            {/* Article Content */}
            {data.content ? (
              <div className="article-content">
                <MarkdownContent content={data.content} />
              </div>
            ) : (
              <p className="text-muted-foreground">No content available</p>
            )}
          </div>

          {/* Table of Contents Sidebar */}
          <aside className="hidden lg:block sticky top-24 self-start">
            {data.content && <InlineTableOfContents content={data.content} />}
          </aside>
        </div>
      </div>
    </>
  );
}