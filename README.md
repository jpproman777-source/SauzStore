# 👗 Sauz Store - Proyecto Oficial (Java 17 Hexagonal + React 18)

Proyecto académico y profesional para **Sauz Store**, integrando un **Backend oficial en Java 17 con Arquitectura Hexagonal y POO pura** y un **Frontend moderno en React 18 + Vite**.

---

## 📁 Estructura del Repositorio

```text
SauzStore/
├── backend/                                 # BACKEND OFICIAL EN JAVA (Maven + H2 Database)
│   ├── pom.xml                              # Configuración Maven (Java 17, H2 Database)
│   ├── src/main/java/app/                   # Código fuente Java con Arquitectura Hexagonal
│   │   ├── App.java                         # Punto de entrada principal (main)
│   │   ├── domain/                          # Entidades POO (Person, Customer, Product, Sale, SaleItem)
│   │   ├── repository/                      # Implementaciones de persistencia con H2
│   │   ├── service/                         # Servicios y puertos (inputport / outputport)
│   │   ├── view/                            # Vistas de consola
│   │   └── userinterface/                   # Menú interactivo UserInterface
│   ├── data/
│   │   └── products.json                    # Datos de productos para sincronización
│   ├── server.js                            # Servidor API HTTP para la interfaz web
│   └── README.md                            # Documentación del backend Java
│
├── frontend/                                # FRONTEND WEB (React 18 + Vite)
│   ├── src/
│   │   ├── components/                      # Componentes UI (Header, Drawer, Modales, Toast)
│   │   ├── context/CartContext.jsx          # Estado global del carrito y compras
│   │   ├── pages/                           # Páginas (Home, Catalog, ProductDetail, About, Location)
│   │   └── styles.css                       # Diseño Negro y Dorado
│   ├── package.json                         # Dependencias de React y Vite
│   └── README.md                            # Documentación del frontend
│
├── package.json                             # Scripts de ejecución
└── README.md                                # Documentación general
```

---

## 🧱 Pilares de la POO en el Backend Java

* **Herencia directa:** `public class Customer extends Person` en el paquete `app.domain`.
* **Encapsulamiento:** Atributos privados con validación en constructores y métodos getters/setters.
* **Composición:** `Sale` compone fuertemente a `SaleItem` (`getTotal()` calcula la sumatoria de subtotales).
* **Abstracción & Desacoplamiento:** Interfaces en `inputport` y `outputport` para aislar la base de datos de la lógica de negocio.

---

## 🚀 Comandos de Ejecución

### 1. Correr el Backend Java:
* Abrir la carpeta [`backend/`](backend/) en **IntelliJ IDEA**, **Eclipse** o **VS Code**.
* Ejecutar [`src/main/java/app/App.java`](backend/src/main/java/app/App.java).

### 2. Correr la Aplicación Web (Frontend + API):
Desde la raíz del proyecto:
```bash
npm run dev
```
* **Frontend:** [http://localhost:5173](http://localhost:5173)
* **API:** [http://localhost:3000](http://localhost:3000)
