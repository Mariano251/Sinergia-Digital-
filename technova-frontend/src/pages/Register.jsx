import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:             '',
    email:            '',
    password:         '',
    confirm_password: '',
    telegram_chat_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  if (user) {
    navigate('/');
    return null;
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm_password) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await register(form.name, form.email, form.password, form.telegram_chat_id || undefined);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-tn-accent rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">TN</span>
            </div>
            <span className="font-bold text-2xl text-tn-text">
              Tech<span className="text-tn-accent">Nova</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-tn-text">Crear cuenta</h1>
          <p className="text-tn-muted mt-2">Registrate para comprar en TechNova</p>
        </div>

        {/* Formulario */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-tn-muted mb-1.5">Nombre completo</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Juan Pérez"
                className="input"
                autoComplete="name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-tn-muted mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="tu@email.com"
                className="input"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-tn-muted mb-1.5">Contraseña</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Mínimo 6 caracteres"
                className="input"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-tn-muted mb-1.5">Confirmar contraseña</label>
              <input
                type="password"
                name="confirm_password"
                value={form.confirm_password}
                onChange={handleChange}
                required
                placeholder="Repetí tu contraseña"
                className="input"
                autoComplete="new-password"
              />
            </div>

            {/* Campo opcional para Telegram */}
            <div>
              <label className="block text-sm font-medium text-tn-muted mb-1.5">
                Telegram Chat ID
                <span className="ml-2 text-xs text-tn-muted/70 font-normal">(opcional — para recibir notificaciones)</span>
              </label>
              <input
                type="text"
                name="telegram_chat_id"
                value={form.telegram_chat_id}
                onChange={handleChange}
                placeholder="Ej: 123456789"
                className="input"
              />
              <p className="text-xs text-tn-muted mt-1">
                Si tenés un bot de Telegram configurado podés recibir alertas de tus pedidos.
              </p>
            </div>

            {error && (
              <div className="bg-tn-danger/10 border border-tn-danger/30 text-tn-danger text-sm
                              px-4 py-3 rounded-lg flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creando cuenta...
                </span>
              ) : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <p className="text-center text-tn-muted text-sm mt-6">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-tn-accent hover:underline font-medium">
            Ingresá acá
          </Link>
        </p>
      </div>
    </div>
  );
}
