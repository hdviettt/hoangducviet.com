const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const OUT = path.join(process.cwd(), "scripts", "series", "original");

(async () => {
  fs.mkdirSync(OUT, { recursive: true });

  const posts = await pool.query(
    `SELECT slug, title, description, content, date_created
       FROM posts
      WHERE slug LIKE 'building-a-mini-search-engine-%'
      ORDER BY date_created ASC`,
  );

  for (const p of posts.rows) {
    const md = `---
slug: ${p.slug}
title: ${p.title}
description: ${p.description ?? ""}
date_created: ${p.date_created.toISOString()}
---

${p.content}
`;
    fs.writeFileSync(path.join(OUT, `${p.slug}.md`), md, "utf8");
    console.log(`wrote ${p.slug}.md (${p.content?.length ?? 0} chars)`);
  }

  const project = await pool.query(
    `SELECT slug, title, summary FROM projects WHERE slug LIKE '%search%' OR slug LIKE '%mini%'`,
  );
  console.log("\nMatching projects:");
  for (const r of project.rows) console.log(JSON.stringify(r));

  const links = await pool.query(
    `SELECT pp.project_slug, pp.post_slug
       FROM projects_posts pp
       JOIN posts p ON p.slug = pp.post_slug
      WHERE p.slug LIKE 'building-a-mini-search-engine-%'
      ORDER BY p.date_created ASC`,
  );
  console.log("\nProject links for series:");
  for (const r of links.rows) console.log(JSON.stringify(r));

  await pool.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
