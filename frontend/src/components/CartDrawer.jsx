import React, { useEffect } from 'react';
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

  useEffect(() => {
    if (!isCartOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsCartOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

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

      {/* 2. Premium Side Drawer */}
      {isCartOpen && cart.count > 0 && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsCartOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 10000,
            }}
          />
          {/* Drawer */}
          <div 
            className="cart-premium-drawer"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '100%',
              maxWidth: '420px',
              height: '100vh',
              backgroundColor: 'var(--bg-color)',
              borderLeft: '1px solid var(--border-color)',
              boxShadow: '-10px 0 40px rgba(0,0,0,0.8)',
              zIndex: 10001,
              display: 'flex',
              flexDirection: 'column',
              color: 'var(--text-color)',
              fontFamily: "'Inter', sans-serif",
              animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Header */}
            <div style={{ padding: '30px 40px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-color)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '3px' }}>Bolsa de Compras</h3>
              <button 
                onClick={() => setIsCartOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-color)', fontSize: '1.5rem', fontWeight: '100', transition: 'color 0.2s' }}
                onMouseOver={(e) => e.target.style.color = 'var(--gold-accent)'}
                onMouseOut={(e) => e.target.style.color = 'var(--text-color)'}
              >
                ✕
              </button>
            </div>

            {/* Warning banner */}
            <div style={{ padding: '15px 40px', backgroundColor: 'var(--panel-bg)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-color)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '0.5px' }}>
              <span style={{ color: 'var(--text-color)' }}>INFO</span> El pedido mínimo es de <strong style={{ color: 'var(--text-color)', fontWeight: '700' }}>$ 50.000</strong>.
            </div>

            {/* Items List */}
            <div style={{ flex: 1, padding: '20px 40px', overflowY: 'auto' }}>
              {cart.items.map((item) => (
                <div key={item.productId} style={{ display: 'flex', gap: '20px', marginBottom: '25px', paddingBottom: '25px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ width: '80px', height: '100px', backgroundColor: 'var(--panel-bg)', borderRadius: '0px', overflow: 'hidden' }}>
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingTop: '5px' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-color)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.name}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-color)', fontWeight: '400', letterSpacing: '1px' }}>{formatMoney(item.price)}</div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                      {/* Quantity controls */}
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '0px' }}>
                        <button 
                          style={{ padding: '5px 12px', background: 'transparent', color: 'var(--text-color)', border: 'none', borderRight: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '1rem', transition: 'color 0.2s' }}
                          onClick={() => {
                            if (item.quantity > 1) updateQuantity(item.productId, item.quantity - 1);
                            else removeItem(item.productId);
                          }}
                          onMouseOver={(e) => e.target.style.color = 'var(--gold-accent)'}
                          onMouseOut={(e) => e.target.style.color = 'var(--text-color)'}
                        >-</button>
                        <span style={{ padding: '0 15px', fontSize: '0.85rem', color: 'var(--text-color)', minWidth: '40px', textAlign: 'center' }}>{item.quantity}</span>
                        <button 
                          style={{ padding: '5px 12px', background: 'transparent', color: 'var(--text-color)', border: 'none', borderLeft: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '1rem', transition: 'color 0.2s' }}
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          onMouseOver={(e) => e.target.style.color = 'var(--gold-accent)'}
                          onMouseOut={(e) => e.target.style.color = 'var(--text-color)'}
                        >+</button>
                      </div>

                      <button 
                        onClick={() => removeItem(item.productId)}
                        style={{ background: 'transparent', color: 'var(--text-color)', border: 'none', padding: '5px', cursor: 'pointer', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', transition: 'color 0.2s' }}
                        onMouseOver={(e) => e.target.style.color = 'var(--gold-accent)'}
                        onMouseOut={(e) => e.target.style.color = 'var(--text-color)'}
                      >
                        REMOVER
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer & Total */}
            <div style={{ padding: '30px 40px', backgroundColor: 'var(--bg-color)', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-color)', fontWeight: '500' }}>Subtotal</span>
                <span style={{ color: 'var(--text-color)', fontSize: '1.1rem', fontWeight: '400', letterSpacing: '1px' }}>{formatMoney(cart.total)}</span>
              </div>
              
              <button
                onClick={handleCheckoutClick}
                style={{
                  width: '100%',
                  padding: '18px',
                  backgroundColor: 'var(--gold-accent)',
                  color: 'var(--bg-color)',
                  border: 'none',
                  borderRadius: '0px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '3px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = 'var(--gold-light)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'var(--gold-accent)'}
              >
                FINALIZAR COMPRA
              </button>
            </div>
          </div>
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </>
      )}
    </>
  );
};
