// Ghi cac hinh moi vao dung cho cua chung trong bai.
//
// Doc mot file JSON dang { "<slug>": ["<svg…>", "<svg…>", …] } va thay lan
// luot tung khoi ```render``` trong bai theo dung thu tu. So luong phai khop
// tuyet doi: thieu hoac thua mot cai la dung lai, vi ghi lech mot hinh nghia
// la moi hinh sau no deu sai cho.
//
// Luon sao luu noi dung cu ra file truoc khi ghi.
//
//   node scripts/push-figures.cjs <file.json> --dry
//   railway run --service database node scripts/push-figures.cjs <file.json>

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

function replaceFences(md, svgs) {
  let i = 0;
  const out = md.replace(/```render\b([^\n]*)\n[\s\S]*?```/g, (whole, info) => {
    if (i >= svgs.length) {
      throw new Error(`bai co nhieu hinh hon so hinh moi (${svgs.length})`);
    }
    const svg = svgs[i++];
    return "```render" + info + "\n" + svg.trim() + "\n```";
  });
  if (i !== svgs.length) {
    throw new Error(`bai co ${i} hinh nhung nhan duoc ${svgs.length}`);
  }
  return out;
}

(async () => {
  const backup = {};
  for (const [slug, svgs] of Object.entries(payload)) {
    const r = await pool.query(
      "select content from posts where slug = $1",
      [slug],
    );
    if (!r.rows[0]) throw new Error(`khong co bai "${slug}"`);
    const md = r.rows[0].content || "";
    backup[slug] = md;
    const next = replaceFences(md, svgs);
    console.log(
      `${slug}: ${svgs.length} hinh · ${md.length} -> ${next.length} ky tu` +
        (dry ? "  (dry)" : ""),
    );
    if (!dry) {
      await pool.query("update posts set content = $2 where slug = $1", [
        slug,
        next,
      ]);
    }
  }
  if (!dry) {
    const out = path.join(__dirname, `_figures-backup-${Date.now()}.json`);
    fs.writeFileSync(out, JSON.stringify(backup, null, 2));
    console.log(`\nsao luu noi dung cu -> ${path.basename(out)}`);
  }
  await pool.end();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
