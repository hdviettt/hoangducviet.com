// One-off: insert a standalone post from a frontmatter markdown file as a DRAFT.
//
//   railway run --service database node scripts/push-post.cjs <file.md>            # dry run
//   railway run --service database node scripts/push-post.cjs <file.md> --commit   # write
//
// Frontmatter (slug/title/description/date_created) maps to columns; the body is
// stored verbatim as `content` (markdown, including ```render fences). New rows
// land status='draft'. ON CONFLICT (slug) updates content/title/description only,
// never status, so it can be re-run safely without republishing anything.
const fs = require("node:fs");
const { Pool } = require("pg");

const COMMIT = process.argv.includes("--commit");
const FILE =
  process.argv.find((a) => a.endsWith(".md")) ||
  "C:/Users/admin/AppData/Local/Temp/claude/C--Users-admin-Desktop-workspace/62e9790c-7484-40fc-a2e4-a32e292e6ae1/scratchpad/pa-post-illustrated.md";

const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function parseFrontmatter(input) {
  const raw = input.replace(/^﻿/, "").replace(/\r\n/g, "\n");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n+([\s\S]*)$/);
  if (!m) throw new Error("missing frontmatter");
  const body = m[2].replace(/\s+$/, "");
  const fm = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    fm[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { fm, body };
}

(async () => {
  const raw = fs.readFileSync(FILE, "utf8");
  const { fm, body } = parseFrontmatter(raw);
  const slug = fm.slug;
  const title = fm.title;
  const description = fm.description || null;
  const dateCreated = fm.date_created || null;
  if (!slug || !title) throw new Error("frontmatter needs slug and title");

  const figures = (body.match(/```render/g) || []).length;
  const cur = await pool.query(
    "SELECT slug, status, length(coalesce(content,'')) AS chars FROM posts WHERE slug = $1",
    [slug],
  );

  console.log(`[${COMMIT ? "COMMIT" : "DRY RUN"}] ${FILE}`);
  console.log(`  slug:        ${slug}`);
  console.log(`  title:       ${title}`);
  console.log(`  description: ${(description || "").slice(0, 90)}${(description || "").length > 90 ? "…" : ""}`);
  console.log(`  content:     ${body.length} chars, ${figures} render figures`);
  console.log(`  date:        ${dateCreated || "(now)"}`);
  console.log(
    `  existing:    ${cur.rows.length ? `YES (status=${cur.rows[0].status}, ${cur.rows[0].chars} chars) -> will UPDATE content/title/description, keep status` : "no -> will INSERT as draft"}`,
  );

  if (!COMMIT) {
    console.log("\n  Dry run only. Re-run with --commit to write.");
    await pool.end();
    return;
  }

  await pool.query(
    `INSERT INTO posts (slug, title, description, content, status, date_created)
     VALUES ($1, $2, $3, $4, 'draft', COALESCE($5::timestamptz, NOW()))
     ON CONFLICT (slug) DO UPDATE
       SET title = EXCLUDED.title,
           description = EXCLUDED.description,
           content = EXCLUDED.content,
           date_updated = NOW()`,
    [slug, title, description, body, dateCreated],
  );
  const check = await pool.query(
    "SELECT id, slug, status, length(content) AS chars FROM posts WHERE slug = $1",
    [slug],
  );
  console.log("\n  WROTE:", JSON.stringify(check.rows[0]));
  console.log(`  Draft is at /admin (status=draft). Public URL when published: /posts/${slug}`);
  await pool.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
