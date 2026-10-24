import React from 'react';
import { useCart } from '../context/CartContext';

export const Toast = () => {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        backgroundColor: '#0A0A0A',
        color: '#FFFFFF',
        padding: '12px 20px',
        borderRadius: '6px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
        border: '1px solid rgba(255,255,255,0.15)',
        fontSize: '0.84rem',
        fontWeight: '500',
        zIndex: 10050,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        animation: 'toastIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <span style={{ width: '6px', height: '6px', backgroundColor: '#FFFFFF', borderRadius: '50%' }} />
      <span>{toastMessage}</span>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
