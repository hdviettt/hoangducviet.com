import MediaCarousel from "@/components/widgets/MediaCarousel";
import type { Project } from "@/lib/projects";
import Link from "next/link";

// One /work section, kept deliberately compact so the writing feed below it reads
// with equal weight: a title, a one-line description, and the project's media if
// any. The full stack lives on the deep-dive page.
export default function WorkSection({
  project,
}: {
  project: Project;
  index?: number;
}) {
  const href = `/work/${project.slug}`;

  return (
    <section>
      <div className="max-w-[760px]">
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
