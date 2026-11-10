# Campaña New Era — tercer slide

Imagen utilizada: `frontend/img/SAUZ_CARRUSEL_3_IMAGENES/3760a51c-daef-4779-9c25-ff6bdd8627cc.png`, 1672×941. Comprobada visualmente: Dodgers negra, Athletics verde, Raiders negra, Yankees negra y Bulls roja sobre plataformas de estudio gris claro. Original conservado; versiones WebP derivadas de 960 y 1672 px para el navegador. Vite sirve esta carpeta mediante su `publicDir: 'img'`, con URL `/SAUZ_CARRUSEL_3_IMAGENES/…`.

Modificados únicamente los archivos fuente `frontend/src/components/HomeCarousel.jsx` y `frontend/src/shopping-experience.css`. Nuevo texto: «03 / NEW ERA COLLECTION», «LA CALLE. / TIENE ESTILO.», «Gorras icónicas. Actitud sin límites.» y el CTA existente «Explorar gorras».

Composición exclusiva del tercer slide: fotografía completa sin deformación ni recorte, fondo gris de estudio y degradado oscuro a la izquierda; en móvil/tablet vertical la fotografía se coloca sobre el texto. La imagen ocupa la zona visual del hero con `contain` para preservar las cinco gorras. No hay logo New Era independiente en la carpeta de logos; se conserva el de la fotografía y no se fabrica ninguno. Los logos Jordan/Nike/Adidas de los dos primeros slides permanecen intactos. La tarjeta de categoría fuera del carrusel conserva su fotografía anterior.

Validación: compilación Vite correcta, cinco pruebas de catálogo correctas y 28 comprobaciones de navegador sin excepciones JavaScript. Cuatro resoluciones: 1920×1080, 1366×768, 768×1024 y 390×844. Se verificaron carga de la fotografía, título, ausencia de desbordamiento horizontal, ciclo automático 1→2→3→1 cada cinco segundos, pausa/reanudación, pausa por hover, flechas, indicadores, teclado y CTA real `/catalogo?coleccion=Gorras`. Capturas y resultados acompañan este documento.

La lógica del carrusel y su intervalo de 5000 ms se mantienen. Navbar, SAUZ, carrito y lógica comercial no se modificaron. La diferencia previa del backend permanece exactamente igual. Las comprobaciones se realizaron sobre una vista previa de frontend sin operaciones comerciales.
