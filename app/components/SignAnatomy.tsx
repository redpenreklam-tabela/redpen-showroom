"use client";

import { useRef, useState } from "react";

const layers = [
  {
    no: "01",
    short: "KOMPOZİT",
    title: "KOMPOZİT ZEMİN",
    detail: "Tabela sisteminin yapıya bağlanan, sert ve dayanıklı ana zemin katmanı.",
    spec: "3 MM ALÜMİNYUM KOMPOZİT",
    className: "anatomy-layer-composite",
    accent: "#8f263a",
  },
  {
    no: "02",
    short: "FOREX",
    title: "FOREX TABAN",
    detail: "LED modülleri ve elektrik bileşenlerini taşıyan beyaz, temiz arka plaka.",
    spec: "8 MM BEYAZ FOREX",
    className: "anatomy-layer-forex",
    accent: "#f0edf2",
  },
  {
    no: "03",
    short: "LED",
    title: "LED MODÜL",
    detail: "Düşük tüketimle homojen ışık üreten, servis edilebilir aydınlatma katmanı.",
    spec: "12 V / IP67 LED MODÜL",
    className: "anatomy-layer-led",
    accent: "#e54863",
  },
  {
    no: "04",
    short: "PLEKSİ",
    title: "PLEKSİ KUTU HARF",
    detail: "Işığı homojen dağıtan, markanın görünen ve aydınlanan ön yüzü.",
    spec: "3 MM OPAL PLEKSİ",
    className: "anatomy-layer-plexi",
    accent: "#ffffff",
  },
];

export default function SignAnatomy() {
  const shellRef = useRef<HTMLDivElement>(null);
  const [exploded, setExploded] = useState(true);
  const [activeLayer, setActiveLayer] = useState(3);

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const shell = shellRef.current;
    if (!shell) return;
    const rect = shell.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    shell.style.setProperty("--anatomy-rx", `${-y * 6}deg`);
    shell.style.setProperty("--anatomy-ry", `${x * 8}deg`);
    shell.style.setProperty("--anatomy-light-x", `${(x + 0.5) * 100}%`);
    shell.style.setProperty("--anatomy-light-y", `${(y + 0.5) * 100}%`);
  };

  const resetMove = () => {
    const shell = shellRef.current;
    if (!shell) return;
    shell.style.setProperty("--anatomy-rx", "0deg");
    shell.style.setProperty("--anatomy-ry", "0deg");
  };

  return (
    <section className="anatomy-section section-pad" data-ambient="anatomy" aria-labelledby="anatomy-title">
      <div className="anatomy-heading" data-scroll-reveal>
        <div>
          <p className="section-kicker">BİR TABELANIN ANATOMİSİ</p>
          <h2 id="anatomy-title">
            Aşağıdan yukarıya<br />
            <em>ışığın dört katmanı.</em>
          </h2>
        </div>
        <p>
          Kompozit zeminden ışıklı pleksi yüze kadar her katman ayrı bir görev üstlenir.
          Katmanların üzerine gelerek sistemin hangi parçasına baktığınızı doğrudan görün.
        </p>
      </div>

      <div className="anatomy-layout" data-scroll-reveal>
        <div
          ref={shellRef}
          className={`anatomy-visual${exploded ? " is-exploded" : " is-assembled"}`}
          onMouseMove={onMove}
          onMouseLeave={resetMove}
        >
          <div className="anatomy-grid" aria-hidden="true" />
          <div className="anatomy-axis anatomy-axis-x" aria-hidden="true" />
          <div className="anatomy-axis anatomy-axis-y" aria-hidden="true" />

          <div className="anatomy-order-note" aria-hidden="true">
            <span>ÜST / GÖRÜNEN YÜZ</span>
            <i />
            <span>ALT / MONTAJ ZEMİNİ</span>
          </div>

          <div className="anatomy-object" aria-hidden="true">
            {layers.map((layer, index) => (
              <div
                key={layer.title}
                className={`anatomy-layer ${layer.className}${activeLayer === index ? " is-active" : ""}`}
                style={{
                  "--layer-index": index,
                  "--layer-accent": layer.accent,
                } as React.CSSProperties}
              >
                <div className="anatomy-layer-id">
                  <span>{layer.no}</span>
                  <strong>{layer.short}</strong>
                </div>

                {index === 0 && (
                  <>
                    <div className="anatomy-composite-grain" />
                    <div className="anatomy-mount-points">
                      {Array.from({ length: 8 }, (_, point) => <i key={point} />)}
                    </div>
                  </>
                )}

                {index === 1 && <div className="anatomy-forex-core">FOREX</div>}

                {index === 2 && (
                  <div className="anatomy-led-grid">
                    {Array.from({ length: 30 }, (_, led) => <i key={led} />)}
                  </div>
                )}

                {index === 3 && (
                  <>
                    <div className="anatomy-letter">R</div>
                    <div className="anatomy-plexi-rim" />
                  </>
                )}

                <div className="anatomy-layer-tab">
                  <b>{layer.no}</b>
                  <span>{layer.title}</span>
                  <i />
                </div>
              </div>
            ))}
          </div>

          <div className="anatomy-active-readout">
            <span>AKTİF KATMAN / {layers[activeLayer].no}</span>
            <strong>{layers[activeLayer].title}</strong>
            <small>{layers[activeLayer].spec}</small>
          </div>

          <div className="anatomy-dimension anatomy-dimension-width"><i /> 420 MM</div>
          <div className="anatomy-dimension anatomy-dimension-depth"><i /> 82 MM</div>
          <div className="anatomy-visual-caption">
            <span>EXPLODED VIEW / 02</span>
            <strong>{exploded ? "ALT → ÜST KATMAN SIRASI" : "SİSTEM BİRLEŞİK"}</strong>
          </div>
        </div>

        <div className="anatomy-panel">
          <div className="anatomy-panel-top">
            <span>TEKNİK KESİT / ALT → ÜST</span>
            <button type="button" onClick={() => setExploded((value) => !value)}>
              {exploded ? "BİRLEŞTİR" : "KATMANLARI AÇ"} <b>↗</b>
            </button>
          </div>
          <div className="anatomy-list">
            {layers.map((layer, index) => (
              <button
                key={layer.title}
                type="button"
                className={activeLayer === index ? "is-active" : ""}
                onMouseEnter={() => setActiveLayer(index)}
                onFocus={() => setActiveLayer(index)}
                onClick={() => setActiveLayer(index)}
                style={{ "--layer-accent": layer.accent } as React.CSSProperties}
              >
                <span>{layer.no}</span>
                <div>
                  <strong>{layer.title}</strong>
                  <p>{layer.detail}</p>
                  <small>{layer.spec}</small>
                </div>
                <i>↗</i>
              </button>
            ))}
          </div>
          <div className="anatomy-panel-foot">
            <span>04 KATMAN</span><span>01 IŞIKLI SİSTEM</span><span>ALT → ÜST OKUMA</span>
          </div>
        </div>
      </div>
    </section>
  );
}
