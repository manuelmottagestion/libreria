// tests/setup.js - Setup inicial para Jest
// Mock de CONFIG global
global.CONFIG = {
  GAS_URL: 'https://script.google.com/macros/s/test-url/exec'
};

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock de funciones globales
global.fetch = jest.fn();

// Helper para limpiar mocks después de cada test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
});
