const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const slug = process.argv[2];
(async () => {
  const r = await pool.query(
    "SELECT slug, title, description, status, date_created, content FROM posts WHERE slug = $1",
    [slug],
  );
  console.log(JSON.stringify(r.rows[0], null, 2));
  await pool.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
