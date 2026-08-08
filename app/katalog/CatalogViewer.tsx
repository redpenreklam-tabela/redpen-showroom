"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const TOTAL_PAGES = 24;
const TURN_MS = 720;

type Direction = "next" | "prev";

function pagePath(index: number) {
  return `/catalog/pages/page-${String(index + 1).padStart(2, "0")}.webp`;
}

export default function CatalogViewer() {
  const [page, setPage] = useState(0);
  const [turning, setTurning] = useState(false);
  const [direction, setDirection] = useState<Direction>("next");
  const [targetPage, setTargetPage] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const progress = useMemo(
    () => ((page + 1) / TOTAL_PAGES) * 100,
    [page],
  );

  const turnTo = useCallback(
    (nextPage: number, nextDirection: Direction) => {
      if (turning) return;
      if (nextPage < 0 || nextPage >= TOTAL_PAGES || nextPage === page) return;

      setDirection(nextDirection);
      setTargetPage(nextPage);
      setTurning(true);

      window.setTimeout(() => {
        setPage(nextPage);
        setTurning(false);
      }, TURN_MS);
    },
    [page, turning],
  );

  const goNext = useCallback(() => {
    turnTo(page + 1, "next");
  }, [page, turnTo]);

  const goPrev = useCallback(() => {
    turnTo(page - 1, "prev");
  }, [page, turnTo]);

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
        turnTo(0, "prev");
      }
      if (event.key === "End") {
        event.preventDefault();
        turnTo(TOTAL_PAGES - 1, "next");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev, turnTo]);

  useEffect(() => {
    [page - 1, page + 1, page + 2]
      .filter((index) => index >= 0 && index < TOTAL_PAGES)
      .forEach((index) => {
        const image = new Image();
        image.src = pagePath(index);
      });
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

    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.25) return;

    if (dx < 0) goNext();
    else goPrev();
  };

  return (
    <main className="catalog-screen">
      <div className="catalog-atmosphere" aria-hidden="true">
        <span className="catalog-orbit catalog-orbit-a" />
        <span className="catalog-orbit catalog-orbit-b" />
        <span className="catalog-beam" />
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
        className="catalog-stage"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        aria-label={`Katalog sayfası ${page + 1}`}
      >
        <button
          className="catalog-arrow catalog-arrow-left"
          type="button"
          onClick={goPrev}
          disabled={page === 0 || turning}
          aria-label="Önceki sayfa"
        >
          <span>←</span>
        </button>

        <div className="catalog-book-shell">
          <div className="catalog-book-glow" aria-hidden="true" />

          <div
            className={`catalog-book ${turning ? "is-turning" : ""} direction-${direction}`}
          >
            <div className="catalog-page catalog-page-under">
              <img
                src={pagePath(turning ? targetPage : page)}
                alt=""
                draggable={false}
              />
            </div>

            <div
              className="catalog-page catalog-page-current"
              onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const localX = event.clientX - rect.left;
                if (localX > rect.width / 2) goNext();
                else goPrev();
              }}
            >
              <img
                src={pagePath(page)}
                alt={`Redpen dijital katalog - sayfa ${page + 1}`}
                draggable={false}
              />
              <span className="catalog-paper-shine" aria-hidden="true" />
              <span className="catalog-page-corner" aria-hidden="true" />
            </div>

            {turning && (
              <div
                className={`catalog-turn-sheet ${
                  direction === "next" ? "turn-next" : "turn-prev"
                }`}
                aria-hidden="true"
              >
                <div className="catalog-turn-face catalog-turn-front">
                  <img src={pagePath(page)} alt="" draggable={false} />
                  <span className="catalog-turn-shadow" />
                </div>
                <div className="catalog-turn-face catalog-turn-back">
                  <img src={pagePath(targetPage)} alt="" draggable={false} />
                  <span className="catalog-turn-shadow" />
                </div>
              </div>
            )}
          </div>

          <div className="catalog-book-meta" aria-hidden="true">
            <span>RP / 2026</span>
            <i />
            <span>ÜRÜN KATALOĞU</span>
          </div>
        </div>

        <button
          className="catalog-arrow catalog-arrow-right"
          type="button"
          onClick={goNext}
          disabled={page === TOTAL_PAGES - 1 || turning}
          aria-label="Sonraki sayfa"
        >
          <span>→</span>
        </button>
      </section>

      <footer className="catalog-controls">
        <div className="catalog-counter">
          <strong>{String(page + 1).padStart(2, "0")}</strong>
          <span>/</span>
          <b>{TOTAL_PAGES}</b>
        </div>

        <div className="catalog-progress" aria-hidden="true">
          <i style={{ transform: `scaleX(${progress / 100})` }} />
        </div>

        <div className="catalog-hint">
          <span className="desktop-hint">← → TUŞLARI · SAYFAYA TIKLA</span>
          <span className="mobile-hint">SAĞA / SOLA KAYDIR</span>
        </div>
      </footer>
    </main>
  );
}
