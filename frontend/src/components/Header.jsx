import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

export const Header = ({ activePage, setActivePage, searchQuery, setSearchQuery }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { cart, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (page) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isCoverMode = activePage === 'home' && !isScrolled;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleNavClick('catalog');
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      <header className={`minimal-header ${isCoverMode ? 'transparent' : 'solid'}`} style={{ borderBottom: isCoverMode ? 'none' : '1px solid var(--border-color)' }}>
        <div className="minimal-header-inner" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '20px 40px' }}>
          
          {/* LEFT: Menu & Search */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <button 
              type="button" 
              onClick={() => setIsMenuOpen(true)}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              aria-label="Abrir Menú"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>

            {isSearchOpen ? (
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar prendas..."
                  autoFocus
                  style={{ 
                    background: 'transparent', border: 'none', borderBottom: '1px solid var(--text-color)', 
                    color: 'inherit', outline: 'none', padding: '5px', fontSize: '0.9rem', width: '150px' 
                  }}
                />
                <button type="button" onClick={() => setIsSearchOpen(false)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
              </form>
            ) : (
              <button 
                type="button" 
                onClick={() => setIsSearchOpen(true)}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                aria-label="Buscar"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            )}
          </div>

          {/* CENTER: Logo */}
          <div style={{ textAlign: 'center' }}>
            <button 
              type="button"
              onClick={() => handleNavClick('home')}
              className="minimal-brand"
              style={{ letterSpacing: '4px', fontSize: '1.2rem', color: isCoverMode ? 'var(--text-color)' : 'var(--text-color)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              SAUZSTORE
            </button>
          </div>

          {/* RIGHT: User & Wishlist/Cart */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={() => alert('¡Inicio de sesión próximamente!')}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              aria-label="Perfil"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
            <button 
              type="button" 
              onClick={() => setIsCartOpen(true)}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              aria-label="Carrito"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                <circle cx="9" cy="21" r="1.5"></circle>
                <circle cx="20" cy="21" r="1.5"></circle>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* FULLSCREEN SIDE MENU */}
      <div 
        className={`full-menu-drawer ${isMenuOpen ? 'open' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          maxWidth: '350px',
          height: '100vh',
          backgroundColor: 'var(--bg-color)',
          borderRight: '1px solid var(--border-color)',
          color: 'var(--text-color)',
          zIndex: 10002,
          transform: isMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          boxShadow: '10px 0 30px rgba(0,0,0,0.8)'
        }}
      >
        <div style={{ padding: '30px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            type="button"
            onClick={() => { handleNavClick('home'); setIsMenuOpen(false); }}
            className="minimal-brand"
            style={{ letterSpacing: '2px', fontSize: '1.2rem', color: 'var(--text-color)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            SAUZSTORE
          </button>
          <button 
            onClick={() => setIsMenuOpen(false)}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', fontWeight: '100', cursor: 'pointer', color: 'var(--text-color)' }}
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '20px 40px', display: 'flex', flexDirection: 'column', gap: '30px', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '900', color: 'var(--text-color)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
              NAVEGACIÓN
            </span>
            {[
              { label: 'Inicio', id: 'home' },
              { label: 'Catálogo completo', id: 'catalog' },
              { label: 'Quiénes somos', id: 'about' },
              { label: 'Ubicación y tiendas', id: 'location' }
            ].map((item, i) => (
              <button 
                key={i}
                onClick={() => {
                  handleNavClick(item.id);
                  setIsMenuOpen(false);
                }}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  textAlign: 'left', 
                  fontSize: '1.1rem', 
                  fontWeight: '400', 
                  cursor: 'pointer', 
                  color: 'var(--text-color)',
                  padding: '5px 0',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.color = 'var(--text-color)'}
                onMouseOut={(e) => e.target.style.color = 'var(--text-color)'}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BACKDROP FOR MENU */}
      {isMenuOpen && (
        <div 
          onClick={() => setIsMenuOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10001, backdropFilter: 'blur(4px)' }}
        />
      )}
    </>
  );
};
