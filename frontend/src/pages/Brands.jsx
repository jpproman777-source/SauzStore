import React, { useEffect } from "react";
import { BrandsDirectoryGrid } from "../components/BrandsDirectoryGrid";
import "./brands-directory.css";

export default function Brands({ onCatalogFilter }) {
  useEffect(() => {
    document.title = "Marcas | SAUZ STORE Black Edition";
  }, []);

  return (
    <main className="brands-dir-page" aria-labelledby="brands-dir-heading">
      <header className="brands-dir-header">
        <div className="brands-dir-shell">
          <p className="brands-dir-eyebrow">SAUZ STORE / BRAND DIRECTORY</p>
          <h1 id="brands-dir-heading" className="brands-dir-title">
            LAS MARCAS.
            <span className="brands-dir-title-accent">TU ESTILO.</span>
          </h1>
          <p className="brands-dir-subtitle">
            Una selección de marcas que definen nuestra visión del streetwear.
          </p>
        </div>
      </header>

      <section className="brands-dir-grid-section" aria-label="Directorio oficial de marcas">
        <div className="brands-dir-shell">
          <BrandsDirectoryGrid onCatalogFilter={onCatalogFilter} headingTag="h2" />
        </div>
      </section>
    </main>
  );
}
