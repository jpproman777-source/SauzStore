# Integración Frontend ↔ Backend — SAUZ STORE BLACK EDITION

Guía única para conectar el nuevo backend (base de datos, autenticación, catálogo, inventario y pedidos) con el frontend React existente sin necesidad de modificar componentes visuales.

---

## 1. Configuración de la URL de la API

Todas las peticiones HTTP del frontend pasan por [`frontend/src/services/apiClient.js`](./frontend/src/services/apiClient.js).

- **Desarrollo local con proxy Vite:** `frontend/vite.config.js` redirige `/api/*` a `http://localhost:3000`.
- **Backend en otro puerto o dominio:** crea `frontend/.env` a partir de `frontend/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

`apiClient.js`:
- Adjunta `Content-Type: application/json` (omitido automáticamente cuando el cuerpo es `FormData`).
- Lee `localStorage.getItem('sauz_auth_user')` y envía `Authorization: Bearer <token>` cuando existe sesión activa.
- Emite el evento `sauz:session-expired` ante respuestas `401` para cerrar la sesión de forma segura en `AuthContext.jsx`.

---

## 2. Servicios centralizados (`frontend/src/services/`)

| Servicio | Archivo | Módulos que lo consumen |
| :--- | :--- | :--- |
| Cliente base HTTP | `apiClient.js` | Todos los servicios |
| Autenticación y perfil | `authService.js` | `AuthContext.jsx`, `AdminLogin.jsx` |
| Productos, inventario e imagen | `productService.js` | `CartContext.jsx`, `AdminPanel.jsx` |
| Carrito de compras | `cartService.js` | `CartContext.jsx` |
| Checkout y pedidos | `orderService.js` | `CartContext.jsx`, `ClientProfileModal.jsx` |
| Direcciones de entrega | `addressService.js` | `CheckoutModal.jsx`, `ClientProfileModal.jsx` |
| Clientes | `customerService.js` | `AdminPanel.jsx` |
| Módulos Experience | `experienceService.js` | `SauzDrops`, `SauzCommunity`, `StyleStudio`, `SauzFitBuilder`, `MySauzCloset`, `SauzStyleDna` |

---

## 3. Contratos esperados por módulo

### Autenticación, usuarios y roles (`authService.js`)
- `POST /api/auth/login` -> `{ email, password }` -> `{ success: true, token, user: { id, name, email, role, phone, address, city } }`
- `POST /api/auth/register` -> `{ name, email, password, phone, address, city }` -> `{ success: true, token, user }`
- `POST /api/auth/logout` -> cierra/revoca la sesión.
- `GET /api/users/profile?userId=...` y `PUT /api/users/profile` -> consulta y actualiza datos del cliente.
- `POST /api/auth/forgot-password` (`{ email }`) y `POST /api/auth/reset-password` (`{ token, newPassword }`) -> **pendientes de implementar en el nuevo backend**.
- Roles manejados: `'admin'` (acceso a `/admin`) y `'cliente'` (`/mi-cuenta`). **El backend debe validar permisos en cada endpoint protegido.**

### Productos, variantes e inventario (`productService.js`)
- `GET /api/products` -> `{ products: Product[] }`
- `GET /api/products/:id` -> `{ product: Product }`
- `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id` *(admin)*
- `POST /api/products/restock` (`{ productId, variantId, amount }`) y `GET /api/admin/low-stock?threshold=5` *(admin)*
- `POST /api/products/upload-image` (`{ filename, dataUrl }` -> `{ url }`) *(admin)*
- Campos esperados en cada `Product`: `id`, `sku`, `name`, `category`, `brand`, `price` (entero en COP), `previousPrice`, `image`, `images`, `description`, `colors`, `active`, `commercial`, `variants: [{ id, size, color, stock }]`.

### Carrito, direcciones y pedidos (`cartService.js`, `addressService.js`, `orderService.js`)
- Carrito: `GET /api/cart`, `POST /api/cart/items`, `PATCH /api/cart/items/:productId?variantId=...`, `DELETE /api/cart/items/:productId?variantId=...`, `DELETE /api/cart`.
- Direcciones: `GET /api/users/addresses?userId=...`, `POST /api/users/addresses`, `PUT /api/users/addresses/:id`, `DELETE /api/users/addresses/:id?userId=...`.
- Checkout y pedidos: `POST /api/checkout`, `GET /api/orders`, `GET /api/orders/:id`, `PATCH /api/orders/:id` *(admin)*.
- Clientes: `GET /api/customers` (`customerService.js`).

### Estado actual frente al backend nuevo

| Funcionalidad | Estado en Frontend | Dependencia del Backend |
| :--- | :--- | :--- |
| Home, Directorio de Marcas (`/marcas`), Catálogo (`/catalogo`), Detalle (`/producto/:id`) | UI lista y funcional | Requiere `GET /api/products` con precios COP y `variants` reales |
| Login y Registro (`/admin/login`) | Formularios, validaciones y roles listos; sin credenciales quemadas | Requiere JWT/sesión real y validación de roles en servidor |
| Recuperación de contraseña | Formulario y servicio preparados (`requestPasswordReset`) | Pendiente `POST /api/auth/forgot-password` y `/reset-password` |
| Carrito, Checkout y Pedidos | Flujos y servicios conectados | Pendiente persistencia en BD y pasarela de pago real (Wompi / PayU / Bold) |
| Panel Administrativo (`/admin`) | Inventario, CRUD, subida de imagen, pedidos y clientes conectados | Pendiente protección de rol `admin` en API y almacenamiento definitivo de imágenes |
| Favoritos | Persistidos por cuenta en `localStorage` (`useFavorites.js`) | Opcional: endpoint `/api/users/favorites` para sincronización entre dispositivos |
| Módulos Experience (Drops, Closet, Community, Style Studio, Style DNA) | Conectados a `experienceService.js` | Pendiente persistencia real según alcance del proyecto |
