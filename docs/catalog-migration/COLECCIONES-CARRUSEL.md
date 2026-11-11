# Colecciones dinámicas — SAUZ STORE Black Edition

## Implementación

La antigua sección estática de tres tarjetas se sustituyó en `frontend/src/pages/Home.jsx` por `CollectionCarousel`. El componente lee los productos del mismo `CartContext` que usa el catálogo.

- Con productos comprables: muestra solo fichas activas, con imagen, precio y variante con stock. Da prioridad a `featured` cuando existe.
- Sin productos comprables: muestra fotografías de productos reales como archivo visual, con un mensaje que invita a consultar precio y disponibilidad en la ficha. Este es el estado actual de las 62 fichas nuevas.
- Las pestañas cubren Camisetas, Gorras, Sneakers, Sudaderas, Conjuntos, Chaquetas y Pantalones. “Ver colección” abre el catálogo filtrado.
- El carrusel usa desplazamiento nativo con snap, flechas, progreso, teclado y gesto táctil. No tiene autoplay.
- Las imágenes usan `object-fit: contain`; los márgenes internos varían por categoría para cuidar gorras, zapatillas y conjuntos.

Archivos: `frontend/src/components/CollectionCarousel.jsx`, `frontend/src/lib/collections.js`, `frontend/src/collections-carousel.css`, `frontend/src/pages/Home.jsx`, `frontend/src/App.jsx`, `frontend/src/main.jsx` y `frontend/tests/collections.test.js`.

## Verificación

- `npm.cmd test --prefix frontend`: 10 pruebas aprobadas.
- `npm.cmd run build --prefix frontend`: compilación correcta.
- Chrome emulado a 1440, 768, 390 y 360 px: imágenes visibles, sin desbordamiento de página ni excepciones de JavaScript.
- Flecha y tecla derecha desplazan el carrusel. En 390 px, el gesto táctil también lo desplaza.
- La pestaña Gorras muestra 21 referencias; “Ver colección” abre `/catalogo?coleccion=Gorras` y una fotografía abre `/producto/39`.

Capturas: [escritorio](collections-1440.png) y [móvil](collections-390.png).
