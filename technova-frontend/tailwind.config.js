/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta de TechNova
        'tn-dark':        '#0f0f1a',
        'tn-dark-2':      '#16162a',
        'tn-card':        '#1a1a2e',
        'tn-card-hover':  '#20203a',
        'tn-border':      '#2a2a4a',
        'tn-accent':      '#4f8ef7',
        'tn-accent-dark': '#3a7ae6',
        'tn-accent-glow': 'rgba(79,142,247,0.2)',
        'tn-text':        '#e2e8f0',
        'tn-muted':       '#8892a4',
        'tn-success':     '#22c55e',
        'tn-warning':     '#f59e0b',
        'tn-danger':      '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'accent': '0 0 20px rgba(79,142,247,0.3)',
        'card':   '0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in':  'fadeIn 0.3s ease-out',
        'pop':      'pop 0.3s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%':   { transform: 'scale(0.5)' },
          '50%':  { transform: 'scale(1.25)' },
          '100%': { transform: 'scale(1)' },
        }
      }
    }
  },
  plugins: []
};
