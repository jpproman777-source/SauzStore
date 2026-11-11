# Migración local del catálogo — 10 de noviembre de 2026

## Plan aplicado

1. Respaldar `backend/data/products.json` antes de editarlo.
2. Conservar los 12 registros existentes y marcarlos `active: false`; sus IDs siguen disponibles para el historial de pedidos.
3. Registrar solo artículos visualmente distintos. Mantener precio, stock y tallas sin confirmar como pendientes y bloquear su compra.
4. Copiar los archivos al directorio público `frontend/img/Productos` sin alterar los originales en `frontend/productos`.
5. Filtrar productos archivados en la API pública y rechazar altas de carrito para referencias sin datos comerciales.

No se aplicó ningún cambio a producción ni se borraron registros históricos.

## Resultado

| Concepto | Cantidad |
| --- | ---: |
| Imágenes recibidas | 70 |
| Archivos idénticos por SHA-256 | 1 par (005 y 064) |
| Tomas adicionales del mismo artículo por revisión visual | 7 |
| Productos nuevos | 62 |
| Productos anteriores archivados | 12 |

Las tomas adicionales son 018→013, 020→015, 032→023, 041→039, 048→035, 054→022 y 061→052. Las imágenes de estas tomas se conservan como `alternateImages` de su ficha; 064 no se copia al directorio público porque es idéntica a 005.

### Distribución por marca

| Marca | Fichas |
| --- | ---: |
| Nike | 16 |
| Adidas | 10 |
| Jordan | 10 |
| New Era | 15 |
| SAUZ STORE | 6 |
| Por clasificar | 5 |

### Distribución por categoría

| Categoría | Fichas |
| --- | ---: |
| Gorras | 21 |
| Sudaderas | 13 |
| Zapatillas | 12 |
| Camisetas | 7 |
| Conjuntos | 4 |
| Chaquetas | 3 |
| Pantalones | 2 |

## Revisión manual

Las fichas 005, 060, 062, 063 y 068 tienen marca `Por clasificar`. Todas las 62 fichas requieren confirmar precio, tallas e inventario antes de habilitar compras. También conviene validar nombres comerciales y la clasificación visual de marcas con el proveedor. El [contacto visual](contact-sheet.png) permite revisar las 70 imágenes.

## Persistencia y alcance

La aplicación comercial usa Node con archivos JSON. `backend/data/products.json` es el catálogo en uso; `backend/data/products.before-catalog-2026-11-10.json` es el respaldo anterior. Los datos de usuarios y pedidos no cambiaron. El proyecto incluye además código Java/Maven, pero no participa en esta API ni se modificó.

Archivos de código y datos modificados: `backend/data/products.json`, `backend/server.js`, `frontend/src/components/AdminPanel.jsx`, `frontend/src/lib/products.js`, `frontend/src/pages/ProductDetail.jsx` y `frontend/tests/products.test.js`. Archivos nuevos: respaldo JSON, 69 imágenes públicas (62 principales y 7 tomas adicionales), `scripts/migrate-catalog.js`, `scripts/check-catalog.js`, esta documentación y el contacto visual. Las 70 imágenes originales de `frontend/productos` permanecen intactas.

## Verificación

- `npm.cmd test --prefix frontend`: 5/5 pruebas.
- `npm.cmd run build --prefix frontend`: compilación correcta.
- `node scripts/check-catalog.js`: 62 fichas públicas, 62 imágenes principales con HTTP 200, compra de ficha pendiente rechazada (409), carrito sin cambios.
- Corrección posterior: la misma prueba ahora fuerza el servidor a usar el frontend fuente (sin `dist`) y verifica que las imágenes se sirven desde `frontend/img`, que era la ruta ausente en ese modo.
- No se ejecutó revisión visual en navegador ni se inspeccionó una consola del navegador.
