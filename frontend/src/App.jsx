import React, { useState, useEffect, lazy, Suspense } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Cart } from "./pages/Cart";
import { CartConfirmation } from "./components/CartConfirmation";
import { CheckoutModal } from "./components/CheckoutModal";
import { ReceiptModal } from "./components/ReceiptModal";
import { Toast } from "./components/Toast";
import { ClientProfileModal } from "./components/ClientProfileModal";
const AdminPanel = lazy(() =>
  import("./components/AdminPanel").then((module) => ({
    default: module.AdminPanel,
  })),
);
import { AdminLogin } from "./components/AdminLogin";
import { Home } from "./pages/Home";
import { Catalog } from "./pages/Catalog";
import { About } from "./pages/About";
import { Location } from "./pages/Location";
import { ProductDetail } from "./pages/ProductDetail";
import { useAuth } from "./context/AuthContext";

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
    category: collection === "Jordan" ? "Todas" : collection,
    search: params.get("q") || (collection === "Jordan" ? "Jordan" : ""),
  };
};

export const App = () => {
  const { user, isAdmin } = useAuth();

  // Determinar página inicial basada en la URL del navegador
  const getInitialPageFromUrl = () => {
    if (typeof window === "undefined") return "home";
    const rawPath = window.location.pathname.toLowerCase();
    const path = rawPath.replace(/\/+$/, "") || "/";
    if (path === "/carrito" || path === "/bolsa") return "cart";
    if (path.startsWith("/producto/")) return "productDetail";
    if (path === "/admin/login") return "adminLogin";
    if (path === "/admin") return "admin";
    if (path === "/catalogo" || path === "/catalog") return "catalog";
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
    else if (page === "catalog") path = "/catalogo";
    else if (page === "about") path = "/nosotros";
    else if (page === "location") path = "/ubicacion";

    if (typeof window !== "undefined" && window.history) {
      window.history.pushState(null, "", path);
    }
    setActivePage(page);
    window.dispatchEvent(new Event("sauz:navigation"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    handleNavigate("catalog");
  };

  const handleCollectionSelect = (collection) => {
    setSelectedCategory(
      collection === "Jordan" || collection === "Todas" ? "Todas" : collection,
    );
    setSearchQuery(collection === "Jordan" ? "Jordan" : "");
    handleNavigate("catalog");
  };

  const handleProductSelect = (productId) => {
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
  if (activePage === "admin") {
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
      />

      {/* Vistas según página activa */}
      {activePage === "home" && (
        <Home
          onCollectionSelect={handleCollectionSelect}
          setActivePage={handleNavigate}
          onCategorySelect={handleCategorySelect}
          onProductSelect={handleProductSelect}
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

      {activePage === "about" && <About setActivePage={handleNavigate} />}

      {activePage === "location" && <Location />}

      {/* Pie de página */}
      <Footer
        setActivePage={handleNavigate}
        onCategorySelect={handleCategorySelect}
      />

      {/* Componentes Globales de Comercio y Autenticación de Clientes */}
      <CartConfirmation onViewBag={() => handleNavigate("cart")} />
      <CheckoutModal />
      <ReceiptModal />
      <Toast />
      <ClientProfileModal />
    </div>
  );
};
