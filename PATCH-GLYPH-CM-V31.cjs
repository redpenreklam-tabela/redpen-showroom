const fs = require("fs");
const path = require("path");

const projectRoot = process.cwd();
const signPath = path.join(projectRoot, "app", "tasarla", "SignDesigner.tsx");

if (!fs.existsSync(signPath)) {
  console.error("SignDesigner.tsx bulunamadı. Scripti D:\\Projects\\redpen-showroom içinde çalıştır.");
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

// Font family CSS değişkenini gerçek font adına çözüp,
// Canvas actualBoundingBox ile yazının gerçek görünen yüksekliğini ölçer.
const helperMarker = `const hexToRgb = (hex: string) => {`;
const helper = `const resolveCssFontFamily = (family: string) => {
  if (typeof window === "undefined") return family;

  const match = family.match(/^var\\((--[^)]+)\\)$/);
  if (!match) return family;

  const resolved = getComputedStyle(document.documentElement)
    .getPropertyValue(match[1])
    .trim();

  return resolved || family;
};

const measureGlyphHeightRatio = (
  family: string,
  text: string,
  weight = 800
) => {
  if (typeof document === "undefined") return 0.72;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return 0.72;

  const testSize = 1000;
  const resolvedFamily = resolveCssFontFamily(family);

  context.font = \`\${weight} \${testSize}px \${resolvedFamily}\`;

  const metrics = context.measureText(text || "REDPEN");
  const actualHeight =
    (metrics.actualBoundingBoxAscent || 0) +
    (metrics.actualBoundingBoxDescent || 0);

  if (!Number.isFinite(actualHeight) || actualHeight <= 0) return 0.72;

  // Aşırı sıra dışı font metriklerine karşı güvenli sınır.
  return Math.max(0.35, Math.min(1.25, actualHeight / testSize));
};

`;

if (!src.includes("measureGlyphHeightRatio")) {
  const idx = src.indexOf(helperMarker);
  if (idx < 0) {
    console.error("hexToRgb marker bulunamadı.");
    process.exit(1);
  }
  src = src.slice(0, idx) + helper + src.slice(idx);
}

// Fontların gerçekten yüklendiği anda metrikleri bir kez daha hesaplat.
const stateMarker = `  const [selectedFont, setSelectedFont] = useState<FontId>("montserrat");`;
mustReplace(
  stateMarker,
  `${stateMarker}
  const [fontMetricsVersion, setFontMetricsVersion] = useState(0);`,
  "selected font state"
);

// currentFont/currentExtraFont tanımlarından sonra ratio'ları ekle.
const currentFontBlock = `  const currentFont = fonts.find((font) => font.id === selectedFont) ?? fonts[0];
  const currentExtraFont = fonts.find((font) => font.id === extraFont) ?? fonts[0];`;

mustReplace(
  currentFontBlock,
  `${currentFontBlock}

  const mainGlyphHeightRatio = useMemo(
    () => measureGlyphHeightRatio(currentFont.family, normalizedText, 800),
    [currentFont.family, normalizedText, fontMetricsVersion]
  );

  const extraGlyphHeightRatio = useMemo(
    () => measureGlyphHeightRatio(currentExtraFont.family, normalizedExtraText, 800),
    [currentExtraFont.family, normalizedExtraText, fontMetricsVersion]
  );`,
  "current font block"
);

// Ancak normalizedText/currentFont sırası eski dosyada currentFont'tan sonra normalizedExtraText olabilir.
// Yukarıdaki ekleme normalizedExtraText daha sonra tanımlıysa temporal dead zone'a düşer.
// Bu yüzden ratio bloklarını güvenli yere taşı.
const badOrder = `  const currentFont = fonts.find((font) => font.id === selectedFont) ?? fonts[0];
  const currentExtraFont = fonts.find((font) => font.id === extraFont) ?? fonts[0];

  const mainGlyphHeightRatio = useMemo(
    () => measureGlyphHeightRatio(currentFont.family, normalizedText, 800),
    [currentFont.family, normalizedText, fontMetricsVersion]
  );

  const extraGlyphHeightRatio = useMemo(
    () => measureGlyphHeightRatio(currentExtraFont.family, normalizedExtraText, 800),
    [currentExtraFont.family, normalizedExtraText, fontMetricsVersion]
  );`;

if (src.includes(badOrder)) {
  src = src.replace(
    badOrder,
    `  const currentFont = fonts.find((font) => font.id === selectedFont) ?? fonts[0];
  const currentExtraFont = fonts.find((font) => font.id === extraFont) ?? fonts[0];`
  );

  const normalizedExtraMarker = `  const normalizedExtraText = (extraText.trim() || "Ek Metin").slice(0, 32);`;
  mustReplace(
    normalizedExtraMarker,
    `${normalizedExtraMarker}

  const mainGlyphHeightRatio = useMemo(
    () => measureGlyphHeightRatio(currentFont.family, normalizedText, 800),
    [currentFont.family, normalizedText, fontMetricsVersion]
  );

  const extraGlyphHeightRatio = useMemo(
    () => measureGlyphHeightRatio(currentExtraFont.family, normalizedExtraText, 800),
    [currentExtraFont.family, normalizedExtraText, fontMetricsVersion]
  );`,
    "normalized extra text marker"
  );
}

// document.fonts.ready effect'i ekle.
const firstEffectMarker = `  useEffect(() => {`;
const firstEffectIndex = src.indexOf(firstEffectMarker, src.indexOf("export default function SignDesigner"));
if (firstEffectIndex < 0) {
  console.error("useEffect marker bulunamadı.");
  process.exit(1);
}

const fontReadyEffect = `  useEffect(() => {
    let active = true;

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (active) setFontMetricsVersion((value) => value + 1);
      });
    }

    return () => {
      active = false;
    };
  }, [selectedFont, extraFont]);

`;

if (!src.includes("document.fonts.ready.then")) {
  src = src.slice(0, firstEffectIndex) + fontReadyEffect + src.slice(firstEffectIndex);
}

// Ana harfin CSS font-size oranı artık "font-size" değil gerçek glyph yüksekliği hedefler.
mustReplace(
  `      "--font-size-ratio": \`\${letterHeightCm / Math.max(1, height)}\`,`,
  `      "--font-size-ratio": \`\${(letterHeightCm / Math.max(1, height)) / mainGlyphHeightRatio}\`,`,
  "main cm ratio"
);

// Board style useMemo dependency listesine ratio ekle.
// Tam biçim projede değişebildiği için letterHeightCm'in geçtiği ilk dependency bölümünü hedefle.
const boardStyleStart = src.indexOf("const boardStyle");
if (boardStyleStart >= 0) {
  const nextClose = src.indexOf("]);", boardStyleStart);
  if (nextClose >= 0) {
    const chunk = src.slice(boardStyleStart, nextClose + 3);
    if (chunk.includes("letterHeightCm") && !chunk.includes("mainGlyphHeightRatio")) {
      const updated = chunk.replace(
        /(\n\s*letterHeightCm,\s*\n)/,
        `$1    mainGlyphHeightRatio,\n`
      );
      src = src.slice(0, boardStyleStart) + updated + src.slice(nextClose + 3);
    }
  }
}

// Ek metin gerçek glyph yüksekliğine göre scale edilir.
mustReplace(
  `                      fontSize: \`calc(var(--board-px-height) * \${extraLetterHeightCm / Math.max(1, height)})\`,`,
  `                      fontSize: \`calc(var(--board-px-height) * \${(extraLetterHeightCm / Math.max(1, height)) / extraGlyphHeightRatio})\`,`,
  "extra cm ratio"
);

// Clamp effect ratio değişince yeniden çalışsın.
src = src.replace(
  /(\[letterHeightCm,\s*letterSpacing,\s*extraLetterHeightCm,\s*extraLetterSpacing,\s*logoHeightCm,)/,
  `$1 mainGlyphHeightRatio, extraGlyphHeightRatio,`
);

fs.writeFileSync(signPath, src, "utf8");

console.log("✓ Ana harf cm ölçüsü gerçek glyph yüksekliğine kalibre edildi.");
console.log("✓ Ek metin cm ölçüsü gerçek glyph yüksekliğine kalibre edildi.");
console.log("✓ Font değişince metrik otomatik yeniden ölçülüyor.");
console.log("✓ Logo ölçüsüne dokunulmadı; image height zaten gerçek yüksekliği temsil ediyor.");
console.log("Şimdi: npm.cmd run build");
