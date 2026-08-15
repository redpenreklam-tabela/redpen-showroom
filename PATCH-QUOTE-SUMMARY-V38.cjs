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

// 1) Modal state
replaceOnce(
`  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const QUOTE_LIMIT_KEY = "redpen-showroom-quote-usage-v1";`,
`  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteSummaryOpen, setQuoteSummaryOpen] = useState(false);
  const [quoteRemaining, setQuoteRemaining] = useState(3);
  const QUOTE_LIMIT_KEY = "redpen-showroom-quote-usage-v1";`,
"quote modal state"
);

// 2) Modal open + ESC/body lock helper; getQuoteUsage sonrasına ekle
replaceOnce(
`  const openTextOnlyWhatsApp = (extraLine?: string) => {`,
`  const openQuoteSummary = () => {
    const usage = getQuoteUsage();
    setQuoteRemaining(Math.max(0, MAX_DAILY_IMAGE_QUOTES - usage.count));
    setQuoteSummaryOpen(true);
  };

  useEffect(() => {
    if (!quoteSummaryOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !quoteSubmitting && !exportingPng) {
        setQuoteSummaryOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [quoteSummaryOpen, quoteSubmitting, exportingPng]);

  const openTextOnlyWhatsApp = (extraLine?: string) => {`,
"quote modal helpers"
);

// 3) Alt CTA artık doğrudan upload yapmasın, önce özet açsın
replaceOnce(
`                onClick={handleQuoteRequest}`,
`                onClick={openQuoteSummary}`,
"quote button onclick"
);

// 4) Main kapanışından hemen önce modalı ekle
replaceOnce(
`        </section>
      </div>
    </main>
  );
}`,
`        </section>
      </div>

      {quoteSummaryOpen && (
        <div
          className="quote-summary-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !quoteSubmitting &&
              !exportingPng
            ) {
              setQuoteSummaryOpen(false);
            }
          }}
        >
          <section
            className="quote-summary-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quote-summary-title"
          >
            <div className="quote-summary-accent" />

            <header className="quote-summary-header">
              <div>
                <span className="quote-summary-kicker">REDPEN SHOWROOM</span>
                <h2 id="quote-summary-title">TEKLİF ÖZETİ</h2>
                <p>Göndermeden önce üretim bilgilerini son kez kontrol edin.</p>
              </div>

              <button
                type="button"
                className="quote-summary-close"
                aria-label="Teklif özetini kapat"
                disabled={quoteSubmitting || exportingPng}
                onClick={() => setQuoteSummaryOpen(false)}
              >
                ×
              </button>
            </header>

            <div className="quote-summary-highlight">
              <div>
                <span>TABELA ÖLÇÜSÜ</span>
                <strong>{width} × {height} <small>cm</small></strong>
              </div>
              <i />
              <div>
                <span>ANA YAZI</span>
                <strong>{normalizedText}</strong>
              </div>
              <i />
              <div>
                <span>HARF YÜKSEKLİĞİ</span>
                <strong>{letterHeightCm.toFixed(1).replace(".0", "")} <small>cm</small></strong>
              </div>
            </div>

            <div className="quote-summary-grid">
              <article className="quote-summary-card">
                <span className="quote-summary-card-no">01</span>
                <div>
                  <small>HARF</small>
                  <strong>{letterMaterial}</strong>
                  <p>{currentFont.name} · {
                    letterColors.find((item) => item.value.toLowerCase() === letterColor.toLowerCase())?.name ?? letterColor
                  }</p>
                </div>
              </article>

              <article className="quote-summary-card">
                <span className="quote-summary-card-no">02</span>
                <div>
                  <small>ZEMİN</small>
                  <strong>{baseMaterial}</strong>
                  <p>{
                    baseColors.find((item) => item.value.toLowerCase() === baseColor.toLowerCase())?.name ?? baseColor
                  }</p>
                </div>
              </article>

              <article className="quote-summary-card">
                <span className="quote-summary-card-no">03</span>
                <div>
                  <small>AYDINLATMA</small>
                  <strong>
                    {lightingMode === "backlit"
                      ? "ARKADAN IŞIKLI"
                      : lightingMode === "dual"
                        ? "ÖNDEN + ARKADAN"
                        : lightingMode === "frontlit"
                          ? "ÖNDEN IŞIKLI"
                          : "IŞIKSIZ"}
                  </strong>
                  <p>
                    {lightStripModes.find((item) => item.id === lightStripMode)?.label ?? "Işık bandı yok"}
                  </p>
                </div>
              </article>

              <article className="quote-summary-card">
                <span className="quote-summary-card-no">04</span>
                <div>
                  <small>LOGO</small>
                  <strong>{logo ? "LOGO VAR" : "LOGO YOK"}</strong>
                  <p>{logo ? `${logoHeightCm.toFixed(1).replace(".0", "")} cm yükseklik` : "Logo eklenmedi"}</p>
                </div>
              </article>

              {extraTextEnabled && (
                <article className="quote-summary-card quote-summary-card-wide">
                  <span className="quote-summary-card-no">05</span>
                  <div>
                    <small>EK METİN</small>
                    <strong>{normalizedExtraText}</strong>
                    <p>
                      {currentExtraFont.name} · {extraLetterMaterial} · {extraLetterHeightCm.toFixed(1).replace(".0", "")} cm
                    </p>
                  </div>
                </article>
              )}

              {lightStripMode !== "none" && (
                <article className="quote-summary-card quote-summary-card-wide">
                  <span className="quote-summary-card-no">{extraTextEnabled ? "06" : "05"}</span>
                  <div>
                    <small>6 CM IŞIK BANDI</small>
                    <strong>{lightStripModes.find((item) => item.id === lightStripMode)?.label}</strong>
                    <p>
                      {lightStripMaterial}
                      {lightStripMaterial !== "FOREX"
                        ? ` · ${lightStripColors.find((item) => item.value.toLowerCase() === lightStripColor.toLowerCase())?.name ?? lightStripColor}`
                        : ""}
                    </p>
                  </div>
                </article>
              )}
            </div>

            <div className={`quote-summary-status ${quoteRemaining === 0 ? "is-limit" : ""}`}>
              <span className="quote-summary-status-dot" />
              <div>
                <strong>
                  {quoteRemaining > 0
                    ? `${quoteRemaining} GÖRSELLİ TEKLİF HAKKI KALDI`
                    : "GÖRSELLİ TEKLİF LİMİTİ DOLDU"}
                </strong>
                <p>
                  {quoteRemaining > 0
                    ? "Tasarım görseli Redpen watermark ile hazırlanıp teknik bilgilerle birlikte WhatsApp mesajına eklenecek."
                    : "Yeni görsel yüklenmeyecek. Teknik bilgiler WhatsApp üzerinden gönderilecek."}
                </p>
              </div>
            </div>

            <footer className="quote-summary-actions">
              <button
                type="button"
                className="quote-summary-back"
                disabled={quoteSubmitting || exportingPng}
                onClick={() => setQuoteSummaryOpen(false)}
              >
                ← TASARIMA DÖN
              </button>

              <button
                type="button"
                className="quote-summary-send"
                disabled={quoteSubmitting || exportingPng}
                onClick={() => {
                  setQuoteSummaryOpen(false);
                  void handleQuoteRequest();
                }}
              >
                <span>
                  {quoteSubmitting || exportingPng
                    ? "HAZIRLANIYOR"
                    : quoteRemaining > 0
                      ? "WHATSAPP'TAN GÖNDER"
                      : "WHATSAPP'TAN DEVAM ET"}
                </span>
                <b>↗</b>
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}`,
"quote modal JSX"
);

// 5) CSS
const marker = "/* REDPEN QUOTE SUMMARY MODAL V38 */";
if (!css.includes(marker)) {
  css += `

${marker}
.quote-summary-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  padding: 28px;
  background:
    radial-gradient(circle at 50% 30%, rgba(226, 29, 56, .09), transparent 38%),
    rgba(4, 5, 7, .82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.quote-summary-modal {
  position: relative;
  width: min(860px, 100%);
  max-height: min(88vh, 900px);
  overflow: auto;
  border: 1px solid rgba(255,255,255,.12);
  background:
    linear-gradient(155deg, rgba(24,25,29,.98), rgba(11,12,15,.99) 62%),
    #0c0d10;
  color: #fff;
  box-shadow: 0 32px 100px rgba(0,0,0,.58);
}

.quote-summary-accent {
  height: 3px;
  background: linear-gradient(90deg, #e21d38 0 34%, rgba(226,29,56,.18) 34% 100%);
}

.quote-summary-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 28px;
  padding: 30px 32px 24px;
  border-bottom: 1px solid rgba(255,255,255,.08);
}

.quote-summary-kicker {
  display: block;
  margin-bottom: 8px;
  color: #e21d38;
  font: 800 10px/1 var(--font-geist-mono);
  letter-spacing: .18em;
}

.quote-summary-header h2 {
  margin: 0;
  font-size: clamp(28px, 4vw, 48px);
  line-height: .92;
  letter-spacing: -.045em;
}

.quote-summary-header p {
  margin: 11px 0 0;
  color: rgba(255,255,255,.55);
  font-size: 13px;
}

.quote-summary-close {
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  border: 1px solid rgba(255,255,255,.13);
  background: rgba(255,255,255,.035);
  color: rgba(255,255,255,.72);
  font: 300 26px/1 Arial, sans-serif;
  cursor: pointer;
}

.quote-summary-close:hover {
  border-color: rgba(226,29,56,.7);
  color: #fff;
}

.quote-summary-highlight {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  align-items: center;
  gap: 22px;
  margin: 24px 32px;
  padding: 20px 22px;
  border: 1px solid rgba(226,29,56,.22);
  background: linear-gradient(90deg, rgba(226,29,56,.08), rgba(255,255,255,.025));
}

.quote-summary-highlight > div {
  min-width: 0;
}

.quote-summary-highlight > i {
  width: 1px;
  height: 32px;
  background: rgba(255,255,255,.11);
}

.quote-summary-highlight span,
.quote-summary-card small {
  display: block;
  margin-bottom: 7px;
  color: rgba(255,255,255,.42);
  font: 700 9px/1 var(--font-geist-mono);
  letter-spacing: .13em;
}

.quote-summary-highlight strong {
  display: block;
  overflow: hidden;
  color: #fff;
  font-size: clamp(16px, 2vw, 22px);
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quote-summary-highlight small {
  color: rgba(255,255,255,.45);
  font-size: .58em;
}

.quote-summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 0 32px;
}

.quote-summary-card {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 94px;
  padding: 18px 20px 18px 66px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.025);
}

.quote-summary-card-wide {
  grid-column: 1 / -1;
}

.quote-summary-card-no {
  position: absolute;
  left: 19px;
  top: 18px;
  color: rgba(226,29,56,.78);
  font: 800 11px/1 var(--font-geist-mono);
}

.quote-summary-card strong {
  display: block;
  margin-bottom: 6px;
  color: #fff;
  font-size: 14px;
  letter-spacing: .025em;
}

.quote-summary-card p {
  margin: 0;
  color: rgba(255,255,255,.46);
  font-size: 11px;
}

.quote-summary-status {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 20px 32px 0;
  padding: 14px 16px;
  border: 1px solid rgba(94, 214, 136, .18);
  background: rgba(94, 214, 136, .045);
}

.quote-summary-status.is-limit {
  border-color: rgba(255, 181, 62, .2);
  background: rgba(255, 181, 62, .045);
}

.quote-summary-status-dot {
  flex: 0 0 auto;
  width: 7px;
  height: 7px;
  margin-top: 4px;
  border-radius: 50%;
  background: #5ed688;
  box-shadow: 0 0 15px rgba(94,214,136,.55);
}

.quote-summary-status.is-limit .quote-summary-status-dot {
  background: #ffb53e;
  box-shadow: 0 0 15px rgba(255,181,62,.45);
}

.quote-summary-status strong {
  display: block;
  margin-bottom: 4px;
  font: 800 10px/1.2 var(--font-geist-mono);
  letter-spacing: .08em;
}

.quote-summary-status p {
  margin: 0;
  color: rgba(255,255,255,.47);
  font-size: 11px;
  line-height: 1.45;
}

.quote-summary-actions {
  display: grid;
  grid-template-columns: .72fr 1.28fr;
  gap: 8px;
  padding: 20px 32px 32px;
}

.quote-summary-actions button {
  min-height: 58px;
  border: 0;
  cursor: pointer;
}

.quote-summary-actions button:disabled {
  opacity: .6;
  cursor: wait;
}

.quote-summary-back {
  border: 1px solid rgba(255,255,255,.1) !important;
  background: rgba(255,255,255,.035);
  color: rgba(255,255,255,.66);
  font: 800 10px/1 var(--font-geist-mono);
  letter-spacing: .08em;
}

.quote-summary-back:hover {
  background: rgba(255,255,255,.06);
  color: #fff;
}

.quote-summary-send {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 0 22px;
  background: #e21d38;
  color: #fff;
  text-align: left;
}

.quote-summary-send span {
  font-size: 14px;
  font-weight: 900;
  letter-spacing: -.01em;
}

.quote-summary-send b {
  font-size: 20px;
  font-weight: 400;
}

.quote-summary-send:hover {
  filter: brightness(1.08);
}

@media (max-width: 720px) {
  .quote-summary-backdrop {
    align-items: end;
    padding: 10px;
  }

  .quote-summary-modal {
    width: 100%;
    max-height: 92vh;
  }

  .quote-summary-header {
    padding: 23px 20px 18px;
  }

  .quote-summary-highlight {
    grid-template-columns: 1fr;
    gap: 14px;
    margin: 16px 20px;
    padding: 16px;
  }

  .quote-summary-highlight > i {
    width: 100%;
    height: 1px;
  }

  .quote-summary-grid {
    grid-template-columns: 1fr;
    padding: 0 20px;
  }

  .quote-summary-card-wide {
    grid-column: auto;
  }

  .quote-summary-status {
    margin: 16px 20px 0;
  }

  .quote-summary-actions {
    grid-template-columns: 1fr;
    padding: 16px 20px 20px;
  }

  .quote-summary-send {
    order: -1;
  }
}
`;
}

fs.writeFileSync(signPath, src, "utf8");
fs.writeFileSync(cssPath, css, "utf8");

console.log("✓ Teklif Al artık önce profesyonel teklif özeti açıyor.");
console.log("✓ Ölçü, harf, zemin, ışık, logo, ek metin ve ışık bandı özetleniyor.");
console.log("✓ Kalan görselli teklif hakkı modalda gösteriliyor.");
console.log("✓ Modal onayından sonra mevcut Blob + WhatsApp akışı çalışıyor.");
console.log("✓ ESC, dış alana tıklama ve TASARIMA DÖN ile kapanıyor.");
console.log("");
console.log("Şimdi: npm.cmd run build");
