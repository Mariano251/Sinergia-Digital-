# TechNova — Frontend

Aplicación web en React + Vite + Tailwind CSS para la tienda de tecnología TechNova. Incluye catálogo de productos, carrito de compras, checkout y el sistema de detección de carritos abandonados.

---

## Requisitos previos

- Node.js v18+
- npm
- Backend de TechNova corriendo (ver `technova-backend/README.md`)

---

## Cómo ejecutar

```bash
cd technova-frontend
npm install
npm run dev
```

La app corre en `http://localhost:5173`.

---

## Variables de entorno

Creá un archivo `.env` en la raíz de `technova-frontend/` si necesitás sobreescribir la URL del backend:

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_API_URL` | URL base de la API del backend | `http://localhost:3001/api` |

---

## Estructura del proyecto

```
technova-frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Navbar.jsx              # Barra de navegación sticky con carrito y auth
│   │   ├── Footer.jsx              # Footer con links y copyright
│   │   ├── CartDrawer.jsx          # Panel lateral del carrito (slide-in)
│   │   ├── ProductCard.jsx         # Tarjeta de producto para grillas
│   │   ├── ParticlesBackground.jsx # Canvas animado de partículas (Home)
│   │   └── HeroParticles.jsx       # Sección hero de la página de inicio
│   ├── context/
│   │   ├── AuthContext.jsx         # Contexto de autenticación (JWT en localStorage)
│   │   └── CartContext.jsx         # Contexto del carrito con persistencia en localStorage
│   ├── hooks/
│   │   └── useAbandonedCart.js     # Hook que detecta inactividad y dispara el webhook
│   ├── pages/
│   │   ├── Home.jsx                # Página de inicio con hero, categorías y destacados
│   │   ├── Catalog.jsx             # Catálogo con filtros y paginación
│   │   ├── ProductDetail.jsx       # Detalle de producto
│   │   ├── Checkout.jsx            # Formulario de checkout con simulación de MercadoPago
│   │   ├── Login.jsx               # Formulario de inicio de sesión
│   │   ├── Register.jsx            # Formulario de registro
│   │   └── NotFound.jsx            # Página 404
│   ├── services/
│   │   └── api.js                  # Cliente Axios con baseURL y token JWT automático
│   ├── App.jsx                     # Layout principal con rutas
│   ├── main.jsx                    # Entry point: providers y router
│   └── index.css                   # Estilos globales y componentes Tailwind
├── index.html
├── tailwind.config.js              # Paleta de colores TechNova
└── vite.config.js
```

---

## Cómo funciona la detección de carritos abandonados (frontend)

El hook `useAbandonedCart` (montado en `App.jsx`) monitorea el estado del carrito en tiempo real:

1. Si el usuario tiene items en el carrito, está autenticado y **no está en `/checkout`**, arranca un timer de **2 minutos**.
2. Si pasan los 2 minutos sin que navegue al checkout, el hook dispara un `POST /api/webhook/cart-abandoned` al backend.
3. Si el usuario llega al checkout antes de que venza el timer, este se cancela y se resetea.
4. Una vez enviado el webhook, no se vuelve a enviar hasta que los items del carrito cambien.

> El timer de 2 minutos es para pruebas. En producción debería ser 30 minutos (`30 * 60 * 1000` en `useAbandonedCart.js`).

---

## Métodos de pago disponibles

| Método | Comportamiento |
|---|---|
| Tarjeta de crédito | Flujo normal — orden confirmada directamente |
| Tarjeta de débito | Flujo normal — orden confirmada directamente |
| Transferencia bancaria | Flujo normal — orden confirmada directamente |
| MercadoPago | **Modo simulación** — registra la orden como `pendiente_mp` y muestra pantalla de redirección simulada |
