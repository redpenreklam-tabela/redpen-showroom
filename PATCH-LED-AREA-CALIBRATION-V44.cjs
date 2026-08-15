const fs = require("fs");
const path = require("path");

const panelPath = path.join(process.cwd(), "app", "tasarla", "CostDebugPanel.tsx");
const signPath = path.join(process.cwd(), "app", "tasarla", "SignDesigner.tsx");

if (!fs.existsSync(panelPath) || !fs.existsSync(signPath)) {
  console.error("CostDebugPanel.tsx veya SignDesigner.tsx bulunamadı.");
  process.exit(1);
}

let panel = fs.readFileSync(panelPath, "utf8");
let sign = fs.readFileSync(signPath, "utf8");

// -----------------------------------------------------------------------------
// 1) CostDebugPanel prop: lighted
// -----------------------------------------------------------------------------
if (!panel.includes("  lighted: boolean;")) {
  const propsNeedle = `  baseMaterial: string;
};`;
  if (!panel.includes(propsNeedle)) {
    console.error("Patch durdu: CostDebugPanel Props sonu bulunamadı.");
    process.exit(1);
  }
  panel = panel.replace(
    propsNeedle,
    `  baseMaterial: string;
  lighted: boolean;
};`
  );
}

// -----------------------------------------------------------------------------
// 2) Config'e LED kalibrasyonu
// -----------------------------------------------------------------------------
const configNeedle = `  profile: { stockM: 6, price: 450, braceEveryCm: 80 },
} as const;`;

if (!panel.includes("led: {")) {
  if (!panel.includes(configNeedle)) {
    console.error("Patch durdu: CONFIG profile satırı bulunamadı.");
    process.exit(1);
  }

  panel = panel.replace(
    configNeedle,
    `  profile: { stockM: 6, price: 450, braceEveryCm: 80 },
  led: {
    unitPriceTl: 14,
    // Atölye referansı:
    // 50 cm yüksekliğinde Montserrat "R" harfi ≈ 40 LED.
    referenceCharacter: "R",
    referenceHeightCm: 50,
    referenceLedCount: 40,
    referenceFontFamily: "var(--font-sign-montserrat)",
  },
} as const;`
  );
}

// -----------------------------------------------------------------------------
// 3) Forex V43 mantığını da kümülatif olarak garanti et.
// -----------------------------------------------------------------------------
if (panel.includes(`    const usesForex = props.letterMaterial === "FOREX";`)) {
  panel = panel.replace(
    `    const usesForex = props.letterMaterial === "FOREX";`,
    `    // Tüm harf reçetelerinde altta Forex taban kullanılıyor.
    // Düz FOREX harfte aynı yüz tek kat sayılır.
    const usesForex = true;`
  );
}

// -----------------------------------------------------------------------------
// 4) geom sonrası referans R alanı + LED density
// -----------------------------------------------------------------------------
const geomNeedle = `    const composite =
      props.baseMaterial === "KOMPOZİT"
        ? bestComposite(props.width, props.height)
        : null;`;

if (!panel.includes("const referenceRGeometry")) {
  if (!panel.includes(geomNeedle)) {
    console.error("Patch durdu: geom sonrası composite bloğu bulunamadı.");
    process.exit(1);
  }

  panel = panel.replace(
    geomNeedle,
    `    const referenceRGeometry = textGeometry(
      CONFIG.led.referenceCharacter,
      CONFIG.led.referenceFontFamily,
      CONFIG.led.referenceHeightCm,
      0,
    );

    const ledPerM2 =
      referenceRGeometry.areaM2 > 0
        ? CONFIG.led.referenceLedCount / referenceRGeometry.areaM2
        : 0;

    const composite =
      props.baseMaterial === "KOMPOZİT"
        ? bestComposite(props.width, props.height)
        : null;`
  );
}

// -----------------------------------------------------------------------------
// 5) LED kullanılabilir mi + adet
// -----------------------------------------------------------------------------
const usesSideNeedle = `    const usesSide =
      props.letterMaterial === "PLEKSİ" ||
      props.letterMaterial === "GOLD KAPLAMA" ||
      props.letterMaterial === "KROM KAPLAMA" ||
      props.letterMaterial === "FİLELİ GOLD" ||
      props.letterMaterial === "FİLELİ KROM";`;

if (!panel.includes("const usesLed")) {
  if (!panel.includes(usesSideNeedle)) {
    console.error("Patch durdu: usesSide bloğu bulunamadı.");
    process.exit(1);
  }

  panel = panel.replace(
    usesSideNeedle,
    `${usesSideNeedle}

    const usesLed =
      props.lighted &&
      props.letterMaterial !== "FOREX" &&
      props.letterMaterial !== "FOLYO";

    const ledCount =
      usesLed && ledPerM2 > 0
        ? Math.max(1, Math.ceil(geom.areaM2 * ledPerM2))
        : 0;`
  );
}

// -----------------------------------------------------------------------------
// 6) Costs'e LED
// -----------------------------------------------------------------------------
const costsNeedle = `      profile: profileStocks * CONFIG.profile.price,
    };`;

if (!panel.includes("led: ledCount * CONFIG.led.unitPriceTl")) {
  if (!panel.includes(costsNeedle)) {
    console.error("Patch durdu: costs bloğu bulunamadı.");
    process.exit(1);
  }

  panel = panel.replace(
    costsNeedle,
    `      profile: profileStocks * CONFIG.profile.price,
      led: ledCount * CONFIG.led.unitPriceTl,
    };`
  );
}

const totalNeedle = `      costs.side +
      costs.profile;`;

if (panel.includes(totalNeedle)) {
  panel = panel.replace(
    totalNeedle,
    `      costs.side +
      costs.profile +
      costs.led;`
  );
}

// -----------------------------------------------------------------------------
// 7) return result'e LED değerleri
// -----------------------------------------------------------------------------
const returnNeedle = `      horizontal,
      costs,
      total,`;

if (!panel.includes("referenceRGeometry,") || !panel.includes("ledCount,")) {
  if (!panel.includes(returnNeedle)) {
    console.error("Patch durdu: result return bloğu bulunamadı.");
    process.exit(1);
  }

  panel = panel.replace(
    returnNeedle,
    `      horizontal,
      referenceRGeometry,
      ledPerM2,
      ledCount,
      costs,
      total,`
  );
}

// -----------------------------------------------------------------------------
// 8) Header artık LED HARİÇ demesin.
// -----------------------------------------------------------------------------
panel = panel.replace(
  `<b style={{ color: "#ffb53e", fontSize: 11 }}>LED HARİÇ</b>`,
  `<b style={{ color: "#ffb53e", fontSize: 11 }}>LED ALAN BAZLI</b>`
);

// -----------------------------------------------------------------------------
// 9) LED kartı: profil kartından sonra
// -----------------------------------------------------------------------------
if (!panel.includes("<small>LED</small>")) {
  const profileCardEnd = `        <div
          style={{
            ...box,
            borderColor: "rgba(255,181,62,.75)",
          }}
        >`;

  if (!panel.includes(profileCardEnd)) {
    console.error("Patch durdu: toplam kartı başlangıcı bulunamadı.");
    process.exit(1);
  }

  const ledCard = `        <div style={box}>
          <small>LED</small>
          <div style={{ fontSize: 18, fontWeight: 900, marginTop: 5 }}>
            {result.ledCount} adet
          </div>
          <div style={{ opacity: 0.6, fontSize: 11, marginTop: 5 }}>
            {result.ledCount
              ? \`14 TL/adet · \${tl(result.costs.led)}\`
              : "Işıksız / LED kullanılmıyor"}
          </div>
        </div>

`;

  panel = panel.replace(profileCardEnd, ledCard + profileCardEnd);
}

// -----------------------------------------------------------------------------
// 10) Toplam alt açıklaması
// -----------------------------------------------------------------------------
panel = panel.replace(
  `LED + metal yüz + işçilik + montaj + kâr dahil değil`,
  `Metal yüz + işçilik + montaj + kâr dahil değil`
);

// -----------------------------------------------------------------------------
// 11) Footer'a referans alan ve yoğunluk
// -----------------------------------------------------------------------------
const footerNeedle = `        verim katsayısı şimdilik %68.`;

if (panel.includes(footerNeedle)) {
  panel = panel.replace(
    footerNeedle,
    `        verim katsayısı şimdilik %68 · LED kalibrasyonu: 50 cm Montserrat R =
        40 LED · referans R alanı {result.referenceRGeometry.areaM2.toFixed(4)} m² ·
        yoğunluk {result.ledPerM2.toFixed(0)} LED/m².`
  );
}

const footerNeedleV43 = `        verim katsayısı şimdilik %68 · tüm harf reçetelerinde 1 kat Forex taban
        hesaba dahildir.`;

if (panel.includes(footerNeedleV43)) {
  panel = panel.replace(
    footerNeedleV43,
    `        verim katsayısı şimdilik %68 · tüm harf reçetelerinde 1 kat Forex taban
        hesaba dahildir · LED kalibrasyonu: 50 cm Montserrat R = 40 LED · referans
        R alanı {result.referenceRGeometry.areaM2.toFixed(4)} m² · yoğunluk
        {result.ledPerM2.toFixed(0)} LED/m².`
  );
}

// -----------------------------------------------------------------------------
// 12) SignDesigner CostDebugPanel'e lighted prop
// -----------------------------------------------------------------------------
if (!sign.includes("            lighted={lighted}")) {
  const renderNeedle = `            baseMaterial={baseMaterial}
          />`;

  if (!sign.includes(renderNeedle)) {
    console.error("Patch durdu: SignDesigner CostDebugPanel prop sonu bulunamadı.");
    process.exit(1);
  }

  sign = sign.replace(
    renderNeedle,
    `            baseMaterial={baseMaterial}
            lighted={lighted}
          />`
  );
}

fs.writeFileSync(panelPath, panel, "utf8");
fs.writeFileSync(signPath, sign, "utf8");

console.log("✓ LED birim fiyatı 14 TL/adet.");
console.log('✓ Referans: 50 cm Montserrat "R" = 40 LED.');
console.log("✓ Referans R gerçek raster alanından LED/m² yoğunluğu otomatik türetiliyor.");
console.log("✓ Sonraki tüm ışıklı harflerde LED = harf gerçek alanı × LED/m².");
console.log("✓ FOREX ve FOLYO harflerde LED 0.");
console.log("✓ IŞIK kapalıysa LED 0.");
console.log("✓ V43 Forex taban mantığı da kümülatif olarak garanti edildi.");
console.log("");
console.log("Şimdi: npm.cmd run build");
