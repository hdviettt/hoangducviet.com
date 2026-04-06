"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

interface Project {
  slug?: string;
  title?: string;
  url?: string | null;
  summary?: string | null;
  description?: string;
  thumbnail?: string | null;
  date_created?: string;
  group_slug?: string | null;
  group_title?: string | null;
}

interface ProjectsListProps {
  projects: Project[];
}

function ProjectCard({ project }: { project: Project }) {
  const year = project.date_created
    ? new Date(project.date_created).getFullYear()
    : null;
  const hostname = project.url
    ? (() => { try { return new URL(project.url).hostname; } catch { return project.url; } })()
    : null;

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col border border-border hover:border-primary/40 transition-colors bg-background overflow-hidden"
    >
      {/* Text content on top — like SEONGON */}
      <div className="p-5 md:p-6 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          {hostname && (
            <span className="text-xs text-muted-foreground truncate">{hostname}</span>
          )}
          {year && (
            <span className="text-xs text-muted-foreground ml-auto shrink-0">{year}</span>
          )}
        </div>

        <h3 className="text-lg md:text-xl font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
          {project.title || "Untitled"}
        </h3>

        {project.summary && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {project.summary}
          </p>
        )}
      </div>

      {/* Image preview at bottom */}
      <div className="relative aspect-video bg-muted overflow-hidden mt-auto">
        {project.thumbnail ? (
          <Image
            src={project.thumbnail}
            alt={project.title || ""}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl md:text-6xl font-medium text-muted-foreground/10 select-none">
              {(project.title || "?")[0].toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function ProjectsList({ projects }: ProjectsListProps) {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const { groups, sorted } = useMemo(() => {
    const sorted = [...projects].sort(
      (a, b) =>
        new Date(b.date_created || 0).getTime() -
        new Date(a.date_created || 0).getTime(),
    );

    // Collect unique groups in order of first appearance
    const seen = new Set<string>();
    const groups: { slug: string; title: string }[] = [];
    for (const p of sorted) {
      if (p.group_slug && !seen.has(p.group_slug)) {
        seen.add(p.group_slug);
        groups.push({ slug: p.group_slug, title: p.group_title ?? p.group_slug });
      }
    }

    return { groups, sorted };
  }, [projects]);

  const visible = activeGroup
    ? sorted.filter((p) => p.group_slug === activeGroup)
    : sorted;

  return (
    <div className="py-8 sm:py-12 md:py-16">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-medium mb-8 sm:mb-10 md:mb-12">
        Projects
      </h1>

      {/* Filter tabs */}
      {groups.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 md:mb-10">
          <button
            onClick={() => setActiveGroup(null)}
            className={`px-4 py-1.5 text-sm transition-colors border ${
              activeGroup === null
                ? "border-foreground text-foreground"
                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {groups.map((g) => (
            <button
              key={g.slug}
              onClick={() => setActiveGroup(g.slug)}
              className={`px-4 py-1.5 text-sm transition-colors border ${
                activeGroup === g.slug
                  ? "border-foreground text-foreground"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {g.title}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="text-muted-foreground text-sm md:text-base">No projects found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {visible.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
