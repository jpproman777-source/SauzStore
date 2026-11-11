import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Header } from "./componentes/BarraNavegacion/Header";
import { Footer } from "./componentes/PiePagina/Footer";
import { Cart } from "./paginas/Carrito/Carrito";
import { CartConfirmation } from "./componentes/Carrito/CartConfirmation";
import { CheckoutModal } from "./componentes/Carrito/CheckoutModal";
import { ReceiptModal } from "./componentes/Carrito/ReceiptModal";
import { Toast } from "./componentes/BarraNavegacion/Toast";
import { ClientProfileModal } from "./componentes/PerfilPedidos/ClientProfileModal";
const AdminPanel = lazy(() =>
  import("./componentes/Administracion/AdminPanel").then((module) => ({
    default: module.AdminPanel,
  })),
);
import { AdminLogin } from "./componentes/Autenticacion/AdminLogin";
import { Home } from "./paginas/Inicio/Inicio";
import { Catalog } from "./paginas/Catalogo/Catalogo";
import { About } from "./paginas/Nosotros/Nosotros";
import Brands from "./paginas/Marcas/Marcas";
import { Location } from "./paginas/Ubicacion/Ubicacion";
import { ProductDetail } from "./paginas/DetalleProducto/DetalleProducto";
import { StyleStudio } from "./paginas/Experiencia/StyleStudio";
import { SauzFitBuilder } from "./paginas/Experiencia/SauzFitBuilder";
import { SauzStyleDna } from "./paginas/Experiencia/SauzStyleDna";
import { MySauzCloset } from "./paginas/Experiencia/MySauzCloset";
import { SauzDrops } from "./paginas/Experiencia/SauzDrops";
import { SauzCommunity } from "./paginas/Experiencia/SauzCommunity";
import { SauzSizeFinder } from "./paginas/Experiencia/SauzSizeFinder";
import { useAuth } from "./contextos/AuthContext";

const readProductId = () => {
  const match = window.location.pathname.match(/^\/producto\/([^/]+)\/?$/);
  try {
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
};

const readCatalogLocation = () => {
  const params = new URLSearchParams(window.location.search);
  const collection = params.get("coleccion") || "Todas";
  return {
    category: collection === "Jordan" ? "Todas" : collection === "Sneakers" ? "Zapatillas" : collection,
    search: params.get("q") || (collection === "Jordan" ? "Jordan" : ""),
  };
};

export const App = () => {
  const { user, isAdmin, isProfileOpen, setIsProfileOpen } = useAuth();

  // Determinar página inicial basada en la URL del navegador
  const getInitialPageFromUrl = () => {
    if (typeof window === "undefined") return "home";
    const rawPath = window.location.pathname.toLowerCase();
    const path = rawPath.replace(/\/+$/, "") || "/";
    if (path === "/carrito" || path === "/bolsa") return "cart";
    if (path.startsWith("/producto/")) return "productDetail";
    if (path === "/mi-cuenta") return "account";
    if (path === "/admin/login") return "adminLogin";
    if (path === "/admin") return "admin";
    if (path === "/style-studio" || path === "/studio") return "styleStudio";
    if (path === "/fit-builder" || path === "/budget-fit") return "fitBuilder";
    if (path === "/style-dna") return "styleDna";
    if (path === "/closet" || path === "/my-closet") return "closet";
    if (path === "/drops") return "drops";
    if (path === "/community") return "community";
    if (path === "/size-finder" || path === "/tallas") return "sizeFinder";
    if (path === "/catalogo" || path === "/catalog") return "catalog";
    if (path === "/marcas" || path === "/brands") return "brands";
    if (path === "/nosotros" || path === "/about") return "about";
    if (path === "/ubicacion" || path === "/location") return "location";
    return "home";
  };

  const [activePage, setActivePage] = useState(getInitialPageFromUrl);
  const [selectedCategory, setSelectedCategory] = useState(
    () => readCatalogLocation().category,
  );
  const [searchQuery, setSearchQuery] = useState(
    () => readCatalogLocation().search,
  );
  const [selectedProductId, setSelectedProductId] = useState(readProductId);
  const catalogUrl = useRef(null);

  // Sincronizar URL del navegador y escuchar navegación hacia atrás/adelante
  useEffect(() => {
    const handlePopState = () => {
      const page = getInitialPageFromUrl();
      setActivePage(page);
      setSelectedProductId(readProductId());
      if (page === "catalog") {
        const location = readCatalogLocation();
        setSelectedCategory(location.category);
        setSearchQuery(location.search);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (activePage !== "catalog") return;
    const params = new URLSearchParams(window.location.search);
    if (selectedCategory && selectedCategory !== "Todas")
      params.set("coleccion", selectedCategory);
    else params.delete("coleccion");
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    else params.delete("q");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      window.location.pathname + (query ? "?" + query : ""),
    );
    window.dispatchEvent(new Event("sauz:navigation"));
  }, [activePage, selectedCategory, searchQuery]);

  // Función de navegación segura
  const handleNavigate = (page) => {
    if (page === "account" && isAdmin) page = "admin";
    if (page === "admin") {
      // Access remains enforced by the admin route render guard below.
      // Navigation must not read the pre-login user captured by an async handler.
      if (typeof window !== "undefined" && window.history) {
        window.history.pushState(null, "", "/admin");
      }
      setActivePage("admin");
      return;
    }

    if (page === "adminLogin") {
      if (typeof window !== "undefined" && window.history) {
        window.history.pushState(null, "", "/admin/login");
      }
      setActivePage("adminLogin");
      return;
    }

    // Rutas públicas
    let path = "/";
    if (page === "cart") path = "/carrito";
    else if (page === "styleStudio") path = "/style-studio";
    else if (page === "fitBuilder") path = "/fit-builder";
    else if (page === "styleDna") path = "/style-dna";
    else if (page === "closet") path = "/closet";
    else if (page === "drops") path = "/drops";
    else if (page === "community") path = "/community";
    else if (page === "sizeFinder") path = "/size-finder";
    else if (page === "catalog") path = activePage === "productDetail" && catalogUrl.current ? catalogUrl.current : "/catalogo";
    else if (page === "account") path = "/mi-cuenta";
    else if (page === "brands") path = "/marcas";
    else if (page === "about") path = "/nosotros";
    else if (page === "location") path = "/ubicacion";

    if (typeof window !== "undefined" && window.history) {
      window.history.pushState(null, "", path);
    }
    setActivePage(page);
    window.dispatchEvent(new Event("sauz:navigation"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCatalogFilter = ({ category = "Todas", brand = "Todas", query = "", sort = "destacados" } = {}) => {
    const normalizedCategory = category === "Sneakers" ? "Zapatillas" : category || "Todas";
    const normalizedQuery = typeof query === "string" ? query : "";
    setSelectedCategory(normalizedCategory);
    setSearchQuery(normalizedQuery);

    const params = new URLSearchParams();
    if (brand && brand !== "Todas") params.set("marca", brand);
    if (sort && sort !== "destacados") params.set("orden", sort);
    if (normalizedCategory && normalizedCategory !== "Todas") {
      params.set("coleccion", normalizedCategory);
    }
    if (normalizedQuery.trim()) params.set("q", normalizedQuery.trim());

    const qStr = params.toString();
    const targetUrl = "/catalogo" + (qStr ? "?" + qStr : "");
    window.history.pushState(null, "", targetUrl);
    setActivePage("catalog");
    window.dispatchEvent(new Event("sauz:navigation"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategorySelect = (category) => {
    handleCatalogFilter({
      category: category === "Sneakers" ? "Zapatillas" : category || "Todas",
      brand: "Todas",
      query: "",
      sort: "destacados",
    });
  };

  const handleCollectionSelect = (collection) => {
    if (collection === "Jordan") {
      handleCatalogFilter({
        category: "Todas",
        brand: "Jordan",
        query: "",
        sort: "destacados",
      });
      return;
    }
    handleCatalogFilter({
      category:
        collection === "Todas"
          ? "Todas"
          : collection === "Sneakers"
            ? "Zapatillas"
            : collection,
      brand: "Todas",
      query: "",
      sort: "destacados",
    });
  };

  const handleProductSelect = (productId) => {
    if (activePage === "catalog") catalogUrl.current = window.location.pathname + window.location.search;
    setSelectedProductId(productId);
    window.history.pushState(
      null,
      "",
      `/producto/${encodeURIComponent(productId)}`,
    );
    setActivePage("productDetail");
    window.dispatchEvent(new Event("sauz:navigation"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (isProfileOpen && user) {
      setIsProfileOpen(false);
      handleNavigate(isAdmin ? 'admin' : 'account');
    }
  }, [isProfileOpen, user, isAdmin]);

  useEffect(() => {
    if (activePage === "account" && isAdmin) {
      window.history.replaceState(null, "", "/admin");
      setActivePage("admin");
    }
  }, [activePage, isAdmin]);

  // ==============================================================
  // RUTA 1: LOGIN ADMINISTRATIVO INDEPENDIENTE (/admin/login)
  // ==============================================================
  if (activePage === "adminLogin") {
    return (
      <div className="admin-app-wrapper">
        <AdminLogin setActivePage={handleNavigate} />
        <Toast />
      </div>
    );
  }

  // ==============================================================
  // RUTA 2: PANEL DE ADMINISTRACIÓN PROTEGIDO (/admin)
  // ==============================================================
  if (activePage === "admin" || (activePage === "account" && isAdmin)) {
    if (!user || user.role !== "admin") {
      return (
        <div className="admin-app-wrapper">
          <AdminLogin setActivePage={handleNavigate} />
          <Toast />
        </div>
      );
    }

    return (
      <div className="admin-app-wrapper">
        <Suspense
          fallback={
            <main className="bf-empty" role="status">
              Cargando administración…
            </main>
          }
        >
          <AdminPanel setActivePage={handleNavigate} />
        </Suspense>
        <Toast />
      </div>
    );
  }

  // ==============================================================
  // RUTA 3: TIENDA PÚBLICA DE MODA (HOME, CATÁLOGO, PRODUCTO, ETC.)
  // ==============================================================
  return (
    <div className="app-container">
      {/* Encabezado y navegación */}
      <Header
        onOpenBag={() => handleNavigate("cart")}
        selectedCategory={selectedCategory}
        onCollectionSelect={handleCollectionSelect}
        onProductSelect={handleProductSelect}
        activePage={activePage}
        setActivePage={handleNavigate}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onFilterCatalog={handleCatalogFilter}
        onCategorySelect={handleCategorySelect}
      />

      {/* Vistas según página activa */}
      {activePage === "home" && (
        <Home
          onCollectionSelect={handleCollectionSelect}
          setActivePage={handleNavigate}
          onCategorySelect={handleCategorySelect}
          onProductSelect={handleProductSelect}
          onCatalogFilter={handleCatalogFilter}
        />
      )}

      {activePage === "cart" && (
        <Cart
          onExplore={() => handleCollectionSelect("Todas")}
          setActivePage={handleNavigate}
          onProductSelect={handleProductSelect}
        />
      )}
      {activePage === "catalog" && (
        <Catalog
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onProductSelect={handleProductSelect}
        />
      )}

      {activePage === "productDetail" && (
        <ProductDetail
          key={selectedProductId}
          productId={selectedProductId}
          onProductSelect={handleProductSelect}
          setActivePage={handleNavigate}
        />
      )}

      {activePage === "styleStudio" && (
        <StyleStudio
          onProductSelect={handleProductSelect}
          setActivePage={handleNavigate}
        />
      )}

      {activePage === "fitBuilder" && (
        <SauzFitBuilder
          onProductSelect={handleProductSelect}
          setActivePage={handleNavigate}
        />
      )}

      {activePage === "styleDna" && (
        <SauzStyleDna
          onProductSelect={handleProductSelect}
          setActivePage={handleNavigate}
          onCategorySelect={handleCategorySelect}
        />
      )}

      {activePage === "closet" && (
        <MySauzCloset
          onProductSelect={handleProductSelect}
          setActivePage={handleNavigate}
        />
      )}

      {activePage === "drops" && (
        <SauzDrops
          onProductSelect={handleProductSelect}
          setActivePage={handleNavigate}
        />
      )}

      {activePage === "community" && (
        <SauzCommunity
          onProductSelect={handleProductSelect}
          setActivePage={handleNavigate}
        />
      )}

      {activePage === "sizeFinder" && (
        <SauzSizeFinder
          setActivePage={handleNavigate}
          onCategorySelect={handleCategorySelect}
        />
      )}

      {activePage === "brands" && <Brands onCatalogFilter={handleCatalogFilter} />}

      {activePage === "about" && <About onCatalogFilter={handleCatalogFilter} />}

      {activePage === "location" && <Location />}

      {activePage === 'account' && (user ? <ClientProfileModal pageMode onNavigate={handleNavigate} onProductSelect={handleProductSelect} /> : <main className="account-signin" aria-labelledby="account-signin-title">
        <section className="account-signin-card">
          <span className="account-signin-eyebrow">SAUZ / MI CUENTA</span>
          <h1 id="account-signin-title">TU ESPACIO.<br />TU ESTILO.</h1>
          <p>Vuelve a entrar para consultar tus favoritos, tu selección y el estado de tus pedidos.</p>
          <div className="account-signin-actions">
            <button className="account-signin-primary" type="button" onClick={() => handleNavigate('adminLogin')}>Iniciar sesión <ArrowRight size={18} aria-hidden="true" /></button>
            <button className="account-signin-secondary" type="button" onClick={() => handleNavigate('home')}><ArrowLeft size={16} aria-hidden="true" /> Volver a la tienda</button>
          </div>
        </section>
      </main>)}

      {/* Pie de página */}
      <Footer
        setActivePage={handleNavigate}
        onCategorySelect={handleCategorySelect}
        onCollectionSelect={handleCollectionSelect}
      />

      {/* Componentes Globales de Comercio y Autenticación de Clientes */}
      <CartConfirmation onViewBag={() => handleNavigate("cart")} />
      <CheckoutModal />
      <ReceiptModal />
      <Toast />
    </div>
  );
};
