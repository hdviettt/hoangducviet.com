// Apply one or more hand-written SQL migrations.
//
// There is no psql on the Windows machine this repo is developed on, and the
// existing applier hardcodes its file list. This takes them as arguments:
//
//   railway run --service database node scripts/apply-migration.cjs \
//     drizzle/0010_cms_folders.sql
//
// Each file runs inside a transaction, so a failure half way leaves nothing
// behind. The migrations are written to be idempotent (IF NOT EXISTS), so
// re-running one is safe.
const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");

const files = process.argv.slice(2);
if (!files.length) {
  console.error("Usage: node scripts/apply-migration.cjs <file.sql> ...");
  process.exit(1);
}

const url = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("No DATABASE_PUBLIC_URL / DATABASE_URL in env.");
  process.exit(1);
}
const pool = new Pool({
  connectionString: url,
  ssl: url.includes("localhost") ? undefined : { rejectUnauthorized: false },
});

(async () => {
  const client = await pool.connect();
  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.resolve(file), "utf8");
      process.stdout.write(`${path.basename(file)} ... `);
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("COMMIT");
        console.log("applied");
      } catch (e) {
        await client.query("ROLLBACK");
        console.log("FAILED");
        throw e;
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
