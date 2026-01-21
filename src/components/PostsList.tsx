"use client";

import { useMemo } from "react";
import Link from "next/link";

interface Post {
  slug?: string;
  title?: string;
  date_created?: string;
  status?: string;
}

interface PostsListProps {
  posts: Post[];
  categories?: string[];
}

interface PostsByYear {
  year: number;
  posts: Post[];
}

export default function PostsList({ posts }: PostsListProps) {
  const postsByYear = useMemo(() => {
    const sorted = [...posts].sort((a, b) =>
      new Date(b.date_created || 0).getTime() - new Date(a.date_created || 0).getTime()
    );

    const grouped: PostsByYear[] = [];
    let currentYear: number | null = null;

    for (const post of sorted) {
      const year = post.date_created ? new Date(post.date_created).getFullYear() : 0;
      if (year !== currentYear) {
        currentYear = year;
        grouped.push({ year, posts: [] });
      }
      grouped[grouped.length - 1].posts.push(post);
    }

    return grouped;
  }, [posts]);

  return (
    <div className="min-h-full">
      <div className="max-w-xl mx-auto px-6 py-16 md:py-24">
        <h1 className="text-2xl font-semibold mb-12 font-mono">Articles</h1>

        {postsByYear.length === 0 ? (
          <p className="text-muted-foreground">No articles yet.</p>
        ) : (
          <div className="space-y-10">
            {postsByYear.map(({ year, posts: yearPosts }) => (
              <section key={year}>
                <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
                  {year}
                </h2>

                <ul className="space-y-3">
                  {yearPosts.map((post, index) => {
                    const isUnpublished = post.status !== 'published';

                    return (
                      <li key={post.slug || index}>
                        <Link
                          href={`/posts/${post.slug}`}
                          className={`flex items-baseline justify-between gap-4 group ${
                            isUnpublished ? 'opacity-40' : ''
                          }`}
                        >
                          <span className="text-foreground group-hover:text-primary transition-colors">
                            {post.title || "Untitled"}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground tabular-nums shrink-0">
                            {post.date_created && new Date(post.date_created).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
