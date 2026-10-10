import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext';

export const ProductDetail = ({ productId, setActivePage }) => {
  const { products, addToCart, formatMoney, setIsCartOpen } = useCart();
  const [adding, setAdding] = useState(false);
  const [selectedSize, setSelectedSize] = useState('M');
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center center', transform: 'scale(1)' });
  const [openAccordion, setOpenAccordion] = useState('details');

  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <div style={{ padding: '150px 40px', color: 'var(--text-color)', textAlign: 'center' }}>
        <h2>Producto no encontrado</h2>
        <button className="minimal-btn-outline" onClick={() => setActivePage('catalog')}>
          Volver al Catálogo
        </button>
      </div>
    );
  }

  const handleAdd = async () => {
    setAdding(true);
    await addToCart(product.id, 1, selectedSize); // Passing size assuming cart can handle it or just ignoring it
    setAdding(false);
    setIsCartOpen(true);
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2.5)' // Magnification level
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: 'center center',
      transform: 'scale(1)'
    });
  };

  const toggleAccordion = (section) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  return (
    <main className="product-detail-page">
      <div className="product-detail-container">
        
        {/* LEFT COLUMN: Title, Price & Accordions */}
        <div className="detail-col left-col">
          <h1 className="detail-title">{product.name}</h1>
          <p className="detail-price">{formatMoney(product.price)}</p>
          
          <div className="accordions">
            <div className="accordion-item">
              <button className="accordion-btn" onClick={() => toggleAccordion('details')}>
                <span>Detalles del Producto</span>
                <span>{openAccordion === 'details' ? '−' : '+'}</span>
              </button>
              <div className={`accordion-content ${openAccordion === 'details' ? 'open' : ''}`}>
                <p>{product.description || 'Prenda exclusiva de alto gramaje diseñada para máxima comodidad y estética.'}</p>
                <p>Materiales premium y nuestro característico corte oversized.</p>
              </div>
            </div>
            
            <div className="accordion-item">
              <button className="accordion-btn" onClick={() => toggleAccordion('shipping')}>
                <span>Envíos</span>
                <span>{openAccordion === 'shipping' ? '−' : '+'}</span>
              </button>
              <div className={`accordion-content ${openAccordion === 'shipping' ? 'open' : ''}`}>
                <p>Envío estándar gratis a nivel nacional en todos los pedidos.</p>
                <p>Entrega en 2-5 días hábiles. Opciones exprés disponibles al finalizar compra.</p>
              </div>
            </div>
            
            <div className="accordion-item">
              <button className="accordion-btn" onClick={() => toggleAccordion('returns')}>
                <span>Cambios y Devoluciones</span>
                <span>{openAccordion === 'returns' ? '−' : '+'}</span>
              </button>
              <div className={`accordion-content ${openAccordion === 'returns' ? 'open' : ''}`}>
                <p>30 días para devoluciones sin costo. Las prendas deben estar sin usar y con etiquetas originales.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Main Image with ML-style Zoom */}
        <div className="detail-col center-col">
          <div 
            className="zoom-wrapper"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img 
              src={product.image} 
              alt={product.name} 
              className="zoom-image"
              style={zoomStyle}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Size & Add to Cart */}
        <div className="detail-col right-col">
          <div className="size-selector">
            {['S', 'M', 'L', 'XL'].map((size) => (
              <button 
                key={size}
                className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>

          <button 
            className="add-to-cart-massive"
            onClick={handleAdd}
            disabled={adding || product.stock === 0}
          >
            {adding ? 'AGREGANDO...' : product.stock === 0 ? 'AGOTADO' : `AÑADIR AL CARRITO — ${formatMoney(product.price)}`}
          </button>
          
          <div className="payment-icons-display">
            <span className="pay-icon visa">VISA</span>
            <span className="pay-icon mc">MC</span>
            <span className="pay-icon amex">AMEX</span>
            <span className="pay-icon pyp">PAYPAL</span>
          </div>
        </div>

      </div>
    </main>
  );
};

