import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(true);

  const selectedCategory = searchParams.get('category') || '';
  const searchQuery      = searchParams.get('search')   || '';
  const currentPage      = parseInt(searchParams.get('page') || '1');

  // Cargar categorías una sola vez
  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => setCategories(data))
      .catch(console.error);
  }, []);

  // Cargar productos cuando cambia algún filtro
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: currentPage, limit: 8 });
        if (selectedCategory) params.set('category', selectedCategory);
        if (searchQuery)       params.set('search',   searchQuery);

        const { data } = await api.get(`/products?${params}`);
        setProducts(data.products);
        setPagination(data.pagination);
      } catch (err) {
        console.error('Error cargando productos:', err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedCategory, searchQuery, currentPage]);

  const applyFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page'); // Resetear paginación al filtrar
    setSearchParams(next);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const value = e.target.elements.search.value.trim();
    applyFilter('search', value);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-tn-text">Catálogo</h1>
        <p className="text-tn-muted mt-1">
          {pagination ? `${pagination.total} productos encontrados` : 'Cargando...'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Sidebar de filtros ── */}
        <aside className="lg:w-60 flex-shrink-0 space-y-6">

          {/* Búsqueda */}
          <div className="card p-4">
            <h3 className="font-semibold text-tn-text mb-3 text-sm uppercase tracking-wider">Buscar</h3>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                name="search"
                defaultValue={searchQuery}
                placeholder="Ej: monitor, teclado..."
                className="input text-sm py-2"
              />
              <button type="submit" className="btn-primary py-2 px-3 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>

          {/* Filtro por categoría */}
          <div className="card p-4">
            <h3 className="font-semibold text-tn-text mb-3 text-sm uppercase tracking-wider">Categoría</h3>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => applyFilter('category', '')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                    ${!selectedCategory
                      ? 'bg-tn-accent/10 text-tn-accent font-semibold'
                      : 'text-tn-muted hover:text-tn-text hover:bg-tn-dark-2'
                    }`}
                >
                  Todas
                </button>
              </li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => applyFilter('category', cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                      ${selectedCategory === cat.slug
                        ? 'bg-tn-accent/10 text-tn-accent font-semibold'
                        : 'text-tn-muted hover:text-tn-text hover:bg-tn-dark-2'
                      }`}
                  >
                    {cat.name}
                    <span className="ml-1 text-xs text-tn-muted">({cat.product_count})</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Limpiar filtros */}
          {(selectedCategory || searchQuery) && (
            <button
              onClick={() => setSearchParams({})}
              className="btn-secondary w-full text-sm py-2 text-tn-danger border-tn-danger/30 hover:border-tn-danger"
            >
              Limpiar filtros
            </button>
          )}
        </aside>

        {/* ── Grid de productos ── */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card h-80 animate-pulse bg-tn-card-hover" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="card p-16 text-center">
              <p className="text-tn-text font-semibold text-lg">No se encontraron productos</p>
              <p className="text-tn-muted mt-2">Probá con otros filtros o términos de búsqueda.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Paginación */}
              {pagination && pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => applyFilter('page', page)}
                      className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors
                        ${currentPage === page
                          ? 'bg-tn-accent text-white'
                          : 'bg-tn-card border border-tn-border text-tn-muted hover:text-tn-text'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
