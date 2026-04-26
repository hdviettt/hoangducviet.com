const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  const posts = await pool.query(
    `SELECT slug, title, status, length(coalesce(description,'')) AS desc_len
       FROM posts
      WHERE status = 'published'
      ORDER BY date_created DESC`,
  );
  console.log("PUBLISHED POSTS — description audit:");
  for (const r of posts.rows) {
    const flag = r.desc_len === 0 ? " ← MISSING" : "";
    console.log(`  [${String(r.desc_len).padStart(4)}] ${r.slug}${flag}`);
  }

  const projs = await pool.query(
    `SELECT slug, title, status, length(coalesce(summary,'')) AS sum_len
       FROM projects
      ORDER BY date_created DESC`,
  );
  console.log("\nPROJECTS — summary audit:");
  for (const r of projs.rows) {
    const flag = r.sum_len === 0 ? " ← MISSING" : "";
    console.log(`  [${String(r.sum_len).padStart(4)}] ${r.slug} (${r.status})${flag}`);
  }

  await pool.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
