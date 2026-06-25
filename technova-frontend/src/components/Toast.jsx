// Estilos por tipo de toast — usa la paleta de TechNova
const TYPES = {
  success: {
    border: 'border-l-tn-success',
    icon:   'text-tn-success',
    path:   'M5 13l4 4L19 7',
  },
  error: {
    border: 'border-l-tn-danger',
    icon:   'text-tn-danger',
    path:   'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  info: {
    border: 'border-l-tn-accent',
    icon:   'text-tn-accent',
    path:   'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
};

function ToastItem({ toast, onClose }) {
  const style = TYPES[toast.type] || TYPES.info;

  return (
    <div
      role="status"
      className={`card border-l-4 ${style.border} px-4 py-3 flex items-center gap-3
                  shadow-card animate-slide-in pointer-events-auto`}
    >
      <svg className={`w-5 h-5 flex-shrink-0 ${style.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={style.path} />
      </svg>
      <p className="text-sm text-tn-text flex-1">{toast.message}</p>
      <button
        onClick={onClose}
        aria-label="Cerrar notificación"
        className="text-tn-muted hover:text-tn-text transition-colors flex-shrink-0"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function ToastContainer({ toasts, onClose }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-3
                    w-[calc(100%-2rem)] max-w-sm pointer-events-none">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onClose={() => onClose(t.id)} />
      ))}
    </div>
  );
}
