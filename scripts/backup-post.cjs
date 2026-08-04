// Dump one post row to a JSON file before overwriting it.
const { Pool } = require("pg");
const fs = require("fs");
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const slug = process.argv[2];
const out = process.argv[3] || `backup-${slug}.json`;
(async () => {
  const r = await pool.query("SELECT * FROM posts WHERE slug = $1", [slug]);
  if (!r.rows[0]) throw new Error(`no post with slug ${slug}`);
  fs.writeFileSync(out, JSON.stringify(r.rows[0], null, 2));
  console.log("columns:", Object.keys(r.rows[0]).join(", "));
  console.log(`wrote ${out}`);
  await pool.end();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
