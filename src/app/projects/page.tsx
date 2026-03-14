import { getProjects } from "@/lib/projects";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects",
};

export default async function ProjectsPage() {
  const projectsList = await getProjects();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-8">Projects</h1>
      <ul className="space-y-1">
        {projectsList.map((project) => (
          <li key={project.slug} className="flex items-baseline gap-4">
            <span className="text-sm text-neutral-400 shrink-0 w-12">
              {project.date_created
                ? new Date(project.date_created).getFullYear()
                : ""}
            </span>
            <Link
              href={`/projects/${project.slug}`}
              className="text-blue-600 hover:underline"
            >
              {project.title}
            </Link>
          </li>
        ))}
        {projectsList.length === 0 && (
          <li className="text-neutral-400">No projects yet.</li>
        )}
      </ul>
    </div>
  );
}
