const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const slug = process.argv[2];
const title = process.argv[3];
(async () => {
  const r = await pool.query(
    "UPDATE posts SET title = $2 WHERE slug = $1 RETURNING slug, title",
    [slug, title],
  );
  console.log(JSON.stringify(r.rows[0], null, 2));
  await pool.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
