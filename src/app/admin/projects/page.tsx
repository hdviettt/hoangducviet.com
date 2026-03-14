import { db } from "@/db";
import { projects } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import StatusToggle from "@/components/admin/StatusToggle";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const allProjects = await db.select().from(projects).orderBy(desc(projects.dateCreated));

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium">projects</h1>
        <Link
          href="/admin/projects/new"
          className="text-sm bg-primary text-primary-foreground px-4 py-1.5 hover:opacity-90 transition-opacity"
        >
          + new project
        </Link>
      </div>

      <div className="border border-border divide-y divide-border">
        {allProjects.map((project) => (
          <div
            key={project.slug}
            className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors"
          >
            <StatusToggle slug={project.slug} status={project.status} apiPath="projects" />
            <Link
              href={`/admin/projects/${project.slug}/edit`}
              className="text-sm flex-1 hover:text-primary transition-colors"
            >
              {project.title}
            </Link>
            <span className={`text-xs ${project.status === "published" ? "text-green-500" : "text-yellow-500"}`}>
              {project.status}
            </span>
            <span className="text-xs text-muted-foreground w-24 text-right">
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
  );
}
