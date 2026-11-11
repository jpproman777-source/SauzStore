# SAUZ Store Black Edition: validación visual y movimiento

## Cambios

- `ProductImage` entrega JPEG de 480 o 960 píxeles según el espacio disponible y conserva el PNG original para la vista ampliada y como respaldo. Las imágenes de tarjetas, colecciones, carrito, vista rápida y miniaturas usan `object-fit: contain` y posición centrada.
- Las tarjetas y piezas del carrusel tienen movimiento corto al pasar el cursor; se eliminó la ampliación de imagen que podía recortar prendas. El catálogo, la portada y el detalle revelan secciones conforme entran en pantalla con `IntersectionObserver`.
- Cajón de filtros, vista rápida y controles comparten duraciones y curvas de animación. `prefers-reduced-motion` desactiva las animaciones de entrada y revelado.
- `scripts/create-product-thumbnails.ps1` genera las variantes JPEG sin cambiar los 70 PNG de `frontend/productos`.

## Comprobaciones realizadas

- 70 PNG de origen, 69 PNG públicos (una foto duplicada exacta) y 138 JPEG optimizados; todas las variantes JPEG tienen el lado largo correcto. Los JPEG ocupan 6,21 MB en conjunto.
- 62 referencias públicas con imagen accesible. Las ocho pestañas del carrusel tienen imágenes decodificables y `object-fit: contain`.
- Chrome sin interfaz: catálogo y detalle a 1440, 768, 390 y 360 píxeles; ninguna imagen rota ni desbordamiento de página. Capturas en este directorio (`catalog-390-verified.png`, `detail-390-verified.png`, `collections-1440.png`, `collections-390.png`).
- Carrusel: flechas, teclado, gesto táctil, filtros por categoría y enlaces funcionan. Filtros y vista rápida del catálogo funcionan. Sin excepciones de JavaScript en estas pruebas.
- `npm test --prefix frontend`: 10 pruebas correctas. `node scripts/check-catalog.js`, `node scripts/check-variants.js` y `npm run build --prefix frontend`: correctos.

## Revisión manual en Windows

Abrir Chrome o Edge con aceleración por hardware activada y recorrer inicio, catálogo, detalle y cajones a la frecuencia nativa del monitor. Repetir con la aceleración desactivada para detectar saltos de animación. Comprobar la opción de reducir movimiento del sistema, el foco visible con Tab y el zoom al 200 %. Estas comprobaciones requieren una sesión gráfica real; Chrome sin interfaz no permite confirmar una tasa de FPS ni el comportamiento de la GPU o del monitor.
