"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";

const DESKTOP_VIDEO_PATH = "/videos/tabela-assembly.webm";
const DESKTOP_VIDEO_FPS = 30;
const DESKTOP_FRAME_DURATION = 1 / DESKTOP_VIDEO_FPS;

const stages = [
  {
    no: "01",
    title: "TAŞIYICI PROFİL",
    text: "Ölçülendirilmiş metal iskelet, sistemin taşıyıcı geometrisini kurar.",
    specs: ["ALÜMİNYUM PROFİL", "MİLİMETRİK KESİM", "TAŞIYICI SİSTEM"],
    clip: "/videos/assembly-stages/01-profil.webm",
  },
  {
    no: "02",
    title: "KOMPOZİT YÜZEY",
    text: "Panel profile yaklaşır; kenarlar kontrollü biçimde katlanarak gövdeyi kapatır.",
    specs: ["3 MM KOMPOZİT", "CNC KESİM", "KENAR KATLAMA"],
    clip: "/videos/assembly-stages/02-kompozit.webm",
  },
  {
    no: "03",
    title: "FOREX KATMANI",
    text: "İç yüzey katmanları kontrollü biçimde yerleşerek gövdeyi tamamlar.",
    specs: ["FOREX YÜZEY", "HASSAS KESİM", "KATMANLI MONTAJ"],
    clip: "/videos/assembly-stages/03-forex.webm",
  },
  {
    no: "04",
    title: "LED AYDINLATMA",
    text: "Enerji hattı ve LED modülleri homojen ışık dağılımı için yerleşir.",
    specs: ["LED MODÜL", "DÜŞÜK TÜKETİM", "HOMOJEN IŞIK"],
    clip: "/videos/assembly-stages/04-led.webm",
  },
  {
    no: "05",
    title: "KUTU HARF",
    text: "Son yüzey yerine oturur; hacim, malzeme ve ışık tek bir marka imzasına dönüşür.",
    specs: ["PLEKSİ YÜZEY", "KUTU HARF", "FİNAL KONTROL"],
    clip: "/videos/assembly-stages/05-harf.webm",
  },
];

function isTouchMobileDevice() {
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(hover: none)").matches ||
    navigator.maxTouchPoints > 0 ||
    window.innerWidth <= 1100
  );
}

function MobileAssemblyStages() {
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    cardRefs.current.forEach((card, index) => {
      const video = videoRefs.current[index];
      if (!card || !video) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.58) {
            video.currentTime = 0;
            void video.play().catch(() => undefined);
          } else {
            video.pause();
          }
        },
        {
          threshold: [0, 0.25, 0.58, 0.8],
          rootMargin: "-8% 0px -8% 0px",
        },
      );

      observer.observe(card);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
      videoRefs.current.forEach((video) => video?.pause());
    };
  }, []);

  return (
    <section
      className="assembly-mobile-stages"
      data-ambient="assembly"
      aria-label="Tabela üretim aşamaları"
    >
      <header className="assembly-mobile-header">
        <p className="section-kicker">ÜRETİMİN KATMANLARI</p>
        <h2>PARÇA PARÇA<br />MARKAYA</h2>
        <p>
          Her aşama görünür olduğunda kendi animasyonu bir kez oynar.
        </p>
      </header>

      <div className="assembly-mobile-stage-list">
        {stages.map((stage, index) => (
          <article
            key={stage.no}
            ref={(element) => {
              cardRefs.current[index] = element;
            }}
            className="assembly-mobile-stage"
          >
            <div className="assembly-mobile-stage-visual" aria-hidden="true">
              <video
                ref={(element) => {
                  videoRefs.current[index] = element;
                }}
                src={stage.clip}
                muted
                playsInline
                preload={index < 2 ? "auto" : "metadata"}
                disablePictureInPicture
                tabIndex={-1}
              />
              <span>{stage.no}</span>
            </div>

            <div className="assembly-mobile-stage-copy">
              <p>{stage.no} / 05</p>
              <h3>{stage.title}</h3>
              <div>{stage.text}</div>
              <ul>
                {stage.specs.map((spec) => (
                  <li key={spec}>{spec}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DesktopAssemblyScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const durationRef = useRef(0);
  const targetTimeRef = useRef(0);
  const playheadRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastSeekAtRef = useRef(0);
  const visibleRef = useRef(false);

  const [activeStage, setActiveStage] = useState(0);
  const [percent, setPercent] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    video.pause();

    let lastStage = -1;
    let lastPercent = -1;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = Math.min(1, Math.max(0, self.progress));
        targetTimeRef.current = progress * durationRef.current;

        const nextStage = Math.min(
          stages.length - 1,
          Math.floor(progress * stages.length),
        );

        if (nextStage !== lastStage) {
          lastStage = nextStage;
          setActiveStage(nextStage);
        }

        const nextPercent = Math.round(progress * 100);

        if (nextPercent !== lastPercent) {
          lastPercent = nextPercent;
          setPercent(nextPercent);
        }
      },
    });

    const tick = (now: number) => {
      if (visibleRef.current) {
        const duration = durationRef.current;

        if (duration > 0) {
          const target = Math.min(duration, Math.max(0, targetTimeRef.current));
          const delta = target - playheadRef.current;

          playheadRef.current += delta * (Math.abs(delta) > 0.8 ? 0.34 : 0.16);

          const frameTime =
            Math.round(playheadRef.current * DESKTOP_VIDEO_FPS) /
            DESKTOP_VIDEO_FPS;

          const enoughTimePassed =
            now - lastSeekAtRef.current >= 1000 / DESKTOP_VIDEO_FPS;

          const needsFrame =
            Math.abs(video.currentTime - frameTime) >=
            DESKTOP_FRAME_DURATION * 0.72;

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

    const onMetadata = async () => {
      durationRef.current = Math.max(video.duration || 0, 0);

      const initialTime = trigger.progress * durationRef.current;
      targetTimeRef.current = initialTime;
      playheadRef.current = initialTime;

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

    observer.observe(section);
    rafRef.current = requestAnimationFrame(tick);

    video.addEventListener("loadedmetadata", onMetadata);
    video.addEventListener("canplay", onCanPlay);

    if (video.readyState >= 1) void onMetadata();

    return () => {
      trigger.kill();
      observer.disconnect();

      video.removeEventListener("loadedmetadata", onMetadata);
      video.removeEventListener("canplay", onCanPlay);

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  const stage = stages[activeStage];

  return (
    <section
      ref={sectionRef}
      className="assembly-scroll"
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

export default function AssemblyScroll() {
  const [mobileMode, setMobileMode] = useState<boolean | null>(null);

  useEffect(() => {
    setMobileMode(isTouchMobileDevice());
  }, []);

  if (mobileMode === null) {
    return <section className="assembly-mobile-placeholder" aria-hidden="true" />;
  }

  return mobileMode ? <MobileAssemblyStages /> : <DesktopAssemblyScroll />;
}
