import PresentationDiagram from "@/components/work/PresentationDiagram";
import { Chips } from "@/components/work/StackChips";
import ProjectDiagram from "@/components/work/WorkDiagrams";
import SearchSystemDiagram from "@/components/work/SearchSystemDiagram";
import AgenticPlatformDiagram from "@/components/work/AgenticPlatformDiagram";
import CmsPipelineDiagram from "@/components/work/CmsPipelineDiagram";
import ClusteringDiagram from "@/components/work/ClusteringDiagram";
import QuotingDiagram from "@/components/work/QuotingDiagram";
import ContentSeoDiagram from "@/components/work/ContentSeoDiagram";
import type { Project } from "@/lib/projects";
import type { ProjectLogo } from "@/db/schema";
import Link from "next/link";
import { Fragment } from "react";

// One /work section: title and description, then a large designed architecture
// diagram (the presentation agent keeps its bespoke interactive one), then the
// stack presented as an aligned spec sheet. Real screenshots live on the
// deep-dive.

// Stack as a spec sheet: group label in a fixed left column, chips aligned in
// the column to its right, so the whole thing reads as one considered table.
function StackSheet({ project }: { project: Project }) {
  const groups: { group: string; items: ProjectLogo[] }[] = [
    ...(project.models.length > 0
      ? [{ group: "Models", items: project.models }]
      : []),
    ...project.stack,
  ];
  if (groups.length === 0) return null;
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-[max-content_1fr] sm:gap-y-3.5">
      {groups.map((g) => (
        <Fragment key={g.group}>
          <div className="text-[13.5px] font-medium text-md-on-surface-variant sm:pt-[9px]">
            {g.group}
          </div>
          <Chips items={g.items} />
        </Fragment>
      ))}
    </div>
  );
}

// A small build-status pill, shown only when a project is not fully live, so a
// live project carries no badge (the default, unremarkable state).
function StatusPill({ status }: { status: string }) {
  if (status === "wip") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-md-tertiary-container px-2.5 py-1 text-[12px] font-medium text-md-on-tertiary-container">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
        In progress
      </span>
    );
  }
  if (status === "archived") {
    return (
      <span className="inline-flex items-center rounded-full bg-md-surface-container-high px-2.5 py-1 text-[12px] font-medium text-md-on-surface-variant">
        Archived
      </span>
    );
  }
  return null;
}

// The top row: an optional link back to a parent project, and the status pill.
function HeaderTags({
  parent,
  status,
}: {
  parent?: { title: string; slug: string };
  status: string;
}) {
  const showStatus = status === "wip" || status === "archived";
  if (!parent && !showStatus) return null;
  return (
    <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
      {parent && (
        <Link
          href={`/work/${parent.slug}`}
          className="inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-md-on-surface-variant transition-colors hover:text-primary"
        >
          <span aria-hidden className="text-primary">&#8226;</span>
          On the platform
        </Link>
      )}
      <StatusPill status={status} />
    </div>
  );
}

function ExploreLink({ href, className = "" }: { href: string; className?: string }) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-1.5 text-[14.5px] font-medium text-primary hover:underline ${className}`}
    >
      Explore the project
      <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
        {"->"}
      </span>
    </Link>
  );
}

export default function WorkSection({
  project,
  parent,
}: {
  project: Project;
  index?: number;
  parent?: { title: string; slug: string };
}) {
  const href = `/work/${project.slug}`;
  const isPresentation = project.slug === "agentic-presentation-system";
  const isSearch = project.slug === "mini-search-engine";
  const isPlatform = project.slug === "agentic-ai-platform";
  const isCms = project.slug === "cms-publishing-pipeline";
  const isClustering = project.slug === "keyword-clustering";
  const isQuoting = project.slug === "seo-quoting-agent";
  const isContent = project.slug === "content-seo-ai";

  return (
    <section>
      <div className="max-w-[760px]">
        <HeaderTags parent={parent} status={project.buildStatus} />
        <Link href={href} className="group block w-fit">
          <h2 className="text-[32px] font-medium leading-[1.06] tracking-[-0.03em] text-md-on-surface transition-colors group-hover:text-primary sm:text-[42px]">
            {project.title}
          </h2>
        </Link>
        {project.description && (
          <p className="mt-5 max-w-[64ch] text-[17px] leading-[1.6] text-md-on-surface-variant">
            {project.description}
          </p>
        )}
      </div>

      <div className="work-visual mt-10 md:mt-12">
        {isPresentation ? (
          <PresentationDiagram />
        ) : isSearch ? (
          <SearchSystemDiagram />
        ) : isPlatform ? (
          <AgenticPlatformDiagram />
        ) : isCms ? (
          <CmsPipelineDiagram />
        ) : isClustering ? (
          <ClusteringDiagram />
        ) : isQuoting ? (
          <QuotingDiagram />
        ) : isContent ? (
          <ContentSeoDiagram />
        ) : (
          <ProjectDiagram slug={project.slug} />
        )}
      </div>

      <div className="mt-10 flex flex-col gap-8 md:mt-11 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
        <StackSheet project={project} />
        <ExploreLink href={href} className="shrink-0 lg:pt-1" />
      </div>
    </section>
  );
}
