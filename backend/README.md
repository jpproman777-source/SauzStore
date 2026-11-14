# ⚙️ Sauz Store - Backend

La tienda web se sirve mediante la API Node.js de `server.js`. La aplicación Java
de consola descrita más abajo es independiente y conserva su base H2.

## Conectar la API web con MySQL/MariaDB de XAMPP

La API Node puede usar las tablas `products`, `customers`, `sales` y `sale_items`
de `sauz_store_db`. Conserva los productos como filas por variante (talla/color)
y añade campos de catálogo, seguimiento de pedidos y direcciones de clientes.

1. En XAMPP inicia **MySQL** y selecciona `sauz_store_db` en phpMyAdmin.
2. Exporta una copia de seguridad de la base antes de cambiar su estructura.
3. En phpMyAdmin abre la pestaña **SQL**, pega el contenido de
   [`mysql-migration.sql`](./mysql-migration.sql) y ejecútalo **una sola vez**.
   La migración conserva las filas existentes; no vuelvas a ejecutarla después
   de que se haya aplicado correctamente.
4. Copia `.env.example` como `.env` dentro de `backend/` y configura usuario y
   contraseña de MySQL localmente. No compartas ni subas `backend/.env`.
5. Instala dependencias e inicia la API desde la raíz del proyecto:

   ```powershell
   npm --prefix backend install
   npm run dev:backend
   ```

6. Inicia el frontend en otra terminal con `npm run dev:frontend`. El proxy de
   Vite ya dirige `/api` a `http://localhost:3000`.

### Importar el catálogo JSON existente

Para copiar el catálogo de `backend/data/products.json` a MySQL, con XAMPP
encendido y después de aplicar la migración anterior, ejecuta desde la raíz:

```powershell
npm --prefix backend run import:products
```

El importador conserva productos que ya existan en SQL, no elimina filas y se
puede ejecutar de nuevo sin duplicar los productos importados. Copia los 76
registros del archivo, mantiene desactivados los productos archivados y guarda
las rutas de imagen existentes (las imágenes continúan en `frontend/img`).

La API comprueba la conexión y la migración antes de escuchar en el puerto 3000.
Si `DB_NAME` no está configurado, conserva el modo JSON anterior.

Las contraseñas en texto plano que ya existan en `customers.password_customer`
se convierten a hash al iniciar sesión correctamente. Los nuevos registros se
guardan con hash desde el comienzo.

El catálogo web agrupa las filas de `products` que tengan el mismo
`product_group_id`. La migración asigna a cada fila antigua su propio grupo; al
crear productos desde el panel, sus variantes se almacenan en filas relacionadas.
Los pedidos y sus líneas se guardan en `sales` y `sale_items`, y el stock se
descuenta dentro de una transacción SQL.

Para que el número de documento de cada nuevo cliente sea también su
`id_customer`, aplica una sola vez [`document-id-migration.sql`](./document-id-migration.sql)
después de la migración inicial. El cambio conserva los IDs existentes y sus
relaciones con ventas/direcciones. En el formulario de registro se solicitan
tipo y número de documento; el número debe ser único y se usa como clave del
cliente. Los clientes existentes conservan su ID actual.

La columna `customer_type` ya no se usa. Se eliminó de la base de datos junto
con sus valores; el script [`remove-customer-type.sql`](./remove-customer-type.sql)
documenta ese cambio y no crea respaldos.

La API espera que cada cliente tenga un correo distinto. Si phpMyAdmin informa
que no puede crear el índice único de correo, revisa y resuelve primero los
correos duplicados en `customers`.

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
