# Rediseño del catálogo Black Edition

## Alcance

- Tarjetas nuevas con fotografía completa, marca, título de dos líneas, precio o estado «Próximamente», favoritos, vista rápida y enlace de producto.
- Catálogo con buscador, marca, categoría, orden, filtros combinables, chips activos y panel móvil. Los filtros locales se reflejan en la URL.
- Detalle con galería de imágenes reales, zoom, miniaturas solo cuando existen tomas adicionales, selección de variante, cantidad, favoritos y acordeones.
- Variantes de talla con stock propio configurables desde el panel. El carrito y el pedido conservan `variantId`, talla, cantidad y precio. Las fichas sin precio o variantes confirmadas siguen bloqueadas para compra.
- Inventario administrativo con reabastecimiento por variante.

## Archivos de código modificados

`backend/server.js`, `frontend/src/App.jsx`, `frontend/src/main.jsx`, `frontend/src/components/AdminPanel.jsx`, `frontend/src/components/CartDrawer.jsx`, `frontend/src/components/FitLab.jsx`, `frontend/src/components/ProductCard.jsx`, `frontend/src/components/ReceiptModal.jsx`, `frontend/src/context/CartContext.jsx`, `frontend/src/lib/products.js`, `frontend/src/pages/Cart.jsx`, `frontend/src/pages/Catalog.jsx`, `frontend/src/pages/ProductDetail.jsx` y `frontend/tests/products.test.js`.

Archivos nuevos: `frontend/src/catalog-premium.css`, `frontend/src/lib/catalogFilters.js`, `frontend/tests/catalog-filters.test.js`, `scripts/check-variants.js` y `scripts/check-responsive.mjs`.

No se alteraron las imágenes originales ni los 62 productos para inventar precios o tallas.

## Verificación

- `npm.cmd test --prefix frontend`: 8 pruebas aprobadas.
- `npm.cmd run build --prefix frontend`: compilación correcta.
- `node scripts/check-catalog.js`: 62 fichas e imágenes públicas; compra de ficha pendiente rechazada.
- `node scripts/check-variants.js`: dos tallas en el carrito, límites de stock, talla conservada en pedido, actualización y reabastecimiento desde API.
- Chrome emulado a 1440, 768, 390 y 360 px: catálogo y detalle sin imágenes rotas, sin desbordamiento y sin excepciones de JavaScript. Vista rápida y panel de filtros abiertos correctamente. Capturas verificadas: [catálogo móvil](catalog-390-verified.png) y [detalle móvil](detail-390-verified.png).

Las políticas concretas de envío, cambios y devoluciones no estaban disponibles en el proyecto; la interfaz muestra texto neutral hasta que se configuren. Las equivalencias de tallas tampoco se muestran sin datos confirmados.
