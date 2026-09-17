import { Icon } from "@/components/ui/Icon";
import MediaCarousel from "@/components/widgets/MediaCarousel";
import FeaturedClip from "@/components/work/FeaturedClip";
import { LogoRow, flattenStack } from "@/components/work/StackChips";
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
  // Every media row that actually has a file. A project with more than one
  // becomes a carousel here rather than showing its first item and hiding the
  // rest on its own page, which is what it used to do.
  const shown = project.media.filter((m) => m.src?.trim());
  const hero = shown[0];
  const clip = hero?.type === "video" ? hero : null;
  const shot = hero?.type === "image" ? hero : null;
  // Four is what every project carries and what the 2x2 grid is built for; the
  // slice stops a fifth from silently breaking the panel.
  const metrics = project.metrics.slice(0, 4);
  // Models first, then the tools, deduped by name and capped at five. Models
  // lead because "what does it think with" is the question a reader of this
  // site actually has; the tools are the answer to a follow-up.
  const marks = (() => {
    const seen = new Set<string>();
    return [...project.models, ...flattenStack(project.stack, project.techTags)]
      .filter((it) => {
        if (seen.has(it.name)) return false;
        seen.add(it.name);
        return true;
      })
      .slice(0, 5);
  })();
  // Topics, or nothing. The eyebrow used to derive "Platform · 19 agents" from
  // a project's children and print "Project" for everyone else — one claim
  // about containment that the prose now makes, and one word that told a
  // reader nothing they could not see. An untagged project simply opens with
  // its title.

  // Khong anh, khong clip, khong so lieu thi khong co cot phai. Thieu cai nay,
  // mot du an bi xoa het metrics trong CMS se render ra mot <dl> rong, tuc la
  // mot vach mau mong nam giua trang.
  const visual = Boolean(art || hero || metrics.length > 0);
  // Two or more files is a set, and a set is a carousel. One file is one file:
  // reserving peek space for a neighbour that does not exist shrinks the only
  // thing there is to look at.
  const isSet = shown.length > 1;

  return (
    // Three columns, not twelve. A 12-column grid with an 80px gap has eleven
    // gutters, so 880px of a 1320px row is gutter and the art column collapses
    // to about 742px. Three columns has two gutters, and the 1:2 split then
    // means what it says.
    <article
      className={`fw-card ${visual ? "fw-card--split" : ""}`}
    >
      {/* Four parts: chips, heading, media, then the rest of the prose. On a
          phone the card is one column and DOM order wins, so the media lands
          directly under the title instead of after the whole pitch — it used
          to sit 611px below it at 390px wide. From 900 up the rows put chips,
          head and body in the left column with the media spanning the title
          and body rows in the right one. See .fw-card in globals.css for why
          the block stopped using .site-grid. */}
      <div className="fw-panel">

      {/* The chips are their own grid row now, and the media starts at the row
          below them. Before this the media spanned rows 1-2 and row 1 began at
          the chips, so a 1934px screenshot lined its top edge up with a 36px
          tag instead of with the title. Measured: media top 689 against title
          top 737, a 48px disagreement that read as the picture floating too
          high. Nothing is offset by hand; the row boundary does it. */}
      <div className="fw-title">
        <h3 className="max-w-[17ch] text-balance text-[1.4375rem] font-normal leading-[1.22] tracking-[-0.25px] text-md-on-surface sm:text-[1.75rem] lg:text-[2rem]">
          <Link
            href={href}
            className="rounded-sm transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            {project.title}
          </Link>
        </h3>
      </div>


      <div className="fw-body">
        {project.description && (
          // Six lines, which is what fits beside the picture at 1440: the media
          // is 399px tall and the chips, title and button spend 208 of it, so
          // six 28px lines fill the rest exactly. Four was too tight and put an
          // ellipsis mid-sentence on copy that is only a little long.
          //
          // This is a ceiling, not a plan. The budget at this width is about
          // 290 characters; past that the clamp keeps the card from stretching
          // but the sentence is better cut in the CMS than cut here.
          <p className="mt-5 line-clamp-6 text-[0.9375rem] leading-7 text-md-on-surface-variant">
            {project.description}
          </p>
        )}

        {marks.length > 0 && (
          // Five logos, one row, no labels. The two labelled rows this replaces
          // were ~110px on a card whose picture is the point; this is 28px and
          // still answers "what is it made of" at a glance. The full stack,
          // grouped and uncapped, is on /work/[slug].
          <div className="mb-7 mt-6">
            <LogoRow items={marks} />
          </div>
        )}

      </div>

        <Link
          href={href}
          className="md-btn md-btn-outlined md-btn-pill md-btn-lg mt-8 no-underline"
        >
          View project
          <Icon name="arrow_forward" size={20} aria-hidden="true" />
        </Link>
      </div>

      <div className="fw-media">
        {isSet ? (
          // Not wrapped in a Link: the slides scroll and the controls are
          // buttons, so a link around them would swallow both. The title and
          // the View project button already go to the project.
          <div className="work-carousel">
            <MediaCarousel
              items={shown.map((m) => ({
                src: m.src,
                type: m.type,
                poster: m.poster,
                caption: m.caption,
              }))}
              label={`${project.title}: media`}
            />
          </div>
        ) : !visual ? null : art ? (
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
          // A clip from the CMS, at its own aspect ratio.
          //
          // This used to lock a 3:2 box and `object-cover` from the top-left.
          // Every uploaded file is 16:9-ish (measured 1.61 to 1.80), so that
          // threw away 7 to 17 percent of each one off the right and bottom
          // edges — the side of a UI recording where the panel being
          // demonstrated usually is. Showing the whole frame costs a little
          // vertical rhythm and is worth it.
          <Link
            href={href}
            className="group block overflow-hidden rounded-[var(--md-sys-shape-corner-large-max)] ring-1 ring-inset ring-md-outline-variant"
          >
            <FeaturedClip
              src={clip.src}
              poster={clip.poster}
              label={clip.caption || project.title}
              className="w-full transition-transform duration-500 ease-md-standard group-hover:scale-[1.02]"
            />
          </Link>
        ) : shot ? (
          // A screenshot is not art: it has hard edges and a white ground, so
          // it still needs the rounded box that the art does not. What it does
          // not need is a crop — see the clip branch above.
          // 24px and a hairline ring, where this was a 16px radius on a
          // transparent box. Sampled at 2x, the corner of a UI screenshot on
          // the white page was white meeting white: the box the comment above
          // says a screenshot needs was being drawn, but nothing made it
          // visible, so the 16px radius had no edge to round. The ring gives
          // the screenshot the boundary the art deliberately does without, and
          // 24px is the radius deepmind.google and blog.google use on a
          // content card (--shape-corner-lg), against the 16 this had.
          <Link
            href={href}
            className="group block overflow-hidden rounded-[var(--md-sys-shape-corner-large-max)] ring-1 ring-inset ring-md-outline-variant"
          >
            <img
              src={shot.src}
              alt={shot.caption || project.title}
              loading="lazy"
              decoding="async"
              className={`w-full transition-transform duration-500 ease-md-standard group-hover:scale-[1.02]${
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
                className="fig-dark w-full transition-transform duration-500 ease-md-standard group-hover:scale-[1.02]"
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
                <dt className="mt-3 text-[0.9375rem] leading-[1.4] text-md-on-surface-variant">
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
