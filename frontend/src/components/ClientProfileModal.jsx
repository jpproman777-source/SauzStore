import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const ClientProfileModal = () => {
  const { user, isProfileOpen, setIsProfileOpen, logout } = useAuth();
  const { formatMoney } = useCart();
  const [clientOrders, setClientOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isProfileOpen && user?.email) {
      setLoading(true);
      fetch(`/api/orders?email=${encodeURIComponent(user.email)}`)
        .then(res => res.json())
        .then(data => {
          setClientOrders(data.orders || []);
        })
        .catch(err => {
          console.error('Error al cargar órdenes del cliente:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [isProfileOpen, user]);

  if (!isProfileOpen || !user) return null;

  return (
    <div className="modal-backdrop open" role="dialog" aria-modal="true" style={{ zIndex: 10005 }}>
      <div
        className="modal-card"
        style={{
          maxWidth: '650px',
          width: '94%',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
          border: '1px solid #e5e5e5',
          color: '#111111',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 28px',
            borderBottom: '1px solid #eeeeee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#fafafa'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: '#111111',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: '800'
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#111111' }}>
                {user.name}
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#666666' }}>
                {user.email} · Rol: <strong style={{ color: '#111111', textTransform: 'capitalize' }}>{user.role}</strong>
              </span>
            </div>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setIsProfileOpen(false)}
            aria-label="Cerrar modal"
            style={{ color: '#111111' }}
          >
            ✕
          </button>
        </div>

        {/* Datos del Cliente */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #eeeeee', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#888888', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Teléfono</span>
              <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>{user.phone || 'No registrado'}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#888888', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Ciudad</span>
              <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>{user.city || 'Medellín'}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#888888', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Dirección de Entrega</span>
              <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>{user.address || 'Sin dirección guardada'}</span>
            </div>
          </div>
        </div>

        {/* Listado de Pedidos del Cliente */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              📦 Mis Pedidos ({clientOrders.length})
            </h4>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '30px', color: '#888' }}>Cargando tus pedidos...</p>
          ) : clientOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#fafafa', borderRadius: '12px', border: '1px dashed #dddddd' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '10px' }}>🛍️</span>
              <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>Aún no has realizado pedidos</h5>
              <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#666' }}>
                Explora el catálogo de Sauz Store y estrena las mejores prendas urbanas.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {clientOrders.map((ord) => (
                <div
                  key={ord.orderId}
                  style={{
                    border: '1px solid #e5e5e5',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px', marginBottom: '12px' }}>
                    <div>
                      <span style={{ fontWeight: '800', fontSize: '0.92rem', color: '#111111', display: 'block' }}>
                        {ord.orderId}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#888888' }}>{ord.date}</span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          backgroundColor: ord.orderStatus === 'Entregado' ? '#dcfce7' : (ord.orderStatus === 'Enviado' ? '#e0f2fe' : '#fef9c3'),
                          color: ord.orderStatus === 'Entregado' ? '#166534' : (ord.orderStatus === 'Enviado' ? '#0369a1' : '#854d0e'),
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {ord.orderStatus || 'En proceso'}
                      </span>
                      <div style={{ fontWeight: '800', fontSize: '0.95rem', marginTop: '4px', color: '#111111' }}>
                        {formatMoney(ord.total)}
                      </div>
                    </div>
                  </div>

                  {/* Prendas del pedido */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(ord.items || []).map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.82rem' }}>
                        <div style={{ width: '38px', height: '44px', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: '600', color: '#111111', display: 'block' }}>{item.name}</span>
                          <span style={{ color: '#777777', fontSize: '0.75rem' }}>{item.quantity} ud(s) × {formatMoney(item.price)}</span>
                        </div>
                        <span style={{ fontWeight: '700', color: '#111111' }}>
                          {formatMoney(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 28px',
            borderTop: '1px solid #eeeeee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#fafafa'
          }}
        >
          <button
            type="button"
            onClick={logout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Cerrar Sesión
          </button>
          <button
            type="button"
            onClick={() => setIsProfileOpen(false)}
            style={{
              padding: '8px 20px',
              backgroundColor: '#111111',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

