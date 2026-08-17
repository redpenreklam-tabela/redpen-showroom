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

// Props
if (!panel.includes("  lightStripMode: string;")) {
  panel = panel.replace(
`  lighted: boolean;
  onQuote: () => void;`,
`  lighted: boolean;
  lightStripMode: string;
  onQuote: () => void;`
  );
}

// Helper
if (!panel.includes("function lightStripGeometry(")) {
  const helper = `
function lightStripGeometry(mode, widthCm, heightCm) {
  if (mode === "none") {
    return { active: false, areaM2: 0, sideM: 0 };
  }

  const w = Math.max(0, widthCm);
  const h = Math.max(0, heightCm);
  const b = 6;
  let areaCm2 = 0;
  let sideCm = 0;

  switch (mode) {
    case "top":
    case "bottom":
      areaCm2 = w * b;
      sideCm = 2 * (w + b);
      break;
    case "top-bottom":
      areaCm2 = 2 * w * b;
      sideCm = 4 * (w + b);
      break;
    case "left":
    case "right":
      areaCm2 = h * b;
      sideCm = 2 * (h + b);
      break;
    case "left-right":
      areaCm2 = 2 * h * b;
      sideCm = 4 * (h + b);
      break;
    case "all": {
      const innerW = Math.max(0, w - 2 * b);
      const innerH = Math.max(0, h - 2 * b);
      areaCm2 = w * h - innerW * innerH;
      sideCm = 2 * (w + h) + 2 * (innerW + innerH);
      break;
    }
    default:
      return { active: false, areaM2: 0, sideM: 0 };
  }

  return {
    active: true,
    areaM2: areaCm2 / 10000,
    sideM: sideCm / 100,
  };
}

`;
  panel = panel.replace("function bestComposite(width: number, height: number) {", helper + "function bestComposite(width: number, height: number) {");
}

// Geometry
if (!panel.includes("const stripGeom = lightStripGeometry(")) {
  panel = panel.replace(
`    const ledPerM2 =
      referenceRGeometry.areaM2 > 0
        ? CONFIG.led.referenceLedCount / referenceRGeometry.areaM2
        : 0;`,
`    const ledPerM2 =
      referenceRGeometry.areaM2 > 0
        ? CONFIG.led.referenceLedCount / referenceRGeometry.areaM2
        : 0;

    const stripGeom = lightStripGeometry(
      props.lightStripMode,
      props.width,
      props.height,
    );`
  );
}

// LED
if (!panel.includes("const stripLedCount =")) {
  panel = panel.replace(
`    const ledCount =
      usesLed && ledPerM2 > 0
        ? Math.max(1, Math.ceil(geom.areaM2 * ledPerM2))
        : 0;`,
`    const letterLedCount =
      usesLed && ledPerM2 > 0
        ? Math.max(1, Math.ceil(geom.areaM2 * ledPerM2))
        : 0;

    const stripLedCount =
      stripGeom.active && ledPerM2 > 0
        ? Math.max(1, Math.ceil(stripGeom.areaM2 * ledPerM2))
        : 0;

    const ledCount = letterLedCount + stripLedCount;`
  );
}

// Material areas + side
if (!panel.includes("const plexiAreaM2 =")) {
  panel = panel.replace(
`    const plexiSheets = usesPlexi
      ? Math.max(
          1,
          Math.ceil(
            geom.areaM2 /
              (((CONFIG.plexi.w * CONFIG.plexi.h) / 10000) *
                CONFIG.plexi.efficiency),
          ),
        )
      : 0;

    const forexSheets = usesForex
      ? Math.max(
          1,
          Math.ceil(
            geom.areaM2 /
              (((CONFIG.forex.w * CONFIG.forex.h) / 10000) *
                CONFIG.forex.efficiency),
          ),
        )
      : 0;

    const sideM = usesSide ? geom.perimeterM : 0;`,
`    const plexiAreaM2 =
      (usesPlexi ? geom.areaM2 : 0) +
      (stripGeom.active ? stripGeom.areaM2 : 0);

    const forexAreaM2 =
      (usesForex ? geom.areaM2 : 0) +
      (stripGeom.active ? stripGeom.areaM2 : 0);

    const plexiSheets =
      plexiAreaM2 > 0
        ? Math.max(
            1,
            Math.ceil(
              plexiAreaM2 /
                (((CONFIG.plexi.w * CONFIG.plexi.h) / 10000) *
                  CONFIG.plexi.efficiency),
            ),
          )
        : 0;

    const forexSheets =
      forexAreaM2 > 0
        ? Math.max(
            1,
            Math.ceil(
              forexAreaM2 /
                (((CONFIG.forex.w * CONFIG.forex.h) / 10000) *
                  CONFIG.forex.efficiency),
            ),
          )
        : 0;

    const sideM =
      (usesSide ? geom.perimeterM : 0) +
      (stripGeom.active ? stripGeom.sideM : 0);`
  );
}

// Return extra
if (!panel.includes("      stripGeom,")) {
  panel = panel.replace(
`      ledPerM2,
      ledCount,
      costs,`,
`      ledPerM2,
      letterLedCount,
      stripLedCount,
      ledCount,
      stripGeom,
      plexiAreaM2,
      forexAreaM2,
      costs,`
  );
}

// Debug card
if (!panel.includes("<small>IŞIK BANDI / 6 CM</small>")) {
  panel = panel.replace(
`        <div
          style={{
            ...box,
            borderColor: "rgba(255,181,62,.75)",
          }}
        >`,
`        {result.stripGeom.active && (
          <div style={box}>
            <small>IŞIK BANDI / 6 CM</small>
            <div style={{ fontSize: 18, fontWeight: 900, marginTop: 5 }}>
              {result.stripGeom.areaM2.toFixed(3)} m²
            </div>
            <div style={{ opacity: 0.6, fontSize: 11, marginTop: 5 }}>
              Pleksi + Forex + {result.stripGeom.sideM.toFixed(1)} m yanak · {result.stripLedCount} LED
            </div>
          </div>
        )}

        <div
          style={{
            ...box,
            borderColor: "rgba(255,181,62,.75)",
          }}
        >`
  );
}

// Sign props
if (!sign.includes("            lightStripMode={lightStripMode}")) {
  sign = sign.replace(
`            lighted={lighted}
            onQuote={handleQuoteRequest}`,
`            lighted={lighted}
            lightStripMode={lightStripMode}
            onQuote={handleQuoteRequest}`
  );
}

fs.writeFileSync(panelPath, panel, "utf8");
fs.writeFileSync(signPath, sign, "utf8");

console.log("✓ 6 cm ışık bandı maliyet reçetesi eklendi.");
console.log("✓ Pleksi + Forex + Harf yanağı + LED hesaba giriyor.");
console.log("✓ Üst / Alt / Üst+Alt / Sol / Sağ / Sol+Sağ / 4 Kenar destekleniyor.");
console.log("✓ Normal müşteride yalnızca fiyat kutuları değişir.");
console.log("✓ ?costdebug=1 içinde bandın m² / yanak / LED breakdown'u görünür.");
console.log("Şimdi: npm.cmd run build");
