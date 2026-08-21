const fs = require("fs");
const path = require("path");

const cssPath = path.join(process.cwd(), "app", "tasarla", "designer-usability.css");

if (!fs.existsSync(cssPath)) {
  console.error("designer-usability.css bulunamadı.");
  process.exit(1);
}

let css = fs.readFileSync(cssPath, "utf8");

const marker = "/* REDPEN MOBILE TOP MENU V51 */";

if (css.includes(marker)) {
  console.log("✓ Mobil üst menü V51 zaten uygulanmış.");
  process.exit(0);
}

css += `

${marker}

/*
  Desktop toolbar'a dokunmuyoruz.
  Mobil/tablet tarafında üst menüyü zorla görünür tutuyoruz.
*/
@media (max-width: 980px) {
  .designer-toolbar {
    display: grid !important;
    visibility: visible !important;
    opacity: 1 !important;
    position: sticky !important;
    top: 0;
    z-index: 1000;
    min-height: 64px !important;
    grid-template-columns: auto minmax(0, 1fr) auto !important;
    gap: 10px;
    padding: 8px 12px !important;
    border-bottom: 1px solid rgba(255,255,255,.10);
    background: rgba(5,5,7,.94) !important;
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .designer-back {
    display: flex !important;
    visibility: visible !important;
    gap: 7px !important;
    min-width: 0;
  }

  .designer-back span {
    font-size: 18px !important;
  }

  .designer-back b {
    font-size: 9px !important;
    letter-spacing: .08em !important;
  }

  .designer-title {
    display: flex !important;
    visibility: visible !important;
    justify-self: center;
    min-width: 0;
    gap: 5px !important;
    flex-direction: column;
    align-items: center !important;
    text-align: center;
  }

  .designer-title small {
    font-size: 7px !important;
    line-height: 1 !important;
    letter-spacing: .10em !important;
    white-space: nowrap;
  }

  .designer-title strong {
    max-width: 100%;
    overflow: hidden;
    font-size: 10px !important;
    line-height: 1.05 !important;
    letter-spacing: .10em !important;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .designer-mode-switch {
    display: flex !important;
    visibility: visible !important;
    justify-self: end;
    padding: 2px !important;
  }

  .designer-mode-switch button {
    min-height: 34px;
    padding: 7px 9px !important;
    font-size: 7px !important;
  }
}

@media (max-width: 560px) {
  .designer-toolbar {
    min-height: 58px !important;
    grid-template-columns: auto minmax(0, 1fr) auto !important;
    gap: 7px;
    padding: 7px 9px !important;
  }

  .designer-back {
    gap: 4px !important;
  }

  .designer-back b {
    font-size: 0 !important;
  }

  .designer-back b::after {
    content: "GERİ";
    font-size: 8px;
    letter-spacing: .08em;
  }

  .designer-title small {
    display: none !important;
  }

  .designer-title strong {
    font-size: 9px !important;
    letter-spacing: .07em !important;
  }

  .designer-mode-switch button {
    min-height: 32px;
    padding: 6px 7px !important;
    font-size: 6.5px !important;
  }
}

@media (max-width: 390px) {
  .designer-toolbar {
    gap: 5px;
    padding-left: 7px !important;
    padding-right: 7px !important;
  }

  .designer-title strong {
    font-size: 8px !important;
  }

  .designer-mode-switch button {
    padding-left: 6px !important;
    padding-right: 6px !important;
  }
}
`;

fs.writeFileSync(cssPath, css, "utf8");

console.log("✓ Üst toolbar mobil ve tablet görünümüne eklendi.");
console.log("✓ SHOWROOM/GERİ, TABELANI TASARLA ve GÜNDÜZ/GECE mobilde görünür.");
console.log("✓ Menü sticky: sayfa kayarken üstte kalır.");
console.log("✓ Desktop görünüm değiştirilmedi.");
console.log("Şimdi: npm.cmd run build");
