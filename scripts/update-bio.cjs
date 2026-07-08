// One-off: refresh the homepage/About hero bio (profile.description) so it no
// longer repeats the "AI Leader at SEONGON" role chip now shown in the hero.
// Run: railway run --service database node scripts/update-bio.cjs
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const NEW_BIO =
  "<p>21, based in Vietnam. I help companies actually ship AI — not just demo it — and I write about how search and AI really work underneath.</p>";

(async () => {
  const before = await pool.query(
    "SELECT description FROM profile ORDER BY id LIMIT 1",
  );
  console.log("=== BEFORE (backup) ===");
  console.log(before.rows[0] ? before.rows[0].description : "(no row)");

  await pool.query(
    "UPDATE profile SET description = $1 WHERE id = (SELECT id FROM profile ORDER BY id LIMIT 1)",
    [NEW_BIO],
  );

  const after = await pool.query(
    "SELECT description FROM profile ORDER BY id LIMIT 1",
  );
  console.log("=== AFTER ===");
  console.log(after.rows[0].description);
  await pool.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
