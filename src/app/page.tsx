import Image from "next/image";
import Link from "next/link";
import { getHdviet } from "@/lib/directus";
import { getPosts } from "@/lib/posts";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch Hdviet data
  let hdvietData: any[] = [];
  let latestPosts: any[] = [];

  try {
    hdvietData = await getHdviet();
  } catch (error) {
    console.error("Error fetching Hdviet data:", error);
    // Return a simple error page for production
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-2 text-white uppercase">Connection Error</h1>
          <p className="text-white font-mono text-xs">Unable to fetch data</p>
        </div>
      </div>
    );
  }

  // Fetch latest posts
  try {
    latestPosts = await getPosts({
      fields: ["slug", "title", "description", "date_created", "thumbnail.filename_disk", "thumbnail.width", "thumbnail.height"],
      sort: ["-date_created"],
      limit: 3,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
  }

  // If no data, show empty state
  if (hdvietData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-2 text-white uppercase">No Data</h1>
          <p className="text-white font-mono text-xs">Empty collection</p>
        </div>
      </div>
    );
  }

  // Get the first entry as the main profile
  const mainProfile = hdvietData[0];

  // Construct image URL - handle different possible formats
  const directusUrl = 'https://directus-production-b969.up.railway.app';
  let imageUrl = null;
  if (mainProfile.image) {
    if (typeof mainProfile.image === 'object' && mainProfile.image.filename_disk) {
      imageUrl = `${directusUrl}/assets/${mainProfile.image.filename_disk}`;
    } else if (typeof mainProfile.image === 'string') {
      // If it's a UUID string
      imageUrl = `${directusUrl}/assets/${mainProfile.image}`;
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="min-h-full p-8 md:p-12 lg:p-16 animate-fadeIn">
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Main Profile Section */}
          <div>
            {/* Profile Image - Float left for flexible wrapping */}
            {imageUrl ? (
              <div className="float-left mr-6 mb-6 w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32">
                <div className="w-full h-full overflow-hidden border-2 border-border bg-card rounded-full">
                  <Image
                    src={imageUrl}
                    alt={mainProfile.name || 'Profile'}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
              </div>
            ) : (
              <div className="float-left mr-6 mb-6 w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-card border-2 border-border rounded-full flex items-center justify-center">
                <div className="text-foreground text-[8px] sm:text-xs">No Image</div>
              </div>
            )}

            {/* Content - Wraps around image */}
            <div>
              {/* Name */}
              {mainProfile.name && (
                <h1 className="text-xl md:text-2xl font-semibold mb-6 text-foreground leading-tight">
                  {mainProfile.name}
                </h1>
              )}

              {/* Description (HTML) */}
              {mainProfile.description && (
                <div
                  className="prose prose-sm max-w-none
                    prose-headings:font-semibold prose-headings:text-foreground prose-headings:mb-3 prose-headings:mt-4
                    prose-h1:text-lg prose-h2:text-base prose-h3:text-sm
                    prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-3 prose-p:text-sm
                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:transition-colors
                    prose-strong:text-foreground prose-strong:font-semibold
                    prose-ul:text-foreground prose-ul:mb-3 prose-ul:ml-3 prose-ul:text-sm
                    prose-ol:text-foreground prose-ol:mb-3 prose-ol:ml-3 prose-ol:text-sm
                    prose-li:text-foreground prose-li:mb-1
                    prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-foreground prose-blockquote:text-sm
                    prose-code:text-primary prose-code:bg-muted/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:border prose-code:border-border
                    prose-pre:bg-card prose-pre:border prose-pre:border-border prose-pre:rounded-lg"
                  dangerouslySetInnerHTML={{ __html: mainProfile.description }}
                />
              )}
            </div>

            {/* Clear float */}
            <div className="clear-both"></div>
          </div>

          {/* Latest Posts Section */}
          {latestPosts.length > 0 && (
            <div className="pt-10 border-t border-border">
            <h2 className="text-lg font-semibold mb-6 text-foreground">Latest Posts</h2>
            <div className="space-y-4">
              {latestPosts.map((post) => {
                const thumbnailUrl = post.thumbnail && typeof post.thumbnail === 'object'
                  ? `${directusUrl}/assets/${post.thumbnail.filename_disk}`
                  : null;

                return (
                  <Link
                    key={post.slug}
                    href={`/posts/${post.slug}`}
                    className="block group"
                  >
                    <div className="flex gap-4 p-4 bg-card rounded-lg border border-border hover:shadow-sm hover:border-primary/20 transition-all duration-200">
                      {/* Thumbnail */}
                      {thumbnailUrl && (
                        <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20">
                          <div className="w-full h-full overflow-hidden border border-border rounded-md">
                            <Image
                              src={thumbnailUrl}
                              alt={post.title || ''}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs sm:text-sm font-semibold mb-2 text-foreground">
                          {post.title}
                        </h3>
                        {post.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2">
                            {post.description}
                          </p>
                        )}
                        {post.date_created && (
                          <time className="text-[10px] text-muted-foreground block">
                            {new Date(post.date_created).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </time>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

              {/* View All Posts Link */}
              <div className="mt-6 text-center">
                <Link
                  href="/posts"
                  className="inline-block text-xs text-primary-foreground px-4 py-2 transition-all rounded-md bg-primary hover:bg-primary/90 font-medium"
                >
                  More →
                </Link>
              </div>
            </div>
          )}

          {/* Additional Profiles Section if there are more */}
          {hdvietData.length > 1 && (
            <div className="pt-12 border-t-4 border-border">
            <h2 className="text-3xl font-bold mb-8 text-foreground">More Profiles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {hdvietData.slice(1).map((item, index) => {
                let itemImageUrl = null;
                if (item.image) {
                  if (typeof item.image === 'object' && item.image.filename_disk) {
                    itemImageUrl = `${directusUrl}/assets/${item.image.filename_disk}`;
                  } else if (typeof item.image === 'string') {
                    itemImageUrl = `${directusUrl}/assets/${item.image}`;
                  }
                }

                return (
                  <div key={item.id || index} className="flex gap-6 p-6 bg-card rounded-xl border-4 border-border shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-neo-sm transition-all duration-300">
                    {/* Small Image */}
                    {itemImageUrl && (
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-border">
                          <Image
                            src={itemImageUrl}
                            alt={item.name || 'Profile'}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1">
                      {item.name && (
                        <h3 className="text-xl font-bold mb-2 text-foreground">
                          {item.name}
                        </h3>
                      )}

                      {item.description && (
                        <div
                          className="prose prose-sm max-w-none
                            prose-p:text-muted-foreground prose-p:line-clamp-3
                            prose-a:text-primary"
                          dangerouslySetInnerHTML={{ __html: item.description }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
