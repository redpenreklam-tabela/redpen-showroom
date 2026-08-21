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

// Müşteri fiyat kutularını gizle, debug motorunu koru.
const publicStart = `  if (!showDebug) {
    const priceItems = [`;

if (panel.includes(publicStart)) {
  const endMarker = `  const box: React.CSSProperties = {`;
  const start = panel.indexOf(publicStart);
  const end = panel.indexOf(endMarker, start);
  if (end === -1) {
    console.error("Public fiyat bloğunun sonu bulunamadı.");
    process.exit(1);
  }
  panel = panel.slice(0, start) + `  if (!showDebug) return null;\n\n` + panel.slice(end);
} else if (!panel.includes(`  if (!showDebug) return null;`)) {
  console.error("Public fiyat bloğu bulunamadı.");
  process.exit(1);
}

// WhatsApp butonunu alt özete geri koy.
if (!sign.includes('className="designer-actions designer-actions-inline"')) {
  const needle = `            <div className="designer-summary-card">
              <span>03</span>
              <p>HARF</p>
              <b>{letterMaterial}</b>
            </div>

          </div>`;

  const replacement = `            <div className="designer-summary-card">
              <span>03</span>
              <p>HARF</p>
              <b>{letterMaterial}</b>
            </div>

            <div className="designer-actions designer-actions-inline">
              <button
                type="button"
                className="designer-quote designer-quote-compact"
                onClick={handleQuoteRequest}
                disabled={quoteSubmitting || exportingPng}
              >
                <span>WHATSAPP</span>
                <strong>
                  {quoteSubmitting || exportingPng ? "HAZIRLANIYOR" : "TEKLİF AL"}
                </strong>
                <b>↗</b>
              </button>
            </div>

          </div>`;

  if (!sign.includes(needle)) {
    console.error("Alt özet HARF kartı bulunamadı.");
    process.exit(1);
  }
  sign = sign.replace(needle, replacement);
}

sign = sign.replace(
  `className="designer-summary designer-summary-compact designer-summary-three"`,
  `className="designer-summary designer-summary-compact"`
);

fs.writeFileSync(panelPath, panel, "utf8");
fs.writeFileSync(signPath, sign, "utf8");

console.log("✓ Müşteri fiyat kutuları gizlendi.");
console.log("✓ Fiyat motoru ve costdebug paneli korundu.");
console.log("✓ WhatsApp Teklif Al butonu alt özet satırına geri geldi.");
console.log("✓ WhatsApp mesaj/özet sistemi değiştirilmedi.");
console.log("Şimdi: npm.cmd run build");
