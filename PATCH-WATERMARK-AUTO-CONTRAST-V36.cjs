const fs = require("fs");
const path = require("path");

const root = process.cwd();
const signPath = path.join(root, "app", "tasarla", "SignDesigner.tsx");

if (!fs.existsSync(signPath)) {
  console.error("SignDesigner.tsx bulunamadı. Scripti proje kökünde çalıştır.");
  process.exit(1);
}

let src = fs.readFileSync(signPath, "utf8");

const oldBlock = `        const watermark = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error("Redpen watermark logosu yüklenemedi."));
          img.src = "/brand/redpen-watermark.png";
        });

        const wmMaxWidth = Math.min(cropCanvas.width * 0.24, 720);
        const wmScale = wmMaxWidth / Math.max(1, watermark.naturalWidth);
        const wmWidth = watermark.naturalWidth * wmScale;
        const wmHeight = watermark.naturalHeight * wmScale;
        const wmPad = Math.max(22, cropCanvas.width * 0.018);

        ctx.save();
        ctx.globalAlpha = 0.22;
        ctx.drawImage(
          watermark,
          Math.max(wmPad, cropCanvas.width - wmWidth - wmPad),
          Math.max(wmPad, cropCanvas.height - wmHeight - wmPad),
          wmWidth,
          wmHeight
        );
        ctx.restore();`;

const newBlock = `        // Watermark kontrastını doğrudan render edilen PNG'den ölç.
        // Böylece tabela/zemin rengi hangi state'ten gelirse gelsin doğru logo seçilir.
        const sampleX = Math.floor(cropCanvas.width * 0.68);
        const sampleY = Math.floor(cropCanvas.height * 0.68);
        const sampleW = Math.max(1, Math.floor(cropCanvas.width * 0.30));
        const sampleH = Math.max(1, Math.floor(cropCanvas.height * 0.28));

        let useWhiteWatermark = false;

        try {
          const pixels = ctx.getImageData(sampleX, sampleY, sampleW, sampleH).data;

          let luminanceTotal = 0;
          let opaqueCount = 0;

          // Her pikseli okumak gereksiz pahalı; 4 pikselde bir örnekle.
          for (let i = 0; i < pixels.length; i += 16) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const a = pixels[i + 3];

            if (a < 40) continue;

            // Algısal luminance
            luminanceTotal += 0.2126 * r + 0.7152 * g + 0.0722 * b;
            opaqueCount += 1;
          }

          const averageLuminance =
            opaqueCount > 0 ? luminanceTotal / opaqueCount : 255;

          useWhiteWatermark = averageLuminance < 125;
        } catch (error) {
          console.warn("Watermark kontrast ölçümü yapılamadı.", error);
        }

        const watermarkSrc = useWhiteWatermark
          ? "/brand/redpen-watermark-white.png"
          : "/brand/redpen-watermark.png";

        const watermark = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error("Redpen watermark logosu yüklenemedi."));
          img.src = watermarkSrc;
        });

        const wmMaxWidth = Math.min(cropCanvas.width * 0.24, 720);
        const wmScale = wmMaxWidth / Math.max(1, watermark.naturalWidth);
        const wmWidth = watermark.naturalWidth * wmScale;
        const wmHeight = watermark.naturalHeight * wmScale;
        const wmPad = Math.max(22, cropCanvas.width * 0.018);

        ctx.save();
        ctx.globalAlpha = 0.22;
        ctx.drawImage(
          watermark,
          Math.max(wmPad, cropCanvas.width - wmWidth - wmPad),
          Math.max(wmPad, cropCanvas.height - wmHeight - wmPad),
          wmWidth,
          wmHeight
        );
        ctx.restore();`;

if (!src.includes(oldBlock)) {
  console.error("Patch durdu: mevcut watermark bloğu bulunamadı. Önce v32/v35 watermark sürümünün projede olduğundan emin ol.");
  process.exit(1);
}

src = src.replace(oldBlock, newBlock);
fs.writeFileSync(signPath, src, "utf8");

console.log("✓ Koyu zeminde beyaz Redpen watermark otomatik seçiliyor.");
console.log("✓ Açık zeminde mevcut koyu/kırmızı Redpen watermark korunuyor.");
console.log("✓ Seçim state'e değil, üretilen PNG'nin gerçek piksel parlaklığına göre yapılıyor.");
console.log("Şimdi: npm.cmd run build");
