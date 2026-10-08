import React from 'react';

export const Location = () => {
  return (
    <main>
      {/* Encabezado */}
      <section className="page-head" aria-label="Ubicación y tiendas">
        <div className="wrap">
          <h1>Ubicación</h1>
          <p className="lead">
            Visítanos en nuestra tienda física, prueba la caída de las telas y conoce las prendas en persona.
          </p>
        </div>
      </section>

      {/* Grid de Información y Mapa */}
      <section className="section">
        <div className="wrap location-grid">
          <div className="info-list">
            <div className="info-block">
              <h3>Dirección Flagship</h3>
              <p>Calle 10 # 40-20, Local 101</p>
              <p>El Poblado · Medellín, Colombia</p>
            </div>

            <div className="info-block">
              <h3>Horarios de atención</h3>
              <ul className="hours-list">
                <li>
                  <span>Lunes a viernes</span>
                  <span>10:00 a. m. – 7:00 p. m.</span>
                </li>
                <li>
                  <span>Sábados</span>
                  <span>10:00 a. m. – 8:00 p. m.</span>
                </li>
                <li>
                  <span>Domingos y festivos</span>
                  <span>11:00 a. m. – 5:00 p. m.</span>
                </li>
              </ul>
            </div>

            <div className="info-block">
              <h3>Atención y asesoría</h3>
              <p style={{ marginBottom: '1rem' }}>
                ¿Tienes dudas sobre tu talla o disponibilidad de stock? Escríbenos directamente:
              </p>
              <div className="button-row">
                <a
                  className="btn btn-dark"
                  href="https://wa.me/573129876543"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp: 312 987 6543
                </a>
                <a
                  className="btn btn-outline"
                  href="mailto:hola@sauzstore.com"
                >
                  hola@sauzstore.com
                </a>
              </div>
            </div>
          </div>

          {/* Mapa Interactivo */}
          <div className="map-wrap">
            <iframe
              className="map-frame"
              title="Mapa de ubicación de Sauz Store"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-75.575%2C6.205%2C-75.565%2C6.215&amp;layer=mapnik&amp;marker=6.210%2C-75.570"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Franja de envíos nacionales */}
      <section className="section section-alt">
        <div className="wrap">
          <div className="feature-grid">
            <div className="feature">
              <h3>¿No estás en Medellín?</h3>
              <p>Despachamos a toda Colombia con envío 100% gratis en 24 a 48 horas hábiles.</p>
            </div>
            <div className="feature">
              <h3>Asesoría de tallas</h3>
              <p>Escríbenos por WhatsApp con tu estatura y peso para recomendarte el fit ideal.</p>
            </div>
            <div className="feature">
              <h3>Cambios a domicilio</h3>
              <p>Si la talla no te convence, programamos el cambio en tu ciudad sin complicaciones.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
