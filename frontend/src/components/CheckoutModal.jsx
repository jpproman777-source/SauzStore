import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

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

  // Datos de envío
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Medellín',
    notes: ''
  });

  // Autocompletar con los datos del usuario conectado
  useEffect(() => {
    if (user && isCheckoutOpen) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
        city: user.city || prev.city || 'Medellín'
      }));
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
      alert('⚠️ Por favor completa todos los campos obligatorios de entrega (*)');
      return;
    }

    let paymentPayload = {
      method: paymentMethod,
      details: {}
    };

    if (paymentMethod === 'card') {
      const rawNumber = cardData.number.replace(/\s/g, '');
      if (rawNumber.length < 15 || !cardData.holder || cardData.exp.length < 5 || cardData.cvv.length < 3) {
        alert('⚠️ Por favor completa todos los datos de tu tarjeta de crédito o débito');
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

    const customerPayload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.notes ? `${formData.address.trim()} (${formData.notes.trim()})` : formData.address.trim(),
      city: formData.city.trim()
    };

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800)); // Simulación de procesamiento seguro
    await processCheckout(customerPayload, paymentPayload);
    setLoading(false);
  };

  return (
    <div className="modal-backdrop open" role="dialog" aria-modal="true">
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
              <h3>Pasarela de Pago Segura</h3>
              <p>Sauz Store Checkout Oficial</p>
            </div>
          </div>
          <button
            type="button"
            className="icon-btn modal-close-btn"
            onClick={() => setIsCheckoutOpen(false)}
            aria-label="Cerrar ventana de pago"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          {/* Paso 1: Datos de Entrega */}
          <div className="checkout-step">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0 }}>📍 1. Datos de Entrega</h4>
              {user && (
                <span style={{ fontSize: '0.72rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '12px', fontWeight: '700' }}>
                  ✓ Datos cargados de tu cuenta ({user.name.split(' ')[0]})
                </span>
              )}
            </div>
            <div className="form-grid">
              <div className="form-group full">
                <label htmlFor="name">Nombre Completo *</label>
                <input
                  type="text"
                  id="name"
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
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="312 345 6789"
                  required
                />
              </div>
              <div className="form-group full">
                <label htmlFor="address">Dirección de Entrega *</label>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Calle 45 # 12 - 34, Apto 302"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="city">Ciudad *</label>
                <input
                  type="text"
                  id="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Bogotá, Medellín, Cali..."
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="notes">Instrucciones (Opcional)</label>
                <input
                  type="text"
                  id="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Timbre, portería, etc."
                />
              </div>
            </div>
          </div>

          {/* Paso 2: Método de Pago */}
          <div className="checkout-step">
            <h4>💳 2. Elige tu Método de Pago</h4>
            <div className="payment-tabs">
              <button
                type="button"
                className={`pay-tab ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                💳 Tarjeta Débito / Crédito
              </button>
              <button
                type="button"
                className={`pay-tab ${paymentMethod === 'transfer' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('transfer')}
              >
                📱 Nequi / Transferencia
              </button>
              <button
                type="button"
                className={`pay-tab ${paymentMethod === 'cash' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('cash')}
              >
                💵 Contra Entrega
              </button>
            </div>

            {/* Panel Tarjeta */}
            {paymentMethod === 'card' && (
              <div className="payment-panel active">
                <div className="card-preview">
                  <div className="card-chip" />
                  <div className="card-number-display">
                    {cardData.number || '•••• •••• •••• ••••'}
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
                      id="cardNumber"
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
                      value={cardData.holder}
                      onChange={(e) => setCardData((prev) => ({ ...prev, holder: e.target.value.toUpperCase() }))}
                      placeholder="Como aparece en el plástico"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cardExp">Fecha Expiración (MM/AA)</label>
                    <input
                      type="text"
                      id="cardExp"
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
                      id="cardCvv"
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
                  <h5>📲 Datos para Transferir</h5>
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
                  <small style={{ color: '#111111' }}>Ten preparado el monto exacto para agilizar la entrega.</small>
                </div>
              </div>
            )}
          </div>

          {/* Barra inferior con total y botón */}
          <div className="checkout-summary-bar">
            <div className="checkout-total-info">
              <span>Total a Pagar:</span>
              <strong>{formatMoney(cart.total)}</strong>
            </div>
            <button
              type="submit"
              className="btn btn-dark pay-btn"
              disabled={loading}
            >
              {loading ? '⏳ Procesando pago seguro...' : 'Pagar Ahora 🔒'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
