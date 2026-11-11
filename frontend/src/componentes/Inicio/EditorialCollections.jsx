import React, { useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const collections = [
  {
    label: 'Colección',
    title: 'Nuestra ropa.',
    description: 'Prendas originales de las mejores marcas.',
    category: 'Ropa',
    image: '/ropa.png',
    position: 'center',
  },
  {
    label: 'Accesorios',
    title: 'Nuestras gorras.',
    description: 'El complemento ideal para tu estilo.',
    category: 'Gorras',
    image: '/new-era.webp',
    position: 'center',
  },
  {
    label: 'Calzado',
    title: 'Nuestros sneakers.',
    description: 'Diseños icónicos para cualquier ocasión.',
    category: 'Sneakers',
    image: '/tenis.jpeg',
    position: 'center',
  },
];

const collectionUrl = category => category === 'Ropa'
  ? '/catalogo?coleccion=Ropa'
  : `/catalogo?coleccion=${category === 'Sneakers' ? 'Zapatillas' : category}`;

export const EditorialCollections = ({ onCollectionSelect }) => {
  const sectionRef = useRef(null);
  useScrollReveal(sectionRef);

  const openCollection = (event, category) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    onCollectionSelect(category);
  };

  return (
    <section className="collection-experience" id="categorias" aria-label="Colecciones SAUZ STORE" ref={sectionRef}>
      <header className="collection-heading" data-reveal>
        <span className="collection-kicker">SAUZ / LA SELECCIÓN</span>
        <h2>ELIGE TU PRÓXIMO <em>MOVIMIENTO.</em></h2>
        <p>Tu estilo. Sin límites.</p>
      </header>
      <div className="collection-editorial-grid">
        {collections.map((collection, index) => (
          <a
            className="collection-editorial-card"
            data-reveal
            href={collectionUrl(collection.category)}
            key={collection.title}
            onClick={event => openCollection(event, collection.category)}
            aria-label={`${collection.title} ${collection.description}`}
          >
            <img
              src={collection.image}
              alt=""
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              style={{ objectPosition: collection.position }}
            />
            <span className="collection-editorial-shade" aria-hidden="true" />
            <span className="collection-editorial-content">
              <span className="collection-editorial-label">0{index + 1} / {collection.label}</span>
              <span className="collection-editorial-title">{collection.title}</span>
              <span className="collection-editorial-description">{collection.description}</span>
            </span>
            <span className="collection-editorial-arrow" aria-hidden="true"><ArrowUpRight size={22} /></span>
          </a>
        ))}
      </div>
    </section>
  );
};
