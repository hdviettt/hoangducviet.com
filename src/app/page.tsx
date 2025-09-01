import Image from "next/image";
import Link from "next/link";

import { getHome } from "@/lib/directus";
import { getPosts } from "@/lib/posts";

import Container from "@/components/Container";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const data = await getHome();

  const featuredPosts = await getPosts({
    limit: 6,
    fields: ["slug", "title", "description", "date_created", "thumbnail.filename_disk", "thumbnail.height", "thumbnail.width"],
  });

  return (
    <>
      <section className="py-24 md:py-32">
        <Container>
          <div className="max-w-3xl mx-auto text-center space-y-8 mb-16">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
              {data.hero_title}
            </h1>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              {data.hero_subtitle}
            </p>
            {data.hero_buttons.length > 0 && (
              <div className="flex flex-wrap gap-4 justify-center">
                {data.hero_buttons.map((button) => {
                  return (
                    <Button key={button.label} asChild size="lg" className="font-semibold">
                      <Link href={button.link}>{button.label}</Link>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
          {typeof data.hero_cover === 'object' && (
            <div className="relative overflow-hidden rounded-xl border bg-muted/50">
              <Image
                className="w-full object-cover"
                width={2100}
                height={900}
                src={`${process.env.NEXT_PUBLIC_DIRECTUS_API_ENDPOINT}/assets/${data.hero_cover.filename_disk}?width=2100&height=900`}
                alt=""
                sizes="(max-width: 1152px) 100vw, 1112px"
                priority
              />
            </div>
          )}
        </Container>
      </section>
      <section className="py-24">
        <Container>
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold tracking-tight">{data.featured_title}</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
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
                      <h3 className="text-xl font-semibold leading-tight line-clamp-2">
                        {post.title}
                      </h3>
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
          <div className="text-center">
            <Button asChild variant="outline">
              <Link href="/posts" className="font-medium">
                View All Posts
              </Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
