# SAUZ STORE BLACK EDITION — REDISEÑO DEFINITIVO DE PRODUCT CARDS + TIPOGRAFÍA ESTILO NIKE

## 1. Diagnóstico Técnico Definitivo

### Causa del "Efecto Sticker" (Rectángulo negro dentro de tarjeta gris)
1. **Fondo de los archivos originales:** El análisis de píxeles demostró que las 70 fotografías de producto (`frontend/productos/SAUZ_*.png`) fueron tomadas sobre un fondo negro de estudio incorporado en el lienzo (`RGB(0,0,0)` a `RGB(3,3,3)` con `Alpha = 255`).
2. **Conflicto cromático del contenedor:** Anteriormente, `.premium-catalog` utilizaba fondo `#080808` y `.bf-product-image` utilizaba `--bf-surface: #141414`. Al colocar una fotografía con fondo `RGB(0,0,0)` sobre un contenedor grisáceo con un `padding` del 5% al 9% o relación de aspecto discordante, el fondo de la imagen se delataba como un recuadro negro flotando sobre un marco gris.
3. **Filtros distorsionantes:** Existía una regla `filter: brightness(1.08)` que aclaraba el fondo negro de la imagen a gris oscuro, remarcando los bordes del archivo contra la tarjeta.
4. **Galería de producto:** `.premium-gallery-main` utilizaba un degradado radial `radial-gradient(circle at center, #303030, #1a1a1a 70%)` que encerraba las prendas en un recuadro gris.

---

## 2. Solución Global Implementada

### A. Superficie Visual Única y Cero Efecto Sticker (`catalog-premium.css` y `black-future.css`)
- **Fondo Unificado en Negro Puro:** Se estableció `background: #000000` en `.premium-catalog`, `.premium-detail`, `.premium-card-visual` y `--bf-bg: #000000` en `.bf-home` y `.bf-section`.
- **Integración 1:1:** Al igualar el lienzo de la página al valor exacto `RGB(0,0,0)` del fondo de las fotografías, la transición entre la foto y el lienzo es **100% invisible**. Las prendas flotan con sus sombras y luces de estudio reales sobre la superficie, sin cajas, bordes ni dobles fondos.
- **Sin Padding ni Recortes:** `.premium-card-visual .sauz-product-image { padding: 0 !important; filter: none !important; object-fit: contain !important; object-position: center center !important; }`. Las prendas no se cortan ni se deforman en ninguna resolución.

### B. Sistema Tipográfico y Jerarquía Estilo Nike (`ProductCard.jsx` y `catalog-premium.css`)
Se implementaron los tokens tipográficos sans-serif limpios (`--font-nike: "Helvetica Neue", Helvetica, Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`) con la estructura exacta de 5 niveles alineada a la izquierda debajo de la foto:

1. **Fotografía Integrada:** Ocupa el ancho completo con relación uniforme `1:1`, fondo negro puro y centrado absoluto.
2. **Estado Comercial (Rojo SAUZ):**
   - Tamaño: `15px` (`14px` en móvil).
   - Peso: `500`.
   - Color: `var(--sauz-red, #e65a5d)`.
   - Texto directo sin badges ni fondos pesados.
   - Refleja datos reales del catálogo: `"Nuevo"`, `"Próximamente"` o `"Agotado"` (se omite si es un producto estándar disponible).
3. **Nombre del Producto:**
   - Tamaño: `16px` (`15px` en móvil).
   - Peso: `600`.
   - Color: `#ffffff` (blanco).
   - `line-height: 1.35; letter-spacing: normal; text-transform: none;` (sin mayúsculas forzadas).
   - `min-height: 2.7em` para mantener alineación homogénea en el grid.
4. **Categoría:**
   - Tamaño: `15px` (`14px` en móvil).
   - Peso: `400`.
   - Color: `#a0a0a0` (gris claro).
   - Texto natural (ej: "Zapatillas", "Sudaderas", "Camisetas", "Gorras").
5. **Precio (COP):**
   - Tamaño: `16px` (`15px` en móvil).
   - Peso: `600`.
   - Color: `#ffffff` (blanco).
   - Formato colombiano (ej: `$ 650.000 COP`). Se muestra únicamente si el producto cuenta con precio comercial real.

### C. Elementos Eliminados (Limpieza Editorial)
- ❌ Eliminados los títulos diminutos y las marcas en mayúsculas con espaciado exagerado encima del nombre.
- ❌ Eliminado el enlace textual repetitivo `"Ver producto ↗"` que ensuciaba las tarjetas.
- ❌ Eliminados botones blancos grandes y marcos dobles.
- ❌ Eliminado el degradado radial gris en la ficha de detalle de producto.

### D. Interacciones y Microanimaciones
- **Botón de Favoritos:** Botón circular discreto (`36x36px`) con fondo translúcido `#111b`, borde sutil y activación en rojo SAUZ.
- **Acceso a Vista Rápida:** Botón circular con icono de ojo que aparece sutilmente con fade-in y elevación al hacer hover/focus (accesible directamente en móvil) y abre modal `<dialog>` accesible.
- **Hover de Tarjeta:** Elevación sutil de `translateY(-2px)` sobre la tarjeta completa sin deformar la foto ni aplicar capas oscuras.
- **Accesibilidad:** Respeto estricto a `@media (prefers-reduced-motion: reduce)`.

---

## 3. Matriz de Validación en las 7 Categorías

| Categoría | Muestra Evaluada | Superficie / Fondo | Padding | Desbordamiento | Estado Visual |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Camisetas** | 7 referencias | 1:1 / `#000000` | 0px | 0px | Integrada sin marco |
| **Sudaderas** | 12 referencias | 1:1 / `#000000` | 0px | 0px | Integrada sin marco |
| **Conjuntos** | 4 referencias | 1:1 / `#000000` | 0px | 0px | Integrada sin marco |
| **Zapatillas** | 12 referencias | 1:1 / `#000000` | 0px | 0px | Integrada sin marco |
| **Gorras** | 12 referencias | 1:1 / `#000000` | 0px | 0px | Integrada sin marco |
| **Chaquetas** | 3 referencias | 1:1 / `#000000` | 0px | 0px | Integrada sin marco |
| **Pantalones** | 2 referencias | 1:1 / `#000000` | 0px | 0px | Integrada sin marco |

---

## 4. Evidencias y Pruebas Automatizadas

- **Pruebas Unitarias de Frontend:** 10 de 10 pruebas pasando (`npm.cmd test --prefix frontend`).
- **Compilación de Producción:** Vite build exitoso en 4.6s sin errores de importación ni dependencias.
- **Inspección Responsiva Headless (1440px, 768px, 390px, 360px):**
  - 0 imágenes rotas (`broken: []`).
  - 0 elementos con desbordamiento horizontal (`overflow: []`).
  - Funcionamiento verificado de drawer de filtros y modal de vista rápida.
- **Capturas Generadas en `docs/catalog-migration/`:**
  - `cards-zapatillas.png` — Fichas de calzado sobre fondo negro continuo con tipografía Nike.
  - `cards-sudaderas.png` — Fichas de sudaderas integradas sin recuadro interno.
  - `cards-pantalones.png` — Fichas de pantalones cargo negros sin sticker.
  - `cards-gorras.png` — Gorras oscuras y claras con iluminación de estudio natural.
  - `cards-camisetas.png` — Camisetas con escala visual proporcionada y sin cortes.
  - `home-cards-1440.png` — Sección "Tu próximo esencial" en la página de inicio.
  - `catalog-390-verified.png` — Vista de catálogo móvil a 2 columnas.
  - `detail-390-verified.png` — Ficha de detalle de producto con galería integrada.
