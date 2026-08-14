const fs = require('fs');
const path = require('path');

const root = process.cwd();
const signPath = path.join(root, 'app', 'tasarla', 'SignDesigner.tsx');
const packagePath = path.join(root, 'package.json');

if (!fs.existsSync(signPath) || !fs.existsSync(packagePath)) {
  console.error('Proje kökü bulunamadı. Scripti D:\\Projects\\redpen-showroom içinde çalıştır.');
  process.exit(1);
}

let source = fs.readFileSync(signPath, 'utf8');

// Eski html-to-image importunu kaldır; html2canvas importunu ekle.
source = source.replace(/^import \{ toPng \} from ["']html-to-image["'];\r?\n/gm, '');
if (!source.includes('from "html2canvas"') && !source.includes("from 'html2canvas'")) {
  const lines = source.split(/\r?\n/);
  let lastImport = -1;
  for (let i = 0; i < Math.min(lines.length, 100); i++) {
    if (lines[i].startsWith('import ')) lastImport = i;
  }
  if (lastImport >= 0) lines.splice(lastImport + 1, 0, 'import html2canvas from "html2canvas";');
  else lines.unshift('import html2canvas from "html2canvas";');
  source = lines.join('\n');
}

const replacement = `  const downloadDesignPng = async () => {
    const facade = facadeRef.current;
    const board = boardRef.current;
    if (!facade || !board || exportingPng) return;

    setExportingPng(true);

    try {
      if (document.fonts?.ready) await document.fonts.ready;

      const facadeRect = facade.getBoundingClientRect();
      const boardRect = board.getBoundingClientRect();
      const exportElements = Array.from(
        facade.querySelectorAll<HTMLElement>(".designer-draggable-element")
      );

      let left = boardRect.left;
      let top = boardRect.top;
      let right = boardRect.right;
      let bottom = boardRect.bottom;

      for (const element of exportElements) {
        const rect = element.getBoundingClientRect();
        left = Math.min(left, rect.left);
        top = Math.min(top, rect.top);
        right = Math.max(right, rect.right);
        bottom = Math.max(bottom, rect.bottom);
      }

      const padding = 36;
      const cropLeft = Math.max(0, Math.floor(left - facadeRect.left - padding));
      const cropTop = Math.max(0, Math.floor(top - facadeRect.top - padding));
      const cropRight = Math.min(facadeRect.width, Math.ceil(right - facadeRect.left + padding));
      const cropBottom = Math.min(facadeRect.height, Math.ceil(bottom - facadeRect.top + padding));
      const exportWidth = Math.max(1, Math.ceil(cropRight - cropLeft));
      const exportHeight = Math.max(1, Math.ceil(cropBottom - cropTop));

      const hiddenClasses = new Set([
        "designer-preview-light-controls",
        "designer-dimension",
        "designer-human-scale",
        "designer-scale-readout",
        "designer-floor-line",
        "designer-preview-caption",
        "designer-wall-grid",
      ]);

      // Canlı DOM'u doğrudan rasterize ediyoruz. Clone/foreignObject yok.
      const scale = 3;
      const fullCanvas = await html2canvas(facade, {
        scale,
        backgroundColor: null,
        useCORS: true,
        allowTaint: false,
        logging: false,
        imageTimeout: 15000,
        foreignObjectRendering: false,
        removeContainer: true,
        ignoreElements: (element) => {
          if (!(element instanceof HTMLElement)) return false;
          for (const className of hiddenClasses) {
            if (element.classList.contains(className)) return true;
          }
          return false;
        },
      });

      const outCanvas = document.createElement("canvas");
      outCanvas.width = Math.max(1, Math.round(exportWidth * scale));
      outCanvas.height = Math.max(1, Math.round(exportHeight * scale));
      const context = outCanvas.getContext("2d");
      if (!context) throw new Error("PNG canvas context oluşturulamadı.");

      context.drawImage(
        fullCanvas,
        Math.round(cropLeft * scale),
        Math.round(cropTop * scale),
        Math.round(exportWidth * scale),
        Math.round(exportHeight * scale),
        0,
        0,
        outCanvas.width,
        outCanvas.height
      );

      const blob = await new Promise<Blob>((resolve, reject) => {
        outCanvas.toBlob((result) => {
          if (result) resolve(result);
          else reject(new Error("Canvas PNG blob üretemedi."));
        }, "image/png", 1);
      });

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = \`redpen-tabela-\${width}x\${height}.png\`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (error) {
      console.error("REDPEN PNG EXPORT ERROR V25", error);
      const message = error instanceof Error ? error.message : String(error);
      window.alert(\`PNG oluşturulamadı. Hata: \${message}\`);
    } finally {
      setExportingPng(false);
    }
  };`;

const fnRegex = /  const downloadDesignPng = async \(\) => \{[\s\S]*?\n  \};\n\n  return \(/;
if (!fnRegex.test(source)) {
  console.error('downloadDesignPng fonksiyonu bulunamadı. Mevcut SignDesigner.tsx beklenenden farklı.');
  process.exit(1);
}
source = source.replace(fnRegex, replacement + '\n\n  return (');
fs.writeFileSync(signPath, source, 'utf8');

const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
pkg.dependencies = pkg.dependencies || {};
pkg.dependencies['html2canvas'] = '^1.4.1';
// Eski paket artık gerekmiyor.
if (pkg.dependencies['html-to-image']) delete pkg.dependencies['html-to-image'];
fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

console.log('PNG export V25 patch uygulandı.');
console.log('Şimdi: npm.cmd install');
console.log('Sonra: npm.cmd run build');
