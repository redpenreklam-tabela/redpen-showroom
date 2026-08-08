"use client";

import { useMemo, useRef, useState } from "react";

type SignType = "KUTU HARF" | "IŞIKLI PANEL" | "TOTEM" | "CEPHE";
type Material = "PLEKSİ" | "ALÜMİNYUM" | "KROM" | "KOMPOZİT";
type SceneMode = "day" | "night";

const signTypes: SignType[] = ["KUTU HARF", "IŞIKLI PANEL", "TOTEM", "CEPHE"];
const materials: Material[] = ["PLEKSİ", "ALÜMİNYUM", "KROM", "KOMPOZİT"];
const colors = [
  { name: "Kırmızı", value: "#e21d38" },
  { name: "Beyaz", value: "#f5f5f3" },
  { name: "Siyah", value: "#141416" },
  { name: "Altın", value: "#c8a96a" },
  { name: "Mavi", value: "#4285f4" },
];

export default function SignDesigner() {
  const [text, setText] = useState("REDPEN");
  const [signType, setSignType] = useState<SignType>("KUTU HARF");
  const [material, setMaterial] = useState<Material>("PLEKSİ");
  const [color, setColor] = useState(colors[0].value);
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(80);
  const [lighted, setLighted] = useState(true);
  const [scene, setScene] = useState<SceneMode>("night");
  const [logo, setLogo] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const normalizedText = (text.trim() || "MARKANIZ").slice(0, 24).toUpperCase();
  const ratio = useMemo(() => Math.min(5.2, Math.max(1.6, width / Math.max(height, 1))), [width, height]);
  const previewWidth = useMemo(() => `${Math.min(88, Math.max(44, ratio * 18))}%`, [ratio]);

  const whatsappHref = useMemo(() => {
    const message = [
      "Merhaba Redpen Reklam, showroom üzerinden bir tabela tasarımı oluşturdum.",
      "",
      `Tabela tipi: ${signType}`,
      `Yazı: ${normalizedText}`,
      `Malzeme: ${material}`,
      `Ölçü: ${width} x ${height} cm`,
      `Aydınlatma: ${lighted ? "Işıklı" : "Işıksız"}`,
      `Renk: ${color}`,
      "",
      "Bu tasarım için fiyat ve uygulama bilgisi alabilir miyim?",
    ].join("\n");
    return `https://wa.me/905305606525?text=${encodeURIComponent(message)}`;
  }, [signType, normalizedText, material, width, height, lighted, color]);

  const onLogo = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };

  return (
    <main className={`designer-screen mode-${scene}`}>
      <header className="designer-toolbar">
        <a href="/" className="designer-back"><span>←</span><b>SHOWROOM</b></a>
        <div className="designer-title"><small>REDPEN LAB / 01</small><strong>TABELANI TASARLA</strong></div>
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
            <span>Seçenekleri değiştir, önizlemeyi gör ve tasarımını teklif talebine dönüştür.</span>
          </div>

          <div className="designer-field"><label>MARKA / TABELA YAZISI</label><input value={text} maxLength={24} onChange={(e)=>setText(e.target.value)} placeholder="MARKANIZ"/></div>

          <div className="designer-field"><label>TABELA TİPİ</label><div className="designer-choice-grid">
            {signTypes.map(item=><button type="button" key={item} className={signType===item?"is-active":""} onClick={()=>setSignType(item)}>{item}</button>)}
          </div></div>

          <div className="designer-field"><label>MALZEME</label><div className="designer-material-row">
            {materials.map(item=><button type="button" key={item} className={material===item?"is-active":""} onClick={()=>setMaterial(item)}>{item}</button>)}
          </div></div>

          <div className="designer-field designer-measurements">
            <div><label>GENİŞLİK / CM</label><input type="number" min={40} max={1200} value={width} onChange={(e)=>setWidth(Number(e.target.value)||40)}/></div>
            <div><label>YÜKSEKLİK / CM</label><input type="number" min={20} max={600} value={height} onChange={(e)=>setHeight(Number(e.target.value)||20)}/></div>
          </div>

          <div className="designer-field"><label>RENK</label><div className="designer-colors">
            {colors.map(item=><button key={item.value} type="button" className={color===item.value?"is-active":""} style={{"--swatch":item.value} as React.CSSProperties} onClick={()=>setColor(item.value)} aria-label={item.name} title={item.name}/>)}
          </div></div>

          <div className="designer-field"><label>AYDINLATMA</label><button type="button" className={`designer-toggle ${lighted?"is-on":""}`} onClick={()=>setLighted(v=>!v)}><span/><b>{lighted?"IŞIKLI":"IŞIKSIZ"}</b></button></div>

          <div className="designer-field"><label>LOGO / OPSİYONEL</label>
            <input ref={fileRef} className="designer-file-input" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(e)=>onLogo(e.target.files?.[0])}/>
            <div className="designer-upload-row"><button type="button" onClick={()=>fileRef.current?.click()}>{logo?"LOGOYU DEĞİŞTİR":"LOGO YÜKLE"}<span>＋</span></button>{logo&&<button type="button" className="designer-clear-logo" onClick={()=>setLogo(null)}>KALDIR</button>}</div>
          </div>
        </aside>

        <section className="designer-preview">
          <div className="designer-preview-top"><div><span>CANLI ÖNİZLEME</span><b>{signType}</b></div><div><span>ÖLÇÜ</span><b>{width} × {height} CM</b></div></div>
          <div className="designer-facade">
            <div className="designer-wall-grid"/>
            <div className={`designer-sign ${lighted?"is-lighted":""}`} style={{"--sign-color":color,"--preview-width":previewWidth} as React.CSSProperties}>
              {logo&&<img src={logo} alt="" className="designer-logo-preview"/>}<strong>{normalizedText}</strong><span className="designer-sign-depth"/>
            </div>
            <div className="designer-human-scale"><span/><i/><b>180 CM</b></div>
            <div className="designer-floor-line"/>
            <div className="designer-preview-caption"><span>GÖRSEL ÖNİZLEMEDİR</span><i/><span>{scene==="night"?"GECE MODU":"GÜNDÜZ MODU"}</span></div>
          </div>
          <div className="designer-summary">
            <div><span>01</span><p>TİP</p><b>{signType}</b></div><div><span>02</span><p>MALZEME</p><b>{material}</b></div><div><span>03</span><p>IŞIK</p><b>{lighted?"LED":"YOK"}</b></div>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="designer-quote"><span>BU TASARIM İÇİN</span><strong>TEKLİF AL</strong><b>↗</b></a>
          </div>
        </section>
      </div>
    </main>
  );
}
