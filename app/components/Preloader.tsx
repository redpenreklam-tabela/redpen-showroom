"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let raf = 0;
    const startedAt = performance.now();
    const duration = 1450;

    const tick = (now: number) => {
      const elapsed = now - startedAt;
      const next = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(next);
      if (next < 100) raf = requestAnimationFrame(tick);
      else window.setTimeout(() => setHidden(true), 360);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (hidden) return null;

  return (
    <div className={`site-preloader${progress === 100 ? " is-complete" : ""}`} aria-live="polite">
      <div className="preloader-mark">R</div>
      <p>REDPEN SHOWCASE</p>
      <div className="preloader-track"><i style={{ transform: `scaleX(${progress / 100})` }} /></div>
      <span>{String(progress).padStart(3, "0")}%</span>
    </div>
  );
}
