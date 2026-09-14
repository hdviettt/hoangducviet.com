// Swap five of the seven images in the blueprint post.
//
// The two under "Evaluating existing frameworks" stay exactly as they are:
// they are other people's diagrams, quoted as evidence, and redrawing someone
// else's framework in my own hand would quietly misrepresent it.
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SLUG = "an-artifact-driven-ai-initiative-blueprint";
const APPLY = process.env.APPLY === "1";
const dir = (import.meta as any).dir ?? __dirname;
const figs = JSON.parse(readFileSync(join(dir, "_blueprint.json"), "utf8")) as Record<string, string>;

const MAP: Array<[string, string]> = [
  ["1784085092594-image.png", "five-things"],
  ["1784099192082-image.png", "three-layers"],
  ["1784109197979-fig-D-artifact-anatomy.png", "anatomy"],
  ["1784109169565-fig-C-fog-vs-solid.png", "fog-solid"],
  ["1784109238687-fig-G-nodes-edges.png", "nodes-edges"],
];
// the quoted frameworks, which must survive untouched
const KEEP = ["img_v3_0211m", "1784085721188-image.png"];

const row = (await db.select().from(posts).where(eq(posts.slug, SLUG)))[0];
if (!row) { console.log("post not found"); process.exit(1); }
let content = row.content as string;

// stored markdown escapes underscores, so allow an optional backslash before one
const lineFor = (asset: string) => {
  const esc = asset
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/_/g, "\\\\?_");
  return content.match(new RegExp("!\\[[^\\]]*\\]\\([^)]*" + esc + "[^)]*\\)", "g")) || [];
};

console.log("--- preflight ---");
let bad = 0;
for (const [asset, key] of MAP) {
  const hits = lineFor(asset);
  const ok = hits.length === 1 && !!figs[key];
  if (!ok) bad++;
  console.log("  " + (ok ? "ok  " : "FAIL") + "  " + asset.slice(0, 42).padEnd(43) +
    "-> " + key.padEnd(14) + hits.length + " match(es)" + (figs[key] ? "" : "  MISSING FIGURE"));
}
for (const k of KEEP) {
  const n = (content.match(new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
  console.log("  keep  " + k.padEnd(43) + n + " match(es)");
}
if (bad) { console.log("\n" + bad + " problem(s); nothing written."); process.exit(1); }
if (!APPLY) { console.log("\npreflight clean. set APPLY=1 to write."); process.exit(0); }

for (const [asset, key] of MAP) {
  const line = lineFor(asset)[0];
  if (!line) continue;
  content = content.replace(line, "```render\n" + figs[key] + "\n```");
}

writeFileSync(join(dir, `_backup-${SLUG}.md`), row.content as string, "utf8");
await db.update(posts).set({ content }).where(eq(posts.slug, SLUG));

const after = (await db.select().from(posts).where(eq(posts.slug, SLUG)))[0].content as string;
console.log("\n--- written ---");
console.log("  render fences: " + (after.match(/```render/g) || []).length);
console.log("  markdown images left: " + (after.match(/!\[[^\]]*\]\(/g) || []).length +
  " (should be 2, the quoted frameworks)");
for (const k of KEEP) {
  console.log("  kept " + k + ": " + (after.includes(k) ? "yes" : "NO"));
}
process.exit(0);
