# SAUZ STORE BLACK EDITION — ESTADO DE INTEGRACIÓN CON BACKEND
## AUDITORÍA DE ENDPOINTS Y CONTRATOS PENDIENTES

---

### 1. Endpoints Existentes y Completamente Integrados

| Módulo | Método | Endpoint | Estado en Frontend | Descripción / Contrato |
| :--- | :---: | :--- | :---: | :--- |
| **Autenticación** | `POST` | `/api/auth/login` | **Conectado** | `{ email, password }` -> `{ success, user, token }` |
| **Autenticación** | `POST` | `/api/auth/register` | **Conectado** | `{ name, email, password, phone, address, city }` -> `{ success, user, token }` |
| **Autenticación** | `POST` | `/api/auth/logout` | **Conectado** | Cierre de sesión y revocación |
| **Perfil** | `GET` | `/api/users/profile` | **Conectado** | Consulta por `userId` o `email` |
| **Perfil** | `PUT` | `/api/users/profile` | **Conectado** | Actualiza nombre, teléfono y datos |
| **Direcciones** | `GET` | `/api/users/addresses` | **Conectado** | Retorna array de direcciones del cliente |
| **Direcciones** | `POST` | `/api/users/addresses` | **Conectado** | Agrega dirección colombiana normalizada |
| **Direcciones** | `DELETE` | `/api/users/addresses/:id` | **Conectado** | Elimina dirección por ID |
| **Productos** | `GET` | `/api/products` | **Conectado** | Catálogo real con 74 productos y variantes |
| **Productos** | `GET` | `/api/products/:id` | **Conectado** | Ficha detallada por ID |
| **Inventario** | `GET` | `/api/admin/low-stock` | **Conectado** | Alertas de stock crítico (umbral paramétrico) |
| **Inventario** | `POST` | `/api/products/restock` | **Conectado** | Reabastecimiento de variantes |
| **Carrito** | `GET` | `/api/cart` | **Conectado** | Sincronización de bolsa en servidor |
| **Carrito** | `POST` | `/api/cart/items` | **Conectado** | `{ productId, variantId, quantity }` |
| **Carrito** | `PATCH` | `/api/cart/items/:id` | **Conectado** | Modificación de cantidades |
| **Carrito** | `DELETE` | `/api/cart/items/:id` | **Conectado** | Eliminación de ítem |
| **Carrito** | `DELETE` | `/api/cart` | **Conectado** | Vaciado total de bolsa |
| **Checkout** | `POST` | `/api/checkout` | **Conectado** | Crea orden con items, envío, pago y tracking |
| **Pedidos** | `GET` | `/api/orders` | **Conectado** | Historial de órdenes para cliente y admin |
| **Pedidos** | `PATCH` | `/api/orders/:id` | **Conectado** | Actualización de estado y trazabilidad |
| **Clientes** | `GET` | `/api/customers` | **Conectado** | Lista de clientes en panel admin |
| **Dashboard** | `GET` | `/api/dashboard/stats` | **Conectado** | Métricas comerciales e ingresos COP |

---

### 2. Endpoints Pendientes que Requiere el Desarrollador Backend

Los siguientes endpoints no se encuentran implementados aún en el backend y son requeridos para la fase de producción completa:

#### PENDIENTE 1: Recuperación de Contraseña por Correo
- **Funcionalidad requerida:** Envío de correo electrónico con token temporal de un solo uso para restablecer contraseña olvidada.
- **Endpoint necesario:** `/api/auth/forgot-password`
- **Método HTTP:** `POST`
- **Datos de entrada (Payload JSON):**
  ```json
  {
    "email": "cliente@ejemplo.com"
  }
  ```
- **Respuesta esperada:**
  ```json
  {
    "success": true,
    "message": "Si el correo existe en nuestro sistema, recibirá un enlace de restablecimiento en los próximos minutos."
  }
  ```
- **Motivo por el que se necesita:** Actualmente el frontend muestra un diálogo modal informativo guiando al usuario a comunicarse con soporte. Para autoservicio del cliente, se requiere integración SMTP / Transaccional (SendGrid, Resend o similar).

---

#### PENDIENTE 2: Restablecimiento de Contraseña con Token
- **Funcionalidad requerida:** Aplicar nueva contraseña validando el token recibido por correo.
- **Endpoint necesario:** `/api/auth/reset-password`
- **Método HTTP:** `POST`
- **Datos de entrada (Payload JSON):**
  ```json
  {
    "token": "token_alfanumerico_seguro_expirable",
    "newPassword": "NuevaPassword123"
  }
  ```
- **Respuesta esperada:**
  ```json
  {
    "success": true,
    "message": "Contraseña actualizada exitosamente. Puede iniciar sesión ahora."
  }
  ```
- **Motivo por el que se necesita:** Cierre del ciclo de recuperación segura de credenciales sin intervención de administradores.

---

#### PENDIENTE 3: Pasarela de Pago con Tarjeta en Línea (Tokenización Webhook)
- **Funcionalidad requerida:** Procesamiento en vivo de tarjetas de crédito/débito en Colombia (Wompi, PayU, Bold o MercadoPago).
- **Endpoint necesario:** `/api/payments/create-intent` y `/api/payments/webhook`
- **Método HTTP:** `POST`
- **Datos de entrada (Payload JSON):**
  ```json
  {
    "orderId": "ORD-2026-XXXX",
    "amountInCents": 18990000,
    "currency": "COP",
    "customerEmail": "cliente@sauzstore.com"
  }
  ```
- **Respuesta esperada:**
  ```json
  {
    "success": true,
    "paymentIntentId": "pi_wompi_xxxx",
    "checkoutUrl": "https://checkout.wompi.co/p/..."
  }
  ```
- **Motivo por el que se necesita:** Actualmente el checkout soporta **Pago Contra Entrega** (100% operativo) y **Transferencia Electrónica Directa** (Nequi / Bancolombia con confirmación). Las compras con tarjeta se registran con estado inicial pendiente hasta la conexión de credenciales de la pasarela oficial.
