import React, { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { ProductCard } from "../components/catalog/ProductCard";
import { BrandsDirectoryGrid } from "../components/layout/BrandsDirectoryGrid";
import {
  HomeCarousel,
} from "../components/home/HomeCarousel";
import { EditorialCollections } from "../components/home/EditorialCollections";
import { useScrollReveal } from "../hooks/useScrollReveal";
import "./home-catalog-button.css";

export const Home = ({
  setActivePage,
  onCollectionSelect,
  onProductSelect,
  onCatalogFilter,
}) => {
  const { products, loadingProducts } = useCart();
  const main = useRef(null);
  useScrollReveal(main, [products.length, loadingProducts], '.bf-home > .bf-section [data-reveal], .bf-home > .bf-statement[data-reveal]');

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
            type="button"
            className="sauz-catalog-button"
            onClick={() => setActivePage("catalog")}
          >
            <span className="sauz-catalog-button-label">Ver todo el catálogo</span>
            <span className="sauz-catalog-button-icon" aria-hidden="true"><ArrowUpRight size={20} /></span>
          </button>
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
        <div className="brands-dir-home-wrap">
          <BrandsDirectoryGrid
            onCatalogFilter={onCatalogFilter}
            headingTag="h3"
          />
        </div>
        <small className="brands-dir-home-note">
          Universo de inspiración. Selecciona una marca para explorar sus
          referencias en el catálogo.
        </small>
      </section>
    </main>
  );
};
