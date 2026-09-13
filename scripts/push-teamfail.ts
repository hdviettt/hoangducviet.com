// Swap the eight screenshots in "Why our AI team failed" for the generated
// doodles. The classroom photograph at the end is left alone.
//
// Each markdown image becomes a ```render fence holding the drawing. Matching
// is done on the exact stored substring, and every mapping must match exactly
// once or nothing is written.
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SLUG = "why-our-ai-team-failed";
const APPLY = process.env.APPLY === "1";
const figs = JSON.parse(
  readFileSync(join(import.meta.dir ?? __dirname, "_teamfail.json"), "utf8"),
) as Record<string, string>;

// original asset -> generated figure
const MAP: Array<[string, string]> = [
  ["1777368521161-image.png", "ai-search"],
  ["1777365657337-image.png", "five-things"],
  ["1777966104829-image.png", "layers-intro"],
  ["1777992461038-image.png", "layers-1"],
  ["1777992475742-image.png", "layers-2"],
  ["1777992490401-image.png", "layers-3"],
  ["1777969091910-image.png", "infrastructure"],
  ["1777969905434-image.png", "vocabulary"],
];

const row = (await db.select().from(posts).where(eq(posts.slug, SLUG)))[0];
if (!row) { console.log("post not found"); process.exit(1); }
let content = row.content as string;

// the whole markdown image line, whatever its alt text and escaping
const lineFor = (asset: string) => {
  const esc = asset.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/_/g, "\\\\?_");
  const re = new RegExp("!\\[[^\\]]*\\]\\([^)]*" + esc + "[^)]*\\)", "g");
  return content.match(re) || [];
};

console.log("--- preflight ---");
let bad = 0;
for (const [asset, key] of MAP) {
  const hits = lineFor(asset);
  const haveFig = !!figs[key];
  const ok = hits.length === 1 && haveFig;
  if (!ok) bad++;
  console.log(
    "  " + (ok ? "ok  " : "FAIL") + "  " + asset.padEnd(30) +
    " -> " + key.padEnd(16) + hits.length + " match(es)" + (haveFig ? "" : "  MISSING FIGURE"),
  );
}
const kept = content.match(/!\[[^\]]*\]\([^)]*img_v3[^)]*\)/g) || [];
console.log("  keep  classroom photo: " + kept.length + " match(es)");
if (bad) { console.log("\n" + bad + " problem(s); nothing written."); process.exit(1); }
if (!APPLY) { console.log("\npreflight clean. set APPLY=1 to write."); process.exit(0); }

for (const [asset, key] of MAP) {
  const [line] = lineFor(asset);
  content = content.replace(line, "```render\n" + figs[key] + "\n```");
}

const before = (row.content as string).length;
writeFileSync(
  join(import.meta.dir ?? __dirname, `_backup-${SLUG}.md`),
  row.content as string,
  "utf8",
);
await db.update(posts).set({ content }).where(eq(posts.slug, SLUG));

const after = (await db.select().from(posts).where(eq(posts.slug, SLUG)))[0].content as string;
console.log("\n--- written ---");
console.log("  content " + before + " -> " + after.length + " chars");
console.log("  render fences: " + (after.match(/```render/g) || []).length);
console.log("  markdown images left: " + (after.match(/!\[[^\]]*\]\(/g) || []).length + " (should be 1, the photo)");
console.log("  backup: scripts/_backup-" + SLUG + ".md");
process.exit(0);
