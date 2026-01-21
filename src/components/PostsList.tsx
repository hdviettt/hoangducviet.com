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
    <div className="py-12 font-mono">
      {/* Terminal command header */}
      <div className="mb-8 text-sm">
        <span className="text-primary">$</span>{" "}
        <span className="text-muted-foreground">ls -la ./posts</span>
      </div>

      {postsByYear.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          <span className="text-primary">&gt;</span> No articles found.
        </p>
      ) : (
        <div className="space-y-8">
          {postsByYear.map(({ year, posts: yearPosts }) => (
            <section key={year}>
              {/* Year header - like a directory */}
              <div className="text-xs text-muted-foreground mb-3 pb-2 border-b border-border/50">
                <span className="text-primary">drwxr-xr-x</span>
                <span className="mx-3">{yearPosts.length}</span>
                <span>{year}/</span>
              </div>

              {/* Posts list */}
              <ul className="space-y-1">
                {yearPosts.map((post, index) => {
                  const isUnpublished = post.status !== 'published';
                  const date = post.date_created
                    ? new Date(post.date_created).toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit'
                      }).toLowerCase()
                    : '---';

                  return (
                    <li key={post.slug || index}>
                      <Link
                        href={`/posts/${post.slug}`}
                        className={`flex items-baseline gap-4 py-1 group text-sm ${
                          isUnpublished ? 'opacity-40' : ''
                        }`}
                      >
                        <span className="text-muted-foreground text-xs w-16 shrink-0">
                          {date}
                        </span>
                        <span className="text-foreground group-hover:text-primary transition-colors">
                          {post.title || "untitled"}
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

      {/* Terminal prompt at bottom */}
      <div className="mt-12 text-sm text-muted-foreground">
        <span className="text-primary">$</span>{" "}
        <span className="inline-block w-2 h-4 bg-primary/80 animate-pulse" />
      </div>
    </div>
  );
}
