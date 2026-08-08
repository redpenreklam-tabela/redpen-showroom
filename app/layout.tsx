import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import CatalogNavInjector from "./components/CatalogNavInjector";
import "./globals.css";
import "./mobile.css";
import "./mobile-video-performance.css";
import "./mobile-pingpong-assembly.css";
import "./mobile-real-device-force.css";
import "./mobile-scroll-unlock.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Redpen Showroom | 3D Reklam ve Tabela Deneyimi",
  description: "Redpen Reklam'ın etkileşimli 3D tabela, cephe ve mimari reklam showroom'u.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable} ${display.variable}`}>
      <body>
        <CatalogNavInjector />
        {children}
      </body>
    </html>
  );
}
