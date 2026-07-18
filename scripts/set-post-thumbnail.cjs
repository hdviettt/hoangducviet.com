// Set a post's thumbnail. Usage:
//   railway run --service database node scripts/set-post-thumbnail.cjs <slug> <url|null>
const { Pool } = require("pg");

const [slug, url] = process.argv.slice(2);
if (!slug || !url) {
  console.error("usage: node scripts/set-post-thumbnail.cjs <slug> <url|null>");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
});

(async () => {
  const r = await pool.query(
    "UPDATE posts SET thumbnail = $1 WHERE slug = $2 RETURNING slug, thumbnail",
    [url === "null" ? null : url, slug],
  );
  if (r.rowCount === 0) {
    console.error("no post with slug:", slug);
    process.exit(1);
  }
  console.log(JSON.stringify(r.rows[0]));
  await pool.end();
})();
