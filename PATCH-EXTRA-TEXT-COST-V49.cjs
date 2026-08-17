const fs=require("fs"),path=require("path");
const panelPath=path.join(process.cwd(),"app","tasarla","CostDebugPanel.tsx");
const signPath=path.join(process.cwd(),"app","tasarla","SignDesigner.tsx");
if(!fs.existsSync(panelPath)||!fs.existsSync(signPath)){console.error("Gerekli dosyalar yok.");process.exit(1);}
let panel=fs.readFileSync(panelPath,"utf8");
let sign=fs.readFileSync(signPath,"utf8");

if(!panel.includes("  extraTextEnabled: boolean;")){
  panel=panel.replace(
`  lightStripMode: string;
  onQuote: () => void;`,
`  lightStripMode: string;
  extraTextEnabled: boolean;
  extraText: string;
  extraFontFamily: string;
  extraLetterHeightCm: number;
  extraLetterSpacing: number;
  extraLetterMaterial: string;
  onQuote: () => void;`);
}

if(!panel.includes("const extraGeom = props.extraTextEnabled")){
  panel=panel.replace(
`    const geom = textGeometry(
      props.text,
      props.fontFamily,
      props.letterHeightCm,
      props.letterSpacing,
    );`,
`    const geom = textGeometry(
      props.text,
      props.fontFamily,
      props.letterHeightCm,
      props.letterSpacing,
    );

    const extraGeom = props.extraTextEnabled
      ? textGeometry(
          props.extraText,
          props.extraFontFamily,
          props.extraLetterHeightCm,
          props.extraLetterSpacing,
        )
      : { areaM2: 0, perimeterM: 0 };`);
}

if(!panel.includes("const extraUsesPlexi =")){
  panel=panel.replace(
`    const usesLed =
      props.lighted &&
      props.letterMaterial !== "FOREX" &&
      props.letterMaterial !== "FOLYO";`,
`    const usesLed =
      props.lighted &&
      props.letterMaterial !== "FOREX" &&
      props.letterMaterial !== "FOLYO";

    const extraUsesPlexi =
      props.extraTextEnabled &&
      (props.extraLetterMaterial === "PLEKSİ" ||
       props.extraLetterMaterial === "FİLELİ GOLD" ||
       props.extraLetterMaterial === "FİLELİ KROM");

    const extraUsesForex = props.extraTextEnabled;

    const extraUsesSide =
      props.extraTextEnabled &&
      (props.extraLetterMaterial === "PLEKSİ" ||
       props.extraLetterMaterial === "GOLD KAPLAMA" ||
       props.extraLetterMaterial === "KROM KAPLAMA" ||
       props.extraLetterMaterial === "FİLELİ GOLD" ||
       props.extraLetterMaterial === "FİLELİ KROM");

    const extraUsesLed =
      props.extraTextEnabled &&
      props.lighted &&
      props.extraLetterMaterial !== "FOREX" &&
      props.extraLetterMaterial !== "FOLYO";`);
}

if(!panel.includes("const extraLedCount =")){
  panel=panel.replace(
`    const stripLedCount =
      stripGeom.active && ledPerM2 > 0
        ? Math.max(1, Math.ceil(stripGeom.areaM2 * ledPerM2))
        : 0;

    const ledCount = letterLedCount + stripLedCount;`,
`    const stripLedCount =
      stripGeom.active && ledPerM2 > 0
        ? Math.max(1, Math.ceil(stripGeom.areaM2 * ledPerM2))
        : 0;

    const extraLedCount =
      extraUsesLed && ledPerM2 > 0
        ? Math.max(1, Math.ceil(extraGeom.areaM2 * ledPerM2))
        : 0;

    const ledCount = letterLedCount + extraLedCount + stripLedCount;`);
}

if(!panel.includes("(extraUsesPlexi ? extraGeom.areaM2 : 0)")){
  panel=panel.replace(
`    const plexiAreaM2 =
      (usesPlexi ? geom.areaM2 : 0) +
      (stripGeom.active ? stripGeom.areaM2 : 0);

    const forexAreaM2 =
      (usesForex ? geom.areaM2 : 0) +
      (stripGeom.active ? stripGeom.areaM2 : 0);`,
`    const plexiAreaM2 =
      (usesPlexi ? geom.areaM2 : 0) +
      (extraUsesPlexi ? extraGeom.areaM2 : 0) +
      (stripGeom.active ? stripGeom.areaM2 : 0);

    const forexAreaM2 =
      (usesForex ? geom.areaM2 : 0) +
      (extraUsesForex ? extraGeom.areaM2 : 0) +
      (stripGeom.active ? stripGeom.areaM2 : 0);`);
}

if(!panel.includes("(extraUsesSide ? extraGeom.perimeterM : 0)")){
  panel=panel.replace(
`    const sideM =
      (usesSide ? geom.perimeterM : 0) +
      (stripGeom.active ? stripGeom.sideM : 0);`,
`    const sideM =
      (usesSide ? geom.perimeterM : 0) +
      (extraUsesSide ? extraGeom.perimeterM : 0) +
      (stripGeom.active ? stripGeom.sideM : 0);`);
}

if(!panel.includes("      extraGeom,")){
  panel=panel.replace(`      geom,
      composite,`,`      geom,
      extraGeom,
      composite,`);
}
if(!panel.includes("      extraLedCount,")){
  panel=panel.replace(`      letterLedCount,
      stripLedCount,`,`      letterLedCount,
      extraLedCount,
      stripLedCount,`);
}

if(!panel.includes("<small>İKİNCİ METİN</small>")){
  panel=panel.replace(
`        {result.stripGeom.active && (
          <div style={box}>`,
`        {props.extraTextEnabled && (
          <div style={box}>
            <small>İKİNCİ METİN</small>
            <div style={{ fontSize: 18, fontWeight: 900, marginTop: 5 }}>
              {result.extraGeom.areaM2.toFixed(3)} m²
            </div>
            <div style={{ opacity: 0.6, fontSize: 11, marginTop: 5 }}>
              {props.extraLetterMaterial} · {result.extraGeom.perimeterM.toFixed(1)} m kontur · {result.extraLedCount} LED
            </div>
          </div>
        )}

        {result.stripGeom.active && (
          <div style={box}>`);
}

if(!sign.includes("            extraTextEnabled={extraTextEnabled}")){
  sign=sign.replace(
`            lightStripMode={lightStripMode}
            onQuote={handleQuoteRequest}`,
`            lightStripMode={lightStripMode}
            extraTextEnabled={extraTextEnabled}
            extraText={normalizedExtraText}
            extraFontFamily={currentExtraFont.family}
            extraLetterHeightCm={extraLetterHeightCm}
            extraLetterSpacing={extraLetterSpacing}
            extraLetterMaterial={extraLetterMaterial}
            onQuote={handleQuoteRequest}`);
}

fs.writeFileSync(panelPath,panel,"utf8");
fs.writeFileSync(signPath,sign,"utf8");

console.log("✓ İkinci metin maliyet hesabına bağlandı.");
console.log("✓ Pleksi / Forex / yanak / LED ikinci metinden de hesaplanıyor.");
console.log("✓ FOREX/FOLYO ikinci metinde LED yok.");
console.log("✓ Normal fiyat kutuları otomatik güncellenir.");
console.log("✓ costdebug=1 ekranında ikinci metin breakdown görünür.");
console.log("Şimdi: npm.cmd run build");
