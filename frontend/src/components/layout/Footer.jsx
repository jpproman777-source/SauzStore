import React, { useState, useEffect } from "react";
import { approvedBrandAssets } from "../../assets/brandAssets";
import { useAuth } from "../../context/AuthContext";

export const Footer = ({
  setActivePage,
  onCategorySelect,
  onCollectionSelect,
}) => {
  const { user, setIsProfileOpen } = useAuth();
  const [modalTab, setModalTab] = useState(null); // 'help' | 'shipping' | 'returns' | 'faq' | 'tracking' | 'terms' | 'privacy' | 'data' | 'social'
  const [socialPlatform, setSocialPlatform] = useState("");

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modalTab) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e) => {
        if (e.key === "Escape") setModalTab(null);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [modalTab]);

  const handleNav = (page) => {
    if (setActivePage) setActivePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategory = (cat) => {
    if (onCategorySelect) {
      onCategorySelect(cat);
    }
    if (setActivePage) setActivePage("catalog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBrandClick = (brandName) => {
    if (onCollectionSelect) {
      onCollectionSelect(brandName === "JORDAN" ? "Jordan" : brandName);
    } else if (onCategorySelect) {
      onCategorySelect("Todas");
    }
    if (setActivePage) setActivePage("catalog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMarcasScroll = () => {
    const el = document.getElementById("marcas");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      handleNav("home");
      setTimeout(() => {
        const target = document.getElementById("marcas");
        if (target) target.scrollIntoView({ behavior: "smooth" });
      }, 120);
    }
  };

  const handleOrderTracking = () => {
    if (user && setIsProfileOpen) {
      setIsProfileOpen(true);
    } else {
      setModalTab("tracking");
    }
  };

  const openSocial = (platform) => {
    setSocialPlatform(platform);
    setModalTab("social");
  };

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="wrap site-footer-inner">
        {/* ============================================================== */}
        {/* PARTE 2: IDENTIDAD SAUZ STORE + LOGOS MONOCROMÁTICOS DE MARCAS */}
        {/* ============================================================== */}
        <div className="footer-top-identity">
          {/* Logo oficial SAUZ STORE centrado */}
          <div className="footer-sauz-brand-wrap">
            <button
              type="button"
              className="footer-sauz-btn"
              onClick={() => handleNav("home")}
              aria-label="Ir al inicio de SAUZ STORE"
            >
              <img
                src={approvedBrandAssets.SAUZ.src}
                alt="SAUZ STORE"
                className="footer-sauz-logo"
                width={approvedBrandAssets.SAUZ.width}
                height={approvedBrandAssets.SAUZ.height}
              />
            </button>
          </div>

          {/* Marcas comercializadas: Nike, Jordan, Adidas */}
          <div className="footer-brands-block">
            <p className="footer-brands-disclaimer">Explora nuestras marcas</p>
            <div
              className="footer-brands-list"
              role="group"
              aria-label="Marcas comercializadas por SAUZ STORE"
            >
              <button
                type="button"
                className="footer-brand-btn footer-brand-nike"
                onClick={() => handleBrandClick("NIKE")}
                title="Explorar selección Nike"
                aria-label="Ver productos Nike"
              >
                <img
                  src={approvedBrandAssets.NIKE.src}
                  alt="Nike"
                  className="footer-brand-img"
                  width={approvedBrandAssets.NIKE.width}
                  height={approvedBrandAssets.NIKE.height}
                />
              </button>

              <button
                type="button"
                className="footer-brand-btn footer-brand-jordan"
                onClick={() => handleBrandClick("JORDAN")}
                title="Explorar selección Jordan"
                aria-label="Ver productos Jordan"
              >
                <img
                  src={approvedBrandAssets.JORDAN.src}
                  alt="Jordan"
                  className="footer-brand-img"
                  width={approvedBrandAssets.JORDAN.width}
                  height={approvedBrandAssets.JORDAN.height}
                />
              </button>

              <button
                type="button"
                className="footer-brand-btn footer-brand-adidas"
                onClick={() => handleBrandClick("ADIDAS")}
                title="Explorar selección Adidas"
                aria-label="Ver productos Adidas"
              >
                <img
                  src={approvedBrandAssets.ADIDAS.src}
                  alt="Adidas"
                  className="footer-brand-img"
                  width={approvedBrandAssets.ADIDAS.width}
                  height={approvedBrandAssets.ADIDAS.height}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Separador fino gris carbón */}
        <hr className="footer-divider" aria-hidden="true" />

        {/* ============================================================== */}
        {/* PARTE 3: CUATRO COLUMNAS INFORMATIVAS                          */}
        {/* ============================================================== */}
        <div className="footer-nav-grid">
          {/* COLUMNA 1 — EXPLORAR */}
          <nav className="footer-nav-col" aria-label="Explorar productos">
            <h4 className="footer-nav-heading">Explorar</h4>
            <ul className="footer-nav-list">
              <li className="footer-nav-item">
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => handleCategory("Todas")}
                >
                  Toda la colección
                </button>
              </li>
              <li className="footer-nav-item">
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => handleCategory("Sudaderas")}
                >
                  Nuestra ropa
                </button>
              </li>
              <li className="footer-nav-item">
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => handleCategory("Zapatillas")}
                >
                  Sneakers
                </button>
              </li>
              <li className="footer-nav-item">
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => handleCategory("Gorras")}
                >
                  Gorras
                </button>
              </li>
              <li className="footer-nav-item">
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => handleNav("catalog")}
                >
                  Nuevos productos
                </button>
              </li>
              <li className="footer-nav-item">
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => handleNav("brands")}
                >
                  Marcas
                </button>
              </li>
            </ul>
          </nav>

          {/* COLUMNA 2 — AYUDA */}
          <nav className="footer-nav-col" aria-label="Ayuda y atención">
            <h4 className="footer-nav-heading">Ayuda</h4>
            <ul className="footer-nav-list">
              <li className="footer-nav-item">
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => setModalTab("help")}
                >
                  Centro de ayuda
                </button>
              </li>
              <li className="footer-nav-item">
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => setModalTab("shipping")}
                >
                  Envíos y entregas
                </button>
              </li>
              <li className="footer-nav-item">
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => setModalTab("returns")}
                >
                  Cambios y devoluciones
                </button>
              </li>
              <li className="footer-nav-item">
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={handleOrderTracking}
                >
                  Seguimiento de pedidos
                </button>
              </li>
              <li className="footer-nav-item">
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => setModalTab("faq")}
                >
                  Preguntas frecuentes
                </button>
              </li>
              <li className="footer-nav-item">
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => handleNav("location")}
                >
                  Contacto
                </button>
              </li>
            </ul>
          </nav>

          {/* COLUMNA 3 — SAUZ STORE */}
          <nav className="footer-nav-col" aria-label="Información corporativa">
            <h4 className="footer-nav-heading">Sauz Store</h4>
            <ul className="footer-nav-list">
              <li className="footer-nav-item">
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => handleNav("about")}
                >
                  Sobre nosotros
                </button>
              </li>
              <li className="footer-nav-item">
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => setModalTab("terms")}
                >
                  Términos y condiciones
                </button>
              </li>
              <li className="footer-nav-item">
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => setModalTab("privacy")}
                >
                  Política de privacidad
                </button>
              </li>
              <li className="footer-nav-item">
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => setModalTab("data")}
                >
                  Tratamiento de datos
                </button>
              </li>
            </ul>
          </nav>

          {/* COLUMNA 4 — CONECTA CON NOSOTROS */}
          <nav className="footer-nav-col" aria-label="Canales de contacto y redes">
            <h4 className="footer-nav-heading">Conecta con nosotros</h4>
            <ul className="footer-nav-list">
              <li className="footer-nav-item">
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => openSocial("Instagram")}
                >
                  <span>Instagram</span>
                  <span className="footer-status-pill">Próximamente</span>
                </button>
              </li>
              <li className="footer-nav-item">
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => openSocial("TikTok")}
                >
                  <span>TikTok</span>
                  <span className="footer-status-pill">Próximamente</span>
                </button>
              </li>
              <li className="footer-nav-item">
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => openSocial("Facebook")}
                >
                  <span>Facebook</span>
                  <span className="footer-status-pill">Próximamente</span>
                </button>
              </li>
              <li className="footer-nav-item">
                <a
                  className="footer-nav-link footer-nav-whatsapp"
                  href="https://wa.me/573129876543?text=Hola%20Sauz%20Store%2C%20quiero%20conocer%20su%20cat%C3%A1logo%20y%20hacer%20un%20pedido."
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Contactar por WhatsApp oficial (+57 312 987 6543)"
                >
                  <span>WhatsApp Directo</span>
                  <span className="footer-verified-badge">Oficial ↗</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* ============================================================== */}
        {/* PARTE 4: FRANJA INFERIOR LEGAL DINÁMICA                        */}
        {/* ============================================================== */}
        <div className="footer-bottom-bar">
          <div className="footer-bottom-content">
            <div className="footer-bottom-left">
              <div className="footer-country">
                <span className="footer-country-dot" aria-hidden="true" />
                <span>Colombia</span>
              </div>
              <span className="footer-copy">
                © {new Date().getFullYear()} SAUZ STORE. Todos los derechos reservados.
              </span>
            </div>

            <div className="footer-bottom-right">
              <button
                type="button"
                className="footer-legal-btn"
                onClick={() => setModalTab("privacy")}
              >
                Política de privacidad
              </button>
              <button
                type="button"
                className="footer-legal-btn"
                onClick={() => setModalTab("terms")}
              >
                Términos y condiciones
              </button>
              <button
                type="button"
                className="footer-legal-btn"
                onClick={() => setModalTab("data")}
              >
                Tratamiento de datos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL INFORMATIVO Y LEGAL ACCESIBLE                            */}
      {/* ============================================================== */}
      {modalTab && (
        <div
          className="modal-backdrop open footer-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setModalTab(null)}
        >
          <div
            className="footer-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="footer-modal-header">
              <div className="footer-modal-tags">
                <span className="footer-modal-tag">SAUZ BLACK EDITION</span>
                <span className="footer-modal-category">
                  {modalTab === "shipping" && "LOGÍSTICA & ENTREGAS"}
                  {modalTab === "returns" && "CAMBIOS & GARANTÍAS"}
                  {modalTab === "tracking" && "SEGUIMIENTO DE ÓRDENES"}
                  {modalTab === "faq" && "PREGUNTAS FRECUENTES"}
                  {modalTab === "help" && "CENTRO DE AYUDA"}
                  {modalTab === "terms" && "TÉRMINOS Y CONDICIONES"}
                  {modalTab === "privacy" && "POLÍTICA DE PRIVACIDAD"}
                  {modalTab === "data" && "TRATAMIENTO DE DATOS (LEY 1581)"}
                  {modalTab === "social" && `CANAL OFICIAL — ${socialPlatform}`}
                </span>
              </div>
              <button
                type="button"
                className="footer-modal-close"
                onClick={() => setModalTab(null)}
                aria-label="Cerrar modal informativo"
              >
                ✕
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="footer-modal-body">
              {modalTab === "shipping" && (
                <div>
                  <h3>Envíos y entregas nacionales</h3>
                  <p>
                    Despachamos todas las órdenes directamente desde nuestro centro de distribución en Medellín hacia cualquier destino de Colombia.
                  </p>
                  <ul>
                    <li><strong>Ciudades principales:</strong> 2 a 4 días hábiles (Bogotá, Medellín, Cali, Barranquilla, Bucaramanga, Pereira, Manizales).</li>
                    <li><strong>Municipios y trayectos especiales:</strong> 3 a 6 días hábiles.</li>
                    <li><strong>Empaque seguro:</strong> Cada prenda y par de sneakers se empaca en sellado hermético protector de tela o caja original para preservar el acabado premium.</li>
                  </ul>
                  <p>
                    Una vez confirmada la compra, recibirás la guía de transporte con número de seguimiento vía WhatsApp o correo electrónico.
                  </p>
                </div>
              )}

              {modalTab === "returns" && (
                <div>
                  <h3>Política de cambios y devoluciones</h3>
                  <p>
                    Queremos que tus prendas te queden perfectas. Si necesitas cambio de talla o color:
                  </p>
                  <ul>
                    <li><strong>Plazo:</strong> Tienes hasta <strong>30 días calendario</strong> tras la entrega del pedido para solicitar el cambio.</li>
                    <li><strong>Condiciones:</strong> Las prendas deben estar sin uso, sin lavar y conservar todas sus etiquetas y empaques originales.</li>
                    <li><strong>Trámite ágil:</strong> Solo debes escribir a nuestra línea oficial de WhatsApp con tu número de pedido y coordinamos la recogida y despacho de la nueva talla.</li>
                  </ul>
                </div>
              )}

              {modalTab === "tracking" && (
                <div>
                  <h3>Seguimiento de pedidos</h3>
                  <p>
                    Puedes consultar el estado en tiempo real de tu pedido a través de los siguientes métodos:
                  </p>
                  <ol>
                    <li><strong>Clientes registrados:</strong> Inicia sesión en la tienda y accede a <em>Mi perfil y pedidos</em> desde el menú superior para ver tu historial de compras y guía de envío.</li>
                    <li><strong>Atención directa:</strong> Escríbenos a nuestro WhatsApp <strong>+57 312 987 6543</strong> con el correo con el que realizaste la compra y nuestro equipo te informará el estado exacto del paquete.</li>
                  </ol>
                  <a
                    className="footer-modal-action-btn"
                    href="https://wa.me/573129876543?text=Hola%20Sauz%20Store%2C%20quiero%20rastrear%20mi%20pedido."
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Consultar estado por WhatsApp ↗
                  </a>
                </div>
              )}

              {modalTab === "faq" && (
                <div>
                  <h3>Preguntas frecuentes</h3>
                  <div className="footer-faq-item">
                    <h4>¿Las prendas y zapatillas son originales?</h4>
                    <p>
                      Comercializamos piezas de marcas internacionales reconocidas (Nike, Jordan, Adidas) y nuestra línea de diseño propia SAUZ, manufacturada en Colombia con algodón peinado de alto gramaje (240 a 300 GSM) y denim rígido de 13 oz.
                    </p>
                  </div>
                  <div className="footer-faq-item">
                    <h4>¿Cuáles son los métodos de pago disponibles?</h4>
                    <p>
                      Aceptamos transferencias bancarias, tarjetas de débito/crédito, pagos por PSE y confirmación directa mediante asesor comercial.
                    </p>
                  </div>
                  <div className="footer-faq-item">
                    <h4>¿Tienen tienda física donde pueda probarme las prendas?</h4>
                    <p>
                      Sí. Nuestra tienda física Flagship está ubicada en <strong>Calle 10 # 40-20, Local 101, El Poblado, Medellín</strong>. Puedes consultar los horarios en la sección Ubicación.
                    </p>
                  </div>
                </div>
              )}

              {modalTab === "help" && (
                <div>
                  <h3>Centro de ayuda SAUZ STORE</h3>
                  <p>
                    Estamos a tu disposición para asesorarte con tallas, materiales, siluetas o inquietudes con tus compras.
                  </p>
                  <div className="footer-help-grid">
                    <button
                      type="button"
                      className="footer-help-card"
                      onClick={() => setModalTab("shipping")}
                    >
                      <strong>🚚 Envíos y entregas</strong>
                      <span>Tiempos de entrega y cobertura nacional</span>
                    </button>
                    <button
                      type="button"
                      className="footer-help-card"
                      onClick={() => setModalTab("returns")}
                    >
                      <strong>🔄 Cambios de talla</strong>
                      <span>30 días para cambios sin complicaciones</span>
                    </button>
                    <button
                      type="button"
                      className="footer-help-card"
                      onClick={() => {
                        setModalTab(null);
                        handleNav("location");
                      }}
                    >
                      <strong>📍 Tienda física y horarios</strong>
                      <span>Visítanos en El Poblado, Medellín</span>
                    </button>
                  </div>
                </div>
              )}

              {modalTab === "terms" && (
                <div>
                  <h3>Términos y condiciones de compra</h3>
                  <p>
                    El acceso y uso de SAUZ STORE BLACK EDITION se rige por las leyes de la República de Colombia y las siguientes pautas comerciales:
                  </p>
                  <ul>
                    <li><strong>Precios e inventario:</strong> Todos los precios están expresados en pesos colombianos (COP). Los precios y disponibilidad exhibidos en el catálogo corresponden a existencias reales en bodega.</li>
                    <li><strong>Proceso de compra:</strong> Las solicitudes de pedido quedan confirmadas una vez verificado el inventario y pago respectivo.</li>
                    <li><strong>Garantía legal:</strong> Conforme al Estatuto del Consumidor (Ley 1480 de 2011), todos nuestros productos cuentan con garantía legal por defectos de fabricación.</li>
                  </ul>
                </div>
              )}

              {modalTab === "privacy" && (
                <div>
                  <h3>Política de privacidad</h3>
                  <p>
                    En SAUZ STORE protegemos la confidencialidad de tus datos personales. La información solicitada durante el registro, compra o despacho (nombre, dirección, teléfono, correo) se utiliza exclusivamente para:
                  </p>
                  <ul>
                    <li>Gestionar y entregar tus pedidos de manera precisa.</li>
                    <li>Emitir facturación electrónica conforme a la normativa colombiana.</li>
                    <li>Brindarte soporte postventa y seguimiento de tus paquetes.</li>
                  </ul>
                  <p>
                    No comercializamos, cedemos ni compartimos tu información personal con terceros ajenos a la operación logística de tu pedido.
                  </p>
                </div>
              )}

              {modalTab === "data" && (
                <div>
                  <h3>Tratamiento de datos personales</h3>
                  <p>
                    En cumplimiento de la Ley Estatutaria 1581 de 2012 y el Decreto Reglamentario 1377 de 2013 de Colombia:
                  </p>
                  <p>
                    SAUZ STORE actúa como responsable del tratamiento de los datos personales suministrados por sus clientes. Como titular, tienes derecho a conocer, actualizar, rectificar y solicitar la supresión de tus datos de nuestras bases en cualquier momento mediante solicitud a <strong>hola@sauzstore.com</strong> o a través de nuestra línea de atención en WhatsApp.
                  </p>
                </div>
              )}

              {modalTab === "social" && (
                <div>
                  <h3>Canal oficial en preparación</h3>
                  <p>
                    Nuestra cuenta oficial de <strong>{socialPlatform} (@sauzstore)</strong> se encuentra en fase de verificación y curaduría de contenido para el próximo lanzamiento de colección.
                  </p>
                  <p>
                    Para no perderte los lanzamientos o para compras inmediatas con atención personalizada, contáctanos directamente a través de nuestra línea oficial de WhatsApp o visita nuestra tienda física.
                  </p>
                  <a
                    className="footer-modal-action-btn"
                    href="https://wa.me/573129876543?text=Hola%20Sauz%20Store%2C%20quiero%20conocer%20los%20nuevos%20lanzamientos."
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Hablar con un asesor por WhatsApp ↗
                  </a>
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="footer-modal-footer">
              <button
                type="button"
                className="footer-modal-done"
                onClick={() => setModalTab(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
