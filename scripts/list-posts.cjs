const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
(async () => {
  const r = await pool.query(
    "SELECT slug, title, status, date_created, length(coalesce(content,'')) AS chars FROM posts ORDER BY date_created ASC",
  );
  for (const row of r.rows) console.log(JSON.stringify(row));
  await pool.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
