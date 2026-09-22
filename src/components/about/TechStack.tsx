import { LogoRow } from "@/components/work/StackChips";
import { TECH_STACK } from "@/lib/identity";

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
    // mt-14/16 to match the gap above the body: this block sits at the foot of
    // the page now, not directly under the hero, so it needs the same air the
    // body was given.
    <section className="work-breakout mt-14 border-t border-md-outline-variant pt-8 md:mt-16">
      <h2 className="mb-4 text-[0.9375rem] font-semibold tracking-[-0.005em] text-md-on-surface-variant">
        What I build with
      </h2>
      {/* Label above its marks, four groups to a row.

          Two earlier shapes were wrong in opposite directions. A grid of
          label-beside-row pairs aligned well but gave every group a row of
          its own: seven groups cost four rows and 305px, with each row
          holding about 250px of marks in a 439px cell. Flowing them inline
          fixed the height and broke the alignment -- measured, the labels
          landed on six different left edges, two of them 14px apart, which
          is the exact failure the site grid exists to prevent.

          Stacking the label puts the widest group, six marks at 251px, in a
          273px column, so four columns fit at 1188 and seven groups take two
          rows. Four clean edges instead of six scattered ones, and the
          labels line up down the page as well as across it.

          The marks stay at 36px. Six of them are monograms set at 0.29 of
          the disc, so 28px would put those at 8px, and sub-10px type is
          already on the list of things wrong here. */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 sm:gap-y-6 lg:grid-cols-4">
        {TECH_STACK.map((g) => (
          // Beside its marks in one column, above them in several. Stacking
          // buys alignment only when there are columns to align, and on a
          // phone there is one: the label would cost a line per group and
          // take the block from 396px to 649.
          <div
            key={g.group}
            className="flex items-center gap-2.5 sm:flex-col sm:items-start sm:gap-2"
          >
            <span className="whitespace-nowrap text-[0.75rem] font-medium uppercase leading-4 tracking-[0.06em] text-md-on-surface-variant">
              {g.group}
            </span>
            <LogoRow items={g.items} fixed />
          </div>
        ))}
      </div>
    </section>
  );
}
