# SAUZ STORE BLACK EDITION — Frontend

Interfaz web de **SAUZ STORE BLACK EDITION**, tienda multimarca de streetwear, sneakers y accesorios desarrollada con **React 18** y **Vite 5**.

---

## Tecnologías

- **React 18** (`react`, `react-dom`)
- **Vite 5** (`@vitejs/plugin-react`)
- **Lucide React** (iconografía)
- **Recharts** (gráficos del panel administrativo)
- **SweetAlert2** (alertas y confirmaciones en `src/lib/alerts.js`)
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
│   ├── assets/                 # Rutas tipadas de logotipos (brandAssets.js)
│   ├── components/
│   │   ├── account/            # Perfil de cliente, direcciones y trazabilidad de pedidos
│   │   ├── admin/              # Panel administrativo (AdminPanel.jsx + CSS)
│   │   ├── auth/               # Login y registro (AdminLogin.jsx + CSS)
│   │   ├── cart/               # Confirmación, checkout y recibo
│   │   ├── catalog/            # ProductCard, ProductGallery, ProductImage, CatalogFilters
│   │   ├── home/               # HomeCarousel y EditorialCollections
│   │   └── layout/             # Header, Footer, BrandLogo, BrandsDirectoryGrid, ErrorBoundary, Toast
│   ├── context/                # AuthContext.jsx y CartContext.jsx
│   ├── hooks/                  # useFavorites.js y useScrollReveal.js
│   ├── lib/                    # Utilidades puras (filtros, zoom, tracking, alertas, resumen admin)
│   ├── pages/                  # Home, Catalog, ProductDetail, Brands, About, Location, Cart y Experience
│   ├── services/               # Capa HTTP centralizada (apiClient.js + servicios por módulo)
│   ├── styles/                 # Hojas CSS globales (cargadas en orden en main.jsx)
│   ├── App.jsx                 # Enrutamiento principal
│   └── main.jsx                # Punto de entrada React
└── tests/                      # Pruebas automatizadas
```

Consulta [`../BACKEND_INTEGRATION.md`](../BACKEND_INTEGRATION.md) para ver los endpoints y contratos esperados por el frontend.
