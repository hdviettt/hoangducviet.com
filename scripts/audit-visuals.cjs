// Kiem ke moi hinh anh tren blog, phan loai theo nguon.
//
// Bon nguon hinh trong mot bai:
//   1. posts.thumbnail        -> anh bia, thuong la /covers/<slug>.svg
//   2. ```render ... ```      -> SVG viet thang trong bai (RenderedVisual)
//   3. ![alt](src)            -> anh markdown: chup man hinh, so do, hoac anh that
//   4. ```widget:carousel```  -> dai anh/clip
//
// In ra mot bang de biet cai nao phai ve lai va cai nao la anh chup thi giu.
//
//   railway run --service database node scripts/audit-visuals.cjs
//   railway run --service database node scripts/audit-visuals.cjs --detail <slug>

const { Pool } = require("pg");

const detail = process.argv.includes("--detail")
  ? process.argv[process.argv.indexOf("--detail") + 1]
  : null;

function fences(md, lang) {
  const out = [];
  const re = new RegExp("```" + lang + "\\b([^\\n]*)\\n([\\s\\S]*?)```", "g");
  let m;
  while ((m = re.exec(md))) out.push({ info: m[1].trim(), body: m[2] });
  return out;
}

function images(md) {
  const out = [];
  const re = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let m;
  while ((m = re.exec(md))) out.push({ alt: m[1], src: m[2] });
  return out;
}

// Mot duong dan la anh chup man hinh hay mot hinh ve? Anh chup thuong la
// png/jpg/webp tai len R2 hoac /uploads voi ten co dau thoi gian.
function kind(src) {
  const clean = (src || "").split("?")[0];
  if (/\.svg$/i.test(clean)) return "svg";
  if (/\.(mp4|webm|mov)$/i.test(clean)) return "video";
  if (/\.gif$/i.test(clean)) return "gif";
  if (/\.(png|jpe?g|webp|avif)$/i.test(clean)) return "raster";
  return "other";
}

async function main() {
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: process.env.DATABASE_PUBLIC_URL ? { rejectUnauthorized: false } : false,
  });

  const { rows } = await pool.query(
    "select slug, title, status, thumbnail, content from posts order by date_created",
  );

  if (detail) {
    const post = rows.find((r) => r.slug === detail);
    if (!post) {
      console.log(`khong co bai "${detail}"`);
      await pool.end();
      return;
    }
    console.log(`${post.slug}\nthumbnail: ${post.thumbnail}\n`);
    for (const f of fences(post.content || "", "render")) {
      console.log(`--- render fence (${f.body.length} ky tu) ---`);
      console.log(`${f.body.slice(0, 400)}\n`);
    }
    for (const im of images(post.content || "")) {
      console.log(`img [${kind(im.src)}] ${im.src}\n     alt: ${im.alt}`);
    }
    for (const f of fences(post.content || "", "widget:carousel")) {
      console.log(`--- carousel ---\n${f.body.slice(0, 600)}`);
    }
    await pool.end();
    return;
  }

  let tRender = 0;
  let tImg = 0;
  let tCar = 0;
  const byKind = {};
  console.log(
    "slug".padEnd(52) + "st  cover".padEnd(12) + "rndr  img  carousel",
  );
  console.log("-".repeat(96));
  for (const p of rows) {
    const md = p.content || "";
    const r = fences(md, "render").length;
    const ims = images(md);
    const c = fences(md, "widget:carousel").length;
    tRender += r;
    tImg += ims.length;
    tCar += c;
    for (const im of ims) byKind[kind(im.src)] = (byKind[kind(im.src)] || 0) + 1;
    const cover = p.thumbnail
      ? p.thumbnail.includes("/covers/")
        ? "covers"
        : kind(p.thumbnail)
      : "—";
    console.log(
      `${p.slug.slice(0, 50).padEnd(52)}${(p.status === "published" ? "P " : "d ").padEnd(4)}${cover.padEnd(10)}${String(r).padStart(4)}${String(ims.length).padStart(6)}${String(c).padStart(9)}`,
    );
  }
  console.log("-".repeat(96));
  console.log(
    `${rows.length} bai · ${tRender} render fence · ${tImg} anh markdown · ${tCar} carousel`,
  );
  console.log("anh markdown theo dinh dang:", JSON.stringify(byKind));
  await pool.end();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
