import type { Metadata } from "next";
import CatalogNavInjector from "./components/CatalogNavInjector";
import "./globals.css";
import "./mobile.css";
import "./mobile-video-performance.css";
import "./mobile-pingpong-assembly.css";
import "./mobile-real-device-force.css";
import "./mobile-scroll-unlock.css";

export const metadata: Metadata = {
  title: "Redpen Showroom | 3D Reklam ve Tabela Deneyimi",
  description: "Redpen Reklam'ın etkileşimli 3D tabela, cephe ve mimari reklam showroom'u.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="tr"
      style={
        {
          "--font-geist-sans":
            'Inter, "Segoe UI", Arial, Helvetica, sans-serif',
          "--font-geist-mono":
            '"Cascadia Mono", "Segoe UI Mono", Consolas, "Courier New", monospace',
          "--font-display":
            'Georgia, "Times New Roman", serif',
        } as React.CSSProperties
      }
    >
      <body>
        <CatalogNavInjector />
        {children}
      </body>
    </html>
  );
}
