"use client";

import { useEffect, useRef } from "react";

const fallbackTheme = "showcase";

export default function GlobalAmbient() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ambient = rootRef.current;
    if (!ambient) return;

    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-ambient]"));
    let frame = 0;

    const updateTheme = () => {
      frame = 0;
      const viewportCenter = window.innerHeight * 0.5;
      let closest: HTMLElement | null = null;
      let closestDistance = Number.POSITIVE_INFINITY;

      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
        const sectionCenter = Math.max(rect.top, 0) + Math.min(rect.bottom, window.innerHeight);
        const distance = Math.abs(sectionCenter * 0.5 - viewportCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = section;
        }
      }

      ambient.dataset.theme = closest?.dataset.ambient || fallbackTheme;
      ambient.style.setProperty("--ambient-scroll", `${window.scrollY * 0.035}px`);
    };

    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(updateTheme);
    };

    const onPointerMove = (event: PointerEvent) => {
      const x = event.clientX / Math.max(window.innerWidth, 1) - 0.5;
      const y = event.clientY / Math.max(window.innerHeight, 1) - 0.5;
      ambient.style.setProperty("--ambient-px", `${x * 26}px`);
      ambient.style.setProperty("--ambient-py", `${y * 20}px`);
    };

    updateTheme();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <div ref={rootRef} className="global-ambient" data-theme={fallbackTheme} aria-hidden="true">
      <div className="global-ambient-color" />
      <div className="global-ambient-glow global-ambient-glow-a" />
      <div className="global-ambient-glow global-ambient-glow-b" />
      <div className="global-ambient-grid" />
      <div className="global-ambient-orbit global-ambient-orbit-a" />
      <div className="global-ambient-orbit global-ambient-orbit-b" />
      <div className="global-ambient-scan" />
      <div className="global-ambient-grain" />
      <div className="global-ambient-vignette" />
    </div>
  );
}
