const fs = require("fs");
const path = require("path");

const panelPath = path.join(process.cwd(), "app", "tasarla", "CostDebugPanel.tsx");

if (!fs.existsSync(panelPath)) {
  console.error("CostDebugPanel.tsx bulunamadı.");
  process.exit(1);
}

let src = fs.readFileSync(panelPath, "utf8");

const oldLine = `function lightStripGeometry(mode, widthCm, heightCm) {`;
const newLine = `function lightStripGeometry(mode: string, widthCm: number, heightCm: number) {`;

if (!src.includes(oldLine)) {
  if (src.includes(newLine)) {
    console.log("✓ TypeScript tipleri zaten düzeltilmiş.");
    process.exit(0);
  }

  console.error("Patch durdu: lightStripGeometry imzası bulunamadı.");
  process.exit(1);
}

src = src.replace(oldLine, newLine);

fs.writeFileSync(panelPath, src, "utf8");

console.log("✓ lightStripGeometry TypeScript tipleri düzeltildi.");
console.log("✓ mode: string");
console.log("✓ widthCm: number");
console.log("✓ heightCm: number");
console.log("Şimdi: npm.cmd run build");
