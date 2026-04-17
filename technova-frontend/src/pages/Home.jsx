import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard         from '../components/ProductCard';
import HeroParticles       from '../components/HeroParticles';
import ParticlesBackground from '../components/ParticlesBackground';

export default function Home() {
  const [featured,    setFeatured]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products?featured=true&limit=4'),
          api.get('/categories')
        ]);
        setFeatured(prodRes.data.products);
        setCategories(catRes.data);
      } catch (err) {
        console.error('Error cargando home:', err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      {/* Canvas de partículas — position:fixed, z-index:0, FUERA del contenido */}
      <ParticlesBackground />

      {/* Todo el contenido por encima del canvas con z-index:1 */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* flex:1 ocupa todo el espacio disponible y empuja el CTA hacia abajo */}
        <div style={{ flex: 1 }}>

        {/* ── Hero con partículas ─────────────────────────────────────── */}
        <HeroParticles />

        {/* ── Categorías ──────────────────────────────────────────────── */}
        <section style={{ width: '100%', background: 'transparent' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-tn-text">Explorá por categoría</h2>
            <Link to="/catalog" className="text-tn-accent text-sm hover:underline">
              Ver todo →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="card h-24 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/catalog?category=${cat.slug}`}
                  className="card p-4 text-center hover:border-tn-accent/50 hover:-translate-y-1
                             hover:shadow-accent transition-all duration-300 group"
                >
                  <div className="w-10 h-10 bg-tn-accent/10 rounded-lg flex items-center justify-center
                                  mx-auto mb-3 group-hover:bg-tn-accent/20 transition-colors">
                    <svg className="w-5 h-5 text-tn-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <p className="text-tn-text font-semibold text-sm">{cat.name}</p>
                  <p className="text-tn-muted text-xs mt-1">{cat.product_count} productos</p>
                </Link>
              ))}
            </div>
          )}
          </div>{/* fin max-w-7xl categorías */}
        </section>

        {/* ── Productos destacados ─────────────────────────────────────── */}
        <section style={{ width: '100%', background: 'transparent' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-tn-text">Productos destacados</h2>
            <Link to="/catalog" className="text-tn-accent text-sm hover:underline">
              Ver todos →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card h-80 animate-pulse" />
              ))}
            </div>
          ) : featured.length === 0 ? (
            <p className="text-tn-muted text-center py-8">No hay productos destacados aún.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
          </div>{/* fin max-w-7xl productos */}
        </section>

        </div>{/* fin flex:1 */}

        {/* ── Banner CTA ──────────────────────────────────────────────── */}
        <section
          className="border-y border-tn-border"
          style={{ background: 'linear-gradient(to right, rgba(79,142,247,0.1), rgba(26,26,46,0.6))' }}
        >
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <h2 className="text-3xl font-bold text-tn-text mb-4">
              ¿Listo para armar tu setup?
            </h2>
            <p className="text-tn-muted mb-8 text-lg">
              Explorá más de 8 productos seleccionados para gamers y profesionales.
            </p>
            <Link to="/catalog" className="btn-primary text-base py-3.5 px-10">
              Explorar catálogo completo
            </Link>
          </div>
        </section>

      </div>
    </>
  );
}
