import type { Metadata } from "next";
import Image from "next/image";

import { getGlobalMetadata, getItemById } from "@/lib/directus";
import { getPostBySlug } from "@/lib/posts";

import Container from "@/components/Container";

interface PostParams {
  params: {
    postSlug: string;
  }
}

export async function generateMetadata({ params }: PostParams): Promise<Metadata> {
  const global = await getGlobalMetadata();
  const post = await getPostBySlug(params.postSlug, {
    fields: ["title"],
  });
  return {
    title: `${post.title} - VIET`,
    // description: '' // Add new field for excerpt or SEO Metadata
  }
}

export default async function PostPage({ params }: PostParams) {
  const data = await getPostBySlug(params.postSlug, {
    fields: ["title", "body", "date_created", "thumbnail.filename_disk", "thumbnail.height", "thumbnail.width", "categories.post_categories_slug"],
  });

  const categorySlugs = data.categories?.filter(category => typeof category === 'object').map(({ post_categories_slug }) => post_categories_slug);

  const categories = categorySlugs && await Promise.all(categorySlugs.map(async categorySlug => {
    return getItemById('post_categories', categorySlug, { fields: ['title'] });
  }));

  // Get thumbnail URL
  const thumbnailUrl = data.thumbnail && typeof data.thumbnail === 'object' 
    ? `${process.env.NEXT_PUBLIC_DIRECTUS_API_ENDPOINT}/assets/${data.thumbnail.filename_disk}`
    : null;

  return (
    <>
      <article className="py-24">
        <Container className="max-w-4xl">
          <header className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
              {data.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <time dateTime={data.date_created}>
                {data.date_created &&
                  new Date(data.date_created).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
              </time>
              {categories && categories.length > 0 && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    {categories.map(({ title }) => (
                      <span key={title} className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
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
            <div className="mb-12 -mx-4 sm:-mx-6 lg:-mx-8">
              <Image
                src={thumbnailUrl}
                alt={data.title || ''}
                width={data.thumbnail.width || 1200}
                height={data.thumbnail.height || 630}
                className="w-full h-auto rounded-lg"
                priority
              />
            </div>
          )}
          
          {/* HTML Content */}
          {data.body && (
            <div 
              className="prose prose-gray max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:font-semibold prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-pre:bg-muted prose-img:rounded-lg prose-video:rounded-lg prose-video:w-full"
              dangerouslySetInnerHTML={{ __html: data.body }}
            />
          )}
        </Container>
      </article>
    </>
  );
}
