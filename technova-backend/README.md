# TechNova — Backend

API REST en Node.js + Express para la tienda de tecnología TechNova, con sistema automatizado de recuperación de carritos abandonados integrado con n8n, IA (Google Gemini) y notificaciones por Telegram y Email.

---

## Requisitos previos

- Node.js v18+
- npm
- Cuenta en [Render](https://render.com) (PostgreSQL + n8n)
- Archivo `.env` configurado (ver sección de variables de entorno)

---

## Cómo ejecutar

```bash
cd technova-backend
npm install
npm run migrate   # Crea las tablas en la base de datos
npm run seed      # Carga categorías y productos de ejemplo
npm run dev       # Inicia el servidor con hot-reload
```

El servidor corre en `http://localhost:3001`.

---

## Variables de entorno

Creá un archivo `.env` en la raíz de `technova-backend/` con las siguientes variables:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Connection string de PostgreSQL (Render). Incluye host, usuario, contraseña y nombre de la base. | `postgresql://user:pass@host/dbname` |
| `PORT` | Puerto en que escucha el servidor. Si no se define, usa `3001`. | `3001` |
| `JWT_SECRET` | Clave secreta para firmar y verificar tokens JWT de autenticación. Debe ser larga y aleatoria. | `mi_clave_super_secreta_123` |
| `FRONTEND_URL` | URL del frontend, usada para configurar CORS. En producción es la URL de Render/Vercel. | `http://localhost:5173` |
| `N8N_WEBHOOK_URL` | URL del webhook de n8n que recibe los datos del carrito abandonado para procesarlos con IA. | `https://n8n-sinergia.onrender.com/webhook/...` |

---

## Cómo acceder a n8n

- **URL:** [https://n8n-sinergia.onrender.com](https://n8n-sinergia.onrender.com)
- **Workflow:** `Sinergia Digital - Recuperación de Carritos v4 (Completo)`
- **Nota:** Render free tier hiberna los servicios inactivos. Si la primera solicitud tarda, esperá 1-2 minutos a que despierte.

---

## Cómo funciona el sistema de carritos abandonados

1. El usuario agrega productos al carrito y navega al checkout sin confirmar la compra.
2. El hook `useAbandonedCart` en el frontend detecta 2 minutos de inactividad fuera de `/checkout` y dispara un webhook al backend.
3. El job automático `abandonedCartService.js` corre cada 5 minutos y consulta la base de datos buscando items con `webhook_sent = false` e `updated_at` mayor a 2 minutos.
4. El backend construye el payload con los datos del cliente y los items del carrito, y lo envía a n8n.
5. n8n valida los datos y calcula un **scoring de prioridad** según el valor del carrito:
   - **ALTA** — carrito de alto valor
   - **MEDIA** — carrito de valor intermedio
   - **BAJA** — carrito de bajo valor
6. Un AI Agent con **Google Gemini** genera un mensaje de recuperación personalizado según la prioridad.
7. La notificación se envía por el canal correspondiente:
   - **ALTA prioridad** → mensaje por **Telegram**
   - **MEDIA / BAJA prioridad** → email por **Gmail**
8. Cada notificación se registra en **Google Sheets** para auditoría y seguimiento.
9. Los items notificados se marcan con `webhook_sent = true` para no generar duplicados.

---

## Estructura del proyecto

```
technova-backend/
├── database/
│   ├── schema.sql          # Definición de tablas (users, products, orders, cart_items, etc.)
│   ├── migrate.js          # Script que ejecuta schema.sql contra la base de datos
│   └── seed.js             # Script que carga datos iniciales (5 categorías, 8 productos)
├── src/
│   ├── config/
│   │   └── database.js     # Configuración del pool de conexiones PostgreSQL con SSL
│   ├── controllers/        # Lógica de negocio por entidad (auth, products, orders, cart, webhook)
│   ├── middleware/
│   │   ├── auth.js         # Middleware de verificación de JWT
│   │   └── errorHandler.js # Manejo centralizado de errores
│   ├── routes/             # Definición de endpoints REST por entidad
│   └── services/
│       └── abandonedCartService.js  # Job automático de detección y notificación de carritos
└── server.js               # Entry point: configura Express, rutas y arranca el servidor
```

---

## Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/auth/register` | Registrar usuario |
| `POST` | `/api/auth/login` | Iniciar sesión (devuelve JWT) |
| `GET` | `/api/products` | Listar productos (soporta filtros y paginación) |
| `GET` | `/api/categories` | Listar categorías |
| `GET/POST/DELETE` | `/api/cart` | Gestión del carrito (requiere auth) |
| `GET/POST` | `/api/orders` | Historial y creación de órdenes (requiere auth) |
| `POST` | `/api/webhook/cart-abandoned` | Endpoint interno llamado por el frontend |
| `GET` | `/api/health` | Health check del servidor |
