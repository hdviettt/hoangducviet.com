// Update the six series posts' content from assembled markdown files (slug in frontmatter).
const fs = require("node:fs");
const { Pool } = require("pg");

const DIR = "C:/Users/admin/AppData/Local/Temp/claude/C--Users-admin-Desktop-workspace/62e9790c-7484-40fc-a2e4-a32e292e6ae1/scratchpad";
const FILES = ["pa1-final.md", "pa2-final.md", "pa3-final.md", "pa4-final.md", "pa5-final.md", "pa6-final.md"];

const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function parseFm(input) {
  const raw = input.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n+([\s\S]*)$/);
  if (!m) throw new Error("missing frontmatter");
  const fm = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i !== -1) fm[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { fm, body: m[2].replace(/\s+$/, "") };
}

(async () => {
  for (const f of FILES) {
    const { fm, body } = parseFm(fs.readFileSync(`${DIR}/${f}`, "utf8"));
    const r = await pool.query(
      `UPDATE posts SET content=$1, title=$2, description=$3, date_updated=now() WHERE slug=$4 RETURNING id`,
      [body, fm.title, fm.description || null, fm.slug],
    );
    const figs = (body.match(/```render/g) || []).length;
    console.log(`${r.rowCount ? "updated" : "NOT FOUND"}  ${fm.slug}  (${body.length} chars, ${figs} placeholders)`);
  }
  const check = await pool.query(
    `SELECT p.slug, p.status, length(coalesce(p.content,'')) chars
       FROM series_posts sp JOIN posts p ON p.slug = sp.post_slug
      WHERE sp.series_slug=$1 ORDER BY p.date_created`,
    ["an-agentic-system-for-creating-presentations"],
  );
  console.log("\nseries parts:");
  for (const r of check.rows) console.log(`  ${r.chars.toString().padStart(6)}ch  ${r.status}  ${r.slug}`);
  await pool.end();
})().catch((e) => { console.error(e); process.exit(1); });
