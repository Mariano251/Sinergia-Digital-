import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const formatPrice = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });

// Mapa de estados de orden → etiqueta + estilo
const STATUS = {
  pending:       { label: 'Pendiente',         cls: 'bg-tn-warning/15 text-tn-warning border-tn-warning/30' },
  pendiente_mp:  { label: 'Pendiente de pago', cls: 'bg-tn-warning/15 text-tn-warning border-tn-warning/30' },
  paid:          { label: 'Pagada',            cls: 'bg-tn-success/15 text-tn-success border-tn-success/30' },
  shipped:       { label: 'Enviada',           cls: 'bg-tn-accent/15 text-tn-accent border-tn-accent/30' },
  delivered:     { label: 'Entregada',         cls: 'bg-tn-success/15 text-tn-success border-tn-success/30' },
  cancelled:     { label: 'Cancelada',         cls: 'bg-tn-danger/15 text-tn-danger border-tn-danger/30' },
};

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // Si no hay sesión (y ya terminó de cargar auth), mandar al login
  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { state: { from: '/profile' } });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.get('/orders')
      .then(({ data }) => setOrders(data))
      .catch(() => setError('No se pudieron cargar tus órdenes.'))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-tn-text mb-8">Mi cuenta</h1>

      {/* Datos del usuario */}
      <div className="card p-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-tn-accent/15 flex items-center justify-center flex-shrink-0">
            <span className="text-tn-accent font-bold text-2xl">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-tn-text font-semibold text-lg truncate">{user.name}</p>
            <p className="text-tn-muted text-sm truncate">{user.email}</p>
            {user.telegram_chat_id && (
              <p className="text-tn-muted text-xs mt-1">Telegram: {user.telegram_chat_id}</p>
            )}
          </div>
        </div>
      </div>

      {/* Historial de órdenes */}
      <h2 className="text-xl font-bold text-tn-text mb-5">Historial de órdenes</h2>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card h-32 animate-pulse bg-tn-card-hover" />
          ))}
        </div>
      ) : error ? (
        <div className="card p-8 text-center text-tn-danger">{error}</div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-tn-dark-2 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-tn-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-tn-text font-semibold">Todavía no hiciste ninguna compra</p>
          <p className="text-tn-muted text-sm mt-1 mb-5">Cuando completes un pedido, lo vas a ver acá.</p>
          <Link to="/catalog" className="btn-primary text-sm">Ver catálogo</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const status = STATUS[order.status] || { label: order.status, cls: 'bg-tn-dark-2 text-tn-muted border-tn-border' };
            const items  = Array.isArray(order.items) ? order.items.filter(Boolean) : [];
            return (
              <div key={order.id} className="card p-5">
                {/* Cabecera de la orden */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-tn-border">
                  <div>
                    <p className="text-tn-text font-semibold">Orden #{order.id}</p>
                    <p className="text-tn-muted text-xs mt-0.5">{formatDate(order.created_at)}</p>
                  </div>
                  <span className={`badge border ${status.cls}`}>{status.label}</span>
                </div>

                {/* Items */}
                <div className="space-y-3 py-4">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-11 h-11 object-cover rounded-lg flex-shrink-0"
                        onError={e => { e.target.src = 'https://placehold.co/44x44/1a1a2e/4f8ef7?text=TN'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-tn-text text-sm font-medium truncate">{item.name}</p>
                        <p className="text-tn-muted text-xs">x{item.quantity}</p>
                      </div>
                      <span className="text-tn-text text-sm font-semibold flex-shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-3 border-t border-tn-border">
                  <span className="text-tn-muted text-sm">Total</span>
                  <span className="text-tn-accent font-bold">{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
