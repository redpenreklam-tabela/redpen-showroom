"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const TOTAL_PAGES = 24;
const VISIBLE_OFFSETS = [-2, -1, 0, 1, 2] as const;

function pagePath(index: number) {
  return `/catalog/pages/page-${String(index + 1).padStart(2, "0")}.webp`;
}

export default function CatalogViewer() {
  const [page, setPage] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const progress = useMemo(
    () => ((page + 1) / TOTAL_PAGES) * 100,
    [page],
  );

  const goTo = useCallback((nextPage: number) => {
    const clamped = Math.max(0, Math.min(TOTAL_PAGES - 1, nextPage));
    setPage(clamped);
  }, []);

  const goNext = useCallback(() => goTo(page + 1), [goTo, page]);
  const goPrev = useCallback(() => goTo(page - 1), [goTo, page]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        goNext();
      }

      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        goPrev();
      }

      if (event.key === "Home") {
        event.preventDefault();
        goTo(0);
      }

      if (event.key === "End") {
        event.preventDefault();
        goTo(TOTAL_PAGES - 1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev, goTo]);

  useEffect(() => {
    for (let index = Math.max(0, page - 3); index <= Math.min(TOTAL_PAGES - 1, page + 3); index += 1) {
      const image = new Image();
      image.src = pagePath(index);
    }
  }, [page]);

  const onTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartX.current;
    const dy = touch.clientY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    if (Math.abs(dx) < 46 || Math.abs(dx) < Math.abs(dy) * 1.15) return;

    if (dx < 0) goNext();
    else goPrev();
  };

  const visiblePages = VISIBLE_OFFSETS
    .map((offset) => ({ index: page + offset, offset }))
    .filter(({ index }) => index >= 0 && index < TOTAL_PAGES);

  return (
    <main className="catalog-screen">
      <div className="catalog-atmosphere" aria-hidden="true">
        <span className="catalog-grid" />
        <span className="catalog-halo catalog-halo-a" />
        <span className="catalog-halo catalog-halo-b" />
        <span className="catalog-red-beam" />
        <span className="catalog-grain" />
      </div>

      <header className="catalog-toolbar">
        <a className="catalog-back" href="/" aria-label="Showroom'a dön">
          <span>←</span>
          <b>SHOWROOM</b>
        </a>

        <div className="catalog-title">
          <small>REDPEN REKLAM &amp; TABELA</small>
          <strong>DİJİTAL KATALOG</strong>
        </div>

        <a
          className="catalog-download"
          href="/catalog/redpen-dijital-katalog.pdf"
          target="_blank"
          rel="noreferrer"
        >
          PDF
          <span>↗</span>
        </a>
      </header>

      <section
        className="catalog-showcase"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        aria-label={`Katalog sayfası ${page + 1}`}
      >
        <div className="catalog-stage-label" aria-hidden="true">
          <span>REDPEN / DIGITAL ARCHIVE</span>
          <i />
          <b>{String(page + 1).padStart(2, "0")}</b>
        </div>

        <button
          type="button"
          className="catalog-nav-arrow catalog-nav-arrow-left"
          onClick={goPrev}
          disabled={page === 0}
          aria-label="Önceki sayfa"
        >
          <span>←</span>
        </button>

        <div className="catalog-carousel">
          <div className="catalog-floor-glow" aria-hidden="true" />

          {visiblePages.map(({ index, offset }) => (
            <button
              type="button"
              key={index}
              className={`catalog-card catalog-card-${offset === 0 ? "active" : "side"} slot-${offset}`}
              onClick={() => goTo(index)}
              aria-current={offset === 0 ? "page" : undefined}
              aria-label={`Katalog sayfası ${index + 1}`}
            >
              <span className="catalog-card-frame">
                <img
                  src={pagePath(index)}
                  alt={`Redpen dijital katalog - sayfa ${index + 1}`}
                  draggable={false}
                />
                <span className="catalog-card-vignette" aria-hidden="true" />
                <span className="catalog-card-shine" aria-hidden="true" />
                <span className="catalog-card-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="catalog-nav-arrow catalog-nav-arrow-right"
          onClick={goNext}
          disabled={page === TOTAL_PAGES - 1}
          aria-label="Sonraki sayfa"
        >
          <span>→</span>
        </button>
      </section>

      <footer className="catalog-controls">
        <div className="catalog-counter">
          <strong>{String(page + 1).padStart(2, "0")}</strong>
          <span>/</span>
          <b>{String(TOTAL_PAGES).padStart(2, "0")}</b>
        </div>

        <div className="catalog-progress" aria-hidden="true">
          <i style={{ transform: `scaleX(${progress / 100})` }} />
        </div>

        <div className="catalog-hint">
          <span className="desktop-hint">YAN SAYFAYA TIKLA · ← →</span>
          <span className="mobile-hint">SAĞA / SOLA KAYDIR</span>
        </div>
      </footer>
    </main>
  );
}
