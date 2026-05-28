# 📋 Testing Suite - Librería Project

Este documento describe la estrategia completa de testing para el proyecto Librería, que incluye frontend (GitHub Pages), backend (Google Apps Script) y tests end-to-end.

---

## 🏗️ Arquitectura de Testing

```
┌─────────────────────────────────────────────────────┐
│          Librería Testing Architecture               │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  UNIT TESTS (Jest)                           │   │
│  │  ✓ Validaciones de email                     │   │
│  │  ✓ Cálculos financieros                      │   │
│  │  ✓ Autenticación (localStorage)              │   │
│  │  ✓ Lógica de negocio pura                    │   │
│  │  ⏱️  Ejecución: ~2 segundos                  │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  GAS VALIDATION (Node.js)                    │   │
│  │  ✓ Validación de productos                   │   │
│  │  ✓ Lógica de ventas (sin Sheets)             │   │
│  │  ✓ Cálculos de ganancias                     │   │
│  │  ✓ Flujos de seguridad                       │   │
│  │  ⏱️  Ejecución: ~1 segundo                   │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  E2E TESTS (Playwright)                      │   │
│  │  ✓ Login flow completo                       │   │
│  │  ✓ CRUD de productos                         │   │
│  │  ✓ CRUD de ventas                            │   │
│  │  ✓ Cálculos en UI                            │   │
│  │  ⏱️  Ejecución: ~30 segundos                 │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  CI/CD (GitHub Actions)                      │   │
│  │  ✓ Tests en cada push                        │   │
│  │  ✓ PR checks automáticos                     │   │
│  │  ✓ Coverage reports                          │   │
│  │  ✓ Artifacts de reportes                     │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Instalación

```bash
# Clonar el repositorio
cd c:\xampp\htdocs\libreria

# Instalar dependencias
npm install

# Verificar que se instaló correctamente
npm --version
node --version
```

### Ejecutar Tests

```bash
# Todos los tests unitarios
npm test

# Tests unitarios en modo watch (se actualiza automáticamente)
npm run test:watch

# Tests unitarios con cobertura
npm run test:coverage

# Validación de GAS
npm run test:gas

# E2E tests con Playwright
npm run test:e2e

# E2E tests con interfaz gráfica
npm run test:e2e:ui

# Todos los tests juntos
npm run test:all
```

---

## 📊 Cobertura de Tests

### Unit Tests (Frontend)

**Archivo**: `tests/unit/validaciones.test.js`

Cubre:
- ✅ Validación de emails
- ✅ Validación de productos (nombre, precio, costo)
- ✅ Validación de ventas (cantidad, stock)
- ✅ Cálculo de ganancias

**Ejemplo de test**:
```javascript
test('debe validar productos correctos', () => {
  const producto = {
    nombre: 'Libro Test',
    precioVenta: 100,
    costoUnitario: 50
  };
  const resultado = validarProducto(producto);
  expect(resultado.valido).toBe(true);
});
```

---

**Archivo**: `tests/unit/auth.test.js`

Cubre:
- ✅ Almacenamiento de tokens en localStorage
- ✅ Recuperación de autenticación
- ✅ Logout (limpiar datos)
- ✅ Normalización de emails
- ✅ Validación de tokens

---

**Archivo**: `tests/unit/financiero.test.js`

Cubre:
- ✅ Cálculo de total de venta
- ✅ Cálculo de costo total
- ✅ Cálculo de ganancia
- ✅ Detección de pérdidas
- ✅ Porcentaje de ganancia
- ✅ Resumen mensual
- ✅ Validación de montos

---

### GAS Validation Tests

**Archivo**: `tests/gas-validation.js`

Cubre:
- ✅ Validación de productos (sin API real)
- ✅ Validación de ventas (stock insuficiente)
- ✅ Cálculos financieros
- ✅ Validación de sesiones (tokens)
- ✅ Normalización de datos
- ✅ Seguridad (dominios permitidos)
- ✅ Flujos múltiples (múltiples ventas)

**Ejecutar**:
```bash
npm run test:gas
```

**Output esperado**:
```
==================================================
GAS VALIDATION TESTS
==================================================

✓ Validar producto con datos correctos
✓ Rechazar producto sin nombre
✓ Rechazar producto con precio negativo
✓ Registrar venta válida
...
==================================================
Tests: 25/25 passed
==================================================
```

---

### E2E Tests (Playwright)

**Archivo**: `tests/e2e/auth.spec.js`

Cubre:
- ✅ Página de login se muestra correctamente
- ✅ Navegación a dashboard después de autenticación
- ✅ Persistencia de sesión
- ✅ Invalidación de sesión sin token

---

**Archivo**: `tests/e2e/productos.spec.js`

Cubre:
- ✅ Carga de lista de productos
- ✅ Formulario de agregar producto
- ✅ Validación de campos requeridos
- ✅ Búsqueda de productos
- ✅ Eliminar producto

---

**Archivo**: `tests/e2e/ventas.spec.js`

Cubre:
- ✅ Carga de página de ventas
- ✅ Tabla de ventas visible
- ✅ Crear nueva venta
- ✅ Validación de cantidad
- ✅ Cálculo de total
- ✅ Editar venta
- ✅ Eliminar venta
- ✅ Flujo completo (productos → ventas)

---

## 📈 Ver Reportes de Cobertura

```bash
# Generar reporte de cobertura
npm run test:coverage

# El reporte se genera en: coverage/lcov-report/index.html
# Abrirlo en el navegador
```

---

## 🤖 CI/CD con GitHub Actions

El archivo `.github/workflows/tests.yml` configura automáticamente:

1. **Unit Tests** - Se ejecutan en cada push
2. **GAS Validation** - Valida lógica de backend
3. **E2E Tests** - Tests contra el servidor local
4. **Coverage Reports** - Se suben a Codecov
5. **PR Comments** - Reportes automáticos en PRs

### Configuración Necesaria

Si usas GitHub:

```bash
# 1. Commitear la carpeta .github
git add .github/
git commit -m "Add CI/CD workflows"
git push origin main

# 2. Los tests se ejecutarán automáticamente en cada push
# 3. Ver reportes en: Actions tab en GitHub
```

### Variables de Entorno (Opcional)

Para E2E tests contra GAS real, crea un archivo `.env.test`:

```bash
# .env.test
VITE_GAS_URL=https://script.google.com/macros/s/YOUR_URL/exec
TEST_EMAIL=test@gmail.com
TEST_TOKEN=your-test-token
```

---

## 🧪 Ejemplos Prácticos

### Ejecutar Un Test Específico

```bash
# Solo tests de validación
npm test -- validaciones.test.js

# Solo tests de autenticación
npm test -- auth.test.js

# Solo tests financieros
npm test -- financiero.test.js
```

### Modo Watch (Desarrollo)

```bash
# Los tests se re-ejecutan automáticamente al cambiar archivos
npm run test:watch

# Presionar 'q' para salir
```

### E2E con Interfaz Gráfica

```bash
# Abre una ventana del navegador mostrando los tests
npm run test:e2e:ui

# Permite pausar, resumir, inspeccionar elementos, etc.
```

---

## 🔍 Debugging

### Agregar Logs en Unit Tests

```javascript
test('debug example', () => {
  const dato = { nombre: 'Test' };
  console.log('Valor de dato:', dato);
  expect(dato).toBeTruthy();
});
```

### Ejecutar Jest en Debug Mode

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Inspeccionar E2E Tests

```javascript
// En tests/e2e/auth.spec.js
test('debug example', async ({ page }) => {
  await page.goto('/index.html');
  
  // Pausar la ejecución
  await page.pause();
  
  // Continuar manualmente desde el navegador
});
```

---

## 📝 Escribir Nuevos Tests

### Template: Unit Test

```javascript
// tests/unit/mi-test.test.js

describe('Mi Feature', () => {
  test('debe hacer algo', () => {
    const resultado = miFunction('input');
    expect(resultado).toBe('expected output');
  });

  test('debe manejar errores', () => {
    expect(() => miFunction(null)).toThrow();
  });
});
```

### Template: E2E Test

```javascript
// tests/e2e/mi-test.spec.js

import { test, expect } from '@playwright/test';

test.describe('Mi Feature E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Setup antes de cada test
    await page.goto('/mi-pagina.html');
  });

  test('debe interactuar con la UI', async ({ page }) => {
    // Buscar elemento
    const boton = page.locator('button');
    
    // Interactuar
    await boton.click();
    
    // Verificar resultado
    const mensaje = page.locator('.mensaje');
    await expect(mensaje).toContainText('Éxito');
  });
});
```

---

## 🐛 Troubleshooting

### Error: "No se puede encontrar módulo 'jest'"

```bash
npm install
```

### Error: "Playwright no está instalado"

```bash
npm install @playwright/test
npx playwright install
```

### E2E tests se cuelgan

```bash
# Asegúrate de que el servidor está corriendo
npx http-server . -p 5500

# O ejecuta en otra terminal
npm run test:e2e
```

### Tests lentos

- Los E2E tests son naturalmente más lentos (30-60 segundos)
- Los unit tests deben ser < 5 segundos
- Si están más lentos, revisar si hay network calls reales

---

## 📊 Matrices de Cobertura

| Componente | Coverage | Tests | Tiempo |
|---|---|---|---|
| **Unit (Frontend)** | 60%+ | 25+ | ~2s |
| **GAS Validation** | 50%+ | 25+ | ~1s |
| **E2E (UI)** | 40%+ | 15+ | ~30s |
| **TOTAL** | 50%+ | 65+ | ~33s |

---

## 🚀 Próximos Pasos

1. **Mantener tests actualizado** - Agregar tests cuando se cree nueva funcionalidad
2. **Aumentar cobertura** - Meta: 80%+ en frontend
3. **Integrar Codecov** - Ver tendencias de cobertura en PRs
4. **Notifications** - Alertas en Slack/Discord para test failures
5. **Performance tests** - Medir tiempos de carga y respuesta de API

---

## 📞 Soporte

Si tienes problemas con los tests:

1. Revisa los logs en la terminal
2. Ejecuta `npm run test:gas` para validar lógica
3. Usa `npm run test:e2e:ui` para inspeccionar UI tests
4. Consulta la documentación de [Jest](https://jestjs.io/) y [Playwright](https://playwright.dev/)

---

**Última actualización**: Mayo 2026  
**Versión**: 1.0.0
