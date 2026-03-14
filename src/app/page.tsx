import { getPosts } from "@/lib/posts";
import { getProfile } from "@/lib/profile";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  let profileData: any[] = [];
  let latestPosts: any[] = [];

  try {
    const [profileResult, postsResult] = await Promise.all([
      getProfile(),
      getPosts({ limit: 5 }),
    ]);
    profileData = profileResult;
    latestPosts = postsResult;
  } catch (error) {
    console.error("Error fetching data:", error);
    return (
      <div className="py-12">
        <p className="text-muted-foreground text-sm">Unable to load content.</p>
      </div>
    );
  }

  if (profileData.length === 0) {
    return (
      <div className="py-12">
        <p className="text-muted-foreground text-sm">No content available.</p>
      </div>
    );
  }

  const mainProfile = profileData[0];
  const imageUrl = mainProfile.image || null;

  return (
    <div className="py-8 sm:py-12">
      {/* Profile Section */}
      <section className="mb-10 sm:mb-12">
        <div className="flex items-start gap-4 mb-6">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={mainProfile.name || "Profile"}
              width={64}
              height={64}
              className="w-14 h-14 sm:w-16 sm:h-16 object-cover border border-border shrink-0"
              priority
            />
          )}
          <div className="min-w-0">
            {mainProfile?.name && (
              <h1 className="text-lg sm:text-xl font-medium text-foreground mb-1">
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
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-4 pb-2 border-b border-border">
            Recent Posts
          </h2>

          <ul className="space-y-2 mb-6">
            {latestPosts.map((post) => {
              const date = post.date_created
                ? new Date(post.date_created).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                  })
                : "";

              return (
                <li key={post.slug}>
                  <Link
                    href={`/posts/${post.slug}`}
                    className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-1.5 group text-sm"
                  >
                    <span className="text-muted-foreground text-xs w-16 shrink-0 order-2 sm:order-1">
                      {date}
                    </span>
                    <span className="text-foreground group-hover:text-primary transition-colors order-1 sm:order-2">
                      {post.title}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <Link
            href="/posts"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            View all posts →
          </Link>
        </section>
      )}
    </div>
  );
}
