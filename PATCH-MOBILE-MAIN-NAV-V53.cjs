const fs = require("fs");
const path = require("path");

const cssPath = path.join(process.cwd(), "app", "mobile.css");

if (!fs.existsSync(cssPath)) {
  console.error("app/mobile.css bulunamadı.");
  process.exit(1);
}

let css = fs.readFileSync(cssPath, "utf8");

const oldBlock = `  .topbar {
    height: 64px;
    padding: 0 14px;
    grid-template-columns: 1fr auto;
    backdrop-filter: blur(12px);
  }
  .topbar .brand { gap: 8px; font-size: 9px; letter-spacing: .13em; }
  .topbar .brand-mark { width: 27px; height: 27px; }
  .topbar nav { display: none; }
  .outline-button { min-height: 40px; padding: 11px 13px; }`;

const newBlock = `  .topbar {
    height: auto;
    min-height: 102px;
    padding: 8px 14px 9px;
    grid-template-columns: 1fr auto;
    grid-template-rows: 48px auto;
    align-items: center;
    backdrop-filter: blur(12px);
  }
  .topbar .brand {
    gap: 8px;
    font-size: 9px;
    letter-spacing: .13em;
    min-width: 0;
  }
  .topbar .brand-mark { width: 27px; height: 27px; }

  /* Mobilde masaüstü menüsünü gizlemek yerine ikinci satırda göster. */
  .topbar nav {
    display: flex !important;
    grid-column: 1 / -1;
    grid-row: 2;
    width: 100%;
    gap: 6px;
    align-items: center;
    justify-content: flex-start;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 5px 0 1px;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }
  .topbar nav::-webkit-scrollbar { display: none; }

  .topbar nav a {
    flex: 0 0 auto;
    min-height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 11px;
    border: 1px solid rgba(255,255,255,.10);
    border-radius: 999px;
    background: rgba(255,255,255,.025);
    color: rgba(255,255,255,.72);
    font-size: 7.5px;
    line-height: 1;
    letter-spacing: .10em;
    white-space: nowrap;
    text-decoration: none;
  }

  .topbar nav a:active {
    color: #fff;
    border-color: rgba(226,29,56,.5);
    background: rgba(226,29,56,.12);
  }

  .outline-button {
    min-height: 38px;
    padding: 10px 12px;
    font-size: 7.5px;
  }`;

if (!css.includes("REDPEN MOBILE MAIN NAV V53")) {
    if (!css.includes(oldBlock)) {
        console.error("Patch durdu: mobile.css içindeki mevcut topbar mobil bloğu bulunamadı.");
        process.exit(1)
    css = css.replace(oldBlock, newBlock)
    css += `

/* REDPEN MOBILE MAIN NAV V53 */
@media (max-width: 480px) {
  .topbar {
    min-height: 98px;
    padding-left: 10px;
    padding-right: 10px;
  }

  .topbar .brand > span:last-child {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .topbar nav {
    gap: 5px;
  }

  .topbar nav a {
    min-height: 32px;
    padding: 0 10px;
    font-size: 7px;
  }

  .outline-button {
    min-height: 34px;
    padding: 8px 10px;
    font-size: 7px;
  }
}
`
}

fs.writeFileSync(cssPath, css, "utf8");

console.log("✓ Ana SHOWROOM üst menüsü mobilde görünür hale getirildi.");
console.log("✓ SHOWCASE / İŞLER / STÜDYO / İLETİŞİM artık mobilde ikinci satırda.");
console.log("✓ Menü yatay kaydırılabilir, dar ekranlarda taşmaz.");
console.log("✓ KEŞFET butonu ve logo üst satırda kalır.");
console.log("✓ Tasarla sayfasındaki ayrı toolbar'a dokunulmadı.");
console.log("Şimdi: npm.cmd run build");
