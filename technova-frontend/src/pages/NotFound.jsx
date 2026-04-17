import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 text-center">
      <div className="animate-fade-in">
        <p className="text-tn-accent text-8xl font-extrabold mb-4">404</p>
        <h1 className="text-2xl font-bold text-tn-text mb-3">Página no encontrada</h1>
        <p className="text-tn-muted mb-8">La página que buscás no existe o fue movida.</p>
        <Link to="/" className="btn-primary">← Volver al inicio</Link>
      </div>
    </div>
  );
}
