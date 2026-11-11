import React, { useEffect } from 'react';
import { ArrowUpRight, ArrowDown } from 'lucide-react';
import './about-editorial.css';

export const About = ({ onCatalogFilter }) => {
  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.content;
    document.title = 'Quiénes somos | SAUZ STORE Black Edition';
    if (meta) meta.content = 'Descubre SAUZ STORE: una propuesta multimarca de ropa urbana, sneakers y accesorios para expresar tu estilo.';
    return () => {
      document.title = previousTitle;
      if (meta) meta.content = previousDescription;
    };
  }, []);

  const navigate = (event, category) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onCatalogFilter({ category, query: '', brand: 'Todas', sort: 'destacados' });
  };
  const catalogLink = category => `/catalogo${category === 'Todas' ? '' : `?coleccion=${encodeURIComponent(category === 'Sneakers' ? 'Zapatillas' : category)}`}`;

  return <main className="sauz-about">
    <section className="sauz-about-hero" aria-labelledby="about-title">
      <div className="sauz-about-hero-copy">
        <p className="sauz-about-eyebrow"><span /> SAUZ STORE / BLACK EDITION</p>
        <h1 id="about-title">NO SE TRATA <br />SOLO DE <span>VESTIR.</span></h1>
        <p className="sauz-about-subtitle">Se trata de encontrar tu estilo.</p>
        <p className="sauz-about-intro">Somos una tienda multimarca de moda urbana. Ropa, sneakers y accesorios para quienes hacen del estilo una forma de expresión.</p>
        <a className="sauz-about-link" href={catalogLink('Todas')} onClick={event => navigate(event, 'Todas')}>Encuentra tu próxima pieza <ArrowUpRight size={20} aria-hidden="true" /></a>
        <a className="sauz-about-scroll" href="#sauz-story"><ArrowDown size={16} aria-hidden="true" /> Conoce nuestra esencia</a>
      </div>
      <figure className="sauz-about-hero-photo">
        <img src="/1.jpeg" srcSet="/editorial/about-1-480.webp 480w, /editorial/about-1-1000.webp 1000w" sizes="(max-width: 620px) 100vw, 50vw" alt="Modelo con conjunto negro de streetwear entre escaleras y arquitectura urbana" width="1000" height="1250" fetchPriority="high" decoding="async" />
        <figcaption>ESTILO EN MOVIMIENTO <span>01 / SAUZ EDITORIAL</span></figcaption>
      </figure>
    </section>

    <section id="sauz-story" className="sauz-about-story sauz-about-container" aria-labelledby="story-title">
      <figure>
        <img src="/2.jpeg" srcSet="/editorial/about-2-480.webp 480w, /editorial/about-2-800.webp 800w" sizes="(max-width: 620px) 90vw, 40vw" alt="Grupo con looks urbanos en denim oscuro en un entorno de calle" width="800" height="1200" loading="lazy" decoding="async" />
        <figcaption>Distintas miradas. Una misma cultura.</figcaption>
      </figure>
      <div className="sauz-about-story-copy">
        <p className="sauz-about-eyebrow">01 / NUESTRA ESENCIA</p>
        <h2 id="story-title">NACIMOS PARA <br />VIVIR EL <span>ESTILO.</span></h2>
        <p>Creemos en la moda urbana como una manera de expresarse. En las combinaciones que eliges, en los detalles que te representan y en la libertad de vestir a tu manera.</p>
        <p>En SAUZ STORE seleccionamos ropa, sneakers y accesorios de diferentes marcas para acercarte una propuesta conectada con la cultura de la calle y el estilo personal.</p>
        <div className="sauz-about-story-signature"><span>UNA TIENDA MULTIMARCA.</span><span>MUCHAS FORMAS DE SER TÚ.</span></div>
      </div>
    </section>

    <section className="sauz-about-selection sauz-about-container" aria-labelledby="selection-title">
      <div className="sauz-about-section-heading">
        <div><p className="sauz-about-eyebrow">02 / NUESTRA SELECCIÓN</p><h2 id="selection-title">EL LOOK EMPIEZA <br />CONTIGO.</h2></div>
        <p>Explora las piezas del catálogo.<br />La combinación la pones tú.</p>
      </div>
      <figure className="sauz-about-selection-photo">
        <img src="/3.jpeg" srcSet="/editorial/about-3-480.webp 480w, /editorial/about-3-1024.webp 1024w" sizes="90vw" alt="Composición editorial de sneakers en blanco y negro junto a una gorra negra" width="1024" height="1024" loading="lazy" decoding="async" />
        <figcaption>INSPIRACIÓN EDITORIAL · Consulta las referencias disponibles en el catálogo.</figcaption>
      </figure>
    </section>

    <section className="sauz-about-philosophy" aria-labelledby="philosophy-title">
      <div className="sauz-about-container">
        <p className="sauz-about-eyebrow">03 / FILOSOFÍA SAUZ</p>
        <h2 id="philosophy-title">TU ESTILO. <br /><span>TUS REGLAS.</span></h2>
        <div className="sauz-about-values">
          <div><h3>Identidad.</h3><p>Vestir también es contar quién eres. Elige las piezas con las que te reconoces.</p></div>
          <div><h3>Versatilidad.</h3><p>Una pieza, distintas combinaciones. Explora nuevas formas de llevar lo que te gusta.</p></div>
          <div><h3>Cultura urbana.</h3><p>La calle, la música y el movimiento son parte de nuestra manera de entender el estilo.</p></div>
        </div>
        <div className="sauz-about-closing"><p>Hazlo tuyo.</p><a className="sauz-about-link" href={catalogLink('Todas')} onClick={event => navigate(event, 'Todas')}>Explorar catálogo <ArrowUpRight size={22} aria-hidden="true" /></a></div>
      </div>
    </section>
  </main>;
};
