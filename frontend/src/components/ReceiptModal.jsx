import React from 'react';
import { useCart } from '../context/CartContext';

export const ReceiptModal = () => {
  const { orderCompleted, setOrderCompleted, formatMoney } = useCart();

  if (!orderCompleted) return null;

  return (
    <div className="modal-backdrop open" role="dialog" aria-modal="true">
      <div className="modal-card receipt-card">
        <div className="receipt-header">
          <div className="receipt-check">✓</div>
          <h3>¡Pago Realizado con Éxito!</h3>
          <p>Tu orden ha sido confirmada en Sauz Store</p>
        </div>

        <div className="receipt-ticket">
          <div className="ticket-row">
            <span>Nº de Orden:</span>
            <strong>{orderCompleted.orderId}</strong>
          </div>
          <div className="ticket-row">
            <span>Fecha:</span>
            <span>{orderCompleted.date}</span>
          </div>
          <div className="ticket-row">
            <span>Cliente:</span>
            <strong>{orderCompleted.customer?.name}</strong>
          </div>
          <div className="ticket-row">
            <span>Envío a:</span>
            <span>{orderCompleted.customer?.address}, {orderCompleted.customer?.city}</span>
          </div>
          <div className="ticket-row">
            <span>Método de Pago:</span>
            <strong>{orderCompleted.payment?.label}</strong>
          </div>

          <div className="ticket-divider" />

          <div className="ticket-items">
            {orderCompleted.items?.map((item, idx) => (
              <div key={idx} className="ticket-item-row">
                <span>{item.quantity}x {item.name}</span>
                <strong>{formatMoney(item.price * item.quantity)}</strong>
              </div>
            ))}
          </div>

          <div className="ticket-divider" />

          <div className="ticket-row grand-total">
            <span>Total Pagado:</span>
            <strong>{formatMoney(orderCompleted.total)}</strong>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-dark btn-block continue-btn"
          onClick={() => setOrderCompleted(null)}
        >
          🛍️ Seguir Comprando en Sauz Store
        </button>
      </div>
    </div>
  );
};
