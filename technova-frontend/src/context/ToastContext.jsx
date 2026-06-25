import { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer from '../components/Toast';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const push = useCallback((type, message, duration = 3000) => {
    const id = ++idCounter;
    setToasts(prev => [...prev, { id, type, message }]);
    if (duration) setTimeout(() => remove(id), duration);
    return id;
  }, [remove]);

  // API estable: toast.success / toast.error / toast.info
  const toast = {
    success: (message, duration) => push('success', message, duration),
    error:   (message, duration) => push('error',   message, duration),
    info:    (message, duration) => push('info',    message, duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onClose={remove} />
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
