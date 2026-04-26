// Rename projects → series everywhere in the DB:
//   - projects table → series
//   - project_groups table → series_groups
//   - projects_posts table → series_posts (with project_slug → series_slug)
// Then clean up series-post slugs (strip the "<series>-N-" prefix) and update
// internal cross-reference URLs in post content to use the new nested URL
// format (/series/<series>/<post> instead of /posts/<post>).
//
// Wrapped in a single transaction. Run with --commit to apply; default is
// dry-run that prints what would happen.
const { Pool } = require("pg");

const DRY_RUN = !process.argv.includes("--commit");
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL,
  ssl: { rejectUnauthorized: false },
});

const SLUG_MAP = {
  "building-a-mini-search-engine-1-web-crawling-in-search-engines":
    "web-crawling-in-search-engines",
  "building-a-mini-search-engine-2-designing-the-web-crawler":
    "designing-the-web-crawler",
  "building-a-mini-search-engine-3-inverted-index": "inverted-index",
  "building-a-mini-search-engine-4-ranking-with-bm25": "ranking-with-bm25",
  "building-a-mini-search-engine-5-ranking-with-pagerank":
    "ranking-with-pagerank",
  "building-a-mini-search-engine-6-ai-overviews": "ai-overviews",
  "building-a-mini-search-engine-7-neural-reranking-with-bert":
    "neural-reranking-with-bert",
  "building-a-mini-search-engine-8-ai-mode": "ai-mode",
};

const SERIES_FOR_POST = {
  "web-crawling-in-search-engines": "building-a-mini-search-engine",
  "designing-the-web-crawler": "building-a-mini-search-engine",
  "inverted-index": "building-a-mini-search-engine",
  "ranking-with-bm25": "building-a-mini-search-engine",
  "ranking-with-pagerank": "building-a-mini-search-engine",
  "ai-overviews": "building-a-mini-search-engine",
  "neural-reranking-with-bert": "building-a-mini-search-engine",
  "ai-mode": "building-a-mini-search-engine",
};

(async () => {
  console.log(`${DRY_RUN ? "[DRY RUN]" : "[COMMIT]"} projects → series rename\n`);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    console.log("STEP 1: rename tables");
    await client.query("ALTER TABLE project_groups RENAME TO series_groups");
    await client.query("ALTER TABLE projects RENAME TO series");
    await client.query("ALTER TABLE projects_posts RENAME TO series_posts");
    await client.query(
      "ALTER TABLE series_posts RENAME COLUMN project_slug TO series_slug",
    );
    console.log("  done");

    console.log("\nSTEP 2: drop old FK constraints (they reference old table names)");
    await client.query(`
      ALTER TABLE series_posts
        DROP CONSTRAINT IF EXISTS projects_posts_project_slug_projects_slug_fk,
        DROP CONSTRAINT IF EXISTS projects_posts_post_slug_posts_slug_fk
    `);
    await client.query(`
      ALTER TABLE series
        DROP CONSTRAINT IF EXISTS projects_group_slug_project_groups_slug_fk
    `);
    console.log("  done");

    console.log(`\nSTEP 3: update ${Object.keys(SLUG_MAP).length} post slugs`);
    for (const [oldSlug, newSlug] of Object.entries(SLUG_MAP)) {
      const r = await client.query(
        "UPDATE posts SET slug = $1 WHERE slug = $2",
        [newSlug, oldSlug],
      );
      console.log(`  ${r.rowCount}  ${oldSlug} → ${newSlug}`);
    }

    console.log(`\nSTEP 4: update series_posts.post_slug to match new post slugs`);
    for (const [oldSlug, newSlug] of Object.entries(SLUG_MAP)) {
      const r = await client.query(
        "UPDATE series_posts SET post_slug = $1 WHERE post_slug = $2",
        [newSlug, oldSlug],
      );
      if (r.rowCount > 0) {
        console.log(`  ${r.rowCount}  series_posts: ${oldSlug} → ${newSlug}`);
      }
    }

    console.log("\nSTEP 5: re-add FK constraints with new names");
    await client.query(`
      ALTER TABLE series_posts
        ADD CONSTRAINT series_posts_series_slug_series_slug_fk
          FOREIGN KEY (series_slug) REFERENCES series(slug) ON DELETE CASCADE,
        ADD CONSTRAINT series_posts_post_slug_posts_slug_fk
          FOREIGN KEY (post_slug) REFERENCES posts(slug) ON DELETE CASCADE
    `);
    await client.query(`
      ALTER TABLE series
        ADD CONSTRAINT series_group_slug_series_groups_slug_fk
          FOREIGN KEY (group_slug) REFERENCES series_groups(slug) ON DELETE SET NULL
    `);
    console.log("  done");

    console.log("\nSTEP 6: update cross-reference URLs in post content");
    let xrefUpdates = 0;
    for (const [oldSlug, newSlug] of Object.entries(SLUG_MAP)) {
      const seriesSlug = SERIES_FOR_POST[newSlug];
      const oldUrl = `/posts/${oldSlug}`;
      const newUrl = `/series/${seriesSlug}/${newSlug}`;
      const r = await client.query(
        "UPDATE posts SET content = REPLACE(content, $1, $2) WHERE content LIKE '%' || $1 || '%'",
        [oldUrl, newUrl],
      );
      if (r.rowCount > 0) {
        xrefUpdates += r.rowCount;
        console.log(`  ${r.rowCount} posts updated for ${oldUrl} → ${newUrl}`);
      }
    }
    console.log(`  Total: ${xrefUpdates} content updates`);

    if (DRY_RUN) {
      console.log("\nDRY RUN — rolling back.");
      await client.query("ROLLBACK");
    } else {
      await client.query("COMMIT");
      console.log("\nCOMMITTED.");
    }
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
  await pool.end();
})().catch((e) => {
  console.error("\nFAILED:", e.message);
  process.exit(1);
});
