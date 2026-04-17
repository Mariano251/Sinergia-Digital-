require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { setupAbandonedCartJob } = require('./src/services/abandonedCartService');

const app = express();

// ── Middlewares globales ────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// ── Rutas de la API ────────────────────────────────────────────────────────
app.use('/api/auth',       require('./src/routes/auth'));
app.use('/api/products',   require('./src/routes/products'));
app.use('/api/categories', require('./src/routes/categories'));
app.use('/api/cart',       require('./src/routes/cart'));
app.use('/api/orders',     require('./src/routes/orders'));
app.use('/api/webhook',    require('./src/routes/webhook'));

// Endpoint de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Manejo de errores ──────────────────────────────────────────────────────
app.use(require('./src/middleware/errorHandler'));

// ── Inicio del servidor ────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor TechNova corriendo en http://localhost:${PORT}`);
  // Iniciar el job que detecta carritos abandonados cada 5 minutos
  setupAbandonedCartJob();
});
