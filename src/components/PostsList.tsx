"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Post {
  slug: string;
  title: string;
  date_created?: string;
  categories?: Array<{ title: string }>;
}

interface PostsListProps {
  posts: Post[];
  categories: string[];
}

export default function PostsList({ posts, categories }: PostsListProps) {
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "title">("date-desc");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [groupByYear, setGroupByYear] = useState<boolean>(false);

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = [...posts];

    // Filter by category
    if (filterCategory !== "all") {
      filtered = filtered.filter(post => 
        post.categories?.some(cat => cat.title === filterCategory)
      );
    }

    // Sort posts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date_created || 0).getTime() - new Date(a.date_created || 0).getTime();
        case "date-asc":
          return new Date(a.date_created || 0).getTime() - new Date(b.date_created || 0).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [posts, sortBy, filterCategory]);

  // Group posts by year if enabled
  const groupedPosts = useMemo(() => {
    if (!groupByYear) return null;

    const groups: { [year: string]: Post[] } = {};
    filteredAndSortedPosts.forEach(post => {
      const year = post.date_created ? new Date(post.date_created).getFullYear().toString() : "Unknown";
      if (!groups[year]) groups[year] = [];
      groups[year].push(post);
    });

    // Sort years in descending order
    const sortedYears = Object.keys(groups).sort((a, b) => {
      if (a === "Unknown") return 1;
      if (b === "Unknown") return -1;
      return parseInt(b) - parseInt(a);
    });

    return sortedYears.map(year => ({ year, posts: groups[year] }));
  }, [filteredAndSortedPosts, groupByYear]);

  return (
    <>
      {/* Controls Bar - Brutalist Style */}
      <div className="bg-black border-b md:border-b-2 border-white px-2 py-1.5 md:py-2 flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
        {/* Sort Control */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white font-mono uppercase">Sort:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-black text-white border border-white px-2 py-1 text-[10px] font-mono uppercase cursor-pointer hover:bg-white hover:text-black transition-colors"
          >
            <option value="date-desc">Date [New]</option>
            <option value="date-asc">Date [Old]</option>
            <option value="title">Title [A-Z]</option>
          </select>
        </div>

        {/* Filter Control */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white font-mono uppercase">Filter:</span>
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-black text-white border border-white px-2 py-1 text-[10px] font-mono uppercase cursor-pointer hover:bg-white hover:text-black transition-colors"
          >
            <option value="all">All</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Group by Year Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGroupByYear(!groupByYear)}
            className={`px-2 py-1 text-[10px] font-mono uppercase border border-white transition-colors ${
              groupByYear 
                ? "bg-white text-black" 
                : "bg-black text-white hover:bg-white hover:text-black"
            }`}
          >
            {groupByYear ? "[Grouped]" : "[Group by Year]"}
          </button>
        </div>

        {/* Results Count */}
        <div className="md:ml-auto text-[10px] text-white font-mono">
          [{filteredAndSortedPosts.length} items]
        </div>
      </div>

      {/* Table Header */}
      {!groupByYear && (
        <div className="table-header flex items-center flex-shrink-0">
          <div className="w-8"></div>
          <div className="flex-1">Name</div>
          <div className="hidden md:block w-32 mr-4">Category</div>
          <div className="w-20 md:w-28 text-right pr-2 md:pr-4">Date</div>
        </div>
      )}

      {/* Table Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredAndSortedPosts.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-white">
            <div className="text-center">
              <p className="text-lg font-bold uppercase">No Results</p>
              <p className="text-xs mt-2 font-mono">Try different filters</p>
            </div>
          </div>
        ) : groupByYear && groupedPosts ? (
          // Grouped View
          <div className="divide-y divide-border">
            {groupedPosts.map(({ year, posts }) => (
              <div key={year}>
                <div className="bg-black text-white font-mono text-xs px-2 py-2 border-b-2 border-white uppercase font-bold">
                  {year} [{posts.length}]
                </div>
                <div className="divide-y divide-border/10">
                  {posts.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/posts/${post.slug}`}
                      className="file-item group"
                    >
                      <div className="w-8 text-[10px] font-mono text-muted-foreground">
                        [F]
                      </div>
                      <div className="file-name text-xs md:text-sm">
                        {post.title}
                      </div>
                      <div className="hidden md:block w-32 mr-4 text-[10px] text-muted-foreground font-mono">
                        {post.categories && post.categories.length > 0 
                          ? post.categories.map(cat => cat.title).join(", ")
                          : "—"
                        }
                      </div>
                      <div className="w-20 md:w-28 text-right pr-2 md:pr-4 text-[9px] md:text-[10px] text-muted-foreground">
                        {post.date_created ? new Date(post.date_created).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: window.innerWidth > 768 ? 'numeric' : '2-digit'
                        }) : ""}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Regular View
          <div className="divide-y divide-border/10">
            {filteredAndSortedPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/posts/${post.slug}`}
                className="file-item group"
              >
                <div className="w-8 text-[10px] font-mono text-muted-foreground">
                  [F]
                </div>
                <div className="file-name text-xs md:text-sm">
                  {post.title}
                </div>
                <div className="hidden md:block w-32 mr-4 text-[10px] text-muted-foreground font-mono">
                  {post.categories && post.categories.length > 0 
                    ? post.categories.map(cat => cat.title).join(", ")
                    : "—"
                  }
                </div>
                <div className="w-20 md:w-28 text-right pr-2 md:pr-4 text-[9px] md:text-[10px] text-muted-foreground">
                  {post.date_created ? new Date(post.date_created).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }) : ""}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}