"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";

const DESKTOP_VIDEO_PATH = "/videos/tabela-assembly.webm";
const MOBILE_FRAME_COUNT = 107;
const MOBILE_FRAME_PATH = (index: number) =>
  `/frames/assembly-mobile/frame-${String(index).padStart(3, "0")}.webp`;

const stages = [
  { no: "01", title: "TAŞIYICI PROFİL", text: "Ölçülendirilmiş metal iskelet, sistemin taşıyıcı geometrisini kurar.", specs: ["ALÜMİNYUM PROFİL", "MİLİMETRİK KESİM", "TAŞIYICI SİSTEM"] },
  { no: "02", title: "KOMPOZİT YÜZEY", text: "Panel profile yaklaşır; kenarlar kontrollü biçimde katlanarak gövdeyi kapatır.", specs: ["3 MM KOMPOZİT", "CNC KESİM", "KENAR KATLAMA"] },
  { no: "03", title: "MEKANİK SABİTLEME", text: "Bağlantılar ve vidalar katmanları tek bir rijit gövdede kilitler.", specs: ["MEKANİK BAĞLANTI", "GİZLİ SABİTLEME", "HASSAS MONTAJ"] },
  { no: "04", title: "LED AYDINLATMA", text: "Enerji hattı ve LED modülleri homojen ışık dağılımı için yerleşir.", specs: ["LED MODÜL", "DÜŞÜK TÜKETİM", "HOMOJEN IŞIK"] },
  { no: "05", title: "KUTU HARF", text: "Son yüzey yerine oturur; hacim, malzeme ve ışık tek bir marka imzasına dönüşür.", specs: ["PLEKSİ YÜZEY", "KUTU HARF", "FİNAL KONTROL"] },
];

function drawContain(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
) {
  const canvasWidth = canvas.clientWidth;
  const canvasHeight = canvas.clientHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const pixelWidth = Math.max(1, Math.round(canvasWidth * dpr));
  const pixelHeight = Math.max(1, Math.round(canvasHeight * dpr));

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }

  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, canvasWidth, canvasHeight);

  const imageRatio = image.naturalWidth / image.naturalHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let width = canvasWidth;
  let height = canvasHeight;

  if (imageRatio > canvasRatio) {
    height = width / imageRatio;
  } else {
    width = height * imageRatio;
  }

  const x = (canvasWidth - width) / 2;
  const y = (canvasHeight - height) / 2;

  context.drawImage(image, x, y, width, height);
}

export default function AssemblyScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameImagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const durationRef = useRef(0);
  const targetTimeRef = useRef(0);
  const playheadRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastSeekAtRef = useRef(0);
  const visibleRef = useRef(false);

  const [isMobile, setIsMobile] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const [percent, setPercent] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIsMobile(window.matchMedia("(max-width: 780px)").matches);
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    if (!section) return;

    let lastStage = -1;
    let lastPercent = -1;

    const drawFrame = (index: number) => {
      const canvas = canvasRef.current;
      const image = frameImagesRef.current[index];
      if (!canvas || !image || !image.complete) return;

      const context = canvas.getContext("2d", {
        alpha: true,
        desynchronized: true,
      });

      if (!context) return;

      drawContain(context, image, canvas);
      currentFrameRef.current = index;
    };

    if (isMobile) {
      let loadedFrames = 0;
      const images = Array.from({ length: MOBILE_FRAME_COUNT }, (_, index) => {
        const image = new Image();
        image.decoding = "async";
        image.src = MOBILE_FRAME_PATH(index + 1);

        image.onload = () => {
          loadedFrames += 1;

          if (index === 0) {
            drawFrame(0);
          }

          if (loadedFrames >= Math.min(8, MOBILE_FRAME_COUNT)) {
            setReady(true);
          }
        };

        return image;
      });

      frameImagesRef.current = images;
    } else {
      const video = videoRef.current;

      if (video) {
        video.pause();

        const onMetadata = async () => {
          durationRef.current = Math.max(video.duration || 0, 0);

          try {
            video.currentTime = 0.001;
            await video.play();
            video.pause();
          } catch {
            video.pause();
          }

          setReady(true);
          ScrollTrigger.refresh();
        };

        const onCanPlay = () => setReady(true);

        video.addEventListener("loadedmetadata", onMetadata);
        video.addEventListener("canplay", onCanPlay);

        if (video.readyState >= 1) {
          void onMetadata();
        }

        return () => {
          video.removeEventListener("loadedmetadata", onMetadata);
          video.removeEventListener("canplay", onCanPlay);
        };
      }
    }

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = Math.min(1, Math.max(0, self.progress));

        const nextStage = Math.min(
          stages.length - 1,
          Math.floor(progress * stages.length),
        );

        if (nextStage !== lastStage) {
          lastStage = nextStage;
          setActiveStage(nextStage);
        }

        const rawPercent = Math.round(progress * 100);
        const nextPercent = isMobile
          ? rawPercent >= 100
            ? 100
            : Math.round(rawPercent / 2) * 2
          : rawPercent;

        if (nextPercent !== lastPercent) {
          lastPercent = nextPercent;
          setPercent(nextPercent);
        }

        if (isMobile) {
          const nextFrame = Math.min(
            MOBILE_FRAME_COUNT - 1,
            Math.round(progress * (MOBILE_FRAME_COUNT - 1)),
          );

          if (nextFrame !== currentFrameRef.current) {
            drawFrame(nextFrame);
          }
        } else {
          targetTimeRef.current = progress * durationRef.current;
        }
      },
    });

    const tick = (now: number) => {
      if (!isMobile && visibleRef.current) {
        const video = videoRef.current;
        const duration = durationRef.current;

        if (video && duration > 0) {
          const target = Math.min(
            duration,
            Math.max(0, targetTimeRef.current),
          );

          const delta = target - playheadRef.current;
          playheadRef.current += delta * (Math.abs(delta) > 0.8 ? 0.34 : 0.16);

          const frameTime = Math.round(playheadRef.current * 30) / 30;
          const enoughTimePassed = now - lastSeekAtRef.current >= 1000 / 30;
          const needsFrame =
            Math.abs(video.currentTime - frameTime) >= (1 / 30) * 0.72;

          if (enoughTimePassed && needsFrame && !video.seeking) {
            lastSeekAtRef.current = now;
            video.currentTime = Math.min(
              Math.max(frameTime, 0.001),
              Math.max(0.001, duration - 0.001),
            );
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { rootMargin: "25% 0px 25% 0px", threshold: 0.01 },
    );

    observer.observe(section);
    rafRef.current = requestAnimationFrame(tick);

    const onResize = () => {
      if (isMobile) {
        drawFrame(currentFrameRef.current);
      }
    };

    window.addEventListener("resize", onResize);

    return () => {
      trigger.kill();
      observer.disconnect();
      window.removeEventListener("resize", onResize);

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      frameImagesRef.current = [];
    };
  }, [isMobile]);

  const stage = stages[activeStage];

  return (
    <section
      ref={sectionRef}
      className={`assembly-scroll${isMobile ? " is-frame-sequence" : ""}`}
      data-ambient="assembly"
      aria-label="Tabela üretim animasyonu"
    >
      <div className={`assembly-sticky stage-${activeStage + 1}`}>
        <div className="assembly-background" aria-hidden="true">
          <div className="assembly-grid-lines" />
          <div className="assembly-orbit assembly-orbit-a" />
          <div className="assembly-orbit assembly-orbit-b" />
          <div className="assembly-energy-line" />
          <div
            className="assembly-scanline"
            style={{ transform: `translateY(${percent - 50}%)` }}
          />
          <div className="assembly-grain" />
        </div>

        <div
          className={`assembly-video-shell${ready ? " is-ready" : ""}`}
          aria-hidden="true"
        >
          {isMobile ? (
            <canvas
              ref={canvasRef}
              className="assembly-video assembly-frame-canvas"
            />
          ) : (
            <video
              ref={videoRef}
              className="assembly-video"
              src={DESKTOP_VIDEO_PATH}
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              tabIndex={-1}
            />
          )}

          {!ready && (
            <div className="assembly-video-loader">SAHNE YÜKLENİYOR</div>
          )}
        </div>

        <div className="assembly-copy">
          <p className="section-kicker">ÜRETİMİN KATMANLARI</p>

          <div className="assembly-stage-copy" key={activeStage}>
            <span>{stage.no}</span>
            <h2>{stage.title}</h2>
            <p>{stage.text}</p>
            <ul>
              {stage.specs.map((spec) => (
                <li key={spec}>{spec}</li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="assembly-callout"
          key={`callout-${activeStage}`}
          aria-hidden="true"
        >
          <i />
          <span>{stage.specs[0]}</span>
        </div>

        <div className="assembly-progress" aria-hidden="true">
          <span>{String(percent).padStart(2, "0")}</span>
          <div>
            <i style={{ transform: `scaleX(${percent / 100})` }} />
          </div>
          <b>100</b>
        </div>

        <div className="assembly-stage-list" aria-hidden="true">
          {stages.map((item, index) => (
            <span
              className={index === activeStage ? "is-active" : ""}
              key={item.no}
            >
              {item.no} · {item.title}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
