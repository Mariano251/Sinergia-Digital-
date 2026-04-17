# TechNova — Tesis Integradora

TechNova es una tienda de tecnología con un sistema automatizado de recuperación de carritos abandonados integrado con n8n, IA (Google Gemini) y notificaciones por Telegram y Email.

---

## Descripción del proyecto

El proyecto demuestra la integración de una tienda e-commerce completa con automatización inteligente mediante herramientas no-code/low-code:

- **Tienda web completa** — catálogo, carrito, checkout y autenticación de usuarios.
- **Detección automática** — cuando un usuario agrega productos y no completa la compra, el sistema lo detecta y activa el flujo de recuperación.
- **Scoring de prioridad** — n8n clasifica el carrito según su valor (ALTA / MEDIA / BAJA).
- **Mensajes personalizados con IA** — Google Gemini genera un mensaje adaptado a la prioridad y el contenido del carrito.
- **Notificación multicanal** — Telegram para prioridad alta, Email (Gmail) para media y baja.
- **Auditoría** — cada notificación queda registrada en Google Sheets.

---

## Estructura del proyecto

```
Pagina web/
├── technova-backend/    # API REST — Node.js + Express + PostgreSQL
└── technova-frontend/   # SPA — React + Vite + Tailwind CSS
```

---

## Requisitos previos

- Node.js v18+
- npm
- Cuenta en [Render](https://render.com) (para la base de datos PostgreSQL y n8n)
- Credenciales de Google (Gmail + Sheets) configuradas en n8n
- Bot de Telegram configurado en n8n

---

## Cómo ejecutar el proyecto

### Backend

```bash
cd technova-backend
npm install
npm run migrate   # Crea las tablas en la base de datos
npm run seed      # Carga categorías y productos de ejemplo
npm run dev       # Inicia el servidor en http://localhost:3001
```

### Frontend

```bash
cd technova-frontend
npm install
npm run dev       # Inicia la app en http://localhost:5173
```

---

## Variables de entorno

Creá `technova-backend/.env` con las siguientes variables:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Connection string de PostgreSQL en Render. Incluye host, usuario, contraseña y base de datos. | `postgresql://user:pass@host/dbname` |
| `PORT` | Puerto en que escucha el servidor. Si no se define, usa `3001`. | `3001` |
| `JWT_SECRET` | Clave secreta para firmar y verificar tokens JWT. Debe ser larga y aleatoria. | `mi_clave_super_secreta_123` |
| `FRONTEND_URL` | URL del frontend para configurar CORS. | `http://localhost:5173` |
| `N8N_WEBHOOK_URL` | URL del webhook de n8n que recibe los datos del carrito abandonado. | `https://n8n-sinergia.onrender.com/webhook/...` |
| `NODE_ENV` | Entorno de ejecución. | `development` |

Ejemplo de `.env` completo:

```env
DATABASE_URL=postgresql://usuario:contraseña@host.render.com:5432/technova_db
JWT_SECRET=technova_super_secreto_cambiar_en_produccion
N8N_WEBHOOK_URL=https://n8n-sinergia.onrender.com/webhook/carrito-abandonado
FRONTEND_URL=http://localhost:5173
PORT=3001
NODE_ENV=development
```

---

## Cómo acceder a n8n

- **URL:** [https://n8n-sinergia.onrender.com](https://n8n-sinergia.onrender.com)
- **Workflow:** `Sinergia Digital - Recuperación de Carritos v4 (Completo)`
- **Nota:** Render free tier hiberna los servicios inactivos. Si la primera solicitud tarda, esperá 1-2 minutos a que despierte.

---

## Cómo funciona el sistema

```
Usuario agrega al carrito
        │
        ▼
No completa el checkout
(inactivo 2 min fuera de /checkout)
        │
        ▼
useAbandonedCart (frontend)
dispara POST /api/webhook/cart-abandoned
        │
        ▼
abandonedCartService.js (backend)
detecta items con webhook_sent = false
e inactivos por más de 2 minutos
        │
        ▼
Backend envía payload a n8n
(nombre, email, telegram_chat_id, items, valor)
        │
        ▼
n8n calcula scoring de prioridad
ALTA / MEDIA / BAJA (según valor del carrito)
        │
        ▼
AI Agent (Google Gemini)
genera mensaje personalizado
        │
        ├── ALTA prioridad ──► Telegram
        └── MEDIA / BAJA ────► Gmail
                │
                ▼
        Google Sheets (auditoría)
```

Paso a paso:

1. El usuario agrega productos al carrito y llega al checkout sin confirmar.
2. El hook `useAbandonedCart` detecta 2 minutos de inactividad fuera de `/checkout` y dispara el webhook al backend.
3. El job automático `abandonedCartService.js` corre cada 5 minutos y consulta la DB buscando items con `webhook_sent = false` e inactivos más de 2 minutos.
4. El backend construye el payload con los datos del cliente y los items, y lo envía a n8n.
5. n8n valida los datos y calcula el **scoring de prioridad** según el valor del carrito.
6. Un AI Agent con **Google Gemini** genera un mensaje de recuperación personalizado.
7. La notificación se envía por el canal correspondiente:
   - **ALTA prioridad** → mensaje por **Telegram**
   - **MEDIA / BAJA prioridad** → email por **Gmail**
8. Cada notificación se registra en **Google Sheets** para auditoría.
9. Los items notificados se marcan con `webhook_sent = true` para no generar duplicados en ciclos futuros.

---

## Estructura detallada del proyecto

```
technova-backend/
├── database/
│   ├── schema.sql              # Definición de tablas
│   ├── migrate.js              # Ejecuta schema.sql contra la base de datos
│   └── seed.js                 # Carga datos iniciales (5 categorías, 8 productos)
├── src/
│   ├── config/
│   │   └── database.js         # Pool de conexiones PostgreSQL con SSL
│   ├── controllers/            # Lógica de negocio (auth, products, orders, cart, webhook)
│   ├── middleware/
│   │   ├── auth.js             # Verificación de JWT
│   │   └── errorHandler.js     # Manejo centralizado de errores
│   ├── routes/                 # Endpoints REST por entidad
│   └── services/
│       └── abandonedCartService.js  # Job automático de detección de carritos
└── server.js                   # Entry point: Express, rutas y arranque del servidor

technova-frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx              # Barra de navegación
│   │   ├── Footer.jsx              # Footer
│   │   ├── CartDrawer.jsx          # Panel lateral del carrito
│   │   ├── ProductCard.jsx         # Tarjeta de producto
│   │   ├── ParticlesBackground.jsx # Canvas animado de partículas
│   │   └── HeroParticles.jsx       # Hero de la página de inicio
│   ├── context/
│   │   ├── AuthContext.jsx         # Autenticación con JWT
│   │   └── CartContext.jsx         # Carrito con persistencia en localStorage
│   ├── hooks/
│   │   └── useAbandonedCart.js     # Detección de inactividad y disparo del webhook
│   ├── pages/                      # Home, Catalog, ProductDetail, Checkout, Login, Register
│   ├── services/
│   │   └── api.js                  # Cliente Axios con JWT automático
│   ├── App.jsx                     # Layout y rutas
│   └── main.jsx                    # Entry point con providers
└── index.html
```

---

## Endpoints principales de la API

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Registrar usuario | — |
| `POST` | `/api/auth/login` | Iniciar sesión (devuelve JWT) | — |
| `GET` | `/api/products` | Listar productos (filtros: `category`, `featured`, `search`, `page`) | — |
| `GET` | `/api/products/:id` | Detalle de producto | — |
| `GET` | `/api/categories` | Listar categorías | — |
| `GET/POST/DELETE` | `/api/cart` | Gestión del carrito | ✅ |
| `GET/POST` | `/api/orders` | Historial y creación de órdenes | ✅ |
| `POST` | `/api/webhook/cart-abandoned` | Endpoint llamado por el hook del frontend | — |
| `GET` | `/api/health` | Health check | — |

---

## Tecnologías

**Backend:** Node.js · Express · PostgreSQL · `pg` · JWT · bcrypt · Axios

**Frontend:** React 18 · Vite 5 · React Router v6 · Tailwind CSS v3 · Axios

**Automatización:** n8n · Google Gemini · Gmail · Telegram · Google Sheets
