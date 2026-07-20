// Create or update a DRAFT post from a markdown file. Never touches status
// of an already-published post. Usage:
//   railway run --service database node scripts/upsert-draft-post.cjs \
//     <slug> <content-file> --title "..." [--description "..."] [--thumbnail /covers/x.svg]
const fs = require("node:fs");
const { Pool } = require("pg");

const args = process.argv.slice(2);
const slug = args[0];
const contentFile = args[1];
function flag(name) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
}
const title = flag("title");
const description = flag("description");
const thumbnail = flag("thumbnail");

if (!slug || !contentFile || !title) {
  console.error(
    'usage: node scripts/upsert-draft-post.cjs <slug> <content-file> --title "..." [--description "..."] [--thumbnail url]',
  );
  process.exit(1);
}
const content = fs.readFileSync(contentFile, "utf8");

const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
});

(async () => {
  const r = await pool.query(
    `INSERT INTO posts (slug, title, description, content, thumbnail, status, date_created)
     VALUES ($1, $2, $3, $4, $5, 'draft', NOW())
     ON CONFLICT (slug) DO UPDATE SET
       title = EXCLUDED.title,
       description = COALESCE(EXCLUDED.description, posts.description),
       content = EXCLUDED.content,
       thumbnail = COALESCE(EXCLUDED.thumbnail, posts.thumbnail),
       date_updated = NOW()
     RETURNING slug, status, length(content) AS chars, thumbnail`,
    [slug, title, description ?? null, content, thumbnail ?? null],
  );
  console.log(JSON.stringify(r.rows[0]));
  await pool.end();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
