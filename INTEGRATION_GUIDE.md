# 🎯 Guía de Integración de Tests - Paso a Paso

Este documento te muestra cómo **mantener y expandir** la suite de testing.

---

## 📌 1. Exportar Funciones para Testing

Tu código en `script.js` necesita funciones **exportables** para que Jest pueda testearlas.

### ✅ Cómo hacerlo

**Antes (no exportable):**
```javascript
function validarEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
// No se puede acceder desde los tests
```

**Después (exportable):**
```javascript
function validarEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Si usas módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { validarEmail };
}
```

---

## 🔄 2. Agregar Nuevos Tests

### Paso 1: Crear archivo de test

```bash
# Nuevo test para feature X
# tests/unit/mi-feature.test.js
```

### Paso 2: Escribir tests

```javascript
describe('Mi Feature', () => {
  test('debe hacer algo', () => {
    const resultado = miFunction('input');
    expect(resultado).toBe('expected');
  });

  test('debe manejar errores', () => {
    expect(() => miFunction(null)).toThrow();
  });
});
```

### Paso 3: Ejecutar

```bash
npm test                          # Todos los tests
npm test -- mi-feature.test.js    # Solo este archivo
npm run test:watch                # Watch mode (se actualiza automáticamente)
```

---

## 🧪 3. Tests Unitarios vs E2E

### Unit Tests (Rápidos - 2-5 segundos)

**Qué testear:**
- Funciones puras (validaciones, cálculos)
- Lógica sin dependencias externas
- Casos edge (bordes)

**Ejemplo:**
```javascript
test('debe calcular ganancia correctamente', () => {
  const ganancia = calcularGanancia(100, 50, 10);
  expect(ganancia).toBe(500);
});
```

### E2E Tests (Lentos - 20-60 segundos)

**Qué testear:**
- Flujos completos (login → producto → venta)
- Interacción con UI
- Integración con backend real

**Ejemplo:**
```javascript
test('debe registrar venta completa', async ({ page }) => {
  await page.goto('/productos.html');
  await page.fill('input[name="nombre"]', 'Test');
  await page.click('button:has-text("Guardar")');
  // ... verificaciones
});
```

---

## 🛠️ 4. Estructura de Tests Recomendada

### Organización de Archivos

```
tests/unit/
├── validaciones.test.js       # Emails, productos, ventas
├── auth.test.js               # Tokens, sesiones
├── financiero.test.js         # Cálculos, balances
└── [nueva-feature].test.js

tests/e2e/
├── auth.spec.js              # Login flow
├── productos.spec.js         # CRUD productos
├── ventas.spec.js            # CRUD ventas
└── [nuevo-flujo].spec.js
```

### Naming Convention

```javascript
// ✅ Bueno - describe claramente qué se testa
describe('Validación de Emails', () => {
  test('debe validar email correcto', () => { ... });
});

// ❌ Evitar - poco claro
describe('Test', () => {
  test('email', () => { ... });
});
```

---

## 📊 5. Coverage (Cobertura)

### Ver cobertura actual

```bash
npm run test:coverage
```

Abre el reporte HTML:
```
coverage/lcov-report/index.html
```

### Interpretar resultados

| Métrica | Qué significa |
|---|---|
| **% Stmts** | % de líneas ejecutadas |
| **% Branch** | % de condiciones (if/else) probadas |
| **% Funcs** | % de funciones llamadas |
| **% Lines** | % de líneas de código |

### Meta: 80%+ de cobertura

```bash
# Ver qué líneas NO están cubiertas
npm run test:coverage

# En el reporte HTML, verás en ROJO qué falta testear
```

---

## 🚀 6. Debugging Tests

### Ver logs dentro del test

```javascript
test('debug example', () => {
  const dato = { nombre: 'Test' };
  console.log('Valor:', dato);      // Aparecerá en consola
  expect(dato).toBeTruthy();
});
```

### Ejecutar un test específico

```bash
# Solo este describe
npm test -- --testNamePattern="Validaciones de Email"

# Solo este test
npm test -- --testNamePattern="debe validar emails correctos"

# Verbose mode (más detalles)
npm test -- --verbose
```

### Debug E2E

```javascript
test('debug E2E', async ({ page }) => {
  await page.goto('/index.html');
  
  // Inspeccionar elemento
  console.log(await page.locator('h1').textContent());
  
  // Pausar ejecución (se abre el navegador)
  await page.pause();
  
  // Continuar manualmente
});
```

---

## 🔌 7. Mock de GAS (Backend)

Si necesitas testear sin depender del backend real:

```javascript
// Mock de callGAS
jest.mock('script.js', () => ({
  callGAS: jest.fn().mockResolvedValue({
    success: true,
    data: { /* datos mockeados */ }
  })
}));

test('debe usar mock de GAS', async () => {
  const resultado = await callGAS('obtenerProductos');
  expect(resultado.success).toBe(true);
});
```

---

## 📈 8. Mejores Prácticas

### ✅ Hacer

```javascript
// Nombres descriptivos
test('debe rechazar email sin @ en la dirección', () => {
  expect(validarEmail('test')).toBe(false);
});

// Tests independientes
test('test 1', () => { ... });
test('test 2', () => { ... });  // No depende de test 1

// Setup y cleanup
beforeEach(() => {
  // Antes de cada test
  localStorage.clear();
});

afterEach(() => {
  // Después de cada test
  jest.clearAllMocks();
});
```

### ❌ Evitar

```javascript
// Nombres genéricos
test('test email', () => { ... });

// Tests que dependen uno del otro
test('setup', () => { globalData = {...}; });
test('usar setup', () => { expect(globalData).toBeDefined(); });

// Tests que toman demasiado tiempo
test('testear 1000 casos', async () => {
  for (let i = 0; i < 1000; i++) { ... }
});
```

---

## 🔄 9. CI/CD - Tests Automáticos

Los tests se ejecutan automáticamente en:
- **Push** a `main` o `develop`
- **Pull Request** en GitHub
- **Scheduled** (cada noche, opcional)

### Ver resultados en GitHub

1. Ir a **Actions** tab
2. Ver el workflow `Full Stack Tests`
3. Click en un run para ver detalles
4. Ver reportes en **Artifacts**

---

## 📋 10. Checklist - Agregar Funcionalidad Nueva

Cuando agregues una nueva feature:

- [ ] Escribir tests primero (TDD)
- [ ] Implementar la feature
- [ ] Verificar que tests pasen: `npm test`
- [ ] Verificar cobertura: `npm run test:coverage`
- [ ] Agregar E2E si es necesario
- [ ] Commitar todo (tests incluidos)

---

## 🎓 Ejemplos Reales

### Ejemplo 1: Test de Validación

```javascript
describe('Validar Stock', () => {
  function validarStock(cantidad, stockDisponible) {
    return cantidad > 0 && cantidad <= stockDisponible;
  }

  test('debe aceptar cantidad válida', () => {
    expect(validarStock(5, 10)).toBe(true);
  });

  test('debe rechazar cantidad 0', () => {
    expect(validarStock(0, 10)).toBe(false);
  });

  test('debe rechazar cantidad > stock', () => {
    expect(validarStock(15, 10)).toBe(false);
  });

  test('debe rechazar cantidad negativa', () => {
    expect(validarStock(-5, 10)).toBe(false);
  });
});
```

### Ejemplo 2: Test E2E de Venta

```javascript
test('debe crear venta completa', async ({ page }) => {
  // 1. Login
  await page.goto('/index.html');
  await page.fill('input[type="email"]', 'test@gmail.com');
  await page.click('button:has-text("Entrar")');

  // 2. Ir a ventas
  await page.goto('/ventas.html');

  // 3. Crear venta
  await page.selectOption('select[name="producto"]', 'PROD-1');
  await page.fill('input[name="cantidad"]', '5');
  await page.click('button:has-text("Registrar Venta")');

  // 4. Verificar éxito
  const mensaje = page.locator('.success-message');
  await expect(mensaje).toContainText('Venta registrada');
});
```

---

## 🔗 Enlaces Útiles

- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://testingjavascript.com/)

---

**¡Ahora estás listo para mantener y expandir los tests! 🚀**

Recuerda: **Buena cobertura = Menos bugs en producción**
