import React from 'react';
import { useCart } from '../context/CartContext';

export const CartDrawer = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    formatMoney,
    setIsCheckoutOpen
  } = useCart();

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleClear = () => {
    if (window.confirm('¿Deseas vaciar todas las prendas de tu bolsa de compras?')) {
      clearCart();
    }
  };

  return (
    <>
      {/* Overlay de fondo */}
      <div
        className={`cart-overlay ${isCartOpen ? 'open' : ''}`}
        onClick={() => setIsCartOpen(false)}
        aria-hidden={!isCartOpen}
      />

      {/* Drawer deslizante */}
      <aside className={`cart-drawer ${isCartOpen ? 'open' : ''}`} aria-label="Bolsa de compras">
        <div className="drawer-header">
          <div className="drawer-title">
            <span>Tu Bolsa</span>
            <span className="drawer-badge">
              {cart.count} {cart.count === 1 ? 'prenda' : 'prendas'}
            </span>
          </div>
          <button
            type="button"
            className="icon-btn close-drawer-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Cerrar bolsa"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="cart-items">
          {cart.items.length === 0 ? (
            <div className="cart-empty">
              <h4>Tu bolsa está vacía</h4>
              <p>Agrega prendas exclusivas de Sauz Store para empezar tu compra.</p>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsCartOpen(false)}
              >
                Explorar catálogo
              </button>
            </div>
          ) : (
            cart.items.map((item) => (
              <div key={item.productId} className="cart-item">
                <div className="cart-item-icon">
                  {item.icon}
                </div>
                <div className="cart-item-details">
                  <div className="cart-item-name" title={item.name}>{item.name}</div>
                  <div className="cart-item-price">{formatMoney(item.price)} c/u</div>
                  <div className="cart-item-controls">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => {
                        if (item.quantity > 1) {
                          updateQuantity(item.productId, item.quantity - 1);
                        } else {
                          removeItem(item.productId);
                        }
                      }}
                      aria-label="Disminuir cantidad"
                    >
                      -
                    </button>
                    <span className="cart-item-qty">{item.quantity}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="qty-btn remove"
                      onClick={() => removeItem(item.productId)}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
                <div className="cart-item-total">{formatMoney(item.price * item.quantity)}</div>
              </div>
            ))
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="drawer-footer">
            <div className="cart-summary">
              <div className="summary-line">
                <span>Subtotal:</span>
                <strong>{formatMoney(cart.subtotal)}</strong>
              </div>
              <div className="summary-line">
                <span>IVA (16%):</span>
                <strong>{formatMoney(cart.tax)}</strong>
              </div>
              <div className="summary-line">
                <span>Envío:</span>
                <strong style={{ color: 'var(--gold)' }}>¡GRATIS!</strong>
              </div>
              <div className="summary-line total">
                <span>Total a pagar:</span>
                <strong>{formatMoney(cart.total)}</strong>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-dark btn-block checkout-btn"
              onClick={handleCheckoutClick}
            >
              Efectuar Pago
            </button>
            <button
              type="button"
              className="clear-btn"
              onClick={handleClear}
            >
              Vaciar bolsa
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
