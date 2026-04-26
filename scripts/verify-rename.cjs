const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL,
  ssl: { rejectUnauthorized: false },
});
(async () => {
  console.log("posts.slug values:");
  const r1 = await pool.query(
    "SELECT slug, status FROM posts WHERE status='published' ORDER BY date_created DESC",
  );
  for (const row of r1.rows) console.log(" -", row.slug, "|", row.status);
  console.log("\nseries_posts links:");
  const r2 = await pool.query(
    "SELECT series_slug, post_slug FROM series_posts ORDER BY series_slug, post_slug",
  );
  for (const row of r2.rows)
    console.log(" -", row.series_slug, "→", row.post_slug);
  await pool.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
