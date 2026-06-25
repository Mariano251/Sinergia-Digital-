import { createContext, useContext, useState, useEffect, useCallback } from 'react'; // useEffect se mantiene para persistir y sincronizar con backend
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

const STORAGE_KEY = 'technova_cart';

export function CartProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();

  // Inicialización lazy: lee localStorage sincrónicamente en el primer render.
  // Evita el flash de "carrito vacío" y la race condition entre el efecto de
  // carga y el de persistencia que sobreescribía localStorage con [].
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  // Persistir en localStorage cada vez que cambia el carrito
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Agregar producto al carrito
  const addItem = useCallback((product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, {
        product_id: product.id,
        name:       product.name,
        price:      parseFloat(product.price),
        image_url:  product.image_url,
        quantity
      }];
    });
    setIsOpen(true);
    toast.success(`${product.name} agregado al carrito`);

    // Sincronizar con backend si el usuario está logueado
    if (user) {
      api.post('/cart', { product_id: product.id, quantity }).catch(() => {});
    }
  }, [user, toast]);

  // Actualizar cantidad de un item
  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.product_id !== productId));
    } else {
      setItems(prev =>
        prev.map(i =>
          i.product_id === productId ? { ...i, quantity } : i
        )
      );
    }
  }, []);

  // Eliminar un item del carrito
  const removeItem = useCallback((productId) => {
    setItems(prev => prev.filter(i => i.product_id !== productId));
    toast.info('Producto eliminado del carrito');
  }, [toast]);

  // Vaciar el carrito por completo
  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const total     = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, isOpen, setIsOpen,
      addItem, updateQuantity, removeItem, clearCart,
      total, itemCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
