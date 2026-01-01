"use client";

import { useMemo } from "react";
import Link from "next/link";

interface Project {
  slug?: string;
  title?: string;
  date_created?: string;
}

interface ProjectsListProps {
  projects: Project[];
}

export default function ProjectsList({ projects }: ProjectsListProps) {
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) =>
      new Date(b.date_created || 0).getTime() - new Date(a.date_created || 0).getTime()
    );
  }, [projects]);

  return (
    <div className="min-h-full">
      <div className="max-w-xl mx-auto px-6 py-16 md:py-24">
        <h1 className="text-2xl font-semibold mb-12">Projects</h1>

        {sortedProjects.length === 0 ? (
          <p className="text-muted-foreground">No projects yet.</p>
        ) : (
          <ul className="space-y-3">
            {sortedProjects.map((project, index) => (
              <li key={project.slug || index}>
                <Link
                  href={`/projects/${project.slug}`}
                  className="flex items-baseline justify-between gap-4 group"
                >
                  <span className="text-foreground group-hover:text-muted-foreground transition-colors">
                    {project.title || "Untitled"}
                  </span>
                  <span className="text-sm text-muted-foreground tabular-nums shrink-0">
                    {project.date_created && new Date(project.date_created).getFullYear()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
