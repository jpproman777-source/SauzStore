# 👗 Sauz Store - Tienda de Ropa & Moda Urbana (React + Node.js)

E-commerce moderno y modular para **Sauz Store**, construido con **React + Vite** en el frontend y **Node.js** en el backend. Presenta un diseño minimalista en **Negro y Dorado**, catálogo de ropa a pantalla completa, bolsa de compras deslizante (drawer no invasivo) y pasarela de pago completa.

---

## 📁 Estructura del Proyecto

```text
prueba/
├── backend/
│   ├── data/
│   │   └── products.json          # Catálogo de prendas Sauz Store
│   ├── package.json               # Configuración del servidor Node.js
│   └── server.js                  # Servidor HTTP, API REST (/api/*) y estáticos
│
├── frontend/                      # Aplicación React + Vite
│   ├── index.html                 # Entrada HTML de Vite
│   ├── package.json               # Dependencias (React, Vite, etc.)
│   ├── vite.config.js             # Configuración de Vite y proxy para /api
│   └── src/
│       ├── main.jsx               # Montaje de la aplicación React
│       ├── App.jsx                # Enrutador de vistas y modales globales
│       ├── styles.css             # Sistema de diseño en Negro y Dorado
│       ├── context/
│       │   └── CartContext.jsx    # Estado global del carrito y checkout
│       ├── components/
│       │   ├── Header.jsx         # Ticker animado, navegación y bolsa
│       │   ├── Footer.jsx         # Pie de página y enlaces rápidos
│       │   ├── ProductCard.jsx    # Tarjeta de prenda con selector
│       │   ├── CartDrawer.jsx     # Bolsa de compras deslizable
│       │   ├── CheckoutModal.jsx  # Pasarela de pago con tarjeta, Nequi y efectivo
│       │   ├── ReceiptModal.jsx   # Ticket digital de compra confirmada
│       │   └── Toast.jsx          # Notificación emergente
│       └── pages/
│           ├── Home.jsx           # Inicio con video hero de modelos
│           ├── Catalog.jsx        # Catálogo con filtros por categoría y búsqueda
│           ├── About.jsx          # Quiénes somos: historia y pilares
│           └── Location.jsx       # Ubicación: mapa, horarios y WhatsApp
│
├── .gitignore                     # Exclusión de node_modules y logs
├── package.json                   # Scripts de ejecución raíz
└── README.md
```

---

## 🚀 Cómo Iniciar la Aplicación

### 1. Iniciar el Servidor Backend (API en el puerto 3000)
En una terminal:
```bash
cd backend
npm start
```
*(O desde la raíz: `node backend/server.js`)*

Verás el mensaje:
```text
👗 Servidor de Sauz Store iniciado en http://localhost:3000
📦 Catálogo de moda cargado: 8 prendas
```

### 2. Iniciar el Frontend en React (Vite en el puerto 5173)
En otra terminal:
```bash
cd frontend
npm install
npm run dev
```

Abre en tu navegador:
👉 **[http://localhost:5173](http://localhost:5173)**

*Nota: Vite cuenta con proxy configurado automáticamente para conectar con la API de `http://localhost:3000/api` sin problemas de CORS.*

---

## ✨ Características de la Arquitectura React

1. **Componentes Modulares**: Código limpio, dividido en piezas reutilizables y fáciles de modificar.
2. **Contexto Global (`CartContext`)**: La bolsa de compras y el estado de los pedidos se sincronizan en tiempo real entre todas las páginas.
3. **Páginas Integradas**:
   - **Inicio (`Home.jsx`)**: Hero con video en bucle de modelos exhibiendo prendas, categorías visuales y destacados.
   - **Catálogo (`Catalog.jsx`)**: Filtros dinámicos por categoría (*Todas, Camisetas, Chaquetas, Pantalones, Vestidos, Sudaderas, Accesorios*), búsqueda en tiempo real y ordenamiento por precio o nombre.
   - **Quiénes Somos (`About.jsx`)**: Manifiesto de diseño, historia y pilares de confección de la marca.
   - **Ubicación (`Location.jsx`)**: Datos de la tienda Flagship en Medellín, horarios y mapa interactivo.
4. **Pasarela de Pago Completa**:
   - Tarjeta Débito/Crédito con vista previa interactiva en tiempo real.
   - Nequi / Daviplata / Bancolombia con datos de transferencia.
   - Pago en Efectivo Contra Entrega.
   - Ticket digital de confirmación con código oficial `SAUZ-XXXXXX`.
