import MediaCarousel from "@/components/widgets/MediaCarousel";
import type { Project } from "@/lib/projects";
import Link from "next/link";

// One /work section, kept deliberately compact so the writing feed below it reads
// with equal weight: a title, a one-line description, the project's media if any,
// and a link into the deep-dive. The full stack lives on the deep-dive page.

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

export default function WorkSection({
  project,
  parent,
}: {
  project: Project;
  index?: number;
  parent?: { title: string; slug: string };
}) {
  const href = `/work/${project.slug}`;

  return (
    <section>
      <div className="max-w-[760px]">
        <HeaderTags parent={parent} status={project.buildStatus} />
        <Link href={href} className="group block w-fit">
          <h2 className="text-[28px] font-medium leading-[1.1] tracking-[-0.02em] text-md-on-surface transition-colors group-hover:text-primary sm:text-[32px]">
            {project.title}
          </h2>
        </Link>
        {project.description && (
          <p className="mt-4 max-w-[64ch] text-[16px] leading-[1.55] text-md-on-surface-variant">
            {project.description}
          </p>
        )}
      </div>

      {project.media.length > 0 && (
        <div className="work-carousel mt-8">
          <MediaCarousel
            items={project.media.map((m) => ({
              src: m.src,
              caption: m.caption,
              type: m.type,
              fit: "cover",
            }))}
            ratio="16 / 9"
            mat="ambient"
            label={`${project.title} media`}
          />
        </div>
      )}
    </section>
  );
}
