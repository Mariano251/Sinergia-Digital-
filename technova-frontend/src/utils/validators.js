// Validadores reutilizables para formularios.
// Cada validador devuelve '' si es válido, o un mensaje de error si no.

export const required = (msg = 'Este campo es obligatorio') =>
  (v) => (v != null && String(v).trim() !== '' ? '' : msg);

export const email = (msg = 'Ingresá un email válido') =>
  (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim()) ? '' : msg);

export const minLength = (n, msg) =>
  (v) => (String(v).length >= n ? '' : (msg || `Debe tener al menos ${n} caracteres`));

export const digitsOnly = (msg = 'Solo se permiten números') =>
  (v) => (!v || /^\d+$/.test(String(v).trim()) ? '' : msg);

export const matches = (getOther, msg = 'Los valores no coinciden') =>
  (v) => (v === getOther() ? '' : msg);

// Corre una lista de validadores y devuelve el primer error encontrado.
export const runValidators = (validators, value) => {
  for (const fn of validators) {
    const err = fn(value);
    if (err) return err;
  }
  return '';
};
