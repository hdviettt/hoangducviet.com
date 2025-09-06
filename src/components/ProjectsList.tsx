"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Project {
  slug: string;
  title: string;
  date_created?: string;
}

interface ProjectsListProps {
  projects: Project[];
}

export default function ProjectsList({ projects }: ProjectsListProps) {
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "title">("date-desc");
  const [groupByYear, setGroupByYear] = useState<boolean>(false);

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
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return sorted;
  }, [projects, sortBy]);

  // Group projects by year if enabled
  const groupedProjects = useMemo(() => {
    if (!groupByYear) return null;

    const groups: { [year: string]: Project[] } = {};
    sortedProjects.forEach(project => {
      const year = project.date_created ? new Date(project.date_created).getFullYear().toString() : "Unknown";
      if (!groups[year]) groups[year] = [];
      groups[year].push(project);
    });

    // Sort years in descending order
    const sortedYears = Object.keys(groups).sort((a, b) => {
      if (a === "Unknown") return 1;
      if (b === "Unknown") return -1;
      return parseInt(b) - parseInt(a);
    });

    return sortedYears.map(year => ({ year, projects: groups[year] }));
  }, [sortedProjects, groupByYear]);

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
          [{sortedProjects.length} items]
        </div>
      </div>

      {/* Table Header */}
      {!groupByYear && (
        <div className="table-header flex items-center flex-shrink-0">
          <div className="w-8"></div>
          <div className="flex-1">Name</div>
          <div className="w-20 md:w-28 text-right pr-2 md:pr-4">Date</div>
        </div>
      )}

      {/* Table Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {sortedProjects.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-white">
            <div className="text-center">
              <p className="text-lg font-bold uppercase">No Projects</p>
              <p className="text-xs mt-2 font-mono">Empty directory</p>
            </div>
          </div>
        ) : groupByYear && groupedProjects ? (
          // Grouped View
          <div className="divide-y divide-border">
            {groupedProjects.map(({ year, projects }) => (
              <div key={year}>
                <div className="bg-black text-white font-mono text-xs px-2 py-2 border-b-2 border-white uppercase font-bold">
                  {year} [{projects.length}]
                </div>
                <div className="divide-y divide-border/10">
                  {projects.map((project) => (
                    <Link
                      key={project.slug}
                      href={`/projects/${project.slug}`}
                      className="file-item group"
                    >
                      <div className="w-8 text-[10px] font-mono text-muted-foreground">
                        [D]
                      </div>
                      <div className="file-name text-xs md:text-sm">
                        {project.title}
                      </div>
                      <div className="w-20 md:w-28 text-right pr-2 md:pr-4 text-[9px] md:text-[10px] text-muted-foreground">
                        {project.date_created ? new Date(project.date_created).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
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
            {sortedProjects.map((project) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="file-item group"
              >
                <div className="w-8 text-[10px] font-mono text-muted-foreground">
                  [D]
                </div>
                <div className="file-name text-xs md:text-sm">
                  {project.title}
                </div>
                <div className="w-20 md:w-28 text-right pr-2 md:pr-4 text-[9px] md:text-[10px] text-muted-foreground">
                  {project.date_created ? new Date(project.date_created).toLocaleDateString('en-US', {
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