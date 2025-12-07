"use client";

import { useMemo } from "react";
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

interface PostsByYear {
  year: number;
  posts: Post[];
}

export default function PostsList({ posts, categories }: PostsListProps) {
  // Sort posts by date (newest first) and group by year
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
    <div className="flex h-full relative">
      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Posts List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {postsByYear.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-foreground">
              <div className="text-center">
                <p className="text-lg font-semibold">No Posts</p>
                <p className="text-xs mt-2 text-muted-foreground">No articles available</p>
              </div>
            </div>
          ) : (
            <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-6 md:py-8">
              <div className="max-w-2xl mx-auto">
                {postsByYear.map(({ year, posts: yearPosts }) => (
                  <div key={year} className="mb-8">
                    {/* Year separator */}
                    <div className="flex items-center gap-4 mb-4">
                      <h2 className="text-lg font-semibold text-foreground">{year}</h2>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Posts for this year */}
                    <div className="space-y-4">
                      {yearPosts.map((post, index) => {
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
                            <div className={`flex gap-4 p-4 bg-card rounded-lg border border-border hover:shadow-sm hover:border-primary/20 transition-all duration-150 ${isUnpublished ? 'opacity-50' : ''}`}>
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
                                      return `${day}.${month}`;
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
          )}
        </div>
      </div>
    </div>
  );
}