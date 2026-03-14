import ProjectsList from "@/components/ProjectsList";
import { getGlobalMetadata } from "@/lib/global";
import { type Project, getProjects } from "@/lib/projects";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const global = await getGlobalMetadata();
  const siteTitle = global && global.length > 0 ? global[0].title : "Blog";
  return {
    title: `Projects - ${siteTitle}`,
    description: "Browse our collection of projects and case studies.",
  };
}

export default async function ProjectsPage() {
  let projectsList: Project[] = [];

  try {
    projectsList = await getProjects();
  } catch (error) {
    console.error("Error fetching projects:", error);
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <ProjectsList projects={projectsList} />
    </div>
  );
}
