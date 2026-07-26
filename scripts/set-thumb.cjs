const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const slug = process.argv[2];
const thumb = process.argv[3]; // full value, e.g. /covers/foo.webp?v=23
(async () => {
  const cur = await pool.query("SELECT thumbnail FROM posts WHERE slug = $1", [slug]);
  console.log("was:", JSON.stringify(cur.rows[0]));
  const r = await pool.query(
    "UPDATE posts SET thumbnail = $2, date_updated = NOW() WHERE slug = $1 RETURNING slug, thumbnail",
    [slug, thumb],
  );
  console.log("now:", JSON.stringify(r.rows[0]));
  await pool.end();
})().catch((e) => { console.error(e); process.exit(1); });
