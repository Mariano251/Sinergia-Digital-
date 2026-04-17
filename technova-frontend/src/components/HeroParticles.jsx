import { Link } from 'react-router-dom';

/**
 * Solo el contenido del hero: badge, título, subtítulo y botones.
 * El fondo de partículas lo provee ParticlesBackground (position: fixed)
 * que vive en Home.jsx, por eso esta sección es completamente transparente.
 */
export default function HeroParticles() {
  return (
    <section className="relative" style={{ background: 'transparent' }}>
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center"
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* Badge */}
        <span
          className="inline-block mb-6 px-4 py-1.5 text-sm font-medium rounded-full border"
          style={{
            background:   'rgba(99,102,241,0.18)',
            borderColor:  'rgba(99,102,241,0.4)',
            color:        '#a5b4fc'
          }}
        >
          Tecnología al siguiente nivel
        </span>

        {/* Título */}
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6"
          style={{ color: '#f1f5ff' }}
        >
          Tu tienda de
          <span className="block" style={{ color: '#6366f1' }}>tecnología</span>
          favorita
        </h1>

        {/* Subtítulo */}
        <p
          className="text-lg sm:text-xl max-w-2xl mx-auto mb-10"
          style={{ color: '#94a3b8' }}
        >
          Periféricos, audio, monitores y más. Encontrá todo lo que necesitás
          para llevar tu setup al próximo nivel.
        </p>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/catalog"
            className="inline-flex items-center justify-center gap-2 font-semibold text-base
                       px-8 py-3.5 rounded-full transition-all duration-200 active:scale-95"
            style={{
              background:  '#6366f1',
              color:       '#fff',
              boxShadow:   '0 0 24px rgba(99,102,241,0.4)'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#4f46e5'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#6366f1'; }}
          >
            Ver catálogo
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>

          <Link
            to="/catalog?featured=true"
            className="inline-flex items-center justify-center font-semibold text-base
                       px-8 py-3.5 rounded-full border transition-all duration-200 active:scale-95"
            style={{
              borderColor: 'rgba(99,102,241,0.5)',
              color:       '#a5b4fc',
              background:  'rgba(99,102,241,0.08)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#6366f1';
              e.currentTarget.style.background  = 'rgba(99,102,241,0.18)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)';
              e.currentTarget.style.background  = 'rgba(99,102,241,0.08)';
            }}
          >
            Productos destacados
          </Link>
        </div>
      </div>
    </section>
  );
}
