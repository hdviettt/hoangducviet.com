import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

import { getGlobalMetadata } from "@/lib/directus";
import { getPosts } from "@/lib/posts";

import Container from "@/components/Container";

export async function generateMetadata(): Promise<Metadata> {
  const global = await getGlobalMetadata();
  return {
    title: `All Posts - VIET`,
    // description: '', // Create request to get all categories and use to generate dynamic description
  }
}

export default async function AllPostsPage() {
  const featuredPosts = await getPosts({
    limit: 12,
    fields: ["slug", "title", "description", "date_created", "thumbnail.filename_disk", "thumbnail.height", "thumbnail.width"],
  });

  return (
    <>
      <section className="py-24">
        <Container className="max-w-6xl">
          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Posts</h1>
            <p className="text-lg text-muted-foreground">
              Thoughts, stories and ideas from our blog
            </p>
          </header>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredPosts.map((post) => {
              const thumbnailUrl = post.thumbnail && typeof post.thumbnail === 'object'
                ? `${process.env.NEXT_PUBLIC_DIRECTUS_API_ENDPOINT}/assets/${post.thumbnail.filename_disk}`
                : null;
              
              return (
                <article 
                  key={post.slug} 
                  className="group relative rounded-lg border bg-card overflow-hidden hover:shadow-lg transition-all duration-200"
                >
                  <Link href={`/posts/${post.slug}`}>
                    <span className="absolute inset-0 z-10" />
                    {thumbnailUrl && post.thumbnail && typeof post.thumbnail === 'object' ? (
                      <div className="aspect-video relative overflow-hidden bg-muted">
                        <Image
                          src={thumbnailUrl}
                          alt={post.title || ''}
                          width={post.thumbnail.width || 600}
                          height={post.thumbnail.height || 400}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <span className="text-4xl font-bold text-muted-foreground/20">VIET</span>
                      </div>
                    )}
                    <div className="p-6 space-y-3">
                      <h2 className="text-xl font-semibold leading-tight line-clamp-2">
                        {post.title}
                      </h2>
                      {post.description && (
                        <p className="text-muted-foreground line-clamp-2">
                          {post.description}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {post.date_created &&
                          new Date(post.date_created).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                      </p>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
