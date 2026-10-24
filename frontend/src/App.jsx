import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ReceiptModal } from './components/ReceiptModal';
import { Toast } from './components/Toast';
import { ClientProfileModal } from './components/ClientProfileModal';
import { AdminPanel } from './components/AdminPanel';
import { AdminLogin } from './components/AdminLogin';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { About } from './pages/About';
import { Location } from './pages/Location';
import { ProductDetail } from './pages/ProductDetail';
import { useAuth } from './context/AuthContext';

export const App = () => {
  const { user, isAdmin } = useAuth();

  // Determinar página inicial basada en la URL del navegador
  const getInitialPageFromUrl = () => {
    if (typeof window === 'undefined') return 'home';
    const rawPath = window.location.pathname.toLowerCase();
    const path = rawPath.replace(/\/+$/, '') || '/';
    if (path === '/admin/login') return 'adminLogin';
    if (path === '/admin') return 'admin';
    if (path === '/catalogo' || path === '/catalog') return 'catalog';
    if (path === '/nosotros' || path === '/about') return 'about';
    if (path === '/ubicacion' || path === '/location') return 'location';
    return 'home';
  };

  const [activePage, setActivePage] = useState(getInitialPageFromUrl);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Sincronizar URL del navegador y escuchar navegación hacia atrás/adelante
  useEffect(() => {
    const handlePopState = () => {
      const page = getInitialPageFromUrl();
      setActivePage(page);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Función de navegación segura
  const handleNavigate = (page) => {
    if (page === 'admin') {
      if (!user || user.role !== 'admin') {
        // Protección de ruta administrativa: si no es admin, redirigir al login exclusivo
        if (typeof window !== 'undefined' && window.history) {
          window.history.pushState(null, '', '/admin/login');
        }
        setActivePage('adminLogin');
        return;
      }
      if (typeof window !== 'undefined' && window.history) {
        window.history.pushState(null, '', '/admin');
      }
      setActivePage('admin');
      return;
    }

    if (page === 'adminLogin') {
      if (typeof window !== 'undefined' && window.history) {
        window.history.pushState(null, '', '/admin/login');
      }
      setActivePage('adminLogin');
      return;
    }

    // Rutas públicas
    let path = '/';
    if (page === 'catalog') path = '/catalogo';
    else if (page === 'about') path = '/nosotros';
    else if (page === 'location') path = '/ubicacion';

    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState(null, '', path);
    }
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    handleNavigate('catalog');
  };

  const handleProductSelect = (productId) => {
    setSelectedProductId(productId);
    handleNavigate('productDetail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==============================================================
  // RUTA 1: LOGIN ADMINISTRATIVO INDEPENDIENTE (/admin/login)
  // ==============================================================
  if (activePage === 'adminLogin') {
    return (
      <div className="admin-app-wrapper">
        <AdminLogin setActivePage={handleNavigate} />
        <Toast />
      </div>
    );
  }

  // ==============================================================
  // RUTA 2: PANEL DE ADMINISTRACIÓN PROTEGIDO (/admin)
  // ==============================================================
  if (activePage === 'admin') {
    if (!user || user.role !== 'admin') {
      return (
        <div className="admin-app-wrapper">
          <AdminLogin setActivePage={handleNavigate} />
          <Toast />
        </div>
      );
    }

    return (
      <div className="admin-app-wrapper">
        <AdminPanel setActivePage={handleNavigate} />
        <Toast />
      </div>
    );
  }

  // ==============================================================
  // RUTA 3: TIENDA PÚBLICA DE MODA (HOME, CATÁLOGO, PRODUCTO, ETC.)
  // ==============================================================
  return (
    <div className="app-container">
      {/* Encabezado y navegación */}
      <Header
        activePage={activePage}
        setActivePage={handleNavigate}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Vistas según página activa */}
      {activePage === 'home' && (
        <Home
          setActivePage={handleNavigate}
          onCategorySelect={handleCategorySelect}
          onProductSelect={handleProductSelect}
        />
      )}

      {activePage === 'catalog' && (
        <Catalog
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onProductSelect={handleProductSelect}
        />
      )}

      {activePage === 'productDetail' && selectedProductId && (
        <ProductDetail
          productId={selectedProductId}
          setActivePage={handleNavigate}
        />
      )}

      {activePage === 'about' && (
        <About setActivePage={handleNavigate} />
      )}

      {activePage === 'location' && (
        <Location />
      )}

      {/* Pie de página */}
      <Footer
        setActivePage={handleNavigate}
        onCategorySelect={handleCategorySelect}
      />

      {/* Componentes Globales de Comercio y Autenticación de Clientes */}
      <CartDrawer setActivePage={handleNavigate} />
      <CheckoutModal />
      <ReceiptModal />
      <Toast />
      <ClientProfileModal />
    </div>
  );
};
