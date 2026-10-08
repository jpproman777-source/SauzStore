import React from 'react';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';

export const Home = ({ setActivePage, onCategorySelect }) => {
  const { products, loadingProducts } = useCart();

  const handleCategoryClick = (cat) => {
    if (onCategorySelect) onCategorySelect(cat);
    setActivePage('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight - 60,
      behavior: 'smooth'
    });
  };

  const featuredProducts = products.slice(0, 4);

  return (
    <main className="home-main">
      {/* HERO: Pantalla completa estilo imagen de referencia (Etiqueta Negra / EN Sport) */}
      <section className="hero hero-cover" aria-label="Sauz Sport">
        {/* Video principal de la colección */}
        <div className="hero-media-wrapper">
          <iframe
            className="hero-video"
            src="https://www.youtube-nocookie.com/embed/_xJCX9pHoaA?autoplay=1&mute=1&loop=1&playlist=_xJCX9pHoaA&controls=0&rel=0&playsinline=1"
            title="Video de la colección Sauz Store"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>

        {/* Capa de contraste y gradiente de lujo */}
        <div className="hero-dark-overlay" aria-hidden="true" />

        {/* Declaración central prominente (inspirada en "EN SPORT") */}
        <div className="hero-center-box">
          <div className="hero-brand-statement">
            <span className="brand-statement-main">SAUZ</span>
            <span className="brand-statement-accent">STORE</span>
          </div>

          <p className="hero-brand-subtitle">
            EDICIÓN URBANA & PERFORMANCE · COLECCIÓN 2026
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-light hero-collection-btn"
              onClick={() => {
                setActivePage('catalog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              VER COLECCIÓN
            </button>
          </div>

          {/* Indicador de desplazamiento hacia abajo */}
          <button
            type="button"
            className="hero-scroll-cue"
            onClick={handleScrollDown}
            aria-label="Deslizar hacia abajo para ver el catálogo y menú"
          >
            <span className="scroll-cue-text">DESLIZA PARA EXPLORAR</span>
            <span className="scroll-cue-arrow">↓</span>
          </button>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="section" id="homeCategories">
        <div className="wrap">
          <div className="section-head">
            <div>
              <h2>Comprar por categoría</h2>
              <p>Explora nuestras líneas de confección pesada y corte relajado.</p>
            </div>
            <button
              type="button"
              className="link-underline"
              onClick={() => {
                if (onCategorySelect) onCategorySelect('Todas');
                setActivePage('catalog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Ver todo
            </button>
          </div>

          <div className="cat-grid">
            <div
              className="cat-tile"
              onClick={() => handleCategoryClick('Camisetas')}
              role="button"
              tabIndex={0}
            >
              <span className="cat-emoji" aria-hidden="true">👕</span>
              <span className="cat-name">Camisetas</span>
              <span className="cat-count">Heavy Cotton 240 GSM</span>
            </div>

            <div
              className="cat-tile"
              onClick={() => handleCategoryClick('Chaquetas')}
              role="button"
              tabIndex={0}
            >
              <span className="cat-emoji" aria-hidden="true">🧥</span>
              <span className="cat-name">Chaquetas</span>
              <span className="cat-count">Denim & Oversize</span>
            </div>

            <div
              className="cat-tile"
              onClick={() => handleCategoryClick('Pantalones')}
              role="button"
              tabIndex={0}
            >
              <span className="cat-emoji" aria-hidden="true">👖</span>
              <span className="cat-name">Pantalones</span>
              <span className="cat-count">Cargo Streetwear</span>
            </div>

            <div
              className="cat-tile"
              onClick={() => handleCategoryClick('Accesorios')}
              role="button"
              tabIndex={0}
            >
              <span className="cat-emoji" aria-hidden="true">🧢</span>
              <span className="cat-name">Accesorios</span>
              <span className="cat-count">Gorras bordadas</span>
            </div>
          </div>
        </div>
      </section>

      {/* PRENDAS DESTACADAS */}
      <section className="section section-alt">
        <div className="wrap">
          <div className="section-head">
            <div>
              <h2>Lo más nuevo</h2>
              <p>Prendas recién añadidas a la colección Sauz Sport.</p>
            </div>
            <button
              type="button"
              className="link-underline"
              onClick={() => {
                if (onCategorySelect) onCategorySelect('Todas');
                setActivePage('catalog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Ver catálogo completo
            </button>
          </div>

          <div className="products-grid" id="featuredGrid">
            {loadingProducts ? (
              <p className="grid-msg">Cargando prendas...</p>
            ) : featuredProducts.length === 0 ? (
              <p className="grid-msg">No hay prendas disponibles en este momento.</p>
            ) : (
              featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="section">
        <div className="wrap">
          <div className="feature-grid">
            <div className="feature">
              <h3>Envío gratis</h3>
              <p>En todos los pedidos a nivel nacional, directo a tu puerta.</p>
            </div>
            <div className="feature">
              <h3>3 cuotas sin interés</h3>
              <p>Paga con tarjeta de crédito o débito con total seguridad y respaldo.</p>
            </div>
            <div className="feature">
              <h3>30 días para cambios</h3>
              <p>Garantía de satisfacción y cambios inmedios de talla sin costo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FRASE DE MARCA */}
      <section className="section section-dark">
        <div className="wrap band">
          <h2>Cortes amplios, telas pesadas y detalles que se notan.</h2>
          <button
            type="button"
            className="btn btn-light"
            onClick={() => {
              setActivePage('about');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Conoce Sauz
          </button>
        </div>
      </section>
    </main>
  );
};
