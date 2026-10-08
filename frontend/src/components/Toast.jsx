import React from 'react';
import { useCart } from '../context/CartContext';

export const Toast = () => {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="toast show" role="status" aria-live="polite">
      {toastMessage}
    </div>
  );
};
