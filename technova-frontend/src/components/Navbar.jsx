import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout }         = useAuth();
  const { itemCount, setIsOpen } = useCart();
  const navigate     = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Cerrar el menú mobile al cambiar de ruta
  useEffect(() => { setMenuOpen(false); }, [pathname]);

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

          {/* Navegación desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/"        className={`text-sm font-medium transition-colors ${isActive('/')}`}>
              Inicio
            </Link>
            <Link to="/catalog" className={`text-sm font-medium transition-colors ${isActive('/catalog')}`}>
              Catálogo
            </Link>
            {user && (
              <Link to="/profile" className={`text-sm font-medium transition-colors ${isActive('/profile')}`}>
                Mis órdenes
              </Link>
            )}
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
                <span
                  key={itemCount}
                  className="absolute -top-1 -right-1 bg-tn-accent text-white text-xs
                             font-bold w-5 h-5 rounded-full flex items-center justify-center
                             animate-pop">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* Autenticación desktop */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <Link to="/profile" className="text-sm text-tn-muted hover:text-tn-text transition-colors">
                    Hola, <span className="text-tn-text font-medium">{user.name.split(' ')[0]}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-tn-muted hover:text-tn-danger transition-colors font-medium"
                  >
                    Salir
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login"
                    className="text-sm text-tn-muted hover:text-tn-text transition-colors font-medium">
                    Ingresar
                  </Link>
                  <Link to="/register" className="btn-primary text-sm py-2 px-4">
                    Registrarse
                  </Link>
                </>
              )}
            </div>

            {/* Botón hamburguesa mobile */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="md:hidden p-2 text-tn-muted hover:text-tn-text transition-colors"
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
      </div>

      {/* Menú mobile desplegable */}
      {menuOpen && (
        <nav className="md:hidden border-t border-tn-border bg-tn-dark/98 backdrop-blur-sm animate-fade-in px-6 py-4 space-y-1">
          <Link to="/"        className={`block py-2.5 text-sm font-medium transition-colors ${isActive('/')}`}>Inicio</Link>
          <Link to="/catalog" className={`block py-2.5 text-sm font-medium transition-colors ${isActive('/catalog')}`}>Catálogo</Link>
          {user ? (
            <>
              <Link to="/profile" className={`block py-2.5 text-sm font-medium transition-colors ${isActive('/profile')}`}>
                Mi cuenta y órdenes
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left py-2.5 text-sm font-medium text-tn-muted hover:text-tn-danger transition-colors"
              >
                Salir
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/login" className="btn-secondary text-sm py-2.5 justify-center text-center">Ingresar</Link>
              <Link to="/register" className="btn-primary text-sm py-2.5 justify-center text-center">Registrarse</Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
