import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Al montar, verificar si hay sesión activa
  useEffect(() => {
    const token = localStorage.getItem('technova_token');
    const saved = localStorage.getItem('technova_user');

    if (token && saved) {
      setUser(JSON.parse(saved));
      // Verificar que el token sigue siendo válido
      api.get('/auth/profile')
        .then(({ data }) => {
          setUser(data);
          localStorage.setItem('technova_user', JSON.stringify(data));
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('technova_token', data.token);
    localStorage.setItem('technova_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password, telegram_chat_id) => {
    const { data } = await api.post('/auth/register', {
      name, email, password, telegram_chat_id
    });
    localStorage.setItem('technova_token', data.token);
    localStorage.setItem('technova_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('technova_token');
    localStorage.removeItem('technova_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
