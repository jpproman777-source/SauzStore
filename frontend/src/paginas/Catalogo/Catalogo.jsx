import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, X, ChevronDown, Check } from "lucide-react";
import { useCart } from "../../contextos/CartContext";
import { ProductCard } from "../../componentes/TarjetaProducto/ProductCard";
import { CatalogFilters } from "../../componentes/Catalogo/CatalogFilters";
import "./catalog-layout.css";
import "./selection-hero.css";
import { brandOf, hasPrice, productVariants } from "../../utilidades/products";
import { filterCatalog, matchesCategory } from "../../utilidades/catalogFilters";
import { useScrollReveal } from "../../hooks/useScrollReveal";

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
  const sortRef = useRef(null);
  const [sidebar, setSidebar] = useState(true);
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
    const previousOverflow = document.body.style.overflow;
    drawerRef.current.showModal();
    document.body.style.overflow = "hidden";
    drawerRef.current?.querySelector('button[aria-label="Cerrar filtros"]')?.focus();
    const onKey = event => {
      if (event.key === "Escape") setDrawer(false);
      if (event.key !== "Tab") return;
      const focusable = [...drawerRef.current.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),summary')];
      if (!focusable.length) return;
      if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable.at(-1).focus(); }
      if (!event.shiftKey && document.activeElement === focusable.at(-1)) { event.preventDefault(); focusable[0].focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKey); previous?.focus(); };
  }, [drawer]);
  useEffect(() => {
    const close = event => {
      if (event.type === 'keydown' && event.key !== 'Escape') return;
      if (event.type === 'pointerdown' && sortRef.current?.contains(event.target)) return;
      if (sortRef.current?.open) {
        sortRef.current.open = false;
        if (event.type === 'keydown') sortRef.current.querySelector('summary').focus();
      }
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    const media = matchMedia('(min-width: 1001px)');
    const resize = () => { if (media.matches) setDrawer(false); };
    media.addEventListener('change', resize);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', close); media.removeEventListener('change', resize); };
  }, []);
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
    searchQuery?.trim() && [`Búsqueda: ${searchQuery.trim()}`, () => setSearchQuery("")],
    size !== "Todas" && [`Talla ${size}`, () => setSize("Todas")],
    status !== "Todos" && [status, () => setStatus("Todos")],
    min !== "" && [`Desde ${formatMoney(min)}`, () => setMin("")],
    max !== "" && [`Hasta ${formatMoney(max)}`, () => setMax("")],
  ].filter(Boolean);
  const categoryOptions = categories.includes(selectedCategory) || !selectedCategory ? categories : ['Todas', selectedCategory, ...categories.slice(1)];
  const groups = [
    { key: 'category', title: 'Categoría', value: selectedCategory || 'Todas', onChange: setSelectedCategory, options: categoryOptions.map(value => ({ value, label: value === 'Todas' ? 'Todas las categorías' : value, count: products.filter(product => matchesCategory(product, value)).length })) },
    { key: 'brand', title: 'Marca', value: brand, onChange: setBrand, options: brands.map(value => ({ value, label: value === 'Todas' ? 'Todas las marcas' : value, count: products.filter(product => matchesCategory(product, selectedCategory) && (value === 'Todas' || brandOf(product) === value)).length })) },
    { key: 'size', title: 'Talla', value: size, onChange: setSize, options: sizes.map(value => ({ value, label: value === 'Todas' ? 'Todas las tallas' : value })) },
    { key: 'status', title: 'Disponibilidad', value: status, onChange: setStatus, options: ['Todos', 'Disponibles', 'Próximamente'].map(value => ({ value, label: value })) },
  ];
  const filterProps = { groups, hasPrices, min, max, setMin, setMax };
  const sortOptions = [{ value: 'destacados', label: 'Destacados' }, ...(hasDates ? [{ value: 'recientes', label: 'Más recientes' }] : []), ...(hasPrices ? [{ value: 'precio-asc', label: 'Precio: menor a mayor' }, { value: 'precio-desc', label: 'Precio: mayor a menor' }] : []), { value: 'nombre', label: 'Nombre A–Z' }];
  const pages = Math.max(1, Math.ceil(filtered.length / 12));
  const current = Math.min(page, pages);
  useScrollReveal(mainRef, [filtered.length, current, loadingProducts]);
  const handleScrollToCatalog = () => {
    const target = mainRef.current?.querySelector(".premium-catalog-body");
    if (!target) return;
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  };
  return (
    <main className="premium-catalog" ref={mainRef}>
      <header className="selection-hero" data-reveal>
        <div className="selection-hero-inner">
          <div className="selection-hero-copy">
            <div className="selection-hero-kicker">
              <span className="selection-hero-eyebrow">SAUZ STORE / BLACK EDITION</span>
              <span className="selection-hero-line" aria-hidden="true" />
            </div>
            <h1 className="selection-hero-title">
              La selección<span className="selection-hero-dot">.</span>
            </h1>
            <p className="selection-hero-desc">
              Prendas y accesorios curados para tu estilo.
            </p>
            <button
              type="button"
              className="selection-hero-cta"
              onClick={handleScrollToCatalog}
            >
              <span>Explorar catálogo</span>
              <span className="selection-hero-cta-arrow" aria-hidden="true">→</span>
            </button>
          </div>
        </div>
        <svg
          className="selection-hero-arc"
          viewBox="0 0 390 290"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M390 42C242 42 122 153 122 290"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.48"
          />
          <path
            d="M390 108C279 108 189 190 189 290"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.26"
          />
        </svg>
      </header>
      <section className="premium-catalog-body" aria-label="Catálogo de productos">
        <div className="sauz-catalog-toolbar">
          <label className="premium-search sauz-catalog-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Buscar productos</span><input type="search" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Buscar por pieza, marca o categoría" /></label>
          <div className="sauz-catalog-actions">
            <button className="sauz-sidebar-toggle" type="button" onClick={() => setSidebar(!sidebar)} aria-expanded={sidebar} aria-controls="catalog-sidebar"><SlidersHorizontal size={17} aria-hidden="true" /><span>{sidebar ? 'Ocultar filtros' : 'Mostrar filtros'}</span>{chips.length > 0 && <b>{chips.length}</b>}</button>
            <button className="sauz-mobile-filter" type="button" onClick={() => setDrawer(true)} aria-haspopup="dialog"><SlidersHorizontal size={17} aria-hidden="true" /><span>Filtros</span>{chips.length > 0 && <b>{chips.length}</b>}</button>
            <details className="sauz-catalog-sort" ref={sortRef}>
              <summary><span className="sauz-sort-heading"><span className="sauz-sort-caption">Ordenar por</span><strong>{sortOptions.find(option => option.value === sort)?.label || 'Destacados'}</strong></span><ChevronDown size={16} aria-hidden="true" /></summary>
              <fieldset><legend className="sr-only">Ordenar productos</legend>{sortOptions.map(option => <label key={option.value}>
                <input type="radio" name="catalog-sort" checked={sort === option.value} onChange={() => { setSort(option.value); sortRef.current.open = false; sortRef.current.querySelector('summary').focus(); }} />
                <span>{option.label}</span>{sort === option.value && <Check size={16} aria-hidden="true" />}
              </label>)}</fieldset>
            </details>
          </div>
        </div>
        <div className="premium-results"><span aria-live="polite">{filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}</span>{chips.length > 0 && <button type="button" className="sauz-clear-filters" onClick={clear}><X size={14} aria-hidden="true" /><span>Limpiar filtros</span></button>}</div>
        {chips.length > 0 && <div className="premium-active-filters" aria-label="Filtros activos">{chips.map(([label, remove]) => <button key={label} type="button" onClick={remove}>{label}<X size={13} /></button>)}</div>}
        <div className={`sauz-catalog-layout ${sidebar ? '' : 'is-expanded'}`}>
          {sidebar && <aside id="catalog-sidebar" className="sauz-catalog-sidebar" aria-label="Filtrar productos"><div className="sauz-sidebar-heading">Filtrar por{chips.length > 0 && <button type="button" onClick={clear}>Limpiar</button>}</div><CatalogFilters scope="desktop" {...filterProps} /></aside>}
          <div className="sauz-catalog-products">
        {loadingProducts ? <div className="premium-grid" role="status" aria-label="Cargando catálogo">{Array.from({ length: 8 }, (_, index) => <div className="premium-skeleton" key={index} />)}</div> : filtered.length ? <div className="premium-grid">{filtered.slice((current - 1) * 12, current * 12).map(product => <ProductCard key={product.id} product={product} onProductSelect={onProductSelect} />)}</div> : <div className="premium-empty"><h2>{products.length ? "No encontramos piezas con esos filtros." : "El catálogo no está disponible."}</h2><p>{products.length ? "Prueba otra marca, talla o rango de precio." : "Comprueba tu conexión e inténtalo de nuevo."}</p><button className="premium-outline" type="button" onClick={products.length ? clear : refreshProducts}>{products.length ? "Limpiar filtros" : "Volver a intentar"}</button></div>}
        {pages > 1 && <nav className="premium-pagination" aria-label="Páginas del catálogo">{Array.from({ length: pages }, (_, index) => <button key={index} type="button" aria-current={current === index + 1 ? "page" : undefined} onClick={() => { setPage(index + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{index + 1}</button>)}</nav>}
          </div>
        </div>
      </section>
      {drawer && <dialog ref={drawerRef} className="sauz-filter-dialog" aria-label="Filtros del catálogo" onCancel={event => { event.preventDefault(); setDrawer(false); }} onClick={event => { if (event.target === event.currentTarget) { const box = event.currentTarget.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right) setDrawer(false); } }}>
        <header><div><span className="premium-eyebrow">AFINA TU SELECCIÓN</span><h2>Filtros</h2></div><button type="button" aria-label="Cerrar filtros" onClick={() => setDrawer(false)}><X size={22} /></button></header>
        <div className="sauz-mobile-filter-content"><CatalogFilters scope="mobile" {...filterProps} /></div>
        <footer><button type="button" onClick={clear}>Limpiar</button><button type="button" onClick={() => setDrawer(false)}>Ver {filtered.length} resultados</button></footer>
      </dialog>}

    </main>
  );
};
