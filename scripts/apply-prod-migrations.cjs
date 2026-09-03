// Apply the project-showcase migrations to whatever DB this is pointed at.
// Idempotent: 0006 is CREATE TABLE IF NOT EXISTS, 0007-0009 are ADD COLUMN
// IF NOT EXISTS. Run via: railway run --service database node scripts/apply-prod-migrations.cjs
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

const FILES = [
  "0006_projects.sql",
  "0007_project_showcase.sql",
  "0008_project_parent.sql",
  "0009_project_metrics.sql",
];

(async () => {
  const client = await pool.connect();
  try {
    for (const f of FILES) {
      const sql = fs.readFileSync(path.join(__dirname, "..", "drizzle", f), "utf8");
      // strip drizzle statement-breakpoint markers; run the file as one script
      const clean = sql.replace(/-->\s*statement-breakpoint/g, "");
      process.stdout.write(`applying ${f} ... `);
      await client.query(clean);
      console.log("ok");
    }
    const cols = await client.query(
      "select column_name from information_schema.columns where table_name='projects' order by ordinal_position",
    );
    console.log("\nprojects columns now:", cols.rows.map((r) => r.column_name).join(", "));
  } catch (e) {
    console.error("\nFAILED:", e.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
