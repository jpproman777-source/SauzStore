import React from "react";
import { useCart } from "../context/CartContext";
import { ProductCard } from "../components/ProductCard";
import { BrandLogo } from "../components/BrandLogo";
import {
  HomeCarousel,
  CampaignImage,
  campaignSlides,
} from "../components/HomeCarousel";
import { FitLab } from "../components/FitLab";
export const Home = ({
  setActivePage,
  onCategorySelect,
  onCollectionSelect,
  onProductSelect,
}) => {
  const { products, loadingProducts } = useCart();
  const categories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];
  return (
    <main className="bf-home">
      <HomeCarousel onCollectionSelect={onCollectionSelect} />
      <section
        className="edition-categories"
        id="categorias"
        aria-label="Explorar categorías"
      >
        <div className="edition-category-heading">
          <span className="edition-eyebrow">ELIGE TU PRÓXIMO MOVIMIENTO</span>
          <h2>Tu estilo. Sin límites.</h2>
        </div>
        <div className="edition-category-grid">
          {[
            {
              name: "Camisetas",
              slide: campaignSlides[1],
              description: "Siluetas que hablan por ti.",
            },
            {
              name: "Gorras",
              slide: campaignSlides[2],
              description: "El detalle que hace la diferencia.",
            },
            {
              name: "Sneakers",
              slide: campaignSlides[0],
              description: "Actitud en cada paso.",
            },
          ].map((category, i) => (
            <button
              className="edition-category-card"
              key={category.name}
              onClick={() => onCollectionSelect(category.name)}
            >
              <div className="edition-category-photo">
                <CampaignImage slide={category.slide} />
                <span className="edition-category-number">
                  0{i + 1} / COLECCIÓN
                </span>
              </div>
              <div className="edition-category-info">
                <div>
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                </div>
                <span aria-hidden="true">↗</span>
              </div>
            </button>
          ))}
        </div>
      </section>
      <section className="bf-section" id="coleccion">
        <div className="bf-section-heading">
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
        <div className="bf-category-row">
          {categories.map((c, i) => (
            <button key={c} onClick={() => onCategorySelect(c)}>
              <span>0{i + 1}</span>
              {c}
              <span>↗</span>
            </button>
          ))}
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
      <section className="bf-statement" id="marcas">
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
      <FitLab onProductSelect={onProductSelect} />
    </main>
  );
};
