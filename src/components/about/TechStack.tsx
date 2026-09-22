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
      {/* The groups flow as one block rather than sitting in a grid of
          label-and-row pairs.

          The grid gave each group a row of its own, so seven groups cost
          four rows at 1188px and the section ran to 305px. It also left the
          rows badly short of their columns: each held about 250px of marks in
          a 439px cell. Inline, a label and its marks are one unit that wraps
          where it runs out of room, which packs the same 31 marks into two
          lines.

          The marks stay at 36px. They carry monogram labels -- SQL, UMAP, Hd
          -- set at 0.29 of the disc, so 28px would put those at 8px. The
          height had to come out of the layout, not out of the type. */}
      <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
        {TECH_STACK.map((g) => (
          <div key={g.group} className="flex items-center gap-2.5">
            <span className="whitespace-nowrap text-[0.8125rem] font-medium text-md-on-surface-variant">
              {g.group}
            </span>
            <LogoRow items={g.items} fixed />
          </div>
        ))}
      </div>
    </section>
  );
}
