"use client";

import { useEffect } from "react";

export default function CatalogNavInjector() {
  useEffect(() => {
    const nav = document.querySelector(".topbar nav");
    if (!nav) return;

    const created: HTMLAnchorElement[] = [];

    const ensureLink = (key: string, href: string, label: string, ariaLabel: string) => {
      if (nav.querySelector(`[data-redpen-nav="${key}"]`)) return;
      const link = document.createElement("a");
      link.href = href;
      link.textContent = label;
      link.dataset.redpenNav = key;
      link.setAttribute("aria-label", ariaLabel);
      nav.appendChild(link);
      created.push(link);
    };

    ensureLink("designer", "/tasarla", "TABELANI TASARLA", "Tabela tasarım aracını aç");
    ensureLink("catalog", "/katalog", "KATALOG", "Redpen dijital kataloğunu aç");

    return () => created.forEach((link) => link.remove());
  }, []);

  return null;
}
