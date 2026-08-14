const fs = require("fs");
const path = require("path");

const projectRoot = process.cwd();
const signPath = path.join(projectRoot, "app", "tasarla", "SignDesigner.tsx");
const cssPath = path.join(projectRoot, "app", "tasarla", "designer-usability.css");

if (!fs.existsSync(signPath)) {
  console.error("SignDesigner.tsx bulunamadı. Scripti D:\\Projects\\redpen-showroom içinde çalıştır.");
  process.exit(1);
}

let src = fs.readFileSync(signPath, "utf8");

const mustReplace = (before, after, label) => {
  if (!src.includes(before)) {
    console.error(`Patch durdu: ${label} bulunamadı.`);
    process.exit(1);
  }
  src = src.replace(before, after);
};

// 1) State'leri yüzde yerine santimetreye çevir.
mustReplace(
`  const [extraFontSizePercent, setExtraFontSizePercent] = useState(24);`,
`  const [extraLetterHeightCm, setExtraLetterHeightCm] = useState(20);`,
"extra text size state"
);

mustReplace(
`  const [fontSizePercent, setFontSizePercent] = useState(62);`,
`  const [letterHeightCm, setLetterHeightCm] = useState(50);`,
"main text size state"
);

mustReplace(
`  const [logoSizePercent, setLogoSizePercent] = useState(52);`,
`  const [logoHeightCm, setLogoHeightCm] = useState(42);`,
"logo size state"
);

// 2) Board CSS oranları artık doğrudan cm / tabela yüksekliği.
mustReplace(
`      "--font-size-ratio": \`\${fontSizePercent / 100}\`,`,
`      "--font-size-ratio": \`\${letterHeightCm / Math.max(1, height)}\`,`,
"main font CSS ratio"
);

mustReplace(
`      "--logo-size-ratio": \`\${logoSizePercent / 100}\`,`,
`      "--logo-size-ratio": \`\${logoHeightCm / Math.max(1, height)}\`,`,
"logo CSS ratio"
);

// Board useMemo dependency list.
src = src.replace(/\n    fontSizePercent,\n/g, "\n    letterHeightCm,\n");
src = src.replace(/\n    logoSizePercent,\n/g, "\n    logoHeightCm,\n");

// 3) WhatsApp hesabı artık yaklaşık yüzde hesabı yapmasın, seçilen cm değerini kullansın.
src = src.replace(
`    const letterHeightCm = Math.max(0, height * (fontSizePercent / 100));
    const logoHeightCm = Math.max(0, height * (logoSizePercent / 100));
    const extraTextHeightCm = Math.max(0, height * (extraFontSizePercent / 100));`,
`    const extraTextHeightCm = Math.max(0, extraLetterHeightCm);`
);

src = src.replace(/fontSizePercent,/g, "letterHeightCm,");
src = src.replace(/logoSizePercent,/g, "logoHeightCm,");
src = src.replace(/extraFontSizePercent,/g, "extraLetterHeightCm,");

// 4) Resize/clamp effect dependency satırları.
src = src.replace(/\[fontSizePercent, letterSpacing, extraFontSizePercent, extraLetterSpacing, logoSizePercent,/g,
  "[letterHeightCm, letterSpacing, extraLetterHeightCm, extraLetterSpacing, logoHeightCm,");

// 5) Ek metin inline font-size.
mustReplace(
`                      fontSize: \`calc(var(--board-px-height) * \${extraFontSizePercent / 100})\`,`,
`                      fontSize: \`calc(var(--board-px-height) * \${extraLetterHeightCm / Math.max(1, height)})\`,`,
"extra text inline font size"
);

// 6) Ana harf UI.
const oldMainUi = `          <div className="designer-field">
            <div className="designer-slider-heading">
              <label>HARF BOYUTU</label>
              <b>%{fontSizePercent}</b>
            </div>
            <input
              className="designer-range"
              type="range"
              min="8"
              max="180"
              step="1"
              value={fontSizePercent}
              onChange={(e) => setFontSizePercent(Number(e.target.value))}
            />
            <div className="designer-range-scale">
              <span>KÜÇÜK</span>
              <span>TAŞIR</span>
            </div>
            <p className="designer-control-note">Boyutu istediğin kadar büyütebilirsin; sistem harfi tabela kanvasının içinde tutar.</p>
          </div>`;

const newMainUi = `          <div className="designer-field designer-cm-size-field">
            <div className="designer-slider-heading">
              <label>HARF YÜKSEKLİĞİ / CM</label>
              <div className="designer-cm-value">
                <input
                  type="number"
                  min="1"
                  max="999"
                  step="1"
                  value={letterHeightCm}
                  onChange={(e) => setLetterHeightCm(Math.max(1, Math.min(999, Number(e.target.value) || 1)))}
                />
                <b>CM</b>
              </div>
            </div>
            <input
              className="designer-range"
              type="range"
              min="1"
              max={Math.max(160, height * 2)}
              step="1"
              value={Math.min(letterHeightCm, Math.max(160, height * 2))}
              onChange={(e) => setLetterHeightCm(Number(e.target.value))}
            />
            <div className="designer-range-scale">
              <span>1 CM</span>
              <span>{Math.max(160, height * 2)} CM</span>
            </div>
            <p className="designer-control-note">Harf yüksekliğini yüzde yerine santimetre olarak gir. Önizleme tabela ölçeğine göre otomatik hesaplanır.</p>
          </div>`;

mustReplace(oldMainUi, newMainUi, "main size UI");

// 7) Ek metin UI.
const oldExtraUi = `                <div className="designer-slider-heading">
                  <label>EK METİN BOYUTU</label>
                  <b>%{extraFontSizePercent}</b>
                </div>
                <input
                  className="designer-range"
                  type="range"
                  min="5"
                  max="160"
                  step="1"
                  value={extraFontSizePercent}
                  onChange={(e) => setExtraFontSizePercent(Number(e.target.value))}
                />`;

const newExtraUi = `                <div className="designer-slider-heading">
                  <label>EK METİN YÜKSEKLİĞİ / CM</label>
                  <div className="designer-cm-value">
                    <input
                      type="number"
                      min="1"
                      max="999"
                      step="1"
                      value={extraLetterHeightCm}
                      onChange={(e) => setExtraLetterHeightCm(Math.max(1, Math.min(999, Number(e.target.value) || 1)))}
                    />
                    <b>CM</b>
                  </div>
                </div>
                <input
                  className="designer-range"
                  type="range"
                  min="1"
                  max={Math.max(120, height * 2)}
                  step="1"
                  value={Math.min(extraLetterHeightCm, Math.max(120, height * 2))}
                  onChange={(e) => setExtraLetterHeightCm(Number(e.target.value))}
                />`;

mustReplace(oldExtraUi, newExtraUi, "extra size UI");

// 8) Logo UI.
const oldLogoUi = `                <div className="designer-slider-heading">
                  <label>LOGO BOYUTU</label>
                  <b>%{logoSizePercent}</b>
                </div>
                <input
                  className="designer-range"
                  type="range"
                  min="10"
                  max="130"
                  step="1"
                  value={logoSizePercent}
                  onChange={(e) => setLogoSizePercent(Number(e.target.value))}
                />
                <div className="designer-range-scale">
                  <span>KÜÇÜK</span>
                  <span>TAŞIR</span>
                </div>`;

const newLogoUi = `                <div className="designer-slider-heading">
                  <label>LOGO YÜKSEKLİĞİ / CM</label>
                  <div className="designer-cm-value">
                    <input
                      type="number"
                      min="1"
                      max="999"
                      step="1"
                      value={logoHeightCm}
                      onChange={(e) => setLogoHeightCm(Math.max(1, Math.min(999, Number(e.target.value) || 1)))}
                    />
                    <b>CM</b>
                  </div>
                </div>
                <input
                  className="designer-range"
                  type="range"
                  min="1"
                  max={Math.max(160, height * 2)}
                  step="1"
                  value={Math.min(logoHeightCm, Math.max(160, height * 2))}
                  onChange={(e) => setLogoHeightCm(Number(e.target.value))}
                />
                <div className="designer-range-scale">
                  <span>1 CM</span>
                  <span>{Math.max(160, height * 2)} CM</span>
                </div>`;

mustReplace(oldLogoUi, newLogoUi, "logo size UI");

// Güvenlik: eski yüzde state isimleri kalmışsa patch'i kabul etme.
const leftovers = ["fontSizePercent", "setFontSizePercent", "extraFontSizePercent", "setExtraFontSizePercent", "logoSizePercent", "setLogoSizePercent"];
const found = leftovers.filter((token) => src.includes(token));
if (found.length) {
  console.error("Patch sonrası eski yüzde değişkenleri kaldı:", found.join(", "));
  process.exit(1);
}

fs.writeFileSync(signPath, src, "utf8");

// 9) CM input görünümü.
const cssAddon = `

/* REDPEN V30 — gerçek ölçü / cm kontrolleri */
.designer-cm-size-field .designer-slider-heading,
.designer-logo-size-control .designer-slider-heading,
.designer-extra-copy-controls .designer-slider-heading {
  align-items: center;
}

.designer-cm-value {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.designer-cm-value input {
  width: 76px;
  min-height: 38px;
  padding: 7px 9px;
  border: 1px solid rgba(255,255,255,.18);
  background: rgba(255,255,255,.045);
  color: #fff;
  font: 800 13px/1 var(--font-geist-mono);
  text-align: right;
  outline: none;
}

.designer-cm-value input:focus {
  border-color: rgba(226,29,56,.8);
  box-shadow: 0 0 0 1px rgba(226,29,56,.22);
}

.designer-cm-value b {
  color: rgba(255,255,255,.72);
  font-size: 10px;
  letter-spacing: .08em;
}
`;

if (fs.existsSync(cssPath)) {
  let css = fs.readFileSync(cssPath, "utf8");
  if (!css.includes("REDPEN V30 — gerçek ölçü / cm kontrolleri")) {
    css += cssAddon;
    fs.writeFileSync(cssPath, css, "utf8");
  }
}

console.log("✓ Ana harf yüksekliği yüzde -> cm");
console.log("✓ Ek metin yüksekliği yüzde -> cm");
console.log("✓ Logo yüksekliği yüzde -> cm");
console.log("✓ WhatsApp mesajı seçilen cm değerlerini kullanıyor");
console.log("Şimdi: npm.cmd run build");
