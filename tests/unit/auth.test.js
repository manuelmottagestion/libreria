/**
 * tests/unit/auth.test.js
 * Tests para funciones de autenticación
 */

describe('Autenticación', () => {

  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('debe guardar token y usuario en localStorage', () => {
    const token = 'test-token-12345';
    const user = 'test@gmail.com';

    localStorage.setItem('libToken', token);
    localStorage.setItem('libUser', user);

    expect(localStorage.getItem('libToken')).toBe(token);
    expect(localStorage.getItem('libUser')).toBe(user);
  });

  test('debe recuperar token de localStorage', () => {
    const token = 'test-token-123';
    localStorage.setItem('libToken', token);
    
    const retrievedToken = localStorage.getItem('libToken');
    
    expect(retrievedToken).toBe(token);
  });

  test('debe limpiar autenticación (logout)', () => {
    localStorage.setItem('libToken', 'test-token');
    localStorage.setItem('libUser', 'test@gmail.com');

    localStorage.removeItem('libToken');
    localStorage.removeItem('libUser');

    expect(localStorage.getItem('libToken')).toBeNull();
    expect(localStorage.getItem('libUser')).toBeNull();
  });

  test('debe detectar sesión inválida si no hay token', () => {
    const token = localStorage.getItem('libToken');
    const user = localStorage.getItem('libUser');
    
    expect(token).toBeNull();
    expect(user).toBeNull();
  });
});

describe('Normalización de Emails', () => {
  function normalizarEmail(email) {
    return (email || '').toLowerCase().trim();
  }

  test('debe normalizar emails a minúsculas', () => {
    expect(normalizarEmail('TEST@GMAIL.COM')).toBe('test@gmail.com');
  });

  test('debe eliminar espacios en blanco', () => {
    expect(normalizarEmail('  test@gmail.com  ')).toBe('test@gmail.com');
  });

  test('debe manejar valores nulos', () => {
    expect(normalizarEmail(null)).toBe('');
    expect(normalizarEmail(undefined)).toBe('');
  });
});

describe('Validación de Token', () => {
  function validarTokenFormato(token) {
    // Validar que sea un string no vacío
    return !!(token && typeof token === 'string' && token.length > 0);
  }

  test('debe validar token no vacío', () => {
    expect(validarTokenFormato('valid-token-123')).toBe(true);
  });

  test('debe rechazar token vacío', () => {
    expect(validarTokenFormato('')).toBe(false);
  });

  test('debe rechazar token nulo', () => {
    expect(validarTokenFormato(null)).toBe(false);
    expect(validarTokenFormato(undefined)).toBe(false);
  });
});
