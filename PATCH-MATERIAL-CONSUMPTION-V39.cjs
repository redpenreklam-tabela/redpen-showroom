const fs = require("fs");
const path = require("path");

const root = process.cwd();
const signPath = path.join(root, "app", "tasarla", "SignDesigner.tsx");
const cssPath = path.join(root, "app", "tasarla", "designer-usability.css");

if (!fs.existsSync(signPath) || !fs.existsSync(cssPath)) {
  console.error("Gerekli /tasarla dosyaları bulunamadı. Scripti proje kökünde çalıştır.");
  process.exit(1);
}

let src = fs.readFileSync(signPath, "utf8");
let css = fs.readFileSync(cssPath, "utf8");

const replaceOnce = (before, after, label) => {
  if (!src.includes(before)) {
    console.error(`Patch durdu: ${label} bulunamadı.`);
    process.exit(1);
  }
  src = src.replace(before, after);
};

// -----------------------------------------------------------------------------
// 1) Sarfiyat / maliyet yardımcıları
// -----------------------------------------------------------------------------
replaceOnce(
`const materialSlug = (material: LetterMaterial | LightStripMaterial) => {`,
`type TextGeometryEstimate = {
  areaM2: number;
  perimeterM: number;
  widthCm: number;
  heightCm: number;
};

type SheetEstimate = {
  sheets: number;
  usableAreaM2: number;
};

const COST_CONFIG = {
  compositeSheets: [
    { widthCm: 300, heightCm: 125, priceTl: 8700, label: "300 × 125" },
    { widthCm: 600, heightCm: 150, priceTl: 16200, label: "600 × 150" },
  ],
  forexSheet: { widthCm: 300, heightCm: 150, priceTl: 4800, nestingEfficiency: 0.68 },
  plexiSheet: { widthCm: 300, heightCm: 150, priceTl: 15000, nestingEfficiency: 0.68 },
  letterSidePricePerMeterTl: 120,
  profileStock: { lengthM: 6, priceTl: 450, braceEveryCm: 80 },
  // LED şimdilik bilinçli olarak maliyet hesabına alınmıyor.
  ledUnitPriceTl: 15,
} as const;

const formatTl = (value: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Math.max(0, value));

const estimateSheetUsage = (
  areaM2: number,
  targetHeightCm: number,
  sheet: { widthCm: number; heightCm: number; nestingEfficiency: number }
): SheetEstimate => {
  if (areaM2 <= 0) return { sheets: 0, usableAreaM2: 0 };

  const sheetAreaM2 = (sheet.widthCm * sheet.heightCm) / 10000;
  const usableAreaM2 = sheetAreaM2 * sheet.nestingEfficiency;
  const byArea = Math.max(1, Math.ceil(areaM2 / Math.max(0.01, usableAreaM2)));

  // Harf yüksekliği plakanın iki yönünden de büyükse en az parça sayısını yükselt.
  // Tam nesting değil; ilk yaklaşık plaka hesabı için güvenlik katmanı.
  const longestSheetSideCm = Math.max(sheet.widthCm, sheet.heightCm);
  const byDimension = Math.max(1, Math.ceil(targetHeightCm / longestSheetSideCm));

  return {
    sheets: Math.max(byArea, byDimension),
    usableAreaM2,
  };
};

const estimateCompositeSheets = (widthCm: number, heightCm: number) => {
  const safeW = Math.max(1, widthCm);
  const safeH = Math.max(1, heightCm);

  const options = COST_CONFIG.compositeSheets.flatMap((sheet) => {
    const normalCount =
      Math.ceil(safeW / sheet.widthCm) * Math.ceil(safeH / sheet.heightCm);
    const rotatedCount =
      Math.ceil(safeW / sheet.heightCm) * Math.ceil(safeH / sheet.widthCm);

    return [
      {
        ...sheet,
        orientation: "normal" as const,
        sheets: normalCount,
        costTl: normalCount * sheet.priceTl,
      },
      {
        ...sheet,
        orientation: "rotated" as const,
        sheets: rotatedCount,
        costTl: rotatedCount * sheet.priceTl,
      },
    ];
  });

  // Yükseklik her iki kompozit plaka yüksekliğine de uyuyorsa,
  // 300 ve 600'lüğü yatayda karıştırarak daha ucuz kombinasyonu da dene.
  if (safeH <= 125) {
    const max600 = Math.ceil(safeW / 600) + 1;
    for (let n600 = 0; n600 <= max600; n600 += 1) {
      const remaining = Math.max(0, safeW - n600 * 600);
      const n300 = Math.ceil(remaining / 300);
      if (n600 + n300 === 0) continue;

      options.push({
        widthCm: 0,
        heightCm: 0,
        priceTl: 0,
        label: `${n600}× 600×150 + ${n300}× 300×125`,
        orientation: "normal" as const,
        sheets: n600 + n300,
        costTl: n600 * 16200 + n300 * 8700,
      });
    }
  }

  return options.sort((a, b) => a.costTl - b.costTl || a.sheets - b.sheets)[0];
};

const estimateTextGeometry = (
  family: string,
  text: string,
  targetHeightCm: number,
  letterSpacingPercent: number,
  weight = 800
): TextGeometryEstimate => {
  if (typeof document === "undefined" || targetHeightCm <= 0 || !text.trim()) {
    return { areaM2: 0, perimeterM: 0, widthCm: 0, heightCm: 0 };
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return { areaM2: 0, perimeterM: 0, widthCm: 0, heightCm: 0 };
  }

  const testSize = 180;
  const resolvedFamily = resolveCssFontFamily(family);
  context.font = `${weight} ${testSize}px ${resolvedFamily}`;
  context.textBaseline = "alphabetic";

  const chars = Array.from(text);
  const letterSpacingPx = testSize * (letterSpacingPercent / 100);
  const charWidths = chars.map((char) => Math.max(1, context.measureText(char).width));
  const estimatedWidth =
    charWidths.reduce((sum, item) => sum + item, 0) +
    Math.max(0, chars.length - 1) * letterSpacingPx;

  canvas.width = Math.max(64, Math.ceil(estimatedWidth + testSize * 1.2));
  canvas.height = Math.ceil(testSize * 2.2);

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return { areaM2: 0, perimeterM: 0, widthCm: 0, heightCm: 0 };
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${weight} ${testSize}px ${resolvedFamily}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffffff";

  const baseline = testSize * 1.45;
  let x = testSize * 0.35;

  chars.forEach((char, index) => {
    ctx.fillText(char, x, baseline);
    x += charWidths[index] + (index < chars.length - 1 ? letterSpacingPx : 0);
  });

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const alpha = image.data;
  const w = canvas.width;
  const h = canvas.height;
  const threshold = 80;

  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  let inkPixels = 0;
  let boundaryEdges = 0;

  const filled = (px: number, py: number) => {
    if (px < 0 || py < 0 || px >= w || py >= h) return false;
    return alpha[(py * w + px) * 4 + 3] >= threshold;
  };

  for (let py = 0; py < h; py += 1) {
    for (let px = 0; px < w; px += 1) {
      if (!filled(px, py)) continue;

      inkPixels += 1;
      minX = Math.min(minX, px);
      minY = Math.min(minY, py);
      maxX = Math.max(maxX, px);
      maxY = Math.max(maxY, py);

      if (!filled(px - 1, py)) boundaryEdges += 1;
      if (!filled(px + 1, py)) boundaryEdges += 1;
      if (!filled(px, py - 1)) boundaryEdges += 1;
      if (!filled(px, py + 1)) boundaryEdges += 1;
    }
  }

  if (inkPixels === 0 || maxY < minY) {
    return { areaM2: 0, perimeterM: 0, widthCm: 0, heightCm: 0 };
  }

  const pixelGlyphHeight = Math.max(1, maxY - minY + 1);
  const pixelGlyphWidth = Math.max(1, maxX - minX + 1);
  const cmPerPixel = targetHeightCm / pixelGlyphHeight;

  const areaCm2 = inkPixels * cmPerPixel * cmPerPixel;
  const perimeterCm = boundaryEdges * cmPerPixel;

  return {
    areaM2: areaCm2 / 10000,
    perimeterM: perimeterCm / 100,
    widthCm: pixelGlyphWidth * cmPerPixel,
    heightCm: targetHeightCm,
  };
};

const materialSlug = (material: LetterMaterial | LightStripMaterial) => {`,
"cost helpers"
);

// -----------------------------------------------------------------------------
// 2) Debug flag state
// -----------------------------------------------------------------------------
replaceOnce(
`  const [quoteSubmitting, setQuoteSubmitting] = useState(false);`,
`  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [costDebug, setCostDebug] = useState(false);`,
"cost debug state"
);

// -----------------------------------------------------------------------------
// 3) URL flag
// -----------------------------------------------------------------------------
replaceOnce(
`  const dragRef = useRef<{`,
`  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCostDebug(params.get("costdebug") === "1");
  }, []);

  const dragRef = useRef<{`,
"cost debug query flag"
);

// -----------------------------------------------------------------------------
// 4) Consumption engine. Glyph ölçümlerinden hemen sonra.
// -----------------------------------------------------------------------------
replaceOnce(
`  const isSolidMetalFace =
    letterMaterial === "GOLD KAPLAMA" || letterMaterial === "KROM KAPLAMA";`,
`  const materialConsumption = useMemo(() => {
    const mainGeometry = estimateTextGeometry(
      currentFont.family,
      normalizedText,
      letterHeightCm,
      letterSpacing,
      800
    );

    const extraGeometry = extraTextEnabled
      ? estimateTextGeometry(
          currentExtraFont.family,
          normalizedExtraText,
          extraLetterHeightCm,
          extraLetterSpacing,
          800
        )
      : { areaM2: 0, perimeterM: 0, widthCm: 0, heightCm: 0 };

    const usesPlexiFace = (material: LetterMaterial) =>
      material === "PLEKSİ" ||
      material === "FİLELİ GOLD" ||
      material === "FİLELİ KROM";

    const usesForexFace = (material: LetterMaterial) => material === "FOREX";

    const usesLetterSide = (material: LetterMaterial) =>
      material === "PLEKSİ" ||
      material === "GOLD KAPLAMA" ||
      material === "KROM KAPLAMA" ||
      material === "FİLELİ GOLD" ||
      material === "FİLELİ KROM";

    let plexiLetterAreaM2 = 0;
    let forexLetterAreaM2 = 0;
    let metalFaceAreaM2 = 0;
    let sidePerimeterM = 0;

    if (usesPlexiFace(letterMaterial)) plexiLetterAreaM2 += mainGeometry.areaM2;
    if (usesForexFace(letterMaterial)) forexLetterAreaM2 += mainGeometry.areaM2;
    if (
      letterMaterial === "GOLD KAPLAMA" ||
      letterMaterial === "KROM KAPLAMA"
    ) {
      metalFaceAreaM2 += mainGeometry.areaM2;
    }
    if (usesLetterSide(letterMaterial)) sidePerimeterM += mainGeometry.perimeterM;

    if (extraTextEnabled) {
      if (usesPlexiFace(extraLetterMaterial)) plexiLetterAreaM2 += extraGeometry.areaM2;
      if (usesForexFace(extraLetterMaterial)) forexLetterAreaM2 += extraGeometry.areaM2;
      if (
        extraLetterMaterial === "GOLD KAPLAMA" ||
        extraLetterMaterial === "KROM KAPLAMA"
      ) {
        metalFaceAreaM2 += extraGeometry.areaM2;
      }
      if (usesLetterSide(extraLetterMaterial)) sidePerimeterM += extraGeometry.perimeterM;
    }

    // 6 cm ışık bandının yüz alanını da Pleksi / Forex sarfiyatına dahil et.
    const edgeLengthCm = (() => {
      switch (lightStripMode) {
        case "top":
        case "bottom":
          return width;
        case "top-bottom":
          return width * 2;
        case "left":
        case "right":
          return height;
        case "left-right":
          return height * 2;
        case "all":
          return width * 2 + height * 2;
        default:
          return 0;
      }
    })();

    const lightStripAreaM2 = (edgeLengthCm * 6) / 10000;

    if (
      lightStripMode !== "none" &&
      (lightStripMaterial === "PLEKSİ" ||
        lightStripMaterial === "FİLELİ GOLD" ||
        lightStripMaterial === "FİLELİ KROM")
    ) {
      plexiLetterAreaM2 += lightStripAreaM2;
    }

    if (lightStripMode !== "none" && lightStripMaterial === "FOREX") {
      forexLetterAreaM2 += lightStripAreaM2;
    }

    if (
      lightStripMode !== "none" &&
      (lightStripMaterial === "GOLD KAPLAMA" ||
        lightStripMaterial === "KROM KAPLAMA")
    ) {
      metalFaceAreaM2 += lightStripAreaM2;
    }

    const plexiLetters = estimateSheetUsage(
      plexiLetterAreaM2,
      Math.max(letterHeightCm, extraTextEnabled ? extraLetterHeightCm : 0, 6),
      COST_CONFIG.plexiSheet
    );

    const forexLetters = estimateSheetUsage(
      forexLetterAreaM2,
      Math.max(letterHeightCm, extraTextEnabled ? extraLetterHeightCm : 0, 6),
      COST_CONFIG.forexSheet
    );

    const composite =
      baseMaterial === "KOMPOZİT"
        ? estimateCompositeSheets(width, height)
        : null;

    const plexiGround =
      baseMaterial === "PLEKSİ"
        ? estimateSheetUsage(
            (width * height) / 10000,
            Math.max(width, height),
            COST_CONFIG.plexiSheet
          )
        : { sheets: 0, usableAreaM2: 0 };

    // 80 cm'de bir yaklaşık profil dikmesi + gerekirse yatay ara kayıt.
    const profilePerimeterM = (2 * width + 2 * height) / 100;
    const verticalBraceCount = Math.max(
      0,
      Math.ceil(width / COST_CONFIG.profileStock.braceEveryCm) - 1
    );
    const horizontalBraceCount = Math.max(
      0,
      Math.ceil(height / COST_CONFIG.profileStock.braceEveryCm) - 1
    );
    const profileBraceM =
      (verticalBraceCount * height + horizontalBraceCount * width) / 100;
    const profileTotalM = profilePerimeterM + profileBraceM;
    const profileStocks = Math.max(
      1,
      Math.ceil(profileTotalM / COST_CONFIG.profileStock.lengthM)
    );

    const sideCostTl =
      sidePerimeterM * COST_CONFIG.letterSidePricePerMeterTl;
    const profileCostTl =
      profileStocks * COST_CONFIG.profileStock.priceTl;
    const compositeCostTl = composite?.costTl ?? 0;
    const plexiLetterCostTl =
      plexiLetters.sheets * COST_CONFIG.plexiSheet.priceTl;
    const plexiGroundCostTl =
      plexiGround.sheets * COST_CONFIG.plexiSheet.priceTl;
    const forexLetterCostTl =
      forexLetters.sheets * COST_CONFIG.forexSheet.priceTl;

    const knownCostTl =
      compositeCostTl +
      plexiLetterCostTl +
      plexiGroundCostTl +
      forexLetterCostTl +
      sideCostTl +
      profileCostTl;

    return {
      mainGeometry,
      extraGeometry,
      plexiLetterAreaM2,
      forexLetterAreaM2,
      metalFaceAreaM2,
      sidePerimeterM,
      lightStripAreaM2,
      plexiLetters,
      forexLetters,
      composite,
      plexiGround,
      profileTotalM,
      profileStocks,
      verticalBraceCount,
      horizontalBraceCount,
      costs: {
        compositeCostTl,
        plexiLetterCostTl,
        plexiGroundCostTl,
        forexLetterCostTl,
        sideCostTl,
        profileCostTl,
        knownCostTl,
      },
    };
  }, [
    currentFont.family,
    normalizedText,
    letterHeightCm,
    letterSpacing,
    letterMaterial,
    extraTextEnabled,
    currentExtraFont.family,
    normalizedExtraText,
    extraLetterHeightCm,
    extraLetterSpacing,
    extraLetterMaterial,
    baseMaterial,
    width,
    height,
    lightStripMode,
    lightStripMaterial,
    fontMetricsVersion,
  ]);

  useEffect(() => {
    if (!costDebug) return;
    console.groupCollapsed("[REDPEN] Material Consumption Engine V39");
    console.table({
      "Ana yazı yüz alanı (m²)": materialConsumption.mainGeometry.areaM2.toFixed(3),
      "Ana yazı çevresi (m)": materialConsumption.mainGeometry.perimeterM.toFixed(2),
      "Pleksi toplam yüz (m²)": materialConsumption.plexiLetterAreaM2.toFixed(3),
      "Forex toplam yüz (m²)": materialConsumption.forexLetterAreaM2.toFixed(3),
      "Metal yüz - fiyat bekliyor (m²)": materialConsumption.metalFaceAreaM2.toFixed(3),
      "Harf yanağı (m)": materialConsumption.sidePerimeterM.toFixed(2),
      "Profil toplam (m)": materialConsumption.profileTotalM.toFixed(2),
      "Bilinen maliyet": formatTl(materialConsumption.costs.knownCostTl),
    });
    console.log(materialConsumption);
    console.groupEnd();
  }, [costDebug, materialConsumption]);

  const isSolidMetalFace =
    letterMaterial === "GOLD KAPLAMA" || letterMaterial === "KROM KAPLAMA";`,
"consumption engine"
);

// -----------------------------------------------------------------------------
// 5) Görsel test paneli: sadece ?costdebug=1
// -----------------------------------------------------------------------------
replaceOnce(
`          <div className="designer-summary">`,
`          {costDebug && (
            <div className="designer-cost-debug">
              <div className="designer-cost-debug-head">
                <div>
                  <span>MATERIAL ENGINE V39</span>
                  <strong>SARFİYAT / MALİYET TESTİ</strong>
                </div>
                <b>LED HARİÇ</b>
              </div>

              <div className="designer-cost-debug-grid">
                <div>
                  <span>KOMPOZİT</span>
                  <strong>
                    {materialConsumption.composite
                      ? `${materialConsumption.composite.sheets} plaka`
                      : "KULLANILMIYOR"}
                  </strong>
                  <small>
                    {materialConsumption.composite
                      ? `${materialConsumption.composite.label} · ${formatTl(materialConsumption.costs.compositeCostTl)}`
                      : "Zemin kompozit değil"}
                  </small>
                </div>

                <div>
                  <span>PLEKSİ</span>
                  <strong>
                    {materialConsumption.plexiLetters.sheets +
                      materialConsumption.plexiGround.sheets} plaka
                  </strong>
                  <small>
                    Harf/bant {materialConsumption.plexiLetters.sheets} · zemin {materialConsumption.plexiGround.sheets}
                  </small>
                </div>

                <div>
                  <span>FOREX</span>
                  <strong>{materialConsumption.forexLetters.sheets} plaka</strong>
                  <small>{materialConsumption.forexLetterAreaM2.toFixed(2)} m² tahmini yüz</small>
                </div>

                <div>
                  <span>HARF YANAĞI</span>
                  <strong>{materialConsumption.sidePerimeterM.toFixed(1)} m</strong>
                  <small>{formatTl(materialConsumption.costs.sideCostTl)}</small>
                </div>

                <div>
                  <span>DEMİR PROFİL</span>
                  <strong>{materialConsumption.profileStocks} × 6 m</strong>
                  <small>
                    {materialConsumption.profileTotalM.toFixed(1)} m ihtiyaç · {formatTl(materialConsumption.costs.profileCostTl)}
                  </small>
                </div>

                <div>
                  <span>METAL YÜZ</span>
                  <strong>{materialConsumption.metalFaceAreaM2.toFixed(2)} m²</strong>
                  <small>Gold/Krom fiyatı henüz girilmedi</small>
                </div>
              </div>

              <div className="designer-cost-debug-total">
                <div>
                  <span>ŞU AN BİLİNEN MALZEME MALİYETİ</span>
                  <strong>{formatTl(materialConsumption.costs.knownCostTl)}</strong>
                </div>
                <p>
                  LED, Gold/Krom yüz, işçilik, montaj, nakliye ve kâr dahil değildir.
                  Bu ekran müşteriye gösterilmez; sadece <b>?costdebug=1</b> ile açılır.
                </p>
              </div>

              <div className="designer-cost-debug-notes">
                <span>
                  Ana yazı: {materialConsumption.mainGeometry.areaM2.toFixed(3)} m² yüz /
                  {" "}{materialConsumption.mainGeometry.perimeterM.toFixed(2)} m çevre
                </span>
                <span>
                  Profil: {materialConsumption.verticalBraceCount} dikey + {materialConsumption.horizontalBraceCount} yatay ara kayıt
                </span>
                <span>
                  Pleksi/Forex nesting verimi ilk testte %68 kabul edildi.
                </span>
              </div>
            </div>
          )}

          <div className="designer-summary">`,
"cost debug panel"
);

// -----------------------------------------------------------------------------
// 6) CSS
// -----------------------------------------------------------------------------
const cssMarker = "/* REDPEN MATERIAL CONSUMPTION DEBUG V39 */";
if (!css.includes(cssMarker)) {
  css += `

${cssMarker}
.designer-cost-debug {
  margin: 10px 0 8px;
  border: 1px solid rgba(255, 181, 62, .28);
  background:
    linear-gradient(135deg, rgba(255,181,62,.055), transparent 38%),
    rgba(9,10,13,.94);
  color: #fff;
}

.designer-cost-debug-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255,255,255,.08);
}

.designer-cost-debug-head span {
  display: block;
  margin-bottom: 4px;
  color: #ffb53e;
  font: 800 9px/1 var(--font-geist-mono);
  letter-spacing: .12em;
}

.designer-cost-debug-head strong {
  font-size: 13px;
  letter-spacing: .02em;
}

.designer-cost-debug-head > b {
  padding: 6px 8px;
  border: 1px solid rgba(255,181,62,.24);
  color: #ffb53e;
  font: 800 9px/1 var(--font-geist-mono);
  letter-spacing: .08em;
}

.designer-cost-debug-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: rgba(255,255,255,.07);
}

.designer-cost-debug-grid > div {
  min-width: 0;
  padding: 14px 15px;
  background: #101115;
}

.designer-cost-debug-grid span {
  display: block;
  margin-bottom: 7px;
  color: rgba(255,255,255,.4);
  font: 800 9px/1 var(--font-geist-mono);
  letter-spacing: .1em;
}

.designer-cost-debug-grid strong {
  display: block;
  margin-bottom: 5px;
  color: #fff;
  font-size: 15px;
}

.designer-cost-debug-grid small {
  display: block;
  overflow: hidden;
  color: rgba(255,255,255,.48);
  font-size: 10px;
  line-height: 1.35;
  text-overflow: ellipsis;
}

.designer-cost-debug-total {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 24px;
  padding: 16px;
  border-top: 1px solid rgba(255,255,255,.08);
}

.designer-cost-debug-total span {
  display: block;
  margin-bottom: 6px;
  color: rgba(255,255,255,.42);
  font: 800 9px/1 var(--font-geist-mono);
  letter-spacing: .08em;
}

.designer-cost-debug-total strong {
  color: #ffb53e;
  font-size: 22px;
}

.designer-cost-debug-total p {
  margin: 0;
  color: rgba(255,255,255,.45);
  font-size: 10px;
  line-height: 1.5;
}

.designer-cost-debug-notes {
  display: flex;
  flex-wrap: wrap;
  gap: 7px 16px;
  padding: 10px 16px 13px;
  border-top: 1px dashed rgba(255,255,255,.08);
  color: rgba(255,255,255,.35);
  font: 700 9px/1.35 var(--font-geist-mono);
}

@media (max-width: 900px) {
  .designer-cost-debug-grid {
    grid-template-columns: 1fr 1fr;
  }

  .designer-cost-debug-total {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}

@media (max-width: 560px) {
  .designer-cost-debug-grid {
    grid-template-columns: 1fr;
  }
}
`;
}

fs.writeFileSync(signPath, src, "utf8");
fs.writeFileSync(cssPath, css, "utf8");

console.log("✓ Material Consumption Engine V39 eklendi.");
console.log("✓ Verilen kompozit / forex / pleksi / yanak / profil fiyatları işlendi.");
console.log("✓ LED fiyatı config'te kayıtlı ama toplamdan bilinçli olarak hariç.");
console.log("✓ Test paneli sadece /tasarla?costdebug=1 adresinde görünür.");
console.log("✓ Ana yazı gerçek raster glyph alanı + yaklaşık kontur çevresi ile ölçülür.");
console.log("✓ Pleksi/Forex için ilk yaklaşık nesting verimi %68.");
console.log("");
console.log("Şimdi: npm.cmd run build");
