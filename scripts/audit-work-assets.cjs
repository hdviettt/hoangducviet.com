// Truoc khi xoa bat cu file nao trong public/work: hoi CSDL that xem con cho
// nao dang tro vao no khong. Quet moi cot van ban co the chua duong dan, khong
// chi cot media cua projects.
const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");

const DIR = path.join(__dirname, "..", "public", "work");
const files = fs.readdirSync(DIR).filter((f) => !f.startsWith("."));

const QUERIES = [
  ["projects.media", "select slug as id, media::text as body from projects"],
  ["projects.content", "select slug as id, content as body from projects"],
  [
    "projects.stack",
    "select slug as id, stack::text || models::text as body from projects",
  ],
  ["posts.content", "select slug as id, content as body from posts"],
  ["posts.thumbnail", "select slug as id, thumbnail as body from posts"],
  ["series.thumbnail", "select slug as id, thumbnail as body from series"],
  [
    "series.description",
    "select slug as id, coalesce(description,'') || coalesce(summary,'') as body from series",
  ],
  ["media.url", "select id::text as id, url as body from media"],
  [
    "profile",
    "select id::text as id, coalesce(image,'') || coalesce(about_html,'') as body from profile",
  ],
];

async function main() {
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: process.env.DATABASE_PUBLIC_URL ? { rejectUnauthorized: false } : false,
  });

  const hits = new Map(files.map((f) => [f, []]));
  for (const [label, sql] of QUERIES) {
    let rows;
    try {
      rows = (await pool.query(sql)).rows;
    } catch (e) {
      console.log(`(bo qua ${label}: ${e.message})`);
      continue;
    }
    for (const row of rows) {
      const body = row.body || "";
      for (const f of files) {
        if (body.includes(f)) hits.get(f).push(`${label}:${row.id}`);
      }
    }
  }

  const used = [];
  const unused = [];
  for (const f of files) {
    const where = hits.get(f);
    (where.length ? used : unused).push([f, where]);
  }

  console.log(`--- DUNG (${used.length}) ---`);
  for (const [f, where] of used) console.log(`${f}\n    ${where.join(", ")}`);
  console.log(`\n--- KHONG AI TRO VAO (${unused.length}) ---`);
  let bytes = 0;
  for (const [f] of unused) {
    const size = fs.statSync(path.join(DIR, f)).size;
    bytes += size;
    console.log(`${f}  ${(size / 1024).toFixed(0)} KB`);
  }
  console.log(`\ntong: ${(bytes / 1024 / 1024).toFixed(2)} MB`);

  await pool.end();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
