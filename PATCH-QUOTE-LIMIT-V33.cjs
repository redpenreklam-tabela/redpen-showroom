const fs = require("fs");
const path = require("path");

const root = process.cwd();
const signPath = path.join(root, "app", "tasarla", "SignDesigner.tsx");

if (!fs.existsSync(signPath)) {
  console.error("SignDesigner.tsx bulunamadı. Scripti proje kökünde çalıştır.");
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

const quoteState = `  const [quoteSubmitting, setQuoteSubmitting] = useState(false);`;
mustReplace(
  quoteState,
  `${quoteState}
  const QUOTE_LIMIT_KEY = "redpen-showroom-quote-usage-v1";
  const QUOTE_COOLDOWN_KEY = "redpen-showroom-quote-cooldown-v1";
  const MAX_DAILY_IMAGE_QUOTES = 3;
  const QUOTE_COOLDOWN_MS = 60_000;

  const getQuoteUsage = () => {
    try {
      const raw = localStorage.getItem(QUOTE_LIMIT_KEY);
      if (!raw) return { count: 0, startedAt: Date.now() };

      const parsed = JSON.parse(raw) as { count?: number; startedAt?: number };
      const startedAt = Number(parsed.startedAt) || Date.now();
      const count = Number(parsed.count) || 0;

      if (Date.now() - startedAt >= 24 * 60 * 60 * 1000) {
        const fresh = { count: 0, startedAt: Date.now() };
        localStorage.setItem(QUOTE_LIMIT_KEY, JSON.stringify(fresh));
        return fresh;
      }

      return { count, startedAt };
    } catch {
      return { count: 0, startedAt: Date.now() };
    }
  };

  const openTextOnlyWhatsApp = (extraLine?: string) => {
    const message = [
      whatsappMessage,
      extraLine ? "" : null,
      extraLine || null,
    ]
      .filter(Boolean)
      .join("\\n");

    const whatsappUrl =
      \`https://wa.me/905305606525?text=\${encodeURIComponent(message)}\`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };`,
  "quote state"
);

mustReplace(
`  const handleQuoteRequest = async () => {
    if (quoteSubmitting) return;

    setQuoteSubmitting(true);

    try {`,
`  const handleQuoteRequest = async () => {
    if (quoteSubmitting) return;

    const lastSentAt = Number(localStorage.getItem(QUOTE_COOLDOWN_KEY) || 0);
    const remainingMs = QUOTE_COOLDOWN_MS - (Date.now() - lastSentAt);

    if (remainingMs > 0) {
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      window.alert(
        \`Yeni görselli teklif için \${remainingSeconds} saniye bekleyin. Tasarım yapmaya devam edebilirsiniz.\`
      );
      return;
    }

    const usage = getQuoteUsage();

    if (usage.count >= MAX_DAILY_IMAGE_QUOTES) {
      openTextOnlyWhatsApp(
        "Not: Günlük görselli teklif sınırına ulaşıldı. Tasarım ekran görüntüsünü bu sohbete manuel olarak ekleyebilirsiniz."
      );
      return;
    }

    setQuoteSubmitting(true);

    try {`,
"quote handler start"
);

mustReplace(
`      const message = [
        whatsappMessage,
        "",
        \`Tasarım No: \${payload.designId}\`,
        \`Tasarım Görseli: \${payload.url}\`,
      ].join("\\n");

      const whatsappUrl =
        \`https://wa.me/905305606525?text=\${encodeURIComponent(message)}\`;

      window.open(whatsappUrl, "_blank", "noopener,noreferrer");`,
`      const nextUsage = {
        count: usage.count + 1,
        startedAt: usage.startedAt,
      };

      localStorage.setItem(QUOTE_LIMIT_KEY, JSON.stringify(nextUsage));
      localStorage.setItem(QUOTE_COOLDOWN_KEY, String(Date.now()));

      const message = [
        whatsappMessage,
        "",
        \`Tasarım No: \${payload.designId}\`,
        \`Tasarım Görseli: \${payload.url}\`,
        "",
        \`Görselli teklif hakkı: \${nextUsage.count}/\${MAX_DAILY_IMAGE_QUOTES}\`,
      ].join("\\n");

      const whatsappUrl =
        \`https://wa.me/905305606525?text=\${encodeURIComponent(message)}\`;

      window.open(whatsappUrl, "_blank", "noopener,noreferrer");`,
"upload success block"
);

mustReplace(
`    } catch (error) {
      console.error("REDPEN QUOTE REQUEST ERROR", error);
      const message = error instanceof Error ? error.message : String(error);
      window.alert(
        \`Teklif hazırlanamadı. \${message}\`
      );
    } finally {`,
`    } catch (error) {
      console.error("REDPEN QUOTE REQUEST ERROR", error);
      const message = error instanceof Error ? error.message : String(error);

      const fallback = window.confirm(
        \`Görsel otomatik gönderilemedi. \${message}\\n\\nWhatsApp'ı görselsiz açalım mı? Ekran görüntüsünü sohbete kendiniz ekleyebilirsiniz.\`
      );

      if (fallback) {
        openTextOnlyWhatsApp(
          "Not: Tasarım görseli otomatik yüklenemedi. Ekran görüntüsü manuel olarak eklenecek."
        );
      }
    } finally {`,
"quote catch"
);

fs.writeFileSync(signPath, src, "utf8");

console.log("✓ Günlük 3 görselli teklif limiti eklendi.");
console.log("✓ 60 saniye cooldown eklendi.");
console.log("✓ Limit dolunca WhatsApp metinle açılır, kullanıcı screenshot ekleyebilir.");
console.log("✓ Otomatik upload hata verirse manuel screenshot fallback'i sunulur.");
console.log("Şimdi: npm.cmd run build");
