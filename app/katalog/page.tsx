import type { Metadata } from "next";
import CatalogViewer from "./CatalogViewer";
import "./katalog.css";

export const metadata: Metadata = {
  title: "Dijital Katalog | Redpen Reklam",
  description: "Redpen Reklam ve Tabela dijital ürün kataloğu.",
};

export default function CatalogPage() {
  return <CatalogViewer />;
}
