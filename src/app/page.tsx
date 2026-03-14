import { getPosts } from "@/lib/posts";
import { getProfile } from "@/lib/profile";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [profileData, latestPosts] = await Promise.all([
    getProfile(),
    getPosts({ limit: 100 }),
  ]);

  const profile = profileData[0];

  // Group posts by year
  const postsByYear: Record<string, typeof latestPosts> = {};
  for (const post of latestPosts) {
    const year = post.date_created
      ? new Date(post.date_created).getFullYear().toString()
      : "Unknown";
    if (!postsByYear[year]) postsByYear[year] = [];
    postsByYear[year].push(post);
  }
  const years = Object.keys(postsByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div>
      {/* Bio */}
      {profile && (
        <section className="mb-10">
          {profile.description && (
            <div
              className="text-neutral-600 leading-relaxed [&_a]:text-blue-600 [&_a]:underline [&_p]:mb-3 [&_p:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: profile.description }}
            />
          )}
        </section>
      )}

      {/* Posts */}
      {years.map((year) => (
        <section key={year} className="mb-8">
          <h2 className="text-sm font-semibold text-neutral-400 mb-3">{year}</h2>
          <ul className="space-y-1">
            {postsByYear[year].map((post) => (
              <li key={post.slug} className="flex items-baseline gap-4">
                <span className="text-sm text-neutral-400 shrink-0 w-20">
                  {post.date_created
                    ? new Date(post.date_created).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : ""}
                </span>
                <Link
                  href={`/posts/${post.slug}`}
                  className="text-blue-600 hover:underline"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
