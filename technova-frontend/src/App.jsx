import { Routes, Route } from 'react-router-dom';
import Navbar     from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Footer     from './components/Footer';
import Home          from './pages/Home';
import Catalog       from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Checkout      from './pages/Checkout';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Profile       from './pages/Profile';
import NotFound      from './pages/NotFound';
import useAbandonedCart from './hooks/useAbandonedCart';

// Componente raíz: monta el layout y las rutas
export default function App() {
  // Hook que detecta el abandono del carrito en segundo plano
  useAbandonedCart();

  return (
    <div className="flex flex-col min-h-screen w-full" style={{ minWidth: 0 }}>
      <Navbar />
      <CartDrawer />

      <main className="flex-1">
        <Routes>
          <Route path="/"           element={<Home />} />
          <Route path="/catalog"    element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout"   element={<Checkout />} />
          <Route path="/login"      element={<Login />} />
          <Route path="/register"   element={<Register />} />
          <Route path="/profile"    element={<Profile />} />
          <Route path="*"           element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
