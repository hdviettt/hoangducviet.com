import Link from "next/link";
import Image from "next/image";
import { getHdviet } from "@/lib/directus";
import { getPosts } from "@/lib/posts";

export const dynamic = 'force-dynamic';

export default async function Home() {
  let hdvietData: any[] = [];
  let latestPosts: any[] = [];

  try {
    const [hdvietResult, postsResult] = await Promise.all([
      getHdviet(),
      getPosts({
        fields: ["slug", "title", "date_created"],
        sort: ["-date_created"],
        limit: 5,
      }),
    ]);
    hdvietData = hdvietResult;
    latestPosts = postsResult;
  } catch (error) {
    console.error("Error fetching data:", error);
    return (
      <div className="py-12 font-mono">
        <p className="text-muted-foreground text-sm">
          <span className="text-primary">&gt;</span> Error: Unable to load content.
        </p>
      </div>
    );
  }

  if (hdvietData.length === 0) {
    return (
      <div className="py-12 font-mono">
        <p className="text-muted-foreground text-sm">
          <span className="text-primary">&gt;</span> No content available.
        </p>
      </div>
    );
  }

  const mainProfile = hdvietData[0];

  const directusUrl = 'https://directus-production-b969.up.railway.app';
  let imageUrl = null;
  if (mainProfile.image) {
    if (typeof mainProfile.image === 'object' && mainProfile.image.filename_disk) {
      imageUrl = `${directusUrl}/assets/${mainProfile.image.filename_disk}`;
    } else if (typeof mainProfile.image === 'string') {
      imageUrl = `${directusUrl}/assets/${mainProfile.image}`;
    }
  }

  return (
    <div className="py-12 font-mono">
      {/* Terminal intro command */}
      <div className="mb-8 text-sm">
        <span className="text-primary">$</span>{" "}
        <span className="text-muted-foreground">cat ./README.md</span>
      </div>

      {/* Profile Section */}
      <section className="mb-12">
        <div className="flex items-start gap-4 mb-6">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={mainProfile.name || 'Profile'}
              width={64}
              height={64}
              className="w-16 h-16 object-cover border border-border"
              priority
            />
          )}
          <div>
            {mainProfile?.name && (
              <h1 className="text-lg font-medium text-foreground mb-1">
                {mainProfile.name}
              </h1>
            )}
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">@</span>hdviet
            </p>
          </div>
        </div>

        {mainProfile?.description && (
          <div
            className="text-sm text-muted-foreground leading-relaxed [&_a]:text-primary [&_a]:no-underline [&_a:hover]:underline [&_p]:mb-3 [&_p:last-child]:mb-0"
            dangerouslySetInnerHTML={{ __html: mainProfile.description }}
          />
        )}
      </section>

      {/* Recent Posts Section */}
      {latestPosts.length > 0 && (
        <section>
          {/* Section header */}
          <div className="text-xs text-muted-foreground mb-4 pb-2 border-b border-border/50">
            <span className="text-primary">$</span>{" "}
            <span>ls -t ./posts | head -5</span>
          </div>

          {/* Posts list */}
          <ul className="space-y-1 mb-6">
            {latestPosts.map((post) => {
              const date = post.date_created
                ? new Date(post.date_created).toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit'
                  }).toLowerCase()
                : '---';

              return (
                <li key={post.slug}>
                  <Link
                    href={`/posts/${post.slug}`}
                    className="flex items-baseline gap-4 py-1 group text-sm"
                  >
                    <span className="text-muted-foreground text-xs w-16 shrink-0">
                      {date}
                    </span>
                    <span className="text-foreground group-hover:text-primary transition-colors">
                      {post.title}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <Link
            href="/posts"
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <span className="text-primary">&gt;</span> cd ./posts
          </Link>
        </section>
      )}

      {/* Terminal prompt at bottom */}
      <div className="mt-12 text-sm text-muted-foreground">
        <span className="text-primary">$</span>{" "}
        <span className="inline-block w-2 h-4 bg-primary/80 animate-pulse" />
      </div>
    </div>
  );
}
