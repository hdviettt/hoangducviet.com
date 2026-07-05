import DeleteButton from "@/components/admin/DeleteButton";
import StatusToggle from "@/components/admin/StatusToggle";
import EmptyState, { StatusPill } from "@/components/admin/EmptyState";
import PageHeader from "@/components/admin/PageHeader";
import { db } from "@/db";
import { seriesGroups, series } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const allProjects = await db
    .select({
      slug: series.slug,
      title: series.title,
      status: series.status,
      dateCreated: series.dateCreated,
      groupSlug: series.groupSlug,
      groupTitle: seriesGroups.title,
    })
    .from(series)
    .leftJoin(seriesGroups, eq(series.groupSlug, seriesGroups.slug))
    .orderBy(desc(series.dateCreated));

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="projects"
        count={allProjects.length}
        action={
          <Link
            href="/admin/projects/new"
            className="md-btn md-btn-filled md-btn-sm"
          >
            + new project
          </Link>
        }
      />

      <div className="rounded-xl border border-md-outline-variant bg-md-surface-container-low overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-2.5 border-b border-md-outline-variant bg-md-surface-container">
          <div className="w-9 shrink-0" />
          <div className="md-label-small text-md-on-surface-variant uppercase tracking-widest flex-1">title</div>
          <div className="md-label-small text-md-on-surface-variant uppercase tracking-widest w-20">group</div>
          <div className="md-label-small text-md-on-surface-variant uppercase tracking-widest w-24">status</div>
          <div className="md-label-small text-md-on-surface-variant uppercase tracking-widest w-24 text-right">date</div>
          <div className="w-10 shrink-0" />
        </div>
        {allProjects.length === 0 ? (
          <EmptyState
            title="no projects yet"
            hint={
              <Link href="/admin/projects/new" className="text-md-primary hover:underline">
                + new project
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-md-outline-variant stagger-list">
            {allProjects.map((project) => (
              <div
                key={project.slug}
                className="group flex items-center gap-4 px-4 py-2.5 row-hover"
              >
                <StatusToggle slug={project.slug} status={project.status} apiPath="projects" />
                <Link
                  href={`/admin/projects/${project.slug}/edit`}
                  className="md-body-medium flex-1 hover:text-md-primary transition-colors truncate"
                >
                  {project.title}
                </Link>
                <div className="w-20 shrink-0">
                  {project.groupTitle && (
                    <span className="md-label-small text-md-on-surface-variant rounded border border-md-outline-variant px-1.5 py-0.5 truncate block uppercase tracking-wider">
                      {project.groupTitle}
                    </span>
                  )}
                </div>
                <div className="w-24">
                  <StatusPill status={project.status} />
                </div>
                <span className="md-body-small text-md-on-surface-variant w-24 text-right shrink-0 tabular-nums">
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
