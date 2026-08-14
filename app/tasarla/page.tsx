import type { Metadata } from "next";
import SignDesigner from "./SignDesigner";
import "./tasarla.css";
import "./scale-real.css";
import "./light-real.css";
import "./typography-controls.css";
import "./letter-materials.css";
import "./metal-svg-face.css";
import "./designer-usability.css";
import "./local-sign-fonts.css";

export const metadata: Metadata = {
  title: "Tabelanı Tasarla | Redpen Reklam",
  description: "Tabela tipini, rengini, ölçüsünü, yazı tipini ve aydınlatmasını seçerek önizleme oluştur.",
};

export default function TasarlaPage() {
  return <SignDesigner />;
}
