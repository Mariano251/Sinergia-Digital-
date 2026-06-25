import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { required, email as emailRule, runValidators } from '../utils/validators';

const VALIDATORS = {
  email:    [required('El email es obligatorio'), emailRule()],
  password: [required('La contraseña es obligatoria')],
};

export default function Login() {
  const { login, user } = useAuth();
  const toast           = useToast();
  const navigate        = useNavigate();
  const { state }       = useLocation();

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // Redirigir si ya está logueado — en un efecto, NO durante el render
  useEffect(() => {
    if (user) navigate(state?.from || '/', { replace: true });
  }, [user, navigate, state]);

  const validateField = (name, value) => runValidators(VALIDATORS[name] || [], value);

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
    Object.keys(VALIDATORS).forEach(k => { next[k] = validateField(k, form[k]); });
    setErrors(next);
    setTouched({ email: true, password: true });
    return Object.values(next).every(v => !v);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateAll()) return;
    setLoading(true);

    try {
      const data = await login(form.email, form.password);
      toast.success(`¡Bienvenido de vuelta, ${data.user.name.split(' ')[0]}!`);
      navigate(state?.from || '/');
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al iniciar sesión';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = (name) =>
    `input ${touched[name] && errors[name] ? 'border-tn-danger focus:border-tn-danger focus:ring-tn-danger' : ''}`;

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
          <h1 className="text-2xl font-bold text-tn-text">Bienvenido de vuelta</h1>
          <p className="text-tn-muted mt-2">Ingresá a tu cuenta para continuar</p>
        </div>

        {/* Formulario */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-tn-muted mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="tu@email.com"
                className={fieldClass('email')}
                autoComplete="email"
              />
              {touched.email && errors.email && (
                <p className="text-tn-danger text-xs mt-1.5">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-tn-muted mb-1.5">Contraseña</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                className={fieldClass('password')}
                autoComplete="current-password"
              />
              {touched.password && errors.password && (
                <p className="text-tn-danger text-xs mt-1.5">{errors.password}</p>
              )}
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

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Ingresando...
                </span>
              ) : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="text-center text-tn-muted text-sm mt-6">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="text-tn-accent hover:underline font-medium">
            Registrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
