import { Chips } from "@/components/work/StackChips";
import { TECH_STACK } from "@/lib/identity";
import { Fragment } from "react";

// The same label-then-chips grid a project's "Built with" panel uses, so a tool
// reads identically whether you meet it on a project page or here. That is the
// whole point of reusing it: this block is the union of those panels, and if it
// had its own visual language it would look like a separate claim rather than
// the sum of the ones already on the site.
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
    <section className="mx-auto max-w-[880px] border-t border-md-outline-variant pt-8 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-300 fill-mode-backwards">
      <h2 className="mb-5 text-[14px] font-semibold tracking-[-0.005em] text-md-on-surface-variant">
        What I build with
      </h2>
      {/* `max-content` on the label column rather than a fixed width: the
          longest group name sets it, so the chips start at one edge without a
          magic number that breaks the day a group is renamed. Below sm the
          grid collapses to one column and each label sits above its own row. */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-[max-content_1fr] sm:gap-y-4">
        {TECH_STACK.map((g) => (
          <Fragment key={g.group}>
            {/* `-mb-2` only below sm. Stacked in one column the grid's row gap
                falls both between a label and its own chips and between one
                group and the next, so at seven groups every gap is 20px and
                nothing says which label owns which row. Pulling the label 8px
                closer to its chips is what makes the pairs read. */}
            <div className="-mb-2 text-[13.5px] font-medium text-md-on-surface-variant sm:mb-0 sm:pt-[8px]">
              {g.group}
            </div>
            <Chips items={g.items} />
          </Fragment>
        ))}
      </div>
    </section>
  );
}
