import { useRef, useEffect } from 'react';

// ── Constantes del efecto ────────────────────────────────────────────────────
const BG_COLOR        = '#07091a';
const PARTICLE_COLORS = ['#6366f1', '#a5b4fc', '#c8d2ff'];
const LINK_DIST       = 90;
const MOUSE_DIST      = 120;
const MAX_SPEED       = 0.3;
const AREA_PER_PART   = 6000;

const rand  = (min, max) => Math.random() * (max - min) + min;
const dist2 = (ax, ay, bx, by) => (ax - bx) ** 2 + (ay - by) ** 2;

function createParticle(w, h) {
  return {
    x:     rand(0, w),
    y:     rand(0, h),
    r:     rand(0.3, 1.8),
    vx:    rand(-MAX_SPEED, MAX_SPEED),
    vy:    rand(-MAX_SPEED, MAX_SPEED),
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]
  };
}

/**
 * Canvas de partículas fijo que cubre toda la ventana.
 * position: fixed → no participa en el flujo del documento.
 * pointer-events: none → no bloquea interacciones con el contenido encima.
 * z-index: 0 → queda por debajo de cualquier contenido con z-index ≥ 1.
 */
export default function ParticlesBackground() {
  const canvasRef = useRef(null);
  const stateRef  = useRef({ particles: [], mouse: { x: -9999, y: -9999 }, raf: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const state  = stateRef.current;

    // ── Redimensionar canvas al tamaño de la ventana ─────────────────────
    const init = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width  = w;
      canvas.height = h;

      const count = Math.floor((w * h) / AREA_PER_PART);

      if (state.particles.length === 0) {
        state.particles = Array.from({ length: count }, () => createParticle(w, h));
      } else {
        while (state.particles.length < count) state.particles.push(createParticle(w, h));
        while (state.particles.length > count) state.particles.pop();
        state.particles.forEach(p => {
          p.x = Math.min(p.x, w);
          p.y = Math.min(p.y, h);
        });
      }
    };

    // ── Loop de animación ────────────────────────────────────────────────
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const { particles, mouse } = state;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, w, h);

      const link2  = LINK_DIST  ** 2;
      const mouse2 = MOUSE_DIST ** 2;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -2)    p.x = w + 2;
        if (p.x > w + 2) p.x = -2;
        if (p.y < -2)    p.y = h + 2;
        if (p.y > h + 2) p.y = -2;
      }

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];

        // Línea al cursor
        const dm2 = dist2(a.x, a.y, mouse.x, mouse.y);
        if (dm2 < mouse2) {
          const alpha = (1 - dm2 / mouse2) * 0.7;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(165,180,252,${alpha})`;
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }

        // Líneas entre partículas cercanas
        for (let j = i + 1; j < particles.length; j++) {
          const b  = particles[j];
          const d2 = dist2(a.x, a.y, b.x, b.y);
          if (d2 < link2) {
            const alpha = (1 - d2 / link2) * 0.35;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
            ctx.lineWidth   = 0.6;
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      state.raf = requestAnimationFrame(draw);
    };

    // ── Mouse: se trackea en window porque el canvas tiene pointer-events:none ──
    // El canvas está en fixed top:0 left:0 → coordenadas = clientX/Y directamente
    const handleMouseMove  = (e) => { state.mouse.x = e.clientX; state.mouse.y = e.clientY; };
    const handleMouseLeave = ()  => { state.mouse.x = -9999;     state.mouse.y = -9999; };

    window.addEventListener('mousemove',  handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize',     init);

    init();
    draw();

    return () => {
      cancelAnimationFrame(state.raf);
      window.removeEventListener('mousemove',  handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize',     init);
      state.particles = [];
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'fixed',
        top:           0,
        left:          0,
        width:         '100vw',
        height:        '100vh',
        zIndex:        0,
        pointerEvents: 'none',
        display:       'block'
      }}
    />
  );
}
