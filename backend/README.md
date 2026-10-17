# ⚙️ Sauz Store - Backend Oficial (Java 17 Maven & Arquitectura Hexagonal)

Backend oficial del proyecto **Sauz Store** desarrollado en **Java 17 con Maven (`co.edu.cesde`)**, persistencia con **H2 Database** y **Arquitectura Hexagonal (Puertos y Adaptadores)** con principios estrictos de **Programación Orientada a Objetos (POO)**.

---

## 📁 Estructura del Backend

```text
backend/
├── pom.xml                                  # Configuración de Maven, Java 17 y H2 Database
├── src/main/java/app/
│   ├── App.java                             # Clase principal con método main()
│   ├── domain/                              # MODELO DE DOMINIO (POO Pura)
│   │   ├── Person.java                      # Clase base Persona (Encapsulamiento)
│   │   ├── Customer.java                    # Herencia: Customer extends Person
│   │   ├── Product.java                     # Entidad Producto (Atributos, precio, stock)
│   │   ├── Sale.java                        # Venta (Composición con SaleItem y cálculo de total)
│   │   ├── SaleItem.java                    # Ítem de venta con subtotal
│   │   └── enums/
│   │       ├── CategoryEnum.java            # Enumeración de categorías
│   │       └── SizeEnum.java                # Enumeración de tallas
│   ├── repository/                          # PERSISTENCIA (Adaptadores Secundarios / H2)
│   │   ├── CustomerRepositoryImpl.java
│   │   ├── ProductRepositoryImpl.java
│   │   └── SaleRepositoryImpl.java
│   ├── service/                             # LÓGICA DE NEGOCIO Y PUERTOS
│   │   ├── inputport/                       # Puertos de entrada (CustomerService, ProductService, SaleService)
│   │   ├── outputport/                      # Puertos de salida (CustomerRepository, etc.)
│   │   ├── helpers/                         # SetProductCategory, SetProductSize
│   │   ├── validations/                     # FormTypeValidator
│   │   ├── CustomerServiceImpl.java
│   │   ├── ProductServiceImpl.java
│   │   └── SaleServiceImpl.java
│   ├── view/                                # Vistas de consola (CustomerView, ProductView, SaleView)
│   └── userinterface/                       # Menú interactivo de consola (UserInterface.java)
├── data/
│   └── products.json                        # Catálogo de datos JSON para integración web
├── server.js                                # Servidor API HTTP para la tienda web
└── README.md
```

---

## 🧱 Pilares POO Implementados en Java

1. **Herencia:**
   * `Customer` hereda directamente de `Person` (`public class Customer extends Person`).
2. **Encapsulamiento:**
   * Atributos privados (`private final`) con constructores y métodos de acceso (`getters` y `setters`).
3. **Composición:**
   * `Sale` contiene una lista inmutable de `SaleItem` (`Collections.unmodifiableList(items)`).
4. **Abstracción:**
   * Interfaces en `inputport` y `outputport` que desacoplan la lógica del repositorio.

---

## 🚀 Cómo Ejecutar

### 1. Ejecutar Backend en Java (Consola / IntelliJ / Maven):
* Abrir la carpeta `backend` en **IntelliJ IDEA**, **Eclipse** o **VS Code**.
* Ejecutar la clase [`src/main/java/app/App.java`](src/main/java/app/App.java).
* Se desplegará el menú interactivo en consola con H2 Database.

### 2. Ejecutar Servidor Web API:
```bash
npm start
```
*(Inicia el servidor en `http://localhost:3000` para alimentar la interfaz React).*
