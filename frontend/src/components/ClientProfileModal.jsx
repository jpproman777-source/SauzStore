import React, { useState, useEffect, useRef } from 'react';
import { useFavorites } from '../hooks/useFavorites';
import { ProductCard } from './ProductCard';
import { OrderTracking } from './OrderTracking';
import { ProductImage } from './ProductImage';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { addressService } from '../services/addressService';
import { orderService } from '../services/orderService';
import { confirmAction } from '../lib/alerts';
import { Package, UserRound, MapPin, LogOut, X, ChevronDown, Check, ShoppingBag, ArrowRight, Heart, LayoutDashboard, ArrowLeft, Plus, RefreshCw } from 'lucide-react';
import './profile-premium.css';
import './account-dashboard.css';
import './account-controls.css';

export const ClientProfileModal = ({ pageMode = false, onNavigate, onProductSelect }) => {
  const { user, isProfileOpen, setIsProfileOpen, logout, updateProfile } = useAuth();
  const { formatMoney, products, cart } = useCart();
  const { ids: favoriteIds } = useFavorites();
  const visible = pageMode || isProfileOpen;

  const [activeTab, setActiveTab] = useState(pageMode ? 'overview' : 'orders'); // 'orders' | 'profile' | 'addresses'
  const [clientOrders, setClientOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [refreshVersion,setRefreshVersion] = useState(0);

  // Estado para editar datos personales
  const [profileForm, setProfileForm] = useState({
    name: '',
    lastName: '',
    phone: '',
    email: '',
    city: '',
    address: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  // Estado para registrar dirección
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
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

  const beginAddress = () => {
    setEditingAddressId(null);
    setAddressForm({ recipient:user?.name || '',phone:user?.phone || '',department:'Antioquia',city:user?.city || '',neighborhood:'',address:'',complement:'',references:'',isDefault:addresses.length===0 });
    setShowAddressForm(true);
    setAddressMessage({type:'',text:''});
  };

  // Refresh account information when the signed-in identity changes.
  useEffect(() => {
    if (!visible || !user) return;
    let active = true;
    const parts = (user.name || '').split(' ');
    setProfileForm({ name:parts[0] || '', lastName:parts.slice(1).join(' ') || '',phone:user.phone || '',email:user.email || '',city:user.city || '',address:user.address || '' });
    setProfileMessage({ type:'',text:'' });
    setClientOrders([]); setAddresses([]); setLoadError(''); setExpandedOrderId(null);
    setLoadingOrders(true); setLoadingAddresses(true);
    setShowAddressForm(false); setEditingAddressId(null);
    const requests = [
      user.email ? orderService.getOrders({ email:user.email }).then(orders => { if (active) setClientOrders(orders || []); }) : Promise.resolve(),
      user.id ? addressService.getAddresses({ userId:user.id }).then(addrs => { if (active) setAddresses(addrs || []); }) : Promise.resolve(),
    ];
    Promise.allSettled(requests).then(results => {
      if (!active) return;
      if (results.some(result => result.status === 'rejected')) setLoadError('No pudimos actualizar todos los datos. Vuelve a abrir tu cuenta para intentarlo de nuevo.');
      setLoadingOrders(false); setLoadingAddresses(false);
    });
    return () => { active = false; };
  }, [visible, user, refreshVersion]);

  // Guardar datos personales
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
        city: profileForm.city.trim(),
        address: profileForm.address.trim(),
      });
      setProfileMessage({ type: 'success', text: 'Datos personales actualizados exitosamente en SAUZ.' });
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.message || 'Error al actualizar datos.' });
    } finally {
      setProfileSaving(false);
    }
  };

  // Guardar nueva dirección
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.recipient.trim() || !addressForm.address.trim() || !addressForm.city.trim()) {
      setAddressMessage({ type: 'error', text: 'Destinatario, ciudad y dirección son obligatorios.' });
      return;
    }

    setAddressSaving(true);
    setAddressMessage({ type: '', text: '' });
    try {
      const payload = { userId: user.id, ...addressForm };
      const data = editingAddressId ? await addressService.updateAddress(editingAddressId, payload) : await addressService.addAddress(payload);

      setAddresses(data.addresses || []);
      setShowAddressForm(false);
      setEditingAddressId(null);
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
    const confirmed = await confirmAction({
      title: 'Eliminar dirección',
      text: '¿Deseas eliminar esta dirección de entrega?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      danger: true,
    });
    if (!confirmed) return;
    try {
      const data = await addressService.deleteAddress(addressId, { userId: user.id });
      if (data.addresses) {
        setAddresses(data.addresses);
      }
    } catch (err) {
      console.error('Error eliminando dirección:', err);
    }
  };

  const dialogRef = useRef(null);
  useEffect(() => {
    if (pageMode || !isProfileOpen || !user) return;
    const node = dialogRef.current, previous = document.activeElement;
    const overflow = document.body.style.overflow;
    node.showModal();
    document.body.style.overflow = 'hidden';
    node.querySelector('.sauz-profile-close')?.focus();
    return () => { node.close(); document.body.style.overflow = overflow; previous?.focus?.(); };
  }, [pageMode, isProfileOpen, Boolean(user)]);

  if (!visible || !user) return null;
  const Root = pageMode ? 'main' : 'dialog';
  const savedProducts = products.filter(product => favoriteIds.includes(String(product.id)));
  const latestOrder = clientOrders.filter(order => order.orderStatus !== 'Cancelado').sort((a,b)=>(Number(b.timestamp)||0)-(Number(a.timestamp)||0))[0];
  const navigation = [
    ['overview', 'Resumen', LayoutDashboard], ['favorites', 'Favoritos', Heart, savedProducts.length],
    ['bag', 'Mi bolsa', ShoppingBag, cart.count], ['orders', 'Mis pedidos', Package, clientOrders.length],
    ['profile', 'Mis datos', UserRound], ['addresses', 'Direcciones', MapPin, addresses.length],
  ];
  const titles = { overview:'TU ESPACIO SAUZ.', favorites:'TUS FAVORITOS.', bag:'TU SELECCIÓN.', orders:'TUS PEDIDOS.', profile:'TUS DATOS.', addresses:'TUS DIRECCIONES.' };
  const descriptions = {overview:'Tu selección y tus pedidos, siempre a mano.',favorites:'Guarda las piezas que hablan de ti.',bag:'Revisa las piezas que elegiste para tu próximo look.',orders:'Consulta tus compras y cada paso de su entrega.',profile:'Mantén tus datos de contacto al día.',addresses:'Elige dónde quieres recibir tu próxima selección.'};
  const close = () => pageMode ? onNavigate('home') : setIsProfileOpen(false);

  return (
    <Root ref={dialogRef} className={`sauz-profile-dialog ${pageMode ? 'sauz-account-page' : ''}`} aria-labelledby="sauz-profile-title" onCancel={event => { event.preventDefault(); setIsProfileOpen(false); }}>
      <div className="sauz-profile-shell">
        <header className="sauz-profile-header">
          <div className="sauz-profile-identity">
            <div className="sauz-profile-avatar" aria-hidden="true">{(user.name || 'S').charAt(0).toUpperCase()}</div>
            <div><p className="sauz-profile-kicker">SAUZ / MI CUENTA</p><h2 id="sauz-profile-title">{user.name}</h2><p className="sauz-profile-email">{user.email}</p></div>
          </div>
          <button type="button" className="sauz-profile-close" onClick={close} aria-label={pageMode ? "Volver a la tienda" : "Cerrar mi cuenta"}>{pageMode ? <ArrowLeft size={20} /> : <X size={20} />}</button>
        </header>
        <nav className="sauz-profile-nav" aria-label="Secciones de mi cuenta">
          {pageMode && <span className="account-nav-title">MI ESPACIO</span>}
          {navigation.filter(([key]) => pageMode || ['orders','profile','addresses'].includes(key)).map(([key,label,Icon,count]) => <button type="button" key={key} aria-pressed={activeTab === key} aria-controls="sauz-profile-content" onClick={() => setActiveTab(key)}><Icon size={18} aria-hidden="true" /><span>{label}</span>{count !== undefined && <b>{count}</b>}</button>)}
        </nav>
        {/* Contenido según pestaña activa */}
        <div id="sauz-profile-content" className="sauz-profile-content">
          {loadError && <p className="account-load-error" role="alert">{loadError}</p>}
          <div className="sauz-profile-section-title"><div><p className="sauz-profile-kicker">MI CUENTA / BLACK EDITION</p><h3>{titles[activeTab]}</h3><p className="account-section-description">{descriptions[activeTab]}</p></div>{['overview','orders'].includes(activeTab) && <button type="button" className="account-refresh" disabled={loadingOrders} onClick={() => setRefreshVersion(value=>value+1)}><RefreshCw size={15} aria-hidden="true" />{loadingOrders?'Consultando…':'Actualizar'}</button>}</div>
          {activeTab === 'overview' && <div className="account-overview">
            <p className="account-welcome">Hola, {user.name?.split(' ')[0]}. Aquí encuentras tu selección, tus pedidos y la información de tu cuenta.</p>
            <div className="account-stats">{[['favorites','Favoritos',savedProducts.length,Heart],['bag','En tu bolsa',cart.count,ShoppingBag],['orders','Mis pedidos',clientOrders.length,Package]].map(([key,label,count,Icon]) => <button key={key} type="button" onClick={() => setActiveTab(key)}><Icon size={20} aria-hidden="true" /><strong>{count}</strong><span>{label}<ArrowRight size={14} aria-hidden="true" /></span></button>)}</div>
            {latestOrder && <div className="account-latest-order"><div className="account-latest-heading"><h4>Tu pedido más reciente</h4><button className="account-view-orders" type="button" onClick={() => setActiveTab('orders')}><span>Ver mis pedidos</span><ArrowRight size={16} aria-hidden="true" /></button></div><OrderTracking key={latestOrder.orderId} order={latestOrder} compact /></div>}
            <div className="account-overview-info"><div><p className="sauz-profile-kicker">INFORMACIÓN PERSONAL</p><h4>{user.name}</h4><p>{user.email}</p><p>{user.phone || 'Añade un teléfono de contacto'}</p><button type="button" onClick={() => setActiveTab('profile')}>Editar mis datos <ArrowRight size={15} /></button></div><div><p className="sauz-profile-kicker">ENTREGA</p><h4>{addresses.length ? `${addresses.length} ${addresses.length === 1 ? 'dirección guardada' : 'direcciones guardadas'}` : '¿Dónde recibes tu estilo?'}</h4><p>{user.city || 'Agrega tu ciudad y tus direcciones de entrega.'}</p><button type="button" onClick={() => setActiveTab('addresses')}>Gestionar direcciones <ArrowRight size={15} /></button></div></div>
            <button type="button" className="account-explore" onClick={() => onNavigate('catalog')}>Seguir explorando <ArrowRight size={18} /></button>
          </div>}
          {activeTab === 'favorites' && <div><p className="account-help">Tus favoritos se guardan para esta cuenta en este navegador.</p>{savedProducts.length ? <div className="account-product-grid">{savedProducts.map(product => <ProductCard key={product.id} product={product} onProductSelect={onProductSelect} />)}</div> : <div className="account-empty"><Heart size={32} /><h4>Guarda lo que va contigo.</h4><p>Toca el corazón de un producto para encontrarlo aquí.</p><button type="button" onClick={() => onNavigate('catalog')}>Explorar catálogo <ArrowRight size={16} /></button></div>}</div>}
          {activeTab === 'bag' && <div>{cart.items.length ? <><p className="account-help">Productos seleccionados en tu bolsa actual. Revisa tallas y cantidades antes de continuar.</p><div className="account-bag-list">{cart.items.map(item => <article key={`${item.productId}-${item.variantId}`}><ProductImage src={item.image} alt={item.name} mode="thumb" /><div><h4>{item.name}</h4><p>Talla {item.size} · Cantidad {item.quantity}</p><strong>{formatMoney(item.price * item.quantity)}</strong></div><button type="button" aria-label={`Ver ${item.name}`} onClick={() => onProductSelect(item.productId)}><ArrowRight size={18} /></button></article>)}</div><button type="button" className="account-explore" onClick={() => onNavigate('cart')}>Gestionar mi bolsa <ArrowRight size={18} /></button></> : <div className="account-empty"><ShoppingBag size={32} /><h4>Tu próxima selección empieza aquí.</h4><button type="button" onClick={() => onNavigate('catalog')}>Explorar catálogo <ArrowRight size={16} /></button></div>}</div>}
          {/* ================= PESTAÑA 1: MIS PEDIDOS (US-24) ================= */}
          {activeTab === 'orders' && (
            <div>
              {loadingOrders ? (
                <p style={{ textAlign: 'center', padding: '40px', color: '#8e8e99' }}>Cargando tus órdenes...</p>
              ) : clientOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#131316', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '10px' }}><ShoppingBag size={36} aria-hidden="true" /></span>
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
                      Aceptado: { bg:'#251a1b',text:'var(--edition-accent, #ff1724)',border:'#6c4046' },
                      Enviado: { bg: '#082f49', text: '#38bdf8', border: '#0284c7' },
                      'En proceso': { bg: '#422006', text: '#fde047', border: '#a16207' },
                      Pendiente: { bg: '#27272a', text: '#e4e4e7', border: '#52525b' },
                      Cancelado: { bg: '#450a0a', text: 'var(--edition-accent, #ff1724)', border: '#ff1724' },
                    };
                    const statusStyle = statusColorMap[ord.orderStatus] || statusColorMap['En proceso'];

                    return (
                      <div
                        key={ord.orderId}
                        className="sauz-profile-order"
                        style={{
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '12px',
                          padding: '18px 20px',
                          backgroundColor: '#121215',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                        }}
                      >
                        <div className="sauz-profile-order-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', marginBottom: '12px' }}>
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
                            <div className="sauz-profile-order-total" style={{ fontWeight: '800', fontSize: '1.05rem', marginTop: '6px', color: '#ffffff' }}>
                              {formatMoney(ord.total)}
                            </div>
                          </div>
                        </div>

                        {/* Dirección de entrega si existe */}
                        {ord.shippingAddress && (
                          <div style={{ fontSize: '0.78rem', color: '#a1a1aa', marginBottom: '12px', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px' }}>
                            <MapPin size={14} aria-hidden="true" /> <strong>Entrega:</strong> {ord.shippingAddress.address}, {ord.shippingAddress.neighborhood ? `${ord.shippingAddress.neighborhood}, ` : ''}{ord.shippingAddress.city} — Destinatario: {ord.shippingAddress.recipient}
                          </div>
                        )}

                        <OrderTracking order={ord} />

                        {/* Items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {(ord.items || []).map((item, idx) => (
                            <div key={idx} className="sauz-profile-order-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.84rem' }}>
                              <div style={{ width: '60px', height: '60px', backgroundColor: '#000', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                                <ProductImage mode="thumb" src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <span style={{ fontWeight: '600', color: '#ffffff', display: 'block' }}>{item.name}</span>
                                <span style={{ color: '#8e8e99', fontSize: '0.75rem' }}>
                                  {(item.size || item.selectedSize) ? `Talla: ${item.size || item.selectedSize} · ` : ''}
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
                            className="sauz-profile-tracking"
                            aria-expanded={isExpanded}
                            onClick={() => setExpandedOrderId(isExpanded ? null : ord.orderId)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--edition-accent, #ff1724)',
                              fontSize: '0.78rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: 0,
                            }}
                          >
                            <span>{isExpanded ? 'Ocultar seguimiento' : 'Ver seguimiento del pedido'}</span><ChevronDown size={16} aria-hidden="true" />
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
                                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--edition-accent, #ff1724)', marginTop: '5px', flexShrink: 0 }} />
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
                                  Pedido en cola de despacho. Consulta aquí las actualizaciones registradas de tu pedido.
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

          {/* ================= PESTAÑA 2: EDITAR DATOS PERSONALES ================= */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>Información de la Cuenta</h4>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#8e8e99' }}>
                  Edita tus datos personales para agilizar tus compras y envíos en toda Colombia.
                </p>
              </div>

              {profileMessage.text && (
                <div role="status"
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    background: profileMessage.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(255, 23, 36,0.15)',
                    color: profileMessage.type === 'success' ? '#4ade80' : 'var(--edition-accent, #ff1724)',
                    border: profileMessage.type === 'success' ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255, 23, 36,0.3)',
                  }}
                >
                  {profileMessage.text}
                </div>
              )}

              <div className="sauz-profile-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label htmlFor="account-profileForm-name" style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Nombre *
                  </label>
                  <input id="account-profileForm-name"
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
                  <label htmlFor="account-profileForm-lastName" style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Apellidos
                  </label>
                  <input id="account-profileForm-lastName"
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
                <label htmlFor="account-profileForm-phone" style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Teléfono Móvil (WhatsApp) *
                </label>
                  <input id="account-profileForm-phone"
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
                <label htmlFor="account-profileForm-email" style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Correo Electrónico *
                </label>
                  <input id="account-profileForm-email"
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

              <div className="account-edit-fields"><label htmlFor="account-city">Ciudad<input id="account-city" autoComplete="address-level2" value={profileForm.city} onChange={e => setProfileForm({...profileForm,city:e.target.value})} /></label><label htmlFor="account-address">Dirección principal<input id="account-address" autoComplete="street-address" value={profileForm.address} onChange={e => setProfileForm({...profileForm,address:e.target.value})} /></label></div>
              <div className="account-identity"><h4>Identificación</h4><p>Los documentos y datos de identificación no se pueden modificar desde este apartado.</p><label htmlFor="account-identifier">Identificador de cuenta<input id="account-identifier" value={user.id ?? ''} readOnly /></label>{(user.documentNumber || user.document || user.identificationNumber) && <label htmlFor="account-document">Documento<input id="account-document" value={`••••${String(user.documentNumber || user.document || user.identificationNumber).slice(-4)}`} readOnly /></label>}</div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={profileSaving}
                  style={{
                    padding: '12px 24px',
                    background: 'var(--edition-accent, #ff1724)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '0.88rem',
                    cursor: profileSaving ? 'wait' : 'pointer',
                    letterSpacing: '0.04em',
                  }}
                >
                  {profileSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          )}

          {/* ================= PESTAÑA 3: DIRECCIONES DE ENTREGA ================= */}
          {activeTab === 'addresses' && (
            <div>
<div className="account-address-heading">
                <div>
                  <h4>Tu próxima entrega empieza aquí.</h4>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#8e8e99' }}>
                    Administra tus lugares de entrega para seleccionarlos con un clic en el checkout.
                  </p>
                </div>
                {!showAddressForm && (
                  <button
                    type="button"
                    className="account-new-address"
                    onClick={beginAddress}
                    style={{
                      padding: '8px 14px',
                      background: 'color-mix(in srgb, var(--edition-accent, #ff1724) 12%, transparent)',
                      color: 'var(--edition-accent, #ff1724)',
                      border: '1px solid color-mix(in srgb, var(--edition-accent, #ff1724) 40%, transparent)',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={16} aria-hidden="true" /> Nueva dirección
                  </button>
                )}
              </div>

              {addressMessage.text && (
                <div role="status"
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    marginBottom: '14px',
                    background: addressMessage.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(255, 23, 36,0.15)',
                    color: addressMessage.type === 'success' ? '#4ade80' : 'var(--edition-accent, #ff1724)',
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
                    border: '1px solid color-mix(in srgb, var(--edition-accent, #ff1724) 40%, transparent)',
                    borderRadius: '12px',
                    padding: '18px 20px',
                    marginBottom: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <h5 style={{ margin: 0, fontSize: '0.92rem', color: 'var(--edition-accent, #ff1724)', fontWeight: '800' }}>
                    {editingAddressId ? 'Editar dirección de entrega' : 'Nueva dirección de entrega'}
                  </h5>

                  <div className="sauz-profile-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label htmlFor="account-addressForm-recipient" style={{ display: 'block', fontSize: '0.72rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '4px' }}>
                        Destinatario *
                      </label>
                  <input id="account-addressForm-recipient"
                        type="text"
                        value={addressForm.recipient}
                        onChange={(e) => setAddressForm({ ...addressForm, recipient: e.target.value })}
                        required
                        placeholder="Nombre de quien recibe"
                        style={{ width: '100%', padding: '8px 12px', background: '#18181d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="account-addressForm-phone" style={{ display: 'block', fontSize: '0.72rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '4px' }}>
                        Teléfono de Contacto
                      </label>
                  <input id="account-addressForm-phone"
                        type="tel"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        placeholder="300 000 0000"
                        style={{ width: '100%', padding: '8px 12px', background: '#18181d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div className="sauz-profile-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label htmlFor="account-addressForm-department" style={{ display: 'block', fontSize: '0.72rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '4px' }}>
                        Departamento *
                      </label>
                  <input id="account-addressForm-department"
                        type="text"
                        value={addressForm.department}
                        onChange={(e) => setAddressForm({ ...addressForm, department: e.target.value })}
                        required
                        placeholder="Ej. Antioquia"
                        style={{ width: '100%', padding: '8px 12px', background: '#18181d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="account-addressForm-city" style={{ display: 'block', fontSize: '0.72rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '4px' }}>
                        Ciudad *
                      </label>
                  <input id="account-addressForm-city"
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        required
                        placeholder="Ej. Medellín"
                        style={{ width: '100%', padding: '8px 12px', background: '#18181d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="account-addressForm-neighborhood" style={{ display: 'block', fontSize: '0.72rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '4px' }}>
                        Barrio
                      </label>
                  <input id="account-addressForm-neighborhood"
                        type="text"
                        value={addressForm.neighborhood}
                        onChange={(e) => setAddressForm({ ...addressForm, neighborhood: e.target.value })}
                        placeholder="Ej. El Poblado"
                        style={{ width: '100%', padding: '8px 12px', background: '#18181d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="account-addressForm-address" style={{ display: 'block', fontSize: '0.72rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '4px' }}>
                      Dirección Completa *
                    </label>
                  <input id="account-addressForm-address"
                      type="text"
                      value={addressForm.address}
                      onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                      required
                      placeholder="Calle 10 # 43E - 20"
                      style={{ width: '100%', padding: '8px 12px', background: '#18181d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div className="sauz-profile-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label htmlFor="account-addressForm-complement" style={{ display: 'block', fontSize: '0.72rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '4px' }}>
                        Complemento (Apto, Torre, Int)
                      </label>
                  <input id="account-addressForm-complement"
                        type="text"
                        value={addressForm.complement}
                        onChange={(e) => setAddressForm({ ...addressForm, complement: e.target.value })}
                        placeholder="Apto 402, Torre 1"
                        style={{ width: '100%', padding: '8px 12px', background: '#18181d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="account-addressForm-references" style={{ display: 'block', fontSize: '0.72rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '4px' }}>
                        Referencias adicionales
                      </label>
                  <input id="account-addressForm-references"
                        type="text"
                        value={addressForm.references}
                        onChange={(e) => setAddressForm({ ...addressForm, references: e.target.value })}
                        placeholder="Frente al parque, portón negro"
                        style={{ width: '100%', padding: '8px 12px', background: '#18181d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <label className="account-default-address"><input type="checkbox" checked={addressForm.isDefault} onChange={e => setAddressForm({...addressForm,isDefault:e.target.checked})} /> Usar como dirección principal</label>
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
                      style={{ padding: '8px 16px', background: 'var(--edition-accent, #ff1724)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '0.8rem', cursor: addressSaving ? 'wait' : 'pointer' }}
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
                <div className="account-address-empty"><div className="account-address-symbol"><MapPin size={38} strokeWidth={1.3} aria-hidden="true" /><span className="account-address-dot" /></div><div><span className="sauz-profile-kicker">UN DESTINO PARA TU ESTILO</span><h4>¿Dónde recibes tu próxima selección?</h4><p>Guarda tu dirección una vez y selecciónala cuando hagas tu próxima compra.</p><button type="button" onClick={beginAddress}><Plus size={16} aria-hidden="true" /> Agregar mi primera dirección</button><div className="account-address-perks"><span><MapPin size={13} /> Datos de entrega</span><span><Check size={13} /> Dirección principal</span></div></div></div>
              ) : (
                <div className="account-address-grid">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="account-address-card"
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
                            <span style={{ fontSize: '0.68rem', background: 'color-mix(in srgb, var(--edition-accent, #ff1724) 12%, transparent)', color: 'var(--edition-accent, #ff1724)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
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

                      <div className="account-address-actions"><button type="button" onClick={() => { setEditingAddressId(addr.id); setAddressForm({ recipient:addr.recipient || '', phone:addr.phone || '', department:addr.department || '',city:addr.city || '',neighborhood:addr.neighborhood || '',address:addr.address || '',complement:addr.complement || '',references:addr.references || '',isDefault:Boolean(addr.isDefault) }); setShowAddressForm(true); }}>Editar</button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        style={{
                          background: 'rgba(255, 23, 36,0.1)',
                          border: 'none',
                          color: 'var(--edition-accent, #ff1724)',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        Eliminar
                      </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="sauz-profile-footer">
          <button type="button" className="sauz-profile-logout" onClick={logout}><LogOut size={16} aria-hidden="true" /> Cerrar sesión</button>
          <button type="button" className="sauz-profile-done" onClick={close}>{pageMode ? 'Volver a la tienda' : 'Listo'} <ArrowRight size={16} aria-hidden="true" /></button>
        </footer>
      </div>
    </Root>
  );
};
