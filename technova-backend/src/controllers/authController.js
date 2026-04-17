const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Registrar un nuevo usuario
const register = async (req, res, next) => {
  try {
    const { name, email, password, telegram_chat_id } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }

    // Verificar si el email ya está registrado
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, telegram_chat_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, telegram_chat_id, created_at`,
      [name, email, passwordHash, telegram_chat_id || null]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
};

// Iniciar sesión
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        telegram_chat_id: user.telegram_chat_id
      },
      token
    });
  } catch (err) {
    next(err);
  }
};

// Obtener perfil del usuario autenticado
const getProfile = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, telegram_chat_id, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Actualizar perfil
const updateProfile = async (req, res, next) => {
  try {
    const { name, telegram_chat_id } = req.body;

    const result = await pool.query(
      `UPDATE users SET
        name = COALESCE($1, name),
        telegram_chat_id = COALESCE($2, telegram_chat_id),
        updated_at = NOW()
       WHERE id = $3
       RETURNING id, name, email, telegram_chat_id`,
      [name, telegram_chat_id, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getProfile, updateProfile };
