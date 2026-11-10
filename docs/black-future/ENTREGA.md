# SAUZ STORE — BLACK FUTURE 2.0

Entrega local: 10 de noviembre de 2026. No se publicó en producción.

## Arquitectura y protección del proyecto

Frontend React 18 con Vite 5, React Context y navegación mediante History API. El backend es un servidor HTTP nativo de Node con API `/api`, datos JSON y carrito en memoria. Vite usa `frontend/img` como directorio público y su proxy de desarrollo apunta al puerto 3000.

El cambio previo de `backend/data/products.json` se conservó exactamente: comparación binaria del diff inicial con el diff final del backend. No se modificaron backend, autenticación, endpoints, inventario, pedidos ni pagos. Las pruebas del carrito usaron un proceso independiente en el puerto 3100 y no enviaron ningún checkout. La protección de rol del panel continúa en el render de la ruta; se eliminó una comprobación duplicada de navegación que capturaba el usuario anterior al login y devolvía al usuario autenticado al formulario.

Punto de recuperación: rama local `codex/recovery-black-future-20261110`, commit registrado en [qa/commit-base.txt](qa/commit-base.txt). El diff ajeno que ya existía se guardó en [qa/cambios-previos.patch](qa/cambios-previos.patch). No se hicieron commits ni cambios de rama sobre el trabajo del usuario.

## Implementación

- Portada tipográfica de pantalla completa con composición original en CSS. Header y hero ocupan juntos el primer viewport en las siete resoluciones. No se presenta una fotografía como campaña aprobada. El contenedor `.bf-hero-art` queda separado para integrar un recurso editorial autorizado.
- Tokens BLACK FUTURE centralizados en `frontend/src/black-future.css`, con alias compatibles con los componentes existentes. Formularios, login, registro, perfil, carrito, checkout, notificaciones y administración reciben la paleta oscura. Estados funcionales conservan su color semántico.
- Navegación de escritorio y móvil, búsqueda, menú con Escape, retención de foco y devolución del foco al cerrarlo.
- Catálogo con búsqueda por nombre, descripción, marca y categoría; filtros de categoría, marca y disponibilidad; orden por precio y nombre; estados de carga, vacío y reintento; paginación de 12 referencias.
- Tarjetas con enlaces propios y navegación por teclado. Fichas persistentes en `/producto/:id`, recarga, estados no encontrados, galería según imágenes disponibles, detalles y relacionados.
- Se eliminaron del nuevo inicio el formulario que simulaba una suscripción y de la ficha las tallas fijas S/M/L/XL que la API no persistía. Se muestran solamente datos existentes y no se añaden promesas nuevas de envío, materiales o devoluciones a la ficha.
- Fit Lab combina categorías existentes y permite agregar cada pieza comercial disponible a la bolsa mediante la función actual. Inferiores, sneakers y accesorios permanecen deshabilitados porque el catálogo actual solo tiene camisetas y sudaderas.
- La carga del panel administrativo se difiere: el JavaScript inicial pasa de aproximadamente 727 kB a 233 kB. El panel y Recharts se descargan al abrir administración.
- Transiciones discretas y respeto por `prefers-reduced-motion`. Se desactivan los pulsos continuos del panel.

## Logos e imágenes

Se conserva el archivo original `/Logo_principal.png` de SAUZ sin recolorear, recortar ni deformar. `BrandLogo` centraliza su presentación con proporción original y `object-fit: contain`. Nike, Jordan y Adidas se representan con identificadores tipográficos porque el repositorio no incluye archivos de sus logos auténticos. No se dibujaron imitaciones.

Los 12 productos tienen fotografías locales existentes, con coincidencia exacta de rutas y mayúsculas. Se comprobaron respuestas HTTP 200 y MIME de imagen en las 12 rutas. No se reprodujo un 403/404 en ellas. Vite debe servirse con su configuración o el backend debe usar el build: el directorio fuente público es `frontend/img`, no `frontend/Productos`.

`ProductImage` incorpora un fallback local original `/sauz-placeholder.svg` para fotografías ausentes, sin sustituirlas por otro producto. Se utiliza en tarjetas, fichas, Fit Lab, carrito, perfil y administración. Se provocó un fallo de carga en navegador y se verificó el fallback.

## Catálogo y referencias pendientes

**12 referencias comerciales existentes, 0 referencias de demostración añadidas.** IDs únicos, precios y stock conservados. El frontend impide habilitar la compra de una referencia marcada como demostración/no comercial, sin precio válido o sin disponibilidad.

No se encontró `50_referencias_fuentes.csv` en el proyecto. No se crearon 50 referencias ni se rellenaron SKUs, URLs, tallas, colores o precios. Los nombres genéricos actuales no identifican inequívocamente un modelo oficial de Nike/Jordan/Adidas; su correspondencia oficial queda pendiente. No se hizo scraping ni se incorporaron fotografías externas. La marca solo se toma del campo existente o de nombres que la incluyen; las restantes se muestran como «Marca por confirmar».

[Catálogo auditado](catalogo-auditado.csv): 12 registros del sistema, datos comerciales existentes y campos oficiales pendientes. Este CSV es documentación, no una fuente nueva para la API.

La API actual recibe `productId` y `quantity` y no conserva tallas por artículo. Implementar variantes comprables exige un cambio fuera del alcance frontend autorizado. La paginación está implementada, pero no se ejerció el cambio a una segunda página porque existen exactamente 12 productos. No se simularon productos en el catálogo comercial.

## Validación ejecutada

- `npm --prefix frontend run build`: correcto, sin advertencias en la compilación final. Vite generó aproximadamente 233,26 kB de JavaScript inicial, 496,45 kB para administración y 87,52 kB de CSS.
- `npm --prefix frontend test`: correcto. También se ejecutó directamente `node frontend/tests/products.test.js`: cinco casos pasaron, cubriendo integridad del catálogo, bloqueo de demostraciones, agotados, datos comerciales incompletos y URLs propias.
- `git diff --check`: correcto.
- Chrome headless mediante DevTools Protocol: rutas de inicio, catálogo, producto, nosotros, ubicación y login en 1920×1080, 1440×900, 1366×768, 1024×768, 768×1024, 390×844 y 375×812. Se cargaron también las imágenes diferidas. Sin scroll horizontal de documento, imágenes rotas ni excepciones de JavaScript. Hero + header ocupan exactamente la altura inicial de cada viewport.
- Administración, perfil y checkout revisados en las mismas siete resoluciones. Sin scroll horizontal de documento ni desbordamiento del contenedor de los modales. Las tablas del panel conservan su desplazamiento interno.
- 58 comprobaciones funcionales y 22 comprobaciones adicionales del panel/perfil/checkout completadas. Pruebas funcionales y capturas detalladas en [qa](qa/) y [capturas](capturas/). Se comprobaron filtros, búsqueda, orden, fichas, recarga, carrito, cantidad/subtotal, persistencia del carrito al recargar, apertura del checkout, registro como vista, Fit Lab, menú, movimiento reducido y fallback. No se completó ninguna compra ni se ejecutó un registro de usuario.
- No hay linter ni comprobación de tipos configurados; el proyecto utiliza JavaScript/JSX. No se declara una ejecución de esas herramientas.

Los enlaces internos de fichas y navegación se revisaron en navegador. Los enlaces de contacto y el mapa heredados no se sustituyeron por URLs inventadas; la titularidad de WhatsApp/correo, dirección y condiciones comerciales existentes requieren confirmación del negocio. No se verificó una compra real, una integración de pagos externa ni la persistencia del carrito después de reiniciar el backend: se mantiene la implementación actual en memoria.

## Archivos

Nuevos: `frontend/src/black-future.css`, `components/BrandLogo.jsx`, `components/ProductImage.jsx`, `components/FitLab.jsx`, `lib/products.js`, `frontend/img/sauz-placeholder.svg`, `frontend/tests/products.test.js` y esta documentación con evidencias.

Rediseñados o ajustados: `frontend/index.html`, `frontend/package.json`, `src/App.jsx`, `src/main.jsx`, `src/styles.css`, `src/theme-minimal.css`, páginas `Home`, `Catalog`, `ProductDetail`, `About`, componentes `Header`, `Footer`, `ProductCard`, `CartDrawer`, `CheckoutModal`, `ClientProfileModal`, `AdminLogin`, `AdminPanel`, `ErrorBoundary` y `Toast`. Los contextos de autenticación y comercio permanecen intactos.

Para revisar localmente: `npm --prefix frontend run build` y `npm start` (puerto 3000). Para desarrollo: `npm run dev`. Los procesos auxiliares usados para QA se detuvieron al terminar.
