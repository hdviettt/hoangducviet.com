// Gan anh featured tam cho bon agent con.
//
// Chi ghi khi `media` dang RONG. Day la anh cho cho, nen no khong duoc phep de
// len thu Viet tu up qua CMS — chay lai bao nhieu lan cung khong lam mat gi.
//
//   node scripts/set-agent-media.cjs                          # local
//   railway run --service database node scripts/set-agent-media.cjs
//   ... them --force de ghi de ca khi da co media

const { Pool } = require("pg");

const MEDIA = {
  "keyword-clustering": {
    src: "/work/agent-keyword-clustering.webp",
    caption: "Keywords embedded and grouped, and the ones it refused to place",
  },
  "cms-publishing-pipeline": {
    src: "/work/agent-cms-publishing-pipeline.webp",
    caption: "A draft, the rules, and the page that comes out",
  },
  "content-seo-ai": {
    src: "/work/agent-content-seo-ai.webp",
    caption: "Four generations: workflow, fine-tuned, reasoning agent, app-agent hybrid",
  },
  "seo-quoting-agent": {
    src: "/work/agent-seo-quoting-agent.webp",
    caption: "The quote table, and the invariant gate every number passes",
  },
};

const force = process.argv.includes("--force");

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: process.env.DATABASE_PUBLIC_URL ? { rejectUnauthorized: false } : false,
  });
  for (const [slug, m] of Object.entries(MEDIA)) {
    const cur = await pool.query(
      "select coalesce(jsonb_array_length(media), 0) n from projects where slug = $1",
      [slug],
    );
    if (!cur.rows.length) {
      console.log(`${slug}: khong tim thay`);
      continue;
    }
    if (cur.rows[0].n > 0 && !force) {
      console.log(`${slug}: da co ${cur.rows[0].n} media, bo qua`);
      continue;
    }
    await pool.query("update projects set media = $2::jsonb where slug = $1", [
      slug,
      JSON.stringify([{ type: "image", src: m.src, caption: m.caption }]),
    ]);
    console.log(`${slug}: dat ${m.src}`);
  }
  await pool.end();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
