import type { Metadata } from "next";
import {
  Anton,
  Archivo_Black,
  Bebas_Neue,
  Montserrat,
  Oswald,
  Poppins,
  Roboto_Condensed,
} from "next/font/google";
import SignDesigner from "./SignDesigner";
import "./tasarla.css";
import "./scale-real.css";
import "./light-real.css";
import "./typography-controls.css";

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-sign-montserrat",
});

const oswald = Oswald({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700"],
  variable: "--font-sign-oswald",
});

const bebas = Bebas_Neue({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-sign-bebas",
});

const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800"],
  variable: "--font-sign-poppins",
});

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800"],
  variable: "--font-sign-roboto-condensed",
});

const archivoBlack = Archivo_Black({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-sign-archivo-black",
});

const anton = Anton({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-sign-anton",
});

export const metadata: Metadata = {
  title: "Tabelanı Tasarla | Redpen Reklam",
  description:
    "Tabela tipini, rengini, ölçüsünü, yazı tipini ve aydınlatmasını seçerek önizleme oluştur.",
};

export default function TasarlaPage() {
  const fontVariables = [
    montserrat.variable,
    oswald.variable,
    bebas.variable,
    poppins.variable,
    robotoCondensed.variable,
    archivoBlack.variable,
    anton.variable,
  ].join(" ");

  return (
    <div className={fontVariables}>
      <SignDesigner />
    </div>
  );
}
