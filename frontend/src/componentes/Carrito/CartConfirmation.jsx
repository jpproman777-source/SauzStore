import React, { useEffect, useRef } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { useCart } from "../../contextos/CartContext";
import { ProductImage } from "../GaleriaProducto/ProductImage";
import { brandOf } from "../../utilidades/products";

export const CartConfirmation = ({ onViewBag }) => {
  const {
    cartConfirmation,
    setCartConfirmation,
    setIsCheckoutOpen,
    formatMoney,
  } = useCart();
  const panel = useRef(null);
  const previousFocus = useRef(null);
  useEffect(() => {
    if (!cartConfirmation) return;
    previousFocus.current = document.activeElement;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        const inside = panel.current?.contains(document.activeElement);
        setCartConfirmation(null);
        if (inside) previousFocus.current?.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    // This is a non-modal confirmation: announce it without stealing focus or trapping Tab.
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      if (panel.current?.contains(document.activeElement))
        previousFocus.current?.focus();
    };
  }, [cartConfirmation?.sequence, setCartConfirmation]);
  if (!cartConfirmation) return null;
  const { item, quantity } = cartConfirmation;
  const close = () => {
    const focused = panel.current?.contains(document.activeElement);
    setCartConfirmation(null);
    if (focused) previousFocus.current?.focus();
  };
  const viewBag = () => {
    setCartConfirmation(null);
    onViewBag();
  };
  const checkout = () => {
    setCartConfirmation(null);
    setIsCheckoutOpen(true);
  };
  return (
    <aside
      key={cartConfirmation.sequence}
      className="bag-confirmation"
      ref={panel}
      aria-labelledby="bag-confirmation-title"
    >
      <div className="bag-confirmation-heading">
        <div role="status" aria-live="polite" aria-atomic="true">
          <span className="bag-confirmation-check">
            <Check size={17} />
          </span>
          <h2 id="bag-confirmation-title">Agregado a la bolsa de compra</h2>
          <span className="sr-only">
            {item.name}, cantidad {quantity}.
          </span>
        </div>
        <button aria-label="Cerrar confirmación de bolsa" onClick={close}>
          <X size={20} />
        </button>
      </div>
      <div className="bag-confirmation-product">
        <ProductImage mode="thumb" src={item.image} alt={item.name} />
        <div>
          <span className="bag-item-brand">{brandOf(item)}</span>
          <h3>{item.name}</h3>
          {item.size && <p>Talla: {item.size}</p>}
          {item.color && <p>Color: {item.color}</p>}
          <p>Cantidad agregada: {quantity}</p>
          <strong>
            {formatMoney(item.price)} <span>/ unidad</span>
          </strong>
        </div>
      </div>
      <div className="bag-confirmation-actions">
        <button className="bag-outline-button" onClick={viewBag}>
          Ver bolsa de compra
          <ArrowRight size={17} />
        </button>
        <button className="bf-button" onClick={checkout}>
          Continuar con la compra
          <ArrowRight size={17} />
        </button>
      </div>
    </aside>
  );
};
