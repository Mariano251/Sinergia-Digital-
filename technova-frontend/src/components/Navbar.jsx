import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout }    = useAuth();
  const { itemCount, setIsOpen } = useCart();
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) =>
    pathname === path ? 'text-tn-accent' : 'text-tn-muted hover:text-tn-text';

  return (
    <header className="sticky top-0 z-40 bg-tn-dark/95 backdrop-blur-sm border-b border-tn-border"
            style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', left: 0, right: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0 24px', width: '100%', boxSizing: 'border-box', height: '64px' }}>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-tn-accent rounded-lg flex items-center justify-center
                            group-hover:shadow-accent transition-shadow duration-300">
              <span className="text-white font-bold text-sm">TN</span>
            </div>
            <span className="font-bold text-xl text-tn-text">
              Tech<span className="text-tn-accent">Nova</span>
            </span>
          </Link>

          {/* Navegación */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/"        className={`text-sm font-medium transition-colors ${isActive('/')}`}>
              Inicio
            </Link>
            <Link to="/catalog" className={`text-sm font-medium transition-colors ${isActive('/catalog')}`}>
              Catálogo
            </Link>
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-3">

            {/* Botón del carrito */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2 text-tn-muted hover:text-tn-text transition-colors"
              aria-label="Abrir carrito"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-tn-accent text-white text-xs
                                 font-bold w-5 h-5 rounded-full flex items-center justify-center
                                 animate-fade-in">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* Autenticación */}
            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:block text-sm text-tn-muted">
                  Hola, <span className="text-tn-text font-medium">{user.name.split(' ')[0]}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-tn-muted hover:text-tn-danger transition-colors font-medium"
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"
                  className="text-sm text-tn-muted hover:text-tn-text transition-colors font-medium">
                  Ingresar
                </Link>
                <Link to="/register"
                  className="btn-primary text-sm py-2 px-4">
                  Registrarse
                </Link>
              </div>
            )}
          </div>
      </div>
    </header>
  );
}
