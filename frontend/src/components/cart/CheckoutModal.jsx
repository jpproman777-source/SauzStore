import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { addressService } from '../../services/addressService';
import { LockKeyhole, CreditCard, Smartphone, Banknote, ArrowRight, Check, ShoppingBag } from 'lucide-react';
import { ProductImage } from '../catalog/ProductImage';
import { notifyAlert } from '../../lib/alerts';
import './checkout-premium.css';

export const CheckoutModal = () => {
  const {
    cart,
    isCheckoutOpen,
    setIsCheckoutOpen,
    formatMoney,
    processCheckout
  } = useCart();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'transfer' | 'cash'
  const [loading, setLoading] = useState(false);

  // Datos de envío (US-23)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Antioquia',
    city: 'Medellín',
    neighborhood: '',
    address: '',
    complement: '',
    notes: '',
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  const applyAddress = (addr) => {
    if (!addr) return;
    setSelectedAddressId(addr.id);
    setFormData((prev) => ({
      ...prev,
      name: addr.recipient || prev.name,
      phone: addr.phone || prev.phone,
      department: addr.department || prev.department,
      city: addr.city || prev.city,
      neighborhood: addr.neighborhood || prev.neighborhood,
      address: addr.address || prev.address,
      complement: addr.complement || prev.complement,
      notes: addr.references || prev.notes,
    }));
  };

  // Cargar direcciones guardadas del cliente
  useEffect(() => {
    if (user && isCheckoutOpen) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
        city: user.city || prev.city || 'Medellín',
      }));

      if (user.id) {
        addressService.getAddresses({ userId: user.id })
          .then((addrs) => {
            if (addrs && addrs.length > 0) {
              setSavedAddresses(addrs);
              const def = addrs.find((a) => a.isDefault) || addrs[0];
              if (def) applyAddress(def);
            }
          })
          .catch((e) => console.error('Error cargando direcciones:', e));
      }
    }
  }, [user, isCheckoutOpen]);

  // Datos de tarjeta
  const [cardData, setCardData] = useState({
    number: '',
    holder: '',
    exp: '',
    cvv: ''
  });

  const [transferRef, setTransferRef] = useState('');

  const dialogRef = useRef(null);
  useEffect(() => {
    if (!isCheckoutOpen) return;
    const node = dialogRef.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    node.showModal();
    document.body.style.overflow = 'hidden';
    node.querySelector('.modal-close-btn')?.focus();
    return () => {
      node.close();
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    let formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardData((prev) => ({ ...prev, number: formatted }));
  };

  const handleCardExpChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardData((prev) => ({ ...prev, exp: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city) {
      await notifyAlert({
        title: 'Datos incompletos',
        text: 'Por favor completa todos los campos obligatorios de entrega.',
        icon: 'warning',
      });
      return;
    }

    let paymentPayload = {
      method: paymentMethod,
      details: {}
    };

    if (paymentMethod === 'card') {
      const rawNumber = cardData.number.replace(/\s/g, '');
      if (rawNumber.length < 15 || !cardData.holder || cardData.exp.length < 5 || cardData.cvv.length < 3) {
        await notifyAlert({
          title: 'Datos de tarjeta',
          text: 'Por favor completa todos los datos de tu tarjeta de crédito o débito.',
          icon: 'warning',
        });
        return;
      }
      paymentPayload.details = {
        cardLast4: rawNumber.slice(-4),
        holder: cardData.holder.trim(),
        exp: cardData.exp.trim()
      };
    } else if (paymentMethod === 'transfer') {
      paymentPayload.details = {
        reference: transferRef.trim() || 'Comprobante pendiente'
      };
    } else if (paymentMethod === 'cash') {
      paymentPayload.details = {
        notes: 'Pago en efectivo al mensajero'
      };
    }

    const shippingAddress = {
      recipient: formData.name.trim(),
      phone: formData.phone.trim(),
      department: (formData.department || 'Antioquia').trim(),
      city: formData.city.trim(),
      neighborhood: (formData.neighborhood || '').trim(),
      address: formData.address.trim(),
      complement: (formData.complement || '').trim(),
      references: (formData.notes || '').trim(),
    };

    const customerPayload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.complement
        ? `${formData.address.trim()} (${formData.complement.trim()})`
        : formData.address.trim(),
      city: formData.city.trim(),
      department: (formData.department || 'Antioquia').trim(),
      neighborhood: (formData.neighborhood || '').trim(),
      shippingAddress,
    };

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800)); // Simulación de procesamiento seguro
    await processCheckout(customerPayload, paymentPayload);
    setLoading(false);
  };

  return (
    <dialog ref={dialogRef} className="sauz-checkout-dialog" aria-labelledby="sauz-checkout-title" onCancel={event => { event.preventDefault(); if (!loading) setIsCheckoutOpen(false); }}>
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="11" width="14" height="9" rx="1.5" />
                <path d="M8 11V8a4 4 0 018 0v3" />
              </svg>
            </span>
            <div>
              <p className="checkout-kicker">SAUZ STORE / BLACK EDITION</p>
              <h3 id="sauz-checkout-title">FINALIZA TU COMPRA<span>.</span></h3>
            </div>
          </div>
          <button
            type="button"
            className="icon-btn modal-close-btn"
            onClick={() => setIsCheckoutOpen(false)}
            disabled={loading}
            aria-label="Cerrar ventana de pago"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="checkout-form-main">
          <div className="checkout-intro"><span>ENTREGA</span><span aria-hidden="true">/</span><span>PAGO</span><span aria-hidden="true">/</span><span>TU PEDIDO</span></div>
          {/* Paso 1: Datos de Entrega */}
          <div className="checkout-step">
            <div className="checkout-section-heading">
              <h4><span className="checkout-step-number">01</span> DATOS DE ENTREGA</h4>
              {user && (
                <span className="checkout-account-badge">
                  <Check size={12} aria-hidden="true" /> {user.name?.split(' ')[0] || 'Mi cuenta'}
                </span>
              )}
            </div>

            {/* Selector de direcciones guardadas (US-23) */}
            {savedAddresses.length > 0 && (
              <div style={{ marginBottom: '14px', background: '#16161b', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <label style={{ fontSize: '0.75rem', color: '#a1a1aa', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                  Usar dirección guardada:
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => applyAddress(addr)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        background: selectedAddressId === addr.id ? '#ff1724' : 'rgba(255,255,255,0.08)',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: selectedAddressId === addr.id ? '700' : '400',
                      }}
                    >
                      {addr.recipient} — {addr.address} ({addr.city})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="form-grid">
              <div className="form-group full">
                <label htmlFor="name">Nombre Completo del Destinatario *</label>
                <input
                  type="text"
                  id="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ej. Juan Pérez"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Correo Electrónico *</label>
                <input
                  type="email"
                  id="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="juan@ejemplo.com"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  id="phone"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="312 345 6789"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="department">Departamento *</label>
                <input
                  type="text"
                  id="department"
                  autoComplete="address-level1"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="Antioquia, Cundinamarca..."
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="city">Ciudad *</label>
                <input
                  type="text"
                  id="city"
                  autoComplete="address-level2"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Medellín, Bogotá, Cali..."
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="neighborhood">Barrio</label>
                <input
                  type="text"
                  id="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleInputChange}
                  placeholder="Ej. El Poblado, Laureles"
                />
              </div>
              <div className="form-group full">
                <label htmlFor="address">Dirección de Entrega Exacta *</label>
                <input
                  type="text"
                  id="address"
                  autoComplete="address-line1"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Calle 10 # 43E - 20"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="complement">Complemento (Apto, Torre, Int)</label>
                <input
                  type="text"
                  id="complement"
                  autoComplete="address-line2"
                  value={formData.complement}
                  onChange={handleInputChange}
                  placeholder="Apto 502, Torre B"
                />
              </div>
              <div className="form-group">
                <label htmlFor="notes">Referencias / Instrucciones</label>
                <input
                  type="text"
                  id="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Timbre, portería, portón negro..."
                />
              </div>
            </div>
          </div>

          {/* Paso 2: Método de Pago */}
          <div className="checkout-step">
            <h4><span className="checkout-step-number">02</span> MÉTODO DE PAGO</h4>
            <div className="payment-tabs" role="group" aria-label="Método de pago">
              <button
                type="button"
                className={`pay-tab ${paymentMethod === 'card' ? 'active' : ''}`}
                aria-pressed={paymentMethod === 'card'}
                onClick={() => setPaymentMethod('card')}
              >
                <CreditCard size={22} aria-hidden="true" /><span>Tarjeta<small>Débito / Crédito</small></span>
              </button>
              <button
                type="button"
                className={`pay-tab ${paymentMethod === 'transfer' ? 'active' : ''}`}
                aria-pressed={paymentMethod === 'transfer'}
                onClick={() => setPaymentMethod('transfer')}
              >
                <Smartphone size={22} aria-hidden="true" /><span>Transferencia<small>Nequi / Banco</small></span>
              </button>
              <button
                type="button"
                className={`pay-tab ${paymentMethod === 'cash' ? 'active' : ''}`}
                aria-pressed={paymentMethod === 'cash'}
                onClick={() => setPaymentMethod('cash')}
              >
                <Banknote size={22} aria-hidden="true" /><span>Contra entrega<small>Efectivo</small></span>
              </button>
            </div>

            {/* Panel Tarjeta */}
            {paymentMethod === 'card' && (
              <div className="payment-panel active">
                <div className="card-preview">
                  <div className="checkout-card-top"><div className="card-chip" /><span>SAUZ / CHECKOUT</span><CreditCard size={24} aria-hidden="true" /></div>
                  <div className="card-number-display">
                    {`•••• •••• •••• ${cardData.number.replace(/\s/g, '').slice(-4).padStart(4, '•')}`}
                  </div>
                  <div className="card-preview-bottom">
                    <div>
                      <div className="card-label">TITULAR</div>
                      <div className="card-val">{cardData.holder || 'TU NOMBRE'}</div>
                    </div>
                    <div>
                      <div className="card-label">VENCE</div>
                      <div className="card-val">{cardData.exp || 'MM/AA'}</div>
                    </div>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group full">
                    <label htmlFor="cardNumber">Número de Tarjeta</label>
                    <input
                      type="text"
                      id="cardNumber" inputMode="numeric"
                  autoComplete="cc-number"
                      value={cardData.number}
                      onChange={handleCardNumberChange}
                      maxLength="19"
                      placeholder="4532 0150 1234 5678"
                    />
                  </div>
                  <div className="form-group full">
                    <label htmlFor="cardHolder">Nombre en la Tarjeta</label>
                    <input
                      type="text"
                      id="cardHolder"
                  autoComplete="cc-name"
                      value={cardData.holder}
                      onChange={(e) => setCardData((prev) => ({ ...prev, holder: e.target.value.toUpperCase() }))}
                      placeholder="Como aparece en el plástico"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cardExp">Fecha Expiración (MM/AA)</label>
                    <input
                      type="text"
                      id="cardExp" inputMode="numeric"
                  autoComplete="cc-exp"
                      value={cardData.exp}
                      onChange={handleCardExpChange}
                      maxLength="5"
                      placeholder="12/28"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cardCvv">CVV / CVC</label>
                    <input
                      type="password"
                      id="cardCvv" inputMode="numeric"
                  autoComplete="cc-csc"
                      value={cardData.cvv}
                      onChange={(e) => setCardData((prev) => ({ ...prev, cvv: e.target.value.slice(0, 4) }))}
                      maxLength="4"
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Panel Transferencia */}
            {paymentMethod === 'transfer' && (
              <div className="payment-panel active">
                <div className="transfer-box">
                  <h5>Datos para transferir</h5>
                  <p>Realiza tu pago fácil y rápido por cualquiera de las siguientes opciones:</p>
                  <ul className="transfer-list">
                    <li><strong>Nequi / Daviplata:</strong> <span>312 987 6543</span> (Sauz Store SAS)</li>
                    <li><strong>Bancolombia Ahorros:</strong> <span>912-847291-03</span></li>
                    <li><strong>NIT:</strong> <span>901.458.329-1</span></li>
                  </ul>
                  <div className="form-group full" style={{ marginTop: '1rem' }}>
                    <label htmlFor="transferRef">Número de Referencia o Celular de Envío</label>
                    <input
                      type="text"
                      id="transferRef"
                      value={transferRef}
                      onChange={(e) => setTransferRef(e.target.value)}
                      placeholder="Ej. Comprobante M12984 o tu cel"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Panel Contra Entrega */}
            {paymentMethod === 'cash' && (
              <div className="payment-panel active">
                <div className="cash-box">
                  <h5>Pago en Efectivo Contra Entrega</h5>
                  <p>Pagas en efectivo al mensajero en el momento exacto en que recibas tus prendas en tu puerta.</p>
                  <small style={{ color: 'var(--bf-text)' }}>Ten preparado el monto exacto para agilizar la entrega.</small>
                </div>
              </div>
            )}
          </div>

          {/* Barra inferior con total y botón */}
          </div>
          <aside className="checkout-summary-bar" aria-label="Resumen del pedido">
            <p className="checkout-kicker">TU SELECCIÓN</p>
            <h4><ShoppingBag size={20} aria-hidden="true" /> Resumen del pedido</h4>
            <div className="checkout-order-items">
              {cart.items.map(item => <div className="checkout-order-item" key={`${item.productId}-${item.variantId}`}>
                <ProductImage src={item.image} alt={item.name} mode="thumb" />
                <div><p>{item.name}</p><small>Talla {item.size} · Cantidad {item.quantity}</small><strong>{formatMoney(item.price * item.quantity)}</strong></div>
              </div>)}
            </div>
            <dl className="checkout-breakdown"><div><dt>Subtotal</dt><dd>{formatMoney(cart.subtotal)}</dd></div><div><dt>Impuestos</dt><dd>{formatMoney(cart.tax)}</dd></div></dl>
            <div className="checkout-total-info">
              <span>Total <small>COP</small></span>
              <strong>{formatMoney(cart.total)}</strong>
            </div>
            <button
              type="submit"
              className="btn btn-dark pay-btn"
              disabled={loading}
            >
              {loading ? 'Procesando…' : <><span>Confirmar pedido</span><ArrowRight size={18} aria-hidden="true" /></>}
            </button>
            <p className="checkout-currency-note"><LockKeyhole size={13} aria-hidden="true" /> Todos los importes están en pesos colombianos.</p>
          </aside>
        </form>
      </div>
    </dialog>
  );
};
