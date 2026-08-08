import type { Metadata } from "next";
import {
  Anton,
  Archivo_Black,
  Barlow_Condensed,
  Bebas_Neue,
  League_Spartan,
  Lobster,
  Montserrat,
  Oswald,
  Pacifico,
  Poppins,
  Roboto_Condensed,
  Rubik,
} from "next/font/google";
import SignDesigner from "./SignDesigner";
import "./tasarla.css";
import "./scale-real.css";
import "./light-real.css";
import "./typography-controls.css";
import "./letter-materials.css";
import "./metal-face-fix.css";
import "./metal-reflection-enhance.css";
import "./metal-light-rig.css";
import "./metal-face-banding.css";
import "./metal-face-final.css";

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

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-sign-barlow-condensed",
});

const leagueSpartan = League_Spartan({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-sign-league-spartan",
});

const rubik = Rubik({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-sign-rubik",
});

const lobster = Lobster({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-sign-lobster",
});

const pacifico = Pacifico({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-sign-pacifico",
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
    barlowCondensed.variable,
    leagueSpartan.variable,
    rubik.variable,
    lobster.variable,
    pacifico.variable,
  ].join(" ");

  return (
    <div className={fontVariables}>
      <SignDesigner />
    </div>
  );
}
