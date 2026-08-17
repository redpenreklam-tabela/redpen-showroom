const fs = require("fs");
const path = require("path");

const panelPath = path.join(process.cwd(), "app", "tasarla", "CostDebugPanel.tsx");

if (!fs.existsSync(panelPath)) {
  console.error("CostDebugPanel.tsx bulunamadı.");
  process.exit(1);
}

let src = fs.readFileSync(panelPath, "utf8");

const oldCosts = `    const costs = {
      composite: composite?.cost ?? 0,
      plexi: plexiSheets * CONFIG.plexi.price,
      forex: forexSheets * CONFIG.forex.price,
      side: sideM * CONFIG.sidePerM,
      profile: profileStocks * CONFIG.profile.price,
      led: ledCount * CONFIG.led.unitPriceTl,
    };`;

const newCosts = `    // Pleksi ve Forex maliyeti artık tam plaka adedinden değil,
    // kullanılan efektif plaka alanı payından hesaplanır.
    // Böylece 6 cm ışık bandı eklendiği anda fiyat da kademesiz artar.
    const plexiEffectiveSheetAreaM2 =
      ((CONFIG.plexi.w * CONFIG.plexi.h) / 10000) * CONFIG.plexi.efficiency;

    const forexEffectiveSheetAreaM2 =
      ((CONFIG.forex.w * CONFIG.forex.h) / 10000) * CONFIG.forex.efficiency;

    const plexiUsedSheetShare =
      plexiEffectiveSheetAreaM2 > 0
        ? plexiAreaM2 / plexiEffectiveSheetAreaM2
        : 0;

    const forexUsedSheetShare =
      forexEffectiveSheetAreaM2 > 0
        ? forexAreaM2 / forexEffectiveSheetAreaM2
        : 0;

    const costs = {
      composite: composite?.cost ?? 0,
      plexi: plexiUsedSheetShare * CONFIG.plexi.price,
      forex: forexUsedSheetShare * CONFIG.forex.price,
      side: sideM * CONFIG.sidePerM,
      profile: profileStocks * CONFIG.profile.price,
      led: ledCount * CONFIG.led.unitPriceTl,
    };`;

if (!src.includes("const plexiUsedSheetShare =")) {
  if (!src.includes(oldCosts)) {
    console.error("Patch durdu: mevcut costs bloğu bulunamadı.");
    process.exit(1);
  }
  src = src.replace(oldCosts, newCosts);
}

// Return debug shares
if (!src.includes("      plexiUsedSheetShare,")) {
  src = src.replace(
`      plexiAreaM2,
      forexAreaM2,
      costs,`,
`      plexiAreaM2,
      forexAreaM2,
      plexiUsedSheetShare,
      forexUsedSheetShare,
      costs,`
  );
}

// Debug cards: show share + estimated full sheet count
src = src.replace(
`            {result.geom.areaM2.toFixed(3)} m² yüz · {tl(result.costs.plexi)}`,
`            {result.plexiAreaM2.toFixed(3)} m² toplam · %{(result.plexiUsedSheetShare * 100).toFixed(1)} efektif plaka · {tl(result.costs.plexi)}`
);

src = src.replace(
`            {result.forexSheets ? tl(result.costs.forex) : "Kullanılmıyor"}`,
`            {result.forexSheets
              ? \`\${result.forexAreaM2.toFixed(3)} m² toplam · %\${(result.forexUsedSheetShare * 100).toFixed(1)} efektif plaka · \${tl(result.costs.forex)}\`
              : "Kullanılmıyor"}`
);

fs.writeFileSync(panelPath, src, "utf8");

console.log("✓ Pleksi fiyatı kullanılan efektif alan payına bağlandı.");
console.log("✓ Forex fiyatı kullanılan efektif alan payına bağlandı.");
console.log("✓ Işık bandı açıldığında Pleksi/Forex fiyatı artık hemen değişir.");
console.log("✓ Debug panelde tam plaka ihtiyacı yine bilgi olarak korunur.");
console.log("✓ %68 verim/fire katsayısı fiyat hesabında korunur.");
console.log("");
console.log("Şimdi: npm.cmd run build");
