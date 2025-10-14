"use client";

import { useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface Post {
  slug?: string;
  title?: string;
  date_created?: string;
  categories?: Array<{ title: string }>;
  description?: string;
  thumbnail?: string | {
    filename_disk: string;
    width: number;
    height: number;
  };
  status?: string;
}

interface PostsListProps {
  posts: Post[];
  categories: string[];
}

export default function PostsList({ posts, categories }: PostsListProps) {
  // Sort posts by date (newest first)
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) =>
      new Date(b.date_created || 0).getTime() - new Date(a.date_created || 0).getTime()
    );
  }, [posts]);

  // Group posts by year and month hierarchically
  const groupedPosts = useMemo(() => {
    const yearGroups: { [year: string]: { [month: string]: Post[] } } = {};

    sortedPosts.forEach(post => {
      if (!post.date_created) {
        if (!yearGroups["Unknown"]) yearGroups["Unknown"] = {};
        if (!yearGroups["Unknown"]["Unknown"]) yearGroups["Unknown"]["Unknown"] = [];
        yearGroups["Unknown"]["Unknown"].push(post);
      } else {
        const date = new Date(post.date_created);
        const year = date.getFullYear().toString();
        const month = `${String(date.getMonth() + 1).padStart(2, '0')}.${year}`;

        if (!yearGroups[year]) yearGroups[year] = {};
        if (!yearGroups[year][month]) yearGroups[year][month] = [];
        yearGroups[year][month].push(post);
      }
    });

    // Sort years descending
    const sortedYears = Object.keys(yearGroups).sort((a, b) => {
      if (a === "Unknown") return 1;
      if (b === "Unknown") return -1;
      return parseInt(b) - parseInt(a);
    });

    return sortedYears.map(year => {
      const months = yearGroups[year];
      const sortedMonths = Object.keys(months).sort((a, b) => {
        if (a === "Unknown") return 1;
        if (b === "Unknown") return -1;
        // Parse MM.YYYY format for sorting (descending order)
        const [monthA] = a.split('.');
        const [monthB] = b.split('.');
        return parseInt(monthB) - parseInt(monthA);
      });

      return {
        year,
        months: sortedMonths.map(month => ({
          month,
          posts: months[month]
        }))
      };
    });
  }, [sortedPosts]);

  // Expose archive data to window for FileExplorer
  useEffect(() => {
    (window as any).__POSTS_ARCHIVE__ = groupedPosts;
  }, [groupedPosts]);

  return (
    <div className="flex h-full relative">
      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Posts List - Grouped by Year and Month */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {sortedPosts.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-foreground">
              <div className="text-center">
                <p className="text-lg font-semibold">No Posts</p>
                <p className="text-xs mt-2 text-muted-foreground">No articles available</p>
              </div>
            </div>
          ) : (
            <div className="p-6 md:p-8">
              {groupedPosts.map(({ year, months }) => (
                <div key={year} id={`year-${year}`} className="mb-10 flex gap-4">
                  {/* Timeline Bar */}
                  <div className="flex-shrink-0 w-0.5 bg-border relative">
                    {/* Year marker dot */}
                    <div className="absolute -left-1 top-0 w-2.5 h-2.5 rounded-full bg-foreground"></div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    {/* Year Header */}
                    <div className="text-foreground text-sm px-2 py-1 mb-5 font-semibold">
                      {year}
                    </div>

                    {/* Months */}
                    {months.map(({ month, posts }) => (
                      <div key={`${year}-${month}`} id={`month-${year}-${month}`} className="mb-6">
                        {/* Month Header */}
                        <div className="text-muted-foreground text-xs px-2 py-1 mb-4 font-medium">
                          {month}
                        </div>

                        {/* Posts in this month */}
                        <div className="space-y-4">
                        {posts.map((post, index) => {
                          const directusUrl = 'https://directus-production-b969.up.railway.app';
                          const thumbnailUrl = post.thumbnail && typeof post.thumbnail === 'object'
                            ? `${directusUrl}/assets/${post.thumbnail.filename_disk}`
                            : null;
                          const isUnpublished = post.status !== 'published';

                          return (
                            <Link
                              key={post.slug || index}
                              href={`/posts/${post.slug}`}
                              className="block group"
                            >
                              <div className={`flex gap-4 p-4 bg-card rounded-lg border border-border hover:shadow-sm hover:border-primary/20 transition-all duration-200 ${isUnpublished ? 'opacity-50' : ''}`}>
                                {/* Thumbnail */}
                                {thumbnailUrl && (
                                  <div className="flex-shrink-0 w-16 sm:w-20 self-start">
                                    <div className="w-full aspect-square overflow-hidden border border-border rounded-md">
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

                                <div className="flex-1 min-w-0 flex flex-col">
                                  <h3 className="text-xs sm:text-sm font-semibold mb-2 text-foreground">
                                    {post.title || "Untitled"}
                                  </h3>
                                  {post.description && (
                                    <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2 flex-1">
                                      {post.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-auto">
                                    <time>
                                      {post.date_created ? (() => {
                                        const date = new Date(post.date_created);
                                        const day = String(date.getDate()).padStart(2, '0');
                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                        const year = date.getFullYear();
                                        return `${day}.${month}.${year}`;
                                      })() : ""}
                                    </time>
                                    {post.categories && post.categories.length > 0 && (
                                      <>
                                        <span>•</span>
                                        <span>{post.categories.map(cat => cat.title).join(", ")}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}