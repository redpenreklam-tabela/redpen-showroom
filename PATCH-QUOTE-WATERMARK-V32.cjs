const fs = require("fs");
const path = require("path");

const root = process.cwd();
const signPath = path.join(root, "app", "tasarla", "SignDesigner.tsx");
const packagePath = path.join(root, "package.json");

if (!fs.existsSync(signPath) || !fs.existsSync(packagePath)) {
  console.error("Proje kökü bulunamadı. Scripti D:\\Projects\\redpen-showroom içinde çalıştır.");
  process.exit(1);
}

let src = fs.readFileSync(signPath, "utf8");

const mustReplace = (before, after, label) => {
  if (!src.includes(before)) {
    console.error(`Patch durdu: ${label} bulunamadı.`);
    process.exit(1);
  }
  src = src.replace(before, after);
};

// 1) PNG hazırlama + teklif gönderme durumları
const exportState = `  const [exportingPng, setExportingPng] = useState(false);`;
mustReplace(
  exportState,
  `${exportState}
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);`,
  "exporting state"
);

// 2) WhatsApp href yerine ham mesajı sakla; görsel URL'sini upload sonrasında ekleyeceğiz.
mustReplace(
  `  const whatsappHref = useMemo(() => {`,
  `  const whatsappMessage = useMemo(() => {`,
  "whatsapp memo name"
);

mustReplace(
  `    return \`https://wa.me/905305606525?text=\${encodeURIComponent(message)}\`;`,
  `    return message;`,
  "whatsapp memo return"
);

// 3) PNG fonksiyonunu indirme yerine Blob üretir hale getir.
// V29/V31 mevcut export kodunu koruyoruz; sadece final davranışı değişiyor.
const oldStart = `  const downloadDesignPng = async () => {
    const facade = facadeRef.current;
    if (!facade || exportingPng) return;

    setExportingPng(true);`;

const newStart = `  const createDesignPngBlob = async () => {
    const facade = facadeRef.current;
    if (!facade) throw new Error("Önizleme alanı bulunamadı.");

    setExportingPng(true);`;

mustReplace(oldStart, newStart, "downloadDesignPng start");

// finalDataUrl satırından sonraki download bölümünü watermark + Blob return ile değiştir.
const oldDownloadTail = `        const finalDataUrl = cropCanvas.toDataURL("image/png", 1);

        const anchor = document.createElement("a");
        anchor.href = finalDataUrl;
        anchor.download = \`redpen-tabela-\${width}x\${height}.png\`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();`;

const newDownloadTail = `        // Redpen watermark: müşterinin aldığı/ilettiği görsel markalı kalsın.
        // Temiz üretim PNG'si kullanıcıya doğrudan indirtilmiyor.
        const watermark = await new Promise<HTMLImageElement>((resolve, reject) => {
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
        ctx.restore();

        const pngBlob = await new Promise<Blob>((resolve, reject) => {
          cropCanvas.toBlob((result) => {
            if (result) resolve(result);
            else reject(new Error("PNG blob oluşturulamadı."));
          }, "image/png", 1);
        });

        return pngBlob;`;

mustReplace(oldDownloadTail, newDownloadTail, "PNG download tail");

// createDesignPngBlob catch bloğu hata yutmasın; handleQuoteRequest mesajı gösterecek.
const oldCatch = `    } catch (error) {
      console.error("REDPEN PNG EXPORT ERROR V29", error);
      const message = error instanceof Error ? error.message : String(error);
      window.alert(\`PNG oluşturulamadı. Hata: \${message}\`);
    } finally {
      setExportingPng(false);
    }
  };

  return (`;

const newCatchAndQuote = `    } catch (error) {
      console.error("REDPEN PNG EXPORT ERROR V32", error);
      throw error;
    } finally {
      setExportingPng(false);
    }
  };

  const handleQuoteRequest = async () => {
    if (quoteSubmitting) return;

    setQuoteSubmitting(true);

    try {
      const pngBlob = await createDesignPngBlob();

      const form = new FormData();
      form.append(
        "file",
        new File([pngBlob], \`redpen-tabela-\${width}x\${height}.png\`, {
          type: "image/png",
        })
      );

      const response = await fetch("/api/design-upload", {
        method: "POST",
        body: form,
      });

      const payload = (await response.json()) as {
        designId?: string;
        url?: string;
        error?: string;
      };

      if (!response.ok || !payload.designId || !payload.url) {
        throw new Error(payload.error || "Tasarım görseli kaydedilemedi.");
      }

      const message = [
        whatsappMessage,
        "",
        \`Tasarım No: \${payload.designId}\`,
        \`Tasarım Görseli: \${payload.url}\`,
      ].join("\\n");

      const whatsappUrl =
        \`https://wa.me/905305606525?text=\${encodeURIComponent(message)}\`;

      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("REDPEN QUOTE REQUEST ERROR", error);
      const message = error instanceof Error ? error.message : String(error);
      window.alert(
        \`Teklif hazırlanamadı. \${message}\`
      );
    } finally {
      setQuoteSubmitting(false);
    }
  };

  return (`;

mustReplace(oldCatch, newCatchAndQuote, "PNG catch / quote handler");

// 4) Alt aksiyonları tek satış CTA'sına dönüştür.
// PNG indirme yok. Kullanıcı PNG'yi bizim Blob'a kaydedip WhatsApp üzerinden bize ulaştırıyor.
const oldActions = `            <div
              className="designer-actions"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "7px",
                padding: 0,
                border: 0,
                background: "transparent",
              }}
            >
              <button
                type="button"
                className="designer-quote designer-download"
                onClick={downloadDesignPng}
                disabled={exportingPng}
                style={{ width: "100%", cursor: exportingPng ? "wait" : "pointer", textAlign: "left" }}
              >
                <span>TASARIMINI</span>
                <strong>{exportingPng ? "HAZIRLANIYOR" : "PNG İNDİR"}</strong>
                <b>↓</b>
              </button>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="designer-quote"
              >
                <span>BU TASARIM İÇİN</span>
                <strong>TEKLİF AL</strong>
                <b>↗</b>
              </a>
            </div>`;

const newActions = `            <div
              className="designer-actions"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "7px",
                padding: 0,
                border: 0,
                background: "transparent",
              }}
            >
              <button
                type="button"
                className="designer-quote"
                onClick={handleQuoteRequest}
                disabled={quoteSubmitting || exportingPng}
                style={{
                  width: "100%",
                  cursor: quoteSubmitting || exportingPng ? "wait" : "pointer",
                  textAlign: "left",
                }}
              >
                <span>TASARIM GÖRSELİ + ÖZELLİKLER</span>
                <strong>
                  {quoteSubmitting || exportingPng ? "HAZIRLANIYOR" : "WHATSAPP'TAN TEKLİF AL"}
                </strong>
                <b>↗</b>
              </button>
            </div>`;

mustReplace(oldActions, newActions, "designer actions");

// Güvenlik: eski handler/href kalmasın.
const leftovers = ["downloadDesignPng", "whatsappHref", "PNG İNDİR"];
const found = leftovers.filter((token) => src.includes(token));
if (found.length) {
  console.error("Patch sonrası eski tokenlar kaldı:", found.join(", "));
  process.exit(1);
}

fs.writeFileSync(signPath, src, "utf8");

// 5) @vercel/blob dependency
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
pkg.dependencies = pkg.dependencies || {};
pkg.dependencies["@vercel/blob"] = "^2.6.1";
fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + "\n", "utf8");

console.log("✓ PNG İNDİR kaldırıldı.");
console.log("✓ Teklif Al artık watermarked PNG üretip Vercel Blob'a kaydediyor.");
console.log("✓ WhatsApp mesajına Tasarım No + görsel URL'si ekleniyor.");
console.log("✓ Redpen watermark /public/brand/redpen-watermark.png üzerinden geliyor.");
console.log("");
console.log("Şimdi:");
console.log("  npm.cmd install");
console.log("  npm.cmd run build");
