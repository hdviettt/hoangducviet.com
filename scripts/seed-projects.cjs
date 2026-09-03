// Seed the projects table from scripts/seed-projects.sql — the authoritative,
// phantom-free list of the 7 real projects with full showcase JSON. This is a
// wipe-and-rebuild seed (DELETE + INSERT), so run it deliberately for initial or
// prod (re)seeding; it replaces the project rows (and their post links).
//
// Usage: railway run --service database node scripts/seed-projects.cjs
const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");

const url = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("No DATABASE_PUBLIC_URL / DATABASE_URL in env.");
  process.exit(1);
}
const pool = new Pool({
  connectionString: url,
  ssl: url.includes("localhost") || url.includes("127.0.0.1") ? undefined : { rejectUnauthorized: false },
});

(async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, "seed-projects.sql"), "utf8");
    await pool.query(sql);
    const rows = await pool.query(
      "select slug, featured, sort_order from projects order by sort_order, slug",
    );
    console.log(`seeded ${rows.rowCount} projects:`);
    for (const r of rows.rows) {
      console.log(`  ${r.sort_order}. ${r.slug}${r.featured ? " (featured)" : ""}`);
    }
    const pp = await pool.query(
      "select count(*)::int n from project_posts",
    );
    console.log(`project_posts links: ${pp.rows[0].n}`);
  } catch (e) {
    console.error("SEED FAILED:", e.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
