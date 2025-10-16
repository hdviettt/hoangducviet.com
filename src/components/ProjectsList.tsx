"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

interface Project {
  slug?: string;
  title?: string;
  date_created?: string;
  description?: string;
  thumbnail?: string | {
    filename_disk: string;
    width: number;
    height: number;
  };
}

interface ProjectsListProps {
  projects: Project[];
}

export default function ProjectsList({ projects }: ProjectsListProps) {
  // Sort projects by date (newest first)
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) =>
      new Date(b.date_created || 0).getTime() - new Date(a.date_created || 0).getTime()
    );
  }, [projects]);

  return (
    <div className="flex h-full relative">
      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Projects List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {sortedProjects.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-foreground">
              <div className="text-center">
                <p className="text-lg font-semibold">No Projects</p>
                <p className="text-xs mt-2 text-muted-foreground">No projects available</p>
              </div>
            </div>
          ) : (
            <div className="px-8 md:px-16 lg:px-24 py-6 md:py-8">
              <div className="max-w-2xl mx-auto space-y-4">
                {sortedProjects.map((project, index) => {
                  const directusUrl = 'https://directus-production-b969.up.railway.app';
                  const thumbnailUrl = project.thumbnail && typeof project.thumbnail === 'object'
                    ? `${directusUrl}/assets/${project.thumbnail.filename_disk}`
                    : null;

                  return (
                    <Link
                      key={project.slug || index}
                      href={`/projects/${project.slug}`}
                      className="block group"
                    >
                      <div className="flex gap-4 p-4 bg-card rounded-lg border border-border hover:shadow-sm hover:border-primary/20 transition-all duration-200">
                        {/* Thumbnail */}
                        {thumbnailUrl && (
                          <div className="flex-shrink-0 w-16 sm:w-20 self-start">
                            <div className="w-full aspect-square overflow-hidden border border-border rounded-md">
                              <Image
                                src={thumbnailUrl}
                                alt={project.title || ''}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex-1 min-w-0 flex flex-col">
                          <h3 className="text-xs sm:text-sm font-semibold mb-2 text-foreground">
                            {project.title || "Untitled"}
                          </h3>
                          {project.description && (
                            <div
                              className="text-[11px] text-muted-foreground line-clamp-2 mb-2 flex-1"
                              dangerouslySetInnerHTML={{ __html: project.description }}
                            />
                          )}
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-auto">
                            <time>
                              {project.date_created ? (() => {
                                const date = new Date(project.date_created);
                                const day = String(date.getDate()).padStart(2, '0');
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const year = date.getFullYear();
                                return `${day}.${month}.${year}`;
                              })() : ""}
                            </time>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}