import { KitDots, flattenStack } from "@/components/work/StackChips";
import { darkTwin } from "@/lib/figure-theme";
import type { Project } from "@/lib/projects";
import Link from "next/link";

/**
 * One project as a compact card: media on top, pitch underneath.
 *
 * The companion to FeaturedWork, not a replacement for it. A page with six
 * projects rendered as six full-width split blocks is 3148px of identical
 * rhythm, and the complaint about it is exactly right: the container never
 * changes, so every project reads as the one before it.
 *
 * blog.google answers this by NOT varying the card. Measured on its "More
 * updates" section, every card there is the same tonal fill, the same 16px
 * radius, the same proportions; what differs is the artwork inside, and the
 * monotony is broken by the shape of the SECTION rather than of the card —
 * two or three across instead of one after another, then a full-bleed band
 * with different proportions entirely.
 *
 * So this is the same card as the featured one, at a different scale and in a
 * different flow direction. The first projects stay full-width and carry the
 * page; the rest sit two-up, where four of them occupy the height two featured
 * blocks used to.
 *
 * The media stack mirrors FeaturedWork deliberately: same source order, same
 * light/dark twin handling, so a project does not change its picture when it
 * changes its size.
 */
export default function CompactWork({ project }: { project: Project }) {
  const href = `/work/${project.slug}`;
  const art = /\.(svg|webp|png)$/.test(project.thumbnail ?? "")
    ? (project.thumbnail as string)
    : null;
  const shown = project.media.filter((m) => m.src?.trim());
  const hero = shown[0];
  // A still frame, never a carousel. At this size a peek would cost more of
  // the picture than the neighbour it hints at is worth, and a card this small
  // has no room for dots and arrows under it.
  const still =
    art || (hero?.type === "image" ? hero.src : hero?.poster) || null;
  const stack = flattenStack(project.stack, project.techTags);
  const twin = still ? darkTwin(still) : null;

  return (
    <article className="fw-mini">
      {still && (
        <Link href={href} className="fw-mini__media group">
          <img
            src={still}
            alt={project.title}
            loading="lazy"
            decoding="async"
            className={`w-full transition-transform duration-500 ease-md-standard group-hover:scale-[1.02]${
              twin ? " fig-light" : ""
            }`}
          />
          {twin && (
            <img
              src={twin}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="fig-dark w-full transition-transform duration-500 ease-md-standard group-hover:scale-[1.02]"
            />
          )}
        </Link>
      )}

      <div className="fw-mini__body">
        {/* The slot is always here, even for a project with no topics. One card
            in the current set has none, and without a reserved row its title
            started 38px above its neighbour's — in a two-up grid that reads as
            a mistake rather than as a project that happens to be untagged. */}
        <ul className="mb-2.5 flex min-h-[1.75rem] flex-wrap items-center gap-2">
          {project.categories.slice(0, 2).map((c) => (
            <li key={c.slug}>
              <Link
                href={`/topics/${c.slug}`}
                className="state-layer inline-flex items-center rounded-full bg-md-surface-container-high px-3 py-1.5 text-[0.75rem] leading-4 text-md-on-surface transition-colors hover:text-primary"
              >
                {c.title}
              </Link>
            </li>
          ))}
        </ul>

        <h3 className="text-balance text-[1.1875rem] font-normal leading-[1.25] tracking-[-0.014em] text-md-on-surface">
          <Link
            href={href}
            className="rounded-sm transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            {project.title}
          </Link>
        </h3>

        {project.description && (
          // Clamped, not truncated by the CMS. The description is written for
          // the featured block and is too long here, but a card that ends
          // mid-sentence is better than four cards of different heights: the
          // grid reads as a set only while the cards line up.
          <p className="mt-2.5 line-clamp-3 text-[0.875rem] leading-[1.5] text-md-on-surface-variant">
            {project.description}
          </p>
        )}

        {(project.models.length > 0 || stack.length > 0) && (
          <div className="mt-4">
            <KitDots
              models={project.models}
              stack={stack}
              maxModels={4}
              maxStack={4}
            />
          </div>
        )}
      </div>
    </article>
  );
}
