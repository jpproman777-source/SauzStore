import React, { useState, useMemo, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { ProductCard } from "../components/ProductCard";
import { brandOf, isCommercial } from "../lib/products";
export const Catalog = ({
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  onProductSelect,
}) => {
  const { products, loadingProducts, refreshProducts } = useCart();
  const [sort, setSort] = useState("relevant"),
    [brand, setBrand] = useState("Todas"),
    [available, setAvailable] = useState(false),
    [page, setPage] = useState(1);
  const categories = [
    "Todas",
    ...new Set(
      [...products.map((p) => p.category), selectedCategory].filter(
        (c) => c && c !== "Todas",
      ),
    ),
  ];
  const brands = ["Todas", ...new Set(products.map(brandOf))];
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase("es");
    const list = products.filter(
      (p) =>
        (selectedCategory === "Todas" ||
          !selectedCategory ||
          p.category === selectedCategory ||
          (selectedCategory === "Ropa" &&
            /camis|sudader|hood|chaquet|pantal|buzo/i.test(p.category || "")) ||
          (selectedCategory === "Sneakers" &&
            /sneaker|tenis|zapat|calzado/i.test(p.category || "")) ||
          (selectedCategory === "Gorras" && /gorra/i.test(p.category || "")) ||
          (selectedCategory === "Accesorios" &&
            /accesor|gorra|bolso/i.test(p.category || ""))) &&
        (brand === "Todas" || brandOf(p) === brand) &&
        (!available || (isCommercial(p) && p.stock > 0)) &&
        [p.name, p.description, p.category, brandOf(p)]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("es")
          .includes(q),
    );
    if (sort === "price-asc")
      list.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    if (sort === "price-desc")
      list.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    if (sort === "name")
      list.sort((a, b) => a.name.localeCompare(b.name, "es"));
    return list;
  }, [products, selectedCategory, searchQuery, brand, available, sort]);
  useEffect(
    () => setPage(1),
    [selectedCategory, searchQuery, brand, available, sort],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 12)),
    current = Math.min(page, pages);
  const clear = () => {
    setSelectedCategory("Todas");
    setSearchQuery("");
    setBrand("Todas");
    setAvailable(false);
  };
  return (
    <main className="bf-catalog">
      <section className="bf-page-heading">
        <span className="bf-eyebrow">SAUZ / LA SELECCIÓN COMPLETA</span>
        <h1>
          ENCUENTRA
          <br />
          <span>TU PRÓXIMA PIEZA.</span>
        </h1>
        <p>Explora a tu ritmo. Elige con actitud.</p>
      </section>
      <section className="bf-section">
        <div className="bf-catalog-toolbar">
          <label className="bf-catalog-search">
            <span>BUSCAR</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nombre, marca, categoría…"
            />
          </label>
          <label>
            <span>MARCA</span>
            <select value={brand} onChange={(e) => setBrand(e.target.value)}>
              {brands.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
          <label>
            <span>ORDENAR</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="relevant">Selección SAUZ</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="name">Nombre: A–Z</option>
            </select>
          </label>
        </div>
        <div className="bf-filter-row">
          <div className="bf-chips">
            {categories.map((c) => (
              <button
                key={c}
                aria-pressed={selectedCategory === c}
                onClick={() => setSelectedCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <label className="bf-check">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
            />{" "}
            Solo disponibles
          </label>
        </div>
        <div className="bf-catalog-count" aria-live="polite">
          <span>
            {filtered.length} referencias ·{" "}
            {filtered.filter(isCommercial).length} comerciales ·{" "}
            {filtered.filter((p) => !isCommercial(p)).length} informativas
          </span>
          <button className="bf-text-button" onClick={clear}>
            LIMPIAR FILTROS ↗
          </button>
        </div>
        {loadingProducts ? (
          <div className="bf-grid" aria-label="Cargando catálogo" role="status">
            {[1, 2, 3, 4].map((i) => (
              <div className="bf-skeleton" key={i} />
            ))}
            <span className="sr-only">Cargando catálogo…</span>
          </div>
        ) : filtered.length ? (
          <div className="bf-grid">
            {filtered.slice((current - 1) * 12, current * 12).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onProductSelect={onProductSelect}
              />
            ))}
          </div>
        ) : (
          <div className="bf-empty">
            <h2>
              {products.length
                ? "Una nueva b\xFAsqueda. Otra posibilidad."
                : "El cat\xE1logo no est\xE1 disponible."}
            </h2>
            <p>
              {products.length
                ? "Prueba otra marca, palabra o categor\xEDa."
                : "Comprueba tu conexi\xF3n e int\xE9ntalo de nuevo."}
            </p>
            <button
              className="bf-button"
              onClick={products.length ? clear : refreshProducts}
            >
              {products.length ? "RESTABLECER FILTROS" : "VOLVER A INTENTAR"} ↗
            </button>
          </div>
        )}
        {pages > 1 && (
          <nav className="bf-pagination" aria-label="Paginación">
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                aria-current={current === i + 1 ? "page" : void 0}
                onClick={() => {
                  setPage(i + 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                {i + 1}
              </button>
            ))}
          </nav>
        )}
      </section>
    </main>
  );
};
