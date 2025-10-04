"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Calendar, X } from "lucide-react";

interface Project {
  slug?: string;
  title?: string;
  date_created?: string;
  description?: string;
}

interface ProjectsListProps {
  projects: Project[];
}

export default function ProjectsList({ projects }: ProjectsListProps) {
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "title">("date-desc");
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  // Sort projects
  const sortedProjects = useMemo(() => {
    let sorted = [...projects];

    sorted.sort((a, b) => {
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

    return sorted;
  }, [projects, sortBy]);

  // Group projects by year and month hierarchically
  const groupedProjects = useMemo(() => {
    const yearGroups: { [year: string]: { [month: string]: Project[] } } = {};

    sortedProjects.forEach(project => {
      if (!project.date_created) {
        if (!yearGroups["Unknown"]) yearGroups["Unknown"] = {};
        if (!yearGroups["Unknown"]["Unknown"]) yearGroups["Unknown"]["Unknown"] = [];
        yearGroups["Unknown"]["Unknown"].push(project);
      } else {
        const date = new Date(project.date_created);
        const year = date.getFullYear().toString();
        const month = date.toLocaleDateString('en-US', { month: 'long' });

        if (!yearGroups[year]) yearGroups[year] = {};
        if (!yearGroups[year][month]) yearGroups[year][month] = [];
        yearGroups[year][month].push(project);
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
          projects: months[month]
        }))
      };
    });
  }, [sortedProjects]);

  // Expose archive data to window for FileExplorer
  useEffect(() => {
    (window as any).__PROJECTS_ARCHIVE__ = groupedProjects;
  }, [groupedProjects]);

  return (
    <div className="flex h-full relative">
      {/* Desktop Sidebar - Table of Contents */}
      <div className="hidden md:block w-48 border-r-4 border-border bg-muted/20 overflow-y-auto flex-shrink-0">
        <div className="p-3">
          <nav className="space-y-1">
            {groupedProjects.map(({ year, months }) => (
              <div key={year}>
                <a
                  href={`#year-${year}`}
                  className="block text-foreground font-mono text-[11px] px-2 py-1 uppercase font-bold hover:text-primary transition-colors"
                >
                  {year}
                </a>
                <div className="ml-3 space-y-0.5 mb-2">
                  {months.map(({ month, projects }) => (
                    <a
                      key={`${year}-${month}`}
                      href={`#month-${year}-${month}`}
                      className="block text-muted-foreground font-mono text-[10px] px-2 py-0.5 hover:text-foreground transition-colors"
                    >
                      {month} ({projects.length})
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile ToC Button */}
      <button
        onClick={() => setMobileTocOpen(true)}
        className="md:hidden fixed bottom-20 right-4 z-40 bg-primary text-primary-foreground p-4 rounded-full shadow-neo-md border-2 border-border active:translate-x-1 active:translate-y-1"
        aria-label="Open navigation"
      >
        <Calendar className="w-6 h-6" />
      </button>

      {/* Mobile ToC Drawer */}
      {mobileTocOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background overflow-y-auto">
          <div className="sticky top-0 bg-primary px-4 py-3 flex items-center justify-between border-b-4 border-border">
            <span className="text-primary-foreground font-mono text-sm font-bold uppercase">Navigation</span>
            <button
              onClick={() => setMobileTocOpen(false)}
              className="text-primary-foreground p-2 active:scale-95"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4">
            <nav className="space-y-2">
              {groupedProjects.map(({ year, months }) => (
                <div key={year}>
                  <a
                    href={`#year-${year}`}
                    onClick={() => setMobileTocOpen(false)}
                    className="block text-foreground font-mono text-base px-3 py-2 uppercase font-bold hover:text-primary transition-colors border-2 border-border rounded-md bg-card"
                  >
                    {year}
                  </a>
                  <div className="ml-3 space-y-1 mt-2 mb-3">
                    {months.map(({ month, projects }) => (
                      <a
                        key={`${year}-${month}`}
                        href={`#month-${year}-${month}`}
                        onClick={() => setMobileTocOpen(false)}
                        className="block text-foreground font-mono text-sm px-3 py-2 hover:bg-muted/20 transition-colors rounded-md"
                      >
                        {month} ({projects.length})
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
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

          {/* Results Count */}
          <div className="md:ml-auto text-[10px] text-foreground font-mono font-bold">
            {sortedProjects.length} items
          </div>
        </div>

        {/* Projects List - Grouped by Year and Month */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {sortedProjects.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-foreground">
              <div className="text-center">
                <p className="text-lg font-bold uppercase">No Projects</p>
                <p className="text-xs mt-2 font-mono">Empty directory</p>
              </div>
            </div>
          ) : (
            <div className="p-4">
              {groupedProjects.map(({ year, months }) => (
                <div key={year} id={`year-${year}`} className="mb-8">
                  {/* Year Header */}
                  <div className="bg-primary text-primary-foreground font-mono text-xs px-3 py-2 mb-4 uppercase font-bold">
                    {year}
                  </div>

                  {/* Months */}
                  {months.map(({ month, projects }) => (
                    <div key={`${year}-${month}`} id={`month-${year}-${month}`} className="mb-6">
                      {/* Month Header */}
                      <div className="text-foreground font-mono text-[10px] px-2 py-1 mb-2 uppercase font-bold">
                        {month}
                      </div>

                      {/* Projects in this month */}
                      <div className="space-y-2">
                        {projects.map((project, index) => (
                          <Link
                            key={project.slug || index}
                            href={`/projects/${project.slug}`}
                            className="block px-4 py-4 md:px-3 md:py-3 transition-all duration-200 cursor-pointer border-2 border-border hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-neo-sm active:translate-x-1 active:translate-y-1 bg-card"
                          >
                            <div className="flex items-start gap-2">
                              <div className="w-8 text-[9px] font-mono text-muted-foreground pt-0.5">
                                [D]
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-normal text-sm md:text-[10px] mb-1">
                                  {project.title || "Untitled"}
                                </div>
                                {project.description && (
                                  <div
                                    className="text-xs md:text-[9px] text-muted-foreground line-clamp-2 mb-1"
                                    dangerouslySetInnerHTML={{ __html: project.description }}
                                  />
                                )}
                                <div className="flex items-center gap-2 text-[10px] md:text-[8px] text-muted-foreground font-mono">
                                  <span>
                                    {project.date_created ? new Date(project.date_created).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    }) : ""}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}