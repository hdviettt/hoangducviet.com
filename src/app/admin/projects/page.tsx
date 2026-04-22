import DeleteButton from "@/components/admin/DeleteButton";
import StatusToggle from "@/components/admin/StatusToggle";
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
          <span className="text-xs text-muted-foreground border border-border px-1.5 py-0.5 tabular-nums">{allProjects.length}</span>
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
          <div className="text-xs text-muted-foreground uppercase tracking-wider flex-1">title</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider w-24">group</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider w-28">status</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider w-24 text-right">date</div>
          <div className="w-10 shrink-0" />
        </div>
        <div className="divide-y divide-border stagger-list">
          {allProjects.map((project) => (
            <div
              key={project.slug}
              className="flex items-center gap-4 px-4 py-3 row-hover"
            >
              <StatusToggle slug={project.slug} status={project.status} apiPath="projects" />
              <Link
                href={`/admin/projects/${project.slug}/edit`}
                className="text-sm flex-1 hover:text-primary transition-colors truncate"
              >
                {project.title}
              </Link>
              <div className="w-24 shrink-0">
                {project.groupTitle && (
                  <span className="text-xs text-muted-foreground border border-border px-2 py-0.5 truncate block">
                    {project.groupTitle}
                  </span>
                )}
              </div>
              <span className={`text-xs flex items-center gap-1.5 w-28 ${project.status === "published" ? "text-green-500" : "text-yellow-500"}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${project.status === "published" ? "bg-green-500" : "bg-yellow-500"}`} />
                {project.status}
              </span>
              <span className="text-xs text-muted-foreground w-24 text-right shrink-0">
                {project.dateCreated?.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
              </span>
              <DeleteButton slug={project.slug} name={project.title} apiPath="projects" />
            </div>
          ))}
          {allProjects.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">no projects yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
