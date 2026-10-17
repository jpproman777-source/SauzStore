# 📊 Diagramas UML y Arquitectura del Sistema - Sauz Store

Documento técnico y visual del sistema de comercio electrónico **Sauz Store**, diseñado para exposición académica y técnica.

---

## 1. Diagrama de Clases UML (Estructura de Datos y Negocio)

Este diagrama modela las entidades del sistema, sus atributos con tipos de datos, visibilidad (`+` público, `-` privado), métodos y relaciones de agregación (`*--`), asociación (`-->`) y dependencia (`..>`).

```mermaid
classDiagram
    class Product {
        +int id
        +String name
        +String category
        +String description
        +float price
        +String icon
        +String image
        +int stock
        +isAvailable() boolean
    }

    class CartItem {
        +int productId
        +String name
        +float price
        +String image
        +String icon
        +int quantity
        +getSubtotal() float
    }

    class Cart {
        +List~CartItem~ items
        +float subtotal
        +float tax
        +float total
        +int count
        +addItem(int productId, int quantity) void
        +updateQuantity(int productId, int newQuantity) void
        +removeItem(int productId) void
        +clear() void
        +calculateSummary() CartSummary
    }

    class Customer {
        +String name
        +String email
        +String phone
        +String address
        +String city
    }

    class Payment {
        +String method
        +String status
        +String label
        +Object details
        +processPayment() boolean
    }

    class Order {
        +String orderId
        +String date
        +Customer customer
        +Payment payment
        +List~CartItem~ items
        +float subtotal
        +float tax
        +float total
        +int count
        +generateReceipt() Receipt
    }

    class SauzServer {
        -int PORT
        -String PRODUCTS_FILE
        -List~Product~ products
        -Cart cart
        +serveStaticFile(req, res, pathname) void
        +getCartSummary() Object
        +handleGetProducts(res) void
        +handleAddToCart(req, res) void
        +handleUpdateCart(req, res, id) void
        +handleDeleteCartItem(res, id) void
        +handleClearCart(res) void
        +handleCheckout(req, res) void
    }

    %% Relaciones
    Cart "1" *-- "0..*" CartItem : contiene por composición
    CartItem "1" --> "1" Product : hace referencia a
    Order "1" *-- "1..*" CartItem : contiene
    Order "1" --> "1" Customer : realizada por
    Order "1" --> "1" Payment : pagada mediante
    SauzServer ..> Cart : administra en memoria
    SauzServer ..> Order : genera en checkout
    SauzServer ..> Product : carga desde JSON
```

---

## 2. Diagrama de Secuencia UML (Flujo de Compra y Checkout)

Muestra la interacción dinámica paso a paso en el tiempo entre el Cliente, el Frontend (React), el Contexto de estado, el Backend (Node.js) y la Capa de Datos (JSON / Memoria).

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as 👤 Cliente / Usuario
    participant UI as 🖥️ Frontend (React / Vite)
    participant CartCtx as 🔄 CartContext
    participant API as ⚙️ Backend API (server.js)
    participant DB as 📦 products.json / Memoria

    Note over Cliente,DB: 1. Carga inicial del catálogo de moda
    Cliente->>UI: Ingresa a la tienda
    UI->>API: GET /api/products
    API->>DB: Lee archivo products.json
    DB-->>API: Retorna arreglo de prendas
    API-->>UI: 200 OK (Catálogo disponible)
    UI-->>Cliente: Renderiza catálogo con imágenes y precios

    Note over Cliente,DB: 2. Agregar prenda al carrito
    Cliente->>UI: Clic en "Añadir al Carrito"
    UI->>CartCtx: addToCart(productId, quantity)
    CartCtx->>API: POST /api/cart/items {productId, quantity}
    API->>DB: Verifica existencia de producto
    API->>API: Actualiza lista de items y recalcula IVA (16%)
    API-->>CartCtx: 200 OK {success: true, cart: summary}
    CartCtx-->>UI: Notifica cambio de estado (Badge / Drawer)
    UI-->>Cliente: Feedback visual (Toast de éxito)

    Note over Cliente,DB: 3. Proceso de Pago (Checkout)
    Cliente->>UI: Clic en "Finalizar Compra"
    UI-->>Cliente: Despliega CheckoutModal
    Cliente->>UI: Ingresa datos de envío y selecciona método de pago
    Cliente->>UI: Clic en "Confirmar Pedido"
    UI->>API: POST /api/checkout {customer, payment}
    API->>API: Valida carrito no vacío
    API->>API: Genera orderId ("SAUZ-XXXX") y fecha
    API->>API: Vacía carrito en memoria (cart = [])
    API-->>UI: 200 OK {success: true, order, cart}
    UI->>CartCtx: Actualiza carrito a 0 items
    UI-->>Cliente: Muestra ReceiptModal con recibo digital 🎉
```

---

## 3. Diagrama de Casos de Uso UML

Modela las funcionalidades del sistema desde la perspectiva del actor (Cliente / Comprador).

```mermaid
flowchart LR
    subgraph Actores
        Cliente(("👤 Cliente / Comprador"))
    end

    subgraph Sistema_SauzStore ["🛒 Sistema E-Commerce Sauz Store"]
        direction TB
        UC1(["Ver catálogo de prendas"])
        UC2(["Consultar detalle de prenda"])
        UC3(["Gestionar carrito de compras"])
        UC4(["Añadir prendas al carrito"])
        UC5(["Actualizar cantidades / Eliminar prendas"])
        UC6(["Calcular subtotal e impuestos (IVA 16%)"])
        UC7(["Procesar compra (Checkout)"])
        UC8(["Registrar información de envío"])
        UC9(["Seleccionar método de pago (Tarjeta / Transferencia / Efectivo)"])
        UC10(["Obtener comprobante de pedido"])
    end

    Cliente --> UC1
    Cliente --> UC2
    Cliente --> UC3
    Cliente --> UC7

    UC3 -.->|<<include>>| UC4
    UC3 -.->|<<include>>| UC5
    UC3 -.->|<<include>>| UC6

    UC7 -.->|<<include>>| UC8
    UC7 -.->|<<include>>| UC9
    UC7 -.->|<<include>>| UC10
```

---

## 4. Diagrama de Arquitectura de Componentes

Muestra cómo interactúan las capas de presentación, lógica de negocio y persistencia.

```mermaid
flowchart TD
    subgraph Frontend ["🖥️ Capa de Presentación (Frontend React + Vite)"]
        direction TB
        App["App.jsx (Enrutamiento y Layout)"]
        Pages["Páginas (Home, Catalog, ProductDetail, About, Location)"]
        Components["Componentes UI (Header, ProductCard, CartDrawer, CheckoutModal, ReceiptModal)"]
        Context["CartContext.jsx (Estado Global)"]
        
        App --> Pages
        Pages --> Components
        Components <--> Context
    end

    subgraph Backend ["⚙️ Capa del Servidor (Node.js HTTP Server)"]
        direction TB
        Server["server.js (Router HTTP & API Controller)"]
        Static["Servidor de Archivos Estáticos"]
        Logic["Lógica de Negocio (Cálculo IVA 16%, Totales, Checkout)"]
        
        Server --> Static
        Server --> Logic
    end

    subgraph Persistencia ["💾 Capa de Persistencia y Datos"]
        JSON[("products.json (Catálogo de Productos)")]
        Memory[("Estado en Memoria (Carrito y Órdenes)")]
    end

    Context -- "HTTP REST (Fetch / JSON)" --> Server
    Server -- "fs.readFileSync" --> JSON
    Logic <--> Memory
```

---

## 5. Guion Rápido para Exponer (Puntos Clave)

1. **Introducción:**
   > *"Buenos días / tardes. Presento la arquitectura de **Sauz Store**, una plataforma de comercio electrónico de moda urbana desarrollada con una arquitectura Cliente-Servidor desacoplada."*

2. **Diagrama de Clases:**
   > *"En nuestro diagrama de clases destacamos la entidad `Product`, la cual alimenta al `CartItem`. La clase `Cart` maneja una relación de composición fuerte con sus items y se encarga del cálculo automático de subtotales e IVA del 16%. Al procesar la compra, la clase `Order` encapsula el cliente (`Customer`), la forma de pago (`Payment`) y la lista de productos adquiridos."*

3. **Diagrama de Secuencia:**
   > *"El diagrama de secuencia describe el ciclo de vida de una compra: primero la consulta asíncrona del catálogo de productos vía `GET /api/products`; segundo, la actualización reactiva del carrito mediante `POST /api/cart/items`; y finalmente, la transacción atómica de checkout vía `POST /api/checkout`, la cual genera un identificador único de orden (`SAUZ-XXXX`) y resetea el carrito."*

4. **Diagrama de Casos de Uso:**
   > *"El actor principal es el Cliente. Las funcionalidades nucleares son la exploración de prendas, la administración reactiva del carrito y la pasarela de compra, con relaciones de inclusión (`<<include>>`) para garantizar que la orden siempre valide el pago y los datos de envío."*

