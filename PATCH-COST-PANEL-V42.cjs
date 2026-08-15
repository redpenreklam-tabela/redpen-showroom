const fs = require("fs");
const path = require("path");

const panelPath = path.join(process.cwd(), "app", "tasarla", "CostDebugPanel.tsx");
const signPath = path.join(process.cwd(), "app", "tasarla", "SignDesigner.tsx");

if (!fs.existsSync(panelPath)) {
  console.error("CostDebugPanel.tsx bulunamadı. Önce V40'ın projede olduğundan emin ol.");
  process.exit(1);
}

if (!fs.existsSync(signPath)) {
  console.error("SignDesigner.tsx bulunamadı.");
  process.exit(1);
}

let panel = fs.readFileSync(panelPath, "utf8");
const sign = fs.readFileSync(signPath, "utf8");

if (!sign.includes('import CostDebugPanel from "./CostDebugPanel";')) {
  console.error("Patch durdu: SignDesigner CostDebugPanel import etmiyor.");
  process.exit(1);
}

if (!sign.includes("<CostDebugPanel")) {
  console.error("Patch durdu: CostDebugPanel SignDesigner içinde render edilmiyor.");
  process.exit(1);
}

// Query paramına bağlı görünürlük mantığını kaldır.
const oldState = `  const [visible, setVisible] = useState(false);
  const [fontReadyTick, setFontReadyTick] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setVisible(params.get("costdebug") === "1");

    document.fonts?.ready.then(() => setFontReadyTick((v) => v + 1));
  }, []);`;

const newState = `  const [fontReadyTick, setFontReadyTick] = useState(0);

  useEffect(() => {
    document.fonts?.ready.then(() => setFontReadyTick((v) => v + 1));
  }, []);`;

if (!panel.includes(oldState)) {
  console.error("Patch durdu: V40 query görünürlük bloğu bulunamadı.");
  process.exit(1);
}

panel = panel.replace(oldState, newState);

const hideLine = `  if (!visible) return null;

`;
if (!panel.includes(hideLine)) {
  console.error("Patch durdu: visible return null satırı bulunamadı.");
  process.exit(1);
}
panel = panel.replace(hideLine, "");

// Başlığı da artık query parametresi gerektirmediğini gösterecek şekilde değiştir.
panel = panel.replace(
  `            COSTDEBUG=1 / V40`,
  `            MATERIAL ENGINE / V42`
);

panel = panel.replace(
  `          <strong style={{ fontSize: 16 }}>SARFİYAT + MALİYET TEST PANELİ</strong>`,
  `          <strong style={{ fontSize: 16 }}>SARFİYAT + MALİYET TEST PANELİ</strong>`
);

// Artık useState/useEffect kullanımı devam ediyor; importlar korunuyor.
fs.writeFileSync(panelPath, panel, "utf8");

console.log("✓ CostDebugPanel artık normal /tasarla ekranında HER ZAMAN görünür.");
console.log("✓ ?costdebug=1 zorunluluğu kaldırıldı.");
console.log("✓ Mevcut hesap motoru ve fiyatlar değiştirilmedi.");
console.log("✓ GitHub ana koddaki V40 component/render yapısıyla uyumludur.");
console.log("");
console.log("Şimdi: npm.cmd run build");
