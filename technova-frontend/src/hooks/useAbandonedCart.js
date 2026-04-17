import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// 2 minutos en milisegundos (modo prueba — cambiar a 30 * 60 * 1000 en producción)
const ABANDON_TIMEOUT_MS = 2 * 60 * 1000;

/**
 * Hook que detecta el abandono del carrito:
 * - El usuario tiene items en el carrito
 * - Está autenticado (necesitamos su email/telegram para el webhook)
 * - Está fuera de /checkout
 * - Pasaron 30 minutos sin volver a /checkout
 */
export default function useAbandonedCart() {
  const { items, itemCount } = useCart();
  const { user }             = useAuth();
  const { pathname }         = useLocation();
  const timerRef             = useRef(null);
  const notifiedRef          = useRef(false);

  useEffect(() => {
    const isOnCheckout = pathname === '/checkout';

    // Si llega al checkout, resetear todo
    if (isOnCheckout) {
      if (timerRef.current) clearTimeout(timerRef.current);
      notifiedRef.current = false;
      return;
    }

    // Solo aplica si hay items y usuario autenticado
    if (!user || itemCount === 0) {
      if (timerRef.current) clearTimeout(timerRef.current);
      notifiedRef.current = false;
      return;
    }

    // Si ya notificamos, no volver a hacerlo hasta que cambien los items
    if (notifiedRef.current) return;

    // Limpiar timer anterior y arrancar uno nuevo
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      if (notifiedRef.current) return;
      notifiedRef.current = true;

      try {
        console.log('[AbandonedCart] Disparando webhook de carrito abandonado...');
        await api.post('/webhook/cart-abandoned', { user_id: user.id });
        console.log('[AbandonedCart] Webhook enviado correctamente');
      } catch (err) {
        console.warn('[AbandonedCart] No se pudo enviar el webhook:', err.message);
      }
    }, ABANDON_TIMEOUT_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [items, itemCount, user, pathname]);
}
