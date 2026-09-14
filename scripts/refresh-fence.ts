// Replace one already-placed figure in a post, matched by its unique filter id.
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { readFileSync } from "node:fs";
import { join } from "node:path";
const SLUG = process.argv[2], KEY = process.argv[3], UID = process.argv[4];
const figs = JSON.parse(readFileSync(join((import.meta as any).dir ?? __dirname, "_teamfail.json"), "utf8"));
const row = (await db.select().from(posts).where(eq(posts.slug, SLUG)))[0];
let c = row.content as string;
const marker = `rough-${SLUG}-${UID}`;
const at = c.indexOf(marker);
if (at < 0) { console.log("marker not found: " + marker); process.exit(1); }
const start = c.lastIndexOf("<svg", at);
const end = c.indexOf("</svg>", at) + "</svg>".length;
if (start < 0 || end < 6) { console.log("could not bound the svg"); process.exit(1); }
const before = c.slice(start, end).length;
c = c.slice(0, start) + figs[KEY] + c.slice(end);
await db.update(posts).set({ content: c }).where(eq(posts.slug, SLUG));
console.log(`replaced ${KEY} (uid ${UID}): ${before} -> ${figs[KEY].length} chars`);
process.exit(0);
