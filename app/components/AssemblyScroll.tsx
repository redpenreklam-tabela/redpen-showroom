"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";

const DESKTOP_VIDEO_PATH = "/videos/tabela-assembly.webm";
const MOBILE_VIDEO_PATH = "/videos/tabela-assembly-mobile.mp4";

const stages = [
  { no: "01", title: "TAŞIYICI PROFİL", text: "Ölçülendirilmiş metal iskelet, sistemin taşıyıcı geometrisini kurar.", specs: ["ALÜMİNYUM PROFİL", "MİLİMETRİK KESİM", "TAŞIYICI SİSTEM"] },
  { no: "02", title: "KOMPOZİT YÜZEY", text: "Panel profile yaklaşır; kenarlar kontrollü biçimde katlanarak gövdeyi kapatır.", specs: ["3 MM KOMPOZİT", "CNC KESİM", "KENAR KATLAMA"] },
  { no: "03", title: "MEKANİK SABİTLEME", text: "Bağlantılar ve vidalar katmanları tek bir rijit gövdede kilitler.", specs: ["MEKANİK BAĞLANTI", "GİZLİ SABİTLEME", "HASSAS MONTAJ"] },
  { no: "04", title: "LED AYDINLATMA", text: "Enerji hattı ve LED modülleri homojen ışık dağılımı için yerleşir.", specs: ["LED MODÜL", "DÜŞÜK TÜKETİM", "HOMOJEN IŞIK"] },
  { no: "05", title: "KUTU HARF", text: "Son yüzey yerine oturur; hacim, malzeme ve ışık tek bir marka imzasına dönüşür.", specs: ["PLEKSİ YÜZEY", "KUTU HARF", "FİNAL KONTROL"] },
];

export default function AssemblyScroll() {
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
  const [videoPath, setVideoPath] = useState(DESKTOP_VIDEO_PATH);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 780px)").matches;
    setVideoPath(mobile ? MOBILE_VIDEO_PATH : DESKTOP_VIDEO_PATH);
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    const mobile = window.matchMedia("(max-width: 780px)").matches;
    const tablet = window.matchMedia("(max-width: 1100px)").matches;
    const seekFps = mobile ? 12 : tablet ? 18 : 30;
    const frameDuration = 1 / seekFps;
    const percentStep = mobile ? 2 : 1;

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

        const rawPercent = Math.round(progress * 100);
        const nextPercent =
          rawPercent >= 100
            ? 100
            : Math.round(rawPercent / percentStep) * percentStep;

        if (nextPercent !== lastPercent) {
          lastPercent = nextPercent;
          setPercent(nextPercent);
        }
      },
    });

    const tick = (now: number) => {
      if (!visibleRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const duration = durationRef.current;

      if (duration > 0) {
        const target = Math.min(
          duration,
          Math.max(0, targetTimeRef.current),
        );

        const delta = target - playheadRef.current;
        playheadRef.current += delta * (Math.abs(delta) > 0.8 ? 0.28 : 0.12);

        const frameTime =
          Math.round(playheadRef.current * seekFps) / seekFps;

        const enoughTimePassed =
          now - lastSeekAtRef.current >= 1000 / seekFps;

        const needsFrame =
          Math.abs(video.currentTime - frameTime) >= frameDuration * 0.9;

        if (enoughTimePassed && needsFrame && !video.seeking) {
          lastSeekAtRef.current = now;
          video.currentTime = Math.min(
            Math.max(frameTime, 0.001),
            Math.max(0.001, duration - 0.001),
          );
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;

        if (entry.isIntersecting && rafRef.current === null) {
          rafRef.current = requestAnimationFrame(tick);
        }
      },
      { rootMargin: "30% 0px 30% 0px", threshold: 0.01 },
    );

    observer.observe(section);
    rafRef.current = requestAnimationFrame(tick);

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

    video.addEventListener("loadedmetadata", onMetadata);
    video.addEventListener("canplay", onCanPlay);

    if (video.readyState >= 1) {
      void onMetadata();
    }

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
  }, [videoPath]);

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
            key={videoPath}
            ref={videoRef}
            className="assembly-video"
            src={videoPath}
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
