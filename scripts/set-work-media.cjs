// Gan bo illustration moi (fld-*.svg) lam featured media cho ca bay du an.
//
// In ra media cu truoc khi ghi va luu vao mot file JSON canh script, vi hai du
// an dang dung anh/GIF that do Viet tu tai len:
//   mini-search-engine          -> anh chup man hinh
//   agentic-presentation-system -> GIF ban ghi san pham
// Muon tra lai chi can doc file backup do va ghi nguoc.
//
//   node scripts/set-work-media.cjs --dry
//   railway run --service database node scripts/set-work-media.cjs

const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");

const dry = process.argv.includes("--dry");

// Chu thich noi dung hinh dang ve, khong noi lai ten du an.
const MEDIA = {
  "agentic-ai-platform": {
    src: "/work/fld-agentic-ai-platform.svg",
    caption: "One workspace where people and agents pick up the same tasks",
  },
  "mini-search-engine": {
    src: "/work/fld-mini-search-engine.svg",
    caption: "The results page, and AI Mode answering a follow-up from my own index",
  },
  "agentic-presentation-system": {
    src: "/work/fld-agentic-presentation-system.svg",
    caption: "The agent writing slide three, inside the deck it is building",
  },
  "cms-publishing-pipeline": {
    src: "/work/fld-cms-publishing-pipeline.svg",
    caption: "One model call maps the CMS; every check after it is code",
  },
  "content-seo-ai": {
    src: "/work/fld-content-seo-ai.svg",
    caption: "The section the agent is writing, and the checklist running beside it",
  },
  "keyword-clustering": {
    src: "/work/fld-keyword-clustering.svg",
    caption: "Raw keywords, the pipeline that groups them, and the map it produces",
  },
  "seo-quoting-agent": {
    src: "/work/fld-seo-quoting-agent.svg",
    caption: "The agent pricing one line, and the quote it is assembling",
  },
};

async function main() {
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: process.env.DATABASE_PUBLIC_URL ? { rejectUnauthorized: false } : false,
  });

  const slugs = Object.keys(MEDIA);
  const before = await pool.query(
    "select slug, media from projects where slug = any($1)",
    [slugs],
  );
  const backup = Object.fromEntries(before.rows.map((r) => [r.slug, r.media]));

  console.log("--- media cu ---");
  for (const [slug, m] of Object.entries(backup)) {
    console.log(`${slug}\n    ${JSON.stringify(m)}`);
  }

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
      [slug, JSON.stringify([{ type: "image", src: m.src, caption: m.caption }])],
    );
    console.log(`${slug}: ${r.rowCount ? "ok" : "KHONG TIM THAY"}`);
  }
  await pool.end();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
