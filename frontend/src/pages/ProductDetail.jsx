import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { ProductImage } from "../components/ProductImage";
import { ProductCard } from "../components/ProductCard";
import { BrandLogo } from "../components/BrandLogo";
import { brandOf, isCommercial, canBuy } from "../lib/products";
export const ProductDetail = ({
  productId,
  setActivePage,
  onProductSelect,
}) => {
  const { products, loadingProducts, addToCart, formatMoney } = useCart();
  const [adding, setAdding] = useState(false),
    [imageIndex, setImageIndex] = useState(0);
  const product = products.find((p) => String(p.id) === String(productId));
  if (loadingProducts)
    return (
      <main className="bf-empty" role="status">
        Cargando pieza…
      </main>
    );
  if (!product)
    return (
      <main className="bf-empty">
        <h1>No encontramos esta pieza.</h1>
        <button className="bf-button" onClick={() => setActivePage("catalog")}>
          VOLVER AL CATÁLOGO ↗
        </button>
      </main>
    );
  const images = [
    ...new Set(
      [
        product.image,
        ...(Array.isArray(product.images) ? product.images : []),
      ].filter(Boolean),
    ),
  ];
  const related = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);
  const handleAdd = async () => {
    if (!canBuy(product)) return;
    setAdding(true);
    try {
      await addToCart(product.id, 1);
    } finally {
      setAdding(false);
    }
  };
  return (
    <main className="bf-detail">
      <div className="bf-breadcrumb">
        <button onClick={() => setActivePage("catalog")}>COLECCIÓN</button>
        <span>/</span>
        <span>{product.category}</span>
      </div>
      <section className="bf-detail-grid">
        <div className="bf-gallery">
          <ProductImage
            src={images[imageIndex] || product.image}
            alt={product.name}
            loading="eager"
          />
          {images.length > 1 && (
            <div className="bf-thumbnails">
              {images.map((src, i) => (
                <button
                  key={src}
                  aria-label={`Ver imagen ${i + 1}`}
                  aria-pressed={imageIndex === i}
                  onClick={() => setImageIndex(i)}
                >
                  <ProductImage
                    src={src}
                    alt={`${product.name}, vista ${i + 1}`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="bf-detail-info">
          <BrandLogo brand={brandOf(product)} />
          <h1>{product.name}</h1>
          <p className="bf-detail-price">
            {isCommercial(product)
              ? formatMoney(product.price)
              : "Referencia informativa"}
          </p>
          <p className="bf-stock">
            {!isCommercial(product)
              ? "Referencia no habilitada para compra"
              : product.stock > 0
                ? `${product.stock} unidades disponibles`
                : "Agotado temporalmente"}
          </p>
          <p className="bf-detail-description">
            {product.description ||
              "Descripci\xF3n pendiente de confirmaci\xF3n."}
          </p>
          {product.color && <p>Color: {product.color}</p>}
          {product.sku && <p>SKU: {product.sku}</p>}
          <button
            className="bf-button bf-add"
            disabled={adding || !canBuy(product)}
            onClick={handleAdd}
          >
            {adding
              ? "AGREGANDO\u2026"
              : canBuy(product)
                ? "A\xD1ADIR A LA BOLSA"
                : "NO DISPONIBLE PARA COMPRA"}
            <span>↗</span>
          </button>
          <details open>
            <summary>DETALLES DE LA PIEZA</summary>
            <p>Categoría: {product.category || "Por confirmar"}</p>
            <p>Marca: {brandOf(product)}</p>
            {product.sizes?.length > 0 && (
              <p>Tallas informadas: {product.sizes.join(", ")}</p>
            )}
          </details>
          <details>
            <summary>ANTES DE COMPRAR</summary>
            <p>
              Revisa el resumen de tu bolsa y las condiciones mostradas al
              finalizar tu pedido. Solo se pueden comprar productos comerciales
              disponibles.
            </p>
          </details>
        </div>
      </section>
      {related.length > 0 && (
        <section className="bf-related">
          <div className="bf-section-heading">
            <div>
              <span className="bf-eyebrow">SIGUE EXPLORANDO</span>
              <h2>En la misma sintonía.</h2>
            </div>
          </div>
          <div className="bf-grid">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onProductSelect={onProductSelect}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};
