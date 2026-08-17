"use client";

import { domToPng } from "modern-screenshot";
import { useEffect, useMemo, useRef, useState } from "react";
import CostDebugPanel from "./CostDebugPanel";

type SignType = "KUTU HARF";
type BaseMaterial = "PLEKSİ" | "ALÜMİNYUM" | "KROM" | "KOMPOZİT";
type LetterMaterial = "PLEKSİ" | "GOLD KAPLAMA" | "KROM KAPLAMA" | "FİLELİ KROM" | "FİLELİ GOLD" | "FOREX" | "FOLYO";
type LightStripMaterial = "PLEKSİ" | "GOLD KAPLAMA" | "KROM KAPLAMA" | "FİLELİ KROM" | "FİLELİ GOLD" | "FOREX";
type SceneMode = "day" | "night";
type DragType = "text" | "logo" | "extra";
type LightStripMode = "none" | "top" | "bottom" | "top-bottom" | "left" | "right" | "left-right" | "all";
type FontId =
  | "montserrat" | "oswald" | "bebas" | "poppins" | "roboto" | "anton"
  | "outfit" | "geologica" | "roboto-slab" | "inknut-antiqua" | "pacifico"
  | "anta" | "asimovian" | "bangers" | "bree-serif" | "bruno-ace-sc"
  | "cal-sans" | "caveat-brush" | "luckiest-guy"
  | "momo-trust-display" | "russo-one" | "sekuya" | "sriracha";

const baseMaterials: BaseMaterial[] = ["KOMPOZİT", "PLEKSİ", "ALÜMİNYUM"];
const kutuHarfMaterials: LetterMaterial[] = ["PLEKSİ", "GOLD KAPLAMA", "KROM KAPLAMA", "FİLELİ KROM", "FİLELİ GOLD"];
const lightStripMaterials: LightStripMaterial[] = ["PLEKSİ", "GOLD KAPLAMA", "KROM KAPLAMA", "FİLELİ KROM", "FİLELİ GOLD", "FOREX"];

const fonts: Array<{ id: FontId; name: string; family: string }> = [
  { id: "montserrat", name: "Montserrat", family: "var(--font-sign-montserrat)" },
  { id: "oswald", name: "Oswald", family: "var(--font-sign-oswald)" },
  { id: "bebas", name: "Bebas Neue", family: "var(--font-sign-bebas)" },
  { id: "poppins", name: "Poppins", family: "var(--font-sign-poppins)" },
  { id: "roboto", name: "Roboto", family: "var(--font-sign-roboto)" },
  { id: "anton", name: "Anton", family: "var(--font-sign-anton)" },
  { id: "outfit", name: "Outfit", family: "var(--font-sign-outfit)" },
  { id: "geologica", name: "Geologica", family: "var(--font-sign-geologica)" },
  { id: "roboto-slab", name: "Roboto Slab", family: "var(--font-sign-roboto-slab)" },
  { id: "inknut-antiqua", name: "Inknut Antiqua", family: "var(--font-sign-inknut-antiqua)" },
  { id: "pacifico", name: "Pacifico", family: "var(--font-sign-pacifico)" },
  { id: "anta", name: "Anta", family: "var(--font-sign-anta)" },
  { id: "asimovian", name: "Asimovian", family: "var(--font-sign-asimovian)" },
  { id: "bangers", name: "Bangers", family: "var(--font-sign-bangers)" },
  { id: "bree-serif", name: "Bree Serif", family: "var(--font-sign-bree-serif)" },
  { id: "bruno-ace-sc", name: "Bruno Ace SC", family: "var(--font-sign-bruno-ace-sc)" },
  { id: "cal-sans", name: "Cal Sans", family: "var(--font-sign-cal-sans)" },
  { id: "caveat-brush", name: "Caveat Brush", family: "var(--font-sign-caveat-brush)" },
  { id: "luckiest-guy", name: "Luckiest Guy", family: "var(--font-sign-luckiest-guy)" },
  { id: "momo-trust-display", name: "Momo Trust Display", family: "var(--font-sign-momo-trust-display)" },
  { id: "russo-one", name: "Russo One", family: "var(--font-sign-russo-one)" },
  { id: "sekuya", name: "Sekuya", family: "var(--font-sign-sekuya)" },
  { id: "sriracha", name: "Sriracha", family: "var(--font-sign-sriracha)" },
];

const letterColors = [
  { name: "Kırmızı", value: "#e21d38" },
  { name: "Beyaz", value: "#f5f5f3" },
  { name: "Siyah", value: "#141416" },
  { name: "Altın", value: "#c8a96a" },
  { name: "Mavi", value: "#4285f4" },
];

const baseColors = [
  { code: "SB 002", name: "Beyaz", value: "#ffffff" },
  { code: "SB 003", name: "Krem", value: "#e2e0c3" },
  { code: "SB 006", name: "Mavi", value: "#044585" },
  { code: "SB 013", name: "Koyu Gri", value: "#485655" },
  { code: "SB 004", name: "Siyah", value: "#0d1419" },
  { code: "SB 010", name: "Bordo", value: "#7e2927" },
  { code: "SB 005", name: "Kırmızı", value: "#c3282a" },
  { code: "SB 009", name: "Turuncu", value: "#dd5e2e" },
  { code: "SB 011", name: "Sarı", value: "#eca231" },
  { code: "SB 012", name: "Yosun Yeşili", value: "#25594a" },
  { code: "SB 024", name: "Trafik Yeşili", value: "#008445" },
  { code: "SB 026", name: "Çinko Sarısı", value: "#ffce42" },
  { code: "SB 025", name: "Antrasit Gri", value: "#24333b" },
];

const lightStripModes: Array<{ id: LightStripMode; label: string; short: string }> = [
  { id: "none", label: "Işık bandı yok", short: "YOK" },
  { id: "top", label: "Üst kenar", short: "ÜST" },
  { id: "bottom", label: "Alt kenar", short: "ALT" },
  { id: "top-bottom", label: "Üst ve alt kenar", short: "ÜST + ALT" },
  { id: "left", label: "Sol kenar", short: "SOL" },
  { id: "right", label: "Sağ kenar", short: "SAĞ" },
  { id: "left-right", label: "Sol ve sağ kenar", short: "SOL + SAĞ" },
  { id: "all", label: "Dört kenar", short: "4 KENAR" },
];

const lightStripColors = [
  { name: "Beyaz", value: "#ffffff" },
  { name: "Günışığı", value: "#ffd9a3" },
  { name: "Kırmızı", value: "#ff2a45" },
  { name: "Mavi", value: "#3f8cff" },
  { name: "Yeşil", value: "#38e27d" },
  { name: "Amber", value: "#ffae35" },
  { name: "Mor", value: "#a66cff" },
  { name: "Turkuaz", value: "#39e6e2" },
];

const resolveCssFontFamily = (family: string) => {
  if (typeof window === "undefined") return family;

  const match = family.match(/^var\((--[^)]+)\)$/);
  if (!match) return family;

  const resolved = getComputedStyle(document.documentElement)
    .getPropertyValue(match[1])
    .trim();

  return resolved || family;
};

const measureGlyphHeightRatio = (
  family: string,
  text: string,
  weight = 800
) => {
  if (typeof document === "undefined") return 0.72;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return 0.72;

  const testSize = 1000;
  const resolvedFamily = resolveCssFontFamily(family);

  context.font = `${weight} ${testSize}px ${resolvedFamily}`;

  const metrics = context.measureText(text || "REDPEN");
  const actualHeight =
    (metrics.actualBoundingBoxAscent || 0) +
    (metrics.actualBoundingBoxDescent || 0);

  if (!Number.isFinite(actualHeight) || actualHeight <= 0) return 0.72;

  // Aşırı sıra dışı font metriklerine karşı güvenli sınır.
  return Math.max(0.35, Math.min(1.25, actualHeight / testSize));
};

const hexToRgb = (hex: string) => {
  const clean = hex.replace("#", "");
  const normalized = clean.length === 3
    ? clean.split("").map((char) => char + char).join("")
    : clean.padEnd(6, "f").slice(0, 6);
  const value = Number.parseInt(normalized, 16);
  return `${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}`;
};

const materialSlug = (material: LetterMaterial | LightStripMaterial) => {
  switch (material) {
    case "PLEKSİ": return "pleksi";
    case "GOLD KAPLAMA": return "gold-kaplama";
    case "KROM KAPLAMA": return "krom-kaplama";
    case "FİLELİ GOLD": return "fileli-gold";
    case "FİLELİ KROM": return "fileli-krom";
    case "FOREX": return "forex";
    case "FOLYO": return "folyo";
    default: return "pleksi";
  }
};

const MaterialPicker = ({ value, onChange, compact = false }: { value: LetterMaterial; onChange: (material: LetterMaterial) => void; compact?: boolean }) => (
  <div className={`designer-letter-material-picker ${compact ? "is-compact" : ""}`}>
    <div className="designer-material-group">
      <span>KUTU HARF</span>
      <div className="designer-material-row">
        {kutuHarfMaterials.map((item) => (
          <button type="button" key={`kutu-${item}`} className={value === item ? "is-active" : ""} onClick={() => onChange(item)}>{item}</button>
        ))}
      </div>
    </div>
    <div className="designer-material-group">
      <span>FOREX</span>
      <div className="designer-material-row"><button type="button" className={value === "FOREX" ? "is-active" : ""} onClick={() => onChange("FOREX")}>FOREX</button></div>
    </div>
    <div className="designer-material-group">
      <span>FOLYO</span>
      <div className="designer-material-row"><button type="button" className={value === "FOLYO" ? "is-active" : ""} onClick={() => onChange("FOLYO")}>FOLYO</button></div>
    </div>
  </div>
);

export default function SignDesigner() {
  const [text, setText] = useState("REDPEN");
  const signType: SignType = "KUTU HARF";
  const [letterMaterial, setLetterMaterial] = useState<LetterMaterial>("PLEKSİ");
  const [baseMaterial, setBaseMaterial] = useState<BaseMaterial>("KOMPOZİT");
  const [letterColor, setLetterColor] = useState(letterColors[1].value);
  const [baseColor, setBaseColor] = useState("#24333b");
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(80);
  const [lighted, setLighted] = useState(true);
  const [fileliBacklight, setFileliBacklight] = useState(true);
  const [scene, setScene] = useState<SceneMode>("night");
  const [lightStripMode, setLightStripMode] = useState<LightStripMode>("none");
  const [lightStripMaterial, setLightStripMaterial] = useState<LightStripMaterial>("PLEKSİ");
  const [lightStripColor, setLightStripColor] = useState("#ffffff");
  const [logo, setLogo] = useState<string | null>(null);

  const [extraTextEnabled, setExtraTextEnabled] = useState(false);
  const [extraText, setExtraText] = useState("RETAIL SOLUTIONS");
  const [extraFont, setExtraFont] = useState<FontId>("montserrat");
  const [extraLetterHeightCm, setExtraLetterHeightCm] = useState(20);
  const [extraLetterSpacing, setExtraLetterSpacing] = useState(8);
  const [extraTextColor, setExtraTextColor] = useState("#f5f5f3");
  const [extraLetterMaterial, setExtraLetterMaterial] = useState<LetterMaterial>("FOLYO");
  const [extraOffset, setExtraOffset] = useState({ x: 0, y: 32 });

  const [selectedFont, setSelectedFont] = useState<FontId>("montserrat");
  const [fontMetricsVersion, setFontMetricsVersion] = useState(0);
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [fontSearch, setFontSearch] = useState("");
  const [letterHeightCm, setLetterHeightCm] = useState(50);
  const [letterSpacing, setLetterSpacing] = useState(-4);
  const [logoHeightCm, setLogoHeightCm] = useState(42);

  const [textOffset, setTextOffset] = useState({ x: 0, y: 0 });
  const [logoOffset, setLogoOffset] = useState({ x: 0, y: 0 });
  const [exportingPng, setExportingPng] = useState(false);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const QUOTE_LIMIT_KEY = "redpen-showroom-quote-usage-v1";
  const QUOTE_COOLDOWN_KEY = "redpen-showroom-quote-cooldown-v1";
  const MAX_DAILY_IMAGE_QUOTES = 3;
  const QUOTE_COOLDOWN_MS = 60_000;

  const getQuoteUsage = () => {
    try {
      const raw = localStorage.getItem(QUOTE_LIMIT_KEY);
      if (!raw) return { count: 0, startedAt: Date.now() };

      const parsed = JSON.parse(raw) as { count?: number; startedAt?: number };
      const startedAt = Number(parsed.startedAt) || Date.now();
      const count = Number(parsed.count) || 0;

      if (Date.now() - startedAt >= 24 * 60 * 60 * 1000) {
        const fresh = { count: 0, startedAt: Date.now() };
        localStorage.setItem(QUOTE_LIMIT_KEY, JSON.stringify(fresh));
        return fresh;
      }

      return { count, startedAt };
    } catch {
      return { count: 0, startedAt: Date.now() };
    }
  };

  const openTextOnlyWhatsApp = (extraLine?: string) => {
    const message = [
      whatsappMessage,
      extraLine ? "" : null,
      extraLine || null,
    ]
      .filter(Boolean)
      .join("\n");

    const whatsappUrl =
      `https://wa.me/905305606525?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };
  const dragRef = useRef<{
    type: DragType;
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
    boardWidth: number;
    boardHeight: number;
  } | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const facadeRef = useRef<HTMLDivElement>(null);
  const mainTextRef = useRef<HTMLElement | SVGTextElement | null>(null);
  const extraTextRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);

  const normalizedText = (text.trim() || "Markanız").slice(0, 24);
  const currentFont = fonts.find((font) => font.id === selectedFont) ?? fonts[0];
  const currentExtraFont = fonts.find((font) => font.id === extraFont) ?? fonts[0];
  const filteredFonts = fonts.filter((font) =>
    font.name.toLocaleLowerCase("tr-TR").includes(fontSearch.toLocaleLowerCase("tr-TR"))
  );
  const normalizedExtraText = (extraText.trim() || "Ek Metin").slice(0, 32);

  const mainGlyphHeightRatio = useMemo(
    () => measureGlyphHeightRatio(currentFont.family, normalizedText, 800),
    [currentFont.family, normalizedText, fontMetricsVersion]
  );

  const extraGlyphHeightRatio = useMemo(
    () => measureGlyphHeightRatio(currentExtraFont.family, normalizedExtraText, 800),
    [currentExtraFont.family, normalizedExtraText, fontMetricsVersion]
  );

  const isSolidMetalFace =
    letterMaterial === "GOLD KAPLAMA" || letterMaterial === "KROM KAPLAMA";

  const isFileliMetalFace =
    letterMaterial === "FİLELİ GOLD" || letterMaterial === "FİLELİ KROM";

  const isGoldMetal =
    letterMaterial === "GOLD KAPLAMA" || letterMaterial === "FİLELİ GOLD";

  const metalTexture = isGoldMetal
    ? "/textures/gold-reflection-strong.webp"
    : "/textures/chrome-reflection-strong.webp";

  const metalPatternId = isGoldMetal
    ? "redpen-gold-metal-pattern"
    : "redpen-chrome-metal-pattern";

  const metalHaloId = isGoldMetal
    ? "redpen-gold-halo"
    : "redpen-chrome-halo";

  const fileliInsetId = isGoldMetal
    ? "redpen-fileli-gold-inset"
    : "redpen-fileli-chrome-inset";

  const metalPatternShift = Math.max(
    -120,
    Math.min(120, textOffset.x * 3.2),
  );

  const lightingMode = useMemo(() => {
    if (letterMaterial === "FOREX" || letterMaterial === "FOLYO" || !lighted) return "off";

    if (
      letterMaterial === "GOLD KAPLAMA" ||
      letterMaterial === "KROM KAPLAMA"
    ) {
      return "backlit";
    }

    if (
      letterMaterial === "FİLELİ KROM" ||
      letterMaterial === "FİLELİ GOLD"
    ) {
      return fileliBacklight ? "dual" : "frontlit";
    }

    return "frontlit";
  }, [letterMaterial, lighted, fileliBacklight]);

  const effectiveLighted = lightingMode !== "off";

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
      "--sign-font": currentFont.family,
      "--font-size-ratio": `${(letterHeightCm / Math.max(1, height)) / mainGlyphHeightRatio}`,
      "--letter-spacing-em": `${letterSpacing / 100}em`,
      "--logo-size-ratio": `${logoHeightCm / Math.max(1, height)}`,
      "--light-strip-px": `${6 * sceneScale}px`,
      "--metal-reflect-shift": `${Math.max(-18, Math.min(18, textOffset.x * 0.28))}%`,
    } as React.CSSProperties;
  }, [
    width,
    height,
    sceneScale,
    baseColor,
    letterColor,
    currentFont.family,
    letterHeightCm,
    letterSpacing,
    logoHeightCm,
    textOffset,
  ]);

  const facadeStyle = useMemo(
    () =>
      ({
        "--board-px-width": `${Math.max(1, width) * sceneScale}px`,
        "--board-px-height": `${Math.max(1, height) * sceneScale}px`,
        "--human-px-height": `${180 * sceneScale}px`,
      }) as React.CSSProperties,
    [width, height, sceneScale]
  );

  const whatsappMessage = useMemo(() => {
    const extraTextHeightCm = Math.max(0, extraLetterHeightCm);
    const baseColorName = baseColors.find((item) => item.value.toLowerCase() === baseColor.toLowerCase())?.name ?? baseColor;
    const letterColorName = letterColors.find((item) => item.value.toLowerCase() === letterColor.toLowerCase())?.name ?? letterColor;
    const extraTextColorName = letterColors.find((item) => item.value.toLowerCase() === extraTextColor.toLowerCase())?.name ?? extraTextColor;
    const stripColorName = lightStripColors.find((item) => item.value.toLowerCase() === lightStripColor.toLowerCase())?.name ?? lightStripColor;

    const message = [
      "Merhaba Redpen Reklam, showroom üzerinden bir tabela tasarımı oluşturdum.",
      "",
      `Tabela tipi: ${signType}`,
      `Yazı: ${normalizedText}`,
      `Yazı tipi: ${currentFont.name}`,
      `Harf yüksekliği: ${letterHeightCm.toFixed(1).replace(".0", "")} cm`,
      `Logo yüksekliği: ${logo ? `${logoHeightCm.toFixed(1).replace(".0", "")} cm` : "Logo yok"}`,
      ...(extraTextEnabled ? [
        `Ek metin: ${normalizedExtraText}`,
        `Ek metin fontu: ${currentExtraFont.name}`,
        `Ek metin yüksekliği: ${extraTextHeightCm.toFixed(1).replace(".0", "")} cm`,
        `Ek metin rengi: ${extraTextColorName}`,
        `Ek metin malzemesi: ${extraLetterMaterial}`,
      ] : []),
      `Zemin malzemesi: ${baseMaterial}`,
      `Harf malzemesi: ${letterMaterial}`,
      `Ölçü: ${width} x ${height} cm`,
      `Aydınlatma: ${
        lightingMode === "backlit"
          ? "Arkadan ışıklı"
          : lightingMode === "dual"
            ? "Önden + arkadan ışıklı"
            : lightingMode === "frontlit"
              ? "Önden ışıklı"
              : "Işıksız"
      }`,
      `6 cm ışık bandı: ${lightStripModes.find((item) => item.id === lightStripMode)?.label ?? "Işık bandı yok"}`,
      ...(lightStripMode !== "none" ? [
        `Işık bandı malzemesi: ${lightStripMaterial}`,
        ...(lightStripMaterial !== "FOREX" ? [`Işık bandı ışık rengi: ${stripColorName}`] : []),
      ] : []),
      `Zemin rengi: ${baseColorName}`,
      `Harf rengi: ${letterColorName}`,
      "",
      "Bu tasarım için fiyat ve uygulama bilgisi alabilir miyim?",
    ].join("\n");

    return message;
  }, [
    signType,
    normalizedText,
    currentFont.name,
    letterHeightCm,
    letterSpacing,
    logoHeightCm,
    logo,
    extraTextEnabled,
    normalizedExtraText,
    currentExtraFont.name,
    extraLetterHeightCm,
    extraTextColor,
    extraLetterMaterial,
    baseMaterial,
    letterMaterial,
    width,
    height,
    lighted,
    fileliBacklight,
    lightingMode,
    lightStripMode,
    lightStripMaterial,
    lightStripColor,
    baseColor,
    letterColor,
  ]);


  const getDragElement = (type: DragType): Element | null => {
    if (type === "text") return mainTextRef.current;
    if (type === "extra") return extraTextRef.current;
    return logoRef.current;
  };

  const clampOffsetToCanvas = (type: DragType, next: { x: number; y: number }) => {
    const board = boardRef.current;
    const canvas = facadeRef.current;
    const element = getDragElement(type);
    if (!board || !canvas || !element) return next;

    const boardRect = board.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    if (!boardRect.width || !boardRect.height || !canvasRect.width || !canvasRect.height) return next;

    // Offset değerleri board yüzdesi olarak çiziliyor, fakat gerçek hareket sınırı
    // büyük önizleme alanı (designer-facade). Böylece yazı tabela dışına çıkabilir,
    // fakat müşterinin tasarım kanvasının dışına taşamaz.
    const current = type === "text" ? textOffset : type === "extra" ? extraOffset : logoOffset;
    let deltaXPx = ((next.x - current.x) / 100) * boardRect.width;
    let deltaYPx = ((next.y - current.y) / 100) * boardRect.height;

    let futureLeft = elementRect.left + deltaXPx;
    let futureRight = elementRect.right + deltaXPx;
    let futureTop = elementRect.top + deltaYPx;
    let futureBottom = elementRect.bottom + deltaYPx;

    if (futureLeft < canvasRect.left) deltaXPx += canvasRect.left - futureLeft;
    if (futureRight > canvasRect.right) deltaXPx -= futureRight - canvasRect.right;
    if (futureTop < canvasRect.top) deltaYPx += canvasRect.top - futureTop;
    if (futureBottom > canvasRect.bottom) deltaYPx -= futureBottom - canvasRect.bottom;

    return {
      x: current.x + (deltaXPx / boardRect.width) * 100,
      y: current.y + (deltaYPx / boardRect.height) * 100,
    };
  };

  const keepElementsInsideCanvas = () => {
    setTextOffset((value) => clampOffsetToCanvas("text", value));
    setExtraOffset((value) => clampOffsetToCanvas("extra", value));
    setLogoOffset((value) => clampOffsetToCanvas("logo", value));
  };

  useEffect(() => {
    let active = true;

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (active) setFontMetricsVersion((value) => value + 1);
      });
    }

    return () => {
      active = false;
    };
  }, [selectedFont, extraFont]);

  useEffect(() => {
    const frame = requestAnimationFrame(keepElementsInsideCanvas);
    return () => cancelAnimationFrame(frame);
  }, [letterHeightCm, letterSpacing, extraLetterHeightCm, extraLetterSpacing, logoHeightCm, mainGlyphHeightRatio, extraGlyphHeightRatio, width, height, selectedFont, extraFont, normalizedText, normalizedExtraText]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      const deltaXPercent = ((event.clientX - drag.startX) / drag.boardWidth) * 100;
      const deltaYPercent = ((event.clientY - drag.startY) / drag.boardHeight) * 100;

      const next = clampOffsetToCanvas(drag.type, {
        x: drag.startOffsetX + deltaXPercent,
        y: drag.startOffsetY + deltaYPercent,
      });

      if (drag.type === "text") {
        setTextOffset(next);
      } else if (drag.type === "extra") {
        setExtraOffset(next);
      } else {
        setLogoOffset(next);
      }
    };

    const handlePointerUp = () => {
      dragRef.current = null;
      document.body.classList.remove("designer-is-dragging");
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  const startDrag = (
    event: React.PointerEvent<HTMLElement>,
    type: DragType,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const board = event.currentTarget.closest(".designer-board");
    if (!(board instanceof HTMLElement)) return;

    const rect = board.getBoundingClientRect();
    const offset = type === "text" ? textOffset : type === "extra" ? extraOffset : logoOffset;

    dragRef.current = {
      type,
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: offset.x,
      startOffsetY: offset.y,
      boardWidth: Math.max(rect.width, 1),
      boardHeight: Math.max(rect.height, 1),
    };

    document.body.classList.add("designer-is-dragging");
  };

  const resetPositions = () => {
    setTextOffset({ x: 0, y: 0 });
    setLogoOffset({ x: 0, y: 0 });
    setExtraOffset({ x: 0, y: 32 });
  };

  const onLogo = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setLogo(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };


  const createDesignPngBlob = async () => {
    const facade = facadeRef.current;
    if (!facade) throw new Error("Önizleme alanı bulunamadı.");

    setExportingPng(true);

    try {
      if (document.fonts?.ready) await document.fonts.ready;

      const exportRoot = facade.cloneNode(true) as HTMLElement;
      exportRoot.setAttribute("data-redpen-png-clone", "true");

      const liveRect = facade.getBoundingClientRect();

      Object.assign(exportRoot.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        width: `${liveRect.width}px`,
        height: `${liveRect.height}px`,
        margin: "0",
        zIndex: "-2147483647",
        pointerEvents: "none",
        opacity: "1",
        visibility: "visible",
      });

      const removeSelectors = [
        ".designer-preview-light-controls",
        ".designer-dimension",
        ".designer-human-scale",
        ".designer-scale-readout",
        ".designer-floor-line",
        ".designer-preview-caption",
        ".designer-wall-grid",
      ];

      removeSelectors.forEach((selector) => {
        exportRoot.querySelectorAll(selector).forEach((node) => node.remove());
      });

      document.body.appendChild(exportRoot);

      try {
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        );

        // V28'de sadece board'u export etmek transform zincirini kırıp
        // görüntünün sol üst köşesini alıyordu. Bu sürümde önce TÜM preview
        // doğru haliyle rasterize ediliyor, crop işlemi sonradan canvas'ta yapılıyor.
        const rootRect = exportRoot.getBoundingClientRect();

        const cloneBoard =
          exportRoot.querySelector<HTMLElement>(".designer-board") ??
          exportRoot.querySelector<HTMLElement>("[data-designer-board]");

        if (!cloneBoard) {
          throw new Error("Tabela zemini export klonunda bulunamadı.");
        }

        const cropNodes: HTMLElement[] = [cloneBoard];
        exportRoot
          .querySelectorAll<HTMLElement>(".designer-draggable-element")
          .forEach((node) => cropNodes.push(node));

        let left = Infinity;
        let top = Infinity;
        let right = -Infinity;
        let bottom = -Infinity;

        cropNodes.forEach((node) => {
          const rect = node.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) return;
          left = Math.min(left, rect.left);
          top = Math.min(top, rect.top);
          right = Math.max(right, rect.right);
          bottom = Math.max(bottom, rect.bottom);
        });

        if (!Number.isFinite(left)) {
          throw new Error("PNG kırpma alanı hesaplanamadı.");
        }

        // Glow / box-shadow kesilmesin.
        const padding = 28;
        left = Math.max(rootRect.left, left - padding);
        top = Math.max(rootRect.top, top - padding);
        right = Math.min(rootRect.right, right + padding);
        bottom = Math.min(rootRect.bottom, bottom + padding);

        const scale = 3;

        const fullDataUrl = await domToPng(exportRoot, {
          scale,
          backgroundColor: "transparent",
          quality: 1,
          fetch: {
            requestInit: {
              cache: "force-cache",
            },
          },
          style: {
            margin: "0",
          },
        });

        const image = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error("Geçici PNG tekrar okunamadı."));
          img.src = fullDataUrl;
        });

        const sx = Math.max(0, Math.round((left - rootRect.left) * scale));
        const sy = Math.max(0, Math.round((top - rootRect.top) * scale));
        const sw = Math.max(1, Math.round((right - left) * scale));
        const sh = Math.max(1, Math.round((bottom - top) * scale));

        const cropCanvas = document.createElement("canvas");
        cropCanvas.width = Math.min(sw, image.naturalWidth - sx);
        cropCanvas.height = Math.min(sh, image.naturalHeight - sy);

        const ctx = cropCanvas.getContext("2d");
        if (!ctx) throw new Error("PNG crop canvas context açılamadı.");

        ctx.drawImage(
          image,
          sx,
          sy,
          cropCanvas.width,
          cropCanvas.height,
          0,
          0,
          cropCanvas.width,
          cropCanvas.height
        );

        // Redpen watermark: müşterinin aldığı/ilettiği görsel markalı kalsın.
        // Temiz üretim PNG'si kullanıcıya doğrudan indirtilmiyor.
        // Watermark kontrastını doğrudan render edilen PNG'den ölç.
        // Böylece tabela/zemin rengi hangi state'ten gelirse gelsin doğru logo seçilir.
        const sampleX = Math.floor(cropCanvas.width * 0.68);
        const sampleY = Math.floor(cropCanvas.height * 0.68);
        const sampleW = Math.max(1, Math.floor(cropCanvas.width * 0.30));
        const sampleH = Math.max(1, Math.floor(cropCanvas.height * 0.28));

        let useWhiteWatermark = false;

        try {
          const pixels = ctx.getImageData(sampleX, sampleY, sampleW, sampleH).data;

          let luminanceTotal = 0;
          let opaqueCount = 0;

          // Her pikseli okumak gereksiz pahalı; 4 pikselde bir örnekle.
          for (let i = 0; i < pixels.length; i += 16) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const a = pixels[i + 3];

            if (a < 40) continue;

            // Algısal luminance
            luminanceTotal += 0.2126 * r + 0.7152 * g + 0.0722 * b;
            opaqueCount += 1;
          }

          const averageLuminance =
            opaqueCount > 0 ? luminanceTotal / opaqueCount : 255;

          useWhiteWatermark = averageLuminance < 125;
        } catch (error) {
          console.warn("Watermark kontrast ölçümü yapılamadı.", error);
        }

        const watermarkSrc = useWhiteWatermark
          ? "/brand/redpen-watermark-white.png"
          : "/brand/redpen-watermark.png";

        const watermark = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error("Redpen watermark logosu yüklenemedi."));
          img.src = watermarkSrc;
        });

        const wmMaxWidth = Math.min(cropCanvas.width * 0.24, 720);
        const wmScale = wmMaxWidth / Math.max(1, watermark.naturalWidth);
        const wmWidth = watermark.naturalWidth * wmScale;
        const wmHeight = watermark.naturalHeight * wmScale;
        const wmPad = Math.max(22, cropCanvas.width * 0.018);

        ctx.save();
        ctx.globalAlpha = 0.22;
        ctx.drawImage(
          watermark,
          Math.max(wmPad, cropCanvas.width - wmWidth - wmPad),
          Math.max(wmPad, cropCanvas.height - wmHeight - wmPad),
          wmWidth,
          wmHeight
        );
        ctx.restore();

        const pngBlob = await new Promise<Blob>((resolve, reject) => {
          cropCanvas.toBlob((result) => {
            if (result) resolve(result);
            else reject(new Error("PNG blob oluşturulamadı."));
          }, "image/png", 1);
        });

        return pngBlob;
      } finally {
        exportRoot.remove();
      }
    } catch (error) {
      console.error("REDPEN PNG EXPORT ERROR V32", error);
      throw error;
    } finally {
      setExportingPng(false);
    }
  };

  const handleQuoteRequest = async () => {
    if (quoteSubmitting) return;

    const lastSentAt = Number(localStorage.getItem(QUOTE_COOLDOWN_KEY) || 0);
    const remainingMs = QUOTE_COOLDOWN_MS - (Date.now() - lastSentAt);

    if (remainingMs > 0) {
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      window.alert(
        `Yeni görselli teklif için ${remainingSeconds} saniye bekleyin. Tasarım yapmaya devam edebilirsiniz.`
      );
      return;
    }

    const usage = getQuoteUsage();

    if (usage.count >= MAX_DAILY_IMAGE_QUOTES) {
      openTextOnlyWhatsApp(
        "Not: Günlük otomatik görselli teklif sınırına ulaşıldı. Bu mesajda yeni tasarım görseli eklenmeyecektir."
      );
      return;
    }

    setQuoteSubmitting(true);

    try {
      const pngBlob = await createDesignPngBlob();

      const form = new FormData();
      form.append(
        "file",
        new File([pngBlob], `redpen-tabela-${width}x${height}.png`, {
          type: "image/png",
        })
      );

      const response = await fetch("/api/design-upload", {
        method: "POST",
        body: form,
      });

      const payload = (await response.json()) as {
        designId?: string;
        url?: string;
        error?: string;
      };

      if (!response.ok || !payload.designId || !payload.url) {
        throw new Error(payload.error || "Tasarım görseli kaydedilemedi.");
      }

      const nextUsage = {
        count: usage.count + 1,
        startedAt: usage.startedAt,
      };

      localStorage.setItem(QUOTE_LIMIT_KEY, JSON.stringify(nextUsage));
      localStorage.setItem(QUOTE_COOLDOWN_KEY, String(Date.now()));

      const message = [
        whatsappMessage,
        "",
        `Tasarım No: ${payload.designId}`,
        `Tasarım Görseli: ${payload.url}`,
        "",
        `Görselli teklif hakkı: ${nextUsage.count}/${MAX_DAILY_IMAGE_QUOTES}`,
      ].join("\n");

      const whatsappUrl =
        `https://wa.me/905305606525?text=${encodeURIComponent(message)}`;

      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("REDPEN QUOTE REQUEST ERROR", error);
      const message = error instanceof Error ? error.message : String(error);

      window.alert(
        `Tasarım görseli otomatik hazırlanamadı. ${message}\n\nTeknik teklif bilgileri WhatsApp üzerinden gönderilecek; kullanıcıdan manuel görsel eklemesi istenmeyecek.`
      );

      openTextOnlyWhatsApp(
        "Not: Tasarım görseli otomatik eklenemedi. Teknik bilgiler üzerinden teklif talebi oluşturuldu."
      );
    } finally {
      setQuoteSubmitting(false);
    }
  };

  return (
    <main className={`designer-screen mode-${scene}`}>
      <header className="designer-toolbar">
        <a href="/" className="designer-back">
          <span>←</span>
          <b>SHOWROOM</b>
        </a>

        <div className="designer-title">
          <small>REDPEN LAB / 01</small>
          <strong>TABELANI TASARLA</strong>
        </div>

        <div className="designer-mode-switch">
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
      </header>

      <div className="designer-layout">
        <aside className="designer-panel">
          <div className="designer-panel-heading">
            <p>01 / KONFİGÜRASYON</p>
            <h1>
              Kendi tabelanı
              <br />
              <em>oluştur.</em>
            </h1>
            <span>
              Zemin, harf, renk ve ölçüleri değiştir. Önizleme gerçek zamanlı güncellensin.
            </span>
          </div>

          <div className="designer-field">
            <label>MARKA / TABELA YAZISI</label>
            <input
              value={text}
              maxLength={24}
              onChange={(e) => setText(e.target.value)}
              placeholder="MARKANIZ"
            />
          </div>

          <div className="designer-field">
            <label>YAZI TİPİ</label>

            <div className={`designer-font-select ${fontMenuOpen ? "is-open" : ""}`}>
              <button
                type="button"
                className="designer-font-trigger"
                onClick={() => setFontMenuOpen((value) => !value)}
                aria-expanded={fontMenuOpen}
              >
                <span className="designer-font-trigger-name">{currentFont.name}</span>
                <strong style={{ fontFamily: currentFont.family }}>
                  {normalizedText}
                </strong>
                <i>⌄</i>
              </button>

              {fontMenuOpen && (
                <div className="designer-font-menu">
                  <div className="designer-font-search-wrap">
                    <input
                      className="designer-font-search"
                      value={fontSearch}
                      onChange={(e) => setFontSearch(e.target.value)}
                      placeholder="Font ara..."
                      autoFocus
                    />
                    <span>{filteredFonts.length} FONT</span>
                  </div>
                  <div className="designer-font-options">
                  {filteredFonts.map((font) => (
                    <button
                      type="button"
                      key={font.id}
                      className={selectedFont === font.id ? "is-active" : ""}
                      onClick={() => {
                        setSelectedFont(font.id);
                        setFontMenuOpen(false);
                      }}
                    >
                      <span>{font.name}</span>
                      <strong style={{ fontFamily: font.family }}>
                        {normalizedText}
                      </strong>
                      <i>{selectedFont === font.id ? "✓" : ""}</i>
                    </button>
                  ))}
                  {filteredFonts.length === 0 && (
                    <div className="designer-font-empty">Font bulunamadı.</div>
                  )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="designer-field designer-extra-copy-field">
            <div className="designer-extra-copy-heading">
              <div>
                <label>EK METİN / ALT BAŞLIK</label>
                <p className="designer-control-note">İş alanı, slogan, şube adı veya istediğin ikinci metni ekle.</p>
              </div>
              <button
                type="button"
                className={`designer-extra-toggle ${extraTextEnabled ? "is-active" : ""}`}
                onClick={() => setExtraTextEnabled((value) => !value)}
              >
                {extraTextEnabled ? "KALDIR" : "+ EKLE"}
              </button>
            </div>

            {extraTextEnabled && (
              <div className="designer-extra-copy-controls">
                <input
                  value={extraText}
                  maxLength={32}
                  onChange={(e) => setExtraText(e.target.value)}
                  placeholder="ÖRN. RETAIL SOLUTIONS"
                />

                <div className="designer-extra-placement">
                  <button type="button" onClick={() => setExtraOffset({ x: 0, y: -32 })}>ÜSTE AL</button>
                  <button type="button" onClick={() => setExtraOffset({ x: 0, y: 32 })}>ALTA AL</button>
                  <span>Sahnede sürükleyerek serbestçe konumlandırabilirsin.</span>
                </div>

                <div className="designer-extra-font-grid">
                  <label>EK METİN FONTU</label>
                  <select value={extraFont} onChange={(e) => setExtraFont(e.target.value as FontId)}>
                    {fonts.map((font) => (
                      <option key={`extra-font-${font.id}`} value={font.id}>{font.name}</option>
                    ))}
                  </select>
                </div>

                <div className="designer-slider-heading">
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
                />

                <div className="designer-slider-heading designer-extra-spacing-heading">
                  <label>EK METİN HARF ARALIĞI</label>
                  <b>{extraLetterSpacing > 0 ? "+" : ""}{extraLetterSpacing}</b>
                </div>
                <input
                  className="designer-range"
                  type="range"
                  min="-20"
                  max="100"
                  step="1"
                  value={extraLetterSpacing}
                  onChange={(e) => setExtraLetterSpacing(Number(e.target.value))}
                />

                <div className="designer-extra-material-control">
                  <label>EK METİN MALZEMESİ</label>
                  <p className="designer-control-note">Bu seçim yalnızca ek metni etkiler.</p>
                  <MaterialPicker value={extraLetterMaterial} onChange={setExtraLetterMaterial} compact />
                </div>

                <label className="designer-extra-color-label">EK METİN RENGİ / IŞIK RENGİ</label>
                <div className="designer-colors designer-extra-colors">
                  {letterColors.map((item) => (
                    <button
                      key={`extra-color-${item.value}`}
                      type="button"
                      className={extraTextColor === item.value ? "is-active" : ""}
                      style={{ "--swatch": item.value } as React.CSSProperties}
                      onClick={() => setExtraTextColor(item.value)}
                      aria-label={item.name}
                      title={item.name}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="designer-field designer-cm-size-field">
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
          </div>

          <div className="designer-field">
            <div className="designer-slider-heading">
              <label>HARF ARALIĞI</label>
              <b>{letterSpacing > 0 ? "+" : ""}{letterSpacing}</b>
            </div>
            <input
              className="designer-range"
              type="range"
              min="-20"
              max="100"
              step="1"
              value={letterSpacing}
              onChange={(e) => setLetterSpacing(Number(e.target.value))}
            />
            <div className="designer-range-scale">
              <span>SIKI</span>
              <span>GENİŞ</span>
            </div>
          </div>

          <div className="designer-field designer-position-field">
            <div className="designer-slider-heading">
              <label>SAHNE KONUMU</label>
              <b>SÜRÜKLE</b>
            </div>
            <p className="designer-control-note">
              Yazıyı ve logoyu sahnede fareyle tutup istediğin yere sürükleyebilirsin.
            </p>
            <button type="button" className="designer-position-reset" onClick={resetPositions}>
              KONUMU ORTALA
            </button>
          </div>

          <div className="designer-field">
            <label>ZEMİN MALZEMESİ</label>
            <div className="designer-material-row">
              {baseMaterials.map((item) => (
                <button
                  type="button"
                  key={`base-${item}`}
                  className={baseMaterial === item ? "is-active" : ""}
                  onClick={() => setBaseMaterial(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="designer-field">
            <label>ZEMİN RENGİ</label>
            <div className="designer-colors designer-colors-wide">
              {baseColors.map((item) => (
                <button
                  key={`base-color-${item.value}`}
                  type="button"
                  className={baseColor === item.value ? "is-active" : ""}
                  style={{ "--swatch": item.value } as React.CSSProperties}
                  onClick={() => setBaseColor(item.value)}
                  aria-label={`${item.code} ${item.name}`}
                  title={`${item.code} · ${item.name}`}
                />
              ))}
            </div>
          </div>

          <div className="designer-field designer-light-strip-field">
            <div className="designer-light-strip-heading">
              <div>
                <label>IŞIK BANDI / 6 CM</label>
                <p className="designer-control-note">
                  Zeminin kenarına sıfır 6 cm ışık bandı ekle. Bant tabela ölçüsüyle birlikte gerçek oranda ölçeklenir.
                </p>
              </div>
              <span className={lightStripMode === "none" ? "" : "is-active"}>
                {lightStripMode === "none" ? "KAPALI" : "AKTİF"}
              </span>
            </div>

            <div className="designer-light-strip-grid">
              {lightStripModes.map((item) => (
                <button
                  key={`light-strip-${item.id}`}
                  type="button"
                  className={lightStripMode === item.id ? "is-active" : ""}
                  onClick={() => setLightStripMode(item.id)}
                  title={item.label}
                >
                  <i className={`designer-strip-icon strip-${item.id}`} aria-hidden="true">
                    <span className="strip-top" />
                    <span className="strip-right" />
                    <span className="strip-bottom" />
                    <span className="strip-left" />
                  </i>
                  <b>{item.short}</b>
                </button>
              ))}
            </div>

            {lightStripMode !== "none" && (
              <div className="designer-light-strip-materials">
                <div className="designer-light-strip-material-heading">
                  <label>BANT MALZEMESİ</label>
                  <span>{lightStripMaterial}</span>
                </div>
                <div className="designer-material-row designer-strip-material-row">
                  {lightStripMaterials.map((item) => (
                    <button
                      type="button"
                      key={`strip-material-${item}`}
                      className={lightStripMaterial === item ? "is-active" : ""}
                      onClick={() => setLightStripMaterial(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <p className="designer-control-note designer-strip-material-note">
                  Pleksi ışığı doğrudan verir. Gold/krom kaplamalarda seçilen renk metalin çevresindeki ışık etkisine, fileli seçeneklerde ise pleksi merkeze uygulanır.
                </p>

                {lightStripMaterial !== "FOREX" && (
                  <div className="designer-strip-color-control">
                    <div className="designer-light-strip-material-heading">
                      <label>BANT IŞIK RENGİ</label>
                      <span>{lightStripColors.find((item) => item.value === lightStripColor)?.name ?? "ÖZEL"}</span>
                    </div>
                    <div className="designer-strip-color-row">
                      {lightStripColors.map((item) => (
                        <button
                          key={`strip-light-color-${item.value}`}
                          type="button"
                          className={lightStripColor === item.value ? "is-active" : ""}
                          style={{ "--strip-swatch": item.value } as React.CSSProperties}
                          onClick={() => setLightStripColor(item.value)}
                          title={item.name}
                          aria-label={`Bant ışık rengi ${item.name}`}
                        />
                      ))}
                      <label className="designer-strip-custom-color" title="Özel renk seç">
                        <input
                          type="color"
                          value={lightStripColor}
                          onChange={(event) => setLightStripColor(event.target.value)}
                        />
                        <span>ÖZEL</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="designer-field designer-letter-material-field">
            <label>HARF MALZEMESİ</label>
            <p className="designer-control-note">Ana metin için üretim tipini seç.</p>
            <MaterialPicker value={letterMaterial} onChange={setLetterMaterial} />
          </div>

          <div className="designer-field">
            <label>HARF RENGİ</label>
            <div className="designer-colors">
              {letterColors.map((item) => (
                <button
                  key={`letter-color-${item.value}`}
                  type="button"
                  className={letterColor === item.value ? "is-active" : ""}
                  style={{ "--swatch": item.value } as React.CSSProperties}
                  onClick={() => setLetterColor(item.value)}
                  aria-label={item.name}
                  title={item.name}
                />
              ))}
            </div>
          </div>

          <div className="designer-field designer-measurements">
            <div>
              <label>GENİŞLİK / CM</label>
              <input
                type="number"
                min={40}
                max={1200}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value) || 40)}
              />
            </div>
            <div>
              <label>YÜKSEKLİK / CM</label>
              <input
                type="number"
                min={20}
                max={600}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value) || 20)}
              />
            </div>
          </div>

          <div className="designer-field">
            <label>LOGO / OPSİYONEL</label>
            <input
              ref={fileRef}
              className="designer-file-input"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={(e) => onLogo(e.target.files?.[0])}
            />
            <div className="designer-upload-row">
              <button type="button" onClick={() => fileRef.current?.click()}>
                {logo ? "LOGOYU DEĞİŞTİR" : "LOGO YÜKLE"}
                <span>＋</span>
              </button>
              {logo && (
                <button
                  type="button"
                  className="designer-clear-logo"
                  onClick={() => setLogo(null)}
                >
                  KALDIR
                </button>
              )}
            </div>
            {logo && (
              <div className="designer-logo-size-control">
                <div className="designer-slider-heading">
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
                </div>
              </div>
            )}
          </div>
        </aside>

        <section className="designer-preview">
          <div className="designer-preview-top">
            <div>
              <span>CANLI ÖNİZLEME</span>
            </div>
            <div>
              <span>ÖLÇÜ</span>
              <b>{width} × {height} CM</b>
            </div>
          </div>

          <div ref={facadeRef} className="designer-facade" style={facadeStyle}>
            <div className="designer-wall-grid" />

            <div className="designer-preview-light-controls" aria-label="Aydınlatma kontrolleri">
              {letterMaterial === "FOREX" || letterMaterial === "FOLYO" ? (
                <div className="designer-preview-light-fixed">
                  <span>AYDINLATMA</span>
                  <b>IŞIKSIZ / {letterMaterial}</b>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    className={`designer-preview-light-button ${lighted ? "is-on" : ""}`}
                    onClick={() => setLighted((value) => !value)}
                    aria-pressed={lighted}
                  >
                    <span className="designer-light-icon" aria-hidden="true">☼</span>
                    <span>
                      <small>HARF IŞIĞI</small>
                      <b>{lighted ? "AÇIK" : "KAPALI"}</b>
                    </span>
                  </button>

                  {isFileliMetalFace && (
                    <button
                      type="button"
                      className={`designer-preview-light-button designer-preview-backlight-button ${lighted && fileliBacklight ? "is-on" : ""}`}
                      onClick={() => setFileliBacklight((value) => !value)}
                      aria-pressed={fileliBacklight}
                      disabled={!lighted}
                    >
                      <span className="designer-light-icon designer-backlight-icon" aria-hidden="true">◉</span>
                      <span>
                        <small>ARKA IŞIK</small>
                        <b>{fileliBacklight ? "AÇIK" : "KAPALI"}</b>
                      </span>
                    </button>
                  )}
                </>
              )}
            </div>

            <div
              ref={boardRef}
              className={`designer-board material-${baseMaterial.toLowerCase()} type-${signType
                .toLowerCase()
                .replaceAll(" ", "-")} letter-material-${materialSlug(letterMaterial)} ${effectiveLighted ? "is-lighted" : ""} lighting-${lightingMode}`}
              style={boardStyle}
            >
              <span className="designer-board-edge" aria-hidden="true" />

              {lightStripMode !== "none" && (
                <div
                  style={{
                    "--strip-light-color": lightStripColor,
                    "--strip-light-rgb": hexToRgb(lightStripColor),
                  } as React.CSSProperties}
                  className={`designer-light-strips strip-mode-${lightStripMode} strip-material-${materialSlug(lightStripMaterial)}`}
                  aria-hidden="true"
                >
                  {["top", "right", "bottom", "left"].map((side) => (
                    <span
                      key={`light-strip-${side}`}
                      className={`designer-light-strip strip-${side}`}
                      style={(lightStripMaterial === "PLEKSİ" || lightStripMaterial === "FİLELİ GOLD" || lightStripMaterial === "FİLELİ KROM")
                        ? { backgroundColor: lightStripColor }
                        : undefined}
                    />
                  ))}
                </div>
              )}

              <div className="designer-board-content">
                {logo && (
                  <img
                    ref={logoRef}
                    src={logo}
                    alt=""
                    className="designer-logo-preview designer-draggable-element"
                    onPointerDown={(event) => startDrag(event, "logo")}
                    style={{
                      left: `${50 + logoOffset.x}%`,
                      top: `${50 + logoOffset.y}%`,
                    }}
                    draggable={false}
                  />
                )}

                {isSolidMetalFace || isFileliMetalFace ? (
                  <div
                    className={`designer-metal-svg-wrap designer-draggable-element ${
                      isGoldMetal ? "is-gold" : "is-chrome"
                    }`}
                    onPointerDown={(event) => startDrag(event, "text")}
                    style={{
                      left: `${50 + textOffset.x}%`,
                      top: `${50 + textOffset.y}%`,
                    }}
                  >
                    <svg
                      className="designer-metal-svg"
                      width="100%"
                      height="100%"
                      aria-label={normalizedText}
                      role="img"
                    >
                      <defs>
                        <pattern
                          id={metalPatternId}
                          patternUnits="userSpaceOnUse"
                          width="460"
                          height="1000"
                          patternTransform={`translate(${metalPatternShift} 0)`}
                        >
                          <image
                            href={metalTexture}
                            x="-120"
                            y="0"
                            width="920"
                            height="1000"
                            preserveAspectRatio="none"
                          />
                        </pattern>

                        <filter
                          id={metalHaloId}
                          x="-70%"
                          y="-90%"
                          width="240%"
                          height="280%"
                        >
                          <feGaussianBlur stdDeviation="7.5" />
                        </filter>

                        {isFileliMetalFace && (
                          <filter
                            id={fileliInsetId}
                            x="-15%"
                            y="-20%"
                            width="130%"
                            height="140%"
                            colorInterpolationFilters="sRGB"
                          >
                            {/*
                              Stroke ile iç kontur üretmek keskin/konkav harflerde
                              sivri artefaktlar oluşturuyor. Bunun yerine glyph alpha'sını
                              birkaç px erozyona uğratıp beyaz pleksi merkezi üretiyoruz.
                              Metal yüz altta tam ölçüsünde kalıyor; beyaz merkez yalnızca
                              içeri çekiliyor. Böylece dış silüete hiçbir şey taşmıyor.
                            */}
                            <feMorphology
                              in="SourceAlpha"
                              operator="erode"
                              radius="2.35"
                              result="insetAlpha"
                            />
                            <feFlood floodColor="#ffffff" result="whiteFill" />
                            <feComposite
                              in="whiteFill"
                              in2="insetAlpha"
                              operator="in"
                            />
                          </filter>
                        )}
                      </defs>

                      {/* Arkadaki gerçek halo. Ön yüzün üstüne beyaz fill bindirmez. */}
                      <text
                        className={`designer-metal-text designer-metal-halo ${isFileliMetalFace ? "is-fileli-halo" : ""}`}
                        x="50%"
                        y="50%"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        filter={`url(#${metalHaloId})`}
                      >
                        {normalizedText}
                      </text>

                      {/* Harfin yan/derinlik hissi. */}
                      <text
                        className="designer-metal-text designer-metal-depth designer-metal-depth-far"
                        x="50%"
                        y="50%"
                        dx="7"
                        dy="9"
                        dominantBaseline="middle"
                        textAnchor="middle"
                      >
                        {normalizedText}
                      </text>

                      <text
                        className="designer-metal-text designer-metal-depth designer-metal-depth-near"
                        x="50%"
                        y="50%"
                        dx="3"
                        dy="4"
                        dominantBaseline="middle"
                        textAnchor="middle"
                      >
                        {normalizedText}
                      </text>

                      {isFileliMetalFace ? (
                        <>
                          {/*
                            Fileli harf iki gerçek yüzey gibi çizilir:
                            1) Tam glyph = gold/krom metal çerçeve.
                            2) Erode edilmiş glyph = beyaz pleksi merkez.
                            Stroke kullanılmadığı için R/P/N gibi harflerde sivri taşma oluşmaz.
                          */}
                          <text
                            ref={(node) => { mainTextRef.current = node; }}
                            className="designer-metal-text designer-fileli-metal-shell"
                            x="50%"
                            y="50%"
                            dominantBaseline="middle"
                            textAnchor="middle"
                            fill={`url(#${metalPatternId})`}
                          >
                            {normalizedText}
                          </text>
                          <text
                            className="designer-metal-text designer-fileli-plexi-core"
                            x="50%"
                            y="50%"
                            dominantBaseline="middle"
                            textAnchor="middle"
                            fill="#ffffff"
                            filter={`url(#${fileliInsetId})`}
                          >
                            {normalizedText}
                          </text>
                        </>
                      ) : (
                        /* Solid metal ön yüz: texture doğrudan SVG text fill. */
                        <text
                          ref={(node) => { mainTextRef.current = node; }}
                          className="designer-metal-text designer-metal-front"
                          x="50%"
                          y="50%"
                          dominantBaseline="middle"
                          textAnchor="middle"
                          fill={`url(#${metalPatternId})`}
                        >
                          {normalizedText}
                        </text>
                      )}
                    </svg>
                  </div>
                ) : (
                  <strong
                    ref={(node) => { mainTextRef.current = node; }}
                    className={`designer-draggable-element designer-main-text material-${materialSlug(letterMaterial)}`}
                    data-text={normalizedText}
                    onPointerDown={(event) => startDrag(event, "text")}
                    style={{
                      left: `${50 + textOffset.x}%`,
                      top: `${50 + textOffset.y}%`,
                    }}
                  >
                    {normalizedText}
                  </strong>
                )}

                {extraTextEnabled && (
                  <div
                    ref={extraTextRef}
                    className={`designer-extra-text-preview designer-draggable-element extra-material-${materialSlug(extraLetterMaterial)} ${effectiveLighted && extraLetterMaterial !== "FOREX" && extraLetterMaterial !== "FOLYO" ? "is-lighted" : ""}`}
                    data-text={normalizedExtraText}
                    onPointerDown={(event) => startDrag(event, "extra")}
                    style={{
                      left: `${50 + extraOffset.x}%`,
                      top: `${50 + extraOffset.y}%`,
                      fontFamily: currentExtraFont.family,
                      fontSize: `calc(var(--board-px-height) * ${(extraLetterHeightCm / Math.max(1, height)) / extraGlyphHeightRatio})`,
                      letterSpacing: `${extraLetterSpacing / 100}em`,
                      color: extraTextColor,
                      "--extra-letter-color": extraTextColor,
                      "--extra-base-color": baseColor,
                    } as React.CSSProperties}
                  >
                    {normalizedExtraText}
                  </div>
                )}
              </div>
              <span className="designer-board-glow" aria-hidden="true" />
            </div>

            <div className="designer-dimension designer-dimension-width">
              <i />
              <b>{width} CM</b>
            </div>
            <div className="designer-dimension designer-dimension-height">
              <i />
              <b>{height} CM</b>
            </div>

            <div className="designer-human-scale">
              <span />
              <i />
              <b>180 CM</b>
            </div>

            <div className="designer-scale-readout">
              <span>SAHNE ÖLÇEĞİ</span>
              <b>1 CM = {sceneScale.toFixed(2)} PX</b>
            </div>

            <div className="designer-floor-line" />
            <div className="designer-preview-caption">
              <span>ORAN KORUNUR / ÖLÇEKLİ ÖNİZLEME</span>
              <i />
              <span>{scene === "night" ? "GECE MODU" : "GÜNDÜZ MODU"}</span>
            </div>
          </div>

          <CostDebugPanel
            width={width}
            height={height}
            text={normalizedText}
            fontFamily={currentFont.family}
            letterHeightCm={letterHeightCm}
            letterSpacing={letterSpacing}
            letterMaterial={letterMaterial}
            baseMaterial={baseMaterial}
            lighted={lighted}
            lightStripMode={lightStripMode}
            extraTextEnabled={extraTextEnabled}
            extraText={normalizedExtraText}
            extraFontFamily={currentExtraFont.family}
            extraLetterHeightCm={extraLetterHeightCm}
            extraLetterSpacing={extraLetterSpacing}
            extraLetterMaterial={extraLetterMaterial}
            onQuote={handleQuoteRequest}
            quoteBusy={quoteSubmitting || exportingPng}
          />

          <div className="designer-summary designer-summary-compact designer-summary-three">
            <div className="designer-summary-card">
              <span>01</span>
              <p>FONT</p>
              <b>{currentFont.name}</b>
            </div>

            <div className="designer-summary-card">
              <span>02</span>
              <p>ZEMİN</p>
              <b>{baseMaterial}</b>
            </div>

            <div className="designer-summary-card">
              <span>03</span>
              <p>HARF</p>
              <b>{letterMaterial}</b>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}
