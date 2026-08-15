"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  width: number;
  height: number;
  text: string;
  fontFamily: string;
  letterHeightCm: number;
  letterSpacing: number;
  letterMaterial: string;
  baseMaterial: string;
};

const CONFIG = {
  composite: [
    { w: 300, h: 125, price: 8700, label: "300×125" },
    { w: 600, h: 150, price: 16200, label: "600×150" },
  ],
  forex: { w: 300, h: 150, price: 4800, efficiency: 0.68 },
  plexi: { w: 300, h: 150, price: 15000, efficiency: 0.68 },
  sidePerM: 120,
  profile: { stockM: 6, price: 450, braceEveryCm: 80 },
} as const;

const tl = (value: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Math.max(0, value));

const resolveFont = (family: string) => {
  if (typeof window === "undefined") return family;
  const m = family.match(/^var\((--[^)]+)\)$/);
  if (!m) return family;
  return (
    getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim() ||
    family
  );
};

function textGeometry(
  text: string,
  family: string,
  heightCm: number,
  spacingPercent: number,
) {
  if (typeof document === "undefined" || !text.trim() || heightCm <= 0) {
    return { areaM2: 0, perimeterM: 0 };
  }

  const size = 180;
  const familyResolved = resolveFont(family);
  const canvas = document.createElement("canvas");
  const measure = canvas.getContext("2d");
  if (!measure) return { areaM2: 0, perimeterM: 0 };

  measure.font = `800 ${size}px ${familyResolved}`;
  const chars = Array.from(text);
  const spacing = size * (spacingPercent / 100);
  const widths = chars.map((c) => Math.max(1, measure.measureText(c).width));
  const totalW =
    widths.reduce((a, b) => a + b, 0) +
    Math.max(0, chars.length - 1) * spacing;

  canvas.width = Math.max(100, Math.ceil(totalW + size));
  canvas.height = Math.ceil(size * 2.2);

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { areaM2: 0, perimeterM: 0 };

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `800 ${size}px ${familyResolved}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#fff";

  let x = size * 0.3;
  const baseline = size * 1.45;
  chars.forEach((c, i) => {
    ctx.fillText(c, x, baseline);
    x += widths[i] + (i < chars.length - 1 ? spacing : 0);
  });

  const img = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const w = canvas.width;
  const h = canvas.height;
  const filled = (px: number, py: number) => {
    if (px < 0 || py < 0 || px >= w || py >= h) return false;
    return img[(py * w + px) * 4 + 3] > 80;
  };

  let minY = h;
  let maxY = -1;
  let ink = 0;
  let edges = 0;

  for (let py = 0; py < h; py += 1) {
    for (let px = 0; px < w; px += 1) {
      if (!filled(px, py)) continue;
      ink += 1;
      minY = Math.min(minY, py);
      maxY = Math.max(maxY, py);
      if (!filled(px - 1, py)) edges += 1;
      if (!filled(px + 1, py)) edges += 1;
      if (!filled(px, py - 1)) edges += 1;
      if (!filled(px, py + 1)) edges += 1;
    }
  }

  if (!ink || maxY < minY) return { areaM2: 0, perimeterM: 0 };

  const pxHeight = Math.max(1, maxY - minY + 1);
  const cmPerPx = heightCm / pxHeight;

  return {
    areaM2: (ink * cmPerPx * cmPerPx) / 10000,
    perimeterM: (edges * cmPerPx) / 100,
  };
}

function bestComposite(width: number, height: number) {
  const options: Array<{ label: string; sheets: number; cost: number }> = [];

  for (const s of CONFIG.composite) {
    const normal =
      Math.ceil(width / s.w) * Math.ceil(height / s.h);
    const rotated =
      Math.ceil(width / s.h) * Math.ceil(height / s.w);

    options.push({
      label: s.label,
      sheets: normal,
      cost: normal * s.price,
    });
    options.push({
      label: `${s.label} döndürülmüş`,
      sheets: rotated,
      cost: rotated * s.price,
    });
  }

  if (height <= 125) {
    for (let n600 = 0; n600 <= Math.ceil(width / 600) + 1; n600 += 1) {
      const rest = Math.max(0, width - n600 * 600);
      const n300 = Math.ceil(rest / 300);
      if (n600 + n300 === 0) continue;
      options.push({
        label: `${n600}×600×150 + ${n300}×300×125`,
        sheets: n600 + n300,
        cost: n600 * 16200 + n300 * 8700,
      });
    }
  }

  return options.sort((a, b) => a.cost - b.cost || a.sheets - b.sheets)[0];
}

export default function CostDebugPanel(props: Props) {
  const [fontReadyTick, setFontReadyTick] = useState(0);

  useEffect(() => {
    document.fonts?.ready.then(() => setFontReadyTick((v) => v + 1));
  }, []);

  const result = useMemo(() => {
    const geom = textGeometry(
      props.text,
      props.fontFamily,
      props.letterHeightCm,
      props.letterSpacing,
    );

    const composite =
      props.baseMaterial === "KOMPOZİT"
        ? bestComposite(props.width, props.height)
        : null;

    const usesPlexi =
      props.letterMaterial === "PLEKSİ" ||
      props.letterMaterial === "FİLELİ GOLD" ||
      props.letterMaterial === "FİLELİ KROM";

    const usesForex = props.letterMaterial === "FOREX";

    const usesSide =
      props.letterMaterial === "PLEKSİ" ||
      props.letterMaterial === "GOLD KAPLAMA" ||
      props.letterMaterial === "KROM KAPLAMA" ||
      props.letterMaterial === "FİLELİ GOLD" ||
      props.letterMaterial === "FİLELİ KROM";

    const plexiSheets = usesPlexi
      ? Math.max(
          1,
          Math.ceil(
            geom.areaM2 /
              (((CONFIG.plexi.w * CONFIG.plexi.h) / 10000) *
                CONFIG.plexi.efficiency),
          ),
        )
      : 0;

    const forexSheets = usesForex
      ? Math.max(
          1,
          Math.ceil(
            geom.areaM2 /
              (((CONFIG.forex.w * CONFIG.forex.h) / 10000) *
                CONFIG.forex.efficiency),
          ),
        )
      : 0;

    const sideM = usesSide ? geom.perimeterM : 0;

    const perimeterM = (2 * props.width + 2 * props.height) / 100;
    const vertical = Math.max(
      0,
      Math.ceil(props.width / CONFIG.profile.braceEveryCm) - 1,
    );
    const horizontal = Math.max(
      0,
      Math.ceil(props.height / CONFIG.profile.braceEveryCm) - 1,
    );
    const profileNeededM =
      perimeterM +
      (vertical * props.height + horizontal * props.width) / 100;
    const profileStocks = Math.max(
      1,
      Math.ceil(profileNeededM / CONFIG.profile.stockM),
    );

    const costs = {
      composite: composite?.cost ?? 0,
      plexi: plexiSheets * CONFIG.plexi.price,
      forex: forexSheets * CONFIG.forex.price,
      side: sideM * CONFIG.sidePerM,
      profile: profileStocks * CONFIG.profile.price,
    };

    const total =
      costs.composite +
      costs.plexi +
      costs.forex +
      costs.side +
      costs.profile;

    return {
      geom,
      composite,
      plexiSheets,
      forexSheets,
      sideM,
      profileNeededM,
      profileStocks,
      vertical,
      horizontal,
      costs,
      total,
    };
  }, [
    props,
    fontReadyTick,
  ]);

  const box: React.CSSProperties = {
    border: "1px solid rgba(255,181,62,.38)",
    background: "rgba(17,15,10,.97)",
    padding: 14,
    minWidth: 0,
  };

  return (
    <div
      style={{
        margin: "14px 0 12px",
        border: "2px solid #ffb53e",
        background: "#0b0c0f",
        color: "#fff",
        boxShadow: "0 0 0 1px rgba(255,181,62,.08) inset",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "center",
          padding: "14px 16px",
          borderBottom: "1px solid rgba(255,255,255,.10)",
        }}
      >
        <div>
          <div
            style={{
              color: "#ffb53e",
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: ".12em",
            }}
          >
            MATERIAL ENGINE / V42
          </div>
          <strong style={{ fontSize: 16 }}>SARFİYAT + MALİYET TEST PANELİ</strong>
        </div>
        <b style={{ color: "#ffb53e", fontSize: 11 }}>LED HARİÇ</b>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
          gap: 8,
          padding: 8,
        }}
      >
        <div style={box}>
          <small>KOMPOZİT</small>
          <div style={{ fontSize: 18, fontWeight: 900, marginTop: 5 }}>
            {result.composite ? `${result.composite.sheets} plaka` : "YOK"}
          </div>
          <div style={{ opacity: 0.6, fontSize: 11, marginTop: 5 }}>
            {result.composite
              ? `${result.composite.label} · ${tl(result.costs.composite)}`
              : "Zemin kompozit değil"}
          </div>
        </div>

        <div style={box}>
          <small>PLEKSİ 300×150</small>
          <div style={{ fontSize: 18, fontWeight: 900, marginTop: 5 }}>
            {result.plexiSheets} plaka
          </div>
          <div style={{ opacity: 0.6, fontSize: 11, marginTop: 5 }}>
            {result.geom.areaM2.toFixed(3)} m² yüz · {tl(result.costs.plexi)}
          </div>
        </div>

        <div style={box}>
          <small>FOREX 300×150</small>
          <div style={{ fontSize: 18, fontWeight: 900, marginTop: 5 }}>
            {result.forexSheets} plaka
          </div>
          <div style={{ opacity: 0.6, fontSize: 11, marginTop: 5 }}>
            {result.forexSheets ? tl(result.costs.forex) : "Kullanılmıyor"}
          </div>
        </div>

        <div style={box}>
          <small>HARF YANAĞI</small>
          <div style={{ fontSize: 18, fontWeight: 900, marginTop: 5 }}>
            {result.sideM.toFixed(1)} m
          </div>
          <div style={{ opacity: 0.6, fontSize: 11, marginTop: 5 }}>
            120 TL/m · {tl(result.costs.side)}
          </div>
        </div>

        <div style={box}>
          <small>DEMİR PROFİL</small>
          <div style={{ fontSize: 18, fontWeight: 900, marginTop: 5 }}>
            {result.profileStocks} × 6 m
          </div>
          <div style={{ opacity: 0.6, fontSize: 11, marginTop: 5 }}>
            {result.profileNeededM.toFixed(1)} m ihtiyaç · {tl(result.costs.profile)}
          </div>
        </div>

        <div
          style={{
            ...box,
            borderColor: "rgba(255,181,62,.75)",
          }}
        >
          <small>BİLİNEN MALZEME TOPLAMI</small>
          <div
            style={{
              color: "#ffb53e",
              fontSize: 24,
              fontWeight: 950,
              marginTop: 5,
            }}
          >
            {tl(result.total)}
          </div>
          <div style={{ opacity: 0.6, fontSize: 10, marginTop: 5 }}>
            LED + metal yüz + işçilik + montaj + kâr dahil değil
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "8px 16px 13px",
          opacity: 0.55,
          fontSize: 10,
          lineHeight: 1.5,
        }}
      >
        Gerçek raster yazı yüzü: {result.geom.areaM2.toFixed(3)} m² · yaklaşık
        kontur: {result.geom.perimeterM.toFixed(2)} m · profil ara kayıt:
        {" "}{result.vertical} dikey + {result.horizontal} yatay · Pleksi/Forex
        verim katsayısı şimdilik %68.
      </div>
    </div>
  );
}
