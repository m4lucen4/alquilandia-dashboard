// Hoist RegExp outside function to avoid recreation on every call
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida si un email tiene una estructura válida
 * @param email - Email a validar
 * @returns true si el email es válido, false en caso contrario
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;

  return EMAIL_REGEX.test(email);
};

/**
 * Obtiene el mensaje de error para un email inválido
 * @param email - Email a validar
 * @returns Mensaje de error o string vacío si es válido
 */
export const validateEmail = (email: string): string => {
  if (!email) {
    return 'El correo electrónico es requerido';
  }
  
  if (!isValidEmail(email)) {
    return 'Por favor, introduce un correo electrónico válido';
  }
  
  return '';
};

/**
 * Valida si una contraseña cumple los requisitos mínimos
 * @param password - Contraseña a validar
 * @param minLength - Longitud mínima (por defecto 6)
 * @returns Mensaje de error o string vacío si es válida
 */
export const validatePassword = (password: string, minLength: number = 6): string => {
  if (!password) {
    return 'La contraseña es requerida';
  }
  
  if (password.length < minLength) {
    return `La contraseña debe tener al menos ${minLength} caracteres`;
  }
  
  return '';
};
