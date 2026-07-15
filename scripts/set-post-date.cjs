// One-off: set a post's date_created. Usage:
//   railway run --service database node scripts/set-post-date.cjs <slug> <iso-date>
const { Pool } = require("pg");

const [slug, iso] = process.argv.slice(2);
if (!slug || !iso || Number.isNaN(Date.parse(iso))) {
  console.error("usage: node scripts/set-post-date.cjs <slug> <iso-date>");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
});

(async () => {
  const r = await pool.query(
    "UPDATE posts SET date_created = $1 WHERE slug = $2 RETURNING slug, status, date_created",
    [iso, slug],
  );
  if (r.rowCount === 0) {
    console.error("no post with slug:", slug);
    process.exit(1);
  }
  console.log(JSON.stringify(r.rows[0]));
  await pool.end();
})();
