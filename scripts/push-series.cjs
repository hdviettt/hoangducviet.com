const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");

const DRY_RUN = !process.argv.includes("--commit");
const REWRITTEN_DIR = path.join(process.cwd(), "scripts", "series", "rewritten");

const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n+([\s\S]*)$/);
  if (!m) throw new Error("missing frontmatter");
  const fmRaw = m[1];
  const body = m[2].replace(/\s+$/, "");
  const fm = {};
  for (const line of fmRaw.split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    fm[key] = value;
  }
  return { fm, body };
}

(async () => {
  const files = fs.readdirSync(REWRITTEN_DIR).filter((f) => f.endsWith(".md"));
  console.log(
    `${DRY_RUN ? "[DRY RUN]" : "[COMMIT]"} ${files.length} files in ${REWRITTEN_DIR}\n`,
  );

  for (const file of files) {
    const raw = fs.readFileSync(path.join(REWRITTEN_DIR, file), "utf8");
    const { fm, body } = parseFrontmatter(raw);
    const slug = fm.slug;
    if (!slug) {
      console.log(`SKIP ${file}: no slug in frontmatter`);
      continue;
    }

    const cur = await pool.query(
      "SELECT title, description, length(coalesce(content,'')) AS chars FROM posts WHERE slug = $1",
      [slug],
    );
    if (cur.rows.length === 0) {
      console.log(`SKIP ${slug}: not found in DB`);
      continue;
    }

    const before = cur.rows[0].chars;
    const after = body.length;
    const delta = after - before;
    const sign = delta >= 0 ? "+" : "";
    console.log(
      `${slug}\n  ${before} → ${after} chars (${sign}${delta})`,
    );

    if (fm.title && fm.title !== cur.rows[0].title) {
      console.log(`  title: "${cur.rows[0].title}" → "${fm.title}"`);
    }
    if (fm.description !== undefined && fm.description !== cur.rows[0].description) {
      const oldDesc = cur.rows[0].description || "(empty)";
      console.log(`  description: "${oldDesc}" → "${fm.description}"`);
    }

    if (!DRY_RUN) {
      await pool.query(
        `UPDATE posts
            SET content = $1,
                title = $2,
                description = $3,
                date_updated = NOW()
          WHERE slug = $4`,
        [body, fm.title || cur.rows[0].title, fm.description || null, slug],
      );
      console.log("  UPDATED");
    }
    console.log("");
  }

  await pool.end();
  if (DRY_RUN) {
    console.log("Dry run only. Re-run with --commit to apply.");
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
