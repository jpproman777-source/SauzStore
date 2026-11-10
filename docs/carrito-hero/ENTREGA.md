# SAUZ STORE — Carrito y hero

Implementación local del 10 de noviembre de 2026. Sin publicación.

## Resultado

- Nueva página `/carrito` (también `/bolsa`), con productos y resumen en dos columnas en escritorio; resumen debajo en móvil. Incluye estados vacío, carga y error con reintento.
- Cantidad editable con botones y teclado, eliminación, vaciado y favoritos existentes. La respuesta de la API mantiene el carrito y el contador sincronizados.
- Confirmación superior derecha únicamente después de agregar correctamente. Incluye imagen, marca, cantidad y precio reales, cierre con botón/Escape y enlaces a bolsa y checkout. No bloquea la página ni roba el foco; al cerrar desde el panel devuelve el foco al control de origen.
- Protección contra solicitudes simultáneas de agregado del mismo producto. La confirmación es una instantánea de presentación; no mantiene otro carrito.
- Hero con fotografía Jordan más protagonista, tres slides conservados, CTA de 52 px, flecha animada 4 px, controles circulares de 50 px (46 px en móvil), barras y contador sincronizados. En tablet vertical se separan fotografía y texto para evitar solapamientos.
- Logo aprobado reducido aproximadamente 15 % en escritorio y 13–14 % en móvil. Se conserva el menú, su tipografía, los indicadores rojos y los logos de marcas.

## Datos y límites reales

Subtotal, impuestos y total proceden de la API existente. No se alteraron tasas ni reglas comerciales. El backend no calcula envío ni ofrece cupones: no se inventan importes; el envío aparece «Por confirmar», con aclaración de que no está incluido. Talla y color solo se muestran si existen datos reales; el carrito actual no conserva una selección de talla.

Los botones de compra abren el checkout existente. No se enviaron compras ni se crearon pedidos durante la comprobación. La persistencia del carrito sigue siendo la del servidor actual; no se añadió almacenamiento comercial alternativo.

## Archivos

Nuevos: `frontend/src/pages/Cart.jsx`, `frontend/src/components/CartConfirmation.jsx` y `frontend/src/shopping-experience.css`.

Integración: `App.jsx`, `Header.jsx`, `CartContext.jsx` y `main.jsx`. El antiguo componente CartDrawer queda sin uso. El componente del carrusel conserva sus textos, fotografías y comportamiento; esta actualización ajusta su presentación mediante CSS.

## Verificación ejecutada

- Compilación Vite correcta y cinco pruebas disponibles de catálogo correctas.
- 77 comprobaciones de integración más 70 comprobaciones de revisión final: sin excepciones JavaScript.
- Resoluciones: 1920×1080, 1440×900, 1366×768, 1024×768, 768×1024, 390×844 y 375×812. Sin desbordamiento horizontal en los escenarios comprobados.
- Agregado real, doble clic con red ralentizada, contador, cantidades, totales, error por stock, eliminación, favoritos, recarga, vaciado con confirmación y recuperación de error de carga.
- Confirmación correcta tras éxito, ausencia ante error, Escape/foco, ambos accesos al checkout sin enviar pedidos.
- Tres slides, indicadores, flechas, teclado, gesto táctil, reproducción automática y movimiento reducido. Revisión visual de bolsa, resumen móvil, confirmación y hero.
- La diferencia del backend coincide exactamente con la copia previa a esta actualización: se preservaron los cambios del usuario. Los hashes de fotografías y logos originales coinciden con los registros anteriores.

Resultados y scripts CDP en `qa/`; capturas en `capturas/`. Los scripts requieren Node con WebSocket, Chrome aislado con depuración en 9229 y un servidor de prueba en 3150. Usan operaciones reales sobre el carrito del proceso de prueba y deben ejecutarse solamente en un entorno local aislado con carrito vacío. No envían pedidos.

Capturas principales: [bolsa de escritorio](capturas/bolsa-final-1440.png), [bolsa móvil](capturas/bolsa-final-390.png), [resumen móvil](capturas/resumen-390.png), [confirmación](capturas/confirmacion-1440.png), [hero escritorio](capturas/hero-final-1-1366.png), [hero tablet](capturas/hero-final-1-768.png).
