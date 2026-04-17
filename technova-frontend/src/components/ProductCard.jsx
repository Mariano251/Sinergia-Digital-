import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const formatPrice = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  const handleAdd = (e) => {
    e.preventDefault();
    addItem(product, 1);
  };

  return (
    <Link to={`/product/${product.id}`}
          className="card group flex flex-col hover:border-tn-accent/50 transition-all duration-300
                     hover:-translate-y-1 hover:shadow-accent animate-fade-in">

      {/* Imagen */}
      <div className="relative overflow-hidden rounded-t-xl">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={e => { e.target.src = `https://placehold.co/400x300/1a1a2e/4f8ef7?text=${encodeURIComponent(product.name)}`; }}
        />
        {product.featured && (
          <span className="absolute top-3 left-3 badge bg-tn-accent/20 text-tn-accent border border-tn-accent/30">
            Destacado
          </span>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute top-3 right-3 badge bg-tn-warning/20 text-tn-warning border border-tn-warning/30">
            ¡Últimas unidades!
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="badge bg-tn-danger/20 text-tn-danger border border-tn-danger/30 text-sm px-4 py-2">
              Sin stock
            </span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Categoría */}
        {product.category_name && (
          <span className="text-xs text-tn-accent font-medium uppercase tracking-wider">
            {product.category_name}
          </span>
        )}

        {/* Nombre */}
        <h3 className="font-semibold text-tn-text group-hover:text-tn-accent transition-colors
                       line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Descripción */}
        <p className="text-tn-muted text-sm line-clamp-2 flex-1">
          {product.description}
        </p>

        {/* Precio y acción */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-tn-border">
          <span className="text-tn-accent font-bold text-lg">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="btn-primary text-sm py-2 px-4 disabled:opacity-40"
          >
            + Agregar
          </button>
        </div>
      </div>
    </Link>
  );
}
