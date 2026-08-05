"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";

const DESKTOP_VIDEO_PATH = "/videos/tabela-assembly.webm";
const MOBILE_FORWARD_PATH = "/videos/tabela-assembly-mobile.mp4";
const MOBILE_REVERSE_PATH = "/videos/tabela-assembly-mobile-reverse.mp4";

const DESKTOP_VIDEO_FPS = 30;
const DESKTOP_FRAME_DURATION = 1 / DESKTOP_VIDEO_FPS;

const stages = [
  {
    no: "01",
    title: "TAŞIYICI PROFİL",
    text: "Ölçülendirilmiş metal iskelet, sistemin taşıyıcı geometrisini kurar.",
    specs: ["ALÜMİNYUM PROFİL", "MİLİMETRİK KESİM", "TAŞIYICI SİSTEM"],
  },
  {
    no: "02",
    title: "KOMPOZİT YÜZEY",
    text: "Panel profile yaklaşır; kenarlar kontrollü biçimde katlanarak gövdeyi kapatır.",
    specs: ["3 MM KOMPOZİT", "CNC KESİM", "KENAR KATLAMA"],
  },
  {
    no: "03",
    title: "MEKANİK SABİTLEME",
    text: "Bağlantılar ve vidalar katmanları tek bir rijit gövdede kilitler.",
    specs: ["MEKANİK BAĞLANTI", "GİZLİ SABİTLEME", "HASSAS MONTAJ"],
  },
  {
    no: "04",
    title: "LED AYDINLATMA",
    text: "Enerji hattı ve LED modülleri homojen ışık dağılımı için yerleşir.",
    specs: ["LED MODÜL", "DÜŞÜK TÜKETİM", "HOMOJEN IŞIK"],
  },
  {
    no: "05",
    title: "KUTU HARF",
    text: "Son yüzey yerine oturur; hacim, malzeme ve ışık tek bir marka imzasına dönüşür.",
    specs: ["PLEKSİ YÜZEY", "KUTU HARF", "FİNAL KONTROL"],
  },
];

export default function AssemblyScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const forwardVideoRef = useRef<HTMLVideoElement>(null);
  const reverseVideoRef = useRef<HTMLVideoElement>(null);

  const durationRef = useRef(0);
  const targetTimeRef = useRef(0);
  const playheadRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastSeekAtRef = useRef(0);
  const visibleRef = useRef(false);
  const directionRef = useRef<"forward" | "reverse">("forward");

  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [activeStage, setActiveStage] = useState(0);
  const [percent, setPercent] = useState(0);
  const [ready, setReady] = useState(false);
  const [mobileDirection, setMobileDirection] =
    useState<"forward" | "reverse">("forward");

  useEffect(() => {
    setIsMobile(window.matchMedia("(max-width: 780px)").matches);
  }, []);

  useEffect(() => {
    if (isMobile === null) return;

    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    if (!section) return;

    setReady(false);

    if (isMobile) {
      const forward = forwardVideoRef.current;
      const reverse = reverseVideoRef.current;
      if (!forward || !reverse) return;

      let lastStage = -1;
      let lastPercent = -1;
      let uiRaf: number | null = null;

      const getActiveVideo = () =>
        directionRef.current === "forward" ? forward : reverse;

      const syncUi = () => {
        const active = getActiveVideo();
        const duration = Number.isFinite(active.duration) ? active.duration : 0;

        if (duration > 0) {
          const localProgress = Math.min(
            1,
            Math.max(0, active.currentTime / duration),
          );

          const progress =
            directionRef.current === "forward"
              ? localProgress
              : 1 - localProgress;

          const nextStage = Math.min(
            stages.length - 1,
            Math.floor(progress * stages.length),
          );

          const nextPercent = Math.round(progress * 100);

          if (nextStage !== lastStage) {
            lastStage = nextStage;
            setActiveStage(nextStage);
          }

          if (nextPercent !== lastPercent) {
            lastPercent = nextPercent;
            setPercent(nextPercent);
          }
        }

        uiRaf = requestAnimationFrame(syncUi);
      };

      const playDirection = async (direction: "forward" | "reverse") => {
        directionRef.current = direction;
        setMobileDirection(direction);

        const active = direction === "forward" ? forward : reverse;
        const inactive = direction === "forward" ? reverse : forward;

        inactive.pause();
        active.currentTime = 0;

        if (!visibleRef.current) return;

        try {
          await active.play();
        } catch {
          // muted + playsInline ile normalde oynar; tarayıcı engellerse görünürlük değişiminde tekrar denenir.
        }
      };

      const handleForwardEnd = () => {
        void playDirection("reverse");
      };

      const handleReverseEnd = () => {
        void playDirection("forward");
      };

      const markReady = () => {
        if (forward.readyState >= 2 && reverse.readyState >= 2) {
          setReady(true);
        }
      };

      const observer = new IntersectionObserver(
        ([entry]) => {
          visibleRef.current =
            entry.isIntersecting && entry.intersectionRatio >= 0.22;

          if (visibleRef.current) {
            const active = getActiveVideo();
            void active.play().catch(() => undefined);
          } else {
            forward.pause();
            reverse.pause();
          }
        },
        {
          threshold: [0, 0.22, 0.5, 0.8],
          rootMargin: "-5% 0px -5% 0px",
        },
      );

      forward.addEventListener("ended", handleForwardEnd);
      reverse.addEventListener("ended", handleReverseEnd);
      forward.addEventListener("canplay", markReady);
      reverse.addEventListener("canplay", markReady);

      observer.observe(section);
      markReady();
      uiRaf = requestAnimationFrame(syncUi);

      return () => {
        observer.disconnect();
        forward.pause();
        reverse.pause();

        forward.removeEventListener("ended", handleForwardEnd);
        reverse.removeEventListener("ended", handleReverseEnd);
        forward.removeEventListener("canplay", markReady);
        reverse.removeEventListener("canplay", markReady);

        if (uiRaf !== null) cancelAnimationFrame(uiRaf);
      };
    }

    const video = desktopVideoRef.current;
    if (!video) return;

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
          const target = Math.min(
            duration,
            Math.max(0, targetTimeRef.current),
          );

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
      {
        rootMargin: "25% 0px 25% 0px",
        threshold: 0.01,
      },
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
  }, [isMobile]);

  const stage = stages[activeStage];

  return (
    <section
      ref={sectionRef}
      className={`assembly-scroll${
        isMobile ? " is-mobile-pingpong" : ""
      }`}
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
          {isMobile === true && (
            <>
              <video
                ref={forwardVideoRef}
                className={`assembly-video assembly-mobile-layer${
                  mobileDirection === "forward" ? " is-active" : ""
                }`}
                src={MOBILE_FORWARD_PATH}
                muted
                playsInline
                preload="auto"
                disablePictureInPicture
                tabIndex={-1}
              />

              <video
                ref={reverseVideoRef}
                className={`assembly-video assembly-mobile-layer${
                  mobileDirection === "reverse" ? " is-active" : ""
                }`}
                src={MOBILE_REVERSE_PATH}
                muted
                playsInline
                preload="auto"
                disablePictureInPicture
                tabIndex={-1}
              />
            </>
          )}

          {isMobile === false && (
            <video
              ref={desktopVideoRef}
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
