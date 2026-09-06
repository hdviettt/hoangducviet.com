import EmptyState from "@/components/admin/EmptyState";
import PageHeader from "@/components/admin/PageHeader";
import WorkList from "@/components/admin/WorkList";
import { db } from "@/db";
import { projectPosts, projects } from "@/db/schema";
import { asc, eq, sql } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminWorkPage() {
  const rows = await db
    .select({
      slug: projects.slug,
      title: projects.title,
      description: projects.description,
      status: projects.status,
      buildStatus: projects.buildStatus,
      featured: projects.featured,
      sortOrder: projects.sortOrder,
      dateCreated: projects.dateCreated,
      links: sql<number>`count(${projectPosts.postSlug})`.mapWith(Number),
    })
    .from(projects)
    .leftJoin(projectPosts, eq(projectPosts.projectSlug, projects.slug))
    .groupBy(
      projects.slug,
      projects.title,
      projects.description,
      projects.status,
      projects.buildStatus,
      projects.featured,
      projects.sortOrder,
      projects.dateCreated,
    )
    .orderBy(asc(projects.sortOrder));

  return (
    <div className="max-w-[900px]">
      <PageHeader
        title="Work"
        count={rows.length}
        action={
          <Link
            href="/admin/work/new"
            className="md-btn md-btn-filled md-btn-sm"
          >
            New project
          </Link>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No projects yet"
          hint={
            <Link
              href="/admin/work/new"
              className="text-md-primary hover:underline"
            >
              New project
            </Link>
          }
        />
      ) : (
        <WorkList
          items={rows.map((p) => ({
            slug: p.slug,
            title: p.title,
            description: p.description,
            status: p.status,
            buildStatus: p.buildStatus,
            featured: p.featured,
            // Dates cross to the client as strings; a Date would not survive
            // the serialization boundary.
            dateCreated: p.dateCreated ? p.dateCreated.toISOString() : null,
            links: p.links,
          }))}
        />
      )}
    </div>
  );
}
