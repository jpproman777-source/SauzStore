import React from 'react';

export const Footer = ({ setActivePage, onCategorySelect }) => {
  const handleNav = (page) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategory = (cat) => {
    if (onCategorySelect) {
      onCategorySelect(cat);
    }
    setActivePage('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <span className="brand">SAUZ STORE</span>
          <p>Moda urbana y streetwear en telas premium, diseñada para destacar con actitud y autenticidad.</p>
        </div>

        <div className="footer-col">
          <h4>Colección</h4>
          <ul>
            <li><button type="button" className="footer-link-btn" onClick={() => handleCategory('Camisetas')}>Camisetas</button></li>
            <li><button type="button" className="footer-link-btn" onClick={() => handleCategory('Chaquetas')}>Chaquetas</button></li>
            <li><button type="button" className="footer-link-btn" onClick={() => handleCategory('Pantalones')}>Pantalones</button></li>
            <li><button type="button" className="footer-link-btn" onClick={() => handleCategory('Sudaderas')}>Sudaderas</button></li>
            <li><button type="button" className="footer-link-btn" onClick={() => handleCategory('Accesorios')}>Accesorios</button></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Navegación</h4>
          <ul>
            <li><button type="button" className="footer-link-btn" onClick={() => handleNav('home')}>Inicio</button></li>
            <li><button type="button" className="footer-link-btn" onClick={() => handleNav('catalog')}>Catálogo completo</button></li>
            <li><button type="button" className="footer-link-btn" onClick={() => handleNav('about')}>Quiénes somos</button></li>
            <li><button type="button" className="footer-link-btn" onClick={() => handleNav('location')}>Ubicación y tiendas</button></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Atención al cliente</h4>
          <p>Calle 10 # 40-20, Local 101<br />Medellín, Antioquia</p>
          <p>WhatsApp: +57 312 987 6543</p>
          <p>Lunes a sábado: 10:00 a. m. – 8:00 p. m.</p>
        </div>
      </div>

      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} Sauz Store. Todos los derechos reservados.</span>
        <span>Streetwear Colombiano Premium · Hecho con actitud</span>
      </div>
    </footer>
  );
};
