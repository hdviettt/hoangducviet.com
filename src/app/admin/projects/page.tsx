import { db } from "@/db";
import { projects } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const allProjects = await db
    .select()
    .from(projects)
    .orderBy(desc(projects.dateCreated));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium">Projects</h1>
        <Link
          href="/admin/projects/new"
          className="bg-primary text-primary-foreground px-4 py-2 text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
        >
          New Project
        </Link>
      </div>

      <div className="border border-border">
        <div className="grid grid-cols-[1fr_100px_120px_80px] px-4 py-2 border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
          <span>Title</span>
          <span>Status</span>
          <span>Date</span>
          <span>Actions</span>
        </div>
        <div className="divide-y divide-border">
          {allProjects.map((project) => (
            <div
              key={project.slug}
              className="grid grid-cols-[1fr_100px_120px_80px] px-4 py-3 items-center"
            >
              <Link
                href={`/admin/projects/${project.slug}/edit`}
                className="text-sm hover:text-primary transition-colors"
              >
                {project.title}
              </Link>
              <span
                className={`text-xs px-2 py-0.5 w-fit ${
                  project.status === "published"
                    ? "text-green-500 bg-green-500/10"
                    : "text-yellow-500 bg-yellow-500/10"
                }`}
              >
                {project.status}
              </span>
              <span className="text-xs text-muted-foreground">
                {project.dateCreated?.toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })}
              </span>
              <Link
                href={`/admin/projects/${project.slug}/edit`}
                className="text-xs text-primary hover:underline"
              >
                Edit
              </Link>
            </div>
          ))}
          {allProjects.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No projects yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
