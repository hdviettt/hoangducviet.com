// Apply a hand-written drizzle migration .sql file via the pg client.
// Use this until the drizzle snapshot is re-baselined and `drizzle-kit migrate` is safe.
//
// Usage: railway run --service database node scripts/apply-sql-migration.cjs drizzle/<file>.sql

const { Pool } = require("pg");
const fs = require("node:fs");
const path = require("node:path");

(async () => {
  const sqlFile = process.argv[2];
  if (!sqlFile) {
    console.error("Usage: node apply-sql-migration.cjs <path-to-sql-file>");
    process.exit(1);
  }

  const url = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_PUBLIC_URL or DATABASE_URL must be set");
    process.exit(1);
  }

  const absPath = path.resolve(sqlFile);
  const sql = fs.readFileSync(absPath, "utf8");
  const statements = sql
    .split(/-->\s*statement-breakpoint/i)
    .map((s) => s.trim())
    .filter(Boolean);

  if (statements.length === 0) {
    console.error("No statements found in file");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: url });

  try {
    console.log(`Applying ${absPath}`);
    console.log(`  ${statements.length} statement(s) inside one transaction\n`);

    await pool.query("BEGIN");
    for (let i = 0; i < statements.length; i++) {
      const preview = statements[i].slice(0, 90).replace(/\s+/g, " ");
      console.log(`[${i + 1}/${statements.length}] ${preview}${statements[i].length > 90 ? "..." : ""}`);
      await pool.query(statements[i]);
    }
    await pool.query("COMMIT");

    console.log("\nMigration applied successfully.");
  } catch (err) {
    await pool.query("ROLLBACK").catch(() => {});
    console.error("\nMigration failed:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
