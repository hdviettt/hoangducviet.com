// Hai bai da co file bia trong public/covers nhung thumbnail trong CSDL van
// rong, nen tren feed chung hien ra khong co anh. Gan lai.
const { Pool } = require("pg");
const MAP = {
  "a-brief-history-of-seo-content-writing-with-ai":
    "/covers/a-brief-history-of-seo-content-writing-with-ai.svg",
  "a-wrong-quote-that-looks-like-a-right-one":
    "/covers/a-wrong-quote-that-looks-like-a-right-one.svg",
};
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: process.env.DATABASE_PUBLIC_URL ? { rejectUnauthorized: false } : false,
});
(async () => {
  for (const [slug, thumb] of Object.entries(MAP)) {
    const before = await pool.query("select thumbnail from posts where slug=$1", [slug]);
    const r = await pool.query(
      "update posts set thumbnail=$2 where slug=$1 and coalesce(thumbnail,'')=''",
      [slug, thumb],
    );
    console.log(`${slug}: ${JSON.stringify(before.rows[0]?.thumbnail)} -> ${r.rowCount ? thumb : "(khong doi)"}`);
  }
  await pool.end();
})().catch((e) => { console.error(e.message); process.exit(1); });
