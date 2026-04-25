const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
(async () => {
  const globalR = await pool.query("SELECT * FROM global");
  const profileR = await pool.query("SELECT * FROM profile");
  console.log(JSON.stringify({ global: globalR.rows, profile: profileR.rows }, null, 2));
  await pool.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
