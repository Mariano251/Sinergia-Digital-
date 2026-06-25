import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart }  from '../context/CartContext';
import { useAuth }  from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { required, digitsOnly, runValidators } from '../utils/validators';
import api from '../services/api';

const formatPrice = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

const ADDR_VALIDATORS = {
  nombre:        [required('El nombre es obligatorio')],
  calle:         [required('La calle y número son obligatorios')],
  ciudad:        [required('La ciudad es obligatoria')],
  provincia:     [required('La provincia es obligatoria')],
  codigo_postal: [required('El código postal es obligatorio'), digitsOnly('El código postal debe ser numérico')],
};

const PAYMENT_METHODS = [
  { id: 'tarjeta_credito', label: 'Tarjeta de crédito' },
  { id: 'tarjeta_debito',  label: 'Tarjeta de débito' },
  { id: 'transferencia',   label: 'Transferencia bancaria' },
  { id: 'mercadopago',     label: 'MercadoPago' },
];

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const toast    = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre:     '',
    calle:      '',
    ciudad:     '',
    provincia:  '',
    codigo_postal: '',
    payment_method: 'tarjeta_credito'
  });
  const [errors,     setErrors]     = useState({});
  const [touched,    setTouched]    = useState({});
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState(false);
  const [order,      setOrder]      = useState(null); // orden creada (para la confirmación)
  const [mpSimMode,  setMpSimMode]  = useState(false); // pantalla de simulación MP

  const validateField = (name, value) => runValidators(ADDR_VALIDATORS[name] || [], value);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const validateAll = () => {
    const next = {};
    Object.keys(ADDR_VALIDATORS).forEach(k => { next[k] = validateField(k, form[k]); });
    setErrors(next);
    setTouched(Object.fromEntries(Object.keys(ADDR_VALIDATORS).map(k => [k, true])));
    return Object.values(next).every(v => !v);
  };

  const fieldClass = (name) =>
    `input ${touched[name] && errors[name] ? 'border-tn-danger focus:border-tn-danger focus:ring-tn-danger' : ''}`;

  // Progreso del checkout: 1 Envío → 2 Pago → 3 Confirmación
  const addressComplete = Object.keys(ADDR_VALIDATORS).every(
    k => form[k] && !validateField(k, form[k])
  );
  const currentStep = success ? 3 : addressComplete ? 2 : 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;

    setError('');
    if (!validateAll()) {
      toast.error('Revisá los datos de envío.');
      return;
    }
    setLoading(true);

    // Snapshot del carrito ANTES de vaciarlo, para mostrarlo en la confirmación
    const itemsSnapshot = [...items];
    const totalSnapshot = total;
    const shipping = {
      nombre:        form.nombre,
      calle:         form.calle,
      ciudad:        form.ciudad,
      provincia:     form.provincia,
      codigo_postal: form.codigo_postal
    };

    try {
      // MercadoPago: flujo simulado para la tesis.
      // Se crea la orden con estado "pendiente_mp" y se muestra
      // la pantalla de simulación en lugar de redirigir a MP real.
      if (form.payment_method === 'mercadopago') {
        await api.post('/orders', {
          shipping_address: shipping,
          payment_method:   'mercadopago',
          status:           'pendiente_mp'
        });
        clearCart();
        setMpSimMode(true);
        setTimeout(() => navigate('/'), 4000);
        return;
      }

      // Resto de métodos de pago: flujo normal
      const { data } = await api.post('/orders', {
        shipping_address: shipping,
        payment_method:   form.payment_method
      });

      clearCart();
      toast.success('¡Compra completada! Tu orden fue procesada con éxito.');
      setOrder({
        id:             data?.id,
        total:          data?.total_amount ?? totalSnapshot,
        items:          itemsSnapshot,
        shipping,
        payment_method: form.payment_method
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar la orden. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de simulación MercadoPago
  if (mpSimMode) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="card max-w-md w-full p-10 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
               style={{ background: 'rgba(0, 162, 255, 0.12)' }}>
            <svg className="w-10 h-10" fill="none" stroke="#009EE3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-tn-text mb-3">Redirigiendo a MercadoPago...</h2>
          <p className="text-tn-muted mb-4">
            Tu orden fue registrada como <span className="text-tn-accent font-semibold">pendiente de pago</span>.
          </p>
          <p className="text-sm px-4 py-2 rounded-lg mb-6"
             style={{ background: 'rgba(0, 162, 255, 0.08)', color: '#009EE3', border: '1px solid rgba(0,162,255,0.2)' }}>
            🧪 Modo simulación — en producción el usuario sería redirigido al sitio de MercadoPago.
          </p>
          <p className="text-tn-muted text-sm">Redirigiendo al inicio...</p>
        </div>
      </div>
    );
  }

  // Pantalla de confirmación de compra
  if (success && order) {
    const paymentLabel = PAYMENT_METHODS.find(m => m.id === order.payment_method)?.label || order.payment_method;
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="card p-8 sm:p-10 animate-fade-in">
          {/* Encabezado */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-tn-success/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-tn-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-tn-text mb-2">¡Gracias por tu compra!</h2>
            <p className="text-tn-muted">Tu orden fue procesada correctamente.</p>
            {order.id && (
              <p className="mt-3 inline-block bg-tn-accent/10 text-tn-accent font-semibold text-sm px-4 py-1.5 rounded-full">
                Orden #{order.id}
              </p>
            )}
          </div>

          {/* Resumen de items */}
          <div className="border-t border-tn-border pt-6">
            <h3 className="font-semibold text-tn-text mb-4">Resumen del pedido</h3>
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.product_id} className="flex items-center gap-3">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                    onError={e => { e.target.src = 'https://placehold.co/48x48/1a1a2e/4f8ef7?text=TN'; }}
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
            <div className="flex justify-between text-tn-text font-bold text-lg mt-4 pt-4 border-t border-tn-border">
              <span>Total</span>
              <span className="text-tn-accent">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Datos de envío y pago */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-sm">
            <div className="bg-tn-dark-2 rounded-xl p-4">
              <p className="text-tn-muted text-xs uppercase tracking-wider mb-2">Envío a</p>
              <p className="text-tn-text font-medium">{order.shipping.nombre}</p>
              <p className="text-tn-muted">{order.shipping.calle}</p>
              <p className="text-tn-muted">{order.shipping.ciudad}, {order.shipping.provincia} ({order.shipping.codigo_postal})</p>
            </div>
            <div className="bg-tn-dark-2 rounded-xl p-4">
              <p className="text-tn-muted text-xs uppercase tracking-wider mb-2">Método de pago</p>
              <p className="text-tn-text font-medium">{paymentLabel}</p>
              <p className="text-tn-muted text-xs mt-2">Recibirás la confirmación por email.</p>
            </div>
          </div>

          {/* Próximos pasos */}
          <div className="mt-6 bg-tn-accent/5 border border-tn-accent/20 rounded-xl p-4">
            <p className="text-tn-text text-sm font-medium mb-1">¿Qué sigue?</p>
            <p className="text-tn-muted text-sm">
              Prepararemos tu pedido y te avisaremos cuando salga el envío. Podés seguir el estado desde tu perfil.
            </p>
          </div>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            {user && (
              <Link to="/profile" className="btn-primary flex-1 justify-center text-center">
                Ver mis órdenes
              </Link>
            )}
            <Link to="/catalog" className="btn-secondary flex-1 justify-center text-center">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay items en el carrito
  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="card max-w-md w-full p-10 text-center">
          <h2 className="text-2xl font-bold text-tn-text mb-3">Carrito vacío</h2>
          <p className="text-tn-muted mb-6">Agregá productos antes de proceder al checkout.</p>
          <Link to="/catalog" className="btn-primary">Ver catálogo</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-tn-text mb-6">Checkout</h1>

      {/* Stepper de progreso */}
      <div className="flex items-center justify-center mb-10 max-w-xl mx-auto">
        {[
          { n: 1, label: 'Envío' },
          { n: 2, label: 'Pago' },
          { n: 3, label: 'Confirmación' },
        ].map((step, i, arr) => (
          <div key={step.n} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                               transition-colors duration-300 border-2
                ${currentStep > step.n
                  ? 'bg-tn-success border-tn-success text-white'
                  : currentStep === step.n
                    ? 'bg-tn-accent border-tn-accent text-white'
                    : 'bg-tn-dark-2 border-tn-border text-tn-muted'}`}>
                {currentStep > step.n ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : step.n}
              </div>
              <span className={`text-xs font-medium ${currentStep >= step.n ? 'text-tn-text' : 'text-tn-muted'}`}>
                {step.label}
              </span>
            </div>
            {i < arr.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 -mt-5 transition-colors duration-300
                ${currentStep > step.n ? 'bg-tn-success' : 'bg-tn-border'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* ── Formulario ── */}
        <div className="lg:col-span-3 space-y-6">
          {!user && (
            <div className="card p-4 border-tn-warning/30 bg-tn-warning/5 flex items-start gap-3">
              <svg className="w-5 h-5 text-tn-warning flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-tn-warning text-sm">
                Para guardar tu historial de órdenes,{' '}
                <Link to="/login" className="underline font-semibold">iniciá sesión</Link>
                {' '}o{' '}
                <Link to="/register" className="underline font-semibold">registrate</Link>.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Dirección de envío */}
            <div className="card p-6">
              <h2 className="font-bold text-tn-text text-lg mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-tn-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Dirección de envío
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-tn-muted mb-1.5">Nombre completo</label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Juan Pérez"
                    className={fieldClass('nombre')}
                  />
                  {touched.nombre && errors.nombre && (
                    <p className="text-tn-danger text-xs mt-1.5">{errors.nombre}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-tn-muted mb-1.5">Calle y número</label>
                  <input
                    name="calle"
                    value={form.calle}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Av. Corrientes 1234"
                    className={fieldClass('calle')}
                  />
                  {touched.calle && errors.calle && (
                    <p className="text-tn-danger text-xs mt-1.5">{errors.calle}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-tn-muted mb-1.5">Ciudad</label>
                  <input
                    name="ciudad"
                    value={form.ciudad}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Buenos Aires"
                    className={fieldClass('ciudad')}
                  />
                  {touched.ciudad && errors.ciudad && (
                    <p className="text-tn-danger text-xs mt-1.5">{errors.ciudad}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-tn-muted mb-1.5">Provincia</label>
                  <input
                    name="provincia"
                    value={form.provincia}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="CABA"
                    className={fieldClass('provincia')}
                  />
                  {touched.provincia && errors.provincia && (
                    <p className="text-tn-danger text-xs mt-1.5">{errors.provincia}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-tn-muted mb-1.5">Código postal</label>
                  <input
                    name="codigo_postal"
                    value={form.codigo_postal}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="1001"
                    className={fieldClass('codigo_postal')}
                  />
                  {touched.codigo_postal && errors.codigo_postal && (
                    <p className="text-tn-danger text-xs mt-1.5">{errors.codigo_postal}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Método de pago */}
            <div className="card p-6">
              <h2 className="font-bold text-tn-text text-lg mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-tn-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Método de pago
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PAYMENT_METHODS.map(m => (
                  <label
                    key={m.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all
                      ${form.payment_method === m.id
                        ? 'border-tn-accent bg-tn-accent/5 text-tn-text'
                        : 'border-tn-border hover:border-tn-accent/40 text-tn-muted hover:text-tn-text'
                      }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={m.id}
                      checked={form.payment_method === m.id}
                      onChange={handleChange}
                      className="accent-tn-accent"
                    />
                    <span className="text-sm font-medium">{m.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="card p-4 border-tn-danger/30 bg-tn-danger/5 text-tn-danger text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !user}
              className="btn-primary w-full py-4 text-base"
              title={!user ? 'Debés iniciar sesión para confirmar la orden' : ''}
            >
              {loading ? 'Procesando...' : 'Confirmar orden'}
            </button>

            {!user && (
              <p className="text-center text-tn-muted text-sm">
                Necesitás{' '}
                <Link to="/login" className="text-tn-accent hover:underline">iniciar sesión</Link>
                {' '}para confirmar.
              </p>
            )}
          </form>
        </div>

        {/* ── Resumen del pedido ── */}
        <div className="lg:col-span-2">
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-tn-text text-lg mb-5">Resumen del pedido</h2>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map(item => (
                <div key={item.product_id} className="flex items-center gap-3">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                    onError={e => { e.target.src = 'https://placehold.co/48x48/1a1a2e/4f8ef7?text=TN'; }}
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

            <div className="mt-5 pt-5 border-t border-tn-border space-y-2">
              <div className="flex justify-between text-tn-muted text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-tn-muted text-sm">
                <span>Envío</span>
                <span className="text-tn-success">Gratis</span>
              </div>
              <div className="flex justify-between text-tn-text font-bold text-lg pt-2 border-t border-tn-border">
                <span>Total</span>
                <span className="text-tn-accent">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
