
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const signDesigner = path.join(root, "app", "tasarla", "SignDesigner.tsx");
const packageJson = path.join(root, "package.json");

if (!fs.existsSync(signDesigner)) {
  console.error("SignDesigner.tsx bulunamadı:", signDesigner);
  process.exit(1);
}
if (!fs.existsSync(packageJson)) {
  console.error("package.json bulunamadı:", packageJson);
  process.exit(1);
}

let src = fs.readFileSync(signDesigner, "utf8");

// html2canvas importunu html2canvas-pro'ya çevir.
let changedImport = false;

const importPatterns = [
  /import\s+html2canvas\s+from\s+["']html2canvas["'];?/g,
  /import\s+\*\s+as\s+html2canvas\s+from\s+["']html2canvas["'];?/g
];

for (const re of importPatterns) {
  if (re.test(src)) {
    src = src.replace(re, 'import html2canvas from "html2canvas-pro";');
    changedImport = true;
  }
}

// Eğer dinamik import kullanılıyorsa onu da dönüştür.
if (src.includes('import("html2canvas")') || src.includes("import('html2canvas')")) {
  src = src
    .replaceAll('import("html2canvas")', 'import("html2canvas-pro")')
    .replaceAll("import('html2canvas')", "import('html2canvas-pro')");
  changedImport = true;
}

if (!changedImport && !src.includes("html2canvas-pro")) {
  console.error('html2canvas importu bulunamadı. Dosyada "html2canvas" arayıp çıktıyı gönder.');
  process.exit(1);
}

fs.writeFileSync(signDesigner, src, "utf8");

// package.json bağımlılıklarını güncelle.
const pkg = JSON.parse(fs.readFileSync(packageJson, "utf8"));
pkg.dependencies = pkg.dependencies || {};

delete pkg.dependencies["html2canvas"];
pkg.dependencies["html2canvas-pro"] = "^1.6.3";

if (pkg.devDependencies && pkg.devDependencies["html2canvas"]) {
  delete pkg.devDependencies["html2canvas"];
}

fs.writeFileSync(packageJson, JSON.stringify(pkg, null, 2) + "\n", "utf8");

console.log("✓ SignDesigner html2canvas-pro kullanacak şekilde güncellendi.");
console.log("✓ package.json güncellendi.");
console.log("Şimdi çalıştır:");
console.log("  npm.cmd install");
console.log("  npm.cmd run build");
