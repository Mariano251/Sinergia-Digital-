-- ============================================================
-- TechNova - Esquema de base de datos PostgreSQL
-- Correr antes del seed: psql -U user -d technova_db -f schema.sql
-- ============================================================

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id                          SERIAL PRIMARY KEY,
  name                        VARCHAR(255) NOT NULL,
  email                       VARCHAR(255) UNIQUE NOT NULL,
  password_hash               VARCHAR(255) NOT NULL,
  telegram_chat_id            VARCHAR(100),
  role                        VARCHAR(50)  DEFAULT 'customer',
  -- Cuántas veces este usuario abandonó el carrito en el pasado.
  -- Se envía al webhook de n8n para personalizar el mensaje de recupero.
  previous_abandonment_count  INTEGER      DEFAULT 0,
  created_at                  TIMESTAMP    DEFAULT NOW(),
  updated_at                  TIMESTAMP    DEFAULT NOW()
);

-- Para bases ya creadas (CREATE TABLE IF NOT EXISTS no agrega columnas nuevas):
ALTER TABLE users ADD COLUMN IF NOT EXISTS previous_abandonment_count INTEGER DEFAULT 0;

-- Tabla de categorías de productos
CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id),
  name        VARCHAR(255)    NOT NULL,
  description TEXT,
  price       DECIMAL(12, 2)  NOT NULL,
  stock       INTEGER          DEFAULT 0,
  image_url   TEXT,
  featured    BOOLEAN          DEFAULT false,
  active      BOOLEAN          DEFAULT true,
  created_at  TIMESTAMP        DEFAULT NOW(),
  updated_at  TIMESTAMP        DEFAULT NOW()
);

-- Tabla de items del carrito
-- abandoned_notified: flag para no enviar el webhook de abandono más de una vez
CREATE TABLE IF NOT EXISTS cart_items (
  id                 SERIAL PRIMARY KEY,
  user_id            INTEGER REFERENCES users(id) ON DELETE CASCADE,
  product_id         INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity           INTEGER  NOT NULL DEFAULT 1,
  abandoned_notified BOOLEAN  DEFAULT false,
  created_at         TIMESTAMP DEFAULT NOW(),
  updated_at         TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Tabla de órdenes
CREATE TABLE IF NOT EXISTS orders (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER REFERENCES users(id),
  status           VARCHAR(50)    DEFAULT 'pending',
  total_amount     DECIMAL(12, 2) NOT NULL,
  shipping_address JSONB,
  payment_method   VARCHAR(100),
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);

-- Tabla de items de cada orden
CREATE TABLE IF NOT EXISTS order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity   INTEGER        NOT NULL,
  price      DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_products_category    ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active      ON products(active);
CREATE INDEX IF NOT EXISTS idx_cart_items_user      ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_abandoned ON cart_items(abandoned_notified, updated_at);
CREATE INDEX IF NOT EXISTS idx_orders_user          ON orders(user_id);
