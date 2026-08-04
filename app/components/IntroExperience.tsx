 "use client";

import Image from "next/image";
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

type IntroExperienceProps = {
  children: ReactNode;
};

const INTRO_REVEAL_MS = 2100;

export default function IntroExperience({
  children,
}: IntroExperienceProps) {
  const [activated, setActivated] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const unlockTimerRef = useRef<number | null>(null);
  const scrollTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;

    // Işık açılana kadar sayfanın aşağı kaçmasını kesin olarak engelle.
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    const readyFrame = window.requestAnimationFrame(() => {
      setIntroReady(true);
    });

    return () => {
      window.cancelAnimationFrame(readyFrame);

      if (unlockTimerRef.current !== null) {
        window.clearTimeout(unlockTimerRef.current);
      }

      if (scrollTimerRef.current !== null) {
        window.clearTimeout(scrollTimerRef.current);
      }

      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
    };
  }, []);

  const activateShowroom = () => {
    if (activated) return;

    setActivated(true);

    // Önce ışık ve içerik geçişi tamamlanır, sonra scroll açılır.
    unlockTimerRef.current = window.setTimeout(() => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";

      // Kullanıcıya aşağıda devam olduğunu hissettiren daha belirgin ama yumuşak hareket.
      scrollTimerRef.current = window.setTimeout(() => {
        window.scrollBy({
          top: 300,
          left: 0,
          behavior: "smooth",
        });
      }, 120);
    }, INTRO_REVEAL_MS);
  };

  return (
    <div
      className={`rp-intro-shell ${activated ? "is-activated" : ""} ${
        introReady ? "is-ready" : ""
      }`}
    >
      <section className="rp-intro-stage" aria-label="Redpen Showroom açılışı">
        <div className="rp-intro-atmosphere" aria-hidden="true">
          <span className="rp-intro-orbit rp-intro-orbit-one" />
          <span className="rp-intro-orbit rp-intro-orbit-two" />
          <span className="rp-intro-grain" />
        </div>

        <div className="rp-intro-display">
          <div className="rp-intro-logo-wrap">
            <span className="rp-intro-logo-glow" aria-hidden="true">
              <Image
                src="/brand/redpen-logo.svg"
                alt=""
                fill
                priority
                sizes="(max-width: 900px) 92vw, 1280px"
              />
            </span>

            <Image
              className="rp-intro-logo"
              src="/brand/redpen-logo.svg"
              alt="Redpen Reklam ve Tabela"
              fill
              priority
              sizes="(max-width: 900px) 92vw, 1280px"
            />
          </div>

          <div className="rp-wallwasher" aria-hidden="true">
            <div className="rp-wallwasher-body">
              {Array.from({ length: 11 }).map((_, index) => (
                <span key={index} className="rp-wallwasher-led" />
              ))}
            </div>

            {/* Hüzme kesinlikle wallwasher'ın ALTINDAN başlar. */}
            <div className="rp-wallwasher-beam" />
          </div>
        </div>

        <div className="rp-intro-action">
          <button
            type="button"
            className="rp-light-button"
            onClick={activateShowroom}
            disabled={activated}
            aria-label="Showroom'u aydınlat"
          >
            <span className="rp-light-button-inner">
              <span className="rp-power-symbol" aria-hidden="true">
                ◉
              </span>
              <span>SHOWROOM&apos;U AYDINLAT</span>
              <span className="rp-sparkles" aria-hidden="true">
                ✦
              </span>
            </span>
          </button>

          <p className="rp-intro-hint">
            Işığı aç, üretimin detayları ortaya çıksın.
          </p>
        </div>

        <div className="rp-scroll-cue" aria-hidden="true">
          <span />
          <small>DEVAMI İÇİN AŞAĞI KAYDIR</small>
        </div>
      </section>

      <main className="rp-showroom-content">{children}</main>

      <style jsx global>{`
        :root {
          --rp-intro-bg: #050306;
          --rp-bordeaux: 132, 13, 50;
          --rp-violet: 184, 28, 48;
        }

        /* Premium mor glow scrollbar */
        html {
          scrollbar-width: thin;
          scrollbar-color: rgb(190, 34, 56) rgb(10, 7, 13);
        }

        html::-webkit-scrollbar {
          width: 14px;
        }

        html::-webkit-scrollbar-track {
          background:
            linear-gradient(
              180deg,
              rgba(105, 18, 32, 0.24),
              rgba(7, 5, 10, 0.96)
            );
          border-left: 1px solid rgba(255, 255, 255, 0.04);
        }

        html::-webkit-scrollbar-thumb {
          min-height: 72px;
          border: 3px solid transparent;
          border-radius: 999px;
          background:
            linear-gradient(
              180deg,
              rgba(255, 194, 202, 0.97),
              rgba(199, 38, 61, 1) 42%,
              rgba(111, 12, 30, 0.99)
            )
            padding-box;
          box-shadow:
            0 0 8px rgba(255, 92, 112, 0.88),
            0 0 18px rgba(191, 29, 51, 0.72),
            inset 0 1px 0 rgba(255, 255, 255, 0.72);
        }

        html::-webkit-scrollbar-thumb:hover {
          background:
            linear-gradient(
              180deg,
              rgba(255, 226, 230, 1),
              rgba(224, 55, 78, 1) 42%,
              rgba(138, 18, 37, 1)
            )
            padding-box;
          box-shadow:
            0 0 11px rgba(255, 151, 164, 0.98),
            0 0 26px rgba(218, 45, 70, 0.88),
            inset 0 1px 0 rgba(255, 255, 255, 0.82);
        }

        html::-webkit-scrollbar-thumb:active {
          background:
            linear-gradient(
              180deg,
              rgba(255, 168, 179, 1),
              rgba(150, 20, 41, 1)
            )
            padding-box;
        }

        html::-webkit-scrollbar-corner {
          background: rgb(10, 7, 13);
        }

        .rp-intro-shell {
          position: relative;
          isolation: isolate;
          background: var(--rp-intro-bg);
          color: #fff;
        }

        .rp-intro-stage {
          position: relative;
          z-index: 20;
          min-height: 100svh;
          overflow: hidden;
          display: grid;
          place-items: center;
          padding: clamp(70px, 10vh, 118px) clamp(18px, 4vw, 74px)
            clamp(88px, 12vh, 132px);
          background:
            radial-gradient(
              circle at 50% 44%,
              rgba(var(--rp-bordeaux), 0.18),
              transparent 35%
            ),
            radial-gradient(
              circle at 50% 65%,
              rgba(var(--rp-violet), 0.08),
              transparent 46%
            ),
            #050306;
        }

        .rp-intro-atmosphere,
        .rp-intro-grain {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .rp-intro-atmosphere {
          overflow: hidden;
        }

        .rp-intro-orbit {
          position: absolute;
          left: 50%;
          top: 47%;
          width: min(92vw, 1180px);
          aspect-ratio: 1;
          border: 1px solid rgba(255, 255, 255, 0.035);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.7;
        }

        .rp-intro-orbit-two {
          width: min(64vw, 820px);
          border-style: dashed;
          opacity: 0.34;
          animation: rpOrbitRotate 34s linear infinite reverse;
        }

        .rp-intro-orbit-one {
          animation: rpOrbitRotate 48s linear infinite;
        }

        .rp-intro-grain {
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.88' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");
        }

        .rp-intro-display {
          position: relative;
          z-index: 3;
          width: min(98vw, 1640px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: clamp(24px, 3.8vh, 52px);
          transform: translateY(clamp(-54px, -4vh, -18px));
        }

        .rp-intro-logo-wrap {
          position: relative;
          width: min(97vw, 1580px);
          height: clamp(240px, 31vw, 470px);
          flex: 0 0 auto;
        }

        .rp-intro-logo,
        .rp-intro-logo-glow :global(img) {
          object-fit: contain;
          object-position: center;
        }

        .rp-intro-logo {
          opacity: 0.72;
          filter: brightness(0.58) saturate(0.82);
          transform: scale(1);
          transition:
            opacity 1.45s cubic-bezier(0.16, 1, 0.3, 1),
            filter 1.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rp-intro-logo-glow {
          position: absolute;
          inset: 4%;
          opacity: 0;
          filter: blur(24px) brightness(1.8) saturate(1.2);
          transform: scale(1.015);
          transition: opacity 1.65s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
        }

        .rp-wallwasher {
          position: relative;
          width: min(88vw, 1340px);
          height: clamp(36px, 4.8vw, 62px);
          z-index: 4;
        }

        .rp-wallwasher-body {
          position: absolute;
          inset: 0;
          z-index: 5;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: space-evenly;
          padding-inline: clamp(22px, 4vw, 58px);
          background:
            linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.095),
              rgba(255, 255, 255, 0.012) 45%,
              rgba(0, 0, 0, 0.7)
            ),
            #0a090b;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.13),
            0 14px 42px rgba(0, 0, 0, 0.48);
        }

        .rp-wallwasher-led {
          width: clamp(7px, 0.78vw, 12px);
          aspect-ratio: 1;
          border-radius: 50%;
          background: #5f5757;
          box-shadow: 0 0 0 rgba(255, 242, 224, 0);
          transition:
            background 1.1s ease,
            box-shadow 1.4s ease;
        }

        .rp-wallwasher-beam {
          position: absolute;
          z-index: 1;
          top: calc(100% - 2px);
          left: 50%;
          width: 105%;
          height: clamp(250px, 35vh, 430px);
          transform: translateX(-50%) scaleY(0.015);
          transform-origin: top center;
          opacity: 0;
          clip-path: polygon(8% 0, 92% 0, 100% 100%, 0 100%);
          background: linear-gradient(
            180deg,
            rgba(255, 241, 225, 0.18) 0%,
            rgba(145, 58, 78, 0.095) 40%,
            rgba(79, 26, 65, 0.025) 78%,
            transparent 100%
          );
          filter: blur(7px);
          transition:
            transform 1.9s cubic-bezier(0.16, 1, 0.3, 1) 0.18s,
            opacity 1.45s ease 0.12s;
          pointer-events: none;
        }

        .rp-intro-action {
          position: absolute;
          z-index: 30;
          left: 50%;
          bottom: clamp(80px, 10vh, 112px);
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          transition:
            opacity 0.46s ease,
            transform 0.62s cubic-bezier(0.16, 1, 0.3, 1),
            visibility 0.46s linear;
        }

        .rp-light-button {
          position: relative;
          border: 0;
          border-radius: 999px;
          padding: 3px;
          min-width: min(90vw, 390px);
          cursor: pointer;
          color: #fff;
          background: linear-gradient(
            120deg,
            rgba(255, 128, 146, 0.96),
            rgba(190, 32, 56, 1),
            rgba(133, 15, 35, 0.99)
          );
          box-shadow:
            0 0 0 1px rgba(255, 188, 197, 0.5),
            0 0 24px rgba(225, 55, 80, 0.58),
            0 0 60px rgba(150, 20, 42, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.72);
          animation: rpButtonPulse 2.3s ease-in-out infinite;
          transition:
            transform 0.26s ease,
            filter 0.26s ease,
            box-shadow 0.26s ease;
        }

        .rp-light-button::before {
          content: "";
          position: absolute;
          inset: -7px;
          border-radius: inherit;
          border: 1px solid rgba(255, 116, 136, 0.4);
          opacity: 0.66;
          animation: rpButtonEdge 2.3s ease-in-out infinite;
          pointer-events: none;
        }

        .rp-light-button:hover {
          transform: translateY(-2px) scale(1.025);
          filter: brightness(1.09);
          box-shadow:
            0 0 0 1px rgba(255, 224, 229, 0.74),
            0 0 34px rgba(240, 73, 98, 0.74),
            0 0 84px rgba(166, 23, 47, 0.38),
            inset 0 1px 0 rgba(255, 255, 255, 0.82);
        }

        .rp-light-button-inner {
          min-height: 68px;
          border-radius: inherit;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 13px;
          padding: 0 28px;
          font-size: clamp(13px, 1.25vw, 17px);
          font-weight: 600;
          letter-spacing: 0.105em;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(255, 255, 255, 0.26),
              transparent 42%
            ),
            linear-gradient(
              180deg,
              rgba(222, 63, 86, 0.96),
              rgba(133, 17, 38, 0.95)
            );
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.48),
            inset 0 -10px 26px rgba(73, 5, 18, 0.2);
        }

        .rp-power-symbol,
        .rp-sparkles {
          font-size: 18px;
          color: #fff;
          text-shadow: 0 0 12px rgba(255, 255, 255, 0.75);
        }

        .rp-intro-hint {
          margin: 0;
          color: rgba(255, 255, 255, 0.47);
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .rp-scroll-cue {
          position: absolute;
          z-index: 7;
          bottom: 26px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 13px;
          opacity: 0;
          transition: opacity 1s ease 1.3s;
        }

        .rp-scroll-cue span {
          width: 36px;
          height: 1px;
          background: rgba(255, 255, 255, 0.38);
        }

        .rp-scroll-cue small {
          color: rgba(255, 255, 255, 0.34);
          font-size: 9px;
          letter-spacing: 0.26em;
          white-space: nowrap;
        }

        .rp-showroom-content {
          position: relative;
          z-index: 10;
          opacity: 0;
          transform: translateY(72px);
          visibility: hidden;
          transition:
            opacity 2s cubic-bezier(0.16, 1, 0.3, 1) 0.38s,
            transform 2.15s cubic-bezier(0.16, 1, 0.3, 1) 0.28s,
            visibility 0s linear 0.28s;
          will-change: opacity, transform;
        }

        .rp-intro-shell.is-activated .rp-intro-logo {
          opacity: 1;
          filter: brightness(1.22) saturate(1.08)
            drop-shadow(0 0 10px rgba(255, 255, 255, 0.16));
        }

        .rp-intro-shell.is-activated .rp-intro-logo-glow {
          opacity: 0.54;
        }

        .rp-intro-shell.is-activated .rp-wallwasher-led {
          background: #fff1dd;
          box-shadow:
            0 0 9px rgba(255, 242, 224, 0.95),
            0 0 22px rgba(255, 220, 194, 0.55);
        }

        .rp-intro-shell.is-activated .rp-wallwasher-beam {
          transform: translateX(-50%) scaleY(1);
          opacity: 0.86;
        }

        .rp-intro-shell.is-activated .rp-intro-action {
          opacity: 0;
          transform: translateX(-50%) translateY(14px) scale(0.96);
          visibility: hidden;
          pointer-events: none;
        }

        .rp-intro-shell.is-activated .rp-showroom-content {
          opacity: 1;
          transform: translateY(0);
          visibility: visible;
        }

        .rp-intro-shell.is-activated .rp-scroll-cue {
          opacity: 1;
        }

        @keyframes rpButtonPulse {
          0%,
          100% {
            box-shadow:
              0 0 0 1px rgba(255, 188, 197, 0.5),
              0 0 24px rgba(225, 55, 80, 0.58),
              0 0 60px rgba(150, 20, 42, 0.28),
              inset 0 1px 0 rgba(255, 255, 255, 0.72);
          }
          50% {
            box-shadow:
              0 0 0 1px rgba(255, 219, 224, 0.68),
              0 0 34px rgba(238, 69, 95, 0.76),
              0 0 78px rgba(170, 26, 50, 0.36),
              inset 0 1px 0 rgba(255, 255, 255, 0.82);
          }
        }

        @keyframes rpButtonEdge {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.38;
          }
          50% {
            transform: scale(1.035);
            opacity: 0.78;
          }
        }

        @keyframes rpOrbitRotate {
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @media (max-width: 720px) {
          .rp-intro-stage {
            padding-inline: 14px;
          }

          .rp-intro-display {
            width: 100%;
            gap: 44px;
            transform: translateY(-34px);
          }

          .rp-intro-logo-wrap {
            width: 99vw;
            height: clamp(180px, 40vw, 280px);
          }

          .rp-wallwasher {
            width: 95vw;
          }

          .rp-light-button {
            min-width: min(92vw, 360px);
          }

          .rp-light-button-inner {
            min-height: 64px;
            padding-inline: 20px;
            font-size: 12px;
          }

          .rp-intro-hint {
            max-width: 88vw;
            text-align: center;
            line-height: 1.7;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .rp-intro-orbit,
          .rp-light-button,
          .rp-light-button::before {
            animation: none !important;
          }

          .rp-intro-logo,
          .rp-intro-logo-glow,
          .rp-wallwasher-led,
          .rp-wallwasher-beam,
          .rp-intro-action,
          .rp-showroom-content {
            transition-duration: 0.35s !important;
            transition-delay: 0s !important;
          }
        }
      `}</style>
    </div>
  );
}
