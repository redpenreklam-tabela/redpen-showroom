const fs = require("fs");
const path = require("path");

const signPath = path.join(process.cwd(), "app", "tasarla", "SignDesigner.tsx");
const cssPath = path.join(process.cwd(), "app", "tasarla", "designer-usability.css");

if (!fs.existsSync(signPath) || !fs.existsSync(cssPath)) {
  console.error("SignDesigner.tsx veya designer-usability.css bulunamadı.");
  process.exit(1);
}

let sign = fs.readFileSync(signPath, "utf8");
let css = fs.readFileSync(cssPath, "utf8");

const marker = "REDPEN MOBILE TOOLBAR HARD FIX V52";

// Ayrı bir mobil toolbar ekle.
// Desktop toolbar'a bağlı kalmıyoruz; mobilde kendi bağımsız menümüz var.
if (!sign.includes("designer-mobile-toolbar")) {
  const needle = `      </header>

      <div className="designer-layout">`;

  const mobileToolbar = `      </header>

      <div className="designer-mobile-toolbar" aria-label="Mobil üst menü">
        <a href="/" className="designer-mobile-back">
          <span>←</span>
          <b>SHOWROOM</b>
        </a>

        <div className="designer-mobile-title">
          <strong>TABELANI TASARLA</strong>
        </div>

        <div className="designer-mobile-mode-switch">
          <button
            type="button"
            className={scene === "day" ? "is-active" : ""}
            onClick={() => setScene("day")}
          >
            GÜNDÜZ
          </button>
          <button
            type="button"
            className={scene === "night" ? "is-active" : ""}
            onClick={() => setScene("night")}
          >
            GECE
          </button>
        </div>
      </div>

      <div className="designer-layout">`;

  if (!sign.includes(needle)) {
    console.error("Patch durdu: header sonrası designer-layout bulunamadı.");
    process.exit(1);
  }

  sign = sign.replace(needle, mobileToolbar);
}

if (!css.includes(marker)) {
  css += `

/* ${marker} */

/* Desktop'ta bağımsız mobil menü tamamen kapalı. */
.designer-mobile-toolbar {
  display: none;
}

@media (max-width: 980px) {
  /*
    Eski toolbar CSS'leri ne yaparsa yapsın bu yeni bar bağımsızdır.
    Normal document flow'da, designer-layout'ın hemen üstünde render edilir.
  */
  .designer-mobile-toolbar {
    position: relative !important;
    z-index: 9999 !important;
    width: 100% !important;
    min-height: 62px !important;
    display: grid !important;
    grid-template-columns: auto minmax(0, 1fr) auto !important;
    align-items: center !important;
    gap: 9px !important;
    padding: 8px 12px !important;
    border-bottom: 1px solid rgba(255,255,255,.11) !important;
    background: #09090b !important;
    color: #fff !important;
    visibility: visible !important;
    opacity: 1 !important;
    overflow: visible !important;
  }

  /* Mobilde eski desktop toolbar'ı çift görünmemesi için gizle. */
  .designer-toolbar {
    display: none !important;
  }

  .designer-mobile-back {
    display: flex !important;
    align-items: center !important;
    gap: 7px !important;
    min-width: 0;
    color: rgba(255,255,255,.82) !important;
    text-decoration: none !important;
    font-family: var(--font-geist-mono), monospace;
  }

  .designer-mobile-back span {
    color: rgb(var(--rp-red)) !important;
    font-size: 20px !important;
    line-height: 1 !important;
  }

  .designer-mobile-back b {
    font-size: 8px !important;
    line-height: 1 !important;
    letter-spacing: .09em !important;
    white-space: nowrap;
  }

  .designer-mobile-title {
    display: block !important;
    min-width: 0;
    text-align: center;
  }

  .designer-mobile-title strong {
    display: block !important;
    overflow: hidden;
    color: #fff !important;
    font-family: var(--font-geist-mono), monospace;
    font-size: 10px !important;
    line-height: 1.05 !important;
    letter-spacing: .09em !important;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .designer-mobile-mode-switch {
    display: flex !important;
    align-items: center !important;
    padding: 2px !important;
    border: 1px solid rgba(255,255,255,.13) !important;
    border-radius: 999px !important;
  }

  .designer-mobile-mode-switch button {
    min-height: 34px !important;
    padding: 7px 9px !important;
    border: 0 !important;
    border-radius: 999px !important;
    background: transparent !important;
    color: rgba(255,255,255,.46) !important;
    font-family: var(--font-geist-mono), monospace;
    font-size: 7px !important;
    font-weight: 800 !important;
    line-height: 1 !important;
    cursor: pointer;
  }

  .designer-mobile-mode-switch button.is-active {
    background: rgba(var(--rp-red),.22) !important;
    color: #fff !important;
  }

  /*
    .designer-screen desktop'ta grid-template-rows:auto 1fr.
    Mobil menü artık ikinci çocuk olduğu için layout satırlarını açıkça tanımla.
  */
  .designer-screen {
    grid-template-rows: auto 1fr !important;
  }
}

@media (max-width: 560px) {
  .designer-mobile-toolbar {
    min-height: 58px !important;
    gap: 6px !important;
    padding: 7px 9px !important;
  }

  .designer-mobile-back b {
    font-size: 0 !important;
  }

  .designer-mobile-back b::after {
    content: "GERİ";
    font-size: 8px !important;
    letter-spacing: .08em !important;
  }

  .designer-mobile-title strong {
    font-size: 9px !important;
    letter-spacing: .055em !important;
  }

  .designer-mobile-mode-switch button {
    min-height: 32px !important;
    padding: 6px 7px !important;
    font-size: 6.5px !important;
  }
}

@media (max-width: 380px) {
  .designer-mobile-toolbar {
    padding-left: 7px !important;
    padding-right: 7px !important;
  }

  .designer-mobile-title strong {
    font-size: 8px !important;
  }

  .designer-mobile-mode-switch button {
    padding-left: 5px !important;
    padding-right: 5px !important;
  }
}
`;
}

fs.writeFileSync(signPath, sign, "utf8");
fs.writeFileSync(cssPath, css, "utf8");

console.log("✓ Mobil için bağımsız üst menü eklendi.");
console.log("✓ Desktop toolbar'a bağlı değil, bu yüzden mobilde artık kaybolmamalı.");
console.log("✓ Mobilde: SHOWROOM/GERİ + TABELANI TASARLA + GÜNDÜZ/GECE.");
console.log("✓ Desktop'ta yeni mobil toolbar görünmez.");
console.log("Şimdi: npm.cmd run build");
