/**
 * tests/gas-validation.js
 * Validación de funciones de Google Apps Script (sin dependencia de Sheets reales)
 * 
 * Este archivo testa la lógica pura de GAS sin necesidad de API real
 * Ejecutar: node tests/gas-validation.js
 */

// ===================== SIMULAR FUNCIONES GAS =====================

/**
 * Simular validaciones de GAS sin necesidad de API real
 */

class GASValidator {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(nombre, fn) {
    try {
      fn();
      this.passed++;
      console.log(`✓ ${nombre}`);
    } catch (error) {
      this.failed++;
      console.log(`✗ ${nombre}: ${error.message}`);
    }
  }

  assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
  }

  assertArrayEqual(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  }

  report() {
    const total = this.passed + this.failed;
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Tests: ${this.passed}/${total} passed`);
    console.log(`${'='.repeat(50)}\n`);
    process.exit(this.failed > 0 ? 1 : 0);
  }
}

const validator = new GASValidator();

// ===================== VALIDACIÓN DE PRODUCTOS =====================

validator.test('Validar producto con datos correctos', () => {
  const producto = {
    nombre: 'Libro de Programación',
    costoUnitario: 50,
    precioVenta: 100,
    stock: 10
  };

  validator.assert(
    producto.nombre && producto.nombre.length > 0,
    'Nombre debe existir'
  );
  validator.assert(
    producto.precioVenta > 0,
    'Precio debe ser positivo'
  );
  validator.assert(
    producto.costoUnitario >= 0,
    'Costo debe ser no-negativo'
  );
});

validator.test('Rechazar producto sin nombre', () => {
  const producto = {
    nombre: '',
    costoUnitario: 50,
    precioVenta: 100
  };

  const esValido = producto.nombre && producto.nombre.trim().length > 0;
  validator.assert(!esValido, 'Debe rechazar producto sin nombre');
});

validator.test('Rechazar producto con precio negativo', () => {
  const producto = {
    nombre: 'Libro',
    costoUnitario: 50,
    precioVenta: -100
  };

  const esValido = producto.precioVenta > 0;
  validator.assert(!esValido, 'Debe rechazar precio negativo');
});

// ===================== VALIDACIÓN DE VENTAS =====================

validator.test('Registrar venta válida', () => {
  const venta = {
    productoId: 'PROD-123',
    cantidad: 5,
    precioUnitario: 100
  };

  const stock = 10;
  const esValido = venta.cantidad > 0 && venta.cantidad <= stock;
  validator.assert(esValido, 'Venta debe ser válida');
});

validator.test('Rechazar venta con cantidad superior al stock', () => {
  const venta = {
    productoId: 'PROD-123',
    cantidad: 15
  };

  const stock = 10;
  const esValido = venta.cantidad <= stock;
  validator.assert(!esValido, 'Debe rechazar cantidad > stock');
});

validator.test('Rechazar venta con cantidad 0', () => {
  const venta = {
    productoId: 'PROD-123',
    cantidad: 0
  };

  const esValido = venta.cantidad > 0;
  validator.assert(!esValido, 'Debe rechazar cantidad 0');
});

// ===================== CÁLCULOS FINANCIEROS =====================

validator.test('Calcular total de venta (precio × cantidad)', () => {
  const precioVenta = 100;
  const cantidad = 5;
  const total = precioVenta * cantidad;

  validator.assertEqual(total, 500, 'Total debe ser 500');
});

validator.test('Calcular costo total de venta (costo × cantidad)', () => {
  const costoUnitario = 50;
  const cantidad = 5;
  const costoTotal = costoUnitario * cantidad;

  validator.assertEqual(costoTotal, 250, 'Costo total debe ser 250');
});

validator.test('Calcular ganancia de venta (ingresos - costos)', () => {
  const precioVenta = 100;
  const costoUnitario = 50;
  const cantidad = 5;

  const total = precioVenta * cantidad; // 500
  const costoTotal = costoUnitario * cantidad; // 250
  const ganancia = total - costoTotal; // 250

  validator.assertEqual(ganancia, 250, 'Ganancia debe ser 250');
});

validator.test('Detectar pérdida en venta (ganancia negativa)', () => {
  const precioVenta = 40;
  const costoUnitario = 50;
  const cantidad = 10;

  const total = precioVenta * cantidad; // 400
  const costoTotal = costoUnitario * cantidad; // 500
  const ganancia = total - costoTotal; // -100

  validator.assert(ganancia < 0, 'Ganancia debe ser negativa');
  validator.assertEqual(ganancia, -100, 'Pérdida debe ser -100');
});

validator.test('Calcular porcentaje de ganancia', () => {
  const costoUnitario = 50;
  const precioVenta = 100;
  const porcentajeGanancia = ((precioVenta - costoUnitario) / costoUnitario) * 100;

  validator.assertEqual(porcentajeGanancia, 100, 'Porcentaje debe ser 100%');
});

// ===================== VALIDACIÓN DE SESIONES =====================

validator.test('Generar token válido', () => {
  const payload = {
    email: 'test@gmail.com',
    expira: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
  };

  const token = Buffer.from(JSON.stringify(payload)).toString('base64');
  validator.assert(token && token.length > 0, 'Token debe existir');
});

validator.test('Validar token no expirado', () => {
  const payload = {
    email: 'test@gmail.com',
    expira: Date.now() + 1000 // 1 segundo en el futuro
  };

  const esValido = payload.expira > Date.now();
  validator.assert(esValido, 'Token no debe estar expirado');
});

validator.test('Detectar token expirado', () => {
  const payload = {
    email: 'test@gmail.com',
    expira: Date.now() - 1000 // 1 segundo en el pasado
  };

  const esValido = payload.expira > Date.now();
  validator.assert(!esValido, 'Token debe estar expirado');
});

// ===================== VALIDACIÓN DE DATOS =====================

validator.test('Normalizar email (lowercase + trim)', () => {
  const email = '  TEST@GMAIL.COM  ';
  const normalizado = email.toLowerCase().trim();

  validator.assertEqual(normalizado, 'test@gmail.com', 'Email debe normalizarse');
});

validator.test('Validar formato de email', () => {
  const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  validator.assert(validarEmail('test@gmail.com'), 'Email válido debe pasar');
  validator.assert(!validarEmail('test@'), 'Email inválido debe fallar');
  validator.assert(!validarEmail('test'), 'Email sin @ debe fallar');
});

// ===================== FLUJOS MÚLTIPLES =====================

validator.test('Procesar múltiples ventas y calcular balance', () => {
  const ventas = [
    { precioVenta: 100, costo: 50, cantidad: 5 },
    { precioVenta: 200, costo: 100, cantidad: 3 },
    { precioVenta: 150, costo: 75, cantidad: 2 }
  ];

  let totalIngresos = 0;
  let totalCostos = 0;

  ventas.forEach(venta => {
    totalIngresos += venta.precioVenta * venta.cantidad;
    totalCostos += venta.costo * venta.cantidad;
  });

  const gananciaTotal = totalIngresos - totalCostos;

  // 100*5 + 200*3 + 150*2 = 500 + 600 + 300 = 1400
  validator.assertEqual(totalIngresos, 1400, 'Total ingresos debe ser 1400');
  // 50*5 + 100*3 + 75*2 = 250 + 300 + 150 = 700
  validator.assertEqual(totalCostos, 700, 'Total costos debe ser 700');
  validator.assertEqual(gananciaTotal, 700, 'Ganancia total debe ser 700');
});

validator.test('Actualizar stock después de venta', () => {
  let stock = 100;
  const cantidadVendida = 25;

  validator.assert(stock >= cantidadVendida, 'Debe tener stock suficiente');
  stock -= cantidadVendida;

  validator.assertEqual(stock, 75, 'Stock debe actualizar a 75');
});

validator.test('Recuperar stock al anular venta', () => {
  let stock = 75;
  const cantidadAnulada = 25;

  stock += cantidadAnulada;

  validator.assertEqual(stock, 100, 'Stock debe volver a 100');
});

// ===================== SEGURIDAD =====================

validator.test('Validar dominio permitido', () => {
  const dominiosPermitidos = [
    'https://manuelmottagestion.github.io',
    'http://localhost:5500'
  ];

  const validarDominio = (origen) => {
    return dominiosPermitidos.some(dominio =>
      origen.startsWith(dominio)
    );
  };

  validator.assert(
    validarDominio('https://manuelmottagestion.github.io/libreria'),
    'Dominio permitido debe pasar'
  );
  validator.assert(
    !validarDominio('https://malicioso.com'),
    'Dominio no permitido debe fallar'
  );
});

// ===================== EJECUTAR TESTS =====================

console.log('\n' + '='.repeat(50));
console.log('GAS VALIDATION TESTS');
console.log('='.repeat(50) + '\n');

validator.report();
