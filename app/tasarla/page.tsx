import type { Metadata } from "next";
import {
  Anton,
  Archivo_Black,
  Barlow_Condensed,
  Bebas_Neue,
  Caveat,
  Cinzel,
  Comfortaa,
  Dancing_Script,
  DM_Sans,
  Exo_2,
  Fira_Sans,
  Inter,
  Josefin_Sans,
  Lato,
  League_Spartan,
  Lobster,
  Manrope,
  Merriweather,
  Montserrat,
  Mulish,
  Noto_Sans,
  Noto_Serif,
  Nunito,
  Open_Sans,
  Oswald,
  Pacifico,
  Playfair_Display,
  Poppins,
  PT_Sans,
  Quicksand,
  Raleway,
  Roboto,
  Roboto_Condensed,
  Rubik,
  Ubuntu,
  Work_Sans,
} from "next/font/google";
import SignDesigner from "./SignDesigner";
import "./tasarla.css";
import "./scale-real.css";
import "./light-real.css";
import "./typography-controls.css";
import "./letter-materials.css";
import "./metal-svg-face.css";
import "./designer-usability.css";

const montserrat = Montserrat({ subsets: ["latin", "latin-ext"], weight: ["600", "700", "800", "900"], variable: "--font-sign-montserrat" });
const oswald = Oswald({ subsets: ["latin", "latin-ext"], weight: ["600", "700"], variable: "--font-sign-oswald" });
const bebas = Bebas_Neue({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--font-sign-bebas" });
const poppins = Poppins({ subsets: ["latin", "latin-ext"], weight: ["600", "700", "800"], variable: "--font-sign-poppins" });
const robotoCondensed = Roboto_Condensed({ subsets: ["latin", "latin-ext"], weight: ["600", "700", "800"], variable: "--font-sign-roboto-condensed" });
const archivoBlack = Archivo_Black({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--font-sign-archivo-black" });
const anton = Anton({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--font-sign-anton" });
const barlowCondensed = Barlow_Condensed({ subsets: ["latin", "latin-ext"], weight: ["600", "700", "800", "900"], variable: "--font-sign-barlow-condensed" });
const leagueSpartan = League_Spartan({ subsets: ["latin", "latin-ext"], weight: ["600", "700", "800", "900"], variable: "--font-sign-league-spartan" });
const rubik = Rubik({ subsets: ["latin", "latin-ext"], weight: ["600", "700", "800", "900"], variable: "--font-sign-rubik" });
const lobster = Lobster({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--font-sign-lobster" });
const pacifico = Pacifico({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--font-sign-pacifico" });

const inter = Inter({ subsets: ["latin", "latin-ext"], weight: ["600", "700", "800", "900"], variable: "--font-sign-inter" });
const roboto = Roboto({ subsets: ["latin", "latin-ext"], weight: ["500", "700", "900"], variable: "--font-sign-roboto" });
const openSans = Open_Sans({ subsets: ["latin", "latin-ext"], weight: ["600", "700", "800"], variable: "--font-sign-open-sans" });
const lato = Lato({ subsets: ["latin", "latin-ext"], weight: ["700", "900"], variable: "--font-sign-lato" });
const raleway = Raleway({ subsets: ["latin", "latin-ext"], weight: ["600", "700", "800", "900"], variable: "--font-sign-raleway" });
const nunito = Nunito({ subsets: ["latin", "latin-ext"], weight: ["600", "700", "800", "900"], variable: "--font-sign-nunito" });
const ubuntu = Ubuntu({ subsets: ["latin", "latin-ext"], weight: ["500", "700"], variable: "--font-sign-ubuntu" });
const ptSans = PT_Sans({ subsets: ["latin", "latin-ext"], weight: ["400", "700"], variable: "--font-sign-pt-sans" });
const dmSans = DM_Sans({ subsets: ["latin", "latin-ext"], weight: ["600", "700", "800", "900"], variable: "--font-sign-dm-sans" });
const workSans = Work_Sans({ subsets: ["latin", "latin-ext"], weight: ["600", "700", "800", "900"], variable: "--font-sign-work-sans" });
const manrope = Manrope({ subsets: ["latin", "latin-ext"], weight: ["600", "700", "800"], variable: "--font-sign-manrope" });
const mulish = Mulish({ subsets: ["latin", "latin-ext"], weight: ["600", "700", "800", "900"], variable: "--font-sign-mulish" });
const firaSans = Fira_Sans({ subsets: ["latin", "latin-ext"], weight: ["600", "700", "800", "900"], variable: "--font-sign-fira-sans" });
const notoSans = Noto_Sans({ subsets: ["latin", "latin-ext"], weight: ["600", "700", "800", "900"], variable: "--font-sign-noto-sans" });
const quicksand = Quicksand({ subsets: ["latin", "latin-ext"], weight: ["600", "700"], variable: "--font-sign-quicksand" });
const josefinSans = Josefin_Sans({ subsets: ["latin", "latin-ext"], weight: ["600", "700"], variable: "--font-sign-josefin-sans" });
const exo2 = Exo_2({ subsets: ["latin", "latin-ext"], weight: ["600", "700", "800", "900"], variable: "--font-sign-exo-2" });
const comfortaa = Comfortaa({ subsets: ["latin", "latin-ext"], weight: ["600", "700"], variable: "--font-sign-comfortaa" });
const merriweather = Merriweather({ subsets: ["latin", "latin-ext"], weight: ["700", "900"], variable: "--font-sign-merriweather" });
const playfairDisplay = Playfair_Display({ subsets: ["latin", "latin-ext"], weight: ["600", "700", "800", "900"], variable: "--font-sign-playfair-display" });
const notoSerif = Noto_Serif({ subsets: ["latin", "latin-ext"], weight: ["600", "700", "800", "900"], variable: "--font-sign-noto-serif" });
const cinzel = Cinzel({ subsets: ["latin", "latin-ext"], weight: ["600", "700", "800", "900"], variable: "--font-sign-cinzel" });
const caveat = Caveat({ subsets: ["latin", "latin-ext"], weight: ["600", "700"], variable: "--font-sign-caveat" });
const dancingScript = Dancing_Script({ subsets: ["latin", "latin-ext"], weight: ["600", "700"], variable: "--font-sign-dancing-script" });

export const metadata: Metadata = {
  title: "Tabelanı Tasarla | Redpen Reklam",
  description: "Tabela tipini, rengini, ölçüsünü, yazı tipini ve aydınlatmasını seçerek önizleme oluştur.",
};

export default function TasarlaPage() {
  const fontVariables = [
    montserrat.variable, oswald.variable, bebas.variable, poppins.variable,
    robotoCondensed.variable, archivoBlack.variable, anton.variable, barlowCondensed.variable,
    leagueSpartan.variable, rubik.variable, lobster.variable, pacifico.variable,
    inter.variable, roboto.variable, openSans.variable, lato.variable, raleway.variable,
    nunito.variable, ubuntu.variable, ptSans.variable, dmSans.variable, workSans.variable,
    manrope.variable, mulish.variable, firaSans.variable, notoSans.variable, quicksand.variable,
    josefinSans.variable, exo2.variable, comfortaa.variable, merriweather.variable,
    playfairDisplay.variable, notoSerif.variable, cinzel.variable, caveat.variable, dancingScript.variable,
  ].join(" ");

  return (
    <div className={fontVariables}>
      <SignDesigner />
    </div>
  );
}
