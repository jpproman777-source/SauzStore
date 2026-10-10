import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ReceiptModal } from './components/ReceiptModal';
import { Toast } from './components/Toast';
import { SupportChat } from './components/SupportChat';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { About } from './pages/About';
import { Location } from './pages/Location';
import { ProductDetail } from './pages/ProductDetail';

export const App = () => {
  const [activePage, setActivePage] = useState('home'); // 'home' | 'catalog' | 'about' | 'location' | 'productDetail'
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(null);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setActivePage('catalog');
  };

  const handleProductSelect = (productId) => {
    setSelectedProductId(productId);
    setActivePage('productDetail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      {/* Encabezado y navegación */}
      <Header
        activePage={activePage}
        setActivePage={setActivePage}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Vistas según página activa */}
      {activePage === 'home' && (
        <Home
          setActivePage={setActivePage}
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
          setActivePage={setActivePage}
        />
      )}

      {activePage === 'about' && (
        <About setActivePage={setActivePage} />
      )}

      {activePage === 'location' && (
        <Location />
      )}

      {/* Pie de página */}
      <Footer
        setActivePage={setActivePage}
        onCategorySelect={handleCategorySelect}
      />

      {/* Componentes Globales de Comercio */}
      <CartDrawer />
      <CheckoutModal />
      <ReceiptModal />
      <Toast />
      <SupportChat />
    </div>
  );
};
