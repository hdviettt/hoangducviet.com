import { Mark, hasMark } from "@/components/home/logo-marks";
import type { ProjectLogo } from "@/db/schema";
import { Fragment } from "react";

export function LetterMark({ text }: { text: string }) {
  return (
    <span className="inline-flex h-[1.0625rem] min-w-[1.0625rem] shrink-0 items-center justify-center rounded-[0.3125rem] bg-md-on-surface/[0.07] px-[0.1875rem] font-mono text-[0.53125rem] font-semibold leading-none text-md-on-surface-variant">
      {text}
    </span>
  );
}

// Resolve a brand logo from a tool's name, so a project's stack renders logos
// without every DB row needing an explicit `mark`. Names are matched loosely.
const NAME_TO_MARK: Array<[RegExp, string]> = [
  [/fastapi/, "fastapi"],
  [/python/, "python"],
  [/(^|\W)next\.?js/, "nextjs"],
  [/react/, "react"],
  [/postgres|pgvector/, "postgres"],
  [/wordpress/, "wordpress"],
  [/supabase/, "supabase"],
  [/claude|anthropic|agent sdk/, "claude"],
  [/gpt|openai|text-embedding/, "gpt"],
  [/gemini/, "gemini"],
  [/deepseek/, "deepseek"],
  [/(llama|groq)/, "meta"],
  [
    /(ms-?marco|minilm|cross-?encoder|sentence-?transformers|hugging\s?face)/,
    "huggingface",
  ],
  [/voyage/, "voyageai"],
  [/onnx/, "onnx"],
  [/redis/, "redis"],
  [/vercel/, "vercel"],
  [/(^|\W)zod/, "zod"],
  [/pglite/, "pglite"],
  [/cloudflare|(^|\W)r2/, "r2"],
  [/(^|\W)e2b/, "e2b"],
  [/tavily/, "tavily"],
  [/dataforseo/, "dataforseo"],
  [/qwen/, "qwen"],
  [/grok|(^|\W)xai/, "grok"],
  [/n8n/, "n8n"],
  [/unsloth/, "unsloth"],
  [/(^|\W)mcp($|\W)|model context protocol/, "mcp"],
  [/google doc/, "googledocs"],
  [/typescript/, "typescript"],
  [/tailwind/, "tailwindcss"],
  [/drizzle/, "drizzle"],
  [/railway/, "railway"],
  [/docker/, "docker"],
  // Word-bounded: "bun" is three letters that turn up inside other words, and a
  // loose match would put Bun's logo on anything containing them.
  [/(^|\W)bun($|\W)/, "bun"],
  // Vercel's gateway, so it wears Vercel's mark rather than a monogram.
  [/ai gateway/, "vercel"],
];

function resolveMark(it: ProjectLogo): string | undefined {
  if (it.mark && hasMark(it.mark)) return it.mark;
  const name = it.name.toLowerCase();
  for (const [re, mark] of NAME_TO_MARK) {
    if (re.test(name) && hasMark(mark)) return mark;
  }
  return undefined;
}

// A short monogram badge for a tool with no brand logo, so every chip carries a
// mark and the stack reads as a considered set rather than a mix of logos and
// bare text.
function monogram(name: string): string {
  const clean = name
    .replace(/[+.,].*$/, "")
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return name.slice(0, 3).toUpperCase();
  const first = words[0];
  if (/^[A-Z0-9]{2,4}$/.test(first)) return first; // acronym stands alone
  if (words.length >= 2) return (first[0] + words[1][0]).toUpperCase();
  if (first.length <= 3) return first.toUpperCase();
  return first[0].toUpperCase() + first.slice(1, 2).toLowerCase();
}

// A row of solid, premium brand-logo / monogram chips. Each is a small filled
// card so the stack reads as considered hardware, not faint outlines. Shared by
// the /work showcase sections and the project deep-dive reference.
export function Chips({ items }: { items: ProjectLogo[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((it) => {
        const mark = resolveMark(it);
        const letter = mark ? null : it.letter || monogram(it.name);
        return (
          <li
            key={it.name}
            className="inline-flex items-center gap-2 rounded-[0.6875rem] border border-md-outline-variant bg-md-surface-container-high px-3 py-[0.4375rem] text-[0.78125rem] font-medium leading-none text-md-on-surface shadow-[0_1px_2px_rgba(16,24,40,0.06)]"
          >
            {mark ? (
              // `mono` giong het hang dia o trang chu. Truoc day chip o trang
              // du an dung mau thuong hieu con dia o ngoai dung mot muc, nen
              // cung mot bo cong cu doc ra la hai bo khac nhau khi nguoi doc
              // bam tu ngoai vao trong.
              <Mark
                id={mark}
                mono
                className="h-[1rem] w-[1rem] text-md-on-surface"
              />
            ) : (
              <LetterMark text={letter as string} />
            )}
            <span>{it.name}</span>
          </li>
        );
      })}
    </ul>
  );
}

// A logo-only view of the same set: small discs that carry the kit without
// spending a line of text on it. Names live in the tooltip, so the row reads as
// a texture at rest and becomes a list on demand.
//
// The marks run monochrome here. A dozen brand hues in two short rows read as a
// sticker sheet and pull harder than the project title above them; in a set,
// the silhouettes are what tell the tools apart, so one ink is enough and the
// rows sit quiet. `Chips` on the project page keeps the colour, where a logo
// gets a whole labelled card to itself.
//
// CSS-only, deliberately. This renders inside a server component, and a
// tooltip that needs a client bundle to say "PostgreSQL" is a bad trade.
function Dot({ item }: { item: ProjectLogo }) {
  const mark = resolveMark(item);
  const letter = mark ? null : item.letter || monogram(item.name);
  return (
    <li className="group relative">
      <span
        aria-hidden="true"
        className="stack-dot flex items-center justify-center rounded-full border border-md-outline-variant bg-md-surface-container-high text-md-on-surface group-hover:border-md-outline"
      >
        {mark ? (
          <Mark id={mark} mono />
        ) : (
          <span className="stack-mono font-mono font-semibold leading-none text-md-on-surface-variant">
            {letter}
          </span>
        )}
      </span>
      {/* The name is real text, not an aria-label on the disc: at zero opacity
          it still sits in the accessibility tree, so a screen reader reads this
          row as the list of tool names it is, and the pointer gets the same
          names as a tooltip. No tabindex on a decorative disc, and no JS.

          Left-aligned to its own disc rather than centred on it. Centred is
          prettier and wrong here: the pill is wider than the 32px disc, so on
          the first dot in a row half of a name like "ms-marco MiniLM
          cross-encoder" hangs off the left edge of the page. Growing rightwards,
          it has the rest of the row and the artwork column to spill into.
          `stack-tip` is what reveals it, and it lives in globals.css because it
          has to sit inside `@media (hover: hover)` — see the rule there. */}
      <span className="stack-tip pointer-events-none absolute bottom-[calc(100%+8px)] left-0 z-10 whitespace-nowrap rounded-md bg-md-inverse-surface px-2.5 py-1.5 text-[0.75rem] font-medium leading-none text-md-inverse-on-surface opacity-0 shadow-md-2 transition-opacity duration-150 ease-md-standard">
        {item.name}
      </span>
    </li>
  );
}

// Dedupe on what the disc will actually look like, not on the tool's name.
// Claude and Claude Agent SDK are two rows in the DB and one logo on screen,
// and two identical discs read as a rendering bug rather than as two tools.
// `taken` carries the marks an earlier row already spent, so a model never
// shows up again among the tools underneath it.
function pick(items: ProjectLogo[], max: number, taken: Set<string>) {
  const uniq = items.filter((it) => {
    const key = resolveMark(it) ?? `letter:${it.letter || monogram(it.name)}`;
    if (taken.has(key)) return false;
    taken.add(key);
    return true;
  });
  // Real logos take the visible slots. Order in the DB is grouped by concern,
  // not by fame, so a straight slice spent two of eight discs on `Fk` and `Ai`
  // while Postgres, R2 and E2B fell into the overflow. A stable partition keeps
  // the caller's order inside each half and lets the `+N` absorb the anonymous
  // ones, which is what a reader loses least by not seeing.
  const ordered = [
    ...uniq.filter((it) => resolveMark(it)),
    ...uniq.filter((it) => !resolveMark(it)),
  ];
  return {
    shown: ordered.slice(0, max),
    rest: Math.max(0, ordered.length - max),
  };
}

function Row({ shown, rest }: { shown: ProjectLogo[]; rest: number }) {
  return (
    <ul className="stack-row flex flex-wrap items-center">
      {shown.map((it) => (
        <Dot key={it.name} item={it} />
      ))}
      {rest > 0 && (
        <li className="stack-more flex items-center rounded-full border border-md-outline-variant bg-md-surface-container-high px-2.5 font-mono font-medium leading-none text-md-on-surface-variant">
          +{rest}
        </li>
      )}
    </ul>
  );
}

// The two rows a project is actually made of. Mixing them was hiding the one
// distinction a reader of this site cares about — which models it thinks with,
// and what it is built out of — behind a single undifferentiated strip. Two
// labelled rows on one baseline grid say it without a sentence.
export function KitDots({
  models,
  stack,
  maxModels = 5,
  maxStack = 7,
}: {
  models: ProjectLogo[];
  stack: ProjectLogo[];
  maxModels?: number;
  maxStack?: number;
}) {
  // One `taken` across both calls, models first: a mark the models row spends
  // is theirs, and the tools row drops it rather than drawing the same logo
  // twice down the column.
  const taken = new Set<string>();
  const rows = [
    { label: "Models", ...pick(models, maxModels, taken) },
    { label: "Built with", ...pick(stack, maxStack, taken) },
  ].filter((r) => r.shown.length > 0);
  if (rows.length === 0) return null;

  return (
    <dl className="kit-dots grid grid-cols-[auto_1fr] items-center">
      {rows.map((r) => (
        <Fragment key={r.label}>
          <dt className="text-md-on-surface-variant">{r.label}</dt>
          <dd>
            <Row shown={r.shown} rest={r.rest} />
          </dd>
        </Fragment>
      ))}
    </dl>
  );
}

// Every item as a logo, nothing elided. `KitDots` caps a row with `+N` because
// a project card has one line to spend and the tools past it are the ones a
// reader loses least by not seeing. A page section has no such budget: if a
// group holds six tools, the point of the section is that it holds six tools.
//
// The name is real text at zero opacity rather than a `title` or an aria-label,
// so a screen reader reads the row as the list of names it is, and the pointer
// gets the same string. See `.stack-dot` and `.stack-tip` in globals.css for the
// reveal, which is gated on a pointer that can actually hover.
export function LogoRow({
  items,
  fixed = false,
}: {
  items: ProjectLogo[];
  fixed?: boolean;
}) {
  return (
    <ul
      className={`stack-row flex flex-wrap items-center ${
        fixed ? "stack-row--fixed" : ""
      }`}
    >
      {items.map((it) => (
        <Dot key={it.name} item={it} />
      ))}
    </ul>
  );
}

// Flatten a grouped stack into a single chip list (for compact card views),
// falling back to legacy flat techTags when stack is empty.
export function flattenStack(
  stack: { group: string; items: ProjectLogo[] }[],
  techTags?: string[] | null,
): ProjectLogo[] {
  const flat = stack.flatMap((g) => g.items);
  if (flat.length > 0) return flat;
  return (techTags ?? []).map((name) => ({ name }));
}
