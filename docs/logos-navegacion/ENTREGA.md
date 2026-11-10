# SAUZ STORE — Ajustes de navegación y botones

## Estado de la entrega

**Implementación parcial: falta insertar los cuatro logos aprobados como imágenes.** Las imágenes se ven en el chat, pero no están disponibles como archivos en los adjuntos locales, el proyecto o Descargas. No se recrearon mediante IA, SVG, CSS ni símbolos aproximados.

Recursos pendientes:

1. SAUZ STORE blanco aprobado, sin círculo dorado.
2. Jordan individual.
3. Nike individual.
4. Adidas individual.

Para terminar se requieren los cuatro PNG/SVG originales como archivos adjuntos o en un ZIP, o una carpeta local donde estén guardados. En el proyecto solo se encontraron el emblema SAUZ dorado y una versión circular blanca distinta de la referencia; no se presentan como el nuevo logo aprobado.

La vista provisional usa nombres tipográficos. **Las capturas no representan la integración final de los logos.** No se afirma haber comprobado sus rutas, nitidez o encuadre: esos controles dependen de recibir los archivos.

## Cambios realizados

- Header `#050505`, 82 px en escritorio y 72 px en móvil. Menú centrado y legible a 14 px, iconos de 21 px y distribución responsive.
- Se retiró el emblema dorado del header. Se mantiene una identificación tipográfica temporal SAUZ STORE, pendiente de reemplazar por el recurso aprobado.
- Línea roja `#FF1724` de 3 px, animada con `scaleX` en 220 ms, sin mover el menú. Estados hover, foco visible y sección activa. El menú móvil comparte el estado activo.
- Botones del carrusel de altura 52 px, bordes de 6 px, padding de 26–28 px, ancho ajustado al contenido, texto semibold y flecha que avanza 4 px al hover/foco. Se respeta movimiento reducido.
- `BrandStrip` prepara la distribución Jordan | Nike | Adidas debajo del CTA, con separadores, separación de 22–24 px y dimensiones proporcionales. Hasta recibir los archivos muestra nombres, sin imitaciones gráficas ni recoloreado de Jordan.
- `approvedBrandAssets` contiene únicamente el registro vacío de recursos pendientes. No se crearon rutas a archivos inexistentes ni peticiones de imágenes falsas. Al disponer de los originales se registrarán sus rutas reales y dimensiones.

## Archivos de esta iteración

- `frontend/src/components/Header.jsx`
- `frontend/src/components/BrandLogo.jsx`
- `frontend/src/components/HomeCarousel.jsx`
- `frontend/src/home-black-edition.css`
- `frontend/src/assets/brandAssets.js` (nuevo)
- `frontend/src/App.jsx` (prop de categoría actual para el estado de navegación)

El catálogo conserva su presentación y datos: los usos anteriores de `BrandLogo` mantienen su comportamiento por defecto. No se modificaron backend, API, inventario, autenticación, lógica del carrito, checkout ni pagos. Las fotos originales del carrusel conservan sus hashes, el orden y los títulos. La sección de categorías sigue después del primer viewport. Copia previa de los archivos intervenidos en `/tmp/sauz-logos-before/`.

## Verificación ejecutada

- `npm --prefix frontend run build`: correcto.
- `npm --prefix frontend test`: correcto. También se ejecutaron directamente los cinco casos de `frontend/tests/products.test.js`, con salida en `qa/pruebas-dominio.tap`.
- `git diff --check`: correcto.
- 113 comprobaciones del carrusel, sus imágenes, enlaces, navegación, favoritos y movimiento reducido, con 21 vistas: tres slides en 1920×1080, 1440×900, 1366×768, 1024×768, 768×1024, 390×844 y 375×812.
- 23 comprobaciones específicas adicionales: fondo y altura del header, legibilidad del menú, eliminación del emblema dorado en el header, color/grosor/duración de la línea, hover y salida, sección activa, foco, tamaño y radio del botón, desplazamiento de la flecha, navegación activa de Sneakers y ausencia de solapamiento entre la franja de marcas y los controles.
- Sin excepciones de JavaScript en las ejecuciones finales. Las imágenes del carrusel cargan y las categorías permanecen después del primer viewport.

Resultados completos en `qa/results.json` y `qa/styles.json`. Capturas de la implementación provisional en `capturas/`. Las pruebas usaron el build local en el puerto 3130 y Chrome aislado en 9227. No se publicó ni se enviaron pedidos. Los procesos auxiliares se cerraron al terminar.
