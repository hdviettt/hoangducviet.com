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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-white">Projects</h1>
        <Link href="/admin/projects/new" className="admin-btn">
          New Project
        </Link>
      </div>

      <div className="admin-card p-0">
        <div className="grid grid-cols-[1fr_90px_110px_60px] px-5 py-2.5 border-b border-[#222] text-xs text-[#666] uppercase tracking-wider">
          <span>Title</span>
          <span>Status</span>
          <span>Date</span>
          <span />
        </div>
        {allProjects.map((project) => (
          <div
            key={project.slug}
            className="grid grid-cols-[1fr_90px_110px_60px] px-5 py-3 border-b border-[#222] last:border-0 items-center hover:bg-[#1a1a1a] transition-colors"
          >
            <Link
              href={`/admin/projects/${project.slug}/edit`}
              className="text-sm text-[#ccc] hover:text-white"
            >
              {project.title}
            </Link>
            <span
              className={`admin-badge ${project.status === "published" ? "admin-badge-green" : "admin-badge-yellow"}`}
            >
              {project.status}
            </span>
            <span className="text-xs text-[#666]">
              {project.dateCreated?.toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })}
            </span>
            <Link
              href={`/admin/projects/${project.slug}/edit`}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Edit
            </Link>
          </div>
        ))}
        {allProjects.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-[#666]">
            No projects yet.
          </div>
        )}
      </div>
    </div>
  );
}
