const fs = require('fs');
const path = require('path');

const root = process.cwd();
const signPath = path.join(root, 'app', 'tasarla', 'SignDesigner.tsx');
const packagePath = path.join(root, 'package.json');

if (!fs.existsSync(signPath)) {
  console.error('SignDesigner.tsx bulunamadı. Scripti proje kökünde çalıştır.');
  process.exit(1);
}
if (!fs.existsSync(packagePath)) {
  console.error('package.json bulunamadı. Scripti proje kökünde çalıştır.');
  process.exit(1);
}

let source = fs.readFileSync(signPath, 'utf8');

if (!source.includes('from "html-to-image"') && !source.includes("from 'html-to-image'")) {
  const lines = source.split(/\r?\n/);
  let insertAt = 0;
  while (insertAt < lines.length && (lines[insertAt].startsWith('"use client"') || lines[insertAt].trim() === '' || lines[insertAt].startsWith('import '))) {
    insertAt++;
  }
  // Import grubunun sonuna ekle.
  let lastImport = -1;
  for (let i = 0; i < Math.min(lines.length, 80); i++) {
    if (lines[i].startsWith('import ')) lastImport = i;
  }
  if (lastImport >= 0) lines.splice(lastImport + 1, 0, 'import { toPng } from "html-to-image";');
  else lines.splice(insertAt, 0, 'import { toPng } from "html-to-image";');
  source = lines.join('\n');
}

const replacement = `  const downloadDesignPng = async () => {
    const facade = facadeRef.current;
    const board = boardRef.current;
    if (!facade || !board || exportingPng) return;

    setExportingPng(true);
    let exportStage: HTMLDivElement | null = null;

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
      const cropLeft = Math.max(0, left - facadeRect.left - padding);
      const cropTop = Math.max(0, top - facadeRect.top - padding);
      const cropRight = Math.min(facadeRect.width, right - facadeRect.left + padding);
      const cropBottom = Math.min(facadeRect.height, bottom - facadeRect.top + padding);
      const exportWidth = Math.max(1, Math.ceil(cropRight - cropLeft));
      const exportHeight = Math.max(1, Math.ceil(cropBottom - cropTop));

      const clone = facade.cloneNode(true) as HTMLElement;
      clone.querySelectorAll(
        ".designer-preview-light-controls,.designer-dimension,.designer-human-scale,.designer-scale-readout,.designer-floor-line,.designer-preview-caption,.designer-wall-grid"
      ).forEach((node) => node.remove());

      clone.style.position = "absolute";
      clone.style.left = \\`\${-cropLeft}px\\`;
      clone.style.top = \\`\${-cropTop}px\\`;
      clone.style.width = \\`\${facadeRect.width}px\\`;
      clone.style.height = \\`\${facadeRect.height}px\\`;
      clone.style.minHeight = "0";
      clone.style.margin = "0";
      clone.style.transform = "none";
      clone.style.transformOrigin = "top left";

      clone.querySelectorAll<HTMLElement>("*").forEach((element) => {
        element.style.pointerEvents = "none";
        element.style.userSelect = "none";
      });

      exportStage = document.createElement("div");
      exportStage.setAttribute("data-redpen-png-stage", "true");
      Object.assign(exportStage.style, {
        position: "fixed",
        left: "-100000px",
        top: "0",
        width: \\`\${exportWidth}px\\`,
        height: \\`\${exportHeight}px\\`,
        overflow: "hidden",
        margin: "0",
        padding: "0",
        zIndex: "-2147483647",
        background: "transparent",
      });
      exportStage.appendChild(clone);
      document.body.appendChild(exportStage);

      const images = Array.from(exportStage.querySelectorAll<HTMLImageElement>("img"));
      await Promise.all(
        images.map(async (image) => {
          if (image.complete) {
            try { await image.decode(); } catch {}
            return;
          }
          await new Promise<void>((resolve) => {
            image.addEventListener("load", () => resolve(), { once: true });
            image.addEventListener("error", () => resolve(), { once: true });
          });
        })
      );

      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

      const dataUrl = await toPng(exportStage, {
        cacheBust: true,
        pixelRatio: 3,
        width: exportWidth,
        height: exportHeight,
        backgroundColor: "transparent",
        skipAutoScale: true,
        filter: (node) => {
          if (!(node instanceof HTMLElement)) return true;
          return !(
            node.classList.contains("designer-preview-light-controls") ||
            node.classList.contains("designer-dimension") ||
            node.classList.contains("designer-human-scale") ||
            node.classList.contains("designer-scale-readout") ||
            node.classList.contains("designer-floor-line") ||
            node.classList.contains("designer-preview-caption") ||
            node.classList.contains("designer-wall-grid")
          );
        },
      });

      const anchor = document.createElement("a");
      anchor.href = dataUrl;
      anchor.download = \\`redpen-tabela-\${width}x\${height}.png\\`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } catch (error) {
      console.error("REDPEN PNG EXPORT ERROR", error);
      window.alert("PNG oluşturulamadı. Tarayıcı konsolundaki REDPEN PNG EXPORT ERROR kaydını kontrol edin.");
    } finally {
      exportStage?.remove();
      setExportingPng(false);
    }
  };`;

const fnRegex = /  const downloadDesignPng = async \(\) => \{[\s\S]*?\n  \};\n\n  return \(/;
if (!fnRegex.test(source)) {
  console.error('downloadDesignPng fonksiyonu bulunamadı. Dosya yapısı beklenenden farklı.');
  process.exit(1);
}
source = source.replace(fnRegex, replacement + '\n\n  return (');
fs.writeFileSync(signPath, source, 'utf8');

const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
pkg.dependencies = pkg.dependencies || {};
pkg.dependencies['html-to-image'] = '^1.11.13';
fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

console.log('PNG export patch uygulandı.');
console.log('Şimdi sırasıyla: npm.cmd install  ve  npm.cmd run build');
