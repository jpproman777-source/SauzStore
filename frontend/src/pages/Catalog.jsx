import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';

export const Catalog = ({ selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, onProductSelect }) => {
  const { products, loadingProducts } = useCart();
  const [sortBy, setSortBy] = useState('relevant'); // 'relevant' | 'price-asc' | 'price-desc' | 'name'
  const categories = useMemo(
    () => ['Todas', ...new Set(products.map((product) => product.category).filter(Boolean))],
    [products]
  );

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
    <main className="catalog-main">
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
      <section className="minimal-products-section">
        <div className="wrap">
          {/* Barra de herramientas / filtros */}
          <div className="toolbar" style={{ marginBottom: '40px' }}>
            <div className="chips" role="group" aria-label="Filtrar por categoría">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`chip ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid var(--border-color)',
                    background: selectedCategory === cat ? 'var(--text-color)' : 'transparent',
                    color: selectedCategory === cat ? 'var(--bg-color)' : 'var(--text-color)',
                    cursor: 'pointer',
                    marginRight: '10px'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="toolbar-right" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <span className="result-count" style={{ color: 'var(--text-color)' }}>
                {filteredProducts.length} {filteredProducts.length === 1 ? 'prenda' : 'prendas'}
              </span>

              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Ordenar prendas"
                style={{
                  padding: '8px',
                  background: 'var(--panel-bg)',
                  color: 'var(--text-color)',
                  border: '1px solid var(--border-color)',
                  outline: 'none'
                }}
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
            <div className="query-banner" style={{ marginBottom: '20px', color: 'var(--text-color)' }}>
              <span>
                Resultados para: <strong style={{ color: 'var(--text-color)' }}>"{searchQuery}"</strong>
              </span>
              <button
                type="button"
                style={{ marginLeft: '20px', background: 'none', border: 'none', color: 'var(--text-color)', textDecoration: 'underline', cursor: 'pointer' }}
                onClick={() => setSearchQuery('')}
              >
                Limpiar búsqueda
              </button>
            </div>
          )}

          {/* Grid de prendas */}
          <div className="minimal-products-grid">
            {loadingProducts ? (
              <p style={{ color: 'var(--text-color)' }}>Cargando catálogo...</p>
            ) : filteredProducts.length === 0 ? (
              <div>
                <p style={{ color: 'var(--text-color)' }}>No se encontraron prendas con los filtros seleccionados.</p>
                <button
                  type="button"
                  className="minimal-btn-outline"
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
                <ProductCard key={p.id} product={p} onProductSelect={onProductSelect} />
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
};
