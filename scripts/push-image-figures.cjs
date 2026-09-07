// Doi mot anh markdown thanh mot khoi ```render``` chua SVG viet thang trong
// bai.
//
// Vi sao doi: mot anh nam trong <img> la mot tai lieu roi, khong doc duoc bien
// CSS cua trang, nen no khong theo duoc che do sang/toi. Mot khoi render thi
// theo duoc. Chi doi khi anh do KHONG co alt — alt duoc render thanh chu thich
// duoi hinh, va mot khoi render khong co cho de chua no.
//
// Nhan mot file JSON dang:
//   { "<slug>": [ { "src": "<mot phan cua duong dan cu>", "svg": "<svg…>" } ] }
//
//   node scripts/push-image-figures.cjs <file.json> --dry
//   railway run --service database node scripts/push-image-figures.cjs <f.json>

const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");

const file = process.argv[2];
const dry = process.argv.includes("--dry");
if (!file) {
  console.error("can duong dan toi file JSON");
  process.exit(1);
}
const payload = JSON.parse(fs.readFileSync(file, "utf8"));

const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: process.env.DATABASE_PUBLIC_URL ? { rejectUnauthorized: false } : false,
});

(async () => {
  const backup = {};
  for (const [slug, items] of Object.entries(payload)) {
    const r = await pool.query("select content from posts where slug = $1", [
      slug,
    ]);
    if (!r.rows[0]) throw new Error(`khong co bai "${slug}"`);
    let md = r.rows[0].content || "";
    backup[slug] = md;

    for (const { src, svg } of items) {
      // Tim dung mot the anh mang duong dan nay. Neu khong tim thay, hoac tim
      // thay nhieu hon mot, thi dung — thay nham mot cho la sai ca bai.
      const re = new RegExp(
        `!\\[([^\\]]*)\\]\\([^)\\s]*${src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^)\\s]*\\)`,
        "g",
      );
      const hits = md.match(re) || [];
      if (hits.length !== 1) {
        throw new Error(`${slug}: "${src}" khop ${hits.length} cho, can dung 1`);
      }
      const alt = /!\[([^\]]*)\]/.exec(hits[0])[1];
      if (alt.trim()) {
        throw new Error(
          `${slug}: "${src}" co alt ("${alt}") — alt hien ra thanh chu thich, ` +
            "doi sang khoi render se mat no",
        );
      }
      md = md.replace(re, "```render\n" + svg.trim() + "\n```");
    }
    console.log(
      `${slug}: ${items.length} anh -> khoi render` + (dry ? "  (dry)" : ""),
    );
    if (!dry) {
      await pool.query("update posts set content = $2 where slug = $1", [
        slug,
        md,
      ]);
    }
  }
  if (!dry) {
    const out = path.join(__dirname, `_imgfig-backup-${Date.now()}.json`);
    fs.writeFileSync(out, JSON.stringify(backup, null, 2));
    console.log(`\nsao luu noi dung cu -> ${path.basename(out)}`);
  }
  await pool.end();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
