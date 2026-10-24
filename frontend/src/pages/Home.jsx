import React, { useEffect, useRef, useState } from 'react';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';

export const Home = ({ setActivePage, onCategorySelect, onProductSelect }) => {
  const { products, loadingProducts, formatMoney } = useCart();
  const productsTrackRef = useRef(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const handleCategoryClick = (cat) => {
    if (onCategorySelect) onCategorySelect(cat);
    setActivePage('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const track = productsTrackRef.current;
    if (!track) return undefined;

    const updateScrollButtons = () => {
      setCanScrollPrev(track.scrollLeft > 1);
      setCanScrollNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 1);
    };

    updateScrollButtons();
    track.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);

    return () => {
      track.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [products.length]);

  const scrollProducts = (direction) => {
    const track = productsTrackRef.current;
    const firstCard = track?.firstElementChild;
    if (!track || !firstCard) return;

    const gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
    track.scrollBy({
      left: direction * (firstCard.getBoundingClientRect().width + gap),
      behavior: 'smooth'
    });
  };

  return (
    <main className="minimal-home">
      {/* HERO SECTION */}
      <section className="minimal-hero" aria-label="Sauz Store">
        <div className="minimal-hero-media">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Video de la colección Sauz Store"
          >
            <source src="/sauz-store-banner.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="minimal-hero-content">
          <h1 className="minimal-hero-logo" style={{ display: 'none' }}>sauzstore</h1>
          
          <div className="minimal-hero-bottom-left" style={{ bottom: '70px', left: '50px', gap: '8px' }}>
            <h2 style={{ fontSize: '3.2rem', fontWeight: '900', margin: '0', letterSpacing: '2px', textTransform: 'uppercase', color: '#ffffff', textShadow: '0 4px 20px rgba(0, 0, 0, 0.85)', lineHeight: 1.05 }}>
              SAUZ STORE
            </h2>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', letterSpacing: '3px', color: '#ffffff', textTransform: 'uppercase', marginBottom: '12px', textShadow: '0 2px 10px rgba(0, 0, 0, 0.85)' }}>
              NUEVA COLECCIÓN DISPONIBLE
            </span>
            <button 
              className="minimal-btn-outline"
              onClick={() => {
                setActivePage('catalog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ 
                borderRadius: '30px', 
                border: '1.5px solid #ffffff', 
                color: '#ffffff', 
                background: 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(8px)',
                padding: '12px 28px', 
                fontSize: '0.75rem', 
                fontWeight: '700',
                letterSpacing: '2px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textShadow: '0 2px 6px rgba(0,0,0,0.6)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.color = '#111111';
                e.currentTarget.style.textShadow = 'none';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(0,0,0,0.3)';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.textShadow = '0 2px 6px rgba(0,0,0,0.6)';
              }}
            >
              VER COLECCIÓN
            </button>
          </div>
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section className="minimal-products-section">
        <div className="minimal-products-heading">
          <div>
            <span className="minimal-products-kicker">SAUZ STORE / COLECCIÓN</span>
            <p>Desliza para descubrir todas las prendas disponibles</p>
          </div>
          {!loadingProducts && products.length > 0 && (
            <div className="minimal-carousel-controls" role="group" aria-label="Controles de productos">
              <button
                type="button"
                className="minimal-carousel-arrow"
                onClick={() => scrollProducts(-1)}
                disabled={!canScrollPrev}
                aria-label="Ver prendas anteriores"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                className="minimal-carousel-arrow"
                onClick={() => scrollProducts(1)}
                disabled={!canScrollNext}
                aria-label="Ver más prendas"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          )}
        </div>
        <div
          className="minimal-products-grid"
          ref={productsTrackRef}
          role="region"
          aria-label="Todas las prendas disponibles"
          tabIndex={0}
        >
          {loadingProducts ? (
            <p>Cargando prendas...</p>
          ) : products.length === 0 ? (
            <p>No hay prendas disponibles en este momento.</p>
          ) : (
            products.map((p) => (
              <div key={p.id} className="minimal-product-card">
                <div 
                  className="minimal-product-img-wrapper"
                  onClick={() => onProductSelect && onProductSelect(p.id)}
                >
                  <img src={p.image} alt={p.name} />
                </div>
                <div className="minimal-product-info">
                  <h3 className="minimal-product-title">{p.name.toUpperCase()}</h3>
                  <p className="minimal-product-price">{formatMoney(p.price)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* NEWSLETTER SECTION */}
      <section className="minimal-newsletter">
        <h2 className="minimal-newsletter-title">NO TODOS PUEDEN TENER PRENDAS LIMITADAS..</h2>
        <p className="minimal-newsletter-desc">
          ÚNETE A NUESTRA LISTA DE CORREOS PARA ENTERARTE DE LA NUEVA COLECCIÓN Y NO PERDÉRTELA.
        </p>
        <form className="minimal-newsletter-form" onSubmit={(e) => { e.preventDefault(); alert('¡Suscrito!'); }}>
          <input type="email" placeholder="Tu Correo" required />
          <button type="submit">SUSCRIBIRSE</button>
        </form>
      </section>
    </main>
  );
};
