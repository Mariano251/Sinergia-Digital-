import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer
      className="border-t border-tn-border"
      style={{
        position:        'relative',
        zIndex:          1,
        background:      'rgba(26, 26, 46, 0.85)',
        backdropFilter:  'blur(4px)',
        marginTop:       '60px',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-tn-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">TN</span>
              </div>
              <span className="font-bold" style={{ color: 'rgba(225, 232, 255, 0.95)' }}>
                Tech<span className="text-tn-accent">Nova</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(200, 210, 255, 0.7)' }}>
              Tu destino para tecnología y electrónica de última generación.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'rgba(225, 232, 255, 0.95)' }}>Navegación</h4>
            <ul className="space-y-2">
              {[['/', 'Inicio'], ['/catalog', 'Catálogo']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-sm transition-colors hover:text-tn-accent"
                        style={{ color: 'rgba(200, 210, 255, 0.7)' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'rgba(225, 232, 255, 0.95)' }}>Cuenta</h4>
            <ul className="space-y-2">
              {[['/login', 'Ingresar'], ['/register', 'Registrarse']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-sm transition-colors hover:text-tn-accent"
                        style={{ color: 'rgba(200, 210, 255, 0.7)' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-tn-border text-center">
          <p className="text-sm" style={{ color: 'rgba(200, 210, 255, 0.55)' }}>
            © {new Date().getFullYear()} TechNova. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
