import DeleteButton from "@/components/admin/DeleteButton";
import StatusToggle from "@/components/admin/StatusToggle";
import EmptyState, { StatusPill } from "@/components/admin/EmptyState";
import { db } from "@/db";
import { projectGroups, projects } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const allProjects = await db
    .select({
      slug: projects.slug,
      title: projects.title,
      status: projects.status,
      dateCreated: projects.dateCreated,
      groupSlug: projects.groupSlug,
      groupTitle: projectGroups.title,
    })
    .from(projects)
    .leftJoin(projectGroups, eq(projects.groupSlug, projectGroups.slug))
    .orderBy(desc(projects.dateCreated));

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-medium">projects</h1>
          <span className="text-xs text-muted-foreground border border-border px-1.5 py-0.5 tabular-nums font-mono">
            {allProjects.length}
          </span>
        </div>
        <Link
          href="/admin/projects/new"
          className="text-sm bg-primary text-primary-foreground px-4 py-1.5 hover:opacity-90 transition-opacity btn-press"
        >
          + new project
        </Link>
      </div>

      <div className="border border-border bg-card">
        <div className="flex items-center gap-4 px-4 py-2 border-b border-border bg-muted/30 border-l-2 border-l-transparent">
          <div className="w-9 shrink-0" />
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest flex-1 font-semibold">title</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest w-20 font-semibold">group</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest w-24 font-semibold">status</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest w-24 text-right font-semibold">date</div>
          <div className="w-10 shrink-0" />
        </div>
        {allProjects.length === 0 ? (
          <EmptyState
            title="no projects yet"
            hint={
              <Link href="/admin/projects/new" className="text-primary hover:underline">
                + new project
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-border stagger-list">
            {allProjects.map((project) => (
              <div
                key={project.slug}
                className="group flex items-center gap-4 px-4 py-2.5 row-hover"
              >
                <StatusToggle slug={project.slug} status={project.status} apiPath="projects" />
                <Link
                  href={`/admin/projects/${project.slug}/edit`}
                  className="text-sm flex-1 hover:text-primary transition-colors truncate"
                >
                  {project.title}
                </Link>
                <div className="w-20 shrink-0">
                  {project.groupTitle && (
                    <span className="text-[10px] text-muted-foreground border border-border px-1.5 py-0.5 truncate block font-mono uppercase tracking-wider">
                      {project.groupTitle}
                    </span>
                  )}
                </div>
                <div className="w-24">
                  <StatusPill status={project.status} />
                </div>
                <span className="text-xs text-muted-foreground w-24 text-right shrink-0 font-mono tabular-nums">
                  {project.dateCreated?.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "2-digit" })}
                </span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteButton slug={project.slug} name={project.title} apiPath="projects" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
