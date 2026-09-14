import { LogoRow } from "@/components/work/StackChips";
import { TECH_STACK } from "@/lib/identity";
import { Fragment } from "react";

// Logos only, with the name behind a hover. A chip that carries both a mark and
// a word is a list you read; thirty-one of them is a wall of text pretending to
// be a graphic. The discs read as a texture at a glance, which is what a stack
// actually is, and the name is one hover away for the tool you did not
// recognise. It is the same `Dot` the homepage project cards use, so a tool
// looks the same wherever you meet it on this site.
//
// It sits directly under the intro the About page shares with the homepage.
// Someone arriving from a post knows one project's stack; the first thing the
// About page owes them is what the person defaults to, before the prose.
//
// 880px rather than the 720px the prose below it uses. 720 is a measure, and a
// measure is for lines of text you read left to right; a chip list is scanned,
// and at 720 every group of six wrapped onto a second row holding one or two
// orphans. 880 is the width this site already uses for things that are wider
// than prose on purpose, so the panel reads as a panel and not as a paragraph
// that broke.
export default function TechStack() {
  return (
    <section className="work-breakout border-t border-md-outline-variant pt-8 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-300 fill-mode-backwards">
      <h2 className="mb-5 text-[0.9375rem] font-semibold tracking-[-0.005em] text-md-on-surface-variant">
        What I build with
      </h2>
      {/* Two group-columns from lg up, one below it.

          Seven label-and-row pairs stacked in a single column spent 527px of
          height at 1440 and stopped painting at x=513 inside a 1188px panel:
          801px, two thirds of the width, held nothing. Height was the only
          axis the panel was using, and it is the expensive one, because it is
          the axis the reader has to scroll.

          `max-content 1fr` repeated puts the second pair's label on the
          midpoint, so auto-placement fills two groups per row and the seven
          become four rows. The `1fr` matters: with `auto` the columns would
          shrink to their contents and the two pairs would huddle at the left,
          which is the same waste in a smaller package.

          `max-content` on each label column rather than a fixed width: the
          longest group name in that column sets it, so the dots start at one
          edge without a magic number that breaks the day a group is renamed.
          Below sm the grid collapses to one column and each label sits above
          its own row. */}
      {/* The row gap is measured against the hover pill, not chosen. The pill
          sits 8px above its disc and stands about 24px tall, so it reaches
          32px into the row above. `gap-y-9` cleared that outright, which is
          what cost the height. It now clears by less and the pill is allowed
          to overlap: it is opaque, it is on z-10, and it is only there while a
          pointer is on the disc, which is what every tooltip does. Below sm
          the pill is `display: none` and the gap is only spacing. */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-[max-content_1fr] sm:gap-y-5 lg:grid-cols-[max-content_1fr_max-content_1fr] lg:gap-x-10 lg:gap-y-6">
        {TECH_STACK.map((g) => (
          <Fragment key={g.group}>
            {/* `-mb-2` only below sm. Stacked in one column the grid's row gap
                falls both between a label and its own chips and between one
                group and the next, so at seven groups every gap is the same
                and nothing says which label owns which row. Pulling the label
                8px closer leaves 4px under a label and 12px between groups,
                and that three-to-one is what makes the pairs read. */}
            <div className="-mb-2 text-[0.8125rem] font-medium text-md-on-surface-variant sm:mb-0 sm:pt-[0.5rem]">
              {g.group}
            </div>
            <LogoRow items={g.items} fixed />
          </Fragment>
        ))}
      </div>
    </section>
  );
}
