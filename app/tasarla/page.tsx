import type { Metadata } from "next";
import SignDesigner from "./SignDesigner";
import "./tasarla.css";
import "./scale-real.css";

export const metadata: Metadata = {
  title: "Tabelanı Tasarla | Redpen Reklam",
  description: "Tabela tipini, rengini, ölçüsünü ve aydınlatmasını seçerek önizleme oluştur.",
};

export default function TasarlaPage() {
  return <SignDesigner />;
}
