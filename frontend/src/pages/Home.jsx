import React, { useMemo, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { ProductCard } from "../components/ProductCard";
import { BrandLogo } from "../components/BrandLogo";
import {
  HomeCarousel,
} from "../components/HomeCarousel";
import { EditorialCollections } from "../components/EditorialCollections";
import { useScrollReveal } from "../hooks/useScrollReveal";

export const Home = ({
  setActivePage,
  onCategorySelect,
  onCollectionSelect,
  onProductSelect,
}) => {
  const { products, loadingProducts } = useCart();
  const main = useRef(null);
  useScrollReveal(main, [products.length, loadingProducts], '.bf-home > .bf-section [data-reveal], .bf-home > .bf-statement[data-reveal]');

  const categories = useMemo(() => {
    return [...new Set(products.map((p) => p.category).filter(Boolean))];
  }, [products]);

  const categoryCounts = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  return (
    <main className="bf-home" ref={main}>
      <HomeCarousel onCollectionSelect={onCollectionSelect} />
      <EditorialCollections onCollectionSelect={onCollectionSelect} />
      <section className="bf-section" id="coleccion">
        <div className="bf-section-heading" data-reveal>
          <div>
            <span className="bf-eyebrow">01 / SELECCIÓN SAUZ</span>
            <h2>Tu próximo esencial.</h2>
          </div>
          <button
            className="bf-text-button"
            onClick={() => setActivePage("catalog")}
          >
            VER TODO EL CATÁLOGO ↗
          </button>
        </div>
        <div className="bf-category-row" role="region" aria-label="Explorar por categoría" data-reveal>
          {categories.map((c, i) => {
            const count = categoryCounts[c] || 0;
            return (
              <button
                key={c}
                type="button"
                className="bf-category-card"
                onClick={() => onCategorySelect(c)}
                aria-label={`Ver colección de ${c}, ${count} referencias`}
              >
                <div className="bf-cat-top">
                  <span className="bf-cat-index">0{i + 1}</span>
                  <ArrowUpRight size={15} className="bf-cat-arrow" aria-hidden="true" />
                </div>
                <div className="bf-cat-content">
                  <span className="bf-cat-name">{c}</span>
                  <span className="bf-cat-count">{count > 0 ? `${count} piezas` : "Ver piezas"}</span>
                </div>
              </button>
            );
          })}
        </div>
        <div className="bf-grid">
          {loadingProducts ? (
            <p role="status">Cargando colección…</p>
          ) : products.length ? (
            products
              .slice(0, 4)
              .map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onProductSelect={onProductSelect}
                />
              ))
          ) : (
            <p>
              La colección no está disponible. Visita el catálogo para volver a
              intentarlo.
            </p>
          )}
        </div>
      </section>
      <section className="bf-statement" id="marcas" data-reveal>
        <span className="bf-eyebrow">CURADURÍA CON ACTITUD</span>
        <h2>
          NO ES SOLO
          <br />
          LO QUE LLEVAS.
          <br />
          <span>ES CÓMO LO VIVES.</span>
        </h2>
        <p>
          Siluetas urbanas. Expresión propia. Explora nuestra selección y
          construye tu estilo desde cero.
        </p>
        <div className="bf-brands">
          {["NIKE", "JORDAN", "ADIDAS"].map((b) => (
            <BrandLogo key={b} brand={b} />
          ))}
        </div>
        <small>
          Universo de inspiración. Consulta las marcas disponibles en el
          catálogo.
        </small>
      </section>
    </main>
  );
};
