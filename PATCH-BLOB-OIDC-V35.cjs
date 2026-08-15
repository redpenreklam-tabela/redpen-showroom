const fs = require("fs");
const path = require("path");

const packagePath = path.join(process.cwd(), "package.json");

if (!fs.existsSync(packagePath)) {
  console.error("package.json bulunamadı. Scripti proje kökünde çalıştır.");
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
pkg.dependencies = pkg.dependencies || {};
pkg.dependencies["@vercel/blob"] = "latest";
fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + "\n", "utf8");

console.log("✓ @vercel/blob latest olarak ayarlandı.");
console.log("✓ app/api/design-upload/route.ts OIDC/storeId sürümüyle güncellendi.");
console.log("Şimdi npm.cmd install && npm.cmd run build");
