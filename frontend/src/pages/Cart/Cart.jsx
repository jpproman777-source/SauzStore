import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useFavorites } from "../../hooks/useFavorites";
import { ProductImage } from "../../components/catalog/ProductImage";
import { brandOf, productPath } from "../../lib/products";
import { confirmAction } from "../../lib/alerts";
import "./cart-polish.css";

const CartLine = ({
  item,
  product,
  busy,
  onQuantity,
  onRemove,
  onProductSelect,
}) => {
  const { formatMoney, showToast } = useCart();
  const { ids, toggle } = useFavorites();
  const [draft, setDraft] = useState(String(item.quantity));
  const cancelCommit = useRef(false);
  const saved = ids.includes(String(item.productId));
  const maxStock = product?.variants?.find(variant => variant.id === item.variantId)?.stock;
  useEffect(() => setDraft(String(item.quantity)), [item.quantity]);
  const commit = async () => {
    if (cancelCommit.current) {
      cancelCommit.current = false;
      return;
    }
    const quantity = Number(draft);
    if (!Number.isInteger(quantity) || quantity < 1) {
      setDraft(String(item.quantity));
      showToast("Introduce una cantidad entera mayor que cero.");
      return;
    }
    if (Number.isInteger(maxStock) && quantity > maxStock) {
      setDraft(String(item.quantity));
      showToast(`Solo hay ${maxStock} unidades de la talla ${item.size}.`);
      return;
    }
    if (quantity !== item.quantity) {
      const response = await onQuantity(item.productId, quantity, item.variantId);
      const confirmed = response?.cart?.items?.find(
        (line) => String(line.productId) === String(item.productId) && line.variantId === item.variantId,
      );
      setDraft(String(confirmed?.quantity ?? item.quantity));
    }
  };
  const selected = { ...product, ...item };
  const openProduct = (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    onProductSelect(item.productId);
  };
  return (
    <article
      className="bag-item"
      data-product-id={item.productId}
      aria-busy={busy}
    >
      <a
        className="bag-item-image"
        href={productPath(item.productId)}
        onClick={openProduct}
      >
        <ProductImage mode="thumb" sizes="(max-width: 620px) 105px, 180px" src={item.image} alt={item.name} />
      </a>
      <div className="bag-item-content">
        <div className="bag-item-heading">
          <div>
            <span className="bag-item-brand">{brandOf(selected)}</span>
            <h2>
              <a href={productPath(item.productId)} onClick={openProduct}>
                {item.name}
              </a>
            </h2>
          </div>
          <p className="bag-line-total">
            {formatMoney(item.price * item.quantity)}
          </p>
        </div>
        {selected.size && (
          <p className="bag-item-variant">Talla: {selected.size}</p>
        )}
        {selected.color && (
          <p className="bag-item-variant">Color: {selected.color}</p>
        )}
        <p className="bag-item-unit">{formatMoney(item.price)} / unidad</p>
        <div className="bag-item-actions">
          <div className="bag-quantity">
            <button
              aria-label={`Reducir cantidad de ${item.name}`}
              disabled={busy || item.quantity <= 1}
              onClick={() => onQuantity(item.productId, item.quantity - 1, item.variantId)}
            >
              <Minus size={15} />
            </button>
            <label className="sr-only" htmlFor={`quantity-${item.productId}-${item.variantId}`}>
              Cantidad de {item.name}
            </label>
            <input
              id={`quantity-${item.productId}-${item.variantId}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={maxStock}
              step="1"
              value={draft}
              disabled={busy}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") {
                  cancelCommit.current = true;
                  setDraft(String(item.quantity));
                  e.currentTarget.blur();
                }
              }}
            />
            <button
              aria-label={`Aumentar cantidad de ${item.name}`}
              disabled={busy || (Number.isInteger(maxStock) && item.quantity >= maxStock)}
              onClick={() => onQuantity(item.productId, item.quantity + 1, item.variantId)}
            >
              <Plus size={15} />
            </button>
          </div>
          <button
            className="bag-icon-button"
            aria-label={`${saved ? "Quitar" : "Guardar"} ${item.name} ${saved ? "de" : "en"} favoritos`}
            aria-pressed={saved}
            onClick={() => toggle(item.productId)}
          >
            <Heart size={19} fill={saved ? "currentColor" : "none"} />
          </button>
          <button
            className="bag-remove"
            aria-label={`Eliminar ${item.name} de la bolsa`}
            disabled={busy}
            onClick={() => onRemove(item.productId, item.variantId)}
          >
            <Trash2 size={17} />
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export const Cart = ({ setActivePage, onProductSelect, onExplore }) => {
  const {
    cart,
    cartLoading,
    cartLoadError,
    refreshCart,
    products,
    formatMoney,
    updateQuantity,
    removeItem,
    clearCart,
    setIsCheckoutOpen,
    setCartConfirmation,
  } = useCart();
  const [busy, setBusy] = useState(false);
  const operation = useRef(false);
  const items = cart.items || [];
  const run = async (action) => {
    if (operation.current) return;
    operation.current = true;
    setBusy(true);
    try {
      return await action();
    } finally {
      operation.current = false;
      setBusy(false);
    }
  };
  const checkout = () => {
    setCartConfirmation(null);
    setIsCheckoutOpen(true);
  };
  const number = (value) => typeof value === "number" && Number.isFinite(value);
  if (cartLoading)
    return (
      <main className="bag-page bag-empty" role="status">
        <ShoppingBag size={36} />
        <h1>Cargando tu bolsa…</h1>
      </main>
    );
  if (cartLoadError)
    return (
      <main className="bag-page bag-empty">
        <h1>No pudimos cargar tu bolsa.</h1>
        <p>{cartLoadError}</p>
        <button className="bf-button" onClick={refreshCart}>
          Volver a intentar
          <ArrowRight size={18} />
        </button>
      </main>
    );
  return (
    <main className="bag-page">
      <div className="bag-breadcrumb">
        <button onClick={() => setActivePage("catalog")}>Colección</button>
        <span>/</span>
        <span>Tu bolsa</span>
      </div>
      <header className="bag-page-heading">
        <div>
          <span className="edition-eyebrow">SAUZ STORE / TU SELECCIÓN</span>
          <h1>
            Tu bolsa<span aria-label={`${cart.count} artículos`}>{cart.count}</span>
          </h1>
        </div>
        <button
          className="bf-text-button bag-explore"
          onClick={() => setActivePage("catalog")}
        >
          SEGUIR EXPLORANDO <ArrowRight size={16} />
        </button>
      </header>
      {items.length ? (
        <div className="bag-layout">
          <section className="bag-items" aria-label="Productos en la bolsa">
            <div className="bag-list-heading">
              <span>
                {cart.count} {cart.count === 1 ? "artículo" : "artículos"}
              </span>
              <button
                disabled={busy}
                onClick={async () => {
                  const confirmed = await confirmAction({
                    title: "Vaciar bolsa",
                    text: "¿Deseas vaciar todas las prendas de tu bolsa de compras?",
                    confirmText: "Vaciar bolsa",
                    cancelText: "Cancelar",
                    danger: true,
                  });
                  if (confirmed) run(clearCart);
                }}
              >
                <Trash2 size={13} aria-hidden="true" /> Vaciar bolsa
              </button>
            </div>
            {items.map((item) => (
              <CartLine
                key={`${item.productId}:${item.variantId}`}
                item={item}
                product={products.find(
                  (p) => String(p.id) === String(item.productId),
                )}
                busy={busy}
                onQuantity={(id, quantity, variantId) =>
                  run(() => updateQuantity(id, quantity, variantId))
                }
                onRemove={(id, variantId) => run(() => removeItem(id, variantId))}
                onProductSelect={onProductSelect}
              />
            ))}
          </section>
          <aside className="bag-summary" aria-label="Resumen de compra">
            <span className="edition-eyebrow">
              LISTO PARA EL SIGUIENTE PASO
            </span>
            <h2><ShoppingBag size={22} aria-hidden="true" /> Tu pedido</h2>
            <dl>
              <div>
                <dt>Subtotal</dt>
                <dd>{formatMoney(cart.subtotal)}</dd>
              </div>
              {number(cart.discount) && cart.discount > 0 && (
                <div>
                  <dt>Descuento</dt>
                  <dd>−{formatMoney(cart.discount)}</dd>
                </div>
              )}
              <div>
                <dt>Envío</dt>
                <dd>
                  {number(cart.shipping)
                    ? formatMoney(cart.shipping)
                    : "Por confirmar"}
                </dd>
              </div>
              {number(cart.tax) && (
                <div>
                  <dt>Impuestos</dt>
                  <dd>{formatMoney(cart.tax)}</dd>
                </div>
              )}
              <div className="bag-summary-total">
                <dt>Total <small className="bag-currency">COP</small></dt>
                <dd>{formatMoney(cart.total)}</dd>
              </div>
            </dl>
            <p className="bag-summary-note">
              {number(cart.shipping)
                ? "Importes según el resumen de tu bolsa."
                : "El envío no está calculado en este resumen."}
            </p>
            <button
              className="bf-button bag-checkout"
              disabled={busy}
              onClick={checkout}
            >
              Continuar con la compra
              <ArrowRight size={19} />
            </button>
            <p className="bag-summary-footnote">
              Revisa tus datos y el método de pago en el siguiente paso.
            </p>
          </aside>
        </div>
      ) : (
        <section className="bag-empty">
          <div className="bag-empty-symbol">
            <ShoppingBag size={40} strokeWidth={1} />
          </div>
          <span className="edition-eyebrow">
            HAZ ESPACIO PARA TU PRÓXIMO ESENCIAL
          </span>
          <h2>
            Tu bolsa espera
            <br />
            tu próxima pieza.
          </h2>
          <p>
            Aún no tienes productos en tu bolsa de compra.
            <br />
            Explora la colección y encuentra los tuyos.
          </p>
          <button className="bf-button" onClick={onExplore}>
            Explorar productos
            <ArrowRight size={19} />
          </button>
        </section>
      )}
    </main>
  );
};
