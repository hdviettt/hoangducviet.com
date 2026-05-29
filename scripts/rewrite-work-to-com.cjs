// Rewrite absolute hoangducviet.work URLs in post content to hoangducviet.com
// after the domain migration. Dry-run by default; pass --commit to write.
//
//   railway run --service database node scripts/rewrite-work-to-com.cjs
//   railway run --service database node scripts/rewrite-work-to-com.cjs --commit
const { Pool } = require("pg");

const OLD = "https://hoangducviet.work";
const NEW = "https://hoangducviet.com";
const COMMIT = process.argv.includes("--commit");

const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  const { rows } = await pool.query(
    `SELECT slug, content FROM posts WHERE content LIKE '%hoangducviet.work%'`,
  );

  if (!rows.length) {
    console.log("No posts contain hoangducviet.work links. Nothing to do.");
    await pool.end();
    return;
  }

  let totalReplacements = 0;
  for (const r of rows) {
    const occurrences = (r.content.match(/hoangducviet\.work/g) || []).length;
    totalReplacements += occurrences;
    const updated = r.content.split(OLD).join(NEW);
    console.log(`  ${r.slug}: ${occurrences} link(s)`);

    if (COMMIT) {
      await pool.query(`UPDATE posts SET content = $1 WHERE slug = $2`, [
        updated,
        r.slug,
      ]);
    }
  }

  console.log(
    `\n${COMMIT ? "REWROTE" : "DRY RUN — would rewrite"} ${totalReplacements} link(s) across ${rows.length} post(s).`,
  );
  if (!COMMIT) console.log("Re-run with --commit to apply.");

  await pool.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
