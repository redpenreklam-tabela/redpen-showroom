const fs = require("fs");
const path = require("path");

const root = process.cwd();
const signPath = path.join(root, "app", "tasarla", "SignDesigner.tsx");

if (!fs.existsSync(signPath)) {
  console.error("SignDesigner.tsx bulunamadı. Scripti proje kökünde çalıştır.");
  process.exit(1);
}

let source = fs.readFileSync(signPath, "utf8");

const replacement = `  const downloadDesignPng = async () => {
    const facade = facadeRef.current;
    if (!facade || exportingPng) return;

    setExportingPng(true);

    try {
      if (document.fonts?.ready) await document.fonts.ready;

      const exportRoot = facade.cloneNode(true) as HTMLElement;
      exportRoot.setAttribute("data-redpen-png-clone", "true");

      const liveRect = facade.getBoundingClientRect();

      Object.assign(exportRoot.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        width: \`\${liveRect.width}px\`,
        height: \`\${liveRect.height}px\`,
        margin: "0",
        zIndex: "-2147483647",
        pointerEvents: "none",
        opacity: "1",
        visibility: "visible",
      });

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
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        );

        // V28'de sadece board'u export etmek transform zincirini kırıp
        // görüntünün sol üst köşesini alıyordu. Bu sürümde önce TÜM preview
        // doğru haliyle rasterize ediliyor, crop işlemi sonradan canvas'ta yapılıyor.
        const rootRect = exportRoot.getBoundingClientRect();

        const cloneBoard =
          exportRoot.querySelector<HTMLElement>(".designer-board") ??
          exportRoot.querySelector<HTMLElement>("[data-designer-board]");

        if (!cloneBoard) {
          throw new Error("Tabela zemini export klonunda bulunamadı.");
        }

        const cropNodes: HTMLElement[] = [cloneBoard];
        exportRoot
          .querySelectorAll<HTMLElement>(".designer-draggable-element")
          .forEach((node) => cropNodes.push(node));

        let left = Infinity;
        let top = Infinity;
        let right = -Infinity;
        let bottom = -Infinity;

        cropNodes.forEach((node) => {
          const rect = node.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) return;
          left = Math.min(left, rect.left);
          top = Math.min(top, rect.top);
          right = Math.max(right, rect.right);
          bottom = Math.max(bottom, rect.bottom);
        });

        if (!Number.isFinite(left)) {
          throw new Error("PNG kırpma alanı hesaplanamadı.");
        }

        // Glow / box-shadow kesilmesin.
        const padding = 28;
        left = Math.max(rootRect.left, left - padding);
        top = Math.max(rootRect.top, top - padding);
        right = Math.min(rootRect.right, right + padding);
        bottom = Math.min(rootRect.bottom, bottom + padding);

        const scale = 3;

        const fullDataUrl = await domToPng(exportRoot, {
          scale,
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

        const image = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error("Geçici PNG tekrar okunamadı."));
          img.src = fullDataUrl;
        });

        const sx = Math.max(0, Math.round((left - rootRect.left) * scale));
        const sy = Math.max(0, Math.round((top - rootRect.top) * scale));
        const sw = Math.max(1, Math.round((right - left) * scale));
        const sh = Math.max(1, Math.round((bottom - top) * scale));

        const cropCanvas = document.createElement("canvas");
        cropCanvas.width = Math.min(sw, image.naturalWidth - sx);
        cropCanvas.height = Math.min(sh, image.naturalHeight - sy);

        const ctx = cropCanvas.getContext("2d");
        if (!ctx) throw new Error("PNG crop canvas context açılamadı.");

        ctx.drawImage(
          image,
          sx,
          sy,
          cropCanvas.width,
          cropCanvas.height,
          0,
          0,
          cropCanvas.width,
          cropCanvas.height
        );

        const finalDataUrl = cropCanvas.toDataURL("image/png", 1);

        const anchor = document.createElement("a");
        anchor.href = finalDataUrl;
        anchor.download = \`redpen-tabela-\${width}x\${height}.png\`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      } finally {
        exportRoot.remove();
      }
    } catch (error) {
      console.error("REDPEN PNG EXPORT ERROR V29", error);
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

console.log("✓ PNG export V29 uygulandı.");
console.log("✓ modern-screenshot korunuyor; artık tüm preview render edilip sonradan crop ediliyor.");
console.log("Şimdi: npm.cmd run build");
