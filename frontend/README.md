# 🖥️ Sauz Store - Frontend (React + Vite)

Capa de presentación e interfaz de usuario para la plataforma de comercio electrónico **Sauz Store**, desarrollada con **React 18**, **Vite** y un sistema de diseño moderno en paleta **Negro & Dorado**.

---

## 📁 Estructura del Frontend

```text
frontend/
├── dist/                      # Compilación para despliegue en producción (build)
├── img/                       # Multimedia (fotografías de prendas, videos hero, iconos)
│   └── Productos/             # Fotos individuales de catálogo
├── src/                       # Código fuente de React
│   ├── components/            # Componentes reutilizables de UI
│   │   ├── Header.jsx         # Barra de navegación, logo y botón de bolsa
│   │   ├── Footer.jsx         # Pie de página y enlaces informativos
│   │   ├── ProductCard.jsx    # Tarjeta de producto con selector y botón de agregar
│   │   ├── CartDrawer.jsx     # Bolsa de compras lateral deslizable (no invasiva)
│   │   ├── CheckoutModal.jsx  # Modal de pago con tarjeta interactiva, transferencia o efectivo
│   │   ├── ReceiptModal.jsx   # Comprobante digital tras confirmar el pedido
│   │   ├── SupportChat.jsx    # Widget flotante de atención y ayuda
│   │   └── Toast.jsx          # Notificaciones visuales de confirmación
│   ├── context/               # Gestión de estado global
│   │   └── CartContext.jsx    # Contexto para sincronizar bolsa, catálogo y pedidos
│   ├── pages/                 # Vistas / Pantallas principales
│   │   ├── Home.jsx           # Página de inicio con hero video y colecciones destacadas
│   │   ├── Catalog.jsx        # Catálogo con buscador y filtros por categoría
│   │   ├── ProductDetail.jsx  # Vista detallada de una prenda específica
│   │   ├── About.jsx          # Quiénes somos: historia y pilares de la marca
│   │   └── Location.jsx       # Tienda física: mapa interactivo, horarios y contacto
│   ├── App.jsx                # Enrutamiento, modales globales y estructura general
│   ├── main.jsx               # Punto de entrada y montaje de React en el DOM
│   ├── styles.css             # Estilos principales de la interfaz
│   └── theme-minimal.css      # Variables de diseño y tema visual
├── index.html                 # Plantilla HTML base de Vite
├── package.json               # Dependencias del frontend (React, Vite, etc.)
└── vite.config.js             # Configuración de Vite y proxy reverso hacia /api
```

---

## 🔄 Conexión con el Backend

El frontend se comunica con el servidor Node.js a través de peticiones HTTP tipo REST consumidas en [`src/context/CartContext.jsx`](file:///c:/Users/rstan/Documents/SauzStore/frontend/src/context/CartContext.jsx):

* **Catálogo:** `GET /api/products` para consultar prendas en tiempo real.
* **Sincronización:** `GET /api/cart` y `POST /api/cart/items` para mantener actualizada la bolsa de compras.
* **Checkout:** `POST /api/checkout` para transmitir los datos del comprador y la pasarela de pago seleccionada.

---

## 🚀 Comandos de Ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo con Vite (puerto 5173 por defecto)
npm run dev

# 3. Compilar para producción (genera la carpeta dist/)
npm run build
```

