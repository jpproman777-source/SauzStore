import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  Truck,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../hooks/useFavorites";
import { ProductGallery } from "../components/ProductGallery";
import { ProductCard } from "../components/ProductCard";
import { brandOf, canBuy, productVariants } from "../lib/products";
import { useScrollReveal } from "../hooks/useScrollReveal";
import "./product-detail-polish.css";

// Mapa de colores comerciales a muestras hexadecimales
const COLOR_MAP = {
  negro: "#0a0a0a",
  black: "#0a0a0a",
  blanco: "#f5f5f5",
  white: "#f5f5f5",
  gris: "#4a4a4a",
  grey: "#4a4a4a",
  "gris carbón": "#2c2c2c",
  rojo: "#e65a5d",
  red: "#e65a5d",
  azul: "#1e3a8a",
  blue: "#1e3a8a",
  "azul marino": "#0f172a",
  verde: "#166534",
  green: "#166534",
  beige: "#d4c5b9",
  crema: "#e5dec9",
  oliva: "#3f4c38",
  marrón: "#78350f",
  cafe: "#78350f",
  café: "#78350f",
};

export const ProductDetail = ({
  productId,
  setActivePage,
  onProductSelect,
}) => {
  const {
    products,
    loadingProducts,
    addToCart,
    formatMoney,
    setIsCheckoutOpen,
  } = useCart();
  const { ids, toggle } = useFavorites();

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [added, setAdded] = useState(false);
  const [message, setMessage] = useState("");
  const mainRef = useRef(null);

  const product = products.find(
    (item) => String(item.id) === String(productId),
  );

  // Galería de imágenes reales sin duplicados
  const images = useMemo(() => {
    if (!product) return [];
    const set = new Set();
    if (product.image) set.add(product.image);
    if (Array.isArray(product.images)) product.images.forEach((img) => img && set.add(img));
    if (Array.isArray(product.alternateImages))
      product.alternateImages.forEach((img) => img && set.add(img));
    return [...set];
  }, [product]);

  const rawVariants = useMemo(() => productVariants(product), [product]);

  // Lista de colores disponibles
  const availableColors = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.colors) && product.colors.length > 0) {
      return product.colors;
    }
    const fromVariants = rawVariants
      .map((v) => v.color)
      .filter(Boolean);
    if (fromVariants.length) {
      return [...new Set(fromVariants)];
    }
    // Color por defecto inferido o neutro si la prenda tiene color en su nombre
    const nameLower = (product.name || "").toLowerCase();
    for (const colorKey of Object.keys(COLOR_MAP)) {
      if (nameLower.includes(colorKey)) {
        return [colorKey.charAt(0).toUpperCase() + colorKey.slice(1)];
      }
    }
    return ["Negro Black Edition"];
  }, [product, rawVariants]);

  // Lista de tallas disponibles
  const availableSizes = useMemo(() => {
    if (!product) return [];
    if (rawVariants.length > 0) {
      return [...new Set(rawVariants.map((v) => v.size).filter(Boolean))];
    }
    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
      return product.sizes;
    }
    return [];
  }, [product, rawVariants]);

  // Variante seleccionada
  const selectedVariant = useMemo(() => {
    if (!rawVariants.length) return null;
    return (
      rawVariants.find((v) => {
        const matchesSize = selectedSize ? v.size === selectedSize : true;
        const matchesColor = selectedColor && v.color ? v.color === selectedColor : true;
        return matchesSize && matchesColor;
      }) || rawVariants.find((v) => (selectedSize ? v.size === selectedSize : true)) || rawVariants[0]
    );
  }, [rawVariants, selectedSize, selectedColor]);

  // Stock para la selección actual
  const currentStock = useMemo(() => {
    if (selectedVariant) {
      return Number(selectedVariant.stock || 0);
    }
    if (typeof product?.stock === "number") {
      return product.stock;
    }
    return 0;
  }, [selectedVariant, product]);

  const purchasable = canBuy(product);
  const priced = Number.isFinite(product?.price) && product.price > 0;
  const previousPrice = Number.isFinite(product?.previousPrice) && product.previousPrice > product.price
    ? product.previousPrice
    : null;
  const discountPercent = previousPrice
    ? Math.round(((previousPrice - product.price) / previousPrice) * 100)
    : 0;

  const saved = ids.includes(String(productId));

  // Reset en cambio de producto
  useEffect(() => {
    setSelectedSize("");
    setSelectedColor(availableColors[0] || "");
    setQuantity(1);
    setMessage("");
    setAdded(false);
  }, [productId, availableColors]);

  const related = useMemo(
    () =>
      products
        .filter(
          (item) =>
            item.id !== product?.id &&
            (item.category === product?.category ||
              brandOf(item) === brandOf(product)),
        )
        .slice(0, 4),
    [products, product],
  );

  useScrollReveal(mainRef, [productId, loadingProducts, related.length]);

  if (loadingProducts) {
    return (
      <main className="premium-detail-loading" role="status">
        <div className="premium-skeleton" style={{ width: 120, height: 24, margin: "0 auto 20px" }} />
        <p>Cargando información de la prenda…</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="premium-empty">
        <h1>No encontramos esta pieza.</h1>
        <p>Es posible que haya sido reubicada o retirada temporalmente del catálogo.</p>
        <button
          type="button"
          className="premium-outline"
          onClick={() => setActivePage("catalog")}
        >
          Volver al catálogo completo
        </button>
      </main>
    );
  }

  // Validación de selección para compra
  const validateSelection = () => {
    if (!purchasable) {
      setMessage("Esta pieza se encuentra en catálogo editorial y estará disponible para compra próximamente.");
      return false;
    }
    if (availableSizes.length > 0 && !selectedSize) {
      setMessage("Por favor selecciona tu talla para continuar.");
      return false;
    }
    if (currentStock <= 0) {
      setMessage("La talla o variante seleccionada se encuentra agotada temporalmente.");
      return false;
    }
    if (quantity > currentStock) {
      setMessage(`Solo quedan ${currentStock} unidades disponibles en este inventario.`);
      return false;
    }
    setMessage("");
    return true;
  };

  // Agregar al Carrito (Bolsa de compra)
  const handleAddToCart = async () => {
    if (!validateSelection()) return;
    setAdding(true);
    setAdded(false);
    try {
      const variantIdToUse = selectedVariant?.id || selectedSize || "std";
      const result = await addToCart(product.id, quantity, variantIdToUse);
      if (result) {
        setAdded(true);
        setTimeout(() => setAdded(false), 3000);
      }
    } finally {
      setAdding(false);
    }
  };

  // Comprar Ahora (Inicia checkout directo con la variante seleccionada)
  const handleBuyNow = async () => {
    if (!validateSelection()) return;
    setBuyingNow(true);
    try {
      const variantIdToUse = selectedVariant?.id || selectedSize || "std";
      await addToCart(product.id, quantity, variantIdToUse);
      if (setIsCheckoutOpen) {
        setIsCheckoutOpen(true);
      }
    } finally {
      setBuyingNow(false);
    }
  };

  return (
    <main className="premium-detail" ref={mainRef}>
      {/* Breadcrumb de navegación comercial */}
      <nav className="premium-breadcrumb" aria-label="Ruta del producto">
        <button className="sauz-back-catalog" type="button" onClick={() => setActivePage("catalog")}>
          <ArrowLeft size={17} aria-hidden="true" />
          Volver al catálogo
        </button>
        <span aria-hidden="true">/</span>
        <button
          type="button"
          onClick={() => {
            setActivePage("catalog");
          }}
        >
          {product.category}
        </button>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{product.name}</span>
      </nav>

      {/* Contenedor principal equilibrado en 2 columnas */}
      <div className="premium-detail-layout">
        {/* COLUMNA IZQUIERDA: GALERÍA FOTOGRÁFICA (50–52%) */}
        <ProductGallery key={product.id} images={images} name={product.name} category={product.category} />

        {/* COLUMNA DERECHA: INFORMACIÓN COMERCIAL (48–50%) */}
        <section
          className="premium-detail-copy"
          aria-label="Información comercial y de compra"
          data-reveal
        >
          {/* Marca y Categoría estilo Nike */}
          <div className="premium-detail-meta">
            <span className="premium-eyebrow">
              {brandOf(product)}{" "}
              <span className="premium-detail-divider">/</span>{" "}
              {product.category}
            </span>
            {product.sku && (
              <span className="premium-sku-pill">REF: {product.sku}</span>
            )}
          </div>

          {/* Nombre oficial del producto */}
          <h1 className="premium-detail-title">{product.name}</h1>

          {/* Bloque de Precio COP y Descuento */}
          <div className="premium-price-box">
            {priced ? (
              <div className="premium-price-row">
                <span className="premium-detail-price">
                  {formatMoney(product.price)} <small className="sauz-detail-currency">COP</small>
                </span>
                {previousPrice && (
                  <>
                    <span className="premium-previous-price">
                      {formatMoney(previousPrice)}
                    </span>
                    <span className="premium-discount-tag">
                      {discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>
            ) : (
              <div className="premium-pending-badge">
                <span>Próximamente disponible</span>
                <small>Precio e inventario en configuración</small>
              </div>
            )}
          </div>

          {/* Descripción corta de caída y corte */}
          {(product.shortDescription || product.description) !== product.name && <p className="premium-detail-lead">
            {product.shortDescription || product.description}
          </p>}

          <div className="premium-detail-rule" />

          {/* SELECTOR DE COLOR (US-20) */}
          {availableColors.length > 0 && (
            <div className="premium-color-section">
              <div className="premium-section-header">
                <span className="premium-section-title">Color</span>
                <span className="premium-section-value">
                  {selectedColor || availableColors[0]}
                </span>
              </div>
              <div
                className="premium-colors-list"
                role="radiogroup"
                aria-label="Seleccionar color"
              >
                {availableColors.map((colorName) => {
                  const normalized = colorName.toLowerCase().trim();
                  const hex = COLOR_MAP[normalized] || "#222222";
                  const isSelected = (selectedColor || availableColors[0]) === colorName;
                  return (
                    <button
                      key={colorName}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      className={`premium-color-swatch ${isSelected ? "selected" : ""}`}
                      onClick={() => {
                        setSelectedColor(colorName);
                        setMessage("");
                      }}
                      title={colorName}
                    >
                      <span
                        className="premium-swatch-circle"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="premium-color-label">{colorName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SELECTOR DE TALLA (US-19) */}
          <div className="premium-size-section">
            <div className="premium-size-heading">
              <span className="premium-section-title">Selecciona tu talla</span>
              {selectedSize && (
                <span className="premium-stock-indicator">
                  {currentStock > 0 ? (
                    <span className="in-stock">✓ {currentStock} disponibles</span>
                  ) : (
                    <span className="out-stock">Agotada</span>
                  )}
                </span>
              )}
            </div>

            {availableSizes.length > 0 ? (
              <div
                className="premium-sizes"
                role="group"
                aria-label="Tallas disponibles"
              >
                {availableSizes.map((size) => {
                  // Calcular existencias para esta talla
                  const variantForSize = rawVariants.find((v) => v.size === size);
                  const isSoldOut = variantForSize ? variantForSize.stock <= 0 : false;
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      type="button"
                      key={size}
                      className={`premium-size-btn ${isSelected ? "active" : ""} ${isSoldOut ? "sold-out" : ""}`}
                      aria-pressed={isSelected}
                      disabled={isSoldOut}
                      onClick={() => {
                        setSelectedSize(size);
                        setQuantity(1);
                        setMessage("");
                      }}
                    >
                      <span className="size-label">{size}</span>
                      {isSoldOut && <span className="sold-out-line" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="premium-pending-note">
                Tallas e inventario pendientes de asignación por administración.
              </p>
            )}
          </div>

          {/* SELECTOR DE CANTIDAD */}
          {purchasable && currentStock > 0 && (
            <div className="premium-detail-quantity">
              <span>Cantidad</span>
              <div className="premium-quantity-control">
                <button
                  type="button"
                  aria-label="Reducir cantidad"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(quantity - 1)}
                >
                  <Minus size={15} />
                </button>
                <output aria-live="polite">{quantity}</output>
                <button
                  type="button"
                  aria-label="Aumentar cantidad"
                  disabled={quantity >= currentStock}
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Alertas de validación */}
          {message && (
            <div className="premium-form-alert" role="alert">
              <span>⚠️</span>
              <p>{message}</p>
            </div>
          )}

          {/* ACCIONES DE COMPRA INSPIRADAS EN MERCADO LIBRE / NIKE */}
          <div className="premium-action-group">
            {/* Botón Comprar Ahora */}
            <button
              type="button"
              className="premium-btn-buy-now"
              disabled={!purchasable || buyingNow}
              onClick={handleBuyNow}
            >
              <Zap size={18} />
              <span>{buyingNow ? "Iniciando compra…" : "Comprar ahora"}</span>
            </button>

            {/* Botón Agregar al Carrito */}
            <button
              type="button"
              className="premium-btn-add-cart"
              disabled={!purchasable || adding}
              onClick={handleAddToCart}
            >
              {adding ? (
                <span>Agregando…</span>
              ) : added ? (
                <>
                  <Check size={18} />
                  <span>¡En la bolsa!</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  <span>Agregar al carrito</span>
                </>
              )}
            </button>

            {/* Botón Favoritos */}
            <button
              type="button"
              className="premium-detail-favorite"
              aria-label={saved ? "Quitar de favoritos" : "Guardar en favoritos"}
              aria-pressed={saved}
              onClick={() => toggle(product.id)}
            >
              <Heart size={20} fill={saved ? "currentColor" : "none"} />
            </button>
          </div>

          {/* BANNERS DE CONFIANZA Y ENVÍO MERCADO LIBRE / NIKE */}
          <div className="premium-trust-badges">
            <div className="premium-trust-item">
              <Truck size={18} className="trust-icon" />
              <div>
                <strong>Envío asegurado a toda Colombia</strong>
                <p>2 a 4 días hábiles en ciudades principales (Bogotá, Medellín, Cali, Barranquilla).</p>
              </div>
            </div>
            <div className="premium-trust-item">
              <RotateCcw size={18} className="trust-icon" />
              <div>
                <strong>Cambios gratis de talla</strong>
                <p>30 días calendario tras recibir tu pedido. Proceso ágil vía WhatsApp.</p>
              </div>
            </div>
            <div className="premium-trust-item">
              <ShieldCheck size={18} className="trust-icon" />
              <div>
                <strong>Confección y autenticidad garantizada</strong>
                <p>Algodón peinado de alto gramaje y marcas originales verificadas.</p>
              </div>
            </div>
          </div>

          {/* ACORDEONES INFORMATIVOS */}
          <div className="premium-accordions">
            <details open>
              <summary>Descripción y concepto</summary>
              <p>
                {product.detailedDescription ||
                  product.description ||
                  "Prenda de confección streetwear con silueta estructurada, caída natural y alta resistencia al uso continuo."}
              </p>
            </details>
            <details>
              <summary>Especificaciones y materiales</summary>
              <p>
                {product.materials ||
                  "Algodón peinado pesado 240+ GSM con costuras dobles reforzadas en hombros y cuello. Resistente al desteñido y deformación por lavado."}
              </p>
            </details>
            <details>
              <summary>Guía de tallas y medidas</summary>
              <p>
                {product.sizeGuide ||
                  "Corte relajado / Oversize streetwear. Recomendamos seleccionar tu talla habitual para un fit holgado moderno, o una talla inferior para un ajuste estándar."}
              </p>
            </details>
          </div>
        </section>
      </div>

      {/* SECCIÓN RELACIONADA (TAMBIÉN PUEDE INTERESARTE) */}
      {related.length > 0 && (
        <section className="premium-related">
          <div data-reveal>
            <span className="premium-eyebrow">CURADURÍA RECOMENDADA</span>
            <h2>Completa tu look.</h2>
          </div>
          <div className="premium-grid">
            {related.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onProductSelect={onProductSelect}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};
