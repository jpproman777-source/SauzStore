import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, Eye, Heart, X } from "lucide-react";
import { useFavorites } from "../../hooks/useFavorites";
import { useCart } from "../../contextos/CartContext";
import { ProductImage } from "../GaleriaProducto/ProductImage";
import { brandOf, canBuy, hasPrice, isCommercial, productPath } from "../../utilidades/products";

export const ProductCard = ({ product, onProductSelect }) => {
  const { formatMoney } = useCart();
  const { ids, toggle } = useFavorites();
  const [quickOpen, setQuickOpen] = useState(false);
  const dialog = useRef(null);
  const saved = ids.includes(String(product.id));
  const priced = hasPrice(product);
  const available = canBuy(product);

  const openProduct = (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (onProductSelect) {
      event.preventDefault();
      onProductSelect(product.id);
    }
  };

  useEffect(() => {
    if (!quickOpen || !dialog.current) return;
    const node = dialog.current;
    node.showModal();
    const close = () => setQuickOpen(false);
    node.addEventListener("close", close);
    return () => {
      node.removeEventListener("close", close);
      if (node.open) node.close();
    };
  }, [quickOpen]);

  // Estado comercial real (estilo Nike):
  // - "Nuevo" si tiene flag de novedad
  // - "Agotado" si es comercial pero sin inventario
  // - "Próximamente" si es referencia sin precio o no comercial
  // - null si está disponible normalmente
  const commercialStatus = useMemo(() => {
    if (product.isNew || product.new || product.nuevo || product.tag === "Nuevo") {
      return "Nuevo";
    }
    if (isCommercial(product)) {
      return available ? null : "Agotado";
    }
    if (!priced || product.commercial === false) {
      return "Próximamente";
    }
    return null;
  }, [product, priced, available]);

  const categoryLabel = product.category || "Streetwear";

  return (
    <article className="premium-card" data-reveal>
      {/* 1. Fotografía integrada del producto */}
      <div className="premium-card-visual">
        <a href={productPath(product.id)} onClick={openProduct} aria-label={`Ver ${product.name}`}>
          <ProductImage src={product.image} alt={product.name} category={product.category} />
        </a>
        <button
          className="premium-card-favorite"
          type="button"
          aria-label={`${saved ? "Quitar" : "Guardar"} ${product.name} ${saved ? "de" : "en"} favoritos`}
          aria-pressed={saved}
          onClick={() => toggle(product.id)}
        >
          <Heart size={17} fill={saved ? "currentColor" : "none"} />
        </button>
        <button
          className="premium-card-quick"
          type="button"
          aria-label={`Vista rápida de ${product.name}`}
          onClick={() => setQuickOpen(true)}
        >
          <Eye size={17} aria-hidden="true" />
        </button>
      </div>

      {/* 2. Zona comercial estilo Nike (orden: estado, marca, nombre, categoría, precio) */}
      <div className="premium-card-copy">
        <div className="premium-card-meta-top">
          <span className="premium-card-brand">{brandOf(product)}</span>
          {commercialStatus && (
            <span className="premium-card-status">{commercialStatus}</span>
          )}
        </div>
        <h3 className="premium-card-name">
          <a href={productPath(product.id)} onClick={openProduct}>
            {product.name}
          </a>
        </h3>
        <span className="premium-card-category">{categoryLabel}</span>
        {priced && (
          <span className="premium-card-price">{formatMoney(product.price)}</span>
        )}
      </div>

      {/* Modal accesible de Vista Rápida */}
      {quickOpen && createPortal(
        <dialog
          ref={dialog}
          className="premium-quick-dialog"
          aria-label={`Vista rápida de ${product.name}`}
          onClick={(event) => { if (event.target === dialog.current) setQuickOpen(false); }}
        >
          <button
            className="premium-quick-close"
            type="button"
            aria-label="Cerrar vista rápida"
            onClick={() => setQuickOpen(false)}
          >
            <X size={20} />
          </button>
          <div className="premium-quick-image">
            <ProductImage src={product.image} alt={product.name} category={product.category} />
          </div>
          <div className="premium-quick-copy">
            <span className="premium-eyebrow">{brandOf(product)} / {product.category}</span>
            <h2>{product.name}</h2>
            {commercialStatus && <p className="premium-card-status" style={{ fontSize: "15px", marginBottom: "8px" }}>{commercialStatus}</p>}
            <p className="premium-quick-price">{priced ? formatMoney(product.price) : "Próximamente"}</p>
            <p>{product.shortDescription || product.description}</p>
            <p className="premium-quick-status">
              {available
                ? "Disponible. Elige tu talla en la ficha."
                : priced
                  ? "Agotado en todas las tallas."
                  : "Disponibilidad pendiente de confirmación."}
            </p>
            <a
              className="premium-primary"
              href={productPath(product.id)}
              onClick={(event) => { setQuickOpen(false); openProduct(event); }}
            >
              Ver producto <ArrowUpRight size={17} />
            </a>
          </div>
        </dialog>,
        document.body,
      )}
    </article>
  );
};
