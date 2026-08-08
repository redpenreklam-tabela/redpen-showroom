"use client";

import { useEffect } from "react";

export default function CatalogNavInjector() {
  useEffect(() => {
    const nav = document.querySelector(".topbar nav");
    if (!nav || nav.querySelector('[data-catalog-nav="true"]')) return;

    const link = document.createElement("a");
    link.href = "/katalog";
    link.textContent = "KATALOG";
    link.dataset.catalogNav = "true";
    link.setAttribute("aria-label", "Redpen dijital kataloğunu aç");
    nav.appendChild(link);

    return () => {
      link.remove();
    };
  }, []);

  return null;
}
