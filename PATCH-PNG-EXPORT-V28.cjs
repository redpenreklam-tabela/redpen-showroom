const fs = require("fs");
const path = require("path");

const root = process.cwd();
const signPath = path.join(root, "app", "tasarla", "SignDesigner.tsx");
const packagePath = path.join(root, "package.json");

if (!fs.existsSync(signPath) || !fs.existsSync(packagePath)) {
  console.error("Proje dosyaları bulunamadı. Scripti D:\\Projects\\redpen-showroom içinde çalıştır.");
  process.exit(1);
}

let source = fs.readFileSync(signPath, "utf8");

// Eski PNG motoru importlarını kaldır.
source = source
  .replace(/import\s+html2canvas\s+from\s+["']html2canvas-pro["'];?\r?\n?/g, "")
  .replace(/import\s+html2canvas\s+from\s+["']html2canvas["'];?\r?\n?/g, "")
  .replace(/import\s+\{\s*domToPng\s*\}\s+from\s+["']modern-screenshot["'];?\r?\n?/g, "");

// Client component direktifinden sonra modern-screenshot importunu ekle.
// Mevcut importların önüne koymak da TypeScript açısından sorun değil.
const firstImport = source.search(/^import\s/m);
if (firstImport >= 0) {
  source = source.slice(0, firstImport) + 'import { domToPng } from "modern-screenshot";\n' + source.slice(firstImport);
} else {
  console.error("Import bölümü bulunamadı.");
  process.exit(1);
}

const replacement = `  const downloadDesignPng = async () => {
    const facade = facadeRef.current;
    const board = boardRef.current;
    if (!facade || !board || exportingPng) return;

    setExportingPng(true);

    try {
      if (document.fonts?.ready) await document.fonts.ready;

      // Export için canlı sahnenin klonunu görünmez bir katmanda kuruyoruz.
      // Burada kritik fark: transform zincirini yeniden hesaplamıyoruz.
      // modern-screenshot tarayıcıdaki DOM/CSS yapısını kendi SVG klonuna taşıyor.
      const exportRoot = facade.cloneNode(true) as HTMLElement;

      exportRoot.setAttribute("data-redpen-png-clone", "true");
      Object.assign(exportRoot.style, {
        position: "fixed",
        left: "0",
        top: "0",
        margin: "0",
        zIndex: "-2147483647",
        pointerEvents: "none",
        opacity: "1",
        visibility: "visible",
      });

      // Canlı facade'ın ekranda kapladığı gerçek ölçüyü koru.
      const facadeRect = facade.getBoundingClientRect();
      exportRoot.style.width = \`\${facadeRect.width}px\`;
      exportRoot.style.height = \`\${facadeRect.height}px\`;

      // UI yardımcılarını klonda kaldır.
      const removeSelectors = [
        ".designer-preview-light-controls",
        ".designer-dimension",
        ".designer-human-scale",
        ".designer-scale-readout",
        ".designer-floor-line",
        ".designer-preview-caption",
        ".designer-wall-grid",
      ];

      removeSelectors.forEach((selector) => {
        exportRoot.querySelectorAll(selector).forEach((node) => node.remove());
      });

      document.body.appendChild(exportRoot);

      try {
        // Bir frame bekleyerek browser'ın clone layout'unu hesaplamasına izin ver.
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        );

        const cloneBoard =
          exportRoot.querySelector<HTMLElement>(".designer-board") ??
          exportRoot.querySelector<HTMLElement>("[data-designer-board]");

        // Eğer board class adı değişmişse, facade içindeki gerçek board ölçüsüne en yakın
        // büyük child'ı kullanmak yerine tüm facade'ı export ediyoruz. Böylece yanlış crop
        // yazıyı kesmez.
        const target = cloneBoard ?? exportRoot;

        // Target içindeki transform'u SAKLIYORUZ. Önceki html2canvas sorununun aksine
        // kendi x/y crop hesabımız yok.
        const dataUrl = await domToPng(target, {
          scale: 3,
          backgroundColor: "transparent",
          quality: 1,
          fetch: {
            requestInit: {
              cache: "force-cache",
            },
          },
          style: {
            margin: "0",
          },
        });

        const anchor = document.createElement("a");
        anchor.href = dataUrl;
        anchor.download = \`redpen-tabela-\${width}x\${height}.png\`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      } finally {
        exportRoot.remove();
      }
    } catch (error) {
      console.error("REDPEN PNG EXPORT ERROR V28", error);
      const message = error instanceof Error ? error.message : String(error);
      window.alert(\`PNG oluşturulamadı. Hata: \${message}\`);
    } finally {
      setExportingPng(false);
    }
  };`;

const fnRegex = /  const downloadDesignPng = async \(\) => \{[\s\S]*?\n  \};\n\n  return \(/;
if (!fnRegex.test(source)) {
  console.error("downloadDesignPng fonksiyonu bulunamadı.");
  process.exit(1);
}

source = source.replace(fnRegex, replacement + "\n\n  return (");
fs.writeFileSync(signPath, source, "utf8");

// Dependencies: eski ekran görüntüsü motorlarını kaldır, modern-screenshot ekle.
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
pkg.dependencies = pkg.dependencies || {};
delete pkg.dependencies["html2canvas"];
delete pkg.dependencies["html2canvas-pro"];
delete pkg.dependencies["html-to-image"];
pkg.dependencies["modern-screenshot"] = "^4.7.0";

if (pkg.devDependencies) {
  delete pkg.devDependencies["html2canvas"];
  delete pkg.devDependencies["html2canvas-pro"];
  delete pkg.devDependencies["html-to-image"];
}

fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + "\n", "utf8");

console.log("✓ PNG export V28 modern-screenshot motoruna geçirildi.");
console.log("Şimdi:");
console.log("  npm.cmd install");
console.log("  npm.cmd run build");
