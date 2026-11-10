# SAUZ STORE — Identidad y navegación premium

Entrega local del 10 de noviembre de 2026. Los cuatro logos están integrados y ya no dependen de nombres provisionales en el header o bajo el CTA.

## Recursos identificados e integrados

| Marca | Original localizado en `frontend/img/logos/` | Copia utilizada por la web |
| --- | --- | --- |
| SAUZ STORE | `23eaa4ed-6401-44b2-a8cd-5efd9833cde3.png` | `/logos/web/sauz-store.png` |
| Jordan | `jordan.png` | `/logos/web/jordan.png` |
| Nike | `nike.png` | `/logos/web/nike.png` |
| Adidas | `Archivo adjunto del usuario.png` | `/logos/web/adidas.png` |

Se inspeccionaron dimensiones, canal alfa, fondos, encuadre y proporciones. SAUZ es la versión blanca y roja con corona y «STORE» debajo; no el emblema circular dorado. No se encontró un SVG original de estos recursos en el proyecto.

Los archivos originales permanecen idénticos. Se crearon PNG derivados que eliminan márgenes exteriores excesivos, conservando los símbolos completos, sus colores y proporciones. No se repintaron ni reconstruyeron logos. Las regiones conservadas coinciden píxel a píxel con el original. Hashes, dimensiones y encuadres quedan en [qa/recursos.json](qa/recursos.json).

La transparencia conserva también los detalles y pequeños halos presentes en los PNG aportados. No se dispone de una versión vectorial autorizada de mayor calidad para sustituirlos. Se utilizan los recursos suministrados por el usuario; no se certifica que sean archivos oficiales de las marcas.

## Implementación visual

- Nuevo SAUZ STORE a la izquierda del header, con marco de 154×76 px en escritorio y 110×64 px en móvil, mediante `object-fit: contain`. Colores originales sin filtros. También se actualizan su uso compartido en el footer y el favicon para retirar el emblema anterior.
- Franja independiente Jordan | Nike | Adidas bajo los tres CTA, con tamaños ópticos diferenciados y separadores verticales. Jordan permanece blanco porque no existe una variante roja aprobada entre los recursos encontrados.
- Tipografía UI centralizada en variables: Helvetica Neue/Arial/Helvetica/sans-serif. No se añaden fuentes propietarias ni dependencias.
- Menú de 16 px y peso 600, sin mayúsculas forzadas ni espaciado artificial. Títulos de sección con peso 750, nombres de productos con 600, precios con 650 y botones con 600. Se modifican solo estilos tipográficos; los componentes, productos y datos del catálogo se conservan.
- Los titulares de campaña conservan Archivo Black y sus textos, tamaño y composición: «DOMINA. LA CALLE.», «VISTE. DIFERENTE.» y «MARCA. TU ESTILO.».
- Header negro, 82 px en escritorio y 72 px en móvil. Iconos de la biblioteca Lucide ya instalada, grosor consistente y contador del carrito rojo `#FF1724` con texto blanco.
- Línea roja de 3 px y 220 ms para hover, foco y sección activa. Se mantiene el tratamiento vertical del menú móvil.
- Botones blancos ajustados al contenido, 52 px de altura, radio 6 px y flecha que avanza 4 px, con estados accesibles y movimiento reducido.

## Navegación según la URL

El estado activo ahora se deriva de la ubicación real: pathname, parámetros y fragmentos. Las colecciones se reflejan como `/catalogo?coleccion=Sneakers`, `/catalogo?coleccion=Ropa`, etc. La búsqueda utiliza `q`. Los estados de catálogo se recuperan al recargar o navegar atrás/adelante, sin tocar la API.

Marcas y Colecciones actualizan las anclas `/#marcas` y `/#coleccion`; su indicador activo se conserva al recargar. El logo vuelve a `/`. Se mantienen las rutas públicas existentes y sus alias. Los parámetros describen filtros de presentación, no nuevas categorías comerciales ni registros de inventario.

## Archivos de esta iteración

- `frontend/src/assets/brandAssets.js`: registro de los cuatro archivos reales.
- `frontend/src/components/BrandLogo.jsx`: recursos aprobados del header y franja; nuevo SAUZ compartido.
- `frontend/src/components/Header.jsx`: estado activo según URL y contador rojo.
- `frontend/src/App.jsx`: persistencia de filtros en la URL y restauración al navegar.
- `frontend/src/brand-navigation.css`: tokens tipográficos y ajustes de integración, nuevo.
- `frontend/src/main.jsx`: carga de los estilos nuevos.
- `frontend/index.html`: favicon del nuevo SAUZ.
- `frontend/img/logos/web/`: derivados de los cuatro recursos, nuevos.

No se modifican backend, datos, API, autenticación, reglas comerciales, lógica del carrito, checkout ni pagos. No se alteran imágenes, orden o textos del carrusel, ni el orden de categorías después del scroll. Se conservó copia previa de los archivos intervenidos en `/tmp/sauz-type-before/`.

## Verificación ejecutada

- `npm --prefix frontend run build`: correcto, sin advertencias. Salida registrada en [qa/compilacion.json](qa/compilacion.json).
- `npm --prefix frontend test`: correcto. Ejecución directa adicional de `node frontend/tests/products.test.js`: cinco casos aprobados.
- `git diff --check`: correcto.
- 113 comprobaciones del carrusel y navegación: tres diapositivas en 1920×1080, 1440×900, 1366×768, 1024×768, 768×1024, 390×844 y 375×812. Sin scroll horizontal ni imágenes rotas; categorías después del primer viewport. Se comprueban autoplay, pausa, reanudación, flechas, indicadores, teclado, gesto táctil, filtros de campaña, favoritos y movimiento reducido.
- 23 comprobaciones específicas de estilos: header, tamaño del menú, línea roja, duración, hover/salida, foco, botones, desplazamiento de flechas y ausencia de solapamientos entre franja y controles.
- 40 comprobaciones de identidad/rutas: las cuatro URLs PNG responden HTTP 200 y MIME `image/png`; los cuatro logos cargan con `contain` y sin filtros en las seis resoluciones solicitadas. Contador rojo/blanco, tipografía diferenciada, logo e iconos sin superposición, recarga y Atrás/Adelante conservando filtros/estado activo, anclas de Marcas/Colecciones y retorno al inicio desde el logo.

**176 comprobaciones de navegador y cinco pruebas de integridad aprobadas.** Sin excepciones JavaScript en las ejecuciones finales. Resultados detallados en [qa/results.json](qa/results.json), [qa/styles.json](qa/styles.json) y [qa/identity.json](qa/identity.json).

Los originales de los cuatro logos y las tres fotografías se verificaron mediante hashes. Los derivados no recolorean ni deforman las regiones originales. Las capturas están en [capturas](capturas/).

Las pruebas se hicieron sobre el build de producción local, puerto 3140, con Chrome aislado en el puerto DevTools 9228. No se publicó en producción ni se generaron pedidos. No se ejecutan lint o TypeScript porque el proyecto no los configura. Los procesos auxiliares se cerraron al terminar.
