import React from "react";
import { ArrowUpRight } from "lucide-react";
import { approvedBrandAssets } from "../assets/brandAssets";
import "../pages/brands-directory.css";

export const BRAND_DIRECTORY = [
  {
    id: "nike",
    name: "Nike",
    filterValue: "Nike",
    description:
      "Siluetas técnicas, sudaderas y clásicos urbanos con ingeniería deportiva para el uso diario.",
    asset: approvedBrandAssets.NIKE,
    logoModifier: "nike",
  },
  {
    id: "jordan",
    name: "Jordan",
    filterValue: "Jordan",
    description:
      "Herencia de cancha, pares icónicos y cápsulas de edición cuidada bajo estética Black Edition.",
    asset: approvedBrandAssets.JORDAN,
    logoModifier: "jordan",
  },
  {
    id: "adidas",
    name: "Adidas",
    filterValue: "Adidas",
    description:
      "Conjuntos, camisetas y archivo contemporáneo de tres líneas con cortes limpios y funcionales.",
    asset: approvedBrandAssets.ADIDAS,
    logoModifier: "adidas",
  },
  {
    id: "new-era",
    name: "New Era",
    filterValue: "New Era",
    description:
      "Gorras estructuradas 59FIFTY y siluetas de visera curva que completan el uniforme urbano.",
    asset: approvedBrandAssets.NEW_ERA,
    logoModifier: "new-era",
  },
];

export function BrandsDirectoryGrid({
  onCatalogFilter,
  headingTag: HeadingTag = "h2",
  className = "",
}) {
  const handleExploreBrand = (brandValue) => {
    onCatalogFilter?.({
      category: "Todas",
      brand: brandValue,
      query: "",
      sort: "destacados",
    });
  };

  return (
    <div className={`brands-dir-grid ${className}`.trim()}>
      {BRAND_DIRECTORY.map((brand) => (
        <article key={brand.id} className="brand-dir-card">
          <div className="brand-dir-logo-zone">
            <img
              src={brand.asset.src}
              alt={`${brand.name} logo oficial`}
              width={brand.asset.width}
              height={brand.asset.height}
              loading="eager"
              decoding="async"
              className={`brand-dir-logo-img brand-dir-logo-img--${brand.logoModifier}`}
            />
          </div>

          <div className="brand-dir-separator" aria-hidden="true" />

          <div className="brand-dir-content">
            <div className="brand-dir-copy">
              <HeadingTag className="brand-dir-name">{brand.name}</HeadingTag>
              <p className="brand-dir-desc">{brand.description}</p>
            </div>

            <button
              type="button"
              className="brand-dir-cta"
              onClick={() => handleExploreBrand(brand.filterValue)}
            >
              <span>EXPLORAR COLECCIÓN</span>
              <ArrowUpRight size={15} strokeWidth={2.1} aria-hidden="true" />
            </button>
          </div>

          <span className="brand-dir-corner-accent" aria-hidden="true" />
        </article>
      ))}
    </div>
  );
}
