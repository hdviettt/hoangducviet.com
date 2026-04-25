const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const OUT = path.join(process.cwd(), "scripts", "series", "original");

const SLUGS = [
  "why-ai-needs-to-dream",
  "forgetting-as-a-feature",
  "retrieval-induced-forgetting-rif-why-remembering-makes-you-forget",
  "memory-reconsolidation-in-agenternal",
  "when-memories-contradict-in-an-agentic-system",
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });

  for (const slug of SLUGS) {
    const r = await pool.query(
      `SELECT slug, title, description, status, content, date_created
         FROM posts
        WHERE slug = $1`,
      [slug],
    );
    if (r.rows.length === 0) {
      console.log(`MISSING ${slug}`);
      continue;
    }
    const p = r.rows[0];
    const md = `---
slug: ${p.slug}
title: ${p.title}
description: ${p.description ?? ""}
status: ${p.status}
date_created: ${p.date_created.toISOString()}
---

${p.content}
`;
    fs.writeFileSync(path.join(OUT, `${p.slug}.md`), md, "utf8");
    console.log(
      `wrote ${p.slug}.md (${p.content?.length ?? 0} chars, status=${p.status})`,
    );
  }

  // Look for any existing project that could host the memory series
  const project = await pool.query(
    `SELECT slug, title, summary, status FROM projects
      WHERE slug ILIKE '%memory%' OR slug ILIKE '%agenter%' OR slug ILIKE '%agent%'
      ORDER BY date_created DESC`,
  );
  console.log("\nCandidate projects:");
  for (const r of project.rows) console.log(JSON.stringify(r));

  const links = await pool.query(
    `SELECT pp.project_slug, pp.post_slug
       FROM projects_posts pp
       JOIN posts p ON p.slug = pp.post_slug
      WHERE p.slug = ANY($1::text[])
      ORDER BY p.date_created ASC`,
    [SLUGS],
  );
  console.log("\nExisting project links for memory drafts:");
  for (const r of links.rows) console.log(JSON.stringify(r));

  await pool.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
