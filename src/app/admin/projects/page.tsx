import AdminRow, { adminDate } from "@/components/admin/AdminRow";
import DeleteButton from "@/components/admin/DeleteButton";
import EmptyState from "@/components/admin/EmptyState";
import PageHeader from "@/components/admin/PageHeader";
import StatusToggle from "@/components/admin/StatusToggle";
import { db } from "@/db";
import { series, seriesGroups, seriesPosts } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const allProjects = await db
    .select({
      slug: series.slug,
      title: series.title,
      summary: series.summary,
      status: series.status,
      dateCreated: series.dateCreated,
      groupTitle: seriesGroups.title,
      parts: sql<number>`count(${seriesPosts.postSlug})`.mapWith(Number),
    })
    .from(series)
    .leftJoin(seriesGroups, eq(series.groupSlug, seriesGroups.slug))
    .leftJoin(seriesPosts, eq(seriesPosts.seriesSlug, series.slug))
    .groupBy(
      series.slug,
      series.title,
      series.summary,
      series.status,
      series.dateCreated,
      seriesGroups.title,
    )
    .orderBy(desc(series.dateCreated));

  return (
    <div className="max-w-[900px]">
      <PageHeader
        title="Collection"
        count={allProjects.length}
        action={
          <Link
            href="/admin/projects/new"
            className="md-btn md-btn-filled md-btn-sm"
          >
            New series
          </Link>
        }
      />

      {allProjects.length === 0 ? (
        <EmptyState
          title="No series yet"
          hint={
            <Link
              href="/admin/projects/new"
              className="text-md-primary hover:underline"
            >
              New series
            </Link>
          }
        />
      ) : (
        <div className="border-t border-md-outline-variant stagger-list">
          {allProjects.map((project) => {
            const isDraft = project.status !== "published";
            return (
              <AdminRow
                key={project.slug}
                href={`/admin/projects/${project.slug}/edit`}
                title={project.title}
                description={project.summary}
                thumbnail={`/covers/series-${project.slug}.svg`}
                muted={isDraft}
                meta={
                  <>
                    <span className="tabular-nums">
                      {adminDate(project.dateCreated)}
                    </span>
                    <span>
                      {project.parts} {project.parts === 1 ? "part" : "parts"}
                    </span>
                    {project.groupTitle && <span>{project.groupTitle}</span>}
                    {isDraft && <span>Draft</span>}
                    {project.parts < 2 && (
                      <span className="text-md-warning">
                        Needs 2 parts to show on the site
                      </span>
                    )}
                  </>
                }
                actions={
                  <>
                    <StatusToggle
                      slug={project.slug}
                      status={project.status}
                      apiPath="projects"
                    />
                    <DeleteButton
                      slug={project.slug}
                      name={project.title}
                      apiPath="projects"
                    />
                  </>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
