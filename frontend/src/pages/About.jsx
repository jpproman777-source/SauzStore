import React from 'react';

export const About = ({ setActivePage }) => {
  return (
    <main>
      {/* Encabezado */}
      <section className="page-head" aria-label="Quiénes somos">
        <div className="wrap">
          <h1>Quiénes somos</h1>
          <p className="lead">
            Diseñamos ropa urbana con peso, caída y carácter. Sin estampados pasajeros ni temporadas desechables.
          </p>
        </div>
      </section>

      {/* Sección Editorial / Historia */}
      <section className="section">
        <div className="wrap split">
          <div>
            <h2>La esencia de Sauz</h2>
          </div>
          <div className="prose">
            <p>
              Sauz nació como respuesta a la ropa ligera que pierde su forma tras pocas lavadas. Nuestro enfoque
              combina la estética del streetwear global con la tradición textil colombiana: telas de alto gramaje,
              costuras reforzadas y una silueta relajada pensada para la calle.
            </p>
            <p>
              Cada prenda se confecciona con algodón peinado pesado (240 a 300 GSM) y denim rígido de 13 oz.
              Creemos que el buen diseño no necesita gritar; se siente en el peso de la tela, en cómo cae sobre
              los hombros y en la durabilidad del tejido con el paso del tiempo.
            </p>
          </div>
        </div>
      </section>

      {/* Bloque Visual */}
      <section className="section section-alt">
        <div className="wrap">
          <div className="media-block" style={{ display: 'grid', placeItems: 'center', background: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '14px', minHeight: '220px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>✨</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#111111', textTransform: 'uppercase', letterSpacing: '1px' }}>CONFECCIÓN PREMIUM Y RESISTENCIA</h3>
              <p style={{ color: '#555555', marginTop: '0.4rem', fontSize: '0.95rem' }}>Algodón peinado pesado 240+ GSM · Denim rígido 13 oz · Hecho en Colombia</p>
            </div>
          </div>
        </div>
      </section>

      {/* Proceso en 4 Pasos */}
      <section className="section">
        <div className="wrap">
          <div className="steps">
            <div className="step">
              <h3>Patronaje amplio</h3>
              <p>Siluetas relaxed y oversize estudiadas para caer con naturalidad en cualquier cuerpo.</p>
            </div>
            <div className="step">
              <h3>Telas de alta densidad</h3>
              <p>Algodón peinado pesado y denim de 13 oz seleccionados para resistir uso continuo.</p>
            </div>
            <div className="step">
              <h3>Talleres locales</h3>
              <p>Producción ética en talleres especializados con pago justo y atención minuciosa al detalle.</p>
            </div>
            <div className="step">
              <h3>Garantía real</h3>
              <p>30 días para cambios sin costos ocultos porque confiamos plenamente en cada pieza.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Banda final */}
      <section className="section section-alt">
        <div className="wrap band" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <h2 style={{ margin: 0, color: '#111111', fontSize: '1.8rem' }}>Conoce las prendas de la colección actual.</h2>
          <button
            type="button"
            className="btn btn-dark"
            onClick={() => {
              setActivePage('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{ padding: '14px 32px', borderRadius: '30px' }}
          >
            Explorar catálogo
          </button>
        </div>
      </section>
    </main>
  );
};
