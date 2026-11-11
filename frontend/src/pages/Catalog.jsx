import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { ProductCard } from "../components/ProductCard";
import { brandOf, hasPrice, productVariants } from "../lib/products";
import { filterCatalog, matchesCategory } from "../lib/catalogFilters";
import { useScrollReveal } from "../hooks/useScrollReveal";

const readFilters = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    brand: params.get("marca") || "Todas",
    sort: params.get("orden") || "destacados",
    size: params.get("talla") || "Todas",
    status: params.get("estado") || "Todos",
    min: params.get("min") || "",
    max: params.get("max") || "",
  };
};
export const Catalog = ({ selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, onProductSelect }) => {
  const { products, loadingProducts, refreshProducts, formatMoney } = useCart();
  const [initial] = useState(readFilters);
  const [brand, setBrand] = useState(initial.brand);
  const [sort, setSort] = useState(initial.sort);
  const [size, setSize] = useState(initial.size);
  const [status, setStatus] = useState(initial.status);
  const [min, setMin] = useState(initial.min);
  const [max, setMax] = useState(initial.max);
  const [drawer, setDrawer] = useState(false);
  const drawerRef = useRef(null);
  const mainRef = useRef(null);
  const [page, setPage] = useState(1);
  const brands = useMemo(() => ["Todas", ...new Set(products.map(brandOf))], [products]);
  const categories = useMemo(() => ["Todas", ...new Set(products.map(product => product.category).filter(Boolean))], [products]);
  const sizes = useMemo(() => ["Todas", ...new Set(products.filter(product => matchesCategory(product, selectedCategory)).flatMap(product => productVariants(product).map(variant => variant.size)))], [products, selectedCategory]);
  const hasPrices = products.some(hasPrice);
  const hasDates = products.some(product => product.createdAt);
  useEffect(() => {
    const sync = () => {
      const next = readFilters();
      setBrand(next.brand); setSort(next.sort); setSize(next.size);
      setStatus(next.status); setMin(next.min); setMax(next.max);
    };
    window.addEventListener("popstate", sync);
    window.addEventListener("sauz:navigation", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("sauz:navigation", sync);
    };
  }, []);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const entries = { marca: brand, orden: sort, talla: size, estado: status, min, max };
    for (const [key, value] of Object.entries(entries)) {
      if (!value || value === "Todas" || value === "Todos" || value === "destacados") params.delete(key);
      else params.set(key, value);
    }
    const query = params.toString();
    window.history.replaceState(null, "", window.location.pathname + (query ? `?${query}` : ""));
  }, [brand, sort, size, status, min, max]);
  useEffect(() => setPage(1), [brand, sort, size, status, min, max, searchQuery, selectedCategory]);
  useEffect(() => {
    if (!drawer) return;
    const previous = document.activeElement;
    document.body.style.overflow = "hidden";
    drawerRef.current?.querySelector('button[aria-label="Cerrar filtros"]')?.focus();
    const onKey = event => {
      if (event.key === "Escape") setDrawer(false);
      if (event.key !== "Tab") return;
      const focusable = [...drawerRef.current.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled])')];
      if (!focusable.length) return;
      if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable.at(-1).focus(); }
      if (!event.shiftKey && document.activeElement === focusable.at(-1)) { event.preventDefault(); focusable[0].focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", onKey); previous?.focus(); };
  }, [drawer]);
  const filtered = useMemo(() => {
    return filterCatalog(products, { category: selectedCategory, brand, size, status, min, max, query: searchQuery, sort });
  }, [products, selectedCategory, brand, size, status, min, max, searchQuery, sort]);
  const clear = () => {
    setSelectedCategory("Todas"); setSearchQuery(""); setBrand("Todas");
    setSize("Todas"); setStatus("Todos"); setMin(""); setMax(""); setSort("destacados");
  };
  const chips = [
    selectedCategory !== "Todas" && selectedCategory && [selectedCategory, () => setSelectedCategory("Todas")],
    brand !== "Todas" && [brand, () => setBrand("Todas")],
    size !== "Todas" && [`Talla ${size}`, () => setSize("Todas")],
    status !== "Todos" && [status, () => setStatus("Todos")],
    min !== "" && [`Desde ${formatMoney(min)}`, () => setMin("")],
    max !== "" && [`Hasta ${formatMoney(max)}`, () => setMax("")],
  ].filter(Boolean);
  const pages = Math.max(1, Math.ceil(filtered.length / 12));
  const current = Math.min(page, pages);
  useScrollReveal(mainRef, [filtered.length, current, loadingProducts]);
  return (
    <main className="premium-catalog" ref={mainRef}>
      <header className="premium-catalog-hero" data-reveal>
        <span className="premium-eyebrow">SAUZ STORE / BLACK EDITION</span>
        <h1>La selección<span>.</span></h1>
        <p>Prendas y objetos para moverte a tu manera.</p>
      </header>
      <section className="premium-catalog-body" aria-label="Catálogo de productos">
        <div className="premium-toolbar">
          <label className="premium-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Buscar productos</span><input type="search" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Buscar por pieza, marca o categoría" /></label>
          <label><span className="sr-only">Marca</span><select value={brand} onChange={event => setBrand(event.target.value)}>{brands.map(value => <option key={value} value={value}>{value === "Todas" ? "Todas las marcas" : value}</option>)}</select></label>
          <label><span className="sr-only">Categoría</span><select value={categories.includes(selectedCategory) ? selectedCategory : "Todas"} onChange={event => setSelectedCategory(event.target.value)}>{categories.map(value => <option key={value} value={value}>{value === "Todas" ? "Todas las categorías" : value}</option>)}</select></label>
          <label><span className="sr-only">Ordenar</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="destacados">Destacados</option>{hasDates && <option value="recientes">Más recientes</option>}{hasPrices && <><option value="precio-asc">Precio: menor a mayor</option><option value="precio-desc">Precio: mayor a menor</option></>}<option value="nombre">Nombre A–Z</option></select></label>
          <button className="premium-filter-trigger" type="button" onClick={() => setDrawer(true)} aria-haspopup="dialog"><SlidersHorizontal size={17} /> Filtros {chips.length > 0 && <b>{chips.length}</b>}</button>
        </div>
        <div className="premium-results"><span aria-live="polite">{filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}</span>{chips.length > 0 && <button type="button" onClick={clear}>Limpiar filtros</button>}</div>
        {chips.length > 0 && <div className="premium-active-filters" aria-label="Filtros activos">{chips.map(([label, remove]) => <button key={label} type="button" onClick={remove}>{label}<X size={13} /></button>)}</div>}
        {loadingProducts ? <div className="premium-grid" role="status" aria-label="Cargando catálogo">{Array.from({ length: 8 }, (_, index) => <div className="premium-skeleton" key={index} />)}</div> : filtered.length ? <div className="premium-grid">{filtered.slice((current - 1) * 12, current * 12).map(product => <ProductCard key={product.id} product={product} onProductSelect={onProductSelect} />)}</div> : <div className="premium-empty"><h2>{products.length ? "No encontramos piezas con esos filtros." : "El catálogo no está disponible."}</h2><p>{products.length ? "Prueba otra marca, talla o rango de precio." : "Comprueba tu conexión e inténtalo de nuevo."}</p><button className="premium-outline" type="button" onClick={products.length ? clear : refreshProducts}>{products.length ? "Limpiar filtros" : "Volver a intentar"}</button></div>}
        {pages > 1 && <nav className="premium-pagination" aria-label="Páginas del catálogo">{Array.from({ length: pages }, (_, index) => <button key={index} type="button" aria-current={current === index + 1 ? "page" : undefined} onClick={() => { setPage(index + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{index + 1}</button>)}</nav>}
      </section>
      {drawer && <div className="premium-filter-overlay" onMouseDown={event => { if (event.target === event.currentTarget) setDrawer(false); }}><aside ref={drawerRef} className="premium-filter-drawer" role="dialog" aria-modal="true" aria-label="Filtros avanzados"><header><div><span className="premium-eyebrow">AFINA TU BÚSQUEDA</span><h2>Filtros</h2></div><button type="button" aria-label="Cerrar filtros" onClick={() => setDrawer(false)}><X size={20} /></button></header><div className="premium-filter-content"><fieldset><legend>Marca</legend><div className="premium-filter-options">{brands.map(value => <button type="button" key={value} aria-pressed={brand === value} onClick={() => setBrand(value)}>{value}</button>)}</div></fieldset><fieldset><legend>Categoría</legend><div className="premium-filter-options">{categories.map(value => <button type="button" key={value} aria-pressed={selectedCategory === value} onClick={() => setSelectedCategory(value)}>{value}</button>)}</div></fieldset>{sizes.length > 1 && <fieldset><legend>Talla</legend><div className="premium-filter-options">{sizes.map(value => <button type="button" key={value} aria-pressed={size === value} onClick={() => setSize(value)}>{value}</button>)}</div></fieldset>}<fieldset><legend>Precio en COP</legend><div className="premium-price-range"><label>Mínimo<input type="number" min="0" value={min} onChange={event => setMin(event.target.value)} placeholder="Sin mínimo" /></label><label>Máximo<input type="number" min="0" value={max} onChange={event => setMax(event.target.value)} placeholder="Sin máximo" /></label></div></fieldset><fieldset><legend>Disponibilidad</legend><div className="premium-filter-options">{["Todos", "Disponibles", "Próximamente"].map(value => <button type="button" key={value} aria-pressed={status === value} onClick={() => setStatus(value)}>{value}</button>)}</div></fieldset></div><footer><button type="button" onClick={clear}>Limpiar</button><button type="button" className="premium-primary" onClick={() => setDrawer(false)}>Ver {filtered.length} resultados</button></footer></aside></div>}
    </main>
  );
};
