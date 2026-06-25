import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { required, email as emailRule, minLength, digitsOnly, runValidators } from '../utils/validators';

export default function Register() {
  const { register, user } = useAuth();
  const toast    = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:             '',
    email:            '',
    password:         '',
    confirm_password: '',
    telegram_chat_id: ''
  });
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // Redirigir si ya está logueado — en un efecto, NO durante el render
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  // Validación por campo. confirm_password depende del valor actual de password.
  const validateField = (name, value, current = form) => {
    switch (name) {
      case 'name':
        return runValidators([required('El nombre es obligatorio'), minLength(2, 'Mínimo 2 caracteres')], value);
      case 'email':
        return runValidators([required('El email es obligatorio'), emailRule()], value);
      case 'password':
        return runValidators([required('La contraseña es obligatoria'), minLength(6, 'Mínimo 6 caracteres')], value);
      case 'confirm_password':
        if (!value) return 'Confirmá tu contraseña';
        return value === current.password ? '' : 'Las contraseñas no coinciden';
      case 'telegram_chat_id':
        return digitsOnly('El Chat ID debe ser solo números')(value);
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);
    setErrors(prev => {
      const updated = { ...prev };
      if (touched[name]) updated[name] = validateField(name, value, next);
      // Si cambia password, revalidar la confirmación si ya fue tocada
      if (name === 'password' && touched.confirm_password) {
        updated.confirm_password = validateField('confirm_password', next.confirm_password, next);
      }
      return updated;
    });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value, form) }));
  };

  const validateAll = () => {
    const fields = ['name', 'email', 'password', 'confirm_password', 'telegram_chat_id'];
    const next = {};
    fields.forEach(k => { next[k] = validateField(k, form[k], form); });
    setErrors(next);
    setTouched(Object.fromEntries(fields.map(k => [k, true])));
    return Object.values(next).every(v => !v);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateAll()) return;
    setLoading(true);

    try {
      await register(form.name, form.email, form.password, form.telegram_chat_id || undefined);
      toast.success('¡Cuenta creada con éxito! Bienvenido a TechNova.');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al registrarse';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = (name) =>
    `input ${touched[name] && errors[name] ? 'border-tn-danger focus:border-tn-danger focus:ring-tn-danger' : ''}`;

  const fields = [
    { name: 'name',             label: 'Nombre completo',  type: 'text',     placeholder: 'Juan Pérez',          autoComplete: 'name' },
    { name: 'email',            label: 'Email',            type: 'email',    placeholder: 'tu@email.com',        autoComplete: 'email' },
    { name: 'password',         label: 'Contraseña',       type: 'password', placeholder: 'Mínimo 6 caracteres', autoComplete: 'new-password' },
    { name: 'confirm_password', label: 'Confirmar contraseña', type: 'password', placeholder: 'Repetí tu contraseña', autoComplete: 'new-password' },
  ];

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
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {fields.map(f => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-tn-muted mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={f.placeholder}
                  className={fieldClass(f.name)}
                  autoComplete={f.autoComplete}
                />
                {touched[f.name] && errors[f.name] && (
                  <p className="text-tn-danger text-xs mt-1.5">{errors[f.name]}</p>
                )}
              </div>
            ))}

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
                onBlur={handleBlur}
                placeholder="Ej: 123456789"
                className={fieldClass('telegram_chat_id')}
              />
              {touched.telegram_chat_id && errors.telegram_chat_id ? (
                <p className="text-tn-danger text-xs mt-1.5">{errors.telegram_chat_id}</p>
              ) : (
                <p className="text-xs text-tn-muted mt-1">
                  Si tenés un bot de Telegram configurado podés recibir alertas de tus pedidos.
                </p>
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
