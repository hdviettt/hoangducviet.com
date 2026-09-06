// Sua duong dan anh bia cua series dang tro vao file khong ton tai.
//
// series.thumbnail dang la /covers/building-a-mini-search-engine.svg, nhung
// file that ten la series-building-a-mini-search-engine.svg — tien to "series-"
// bi rot mat luc nhap lieu. Hau qua: og:image va truong image trong JSON-LD
// cua trang collection deu tra ve 404.
//
//   node scripts/fix-series-thumbnail.cjs --dry
//   railway run --service database node scripts/fix-series-thumbnail.cjs

const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");

const dry = process.argv.includes("--dry");
const COVERS = path.join(__dirname, "..", "public", "covers");

async function main() {
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: process.env.DATABASE_PUBLIC_URL ? { rejectUnauthorized: false } : false,
  });

  const { rows } = await pool.query(
    "select slug, thumbnail from series where thumbnail is not null",
  );

  for (const row of rows) {
    const current = row.thumbnail;
    if (!current.startsWith("/covers/")) continue;
    const file = current.split("?")[0].slice("/covers/".length);
    if (fs.existsSync(path.join(COVERS, file))) {
      console.log(`${row.slug}: ${current} — ok`);
      continue;
    }
    const prefixed = `series-${file}`;
    if (!fs.existsSync(path.join(COVERS, prefixed))) {
      console.log(`${row.slug}: ${current} — KHONG co ca ban co tien to`);
      continue;
    }
    const next = `/covers/${prefixed}`;
    console.log(`${row.slug}: ${current} -> ${next}${dry ? " (dry)" : ""}`);
    if (!dry) {
      await pool.query("update series set thumbnail = $2 where slug = $1", [
        row.slug,
        next,
      ]);
    }
  }

  await pool.end();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
