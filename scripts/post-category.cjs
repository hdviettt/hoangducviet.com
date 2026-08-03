const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const slug = process.argv[2];
const removeCat = process.argv[3]; // optional: category_slug to remove
(async () => {
  const post = await pool.query("SELECT id FROM posts WHERE slug = $1", [slug]);
  if (!post.rows[0]) {
    console.log("post not found");
    process.exit(1);
  }
  const pid = post.rows[0].id;
  const cats = await pool.query(
    "SELECT category_slug FROM posts_categories WHERE post_id = $1",
    [pid],
  );
  console.log("current:", JSON.stringify(cats.rows.map((r) => r.category_slug)));
  if (removeCat) {
    const r = await pool.query(
      "DELETE FROM posts_categories WHERE post_id = $1 AND category_slug = $2 RETURNING *",
      [pid, removeCat],
    );
    console.log("removed rows:", r.rowCount, "->", removeCat);
    const after = await pool.query(
      "SELECT category_slug FROM posts_categories WHERE post_id = $1",
      [pid],
    );
    console.log("now:", JSON.stringify(after.rows.map((r) => r.category_slug)));
  }
  await pool.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
