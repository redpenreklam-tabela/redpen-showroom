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
    const board = boardRef.current;
    if (!facade || !board || exportingPng) return;

    setExportingPng(true);

    const temporarilyHidden: Array<{ element: HTMLElement; visibility: string }> = [];

    try {
      if (document.fonts?.ready) await document.fonts.ready;

      // Önce gerçekten ekranda görünen koordinatları alıyoruz.
      // Böylece preview içindeki scale/transform hesaplarını yeniden üretmeye çalışmıyoruz.
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
        if (rect.width <= 0 || rect.height <= 0) continue;
        left = Math.min(left, rect.left);
        top = Math.min(top, rect.top);
        right = Math.max(right, rect.right);
        bottom = Math.max(bottom, rect.bottom);
      }

      const padding = 24;
      left -= padding;
      top -= padding;
      right += padding;
      bottom += padding;

      // PNG'de görünmesini istemediğimiz sahne yardımcılarını gerçek DOM'da
      // geçici olarak gizliyoruz. Export bitince aynen geri getiriliyor.
      const hiddenSelectors = [
        ".designer-preview-light-controls",
        ".designer-dimension",
        ".designer-human-scale",
        ".designer-scale-readout",
        ".designer-floor-line",
        ".designer-preview-caption",
        ".designer-wall-grid",
      ];

      for (const selector of hiddenSelectors) {
        document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
          temporarilyHidden.push({
            element,
            visibility: element.style.visibility,
          });
          element.style.visibility = "hidden";
        });
      }

      // html2canvas-pro'ya küçük tabela elemanını değil bütün sayfayı veriyoruz.
      // Bunun sebebi: preview'daki responsive scale/transform zincirini tarayıcının
      // ekranda çizdiği haliyle korumak. x/y/width/height ile yalnızca görünen
      // tabela bölgesini rasterize ediyoruz.
      const x = Math.max(0, left + window.scrollX);
      const y = Math.max(0, top + window.scrollY);
      const exportWidth = Math.max(1, right - left);
      const exportHeight = Math.max(1, bottom - top);

      const scale = 3;

      const canvas = await html2canvas(document.documentElement, {
        scale,
        backgroundColor: null,
        useCORS: true,
        allowTaint: false,
        logging: false,
        imageTimeout: 15000,
        foreignObjectRendering: false,
        removeContainer: true,
        x,
        y,
        width: exportWidth,
        height: exportHeight,
        scrollX: -window.scrollX,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.clientWidth,
        windowHeight: document.documentElement.clientHeight,
      });

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
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
      console.error("REDPEN PNG EXPORT ERROR V27", error);
      const message = error instanceof Error ? error.message : String(error);
      window.alert(\`PNG oluşturulamadı. Hata: \${message}\`);
    } finally {
      for (const item of temporarilyHidden) {
        item.element.style.visibility = item.visibility;
      }
      setExportingPng(false);
    }
  };`;

const fnRegex = /  const downloadDesignPng = async \(\) => \{[\s\S]*?\n  \};\n\n  return \(/;
if (!fnRegex.test(source)) {
  console.error("downloadDesignPng fonksiyonu bulunamadı. Mevcut dosya beklenenden farklı.");
  process.exit(1);
}

source = source.replace(fnRegex, replacement + "\n\n  return (");
fs.writeFileSync(signPath, source, "utf8");

console.log("✓ PNG export V27 uygulandı.");
console.log("✓ Mevcut html2canvas-pro sistemi korunuyor.");
console.log("Şimdi: npm.cmd run build");
