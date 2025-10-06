// scripts/copy-headers.cjs
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "public", "_headers");
const destDir = path.join(__dirname, "..", "dist");
const dest = path.join(destDir, "_headers");

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

try {
  fs.copyFileSync(src, dest);
  console.log("✅ Copied public/_headers → dist/_headers");
} catch (err) {
  console.error("❌ Error copying _headers:", err);
  process.exit(1);
}
