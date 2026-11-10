import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { ProductImage } from "./ProductImage";
import { canBuy } from "../lib/products";
const slots = [
  ["Superior", /camis|hood|sudader|chaquet|buzo|su[eé]ter/i],
  ["Inferior", /pantal|short|jogger|bermuda/i],
  ["Sneakers", /sneaker|tenis|zapat/i],
  ["Accesorio", /accesor|gorra|bolso|media/i],
];
export const FitLab = ({ onProductSelect }) => {
  const { products, formatMoney, addToCart } = useCart();
  const [selection, setSelection] = useState({});
  const [adding, setAdding] = useState(null);
  const addPiece = async (product) => {
    if (!canBuy(product)) return;
    setAdding(product.id);
    try {
      await addToCart(product.id, 1);
    } finally {
      setAdding(null);
    }
  };
  return (
    <section className="bf-section bf-fit" id="fit-lab">
      <div className="bf-section-heading">
        <div>
          <span className="bf-eyebrow">02 / TU ESTILO, TU FÓRMULA</span>
          <h2>
            SAUZ FIT LAB<span className="bf-dot">®</span>
          </h2>
        </div>
        <p>Combina. Explora. Hazlo tuyo.</p>
      </div>
      <div className="bf-fit-grid">
        {slots.map(([label, match], i) => {
          const options = products.filter((p) => match.test(p.category || ""));
          const selected = options.find(
            (p) => String(p.id) === selection[label],
          );
          return (
            <div className="bf-fit-slot" key={label}>
              <div className="bf-fit-label">
                <span>
                  0{i + 1} / {label}
                </span>
                <span>+</span>
              </div>
              {selected ? (
                <ProductImage src={selected.image} alt={selected.name} />
              ) : (
                <div className="bf-fit-empty">
                  {options.length
                    ? "ELIGE TU PIEZA"
                    : "SIN REFERENCIAS DISPONIBLES"}
                </div>
              )}
              <label className="sr-only" htmlFor={`fit-${i}`}>
                {label}
              </label>
              <select
                id={`fit-${i}`}
                value={selection[label] || ""}
                disabled={!options.length}
                onChange={(e) =>
                  setSelection({ ...selection, [label]: e.target.value })
                }
              >
                <option value="">
                  {options.length
                    ? `Seleccionar ${label.toLowerCase()}`
                    : "Sin productos en esta categoría"}
                </option>
                {options.map((p) => (
                  <option value={p.id} key={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {selected && (
                <>
                  <p>
                    {canBuy(selected)
                      ? formatMoney(selected.price)
                      : "No disponible para compra"}
                  </p>
                  <button
                    className="bf-text-button"
                    onClick={() => onProductSelect(selected.id)}
                  >
                    VER FICHA {canBuy(selected) ? "Y COMPRAR" : "INFORMATIVA"} ↗
                  </button>
                  {canBuy(selected) && (
                    <button
                      className="bf-button bf-fit-add"
                      disabled={adding !== null}
                      onClick={() => addPiece(selected)}
                    >
                      {adding === selected.id
                        ? "AGREGANDO\u2026"
                        : "A\xD1ADIR A LA BOLSA"}{" "}
                      ↗
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
      <p className="bf-muted">
        Disponibilidad y precio según catálogo. Revisa cada pieza antes de
        añadirla a tu bolsa.
      </p>
    </section>
  );
};
