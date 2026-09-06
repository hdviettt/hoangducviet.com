// Gan featured media cho ca bay du an.
//
// Moi anh o day deu la anh chup that: thu vien agent cua platform va tung the
// agent cat ra tu do, ban ghi man hinh cua search engine, va man hinh dau cua
// presentation agent. Khong co hinh ve nao.
//
// In ra media cu truoc khi ghi, va ghi ca vao mot file JSON canh script, de
// quay lai duoc neu can.
//
//   node scripts/set-agent-media.cjs --dry        # xem truoc, khong ghi
//   node scripts/set-agent-media.cjs              # local
//   railway run --service database node scripts/set-agent-media.cjs

const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");

const MEDIA = {
  "mini-search-engine": {
    type: "image",
    src: "/work/r3d-mini-search-engine.webp",
    caption: "A field of crawled pages, and the three that come out ranked",
  },
  "agentic-ai-platform": {
    type: "image",
    src: "/work/r3d-agentic-ai-platform.webp",
    caption: "Nineteen agents standing on one runtime",
  },
  "agentic-presentation-system": {
    type: "image",
    src: "/work/r3d-agentic-presentation-system.webp",
    caption: "One brief, and the deck it fans out into",
  },
  "cms-publishing-pipeline": {
    type: "image",
    src: "/work/r3d-cms-publishing-pipeline.webp",
    caption: "A draft, the rule it has to clear, the page that comes out",
  },
  "content-seo-ai": {
    type: "image",
    src: "/work/r3d-content-seo-ai.webp",
    caption: "A stack of drafts, and the one that stood up",
  },
  "keyword-clustering": {
    type: "image",
    src: "/work/r3d-keyword-clustering.webp",
    caption: "Sixty keywords, three clusters, and two it refused to place",
  },
  "seo-quoting-agent": {
    type: "image",
    src: "/work/r3d-seo-quoting-agent.webp",
    caption: "Seven line items, and the gate every one has to reach",
  },
};

const dry = process.argv.includes("--dry");

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: process.env.DATABASE_PUBLIC_URL ? { rejectUnauthorized: false } : false,
  });

  const before = await pool.query(
    "select slug, media from projects where slug = any($1)",
    [Object.keys(MEDIA)],
  );
  const backup = Object.fromEntries(before.rows.map((r) => [r.slug, r.media]));
  console.log("--- media cu ---");
  for (const [slug, m] of Object.entries(backup)) console.log(slug, JSON.stringify(m));

  if (dry) {
    console.log("--- --dry: khong ghi gi ---");
    await pool.end();
    return;
  }

  const file = path.join(__dirname, `_media-backup-${Date.now()}.json`);
  fs.writeFileSync(file, JSON.stringify(backup, null, 2));
  console.log(`\nsao luu -> ${path.basename(file)}\n--- ghi ---`);

  for (const [slug, m] of Object.entries(MEDIA)) {
    const r = await pool.query(
      "update projects set media = $2::jsonb where slug = $1",
      [slug, JSON.stringify([m])],
    );
    console.log(`${slug}: ${r.rowCount ? m.src : "KHONG TIM THAY"}`);
  }
  await pool.end();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
