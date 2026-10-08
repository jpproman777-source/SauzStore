import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

export const Header = ({ activePage, setActivePage, searchQuery, setSearchQuery }) => {
  const { cart, setIsCartOpen } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Apenas bajamos de la pantalla inicial (más de 80px), mostramos el nav completo
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (page) => {
    setActivePage(page);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (activePage !== 'catalog') {
      setActivePage('catalog');
    }
  };

  // Modo portada tipo "Etiqueta Negra": activo solo en la página de inicio antes de hacer scroll
  const isCoverMode = activePage === 'home' && !isScrolled;

  return (
    <div
      className={`site-top ${isCoverMode ? 'is-cover-mode' : ''} ${isScrolled ? 'is-scrolled scrolled' : ''}`}
      id="siteTop"
    >
      {/* Cabecera Principal */}
      <header className="site-header">
        <div className="header-inner">
          {/* Navegación y buscador: en modo portada se ocultan, y apenas bajas aparecen suavemente */}
          <div className={`header-left ${isCoverMode ? 'nav-hidden-cover' : 'nav-visible'}`}>
            <button
              className="icon-btn menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Abrir menú"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>

            <nav className="main-nav" aria-label="Navegación principal">
              <button
                type="button"
                className={`nav-link-btn ${activePage === 'home' ? 'active' : ''}`}
                onClick={() => handleNavClick('home')}
              >
                Inicio
              </button>
              <button
                type="button"
                className={`nav-link-btn ${activePage === 'catalog' ? 'active' : ''}`}
                onClick={() => handleNavClick('catalog')}
              >
                Catálogo
              </button>
              <button
                type="button"
                className={`nav-link-btn ${activePage === 'about' ? 'active' : ''}`}
                onClick={() => handleNavClick('about')}
              >
                Quiénes somos
              </button>
              <button
                type="button"
                className={`nav-link-btn ${activePage === 'location' ? 'active' : ''}`}
                onClick={() => handleNavClick('location')}
              >
                Ubicación
              </button>
            </nav>

            <button
              className="icon-btn search-trigger-btn"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Buscar prendas"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M20 20l-4.2-4.2" />
              </svg>
            </button>
          </div>

          {/* Logo Central: en modo portada reemplaza a "ETIQUETA NEGRA" centrado y elegante */}
          <button
            type="button"
            className="brand brand-btn header-center-brand"
            onClick={() => handleNavClick('home')}
            aria-label="Sauz Store - Inicio"
          >
            SAUZ STORE
          </button>

          {/* Bolsa de compras */}
          <div className="header-right">
            <button
              className="icon-btn cart-trigger"
              onClick={() => setIsCartOpen(true)}
              aria-label="Abrir bolsa de compras"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 8h14l-1 12H6L5 8z" />
                <path d="M9 8V6.5a3 3 0 016 0V8" />
              </svg>
              {cart.count > 0 && (
                <span className="cart-counter">{cart.count}</span>
              )}
            </button>
          </div>
        </div>

        {/* Buscador Desplegable */}
        <form className={`search-panel ${isSearchOpen ? 'open' : ''}`} onSubmit={handleSearchSubmit}>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar camisetas, chaquetas, accesorios..."
            aria-label="Buscar prendas"
          />
          <button type="submit" className="btn btn-dark">Buscar</button>
        </form>
      </header>

      {/* Menú Móvil */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-head">
          <span className="brand">SAUZ STORE</span>
          <button className="icon-btn" onClick={() => setIsMobileMenuOpen(false)} aria-label="Cerrar menú">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <nav>
          <button className={`mobile-nav-btn ${activePage === 'home' ? 'active' : ''}`} onClick={() => handleNavClick('home')}>Inicio</button>
          <button className={`mobile-nav-btn ${activePage === 'catalog' ? 'active' : ''}`} onClick={() => handleNavClick('catalog')}>Catálogo</button>
          <button className={`mobile-nav-btn ${activePage === 'about' ? 'active' : ''}`} onClick={() => handleNavClick('about')}>Quiénes somos</button>
          <button className={`mobile-nav-btn ${activePage === 'location' ? 'active' : ''}`} onClick={() => handleNavClick('location')}>Ubicación</button>
        </nav>
      </div>
    </div>
  );
};
