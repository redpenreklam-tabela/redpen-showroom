"use client";

import { useMemo, useRef, useState } from "react";

type SignType = "KUTU HARF" | "IŞIKLI PANEL" | "TOTEM" | "CEPHE";
type Material = "PLEKSİ" | "ALÜMİNYUM" | "KROM" | "KOMPOZİT";
type SceneMode = "day" | "night";

const signTypes: SignType[] = ["KUTU HARF", "IŞIKLI PANEL", "TOTEM", "CEPHE"];
const materials: Material[] = ["PLEKSİ", "ALÜMİNYUM", "KROM", "KOMPOZİT"];

const letterColors = [
  { name: "Kırmızı", value: "#e21d38" },
  { name: "Beyaz", value: "#f5f5f3" },
  { name: "Siyah", value: "#141416" },
  { name: "Altın", value: "#c8a96a" },
  { name: "Mavi", value: "#4285f4" },
];

const baseColors = [
  { name: "Antrasit", value: "#232426" },
  { name: "Siyah", value: "#0d0e10" },
  { name: "Beyaz", value: "#e8e8e3" },
  { name: "Kırmızı", value: "#9c1429" },
  { name: "Lacivert", value: "#102b4d" },
  { name: "Kompozit Gri", value: "#555a60" },
];

export default function SignDesigner() {
  const [text, setText] = useState("REDPEN");
  const [signType, setSignType] = useState<SignType>("KUTU HARF");
  const [letterMaterial, setLetterMaterial] = useState<Material>("PLEKSİ");
  const [baseMaterial, setBaseMaterial] = useState<Material>("KOMPOZİT");
  const [letterColor, setLetterColor] = useState(letterColors[0].value);
  const [baseColor, setBaseColor] = useState(baseColors[0].value);
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(80);
  const [lighted, setLighted] = useState(true);
  const [scene, setScene] = useState<SceneMode>("night");
  const [logo, setLogo] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const normalizedText = (text.trim() || "MARKANIZ").slice(0, 24).toUpperCase();

  /*
   * GERÇEK SAHNE ÖLÇEĞİ
   * Aynı px/cm ölçeği hem tabelaya hem 180 cm insan referansına uygulanır.
   * 300x80 tabela örneğinde oran TAM 3.75:1 kalır.
   * Büyük ölçüler sahneye sığmak için ortak ölçekle küçülür, oran asla bozulmaz.
   */
  const sceneScale = useMemo(() => {
    const safeWidth = Math.max(1, width);
    const safeHeight = Math.max(1, height);

    const maxBoardWidthPx = 720;
    const maxBoardHeightPx = 280;
    const maxHumanHeightPx = 300;

    return Math.min(
      maxBoardWidthPx / safeWidth,
      maxBoardHeightPx / safeHeight,
      maxHumanHeightPx / 180
    );
  }, [width, height]);

  const boardStyle = useMemo(() => {
    const safeWidth = Math.max(1, width);
    const safeHeight = Math.max(1, height);

    return {
      "--board-px-width": `${safeWidth * sceneScale}px`,
      "--board-px-height": `${safeHeight * sceneScale}px`,
      "--human-px-height": `${180 * sceneScale}px`,
      "--scale-px-per-cm": `${sceneScale}`,
      "--base-color": baseColor,
      "--letter-color": letterColor,
    } as React.CSSProperties;
  }, [width, height, sceneScale, baseColor, letterColor]);

  const facadeStyle = useMemo(
    () =>
      ({
        "--board-px-width": `${Math.max(1, width) * sceneScale}px`,
        "--board-px-height": `${Math.max(1, height) * sceneScale}px`,
        "--human-px-height": `${180 * sceneScale}px`,
      }) as React.CSSProperties,
    [width, height, sceneScale]
  );

  const whatsappHref = useMemo(() => {
    const message = [
      "Merhaba Redpen Reklam, showroom üzerinden bir tabela tasarımı oluşturdum.",
      "",
      `Tabela tipi: ${signType}`,
      `Yazı: ${normalizedText}`,
      `Zemin malzemesi: ${baseMaterial}`,
      `Harf malzemesi: ${letterMaterial}`,
      `Ölçü: ${width} x ${height} cm`,
      `Aydınlatma: ${lighted ? "Işıklı" : "Işıksız"}`,
      `Zemin rengi: ${baseColor}`,
      `Harf rengi: ${letterColor}`,
      "",
      "Bu tasarım için fiyat ve uygulama bilgisi alabilir miyim?",
    ].join("\n");

    return `https://wa.me/905305606525?text=${encodeURIComponent(message)}`;
  }, [
    signType, normalizedText, baseMaterial, letterMaterial,
    width, height, lighted, baseColor, letterColor,
  ]);

  const onLogo = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setLogo(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };

  return (
    <main className={`designer-screen mode-${scene}`}>
      <header className="designer-toolbar">
        <a href="/" className="designer-back"><span>←</span><b>SHOWROOM</b></a>
        <div className="designer-title">
          <small>REDPEN LAB / 01</small>
          <strong>TABELANI TASARLA</strong>
        </div>
        <div className="designer-mode-switch">
          <button type="button" className={scene === "day" ? "is-active" : ""} onClick={() => setScene("day")}>GÜNDÜZ</button>
          <button type="button" className={scene === "night" ? "is-active" : ""} onClick={() => setScene("night")}>GECE</button>
        </div>
      </header>

      <div className="designer-layout">
        <aside className="designer-panel">
          <div className="designer-panel-heading">
            <p>01 / KONFİGÜRASYON</p>
            <h1>Kendi tabelanı<br/><em>oluştur.</em></h1>
            <span>Zemin, harf, renk ve ölçüleri değiştir. Önizleme gerçek zamanlı güncellensin.</span>
          </div>

          <div className="designer-field">
            <label>MARKA / TABELA YAZISI</label>
            <input value={text} maxLength={24} onChange={(e) => setText(e.target.value)} placeholder="MARKANIZ"/>
          </div>

          <div className="designer-field">
            <label>TABELA TİPİ</label>
            <div className="designer-choice-grid">
              {signTypes.map((item) => (
                <button type="button" key={item} className={signType === item ? "is-active" : ""} onClick={() => setSignType(item)}>{item}</button>
              ))}
            </div>
          </div>

          <div className="designer-field">
            <label>ZEMİN MALZEMESİ</label>
            <div className="designer-material-row">
              {materials.map((item) => (
                <button type="button" key={`base-${item}`} className={baseMaterial === item ? "is-active" : ""} onClick={() => setBaseMaterial(item)}>{item}</button>
              ))}
            </div>
          </div>

          <div className="designer-field">
            <label>ZEMİN RENGİ</label>
            <div className="designer-colors designer-colors-wide">
              {baseColors.map((item) => (
                <button key={`base-color-${item.value}`} type="button" className={baseColor === item.value ? "is-active" : ""} style={{ "--swatch": item.value } as React.CSSProperties} onClick={() => setBaseColor(item.value)} aria-label={item.name} title={item.name}/>
              ))}
            </div>
          </div>

          <div className="designer-field">
            <label>HARF MALZEMESİ</label>
            <div className="designer-material-row">
              {materials.map((item) => (
                <button type="button" key={`letter-${item}`} className={letterMaterial === item ? "is-active" : ""} onClick={() => setLetterMaterial(item)}>{item}</button>
              ))}
            </div>
          </div>

          <div className="designer-field">
            <label>HARF RENGİ</label>
            <div className="designer-colors">
              {letterColors.map((item) => (
                <button key={`letter-color-${item.value}`} type="button" className={letterColor === item.value ? "is-active" : ""} style={{ "--swatch": item.value } as React.CSSProperties} onClick={() => setLetterColor(item.value)} aria-label={item.name} title={item.name}/>
              ))}
            </div>
          </div>

          <div className="designer-field designer-measurements">
            <div>
              <label>GENİŞLİK / CM</label>
              <input type="number" min={40} max={1200} value={width} onChange={(e) => setWidth(Number(e.target.value) || 40)}/>
            </div>
            <div>
              <label>YÜKSEKLİK / CM</label>
              <input type="number" min={20} max={600} value={height} onChange={(e) => setHeight(Number(e.target.value) || 20)}/>
            </div>
          </div>

          <div className="designer-field">
            <label>AYDINLATMA</label>
            <button type="button" className={`designer-toggle ${lighted ? "is-on" : ""}`} onClick={() => setLighted((v) => !v)}>
              <span/><b>{lighted ? "IŞIKLI" : "IŞIKSIZ"}</b>
            </button>
          </div>

          <div className="designer-field">
            <label>LOGO / OPSİYONEL</label>
            <input ref={fileRef} className="designer-file-input" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(e) => onLogo(e.target.files?.[0])}/>
            <div className="designer-upload-row">
              <button type="button" onClick={() => fileRef.current?.click()}>{logo ? "LOGOYU DEĞİŞTİR" : "LOGO YÜKLE"}<span>＋</span></button>
              {logo && <button type="button" className="designer-clear-logo" onClick={() => setLogo(null)}>KALDIR</button>}
            </div>
          </div>
        </aside>

        <section className="designer-preview">
          <div className="designer-preview-top">
            <div><span>CANLI ÖNİZLEME</span><b>{signType}</b></div>
            <div><span>ÖLÇÜ</span><b>{width} × {height} CM</b></div>
          </div>

          <div className="designer-facade" style={facadeStyle}>
            <div className="designer-wall-grid"/>

            <div
              className={`designer-board material-${baseMaterial.toLowerCase()} type-${signType.toLowerCase().replaceAll(" ", "-")} ${lighted ? "is-lighted" : ""}`}
              style={boardStyle}
            >
              <span className="designer-board-edge" aria-hidden="true"/>
              <div className="designer-board-content">
                {logo && <img src={logo} alt="" className="designer-logo-preview"/>}
                <strong>{normalizedText}</strong>
              </div>
              <span className="designer-board-glow" aria-hidden="true"/>
            </div>

            <div className="designer-dimension designer-dimension-width">
              <i/><b>{width} CM</b>
            </div>
            <div className="designer-dimension designer-dimension-height">
              <i/><b>{height} CM</b>
            </div>

            <div className="designer-human-scale">
              <span/>
              <i/>
              <b>180 CM</b>
            </div>

            <div className="designer-scale-readout">
              <span>SAHNE ÖLÇEĞİ</span>
              <b>1 CM = {sceneScale.toFixed(2)} PX</b>
            </div>

            <div className="designer-floor-line"/>
            <div className="designer-preview-caption">
              <span>ORAN KORUNUR / ÖLÇEKLİ ÖNİZLEME</span>
              <i/>
              <span>{scene === "night" ? "GECE MODU" : "GÜNDÜZ MODU"}</span>
            </div>
          </div>

          <div className="designer-summary">
            <div><span>01</span><p>TİP</p><b>{signType}</b></div>
            <div><span>02</span><p>ZEMİN</p><b>{baseMaterial}</b></div>
            <div><span>03</span><p>HARF</p><b>{letterMaterial}</b></div>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="designer-quote">
              <span>BU TASARIM İÇİN</span><strong>TEKLİF AL</strong><b>↗</b>
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
