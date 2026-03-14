/**
 * Migration script: Export data from Directus via REST API and import into new Postgres.
 *
 * Usage:
 *   DATABASE_URL="postgres://..." npx tsx scripts/migrate-from-directus.ts
 *
 * This script:
 * 1. Fetches all content from Directus REST API
 * 2. Downloads all media files
 * 3. Inserts data into the new Postgres using Drizzle
 * 4. Rewrites Directus image URLs to local /uploads/ paths
 * 5. Creates an initial admin user
 */

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/db/schema";
import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";

const DIRECTUS_URL = "https://directus-production-b969.up.railway.app";
const UPLOADS_DIR = path.join(process.cwd(), "public/uploads");

// ---- Helpers ----

const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || "";

async function fetchDirectus(endpoint: string) {
  const url = `${DIRECTUS_URL}${endpoint}`;
  const headers: Record<string, string> = {};
  if (DIRECTUS_TOKEN) {
    headers["Authorization"] = `Bearer ${DIRECTUS_TOKEN}`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) {
    console.warn(`  API error: ${url} (${res.status})`);
    return null;
  }
  const json = await res.json();
  return json.data;
}

async function downloadFile(url: string, dest: string) {
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`  Failed to download: ${url} (${res.status})`);
    return false;
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buffer);
  return true;
}

function rewriteDirectusUrls(text: string): string {
  if (!text) return text;
  return text.replace(
    new RegExp(
      `${DIRECTUS_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/assets/`,
      "g",
    ),
    "/uploads/",
  );
}

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// ---- Main ----

async function main() {
  const newDbUrl = process.env.DATABASE_URL;

  if (!newDbUrl) {
    console.error("Required: DATABASE_URL environment variable");
    process.exit(1);
  }

  const newPool = new Pool({ connectionString: newDbUrl });
  const db = drizzle(newPool, { schema });

  console.log("Connected to new database.\n");

  // Ensure uploads directory exists
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  // ---- 1. Fetch all files from Directus (for ID -> filename mapping) ----
  console.log("1. Fetching Directus files index...");
  const files = await fetchDirectus("/files?limit=-1&fields=id,filename_disk,type");
  const fileMap = new Map<string, { filename: string; type: string }>();
  if (files) {
    for (const f of files) {
      if (f.filename_disk) {
        fileMap.set(f.id, { filename: f.filename_disk, type: f.type || "" });
      }
    }
    console.log(`  Found ${fileMap.size} files`);
  }

  // ---- 2. Migrate global settings ----
  console.log("2. Migrating global settings...");
  const globalData = await fetchDirectus("/items/global");
  if (globalData && globalData.length) {
    const g = globalData[0];
    await db
      .insert(schema.global)
      .values({ id: 1, title: g.title || "", tagline: g.tagline || "" })
      .onConflictDoUpdate({
        target: schema.global.id,
        set: { title: g.title || "", tagline: g.tagline || "" },
      });
    console.log(`  Global: "${g.title}"`);
  }

  // ---- 3. Migrate profile (hdviet) ----
  console.log("3. Migrating profile...");
  const hdvietData = await fetchDirectus(
    "/items/hdviet?fields=*,image.id,image.filename_disk&limit=1",
  );
  if (hdvietData && hdvietData.length) {
    const h = hdvietData[0];

    let imagePath: string | null = null;
    if (h.image) {
      const fileInfo =
        typeof h.image === "object"
          ? { filename: h.image.filename_disk }
          : fileMap.get(h.image);
      if (fileInfo) {
        const dest = path.join(UPLOADS_DIR, fileInfo.filename);
        console.log(`  Downloading profile image: ${fileInfo.filename}`);
        await downloadFile(
          `${DIRECTUS_URL}/assets/${fileInfo.filename}`,
          dest,
        );
        imagePath = `/uploads/${fileInfo.filename}`;
      }
    }

    await db
      .insert(schema.profile)
      .values({
        id: 1,
        name: h.name,
        description: h.description,
        image: imagePath,
      })
      .onConflictDoUpdate({
        target: schema.profile.id,
        set: { name: h.name, description: h.description, image: imagePath },
      });
    console.log(`  Profile: "${h.name}"`);
  }

  // ---- 4. Migrate categories ----
  console.log("4. Migrating categories...");
  const catsData = await fetchDirectus("/items/post_categories?limit=-1");
  if (catsData) {
    for (const cat of catsData) {
      await db
        .insert(schema.postCategories)
        .values({ slug: cat.slug, title: cat.title })
        .onConflictDoNothing();
      console.log(`  Category: ${cat.slug}`);
    }
  }

  // ---- 5. Migrate posts ----
  console.log("5. Migrating posts...");
  const postsData = await fetchDirectus(
    "/items/posts?limit=-1&sort=date_created&fields=*,thumbnail.id,thumbnail.filename_disk,categories.post_categories_slug",
  );
  if (postsData) {
    for (const post of postsData) {
      // Download thumbnail
      let thumbnailPath: string | null = null;
      if (post.thumbnail) {
        const fileInfo =
          typeof post.thumbnail === "object"
            ? { filename: post.thumbnail.filename_disk }
            : fileMap.get(post.thumbnail);
        if (fileInfo) {
          const dest = path.join(UPLOADS_DIR, fileInfo.filename);
          if (!fs.existsSync(dest)) {
            console.log(`  Downloading thumbnail: ${fileInfo.filename}`);
            await downloadFile(
              `${DIRECTUS_URL}/assets/${fileInfo.filename}`,
              dest,
            );
          }
          thumbnailPath = `/uploads/${fileInfo.filename}`;
        }
      }

      // Rewrite content URLs
      const content = rewriteDirectusUrls(post.content || "");

      const inserted = await db
        .insert(schema.posts)
        .values({
          slug: post.slug,
          title: post.title,
          description: post.description,
          content,
          thumbnail: thumbnailPath,
          status: post.status || "draft",
          dateCreated: post.date_created
            ? new Date(post.date_created)
            : new Date(),
          dateUpdated: post.date_updated
            ? new Date(post.date_updated)
            : null,
        })
        .onConflictDoNothing()
        .returning();

      if (inserted.length) {
        console.log(`  Post: "${post.title}" (${post.status})`);

        // Insert category relationships
        if (post.categories && Array.isArray(post.categories)) {
          for (const cat of post.categories) {
            const catSlug =
              typeof cat === "object"
                ? cat.post_categories_slug
                : cat;
            if (catSlug) {
              await db
                .insert(schema.postsCategories)
                .values({
                  postId: inserted[0].id,
                  categorySlug: catSlug,
                })
                .onConflictDoNothing();
            }
          }
        }
      }
    }
    console.log(`  Migrated ${postsData.length} posts`);
  }

  // ---- 6. Migrate pages ----
  console.log("6. Migrating pages...");
  const pagesData = await fetchDirectus("/items/pages?limit=-1&fields=*");
  if (pagesData) {
    for (const page of pagesData) {
      let body = page.body;
      if (body && typeof body === "object") {
        body = JSON.parse(rewriteDirectusUrls(JSON.stringify(body)));
      }

      await db
        .insert(schema.pages)
        .values({
          slug: page.slug,
          title: page.title,
          body,
          navigation: page.navigation || "no",
          dateCreated: page.date_created
            ? new Date(page.date_created)
            : new Date(),
        })
        .onConflictDoNothing();
      console.log(`  Page: "${page.title}"`);
    }
  }

  // ---- 7. Migrate projects ----
  console.log("7. Migrating projects...");
  const projectsData = await fetchDirectus(
    "/items/projects?limit=-1&sort=date_created&fields=*,thumbnail.id,thumbnail.filename_disk,posts.posts_slug",
  );
  if (projectsData) {
    for (const project of projectsData) {
      let thumbnailPath: string | null = null;
      if (project.thumbnail) {
        const fileInfo =
          typeof project.thumbnail === "object"
            ? { filename: project.thumbnail.filename_disk }
            : fileMap.get(project.thumbnail);
        if (fileInfo) {
          const dest = path.join(UPLOADS_DIR, fileInfo.filename);
          if (!fs.existsSync(dest)) {
            console.log(`  Downloading thumbnail: ${fileInfo.filename}`);
            await downloadFile(
              `${DIRECTUS_URL}/assets/${fileInfo.filename}`,
              dest,
            );
          }
          thumbnailPath = `/uploads/${fileInfo.filename}`;
        }
      }

      const description = rewriteDirectusUrls(project.description || "");

      await db
        .insert(schema.projects)
        .values({
          slug: project.slug,
          title: project.title,
          description,
          thumbnail: thumbnailPath,
          status: project.status || "draft",
          dateCreated: project.date_created
            ? new Date(project.date_created)
            : new Date(),
          dateUpdated: project.date_updated
            ? new Date(project.date_updated)
            : null,
        })
        .onConflictDoNothing();
      console.log(`  Project: "${project.title}"`);

      // Insert project-post relationships
      if (project.posts && Array.isArray(project.posts)) {
        for (const rel of project.posts) {
          const postSlug =
            typeof rel === "object" ? rel.posts_slug : rel;
          if (postSlug) {
            await db
              .insert(schema.projectsPosts)
              .values({
                projectSlug: project.slug,
                postSlug,
              })
              .onConflictDoNothing();
          }
        }
      }
    }
    console.log(`  Migrated ${projectsData.length} projects`);
  }

  // ---- 8. Download all remaining media files ----
  console.log("8. Downloading remaining media files...");
  let downloadCount = 0;
  for (const [fileId, fileInfo] of fileMap) {
    const dest = path.join(UPLOADS_DIR, fileInfo.filename);
    if (!fs.existsSync(dest)) {
      console.log(`  Downloading: ${fileInfo.filename}`);
      const ok = await downloadFile(
        `${DIRECTUS_URL}/assets/${fileInfo.filename}`,
        dest,
      );
      if (ok) downloadCount++;
    }

    // Track in media table
    const stat = fs.existsSync(dest) ? fs.statSync(dest) : null;
    await db
      .insert(schema.media)
      .values({
        filename: fileInfo.filename,
        originalName: fileInfo.filename,
        mimeType: fileInfo.type || null,
        size: stat?.size ?? null,
      })
      .onConflictDoNothing();
  }
  console.log(`  Downloaded ${downloadCount} new files`);

  // ---- Done ----
  console.log("\nMigration complete!");
  console.log(`  Categories: ${catsData?.length ?? 0}`);
  console.log(`  Posts: ${postsData?.length ?? 0}`);
  console.log(`  Pages: ${pagesData?.length ?? 0}`);
  console.log(`  Projects: ${projectsData?.length ?? 0}`);
  console.log(`  Files: ${fileMap.size}`);

  await newPool.end();
}

main().catch(console.error);
