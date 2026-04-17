import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// Formatea precios en pesos argentinos
const formatPrice = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, total, itemCount } = useCart();
  const navigate = useNavigate();

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setIsOpen]);

  // Bloquear scroll del body cuando el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleCheckout = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay oscuro */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Panel del carrito */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-tn-card border-l border-tn-border
                      flex flex-col animate-slide-in shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-tn-border">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-tn-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="font-bold text-lg text-tn-text">
              Carrito <span className="text-tn-muted text-sm font-normal">({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-tn-muted hover:text-tn-text hover:bg-tn-dark-2 rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Lista de items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-20 h-20 bg-tn-dark-2 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-tn-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-tn-text font-semibold">Tu carrito está vacío</p>
                <p className="text-tn-muted text-sm mt-1">Agregá productos para empezar</p>
              </div>
              <Link to="/catalog" onClick={() => setIsOpen(false)} className="btn-primary text-sm py-2 px-5">
                Ver catálogo
              </Link>
            </div>
          ) : (
            items.map(item => (
              <div key={item.product_id}
                   className="flex gap-4 bg-tn-dark-2 rounded-xl p-3 border border-tn-border">
                {/* Imagen */}
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                  onError={e => { e.target.src = 'https://placehold.co/64x64/1a1a2e/4f8ef7?text=TN'; }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-tn-text truncate">{item.name}</p>
                  <p className="text-tn-accent font-bold text-sm mt-0.5">{formatPrice(item.price)}</p>

                  {/* Controles de cantidad */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-tn-border hover:bg-tn-card-hover text-tn-text
                                 flex items-center justify-center text-sm font-bold transition-colors"
                    >−</button>
                    <span className="text-tn-text text-sm font-semibold w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-tn-border hover:bg-tn-card-hover text-tn-text
                                 flex items-center justify-center text-sm font-bold transition-colors"
                    >+</button>
                  </div>
                </div>

                {/* Subtotal y eliminar */}
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="text-tn-muted hover:text-tn-danger transition-colors p-1"
                    aria-label="Eliminar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <span className="text-xs text-tn-muted">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer con total y checkout */}
        {items.length > 0 && (
          <div className="px-6 py-4 border-t border-tn-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-tn-muted font-medium">Total</span>
              <span className="text-tn-text font-bold text-xl">{formatPrice(total)}</span>
            </div>
            <button onClick={handleCheckout} className="btn-primary w-full justify-center flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              Ir al checkout
            </button>
            <Link to="/catalog"
              onClick={() => setIsOpen(false)}
              className="block text-center text-sm text-tn-muted hover:text-tn-text transition-colors">
              ← Seguir comprando
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
