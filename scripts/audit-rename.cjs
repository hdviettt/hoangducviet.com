// Audit current state before the projects → series rename.
// Reports: post slugs, current URLs in content, projects + their post counts.
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  const projects = await pool.query(
    `SELECT pr.slug, pr.title, COUNT(pp.post_slug) AS post_count
       FROM projects pr
       LEFT JOIN projects_posts pp ON pp.project_slug = pr.slug
       LEFT JOIN posts p ON p.slug = pp.post_slug AND p.status = 'published'
      GROUP BY pr.slug, pr.title
      ORDER BY pr.title`,
  );
  console.log("\nPROJECTS (will become series):");
  for (const r of projects.rows) {
    console.log(`  ${r.slug} (${r.post_count} published posts) — ${r.title}`);
  }

  const seriesPosts = await pool.query(
    `SELECT p.slug, p.title, pp.project_slug
       FROM posts p
       JOIN projects_posts pp ON pp.post_slug = p.slug
      WHERE p.status = 'published'
      ORDER BY p.date_created ASC`,
  );
  console.log("\nSERIES POSTS — current slugs and proposed new slugs:");
  for (const r of seriesPosts.rows) {
    const prefixPattern = new RegExp(`^${r.project_slug}-\\d+-`);
    const newSlug = r.slug.replace(prefixPattern, "");
    const arrow = r.slug === newSlug ? " (no change)" : ` → ${newSlug}`;
    console.log(`  ${r.slug}${arrow}`);
  }

  const standalonePosts = await pool.query(
    `SELECT p.slug, p.title
       FROM posts p
      WHERE p.status = 'published' AND NOT EXISTS (
        SELECT 1 FROM projects_posts pp WHERE pp.post_slug = p.slug
      )
      ORDER BY p.date_created DESC`,
  );
  console.log(`\nSTANDALONE POSTS — slugs unchanged (${standalonePosts.rows.length}):`);
  for (const r of standalonePosts.rows) console.log(`  ${r.slug}`);

  // Look for cross-references in post content
  const xrefs = await pool.query(
    `SELECT slug, content
       FROM posts
      WHERE status = 'published'`,
  );
  const linkPattern = /https?:\/\/hoangducviet\.work\/posts\/[a-z0-9-]+/g;
  console.log("\nCROSS-REFERENCES in post content (full URLs to /posts/...):");
  let xrefCount = 0;
  for (const r of xrefs.rows) {
    const matches = r.content?.match(linkPattern) || [];
    if (matches.length > 0) {
      console.log(`  ${r.slug}:`);
      for (const m of matches) {
        console.log(`    ${m}`);
        xrefCount++;
      }
    }
  }
  console.log(`Total cross-references: ${xrefCount}`);

  await pool.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
