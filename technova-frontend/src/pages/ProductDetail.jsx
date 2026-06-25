import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const formatPrice = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

export default function ProductDetail() {
  const { id }               = useParams();
  const { addItem }          = useCart();
  const [product,  setProduct]  = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [added,    setAdded]    = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`)
      .then(({ data }) => setProduct(data))
      .catch(() => setError('Producto no encontrado'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    if (!product || product.stock === 0) return;
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="card h-96 animate-pulse bg-tn-card-hover rounded-2xl" />
          <div className="space-y-4">
            {[60, 40, 80, 40, 40].map((w, i) => (
              <div key={i}
                   style={{ width: `${w}%` }}
                   className="h-6 bg-tn-card-hover animate-pulse rounded max-w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-tn-text mb-4">Producto no encontrado</h2>
        <Link to="/catalog" className="btn-primary">← Volver al catálogo</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-tn-muted mb-8">
        <Link to="/" className="hover:text-tn-accent transition-colors">Inicio</Link>
        <span>/</span>
        <Link to="/catalog" className="hover:text-tn-accent transition-colors">Catálogo</Link>
        {product.category_name && (
          <>
            <span>/</span>
            <Link
              to={`/catalog?category=${product.category_slug}`}
              className="hover:text-tn-accent transition-colors"
            >
              {product.category_name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-tn-text truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* Imagen */}
        <div className="card overflow-hidden rounded-2xl">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover max-h-96 lg:max-h-none"
            onError={e => {
              e.target.src = `https://placehold.co/600x450/1a1a2e/4f8ef7?text=${encodeURIComponent(product.name)}`;
            }}
          />
        </div>

        {/* Info del producto */}
        <div className="flex flex-col gap-6">
          {/* Categoría + badges */}
          <div className="flex items-center gap-3 flex-wrap">
            {product.category_name && (
              <Link
                to={`/catalog?category=${product.category_slug}`}
                className="badge bg-tn-accent/10 text-tn-accent border border-tn-accent/20 hover:bg-tn-accent/20 transition-colors"
              >
                {product.category_name}
              </Link>
            )}
            {product.featured && (
              <span className="badge bg-tn-warning/10 text-tn-warning border border-tn-warning/20">
                Destacado
              </span>
            )}
          </div>

          {/* Nombre */}
          <h1 className="text-3xl lg:text-4xl font-extrabold text-tn-text leading-tight">
            {product.name}
          </h1>

          {/* Precio */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-tn-accent">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Descripción */}
          <div className="border-t border-tn-border pt-6">
            <h3 className="font-semibold text-tn-text mb-3">Descripción</h3>
            <p className="text-tn-muted leading-relaxed">{product.description}</p>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            {product.stock > 10 ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-tn-success" />
                <span className="text-tn-success text-sm font-medium">En stock ({product.stock} disponibles)</span>
              </>
            ) : product.stock > 0 ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-tn-warning" />
                <span className="text-tn-warning text-sm font-medium">¡Últimas {product.stock} unidades!</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-tn-danger" />
                <span className="text-tn-danger text-sm font-medium">Sin stock</span>
              </>
            )}
          </div>

          {/* Cantidad + Agregar al carrito */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4">
              {/* Selector de cantidad */}
              <div className="flex items-center gap-2 bg-tn-dark-2 border border-tn-border rounded-xl px-2 py-2">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg hover:bg-tn-card text-tn-text flex items-center justify-center
                             font-bold transition-colors"
                >−</button>
                <span className="w-8 text-center font-bold text-tn-text">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="w-8 h-8 rounded-lg hover:bg-tn-card text-tn-text flex items-center justify-center
                             font-bold transition-colors"
                >+</button>
              </div>

              {/* Botón agregar */}
              <button
                onClick={handleAdd}
                className={`btn-primary flex-1 flex items-center justify-center gap-2 ${
                  added ? 'bg-tn-success hover:bg-tn-success' : ''
                }`}
              >
                {added ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    ¡Agregado!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Agregar al carrito
                  </>
                )}
              </button>
            </div>
          )}

          {/* Subtotal estimado */}
          {product.stock > 0 && quantity > 1 && (
            <p className="text-tn-muted text-sm">
              Subtotal: <span className="text-tn-accent font-semibold">
                {formatPrice(product.price * quantity)}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
