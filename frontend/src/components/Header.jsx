import React, { useState, useEffect } from "react";
import {
  Menu,
  Search,
  User,
  ShoppingBag,
  X,
  ArrowUpRight,
  Heart,
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
}) => {
  const { cart, products, setCartConfirmation } = useCart();
  const { user, isAdmin, setIsProfileOpen, logout } = useAuth();
  const [navigationLocation, setNavigationLocation] = useState(
    () =>
      window.location.pathname + window.location.search + window.location.hash,
  );
  useEffect(() => {
    const sync = () =>
      setNavigationLocation(
        window.location.pathname +
          window.location.search +
          window.location.hash,
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
  const [menu, setMenu] = useState(false),
    [search, setSearch] = useState(false);
  useEffect(() => {
    const close = (e) => {
      if (e.key === "Escape") {
        setMenu(false);
        setSearch(false);
        setFavorites(false);
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, []);
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
        panel.querySelectorAll("button, a[href], input, select"),
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
    panel.addEventListener("keydown", trap);
    return () => {
      document.body.style.overflow = old;
      panel.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, [menu, favorites]);
  const navigate = (page) => {
    setMenu(false);
    setSearch(false);
    setFavorites(false);
    setActivePage(page);
  };
  const collection = (value) => {
    setMenu(false);
    setFavorites(false);
    setSearch(false);
    onCollectionSelect(value);
  };
  const section = (id) => {
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
  const activeNavigation =
    route.pathname === "/"
      ? route.hash === "#marcas"
        ? "Marcas"
        : route.hash === "#coleccion"
          ? "Colecciones"
          : route.hash
            ? null
            : "Inicio"
      : ["/catalogo", "/catalog"].includes(route.pathname.replace(/\/$/, ""))
        ? ["Ropa", "Sneakers", "Accesorios"].includes(collectionRoute)
          ? collectionRoute
          : "Colecciones"
        : route.pathname.startsWith("/producto/")
          ? "Colecciones"
          : null;
  const navigationItems = [
    ["Inicio", () => navigate("home")],
    ["Marcas", () => section("marcas")],
    ["Ropa", () => collection("Ropa")],
    ["Sneakers", () => collection("Sneakers")],
    ["Accesorios", () => collection("Accesorios")],
    ["Colecciones", () => section("coleccion")],
  ];
  return (
    <>
      <header className="bf-header">
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
        <nav className="bf-desktop-nav" aria-label="Principal">
          {navigationItems.map(([label, action]) => (
            <button
              key={label}
              onClick={action}
              aria-current={label === activeNavigation ? "page" : undefined}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="bf-header-actions">
          <button
            aria-label="Buscar"
            aria-expanded={search}
            onClick={() => {
              setSearch(!search);
              setFavorites(false);
              setMenu(false);
            }}
          >
            <Search size={20} />
          </button>
          <button
            aria-label={user ? "Mi perfil" : "Iniciar sesi\xF3n"}
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
            }}
          >
            <Heart size={20} />
            {savedProducts.length > 0 && (
              <span className="bf-cart-count">{savedProducts.length}</span>
            )}
          </button>
          <button
            aria-label={`Bolsa de compras, ${cart.count} art\xEDculos`}
            onClick={() => {
              setCartConfirmation(null);
              setMenu(false);
              setFavorites(false);
              setSearch(false);
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
            onClick={() => {
              setMenu(true);
              setFavorites(false);
              setSearch(false);
            }}
          >
            <Menu size={22} />
          </button>
        </div>
      </header>
      {search && (
        <form
          className="bf-search"
          onSubmit={(e) => {
            e.preventDefault();
            navigate("catalog");
          }}
        >
          <label htmlFor="site-search">¿QUÉ ESTÁS BUSCANDO?</label>
          <div>
            <input
              id="site-search"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nombre, marca o categoría"
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
      {menu && (
        <div className="bf-menu-backdrop" onClick={() => setMenu(false)}>
          <nav
            className="bf-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
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
            {navigationItems.map(([label, action], i) => (
              <button
                className="bf-menu-link"
                aria-current={label === activeNavigation ? "page" : undefined}
                key={label}
                onClick={action}
              >
                <small>0{i + 1}</small>
                {label}
                <span>↗</span>
              </button>
            ))}
            <div className="edition-menu-extra">
              <button onClick={() => section("fit-lab")}>SAUZ Fit Lab ↗</button>
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
                  onClick={() => collection("Todas")}
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
