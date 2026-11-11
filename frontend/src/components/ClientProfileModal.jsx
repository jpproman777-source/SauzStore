import React, { useState, useEffect } from 'react';
import { ProductImage } from './ProductImage';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { addressService } from '../services/addressService';
import { orderService } from '../services/orderService';

export const ClientProfileModal = () => {
  const { user, isProfileOpen, setIsProfileOpen, logout, updateProfile } = useAuth();
  const { formatMoney } = useCart();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'profile' | 'addresses'
  const [clientOrders, setClientOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Estado para editar datos personales (US-16)
  const [profileForm, setProfileForm] = useState({
    name: '',
    lastName: '',
    phone: '',
    email: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  // Estado para registrar dirección (US-23)
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    recipient: '',
    phone: '',
    department: 'Antioquia',
    city: 'Medellín',
    neighborhood: '',
    address: '',
    complement: '',
    references: '',
    isDefault: true,
  });
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressMessage, setAddressMessage] = useState({ type: '', text: '' });

  // Cargar datos al abrir modal
  useEffect(() => {
    if (isProfileOpen && user) {
      const parts = (user.name || '').split(' ');
      setProfileForm({
        name: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
        phone: user.phone || '',
        email: user.email || '',
      });
      setProfileMessage({ type: '', text: '' });

      // Cargar órdenes
      if (user.email) {
        setLoadingOrders(true);
        orderService.getOrders({ email: user.email })
          .then((orders) => setClientOrders(orders || []))
          .catch((err) => console.error('Error cargando pedidos:', err))
          .finally(() => setLoadingOrders(false));
      }

      // Cargar direcciones (US-23)
      loadAddresses();
    }
  }, [isProfileOpen, user]);

  const loadAddresses = () => {
    if (!user?.id) return;
    setLoadingAddresses(true);
    addressService.getAddresses({ userId: user.id })
      .then((addrs) => {
        if (addrs) setAddresses(addrs);
      })
      .catch((err) => console.error('Error cargando direcciones:', err))
      .finally(() => setLoadingAddresses(false));
  };

  // Guardar datos personales (US-16)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      setProfileMessage({ type: 'error', text: 'El nombre es obligatorio.' });
      return;
    }
    if (!profileForm.email.trim() || !profileForm.email.includes('@')) {
      setProfileMessage({ type: 'error', text: 'Ingrese un correo electrónico válido.' });
      return;
    }

    setProfileSaving(true);
    setProfileMessage({ type: '', text: '' });
    try {
      const fullName = `${profileForm.name.trim()} ${profileForm.lastName.trim()}`.trim();
      await updateProfile({
        name: fullName,
        phone: profileForm.phone.trim(),
        email: profileForm.email.trim(),
      });
      setProfileMessage({ type: 'success', text: 'Datos personales actualizados exitosamente en SAUZ.' });
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.message || 'Error al actualizar datos.' });
    } finally {
      setProfileSaving(false);
    }
  };

  // Guardar nueva dirección (US-23)
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.recipient.trim() || !addressForm.address.trim() || !addressForm.city.trim()) {
      setAddressMessage({ type: 'error', text: 'Destinatario, ciudad y dirección son obligatorios.' });
      return;
    }

    setAddressSaving(true);
    setAddressMessage({ type: '', text: '' });
    try {
      const data = await addressService.addAddress({
        userId: user.id,
        ...addressForm,
      });

      setAddresses(data.addresses || []);
      setShowAddressForm(false);
      setAddressForm({
        recipient: '',
        phone: '',
        department: 'Antioquia',
        city: 'Medellín',
        neighborhood: '',
        address: '',
        complement: '',
        references: '',
        isDefault: false,
      });
      setAddressMessage({ type: 'success', text: 'Dirección guardada exitosamente.' });
    } catch (err) {
      setAddressMessage({ type: 'error', text: err.message });
    } finally {
      setAddressSaving(false);
    }
  };

  // Eliminar dirección
  const handleDeleteAddress = async (addressId) => {
    if (!confirm('¿Deseas eliminar esta dirección de entrega?')) return;
    try {
      const data = await addressService.deleteAddress(addressId, { userId: user.id });
      if (data.addresses) {
        setAddresses(data.addresses);
      }
    } catch (err) {
      console.error('Error eliminando dirección:', err);
    }
  };

  if (!isProfileOpen || !user) return null;

  return (
    <div className="modal-backdrop open" role="dialog" aria-modal="true" style={{ zIndex: 10005 }}>
      <div
        className="modal-card"
        style={{
          maxWidth: '720px',
          width: '95%',
          maxHeight: '92vh',
          backgroundColor: '#0c0c0e',
          borderRadius: '16px',
          boxShadow: '0 30px 80px rgba(0,0,0,0.85)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '22px 28px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, #16161a 0%, #0e0e12 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #e65a5d 0%, #1a1a1f 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: '800',
                border: '1px solid rgba(230,90,93,0.4)',
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.01em' }}>
                {user.name}
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#8e8e99' }}>
                {user.email} · Rol: <strong style={{ color: '#e65a5d', textTransform: 'capitalize' }}>{user.role}</strong>
              </span>
            </div>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setIsProfileOpen(false)}
            aria-label="Cerrar modal"
            style={{ color: '#ffffff', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Tabs de Navegación del Perfil */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            background: '#111114',
            padding: '0 28px',
            gap: '8px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '14px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'orders' ? '2px solid #e65a5d' : '2px solid transparent',
              color: activeTab === 'orders' ? '#ffffff' : '#8e8e99',
              fontWeight: activeTab === 'orders' ? '700' : '500',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>📦 Mis Pedidos</span>
            <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '10px' }}>
              {clientOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '14px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'profile' ? '2px solid #e65a5d' : '2px solid transparent',
              color: activeTab === 'profile' ? '#ffffff' : '#8e8e99',
              fontWeight: activeTab === 'profile' ? '700' : '500',
              fontSize: '0.88rem',
              cursor: 'pointer',
            }}
          >
            👤 Mis Datos (US-16)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            style={{
              padding: '14px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'addresses' ? '2px solid #e65a5d' : '2px solid transparent',
              color: activeTab === 'addresses' ? '#ffffff' : '#8e8e99',
              fontWeight: activeTab === 'addresses' ? '700' : '500',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>📍 Direcciones (US-23)</span>
            <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '10px' }}>
              {addresses.length}
            </span>
          </button>
        </div>

        {/* Contenido según pestaña activa */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {/* ================= PESTAÑA 1: MIS PEDIDOS (US-24) ================= */}
          {activeTab === 'orders' && (
            <div>
              {loadingOrders ? (
                <p style={{ textAlign: 'center', padding: '40px', color: '#8e8e99' }}>Cargando tus órdenes...</p>
              ) : clientOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#131316', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '10px' }}>🛍️</span>
                  <h5 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700' }}>Aún no has realizado pedidos</h5>
                  <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#8e8e99' }}>
                    Explora el catálogo de Sauz Store Black Edition y arma tu próximo look urbano.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {clientOrders.map((ord) => {
                    const isExpanded = expandedOrderId === ord.orderId;
                    const statusColorMap = {
                      Entregado: { bg: '#052e16', text: '#4ade80', border: '#15803d' },
                      Enviado: { bg: '#082f49', text: '#38bdf8', border: '#0284c7' },
                      'En proceso': { bg: '#422006', text: '#fde047', border: '#a16207' },
                      Pendiente: { bg: '#27272a', text: '#e4e4e7', border: '#52525b' },
                      Cancelado: { bg: '#450a0a', text: '#f87171', border: '#b91c1c' },
                    };
                    const statusStyle = statusColorMap[ord.orderStatus] || statusColorMap['En proceso'];

                    return (
                      <div
                        key={ord.orderId}
                        style={{
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '12px',
                          padding: '18px 20px',
                          backgroundColor: '#121215',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', marginBottom: '12px' }}>
                          <div>
                            <span style={{ fontWeight: '800', fontSize: '0.98rem', color: '#ffffff', letterSpacing: '0.04em' }}>
                              {ord.orderId}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: '#8e8e99', display: 'block', marginTop: '2px' }}>{ord.date}</span>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.72rem',
                                fontWeight: '800',
                                backgroundColor: statusStyle.bg,
                                color: statusStyle.text,
                                border: `1px solid ${statusStyle.border}`,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                              }}
                            >
                              ● {ord.orderStatus || 'En proceso'}
                            </span>
                            <div style={{ fontWeight: '800', fontSize: '1.05rem', marginTop: '6px', color: '#ffffff' }}>
                              {formatMoney(ord.total)}
                            </div>
                          </div>
                        </div>

                        {/* Dirección de entrega si existe */}
                        {ord.shippingAddress && (
                          <div style={{ fontSize: '0.78rem', color: '#a1a1aa', marginBottom: '12px', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px' }}>
                            📍 <strong>Entrega:</strong> {ord.shippingAddress.address}, {ord.shippingAddress.neighborhood ? `${ord.shippingAddress.neighborhood}, ` : ''}{ord.shippingAddress.city} — Destinatario: {ord.shippingAddress.recipient}
                          </div>
                        )}

                        {/* Items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {(ord.items || []).map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.84rem' }}>
                              <div style={{ width: '40px', height: '46px', backgroundColor: '#000', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                                <ProductImage mode="thumb" src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <span style={{ fontWeight: '600', color: '#ffffff', display: 'block' }}>{item.name}</span>
                                <span style={{ color: '#8e8e99', fontSize: '0.75rem' }}>
                                  {item.selectedSize ? `Talla: ${item.selectedSize} · ` : ''}
                                  {item.selectedColor ? `Color: ${item.selectedColor} · ` : ''}
                                  {item.quantity} ud(s) × {formatMoney(item.price)}
                                </span>
                              </div>
                              <span style={{ fontWeight: '700', color: '#ffffff' }}>
                                {formatMoney(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Timeline de Seguimiento (US-24) */}
                        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                          <button
                            type="button"
                            onClick={() => setExpandedOrderId(isExpanded ? null : ord.orderId)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#e65a5d',
                              fontSize: '0.78rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: 0,
                            }}
                          >
                            <span>{isExpanded ? '▲ Ocultar seguimiento del pedido' : '▼ Ver seguimiento y estados del pedido'}</span>
                          </button>

                          {isExpanded && (
                            <div style={{ marginTop: '12px', padding: '12px 14px', background: '#0a0a0c', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <h6 style={{ margin: '0 0 10px', fontSize: '0.8rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Historial de rastreo oficial SAUZ
                              </h6>
                              {ord.trackingHistory && ord.trackingHistory.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                  {ord.trackingHistory.map((step, sIdx) => (
                                    <div key={sIdx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', position: 'relative' }}>
                                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e65a5d', marginTop: '5px', flexShrink: 0 }} />
                                      <div>
                                        <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#ffffff' }}>
                                          {step.status}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
                                          {step.note || 'Actualización de logística'}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#71717a' }}>
                                          {step.dateFormatted || step.timestamp} {step.location ? `· ${step.location}` : ''}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p style={{ margin: 0, fontSize: '0.78rem', color: '#71717a' }}>
                                  Pedido en cola de despacho. Seguimiento en tiempo real disponible tras la recolección del operador.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= PESTAÑA 2: EDITAR DATOS PERSONALES (US-16) ================= */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>Información de la Cuenta</h4>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#8e8e99' }}>
                  Edita tus datos personales para agilizar tus compras y envíos en toda Colombia.
                </p>
              </div>

              {profileMessage.text && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    background: profileMessage.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                    color: profileMessage.type === 'success' ? '#4ade80' : '#f87171',
                    border: profileMessage.type === 'success' ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.3)',
                  }}
                >
                  {profileMessage.text}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#141418',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Apellidos
                  </label>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#141418',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Teléfono Móvil (WhatsApp) *
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="300 123 4567"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#141418',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#141418',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={profileSaving}
                  style={{
                    padding: '12px 24px',
                    background: '#e65a5d',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '0.88rem',
                    cursor: profileSaving ? 'wait' : 'pointer',
                    letterSpacing: '0.04em',
                  }}
                >
                  {profileSaving ? 'Guardando...' : 'Guardar Cambios (US-16)'}
                </button>
              </div>
            </form>
          )}

          {/* ================= PESTAÑA 3: DIRECCIONES DE ENTREGA (US-23) ================= */}
          {activeTab === 'addresses' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>Direcciones de Entrega Guardadas</h4>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#8e8e99' }}>
                    Administra tus lugares de entrega para seleccionarlos con un clic en el checkout.
                  </p>
                </div>
                {!showAddressForm && (
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(true)}
                    style={{
                      padding: '8px 14px',
                      background: 'rgba(230,90,93,0.15)',
                      color: '#e65a5d',
                      border: '1px solid rgba(230,90,93,0.3)',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    + Nueva Dirección
                  </button>
                )}
              </div>

              {addressMessage.text && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    marginBottom: '14px',
                    background: addressMessage.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                    color: addressMessage.type === 'success' ? '#4ade80' : '#f87171',
                  }}
                >
                  {addressMessage.text}
                </div>
              )}

              {/* Formulario para agregar dirección */}
              {showAddressForm && (
                <form
                  onSubmit={handleSaveAddress}
                  style={{
                    background: '#121216',
                    border: '1px solid rgba(230,90,93,0.3)',
                    borderRadius: '12px',
                    padding: '18px 20px',
                    marginBottom: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <h5 style={{ margin: 0, fontSize: '0.92rem', color: '#e65a5d', fontWeight: '800' }}>
                    Registrar Nueva Dirección Colombiana (US-23)
                  </h5>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '4px' }}>
                        Destinatario *
                      </label>
                      <input
                        type="text"
                        value={addressForm.recipient}
                        onChange={(e) => setAddressForm({ ...addressForm, recipient: e.target.value })}
                        required
                        placeholder="Nombre de quien recibe"
                        style={{ width: '100%', padding: '8px 12px', background: '#18181d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '4px' }}>
                        Teléfono de Contacto
                      </label>
                      <input
                        type="tel"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        placeholder="300 000 0000"
                        style={{ width: '100%', padding: '8px 12px', background: '#18181d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '4px' }}>
                        Departamento *
                      </label>
                      <input
                        type="text"
                        value={addressForm.department}
                        onChange={(e) => setAddressForm({ ...addressForm, department: e.target.value })}
                        required
                        placeholder="Ej. Antioquia"
                        style={{ width: '100%', padding: '8px 12px', background: '#18181d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '4px' }}>
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        required
                        placeholder="Ej. Medellín"
                        style={{ width: '100%', padding: '8px 12px', background: '#18181d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '4px' }}>
                        Barrio
                      </label>
                      <input
                        type="text"
                        value={addressForm.neighborhood}
                        onChange={(e) => setAddressForm({ ...addressForm, neighborhood: e.target.value })}
                        placeholder="Ej. El Poblado"
                        style={{ width: '100%', padding: '8px 12px', background: '#18181d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '4px' }}>
                      Dirección Completa *
                    </label>
                    <input
                      type="text"
                      value={addressForm.address}
                      onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                      required
                      placeholder="Calle 10 # 43E - 20"
                      style={{ width: '100%', padding: '8px 12px', background: '#18181d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '4px' }}>
                        Complemento (Apto, Torre, Int)
                      </label>
                      <input
                        type="text"
                        value={addressForm.complement}
                        onChange={(e) => setAddressForm({ ...addressForm, complement: e.target.value })}
                        placeholder="Apto 402, Torre 1"
                        style={{ width: '100%', padding: '8px 12px', background: '#18181d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '4px' }}>
                        Referencias adicionales
                      </label>
                      <input
                        type="text"
                        value={addressForm.references}
                        onChange={(e) => setAddressForm({ ...addressForm, references: e.target.value })}
                        placeholder="Frente al parque, portón negro"
                        style={{ width: '100%', padding: '8px 12px', background: '#18181d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      style={{ padding: '8px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#8e8e99', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={addressSaving}
                      style={{ padding: '8px 16px', background: '#e65a5d', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '0.8rem', cursor: addressSaving ? 'wait' : 'pointer' }}
                    >
                      {addressSaving ? 'Guardando...' : 'Guardar Dirección'}
                    </button>
                  </div>
                </form>
              )}

              {/* Listado de direcciones */}
              {loadingAddresses ? (
                <p style={{ textAlign: 'center', padding: '30px', color: '#8e8e99' }}>Cargando direcciones...</p>
              ) : addresses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', background: '#121215', borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <p style={{ margin: 0, color: '#8e8e99', fontSize: '0.85rem' }}>No tienes direcciones guardadas. Registra una para tus compras.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      style={{
                        padding: '14px 16px',
                        background: '#131317',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#fff' }}>{addr.recipient}</span>
                          {addr.isDefault && (
                            <span style={{ fontSize: '0.68rem', background: 'rgba(230,90,93,0.2)', color: '#e65a5d', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                              PREDETERMINADA
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#d1d1d6', marginTop: '2px' }}>
                          {addr.address} {addr.complement ? `(${addr.complement})` : ''}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#8e8e99' }}>
                          {addr.neighborhood ? `${addr.neighborhood}, ` : ''}{addr.city}, {addr.department} · Tel: {addr.phone || 'Sin teléfono'}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        style={{
                          background: 'rgba(239,68,68,0.1)',
                          border: 'none',
                          color: '#f87171',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer con Cierre de Sesión Real (US-17) */}
        <div
          style={{
            padding: '16px 28px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(180deg, #0e0e12 0%, #16161a 100%)',
          }}
        >
          <button
            type="button"
            onClick={logout}
            style={{
              padding: '10px 18px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>🚪</span> Cerrar Sesión (US-17)
          </button>

          <button
            type="button"
            onClick={() => setIsProfileOpen(false)}
            style={{
              padding: '10px 22px',
              backgroundColor: '#ffffff',
              color: '#000000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
