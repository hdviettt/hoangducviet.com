"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";

interface Post {
  slug?: string;
  title?: string;
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

  // Initialize with all years and months expanded
  const [expandedYears, setExpandedYears] = useState<Set<string>>(() => {
    const years = new Set<string>();
    posts.forEach(post => {
      if (post.date_created) {
        years.add(new Date(post.date_created).getFullYear().toString());
      } else {
        years.add("Unknown");
      }
    });
    return years;
  });

  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(() => {
    const yearMonths = new Set<string>();
    posts.forEach(post => {
      if (post.date_created) {
        const date = new Date(post.date_created);
        const year = date.getFullYear().toString();
        const month = date.toLocaleDateString('en-US', { month: 'long' });
        yearMonths.add(`${year}-${month}`);
      } else {
        yearMonths.add("Unknown-Unknown");
      }
    });
    return yearMonths;
  });

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
          return (a.title || "").localeCompare(b.title || "");
        default:
          return 0;
      }
    });

    return filtered;
  }, [posts, sortBy, filterCategory]);

  // Group posts by year and month hierarchically
  const groupedPosts = useMemo(() => {
    const yearGroups: { [year: string]: { [month: string]: Post[] } } = {};

    filteredAndSortedPosts.forEach(post => {
      if (!post.date_created) {
        if (!yearGroups["Unknown"]) yearGroups["Unknown"] = {};
        if (!yearGroups["Unknown"]["Unknown"]) yearGroups["Unknown"]["Unknown"] = [];
        yearGroups["Unknown"]["Unknown"].push(post);
      } else {
        const date = new Date(post.date_created);
        const year = date.getFullYear().toString();
        const month = date.toLocaleDateString('en-US', { month: 'long' });

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

    const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return sortedYears.map(year => {
      const months = yearGroups[year];
      const sortedMonths = Object.keys(months).sort((a, b) => {
        if (a === "Unknown") return 1;
        if (b === "Unknown") return -1;
        return monthOrder.indexOf(b) - monthOrder.indexOf(a);
      });

      return {
        year,
        months: sortedMonths.map(month => ({
          month,
          posts: months[month]
        }))
      };
    });
  }, [filteredAndSortedPosts]);

  const toggleYear = (year: string) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(year)) {
      newExpanded.delete(year);
    } else {
      newExpanded.add(year);
    }
    setExpandedYears(newExpanded);
  };

  const toggleMonth = (yearMonth: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(yearMonth)) {
      newExpanded.delete(yearMonth);
    } else {
      newExpanded.add(yearMonth);
    }
    setExpandedMonths(newExpanded);
  };

  return (
    <>
      {/* Controls Bar - Neo-brutalism Style */}
      <div className="bg-muted/20 border-b-4 border-border px-3 py-3 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
        {/* Sort Control */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-foreground font-mono uppercase font-bold">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-card text-foreground border-2 border-border px-3 py-1.5 text-[10px] font-mono uppercase cursor-pointer rounded-md shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            <option value="date-desc">Date [New]</option>
            <option value="date-asc">Date [Old]</option>
            <option value="title">Title [A-Z]</option>
          </select>
        </div>

        {/* Filter Control */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-foreground font-mono uppercase font-bold">Filter:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-card text-foreground border-2 border-border px-3 py-1.5 text-[10px] font-mono uppercase cursor-pointer rounded-md shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            <option value="all">All</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Results Count */}
        <div className="md:ml-auto text-[10px] text-foreground font-mono font-bold">
          {filteredAndSortedPosts.length} items
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredAndSortedPosts.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-foreground">
            <div className="text-center">
              <p className="text-lg font-bold uppercase">No Results</p>
              <p className="text-xs mt-2 font-mono">Try different filters</p>
            </div>
          </div>
        ) : (
          // Hierarchical Grouped View
          <div className="divide-y-2 divide-border">
            {groupedPosts.map(({ year, months }) => (
              <div key={year}>
                {/* Year Header - Clickable */}
                <div
                  onClick={() => toggleYear(year)}
                  className="bg-primary text-primary-foreground font-mono text-[10px] px-3 py-2 border-b-4 border-border uppercase font-bold flex items-center gap-2 cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  {expandedYears.has(year) ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                  {year} [{months.reduce((sum, m) => sum + m.posts.length, 0)}]
                </div>

                {/* Months - Show when year is expanded */}
                {expandedYears.has(year) && (
                  <div className="divide-y-2 divide-border">
                    {months.map(({ month, posts }) => {
                      const yearMonth = `${year}-${month}`;
                      return (
                        <div key={yearMonth}>
                          {/* Month Header - Clickable */}
                          <div
                            onClick={() => toggleMonth(yearMonth)}
                            className="bg-muted/20 text-foreground font-mono text-[9px] px-6 py-1.5 border-b-2 border-border uppercase font-bold flex items-center gap-2 cursor-pointer hover:bg-muted/30 transition-colors"
                          >
                            {expandedMonths.has(yearMonth) ? (
                              <ChevronDown className="w-2.5 h-2.5" />
                            ) : (
                              <ChevronRight className="w-2.5 h-2.5" />
                            )}
                            {month} [{posts.length}]
                          </div>

                          {/* Posts - Show when month is expanded */}
                          {expandedMonths.has(yearMonth) && (
                            <div className="divide-y-2 divide-border">
                              {posts.map((post, index) => (
                                <Link
                                  key={post.slug || index}
                                  href={`/posts/${post.slug}`}
                                  className="file-item group"
                                >
                                  <div className="w-8 text-[9px] font-mono text-muted-foreground">
                                    [F]
                                  </div>
                                  <div className="file-name text-[10px]">
                                    {post.title || "Untitled"}
                                  </div>
                                  <div className="hidden md:block w-32 mr-4 text-[9px] text-muted-foreground font-mono">
                                    {post.categories && post.categories.length > 0
                                      ? post.categories.map(cat => cat.title).join(", ")
                                      : "—"
                                    }
                                  </div>
                                  <div className="w-20 md:w-28 text-right pr-2 md:pr-4 text-[9px] text-muted-foreground">
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
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}