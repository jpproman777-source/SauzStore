import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  Search,
  User,
  ShoppingBag,
  X,
  ArrowUpRight,
  Heart,
  ChevronDown,
  ChevronRight,
  Ruler,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { BrandLogo } from "./BrandLogo";
import { ProductCard } from "./ProductCard";
import { useFavorites } from "../hooks/useFavorites";

export const Header = ({
  onOpenBag,
  onCollectionSelect,
  onProductSelect,
  activePage,
  selectedCategory,
  setActivePage,
  searchQuery,
  setSearchQuery,
  onFilterCatalog,
  onCategorySelect,
}) => {
  const { cart, products, setCartConfirmation } = useCart();
  const { user, isAdmin, setIsProfileOpen, logout } = useAuth();

  const [navigationLocation, setNavigationLocation] = useState(
    () => window.location.pathname + window.location.search + window.location.hash,
  );

  useEffect(() => {
    const sync = () =>
      setNavigationLocation(
        window.location.pathname + window.location.search + window.location.hash,
      );
    for (const event of ["popstate", "hashchange", "sauz:navigation"])
      window.addEventListener(event, sync);
    return () => {
      for (const event of ["popstate", "hashchange", "sauz:navigation"])
        window.removeEventListener(event, sync);
    };
  }, []);

  const [favorites, setFavorites] = useState(false);
  const { ids } = useFavorites();
  const savedProducts = products.filter((p) => ids.includes(String(p.id)));

  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);

  // Mega Menú State para Desktop: 'marcas' | 'ropa' | 'sneakers' | 'accesorios' | 'colecciones' | null
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownTimeoutRef = useRef(null);

  // Acordeones para Drawer Móvil
  const [mobileAccordions, setMobileAccordions] = useState({
    marcas: false,
    ropa: false,
    sneakers: false,
    accesorios: false,
    colecciones: false,
  });

  const toggleMobileAccordion = (key) => {
    setMobileAccordions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Manejo de hover con retardo seguro para evitar parpadeos
  const handleMouseEnter = (menuKey) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setActiveDropdown(menuKey);
  };

  const handleNavClick = (e, key) => {
    e.preventDefault();
    if (activeDropdown === key) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(key);
    }
  };

  const handleMouseLeave = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  // Teclado accesible: Escape cierra todo
  useEffect(() => {
    const close = (e) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
        setMenu(false);
        setSearch(false);
        setFavorites(false);
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, []);

  // Trap focus para diálogos
  useEffect(() => {
    if (!menu && !favorites) return;
    const old = document.body.style.overflow;
    const previous = document.activeElement;
    document.body.style.overflow = "hidden";
    const panel = document.querySelector(
      favorites ? ".edition-favorites" : ".bf-menu",
    );
    const focusable = () =>
      Array.from(
        panel?.querySelectorAll("button, a[href], input, select") || [],
      ).filter((e) => !e.disabled);
    focusable()[0]?.focus();
    const trap = (e) => {
      if (e.key !== "Tab") return;
      const list = focusable();
      const first = list[0],
        last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    panel?.addEventListener("keydown", trap);
    return () => {
      document.body.style.overflow = old;
      panel?.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, [menu, favorites]);

  // Navegación universal y cierre de overlays
  const navigate = (page) => {
    setActiveDropdown(null);
    setMenu(false);
    setSearch(false);
    setFavorites(false);
    setActivePage(page);
  };

  const handleFilter = ({ category, brand, query, sort }) => {
    setActiveDropdown(null);
    setMenu(false);
    setFavorites(false);
    setSearch(false);
    if (onFilterCatalog) {
      onFilterCatalog({ category, brand, query, sort });
    } else if (category && onCategorySelect) {
      onCategorySelect(category);
    } else if (onCollectionSelect) {
      onCollectionSelect(category || "Todas");
    } else {
      navigate("catalog");
    }
  };

  const section = (id) => {
    setActiveDropdown(null);
    navigate("home");
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
      window.history.replaceState(null, "", `/#${id}`);
      window.dispatchEvent(new Event("sauz:navigation"));
    });
  };

  const route = new URL(navigationLocation, window.location.origin);
  const collectionRoute = route.searchParams.get("coleccion");
  const brandRoute = route.searchParams.get("marca");

  // Determinación de enlace activo en navegación
  const getIsActive = (key) => {
    if (key === "home") return route.pathname === "/" && !route.hash;
    if (key === "marcas") return route.hash === "#marcas" || Boolean(brandRoute);
    if (key === "ropa") return ["Camisetas", "Sudaderas", "Conjuntos", "Chaquetas", "Pantalones", "Ropa"].includes(collectionRoute);
    if (key === "sneakers") return collectionRoute === "Zapatillas" || collectionRoute === "Sneakers";
    if (key === "accesorios") return collectionRoute === "Gorras" || collectionRoute === "Accesorios";
    if (key === "colecciones") return route.hash === "#coleccion";
    return false;
  };

  return (
    <>
      <header
        className="bf-header"
        onMouseLeave={handleMouseLeave}
      >
        <a
          className="bf-brand"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("home");
          }}
        >
          <BrandLogo variant="header" />
        </a>

        {/* ============================================================== */}
        {/* NAVEGACIÓN PRINCIPAL DEFINITIVA (6 ELEMENTOS)                 */}
        {/* ============================================================== */}
        <nav className="bf-desktop-nav" aria-label="Navegación Principal">
          {/* 1. Inicio */}
          <button
            onClick={() => navigate("home")}
            aria-current={getIsActive("home") ? "page" : undefined}
            onMouseEnter={() => handleMouseEnter(null)}
          >
            Inicio
          </button>

          {/* 2. Marcas */}
          <button
            onClick={(e) => handleNavClick(e, "marcas")}
            onMouseEnter={() => handleMouseEnter("marcas")}
            aria-expanded={activeDropdown === "marcas"}
            aria-current={getIsActive("marcas") ? "page" : undefined}
            className={`bf-nav-trigger ${activeDropdown === "marcas" ? "is-open" : ""}`}
          >
            Marcas
            <ChevronDown size={13} className="bf-chevron" />
          </button>

          {/* 3. Ropa */}
          <button
            onClick={(e) => handleNavClick(e, "ropa")}
            onMouseEnter={() => handleMouseEnter("ropa")}
            aria-expanded={activeDropdown === "ropa"}
            aria-current={getIsActive("ropa") ? "page" : undefined}
            className={`bf-nav-trigger ${activeDropdown === "ropa" ? "is-open" : ""}`}
          >
            Ropa
            <ChevronDown size={13} className="bf-chevron" />
          </button>

          {/* 4. Sneakers */}
          <button
            onClick={(e) => handleNavClick(e, "sneakers")}
            onMouseEnter={() => handleMouseEnter("sneakers")}
            aria-expanded={activeDropdown === "sneakers"}
            aria-current={getIsActive("sneakers") ? "page" : undefined}
            className={`bf-nav-trigger ${activeDropdown === "sneakers" ? "is-open" : ""}`}
          >
            Sneakers
            <ChevronDown size={13} className="bf-chevron" />
          </button>

          {/* 5. Accesorios */}
          <button
            onClick={(e) => handleNavClick(e, "accesorios")}
            onMouseEnter={() => handleMouseEnter("accesorios")}
            aria-expanded={activeDropdown === "accesorios"}
            aria-current={getIsActive("accesorios") ? "page" : undefined}
            className={`bf-nav-trigger ${activeDropdown === "accesorios" ? "is-open" : ""}`}
          >
            Accesorios
            <ChevronDown size={13} className="bf-chevron" />
          </button>

          {/* 6. Colecciones */}
          <button
            onClick={(e) => handleNavClick(e, "colecciones")}
            onMouseEnter={() => handleMouseEnter("colecciones")}
            aria-expanded={activeDropdown === "colecciones"}
            aria-current={getIsActive("colecciones") ? "page" : undefined}
            className={`bf-nav-trigger ${activeDropdown === "colecciones" ? "is-open" : ""}`}
          >
            Colecciones
            <ChevronDown size={13} className="bf-chevron" />
          </button>
        </nav>

        {/* ============================================================== */}
        {/* ACCIONES DEL HEADER (BUSCADOR, CUENTA, FAVORITOS, BOLSA, MENÚ)  */}
        {/* ============================================================== */}
        <div className="bf-header-actions">
          <button
            aria-label="Buscar"
            aria-expanded={search}
            onClick={() => {
              setSearch(!search);
              setFavorites(false);
              setMenu(false);
              setActiveDropdown(null);
            }}
          >
            <Search size={20} />
          </button>

          <button
            aria-label={user ? "Mi perfil" : "Iniciar sesión"}
            onClick={() =>
              user ? setIsProfileOpen(true) : navigate("adminLogin")
            }
          >
            <User size={20} />
          </button>

          <button
            aria-label={`Favoritos, ${savedProducts.length} artículos`}
            aria-expanded={favorites}
            onClick={() => {
              setFavorites(!favorites);
              setMenu(false);
              setSearch(false);
              setActiveDropdown(null);
            }}
          >
            <Heart size={20} />
            {savedProducts.length > 0 && (
              <span className="bf-cart-count">{savedProducts.length}</span>
            )}
          </button>

          <button
            aria-label={`Bolsa de compras, ${cart.count} artículos`}
            onClick={() => {
              setCartConfirmation(null);
              setMenu(false);
              setFavorites(false);
              setSearch(false);
              setActiveDropdown(null);
              onOpenBag();
            }}
          >
            <ShoppingBag size={20} />
            <span className="bf-cart-count edition-cart-badge">
              {cart.count}
            </span>
          </button>

          <button
            aria-label="Abrir menú"
            aria-expanded={menu}
            className="bf-mobile-menu-btn"
            onClick={() => {
              setMenu(true);
              setFavorites(false);
              setSearch(false);
              setActiveDropdown(null);
            }}
          >
            <Menu size={22} />
          </button>
        </div>

        {/* ============================================================== */}
        {/* MEGA MENÚ DESPLEGABLE DESKTOP (LIMPIO, COMPACTO Y EQUILIBRADO) */}
        {/* ============================================================== */}
        {activeDropdown && (
          <div
            className="sauz-mega-menu-container"
            onMouseEnter={() => handleMouseEnter(activeDropdown)}
            onMouseLeave={handleMouseLeave}
            role="region"
            aria-label={`Menú desplegable de ${activeDropdown}`}
          >
            {/* 1. MARCAS: 5 Columnas Equilibradas sin banners laterales */}
            {activeDropdown === "marcas" && (
              <div className="mega-menu-content mega-grid-5">
                <div className="mega-col">
                  <h4 className="mega-col-title">Nike</h4>
                  <ul className="mega-links-list">
                    <li>
                      <button onClick={() => handleFilter({ brand: "Nike" })}>
                        <strong>Ver todo Nike</strong> <span className="mega-count">16</span>
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ brand: "Nike", category: "Zapatillas" })}>
                        Sneakers & Dunks
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ brand: "Nike", category: "Sudaderas" })}>
                        Hoodies & Sudaderas
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ brand: "Nike", category: "Camisetas" })}>
                        Camisetas Gráficas
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="mega-col">
                  <h4 className="mega-col-title">Jordan</h4>
                  <ul className="mega-links-list">
                    <li>
                      <button onClick={() => handleFilter({ brand: "Jordan" })}>
                        <strong>Ver todo Jordan</strong> <span className="mega-count">10</span>
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ brand: "Jordan", category: "Zapatillas" })}>
                        Air Jordan Retro Series
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ brand: "Jordan", category: "Zapatillas" })}>
                        High & Mid Tops
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ brand: "Jordan", category: "Sudaderas" })}>
                        Apparel Jordan
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="mega-col">
                  <h4 className="mega-col-title">Adidas</h4>
                  <ul className="mega-links-list">
                    <li>
                      <button onClick={() => handleFilter({ brand: "Adidas" })}>
                        <strong>Ver todo Adidas</strong> <span className="mega-count">10</span>
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ brand: "Adidas", category: "Zapatillas" })}>
                        Originals & Campus
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ brand: "Adidas", category: "Chaquetas" })}>
                        Chaquetas Tracktop
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ brand: "Adidas" })}>
                        Classics Deportivos
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="mega-col">
                  <h4 className="mega-col-title">New Era</h4>
                  <ul className="mega-links-list">
                    <li>
                      <button onClick={() => handleFilter({ brand: "New Era" })}>
                        <strong>Ver todo New Era</strong> <span className="mega-count">15</span>
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ brand: "New Era", category: "Gorras" })}>
                        Fitted 59FIFTY (Cerradas)
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ brand: "New Era", category: "Gorras" })}>
                        Snapbacks 9FORTY
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ brand: "New Era", category: "Gorras" })}>
                        Headwear MLB Oficial
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="mega-col">
                  <h4 className="mega-col-title">SAUZ</h4>
                  <ul className="mega-links-list">
                    <li>
                      <button onClick={() => handleFilter({ brand: "SAUZ" })}>
                        <strong>Ver todo SAUZ</strong> <span className="mega-count">18</span>
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ brand: "SAUZ", category: "Camisetas" })}>
                        Heavyweight Boxy Tees
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ brand: "SAUZ", category: "Sudaderas" })}>
                        Luxury Hoodies 450g
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ brand: "SAUZ", category: "Gorras" })}>
                        Caps Black Edition
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* 2. ROPA: 4 Columnas Equilibradas */}
            {activeDropdown === "ropa" && (
              <div className="mega-menu-content mega-grid-4">
                <div className="mega-col">
                  <h4 className="mega-col-title">Prendas Superiores</h4>
                  <ul className="mega-links-list">
                    <li>
                      <button onClick={() => handleFilter({ category: "Camisetas" })}>
                        Camisetas & Boxy Tees <span className="mega-count">13</span>
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ category: "Sudaderas" })}>
                        Sudaderas & Hoodies <span className="mega-count">19</span>
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ category: "Chaquetas" })}>
                        Chaquetas & Outerwear <span className="mega-count">3</span>
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="mega-col">
                  <h4 className="mega-col-title">Prendas Inferiores</h4>
                  <ul className="mega-links-list">
                    <li>
                      <button onClick={() => handleFilter({ category: "Pantalones" })}>
                        Pantalones & Cargos <span className="mega-count">2</span>
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ category: "Conjuntos" })}>
                        Conjuntos Streetwear <span className="mega-count">4</span>
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ category: "Todas" })}>
                        Ver Toda la Indumentaria
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="mega-col">
                  <h4 className="mega-col-title">Siluetas Urbanas</h4>
                  <ul className="mega-links-list">
                    <li>
                      <button onClick={() => handleFilter({ category: "Camisetas" })}>
                        Corte Boxy Streetwear
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ category: "Sudaderas" })}>
                        Drop-Shoulder Heavyweight
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ query: "negro" })}>
                        Monocromo Black Edition
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="mega-col">
                  <h4 className="mega-col-title">Explorar Catálogo</h4>
                  <ul className="mega-links-list">
                    <li>
                      <button onClick={() => handleFilter({ sort: "recientes" })}>
                        Novedades de Temporada
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ sort: "destacados" })}>
                        Las Prendas Más Populares
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ category: "Todas" })}>
                        Ver Todo el Catálogo →
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* 3. SNEAKERS: 3 Columnas Equilibradas */}
            {activeDropdown === "sneakers" && (
              <div className="mega-menu-content mega-grid-3">
                <div className="mega-col">
                  <h4 className="mega-col-title">Por Marca Oficial</h4>
                  <ul className="mega-links-list">
                    <li>
                      <button onClick={() => handleFilter({ category: "Zapatillas" })}>
                        <strong>Ver Todos los Sneakers</strong> <span className="mega-count">12</span>
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ brand: "Nike", category: "Zapatillas" })}>
                        Nike Sportswear & Dunks
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ brand: "Jordan", category: "Zapatillas" })}>
                        Air Jordan Retro Series
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ brand: "Adidas", category: "Zapatillas" })}>
                        Adidas Originals & Campus
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="mega-col">
                  <h4 className="mega-col-title">Por Silueta</h4>
                  <ul className="mega-links-list">
                    <li>
                      <button onClick={() => handleFilter({ category: "Zapatillas" })}>
                        High & Mid Tops Retro
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ category: "Zapatillas" })}>
                        Low Tops & Street Skate
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ brand: "Jordan", category: "Zapatillas" })}>
                        Basketball Heritage Classics
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="mega-col">
                  <h4 className="mega-col-title">Explorar Colección</h4>
                  <ul className="mega-links-list">
                    <li>
                      <button onClick={() => handleFilter({ sort: "recientes", category: "Zapatillas" })}>
                        Últimos Lanzamientos
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ sort: "destacados", category: "Zapatillas" })}>
                        Siluetas Más Buscadas
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ category: "Zapatillas" })}>
                        Ver Todo el Calzado →
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* 4. ACCESORIOS: 3 Columnas Equilibradas */}
            {activeDropdown === "accesorios" && (
              <div className="mega-menu-content mega-grid-3">
                <div className="mega-col">
                  <h4 className="mega-col-title">Headwear por Marca</h4>
                  <ul className="mega-links-list">
                    <li>
                      <button onClick={() => handleFilter({ category: "Gorras" })}>
                        <strong>Ver Todas las Gorras</strong> <span className="mega-count">21</span>
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ brand: "New Era", category: "Gorras" })}>
                        New Era Official Caps <span className="mega-count">15</span>
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ brand: "SAUZ", category: "Gorras" })}>
                        SAUZ Black Edition Caps <span className="mega-count">6</span>
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="mega-col">
                  <h4 className="mega-col-title">Siluetas de Headwear</h4>
                  <ul className="mega-links-list">
                    <li>
                      <button onClick={() => handleFilter({ category: "Gorras" })}>
                        Fitted 59FIFTY (Estructurada cerrada)
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ category: "Gorras" })}>
                        Snapbacks 9FORTY & 9FIFTY (Ajustables)
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ category: "Gorras" })}>
                        Curved Brim & Dad Caps
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="mega-col">
                  <h4 className="mega-col-title">Curaduría & Estilo</h4>
                  <ul className="mega-links-list">
                    <li>
                      <button onClick={() => handleFilter({ brand: "SAUZ", category: "Gorras" })}>
                        Black Edition Signature Caps
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ brand: "New Era", category: "Gorras" })}>
                        Colección MLB Oficial
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ category: "Gorras" })}>
                        Explorar Catálogo Completo →
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* 5. COLECCIONES: 3 Columnas Equilibradas */}
            {activeDropdown === "colecciones" && (
              <div className="mega-menu-content mega-grid-3">
                <div className="mega-col">
                  <h4 className="mega-col-title">Líneas Editoriales</h4>
                  <ul className="mega-links-list">
                    <li>
                      <button onClick={() => section("coleccion")}>
                        <strong>Black Edition Manifesto</strong>
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ sort: "recientes" })}>
                        Colección Editorial 2026
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ query: "negro" })}>
                        Dark Essentials Monocromo
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="mega-col">
                  <h4 className="mega-col-title">Curaduría de Estilo</h4>
                  <ul className="mega-links-list">
                    <li>
                      <button onClick={() => handleFilter({ brand: "SAUZ" })}>
                        Urban Core Signature
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ brand: "Jordan" })}>
                        Basketball Heritage Classics
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ brand: "Nike" })}>
                        Sport & Street Culture
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="mega-col">
                  <h4 className="mega-col-title">Explorar Catálogo</h4>
                  <ul className="mega-links-list">
                    <li>
                      <button onClick={() => handleFilter({ sort: "recientes" })}>
                        Lanzamientos Más Recientes
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ sort: "destacados" })}>
                        Las Piezas Más Buscadas
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleFilter({ category: "Todas" })}>
                        Ver Catálogo Completo →
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ============================================================== */}
      {/* OVERLAY DE BÚSQUEDA GENERAL                                    */}
      {/* ============================================================== */}
      {search && (
        <form
          className="bf-search"
          onSubmit={(e) => {
            e.preventDefault();
            handleFilter({ query: searchQuery });
          }}
        >
          <label htmlFor="site-search">¿QUÉ ESTÁS BUSCANDO?</label>
          <div>
            <input
              id="site-search"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nombre, marca (Nike, Jordan, Adidas, New Era, SAUZ) o categoría"
            />
            <button type="submit" aria-label="Buscar en catálogo">
              <ArrowUpRight />
            </button>
            <button
              type="button"
              aria-label="Cerrar búsqueda"
              onClick={() => setSearch(false)}
            >
              <X />
            </button>
          </div>
        </form>
      )}

      {/* ============================================================== */}
      {/* DRAWER MÓVIL CON ACORDEONES EXPANDIBLES (SIN OVERFLOW)         */}
      {/* ============================================================== */}
      {menu && (
        <div className="bf-menu-backdrop" onClick={() => setMenu(false)}>
          <nav
            className="bf-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menú Principal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bf-menu-top">
              <span>SAUZ / NAVEGACIÓN</span>
              <button
                autoFocus
                aria-label="Cerrar menú"
                onClick={() => setMenu(false)}
              >
                <X />
              </button>
            </div>

            <div className="bf-menu-items-scroll">
              {/* 1. Inicio */}
              <button
                className="bf-menu-link"
                aria-current={getIsActive("home") ? "page" : undefined}
                onClick={() => navigate("home")}
              >
                <small>01</small>
                <span>Inicio</span>
                <ChevronRight size={16} />
              </button>

              {/* 2. Marcas (Acordeón) */}
              <div className="bf-mobile-accordion">
                <button
                  className="bf-menu-link bf-acc-trigger"
                  onClick={() => toggleMobileAccordion("marcas")}
                  aria-expanded={mobileAccordions.marcas}
                >
                  <small>02</small>
                  <span>Marcas</span>
                  <ChevronDown
                    size={16}
                    className={`bf-acc-icon ${mobileAccordions.marcas ? "open" : ""}`}
                  />
                </button>
                {mobileAccordions.marcas && (
                  <div className="bf-acc-drawer">
                    <button onClick={() => handleFilter({ brand: "Nike" })}>
                      Nike (16)
                    </button>
                    <button onClick={() => handleFilter({ brand: "Jordan" })}>
                      Jordan (10)
                    </button>
                    <button onClick={() => handleFilter({ brand: "Adidas" })}>
                      Adidas (10)
                    </button>
                    <button onClick={() => handleFilter({ brand: "New Era" })}>
                      New Era (15)
                    </button>
                    <button onClick={() => handleFilter({ brand: "SAUZ" })}>
                      SAUZ Black Edition (18)
                    </button>
                    <button onClick={() => section("marcas")}>
                      Ver todas las marcas ↗
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Ropa (Acordeón) */}
              <div className="bf-mobile-accordion">
                <button
                  className="bf-menu-link bf-acc-trigger"
                  onClick={() => toggleMobileAccordion("ropa")}
                  aria-expanded={mobileAccordions.ropa}
                >
                  <small>03</small>
                  <span>Ropa</span>
                  <ChevronDown
                    size={16}
                    className={`bf-acc-icon ${mobileAccordions.ropa ? "open" : ""}`}
                  />
                </button>
                {mobileAccordions.ropa && (
                  <div className="bf-acc-drawer">
                    <button onClick={() => handleFilter({ category: "Camisetas" })}>
                      Camisetas (13)
                    </button>
                    <button onClick={() => handleFilter({ category: "Sudaderas" })}>
                      Sudaderas & Hoodies (19)
                    </button>
                    <button onClick={() => handleFilter({ category: "Chaquetas" })}>
                      Chaquetas (3)
                    </button>
                    <button onClick={() => handleFilter({ category: "Pantalones" })}>
                      Pantalones & Joggers (2)
                    </button>
                    <button onClick={() => handleFilter({ category: "Conjuntos" })}>
                      Conjuntos (4)
                    </button>
                    <button onClick={() => handleFilter({ category: "Todas" })}>
                      Ver Toda la Ropa
                    </button>
                  </div>
                )}
              </div>

              {/* 4. Sneakers (Acordeón) */}
              <div className="bf-mobile-accordion">
                <button
                  className="bf-menu-link bf-acc-trigger"
                  onClick={() => toggleMobileAccordion("sneakers")}
                  aria-expanded={mobileAccordions.sneakers}
                >
                  <small>04</small>
                  <span>Sneakers</span>
                  <ChevronDown
                    size={16}
                    className={`bf-acc-icon ${mobileAccordions.sneakers ? "open" : ""}`}
                  />
                </button>
                {mobileAccordions.sneakers && (
                  <div className="bf-acc-drawer">
                    <button onClick={() => handleFilter({ category: "Zapatillas" })}>
                      Ver Todos los Sneakers (12)
                    </button>
                    <button onClick={() => handleFilter({ brand: "Jordan", category: "Zapatillas" })}>
                      Jordan Retro
                    </button>
                    <button onClick={() => handleFilter({ brand: "Nike", category: "Zapatillas" })}>
                      Nike Sneakers
                    </button>
                    <button onClick={() => handleFilter({ brand: "Adidas", category: "Zapatillas" })}>
                      Adidas Originals
                    </button>
                  </div>
                )}
              </div>

              {/* 5. Accesorios (Acordeón) */}
              <div className="bf-mobile-accordion">
                <button
                  className="bf-menu-link bf-acc-trigger"
                  onClick={() => toggleMobileAccordion("accesorios")}
                  aria-expanded={mobileAccordions.accesorios}
                >
                  <small>05</small>
                  <span>Accesorios</span>
                  <ChevronDown
                    size={16}
                    className={`bf-acc-icon ${mobileAccordions.accesorios ? "open" : ""}`}
                  />
                </button>
                {mobileAccordions.accesorios && (
                  <div className="bf-acc-drawer">
                    <button onClick={() => handleFilter({ category: "Gorras" })}>
                      Ver Todas las Gorras (21)
                    </button>
                    <button onClick={() => handleFilter({ brand: "New Era", category: "Gorras" })}>
                      Gorras New Era (15)
                    </button>
                    <button onClick={() => handleFilter({ brand: "SAUZ", category: "Gorras" })}>
                      Gorras SAUZ (6)
                    </button>
                  </div>
                )}
              </div>

              {/* 6. Colecciones (Acordeón) */}
              <div className="bf-mobile-accordion">
                <button
                  className="bf-menu-link bf-acc-trigger"
                  onClick={() => toggleMobileAccordion("colecciones")}
                  aria-expanded={mobileAccordions.colecciones}
                >
                  <small>06</small>
                  <span>Colecciones</span>
                  <ChevronDown
                    size={16}
                    className={`bf-acc-icon ${mobileAccordions.colecciones ? "open" : ""}`}
                  />
                </button>
                {mobileAccordions.colecciones && (
                  <div className="bf-acc-drawer">
                    <button onClick={() => section("coleccion")}>
                      Black Edition Manifesto
                    </button>
                    <button onClick={() => handleFilter({ sort: "recientes" })}>
                      Lanzamientos 2026
                    </button>
                    <button onClick={() => handleFilter({ query: "negro" })}>
                      Dark Essentials Monocromo
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="edition-menu-extra">
              <button onClick={() => navigate("about")}>Nosotros ↗</button>
              <button onClick={() => navigate("location")}>Ubicación ↗</button>
            </div>

            <div className="bf-menu-account">
              {user ? (
                <>
                  <p>{user.name}</p>
                  <button
                    onClick={() => {
                      setMenu(false);
                      setIsProfileOpen(true);
                    }}
                  >
                    Mi perfil y pedidos
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setMenu(false);
                    }}
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    navigate("adminLogin");
                  }}
                >
                  Iniciar sesión / Registrarse ↗
                </button>
              )}
              {isAdmin && (
                <button onClick={() => navigate("admin")}>
                  Administración ↗
                </button>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* ============================================================== */}
      {/* PANEL LATERAL DE FAVORITOS                                     */}
      {/* ============================================================== */}
      {favorites && (
        <div className="bf-menu-backdrop" onClick={() => setFavorites(false)}>
          <section
            className="edition-favorites"
            role="dialog"
            aria-modal="true"
            aria-label="Tus favoritos"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bf-menu-top">
              <span>TUS FAVORITOS / {savedProducts.length}</span>
              <button
                aria-label="Cerrar favoritos"
                onClick={() => setFavorites(false)}
              >
                <X />
              </button>
            </div>
            <p className="bf-muted">Guardados en este dispositivo.</p>
            {savedProducts.length ? (
              <div className="bf-grid">
                {savedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onProductSelect={(id) => {
                      setFavorites(false);
                      onProductSelect(id);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="edition-favorites-empty">
                <Heart size={32} />
                <h2>Tu próxima selección empieza aquí.</h2>
                <p>
                  Guarda tus piezas favoritas con el corazón de cada tarjeta.
                </p>
                <button
                  className="bf-button"
                  onClick={() => {
                    setFavorites(false);
                    handleFilter({ category: "Todas" });
                  }}
                >
                  EXPLORAR COLECCIÓN ↗
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
};
