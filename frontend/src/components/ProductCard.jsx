import React from "react";
import { Heart } from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";
import { useCart } from "../context/CartContext";
import { ProductImage } from "./ProductImage";
import { BrandLogo } from "./BrandLogo";
import { brandOf, isCommercial, productPath } from "../lib/products";
export const ProductCard = ({ product, onProductSelect }) => {
  const { formatMoney } = useCart();
  const { ids, toggle } = useFavorites();
  const saved = ids.includes(String(product.id));
  return (
    <article className="bf-product">
      <button
        className="edition-favorite-toggle"
        aria-label={`${saved ? "Quitar" : "Guardar"} ${product.name} ${saved ? "de" : "en"} favoritos`}
        aria-pressed={saved}
        onClick={() => toggle(product.id)}
      >
        <Heart size={17} fill={saved ? "currentColor" : "none"} />
      </button>
      <a
        className="bf-product-image"
        href={productPath(product.id)}
        onClick={(e) => {
          if (
            e.metaKey ||
            e.ctrlKey ||
            e.shiftKey ||
            e.altKey ||
            e.button !== 0
          )
            return;
          if (onProductSelect) {
            e.preventDefault();
            onProductSelect(product.id);
          }
        }}
      >
        <ProductImage src={product.image} alt={product.name} />
        <span className="bf-product-tag">
          {!isCommercial(product)
            ? "Referencia / no disponible para compra"
            : product.stock > 0
              ? product.category
              : "Agotado"}
        </span>
        <span className="bf-product-arrow" aria-hidden="true">
          ↗
        </span>
      </a>
      <div className="bf-product-meta">
        <BrandLogo brand={brandOf(product)} />
        <span>
          {isCommercial(product)
            ? formatMoney(product.price)
            : "Referencia informativa"}
        </span>
      </div>
      <h3>
        <a
          href={productPath(product.id)}
          onClick={(e) => {
            if (
              e.metaKey ||
              e.ctrlKey ||
              e.shiftKey ||
              e.altKey ||
              e.button !== 0
            )
              return;
            if (onProductSelect) {
              e.preventDefault();
              onProductSelect(product.id);
            }
          }}
        >
          {product.name}
        </a>
      </h3>
    </article>
  );
};
