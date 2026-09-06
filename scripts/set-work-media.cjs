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
    caption: "Nineteen agents on one unbroken line, and the newest one arriving",
  },
  "mini-search-engine": {
    src: "/work/fld-mini-search-engine.svg",
    caption: "A few terms hit almost every page; one term's posting list, joined",
  },
  "agentic-presentation-system": {
    src: "/work/fld-agentic-presentation-system.svg",
    caption: "Sixteen geometry rules around the slide, and the model outside them",
  },
  "cms-publishing-pipeline": {
    src: "/work/fld-cms-publishing-pipeline.svg",
    caption: "One model call at onboarding, then zero for every article after it",
  },
  "content-seo-ai": {
    src: "/work/fld-content-seo-ai.svg",
    caption: "Four architectures, and how much of the checklist each one held",
  },
  "keyword-clustering": {
    src: "/work/fld-keyword-clustering.svg",
    caption: "Where every point was equidistant, and where density put them",
  },
  "seo-quoting-agent": {
    src: "/work/fld-seo-quoting-agent.svg",
    caption: "Nine steps, seven of them arithmetic, two with the model caged",
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
