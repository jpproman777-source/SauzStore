import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Shield, User as UserIcon, Lock } from 'lucide-react';

export const Header = ({ activePage, setActivePage, searchQuery, setSearchQuery }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { cart, setIsCartOpen } = useCart();
  const { user, isAdmin, isClient, setIsLoginOpen, setIsProfileOpen, logout } = useAuth();

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

  const handleProfileClick = () => {
    handleNavClick('adminLogin');
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
              style={{ 
                letterSpacing: '4px', 
                fontSize: '1.2rem', 
                color: isCoverMode ? '#ffffff' : '#111111', 
                textShadow: isCoverMode ? '0 2px 10px rgba(0,0,0,0.6)' : 'none',
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                fontWeight: '900',
                transition: 'color 0.3s ease'
              }}
            >
              SAUZSTORE
            </button>
          </div>

          {/* RIGHT: User Profile (Muñeco) & Cart */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'flex-end' }}>
            {/* Botón de Perfil / Login (Muñeco) */}
            <button 
              type="button" 
              onClick={handleProfileClick}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'inherit', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center',
                position: 'relative',
                padding: '4px'
              }}
              aria-label={user ? `Usuario: ${user.name}` : 'Iniciar Sesión'}
              title={user ? `${user.name} (${user.role === 'admin' ? 'Administrador' : 'Cliente'}) - Clic para ver portal de acceso` : 'Iniciar Sesión'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={user ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              {user && (
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: isAdmin ? '#171717' : '#15803D'
                  }}
                />
              )}
            </button>

            {/* Carrito */}
            <button 
              type="button" 
              onClick={() => setIsCartOpen(true)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'inherit', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center',
                position: 'relative'
              }}
              aria-label="Carrito de compras"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                <circle cx="9" cy="21" r="1.5"></circle>
                <circle cx="20" cy="21" r="1.5"></circle>
              </svg>
              {cart?.count > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-7px',
                    right: '-8px',
                    backgroundColor: '#111111',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '10px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid #ffffff'
                  }}
                >
                  {cart.count}
                </span>
              )}
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
                onMouseOver={(e) => e.target.style.color = '#888'}
                onMouseOut={(e) => e.target.style.color = 'var(--text-color)'}
              >
                {item.label}
              </button>
            ))}

            {/* Accesos especiales según Rol */}
            {isAdmin && (
              <button
                onClick={() => {
                  handleNavClick('admin');
                  setIsMenuOpen(false);
                }}
                style={{
                  background: '#111111',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '10px'
                }}
              >
                <Shield size={16} />
                <span>Panel de Control (Admin)</span>
              </button>
            )}

            {!isAdmin && (
              <button
                onClick={() => {
                  handleNavClick('adminLogin');
                  setIsMenuOpen(false);
                }}
                style={{
                  background: 'none',
                  border: '1px solid #E7E7E7',
                  color: 'var(--text-color)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '6px'
                }}
              >
                <Lock size={15} />
                <span>Acceso Administrativo</span>
              </button>
            )}

            {isClient && (
              <button
                onClick={() => {
                  setIsProfileOpen(true);
                  setIsMenuOpen(false);
                }}
                style={{
                  background: '#f0f0f0',
                  color: '#111111',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  textAlign: 'left',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '6px'
                }}
              >
                <UserIcon size={16} />
                <span>Mis Pedidos y Perfil</span>
              </button>
            )}
          </div>

          {/* Sección Inferior de Usuario */}
          <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.82rem', color: '#666' }}>
                  Conectado como: <strong style={{ color: 'var(--text-color)' }}>{user.name}</strong> ({user.role})
                </div>
                <button
                  type="button"
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#dc2626',
                    textAlign: 'left',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    padding: '4px 0'
                  }}
                >
                  Cerrar Sesión →
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => { setIsLoginOpen(true); setIsMenuOpen(false); }}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#111111',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  cursor: 'pointer'
                }}
              >
                Iniciar Sesión / Registrarse
              </button>
            )}
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
