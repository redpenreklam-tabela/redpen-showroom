const fs = require("fs");
const path = require("path");

const layoutPath = path.join(process.cwd(), "app", "layout.tsx");

if (!fs.existsSync(layoutPath)) {
  console.error("app/layout.tsx bulunamadı. Scripti proje kökünde çalıştır.");
  process.exit(1);
}

let src = fs.readFileSync(layoutPath, "utf8");

const expectedImport =
  'import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";';

if (!src.includes(expectedImport)) {
  console.error(
    'Patch durdu: beklenen next/font/google importu bulunamadı. layout.tsx sürümü değişmiş olabilir.'
  );
  process.exit(1);
}

src = src.replace(expectedImport + "\n", "");

const fontBlock = `const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

`;

if (!src.includes(fontBlock)) {
  console.error("Patch durdu: Google font tanım bloğu bulunamadı.");
  process.exit(1);
}

src = src.replace(fontBlock, "");

const htmlOld =
  '    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable} ${display.variable}`}>';

const htmlNew = `    <html
      lang="tr"
      style={
        {
          "--font-geist-sans":
            'Inter, "Segoe UI", Arial, Helvetica, sans-serif',
          "--font-geist-mono":
            '"Cascadia Mono", "Segoe UI Mono", Consolas, "Courier New", monospace',
          "--font-display":
            'Georgia, "Times New Roman", serif',
        } as React.CSSProperties
      }
    >`;

if (!src.includes(htmlOld)) {
  console.error("Patch durdu: html className font satırı bulunamadı.");
  process.exit(1);
}

src = src.replace(htmlOld, htmlNew);

if (src.includes("next/font/google") || src.includes("Cormorant_Garamond(")) {
  console.error("Patch sonrası next/font/google referansı layout.tsx içinde kaldı.");
  process.exit(1);
}

fs.writeFileSync(layoutPath, src, "utf8");

console.log("✓ app/layout.tsx içindeki tüm next/font/google kullanımı kaldırıldı.");
console.log("✓ Cormorant / Geist artık build sırasında Google'dan indirilmiyor.");
console.log("✓ CSS değişkenleri sistem font fallback'leri ile korunuyor.");
console.log("");
console.log("Şimdi: npm.cmd run build");
