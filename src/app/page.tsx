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
      <div className="min-h-full flex items-center justify-center">
        <p className="text-muted-foreground">Unable to load content.</p>
      </div>
    );
  }

  if (hdvietData.length === 0) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <p className="text-muted-foreground">No content available.</p>
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
    <div className="min-h-full">
      <div className="max-w-xl mx-auto px-6 py-16 md:py-24">
        {/* Profile */}
        <section className="mb-16">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={mainProfile.name || 'Profile'}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-2 border-foreground/20"
              priority
            />
          )}
          {mainProfile?.name && (
            <h1 className="text-2xl font-semibold mb-4 text-center">{mainProfile.name}</h1>
          )}

          {mainProfile?.description && (
            <div
              className="text-muted-foreground leading-relaxed [&_a]:text-foreground [&_a]:underline [&_p]:mb-3 [&_p:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: mainProfile.description }}
            />
          )}
        </section>

        {/* Posts */}
        {latestPosts.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-4">
              Writing
            </h2>

            <ul className="space-y-3 mb-6">
              {latestPosts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/posts/${post.slug}`}
                    className="flex items-baseline justify-between gap-4 group"
                  >
                    <span className="text-foreground group-hover:text-muted-foreground transition-colors">
                      {post.title}
                    </span>
                    <span className="text-sm text-muted-foreground tabular-nums shrink-0">
                      {post.date_created && new Date(post.date_created).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/posts"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              All articles
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
