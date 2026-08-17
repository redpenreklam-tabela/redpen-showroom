const fs = require("fs");
const path = require("path");

const signPath = path.join(process.cwd(), "app", "tasarla", "SignDesigner.tsx");
const panelPath = path.join(process.cwd(), "app", "tasarla", "CostDebugPanel.tsx");
const cssPath = path.join(process.cwd(), "app", "tasarla", "designer-usability.css");

for (const p of [signPath, panelPath, cssPath]) {
  if (!fs.existsSync(p)) {
    console.error("Gerekli dosya bulunamadı:", p);
    process.exit(1);
  }
}

let sign = fs.readFileSync(signPath, "utf8");
let panel = fs.readFileSync(panelPath, "utf8");
let css = fs.readFileSync(cssPath, "utf8");

// -----------------------------------------------------------------------------
// CostDebugPanel props: WhatsApp aksiyonu
// -----------------------------------------------------------------------------
if (!panel.includes("  onQuote: () => void;")) {
  const propsNeedle = `  lighted: boolean;
};`;
  if (!panel.includes(propsNeedle)) {
    console.error("Patch durdu: CostDebugPanel Props sonu bulunamadı.");
    process.exit(1);
  }

  panel = panel.replace(
    propsNeedle,
    `  lighted: boolean;
  onQuote: () => void;
  quoteBusy: boolean;
};`
  );
}

// -----------------------------------------------------------------------------
// Normal görünüm: fiyat-only kompakt kartlar + WhatsApp.
// Debug URL'de eski detaylı panel aynen kalır.
// -----------------------------------------------------------------------------
const debugReturnNeedle = `  if (!showDebug) return null;

  const box: React.CSSProperties = {`;

if (panel.includes(debugReturnNeedle)) {
  panel = panel.replace(
    debugReturnNeedle,
    `  if (!showDebug) {
    const priceItems = [
      { label: "KOMPOZİT", value: result.costs.composite },
      { label: "PLEKSİ", value: result.costs.plexi },
      { label: "FOREX", value: result.costs.forex },
      { label: "HARF YANAĞI", value: result.costs.side },
      { label: "PROFİL", value: result.costs.profile },
      { label: "LED", value: result.costs.led },
    ].filter((item) => item.value > 0);

    return (
      <div className="designer-customer-price-strip">
        <div className="designer-customer-price-grid">
          {priceItems.map((item) => (
            <div className="designer-customer-price-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{tl(item.value)}</strong>
            </div>
          ))}

          <div className="designer-customer-price-card is-total">
            <span>MALZEME TOPLAMI</span>
            <strong>{tl(result.total)}</strong>
          </div>

          <button
            type="button"
            className="designer-price-whatsapp"
            onClick={props.onQuote}
            disabled={props.quoteBusy}
          >
            <span>WHATSAPP</span>
            <strong>{props.quoteBusy ? "HAZIRLANIYOR" : "TEKLİF AL"}</strong>
            <b>↗</b>
          </button>
        </div>

        <p className="designer-customer-price-note">
          Tahmini malzeme bedelidir. Nihai teklif; üretim, montaj, uygulama ve saha koşullarına göre netleşir.
        </p>
      </div>
    );
  }

  const box: React.CSSProperties = {`
  );
} else if (!panel.includes("designer-customer-price-strip")) {
  console.error("Patch durdu: CostDebugPanel normal görünüm noktası bulunamadı.");
  process.exit(1);
}

// -----------------------------------------------------------------------------
// SignDesigner: CostDebugPanel'e WhatsApp props gönder.
// -----------------------------------------------------------------------------
const costPropsNeedle = `            baseMaterial={baseMaterial}
            lighted={lighted}
          />`;

if (!sign.includes("            onQuote={handleQuoteRequest}")) {
  if (!sign.includes(costPropsNeedle)) {
    console.error("Patch durdu: CostDebugPanel prop bloğu bulunamadı.");
    process.exit(1);
  }

  sign = sign.replace(
    costPropsNeedle,
    `            baseMaterial={baseMaterial}
            lighted={lighted}
            onQuote={handleQuoteRequest}
            quoteBusy={quoteSubmitting || exportingPng}
          />`
  );
}

// -----------------------------------------------------------------------------
// Alt özet satırındaki eski WhatsApp kartını kaldır.
// Fiyat satırında zaten WhatsApp var.
// -----------------------------------------------------------------------------
const oldActions = `
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
            </div>`;

if (sign.includes(oldActions)) {
  sign = sign.replace(oldActions, "");
}

// Summary 3 karta otursun.
sign = sign.replace(
  `          <div className="designer-summary designer-summary-compact">`,
  `          <div className="designer-summary designer-summary-compact designer-summary-three">`
);

// -----------------------------------------------------------------------------
// CSS
// -----------------------------------------------------------------------------
const marker = "/* REDPEN PRICE BOXES + WHATSAPP V46 */";
if (!css.includes(marker)) {
  css += `

${marker}

.designer-customer-price-strip {
  margin-top: 8px;
}

.designer-customer-price-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(92px, 1fr)) minmax(128px, 1.15fr) minmax(190px, 1.55fr);
  gap: 5px;
  align-items: stretch;
}

.designer-customer-price-card {
  display: flex;
  min-width: 0;
  min-height: 52px;
  flex-direction: column;
  justify-content: center;
  padding: 8px 9px;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.035);
}

.designer-customer-price-card > span {
  overflow: hidden;
  color: rgba(255,255,255,.48);
  font-size: 7px;
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: .08em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.designer-customer-price-card > strong {
  display: block;
  margin-top: 5px;
  overflow: hidden;
  color: rgba(255,255,255,.94);
  font-size: 11px;
  font-weight: 850;
  line-height: 1.05;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.designer-customer-price-card.is-total {
  border-color: rgba(255,181,62,.34);
  background: rgba(255,181,62,.055);
}

.designer-customer-price-card.is-total > span {
  color: rgba(255,181,62,.72);
}

.designer-customer-price-card.is-total > strong {
  color: #ffb53e;
  font-size: 13px;
}

.designer-price-whatsapp {
  display: grid;
  min-width: 0;
  min-height: 52px;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto 1fr;
  align-items: center;
  padding: 8px 12px;
  border: 0;
  background: #e21d38;
  color: #fff;
  cursor: pointer;
  text-align: left;
}

.designer-price-whatsapp > span {
  grid-column: 1;
  grid-row: 1;
  font-size: 7px;
  font-weight: 900;
  letter-spacing: .13em;
  opacity: .74;
}

.designer-price-whatsapp > strong {
  grid-column: 1;
  grid-row: 2;
  align-self: end;
  margin-top: 4px;
  font-size: 14px;
  line-height: 1;
}

.designer-price-whatsapp > b {
  grid-column: 2;
  grid-row: 1 / span 2;
  align-self: center;
  font-size: 18px;
  font-weight: 400;
}

.designer-price-whatsapp:disabled {
  cursor: wait;
  opacity: .62;
}

.designer-customer-price-note {
  margin: 5px 1px 0;
  color: rgba(255,255,255,.33);
  font-size: 8px;
  line-height: 1.35;
}

.designer-summary.designer-summary-three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  max-width: 460px;
}

@media (max-width: 1280px) {
  .designer-customer-price-grid {
    grid-template-columns: repeat(4, minmax(95px, 1fr));
  }

  .designer-price-whatsapp {
    grid-column: span 2;
  }
}

@media (max-width: 760px) {
  .designer-customer-price-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .designer-customer-price-card {
    min-height: 48px;
  }

  .designer-price-whatsapp {
    grid-column: 1 / -1;
    min-height: 54px;
  }

  .designer-summary.designer-summary-three {
    max-width: none;
  }
}
`;
}

fs.writeFileSync(signPath, sign, "utf8");
fs.writeFileSync(panelPath, panel, "utf8");
fs.writeFileSync(cssPath, css, "utf8");

console.log("✓ Normal müşteride fiyat kutuları geri geldi.");
console.log("✓ Plaka / m² / metre / LED adedi gibi sarfiyat ölçüleri gizli.");
console.log("✓ Kutularda yalnızca kategori + TL fiyatı gösteriliyor.");
console.log("✓ WhatsApp Teklif Al fiyat kutularının yanında.");
console.log("✓ ?costdebug=1 açılırsa eski detaylı sarfiyat paneli aynen görünür.");
console.log("✓ Alt FONT / ZEMİN / HARF kartları korunuyor ve ayrı kompakt satırda.");
console.log("");
console.log("Şimdi: npm.cmd run build");
