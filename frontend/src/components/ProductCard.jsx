import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

export const ProductCard = ({ product, onProductSelect }) => {
  const { addToCart, formatMoney, setIsCartOpen } = useCart();
  const [adding, setAdding] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAdd = async (e) => {
    e.stopPropagation(); // prevent triggering onProductSelect
    setAdding(true);
    await addToCart(product.id, 1);
    setAdding(false);
    setIsCartOpen(true);
  };

  return (
    <div className="minimal-product-card" data-id={product.id}>
      <div 
        className="minimal-product-img-wrapper" 
        style={{ cursor: 'pointer' }}
        onClick={() => onProductSelect && onProductSelect(product.id)}
      >
        <img src={product.image} alt={product.name} />
      </div>
      
      <div className="minimal-product-info">
        <h3 className="minimal-product-title">{product.name.toUpperCase()}</h3>
        <p className="minimal-product-price">{formatMoney(product.price)}</p>
        
        <button
          type="button"
          className="minimal-btn-outline"
          style={{ marginTop: '10px', width: '100%', fontSize: '0.7rem', padding: '8px' }}
          onClick={handleAdd}
          disabled={adding || product.stock === 0}
        >
          {adding ? 'AGREGANDO...' : product.stock === 0 ? 'AGOTADO' : 'AÑADIR AL CARRITO'}
        </button>
      </div>
    </div>
  );
};
