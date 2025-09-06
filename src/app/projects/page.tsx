import type { Metadata } from "next";
import { getGlobalMetadata } from "@/lib/directus";
import { getProjects, type Project } from "@/lib/projects";
import ProjectsList from "@/components/ProjectsList";

export const runtime = 'edge';

export async function generateMetadata(): Promise<Metadata> {
  const global = await getGlobalMetadata();
  return {
    title: `Projects - ${global.title}`,
    description: "Browse our collection of projects and case studies.",
  }
}

export default async function ProjectsPage() {
  let projects: Project[] = [];

  try {
    projects = await getProjects({
      fields: ["slug", "title", "date_created"],
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <ProjectsList projects={projects} />
    </div>
  );
}