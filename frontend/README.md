# SAUZ STORE BLACK EDITION — Frontend

Interfaz web de **SAUZ STORE BLACK EDITION**, tienda multimarca de streetwear, sneakers y accesorios desarrollada con **React 18** y **Vite 5**.

---

## Tecnologías

- **React 18** (`react`, `react-dom`)
- **Vite 5** (`@vitejs/plugin-react`)
- **Lucide React** (iconografía)
- **Recharts** (gráficos del panel administrativo)
- **SweetAlert2** (alertas y confirmaciones en `src/utilidades/alerts.js`)
- **Node Test Runner** (`node --test tests/*.test.js`)

---

## Instalación, ejecución y compilación

Desde `frontend/`:

```bash
npm install
cp .env.example .env   # Opcional si cambias la URL del backend
npm run dev            # Servidor de desarrollo (http://localhost:5173)
npm test               # Pruebas unitarias
npm run build          # Compilación de producción (dist/)
```

En `frontend/.env`, configura `VITE_API_BASE_URL=http://localhost:3000` si el backend corre en otro host/puerto. En desarrollo local, `vite.config.js` ya proxia `/api` a `http://localhost:3000`.

---

## Estructura de carpetas

```text
frontend/
├── img/                        # Recursos públicos servidos por Vite (publicDir: 'img')
│   ├── Productos/              # Fotografías del catálogo (/Productos/...)
│   ├── editorial/              # Imágenes responsive de Nosotros (/editorial/...)
│   ├── logos/                  # Logos oficiales y copias web (/logos/web/...)
│   ├── fonts/                  # Fuente Archivo Black local
│   ├── SAUZ_CARRUSEL_3_IMAGENES/
│   ├── ropa.png, new-era.webp, tenis.jpeg  # Portadas de colecciones en Home
│   ├── 1.jpeg, 2.jpeg, 3.jpeg              # Fotografías principales de Nosotros
│   └── sauz-placeholder.svg
├── src/
│   ├── recursos/                 # Rutas tipadas de logotipos (brandAssets.js)
│   ├── componentes/
│   │   ├── Administracion/       # AdminPanel.jsx + admin-workspace.css
│   │   ├── Autenticacion/        # AdminLogin.jsx + auth-premium.css
│   │   ├── BarraNavegacion/      # Header, BrandLogo, BrandsDirectoryGrid, ErrorBoundary, Toast
│   │   ├── Carrito/              # CartConfirmation, CheckoutModal, ReceiptModal + checkout-premium.css
│   │   ├── Catalogo/             # CatalogFilters.jsx
│   │   ├── GaleriaProducto/      # ProductGallery, ProductImage + product-gallery.css
│   │   ├── Inicio/               # HomeCarousel, EditorialCollections + home-carousel-layout.css
│   │   ├── PerfilPedidos/        # ClientProfileModal, OrderTracking, OrderShippingEditor + CSS
│   │   ├── PiePagina/            # Footer.jsx
│   │   └── TarjetaProducto/      # ProductCard.jsx
│   ├── contextos/                # AuthContext.jsx y CartContext.jsx
│   ├── hooks/                    # useFavorites.js y useScrollReveal.js
│   ├── utilidades/               # Lógica pura (filtros, zoom, tracking, alertas, resumen admin)
│   ├── paginas/
│   │   ├── Carrito/              # Carrito.jsx + cart-polish.css
│   │   ├── Catalogo/             # Catalogo.jsx + catalog-layout.css + selection-hero.css
│   │   ├── DetalleProducto/      # DetalleProducto.jsx + product-detail-polish.css
│   │   ├── Experiencia/          # Drops, Community, Closet, StyleStudio, FitBuilder, StyleDna, SizeFinder
│   │   ├── Inicio/               # Inicio.jsx + home-catalog-button.css
│   │   ├── Marcas/               # Marcas.jsx + brands-directory.css
│   │   ├── Nosotros/             # Nosotros.jsx + about-editorial.css
│   │   └── Ubicacion/            # Ubicacion.jsx
│   ├── servicios/                # Capa HTTP centralizada (apiClient.js + servicios por módulo)
│   ├── estilos/                  # Hojas CSS globales (cargadas en orden en main.jsx)
│   ├── App.jsx                   # Enrutamiento principal
│   └── main.jsx                  # Punto de entrada React
└── tests/                      # Pruebas automatizadas
```

Consulta [`../BACKEND_INTEGRATION.md`](../BACKEND_INTEGRATION.md) para ver los endpoints y contratos esperados por el frontend.
