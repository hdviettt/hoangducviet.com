// In ra tung hinh ```render``` cua mot bai, kem doan van ngay truoc no.
//
// Doan van truoc moi quan trong: no la thu cho biet hinh do PHAI NOI GI. Ve
// lai mot hinh ma khong doc cau dan vao no thi chi la doi kieu, khong phai ve
// lai.
//
//   railway run --service database node scripts/dump-figures.cjs <slug>
//   railway run --service database node scripts/dump-figures.cjs <slug> --full

const { Pool } = require("pg");

const slug = process.argv[2];
const full = process.argv.includes("--full");

if (!slug) {
  console.error("can mot slug");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: process.env.DATABASE_PUBLIC_URL ? { rejectUnauthorized: false } : false,
});

pool
  .query("select slug, title, content from posts where slug = $1", [slug])
  .then((r) => {
    const post = r.rows[0];
    if (!post) throw new Error(`khong co bai "${slug}"`);
    const md = post.content || "";
    console.log(`${post.title}\n${"=".repeat(76)}`);

    const re = /```render\b[^\n]*\n([\s\S]*?)```/g;
    let m;
    let i = 0;
    while ((m = re.exec(md))) {
      const before = md.slice(0, m.index);
      // hai doan van gan nhat truoc hinh, bo qua dong trong
      const paras = before
        .split(/\n{2,}/)
        .map((s) => s.trim())
        .filter(Boolean);
      const lead = paras.slice(-2).join("\n\n");
      // cai caption ngay sau hinh, neu co (thuong la mot dong in nghieng)
      const after = md.slice(m.index + m[0].length).split(/\n{2,}/)[0].trim();

      console.log(`\n${"-".repeat(76)}\nHINH ${i} (${m[1].length} ky tu)`);
      console.log(`\n[VAN TRUOC]\n${lead.slice(-700)}`);
      if (after) console.log(`\n[NGAY SAU]\n${after.slice(0, 260)}`);
      console.log(`\n[SVG]\n${full ? m[1] : m[1].slice(0, 900)}`);
      i++;
    }
    console.log(`\n${"=".repeat(76)}\n${i} hinh`);
    return pool.end();
  })
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
