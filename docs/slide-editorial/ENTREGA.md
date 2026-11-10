# Segundo slide editorial

Imagen comprobada visualmente: `frontend/img/SAUZ_CARRUSEL_3_IMAGENES/Moda urbana sobre fondo turquesa.png` (1672×941). Conservada sin alterar. Se crearon versiones WebP de 960 y 1672 px para carga responsive; el PNG original queda como alternativa. Vite utiliza `publicDir: 'img'`, por lo que las URL parten de `/SAUZ_CARRUSEL_3_IMAGENES/`, sin rutas locales de Linux.

Archivos fuente modificados: `frontend/src/components/HomeCarousel.jsx` y `frontend/src/shopping-experience.css`. La fotografía editorial se aplica únicamente al segundo slide; la tarjeta de categoría conserva su recurso anterior. Se mantienen título, subtítulo, CTA y logos independientes. El degradado solo afecta a este slide y conserva su tono azul verdoso. En escritorio ocupa todo el hero con encuadre superior; en móvil muestra completa la fotografía en la zona superior para conservar los tres modelos sin superponerles texto.

El intervalo existente cambió de 6000 a 5000 ms. Se conserva la implementación de pausa, flechas, indicadores, teclado y reproducción manual.

Verificación: compilación Vite correcta; cinco pruebas de catálogo correctas; 29 comprobaciones de navegador (incluido ciclo automático completo, pausa, reanudación, flechas, indicadores y teclado) y 19 comprobaciones visuales finales. Imagen cargada y sin desbordamiento horizontal en 1920×1080, 1440×900, 1366×768, 768×1024, 390×844 y 375×812. Sin excepciones JavaScript. Capturas y resultados junto a este documento. La vista previa se verificó sin conectar el backend ni efectuar operaciones comerciales. La diferencia previa del backend permanece idéntica.
