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

// 1) Cost paneli tekrar sadece costdebug=1 ile görünür yap.
// Bu sefer component içinde query kontrolü net ve basit.
if (!panel.includes(`const [showDebug, setShowDebug] = useState(false);`)) {
  const stateNeedle = `export default function CostDebugPanel(props: Props) {
  const [fontReadyTick, setFontReadyTick] = useState(0);`;

  if (!panel.includes(stateNeedle)) {
    console.error("Patch durdu: CostDebugPanel state bloğu bulunamadı.");
    process.exit(1);
  }

  panel = panel.replace(
    stateNeedle,
    `export default function CostDebugPanel(props: Props) {
  const [showDebug, setShowDebug] = useState(false);
  const [fontReadyTick, setFontReadyTick] = useState(0);`
  );
}

const effectNeedle = `  useEffect(() => {
    document.fonts?.ready.then(() => setFontReadyTick((v) => v + 1));
  }, []);`;

if (panel.includes(effectNeedle)) {
  panel = panel.replace(
    effectNeedle,
    `  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowDebug(params.get("costdebug") === "1");
    document.fonts?.ready.then(() => setFontReadyTick((v) => v + 1));
  }, []);`
  );
}

if (!panel.includes(`  if (!showDebug) return null;`)) {
  const boxNeedle = `  const box: React.CSSProperties = {`;
  if (!panel.includes(boxNeedle)) {
    console.error("Patch durdu: CostDebugPanel box bloğu bulunamadı.");
    process.exit(1);
  }
  panel = panel.replace(
    boxNeedle,
    `  if (!showDebug) return null;

  const box: React.CSSProperties = {`
  );
}

// 2) Bottom summary + WhatsApp düzenini kompakt yap.
const oldSummary = `          <div className="designer-summary">
            <div>
              <span>01</span>
              <p>FONT</p>
              <b>{currentFont.name}</b>
            </div>
            <div>
              <span>02</span>
              <p>ZEMİN</p>
              <b>{baseMaterial}</b>
            </div>
            <div>
              <span>03</span>
              <p>HARF</p>
              <b>{letterMaterial}</b>
            </div>
            <div
              className="designer-actions"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "7px",
                padding: 0,
                border: 0,
                background: "transparent",
              }}
            >
              <button
                type="button"
                className="designer-quote"
                onClick={handleQuoteRequest}
                disabled={quoteSubmitting || exportingPng}
                style={{
                  width: "100%",
                  cursor: quoteSubmitting || exportingPng ? "wait" : "pointer",
                  textAlign: "left",
                }}
              >
                <span>TASARIM GÖRSELİ + ÖZELLİKLER</span>
                <strong>
                  {quoteSubmitting || exportingPng ? "HAZIRLANIYOR" : "WHATSAPP'TAN TEKLİF AL"}
                </strong>
                <b>↗</b>
              </button>
            </div>
          </div>`;

const newSummary = `          <div className="designer-summary designer-summary-compact">
            <div className="designer-summary-card">
              <span>01</span>
              <p>FONT</p>
              <b>{currentFont.name}</b>
            </div>

            <div className="designer-summary-card">
              <span>02</span>
              <p>ZEMİN</p>
              <b>{baseMaterial}</b>
            </div>

            <div className="designer-summary-card">
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

if (!sign.includes(oldSummary)) {
  console.error("Patch durdu: mevcut designer-summary bloğu birebir bulunamadı.");
  process.exit(1);
}

sign = sign.replace(oldSummary, newSummary);

// 3) CSS
const marker = "/* REDPEN COMPACT BOTTOM BAR V45 */";
if (!css.includes(marker)) {
  css += `

${marker}
.designer-summary.designer-summary-compact {
  display: grid;
  grid-template-columns: minmax(0, .72fr) minmax(0, .72fr) minmax(0, .92fr) minmax(250px, 1.45fr);
  gap: 6px;
  align-items: stretch;
  margin-top: 8px;
}

.designer-summary-compact > .designer-summary-card {
  min-width: 0;
  min-height: 58px;
  padding: 9px 11px !important;
}

.designer-summary-compact .designer-summary-card > span {
  font-size: 8px;
  opacity: .42;
}

.designer-summary-compact .designer-summary-card > p {
  margin: 3px 0 4px;
  font-size: 8px;
  letter-spacing: .08em;
}

.designer-summary-compact .designer-summary-card > b {
  display: block;
  overflow: hidden;
  font-size: 11px;
  line-height: 1.15;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.designer-actions-inline {
  display: block !important;
  min-width: 0;
  padding: 0 !important;
  border: 0 !important;
  background: transparent !important;
}

.designer-quote.designer-quote-compact {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto 1fr;
  align-items: center;
  width: 100%;
  height: 100%;
  min-height: 58px;
  padding: 9px 13px;
  border: 0;
  background: #e21d38;
  color: #fff;
  cursor: pointer;
  text-align: left;
}

.designer-quote-compact > span {
  grid-column: 1;
  grid-row: 1;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: .12em;
  opacity: .72;
}

.designer-quote-compact > strong {
  grid-column: 1;
  grid-row: 2;
  align-self: end;
  margin-top: 4px;
  font-size: 14px;
  line-height: 1;
  letter-spacing: -.01em;
}

.designer-quote-compact > b {
  grid-column: 2;
  grid-row: 1 / span 2;
  align-self: center;
  font-size: 19px;
  font-weight: 400;
}

.designer-quote-compact:disabled {
  cursor: wait;
  opacity: .65;
}

@media (max-width: 900px) {
  .designer-summary.designer-summary-compact {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .designer-actions-inline {
    grid-column: 1 / -1;
  }

  .designer-quote.designer-quote-compact {
    min-height: 54px;
  }
}

@media (max-width: 560px) {
  .designer-summary.designer-summary-compact {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4px;
  }

  .designer-summary-compact > .designer-summary-card {
    min-height: 52px;
    padding: 7px 8px !important;
  }

  .designer-summary-compact .designer-summary-card > b {
    font-size: 9px;
  }
}
`;
}

fs.writeFileSync(signPath, sign, "utf8");
fs.writeFileSync(panelPath, panel, "utf8");
fs.writeFileSync(cssPath, css, "utf8");

console.log("✓ Müşteriden detaylı sarfiyat paneli gizlendi.");
console.log("✓ Sarfiyat paneli sadece /tasarla?costdebug=1 ile görünür.");
console.log("✓ Alt FONT / ZEMİN / HARF kutuları küçültüldü.");
console.log("✓ WhatsApp Teklif Al butonu HARF kutusunun hemen yanına alındı.");
console.log("✓ Normal ekranda WhatsApp CTA tekrar görünür ve kompakt.");
console.log("");
console.log("Şimdi: npm.cmd run build");
