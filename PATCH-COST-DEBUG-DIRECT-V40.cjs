const fs = require("fs");
const path = require("path");

const signPath = path.join(process.cwd(), "app", "tasarla", "SignDesigner.tsx");

if (!fs.existsSync(signPath)) {
  console.error("SignDesigner.tsx bulunamadı. Scripti proje kökünde çalıştır.");
  process.exit(1);
}

let src = fs.readFileSync(signPath, "utf8");

// import
if (!src.includes('import CostDebugPanel from "./CostDebugPanel";')) {
  const importNeedle = 'import { useEffect, useMemo, useRef, useState } from "react";';
  if (!src.includes(importNeedle)) {
    console.error("Patch durdu: React import satırı bulunamadı.");
    process.exit(1);
  }
  src = src.replace(
    importNeedle,
    `${importNeedle}\nimport CostDebugPanel from "./CostDebugPanel";`
  );
}

// render
if (!src.includes("<CostDebugPanel")) {
  const needle = `          <div className="designer-summary">`;
  if (!src.includes(needle)) {
    console.error("Patch durdu: designer-summary bloğu bulunamadı.");
    process.exit(1);
  }

  const panel = `          <CostDebugPanel
            width={width}
            height={height}
            text={normalizedText}
            fontFamily={currentFont.family}
            letterHeightCm={letterHeightCm}
            letterSpacing={letterSpacing}
            letterMaterial={letterMaterial}
            baseMaterial={baseMaterial}
          />

`;

  src = src.replace(needle, panel + needle);
}

fs.writeFileSync(signPath, src, "utf8");

console.log("✓ CostDebugPanel doğrudan SignDesigner'a bağlandı.");
console.log("✓ Normal /tasarla sayfasında görünmez.");
console.log("✓ /tasarla?costdebug=1 açıldığında sarı panel görünür.");
console.log("Şimdi: npm.cmd run build");
