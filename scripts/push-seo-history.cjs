// Push the draft body, description and cover for the SEO-content-history post.
//
// Status is written explicitly as "draft" and never anything else: the body is
// full of unresolved placeholders and the IP clause behind it has not been read.
const { Pool } = require("pg");
const fs = require("fs");

const SLUG = "a-brief-history-of-seo-content-writing-with-ai";
const DESCRIPTION =
  "Four architectures for one job: get a model to write SEO articles a human editor would publish. The one that shipped is the least impressive of the four.";
const THUMBNAIL = `/covers/${SLUG}.svg`;

const src = process.argv[2];
if (!src) throw new Error("usage: push-seo-history.cjs <content.md>");
const content = fs.readFileSync(src, "utf8");

const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  const before = await pool.query(
    "SELECT status, length(content) AS len FROM posts WHERE slug = $1",
    [SLUG],
  );
  if (!before.rows[0]) throw new Error(`no post with slug ${SLUG}`);
  console.log(`before: status=${before.rows[0].status} content=${before.rows[0].len} chars`);

  const r = await pool.query(
    `UPDATE posts
        SET content = $2, description = $3, thumbnail = $4,
            status = 'draft', date_updated = now()
      WHERE slug = $1
      RETURNING status, thumbnail, length(content) AS len, length(description) AS dlen`,
    [SLUG, content, DESCRIPTION, THUMBNAIL],
  );
  const a = r.rows[0];
  console.log(`after:  status=${a.status} content=${a.len} chars description=${a.dlen} chars`);
  console.log(`        thumbnail=${a.thumbnail}`);
  await pool.end();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
