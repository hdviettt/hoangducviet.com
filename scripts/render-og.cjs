// Render every animated SVG cover to a static PNG for og:image.
//
// Social crawlers ignore SVG, so each /covers/<slug>.svg gets a PNG twin at
// /og/<slug>.png. Chrome runs with --force-prefers-reduced-motion, which makes
// each cover paint the completed frame its own reduced-motion rule defines,
// so the output is deterministic instead of whatever moment the screenshot
// happened to catch.
//
//   node scripts/render-og.cjs            # only covers with no PNG yet
//   node scripts/render-og.cjs --all      # re-render everything
//   CHROME_PATH=/path/to/chrome node scripts/render-og.cjs
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "public", "covers");
const OUT = path.join(ROOT, "public", "og");
const CHROME =
  process.env.CHROME_PATH ||
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
const force = process.argv.includes("--all");

fs.mkdirSync(OUT, { recursive: true });
const covers = fs.readdirSync(SRC).filter((f) => f.endsWith(".svg"));
let made = 0;
let skipped = 0;

for (const file of covers) {
  const png = path.join(OUT, file.replace(/\.svg$/, ".png"));
  if (!force && fs.existsSync(png)) {
    const a = fs.statSync(path.join(SRC, file)).mtimeMs;
    const b = fs.statSync(png).mtimeMs;
    if (b >= a) {
      skipped++;
      continue;
    }
  }
  execFileSync(CHROME, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-prefers-reduced-motion",
    "--window-size=1200,630",
    "--virtual-time-budget=2000",
    `--screenshot=${png}`,
    `file:///${path.join(SRC, file).replace(/\\/g, "/")}`,
  ], { stdio: "ignore" });
  if (!fs.existsSync(png)) throw new Error(`failed to render ${file}`);
  made++;
  console.log(`rendered ${file} -> og/${path.basename(png)}`);
}
console.log(`\n${made} rendered, ${skipped} already current, ${covers.length} covers total`);
