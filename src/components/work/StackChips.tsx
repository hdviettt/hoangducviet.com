import { Mark, hasMark } from "@/components/home/logo-marks";
import type { ProjectLogo } from "@/db/schema";

export function LetterMark({ text }: { text: string }) {
  return (
    <span className="inline-flex h-[17px] min-w-[17px] shrink-0 items-center justify-center rounded-[5px] bg-md-on-surface/[0.07] px-[3px] font-mono text-[8.5px] font-semibold leading-none text-md-on-surface-variant">
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
  [/(ms-?marco|minilm|cross-?encoder|sentence-?transformers|hugging\s?face)/, "huggingface"],
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
            className="inline-flex items-center gap-2 rounded-[11px] border border-md-outline-variant bg-md-surface-container-high px-3 py-[7px] text-[12.5px] font-medium leading-none text-md-on-surface shadow-[0_1px_2px_rgba(16,24,40,0.06)]"
          >
            {mark ? (
              <Mark id={mark} className="h-[16px] w-[16px] text-md-on-surface" />
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
