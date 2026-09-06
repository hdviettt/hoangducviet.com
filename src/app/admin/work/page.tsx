import AdminRow, { adminDate } from "@/components/admin/AdminRow";
import DeleteButton from "@/components/admin/DeleteButton";
import EmptyState from "@/components/admin/EmptyState";
import PageHeader from "@/components/admin/PageHeader";
import StatusToggle from "@/components/admin/StatusToggle";
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
        <div className="border-t border-md-outline-variant stagger-list">
          {rows.map((p) => {
            const isDraft = p.status !== "published";
            return (
              <AdminRow
                key={p.slug}
                href={`/admin/work/${p.slug}/edit`}
                title={p.title}
                description={p.description}
                muted={isDraft}
                meta={
                  <>
                    <span className="tabular-nums">#{p.sortOrder}</span>
                    <span>{p.buildStatus}</span>
                    <span>
                      {p.links} {p.links === 1 ? "link" : "links"}
                    </span>
                    {p.featured && (
                      <span className="text-md-primary">Featured</span>
                    )}
                    {isDraft && <span>Draft</span>}
                    <span className="tabular-nums">
                      {adminDate(p.dateCreated)}
                    </span>
                  </>
                }
                actions={
                  <>
                    <StatusToggle
                      slug={p.slug}
                      status={p.status}
                      apiPath="work"
                    />
                    <DeleteButton slug={p.slug} name={p.title} apiPath="work" />
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
