# SAUZ STORE — Home Black Edition 001

Implementación local del 10 de noviembre de 2026. Se conserva el trabajo previo de BLACK FUTURE y no se publica en producción.

## Recursos exactos

Se localizó `/home/juandev/Descargas/SAUZ_CARRUSEL_3_IMAGENES.zip`. Sus tres PNG se copiaron a `frontend/img/SAUZ_CARRUSEL_3_IMAGENES/` sin modificar ni un byte:

- `01-jordan-original.png`
- `02-camisetas.png`
- `03-gorras-nike-jordan-adidas.png`

Los tres originales suman 8.027.761 bytes. Las versiones WebP de escritorio suman 549.464 bytes, una reducción aproximada del 93 %. También se incluyen versiones de 960 píxeles. Se conserva la proporción 2:1 y la composición completa, sin recortar, regenerar ni sustituir productos. Los PNG quedan como fallback de `<picture>`.

**Diferencia entre adjuntos:** los archivos del ZIP no son todos idénticos a las imágenes insertadas en el chat. El archivo `02-camisetas.png` del ZIP muestra camisetas negras sin logos. `03-gorras-nike-jordan-adidas.png` muestra las tres marcas sobre concreto. Se priorizaron los archivos exactos que el texto declara obligatorios.

Los originales, derivados y sus hashes están registrados en [qa/recursos.json](qa/recursos.json). Vite copia la carpeta pública al build. Las rutas `/SAUZ_CARRUSEL_3_IMAGENES/01-jordan-original.png`, `/SAUZ_CARRUSEL_3_IMAGENES/02-camisetas.png` y `/SAUZ_CARRUSEL_3_IMAGENES/03-gorras-nike-jordan-adidas.png` respondieron HTTP 200 desde el servidor local del build de producción. También se probaron las tres versiones WebP grandes y su decodificación en Chrome. Esto no constituye una comprobación de una publicación remota: no se desplegó la tienda.

## Pantalla implementada

- Header negro `#080808`, logo original SAUZ proporcionado, menú centrado con Inicio, Marcas, Ropa, Sneakers, Accesorios y Colecciones. Buscar, Cuenta, Favoritos y Carrito funcionan. El menú móvil conserva también Nosotros, Ubicación, Fit Lab y los accesos de sesión anteriores.
- Tres slides en el orden Jordan, Camisetas y Gorras, con los títulos, subtítulos y botones solicitados. Texto a la izquierda y fotografía completa a la derecha en escritorio; imagen superior y texto inferior en móvil. El degradado se adapta sin deformar las fotos.
- Header y hero ocupan el primer viewport en las siete medidas revisadas. Las tarjetas de Camisetas, Gorras y Sneakers aparecen después, en ese orden: tres columnas en escritorio y una columna en móvil.
- Autoplay de seis segundos, flechas laterales en escritorio y controles inferiores en móvil, indicadores clicables, contador, teclas izquierda/derecha/Home/End y deslizamiento táctil.
- La interacción manual detiene el autoplay; el botón de reproducción permite reanudar. El foco, hover, pestaña oculta o carrusel fuera de vista suspenden el temporizador. `prefers-reduced-motion` desactiva autoplay y transiciones.
- Favoritos locales con botones de corazón en las tarjetas, panel con productos guardados, eliminación y persistencia al recargar. No se conectan a pedidos ni a la cuenta; se indica que se guardan en este dispositivo.
- La selección existente de productos, marcas y Fit Lab permanece debajo de las categorías.

Archivo Black se aloja localmente y se aplica **solo a los grandes titulares del carrusel**. Menú, subtítulos, botones y resto de la Home utilizan una sans-serif distinta. No se afirma usar una fuente oficial de Jordan. Se incluyeron el archivo de fuente y su [licencia SIL OFL original](https://raw.githubusercontent.com/google/fonts/main/ofl/archivoblack/OFL.txt) en `frontend/img/fonts/`.

## Enlaces y catálogo

- Explorar Jordan abre el catálogo con búsqueda Jordan y muestra las dos prendas Jordan que ya existen. Jordan es una marca en estos datos, no una categoría de inventario nueva.
- Explorar camisetas y su tarjeta filtran las seis camisetas existentes.
- Gorras y Sneakers abren sus respectivos filtros y el estado vacío del catálogo: **actualmente no existen productos de esas categorías**. No se crearon referencias comerciales ni se presentó inventario inexistente.
- Ropa permite explorar las prendas existentes. Accesorios muestra su filtro correspondiente, actualmente sin coincidencias.
- Marcas y Colecciones llevan a secciones reales de la Home. Los filtros se limpian al elegir otra colección de campaña para evitar búsquedas contradictorias.

## Alcance de archivos

Nuevos:

- `frontend/src/components/HomeCarousel.jsx`
- `frontend/src/home-black-edition.css`
- `frontend/src/hooks/useFavorites.js`
- `frontend/img/SAUZ_CARRUSEL_3_IMAGENES/` con originales y derivados
- `frontend/img/fonts/ArchivoBlack-Regular.ttf` y `ArchivoBlack-OFL.txt`
- Esta documentación, scripts de QA y capturas

Modificados en esta iteración:

- `frontend/src/pages/Home.jsx`: hero, categorías y ancla de marcas.
- `frontend/src/components/Header.jsx`: navegación, favoritos y menú móvil.
- `frontend/src/components/ProductCard.jsx`: guardar/quitar favorito.
- `frontend/src/pages/Catalog.jsx`: filtros de presentación para las colecciones enlazadas y estados vacíos coherentes.
- `frontend/src/App.jsx`: conexión de los enlaces de campaña con el catálogo y las fichas.
- `frontend/src/main.jsx`: carga de los estilos de esta pantalla.

No se modificaron backend, datos, API, autenticación, lógica del carrito, checkout, pedidos ni pagos. Se comparó el diff del backend contra la copia de la entrega anterior: conserva exactamente el cambio ajeno que ya existía. Las pruebas nuevas no generaron pedidos ni alteraron stock. Se conservó una copia de los archivos intervenidos antes de esta iteración en `/tmp/sauz-home-before/`.

## Verificación

- Build de Vite: correcto; salida en [qa/build.txt](qa/build.txt).
- Pruebas disponibles: `npm --prefix frontend test`, correctas. Además se ejecutaron directamente los cinco casos de integridad de catálogo, con salida en [qa/pruebas-dominio.tap](qa/pruebas-dominio.tap).
- `git diff --check`: correcto.
- Chrome headless mediante DevTools Protocol: **113 comprobaciones**, tres diapositivas en siete resoluciones: 1920×1080, 1440×900, 1366×768, 1024×768, 768×1024, 390×844 y 375×812.
- Las 21 vistas no presentan scroll horizontal ni imágenes rotas. Se verificó la altura del hero y la posición de las tarjetas después del primer viewport.
- Se probaron autoplay real, pausa por interacción, reanudación, flechas, indicadores, teclado, gesto táctil, navegación de campañas y tarjetas, menú móvil, favoritos, persistencia y eliminación, carga local de la fuente y movimiento reducido. Sin excepciones de JavaScript en la ejecución final.

Resultados y medidas en [qa/results.json](qa/results.json). El script reproducible [qa/check.mjs](qa/check.mjs) usa Node 22, Chrome con puerto DevTools 9226 y el servidor local en 3120. Las capturas están en [capturas](capturas/).

No se ejecutaron lint ni TypeScript porque el proyecto no configura esas herramientas. La prueba se hizo sobre el build de producción local; no se publicó ni se probó un pago real. Los procesos auxiliares de QA se cierran al finalizar.
