// One-shot migration: drizzle/0012_profile_experience.sql
// Additive and idempotent, so the running site keeps working before the code
// that reads the column is deployed.
const { Client } = require("pg");
const fs = require("node:fs");

(async () => {
  const sql = fs.readFileSync("drizzle/0012_profile_experience.sql", "utf8");
  const c = new Client({
    // Public first: `railway run` injects the internal hostname, which only
    // resolves inside Railway's network, not from a laptop.
    connectionString:
      process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();
  await c.query(sql);
  const r = await c.query(
    "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name='profile' ORDER BY ordinal_position",
  );
  console.log("profile columns now:");
  for (const row of r.rows) {
    console.log("  " + row.column_name.padEnd(14) + row.data_type);
  }
  await c.end();
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
