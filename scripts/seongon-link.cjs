const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL,
  ssl: { rejectUnauthorized: false },
});
(async () => {
  const r = await pool.query(
    `SELECT pp.post_slug, posts.title, posts.status
       FROM projects_posts pp
       JOIN posts ON posts.slug = pp.post_slug
      WHERE pp.project_slug = 're-architecting-seongon-s-value-delivery-chain-with-ai'`,
  );
  console.log("Posts linked to re-architecting-seongon:");
  for (const row of r.rows) {
    console.log(" -", row.post_slug, "|", row.status, "|", row.title);
  }
  await pool.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
