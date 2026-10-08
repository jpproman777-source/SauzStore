import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';

const CATEGORIES = ['Todas', 'Camisetas', 'Chaquetas', 'Pantalones', 'Vestidos', 'Sudaderas', 'Accesorios'];

export const Catalog = ({ selectedCategory, setSelectedCategory, searchQuery, setSearchQuery }) => {
  const { products, loadingProducts } = useCart();
  const [sortBy, setSortBy] = useState('relevant'); // 'relevant' | 'price-asc' | 'price-desc' | 'name'

  // Filtrado y ordenamiento de prendas
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filtro por categoría
    if (selectedCategory && selectedCategory !== 'Todas') {
      result = result.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filtro por búsqueda
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    // Ordenamiento
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <main>
      {/* Encabezado de página */}
      <section className="page-head" aria-label="Encabezado del catálogo">
        <div className="wrap">
          <h1>Catálogo</h1>
          <p className="lead">
            Prendas de corte amplio y telas de alta densidad pensadas para resistir el uso diario sin perder forma ni estilo.
          </p>
        </div>
      </section>

      {/* Contenido del catálogo */}
      <section className="section">
        <div className="wrap">
          {/* Barra de herramientas / filtros */}
          <div className="toolbar">
            <div className="chips" role="group" aria-label="Filtrar por categoría">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`chip ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="toolbar-right">
              <span className="result-count">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'prenda' : 'prendas'}
              </span>

              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Ordenar prendas"
              >
                <option value="relevant">Relevancia</option>
                <option value="price-asc">Menor precio</option>
                <option value="price-desc">Mayor precio</option>
                <option value="name">Nombre (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Banner de búsqueda activa */}
          {searchQuery && (
            <div className="query-banner">
              <span>
                Resultados para: <strong>"{searchQuery}"</strong>
              </span>
              <button
                type="button"
                className="link-underline"
                onClick={() => setSearchQuery('')}
              >
                Limpiar búsqueda
              </button>
            </div>
          )}

          {/* Grid de prendas */}
          <div className="products-grid">
            {loadingProducts ? (
              <p className="grid-msg">Cargando catálogo...</p>
            ) : filteredProducts.length === 0 ? (
              <div className="grid-msg">
                <p>No se encontraron prendas con los filtros seleccionados.</p>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setSelectedCategory('Todas');
                    setSearchQuery('');
                  }}
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
};
