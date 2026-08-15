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

// 3 hak dolunca artık kullanıcıya screenshot ekleme önerisi verme.
// WhatsApp teknik bilgilerle açılır, görsel tarafı Redpen ekibiyle devam eder.
mustReplace(
`    if (usage.count >= MAX_DAILY_IMAGE_QUOTES) {
      openTextOnlyWhatsApp(
        "Not: Günlük görselli teklif sınırına ulaşıldı. Tasarım ekran görüntüsünü bu sohbete manuel olarak ekleyebilirsiniz."
      );
      return;
    }`,
`    if (usage.count >= MAX_DAILY_IMAGE_QUOTES) {
      openTextOnlyWhatsApp(
        "Not: Günlük otomatik görselli teklif sınırına ulaşıldı. Bu mesajda yeni tasarım görseli eklenmeyecektir."
      );
      return;
    }`,
"daily limit fallback"
);

// Upload hata verirse de kullanıcıya manuel ekran görüntüsü ekleme seçeneği verme.
mustReplace(
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
`    } catch (error) {
      console.error("REDPEN QUOTE REQUEST ERROR", error);
      const message = error instanceof Error ? error.message : String(error);

      window.alert(
        \`Tasarım görseli otomatik hazırlanamadı. \${message}\\n\\nTeknik teklif bilgileri WhatsApp üzerinden gönderilecek; kullanıcıdan manuel görsel eklemesi istenmeyecek.\`
      );

      openTextOnlyWhatsApp(
        "Not: Tasarım görseli otomatik eklenemedi. Teknik bilgiler üzerinden teklif talebi oluşturuldu."
      );
    } finally {`,
"upload error fallback"
);

// Metinde eski manuel screenshot yönlendirmesi kalmasın.
const forbidden = [
  "ekran görüntüsünü bu sohbete manuel olarak ekleyebilirsiniz",
  "Ekran görüntüsünü sohbete kendiniz ekleyebilirsiniz",
  "Ekran görüntüsü manuel olarak eklenecek",
];

const leftovers = forbidden.filter((item) => src.includes(item));
if (leftovers.length) {
  console.error("Manuel görsel yönlendirmesi dosyada kaldı.");
  process.exit(1);
}

fs.writeFileSync(signPath, src, "utf8");

console.log("✓ 3 görsel hakkı dolduğunda kullanıcıya manuel görsel ekleme önerilmiyor.");
console.log("✓ WhatsApp yalnızca teknik bilgilerle açılıyor.");
console.log("✓ Upload hatasında da kullanıcıdan screenshot istenmiyor.");
console.log("Şimdi: npm.cmd run build");
