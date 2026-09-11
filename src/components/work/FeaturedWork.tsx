import { Icon } from "@/components/ui/Icon";
import FeaturedClip from "@/components/work/FeaturedClip";
import { KitDots, flattenStack } from "@/components/work/StackChips";
import { darkTwin } from "@/lib/figure-theme";
import type { Project } from "@/lib/projects";
import Link from "next/link";

/**
 * One project as a split editorial block: the pitch on a narrow left rail, the
 * media on a wide right one, 1:2 so the media carries the row.
 *
 * The one format for a project anywhere it is introduced — the homepage's
 * "Selected work" and the /work index both render this. They used to differ:
 * /work had its own component with a full-bleed carousel under each title. Two
 * pages introducing the same project two ways reads as two products.
 *
 * The right rail is the part worth explaining. Only one of these projects has
 * anything to photograph — a runtime and a credential store do not look like
 * anything — so where there is no screenshot the same slot renders the
 * project's own numbers instead, in the same rounded box at roughly the same
 * footprint. Two treatments, one silhouette, which reads as a decision rather
 * than as a missing image.
 *
 * Deliberately NOT MediaCarousel here: that component is built to break out
 * past the prose measure full-bleed, so inside a grid cell it overflows its
 * column and drags its rail and captions out of alignment. A teaser wants one
 * still frame; the carousel belongs on the project page.
 */
export default function FeaturedWork({ project }: { project: Project }) {
  const href = `/work/${project.slug}`;
  // Four fallbacks, strongest first: a hero image set as the thumbnail, then
  // the first media item (clip or screenshot), then the project's own numbers.
  const art = /\.(svg|webp|png)$/.test(project.thumbnail ?? "")
    ? (project.thumbnail as string)
    : null;
  // Thu tu nguon anh, va day la hop dong voi CMS: thumbnail thang neu co, roi
  // den media dau tien (anh hay clip deu duoc), cuoi cung moi la bang so.
  // Media dau tien CO NGUON. Mot dong `{src: "", type: "video"}` — CMS luu hut
  // khi nguoi dung them dong media roi chua gan file — van la mot phan tu that
  // trong mang, nen `media[0]` nhan no, roi khoi featured render mot the video
  // khong co nguon va cot phai trong tron. Do dung la thu da xay ra voi
  // agentic-ai-platform tren prod.
  const hero = project.media.find((m) => m.src?.trim());
  const clip = hero?.type === "video" ? hero : null;
  const shot = hero?.type === "image" ? hero : null;
  // Four is what every project carries and what the 2x2 grid is built for; the
  // slice stops a fifth from silently breaking the panel.
  const metrics = project.metrics.slice(0, 4);
  // Topics, or nothing. The eyebrow used to derive "Platform · 19 agents" from
  // a project's children and print "Project" for everyone else — one claim
  // about containment that the prose now makes, and one word that told a
  // reader nothing they could not see. An untagged project simply opens with
  // its title.
  const topics = project.categories.map((c) => c.title);

  const stack = flattenStack(project.stack, project.techTags);
  // Khong anh, khong clip, khong so lieu thi khong co cot phai. Thieu cai nay,
  // mot du an bi xoa het metrics trong CMS se render ra mot <dl> rong, tuc la
  // mot vach mau mong nam giua trang.
  const visual = Boolean(art || hero || metrics.length > 0);

  return (
    // Three columns, not twelve. A 12-column grid with an 80px gap has eleven
    // gutters, so 880px of a 1320px row is gutter and the art column collapses
    // to about 742px. Three columns has two gutters, and the 1:2 split then
    // means what it says.
    <article className="grid grid-cols-1 items-start gap-10 md:grid-cols-3 md:gap-12 lg:gap-16">
      <div className={visual ? "md:col-span-1" : "md:col-span-2"}>
        {/* Chips when the project is tagged, the derived line when it is not.
            Not links: nothing on this site answers /topics/seo, and a chip that
            looks clickable and lands on a 404 is worse than a chip that does
            not. They become links the day an archive exists to point at.

            `rounded-full` with a filled surface and no border, because the
            outlined chip in this codebase already means something else — it is
            the stack row further down the same block, where a border and a
            logo carry a tool. Two chip shapes for two different jobs. */}
        {topics.length > 0 && (
          <ul className="mb-3 flex flex-wrap gap-2.5">
            {topics.map((t) => (
              <li
                key={t}
                className="inline-flex items-center rounded-full bg-md-surface-container-high px-4 py-2 text-[0.8125rem] leading-5 text-md-on-surface"
              >
                {t}
              </li>
            ))}
          </ul>
        )}

        <h3 className="max-w-[17ch] text-balance text-[1.4375rem] font-normal leading-[1.22] tracking-[-0.25px] text-md-on-surface sm:text-[1.75rem] lg:text-[2rem] max-w-[17ch] text-balance text-[1.4375rem] font-normal leading-[1.22] tracking-[-0.25px] text-md-on-surface sm:text-[1.75rem] lg:text-[2rem]">
          <Link
            href={href}
            className="rounded-sm transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            {project.title}
          </Link>
        </h3>

        {project.description && (
          <p className="mt-5 text-[0.9375rem] leading-7 text-md-on-surface-variant">
            {project.description}
          </p>
        )}

        {(project.models.length > 0 || stack.length > 0) && (
          <div className="mt-7">
            <KitDots models={project.models} stack={stack} />
          </div>
        )}

        <Link
          href={href}
          className="md-btn md-btn-outlined md-btn-pill md-btn-lg mt-8 no-underline"
        >
          View project
          <Icon name="arrow_forward" size={20} aria-hidden="true" />
        </Link>
      </div>

      <div className="md:col-span-2">
        {!visual ? null : art ? (
          // Purpose-drawn hero art, and the whole point of it is that it has no
          // frame: it sits on the page's own ground the way blog.google's
          // artwork does. A rounded box around the same pixels reads smaller,
          // because the eye measures the box and not the drawing. Light and
          // dark twins are stacked and swapped by CSS, since an <img> cannot
          // read the page theme.
          <Link href={href} className="group block overflow-hidden rounded-2xl">
            <img
              src={art}
              alt={project.title}
              loading="lazy"
              decoding="async"
              className={`w-full transition-transform duration-500 ease-md-standard group-hover:scale-[1.015]${
                darkTwin(art) ? " fig-light" : ""
              }`}
            />
            {darkTwin(art) && (
              <img
                src={darkTwin(art) as string}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="fig-dark w-full transition-transform duration-500 ease-md-standard group-hover:scale-[1.015]"
              />
            )}
          </Link>
        ) : clip ? (
          // A clip from the CMS. Same box as a screenshot, and the same crop
          // rule: 16:9, cover, anchored top-left, because a UI recording has
          // its content in the top-left and letterboxing it would shrink the
          // only part worth seeing.
          <Link href={href} className="group block overflow-hidden rounded-xl">
            <FeaturedClip
              src={clip.src}
              label={clip.caption || project.title}
              className="aspect-[3/2] w-full object-cover object-left-top transition-transform duration-500 ease-md-standard group-hover:scale-[1.02]"
            />
          </Link>
        ) : shot ? (
          // A screenshot is not art: it has hard edges and a white ground, so
          // it still needs the box that the art does not.
          <Link href={href} className="group block overflow-hidden rounded-xl">
            <img
              src={shot.src}
              alt={shot.caption || project.title}
              loading="lazy"
              decoding="async"
              className={`aspect-[3/2] w-full object-cover object-left-top transition-transform duration-500 ease-md-standard group-hover:scale-[1.02]${
                darkTwin(shot.src) ? " fig-light" : ""
              }`}
            />
            {/* The generated art arrives through this branch, not the one
                above: `thumbnail` is null on every project and the drawing is
                media[0]. An uploaded screenshot comes through here too and has
                no twin, which is what `darkTwin` returning null is for. */}
            {darkTwin(shot.src) && (
              <img
                src={darkTwin(shot.src) as string}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="fig-dark aspect-[3/2] w-full object-cover object-left-top transition-transform duration-500 ease-md-standard group-hover:scale-[1.02]"
              />
            )}
          </Link>
        ) : (
          // No fixed aspect ratio: a two-line metric label overflows a locked
          // 16:9 box and gets clipped at the bottom. A minimum height keeps the
          // panel roughly the footprint of a screenshot, and a long label is
          // allowed to push it taller instead of losing a word.
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-md-outline-variant">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="flex min-h-[9.375rem] flex-col justify-center bg-md-surface-container-low px-7 py-8 sm:min-h-[11.875rem] sm:px-9"
              >
                <dd className="text-[1.75rem] font-normal leading-none tracking-[-0.02em] text-md-on-surface sm:text-[2.1875rem]">
                  {m.value}
                </dd>
                <dt className="mt-3 text-[0.875rem] leading-[1.4] text-md-on-surface-variant">
                  {m.label}
                </dt>
              </div>
            ))}
          </dl>
        )}
      </div>
    </article>
  );
}
