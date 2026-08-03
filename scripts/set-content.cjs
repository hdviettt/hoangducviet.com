const fs = require("fs");
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const slug = process.argv[2];
const file = process.argv[3];
const content = fs.readFileSync(file, "utf8");
(async () => {
  const r = await pool.query(
    "UPDATE posts SET content = $2 WHERE slug = $1 RETURNING slug, title, length(content) AS chars",
    [slug, content],
  );
  console.log(JSON.stringify(r.rows[0], null, 2));
  await pool.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
