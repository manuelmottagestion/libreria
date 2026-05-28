/**
 * tests/unit/financiero.test.js
 * Tests para cálculos financieros
 */

describe('Cálculos Financieros', () => {
  
  function calcularTotalVenta(precioUnitario, cantidad) {
    return precioUnitario * cantidad;
  }

  function calcularCostoTotal(costoUnitario, cantidad) {
    return costoUnitario * cantidad;
  }

  function calcularGananciaVenta(precioVenta, costoUnitario, cantidad) {
    const total = calcularTotalVenta(precioVenta, cantidad);
    const costo = calcularCostoTotal(costoUnitario, cantidad);
    return total - costo;
  }

  function calcularPorcentajeGanancia(precioVenta, costoUnitario) {
    if (costoUnitario === 0) return 0;
    return ((precioVenta - costoUnitario) / costoUnitario) * 100;
  }

  test('debe calcular total de venta correctamente', () => {
    expect(calcularTotalVenta(100, 5)).toBe(500);
    expect(calcularTotalVenta(50.5, 10)).toBe(505);
  });

  test('debe calcular costo total correctamente', () => {
    expect(calcularCostoTotal(50, 10)).toBe(500);
    expect(calcularCostoTotal(25.5, 4)).toBe(102);
  });

  test('debe calcular ganancia de venta correctamente', () => {
    expect(calcularGananciaVenta(100, 50, 10)).toBe(500); // (100*10) - (50*10)
    expect(calcularGananciaVenta(80, 60, 5)).toBe(100);   // (80*5) - (60*5)
  });

  test('debe detectar pérdidas en ventas', () => {
    const ganancia = calcularGananciaVenta(40, 50, 10);
    expect(ganancia).toBeLessThan(0);
    expect(ganancia).toBe(-100);
  });

  test('debe calcular porcentaje de ganancia', () => {
    expect(calcularPorcentajeGanancia(100, 50)).toBe(100); // 100% de ganancia
    expect(calcularPorcentajeGanancia(60, 50)).toBe(20);   // 20% de ganancia
    expect(calcularPorcentajeGanancia(150, 100)).toBe(50); // 50% de ganancia
  });

  test('debe manejar porcentaje de ganancia con costo 0', () => {
    expect(calcularPorcentajeGanancia(100, 0)).toBe(0);
  });

  test('debe calcular balance correctamente', () => {
    const ingresos = 1000;
    const egresos = 600;
    const balance = ingresos - egresos;
    expect(balance).toBe(400);
  });

  test('debe sumar múltiples ventas', () => {
    const ventas = [
      { total: 100, costo: 50 },
      { total: 200, costo: 100 },
      { total: 150, costo: 75 }
    ];
    const totalIngresos = ventas.reduce((sum, v) => sum + v.total, 0);
    const totalCostos = ventas.reduce((sum, v) => sum + v.costo, 0);
    const totalGanancia = totalIngresos - totalCostos;
    
    expect(totalIngresos).toBe(450);
    expect(totalCostos).toBe(225);
    expect(totalGanancia).toBe(225);
  });

  test('debe calcular resumen mensual', () => {
    const movimientos = [
      { tipo: 'ingreso', monto: 500, fecha: '2026-05-01' },
      { tipo: 'egreso', monto: 200, fecha: '2026-05-05' },
      { tipo: 'ingreso', monto: 300, fecha: '2026-05-10' },
      { tipo: 'egreso', monto: 100, fecha: '2026-05-15' }
    ];

    const ingresos = movimientos
      .filter(m => m.tipo === 'ingreso')
      .reduce((sum, m) => sum + m.monto, 0);
    
    const egresos = movimientos
      .filter(m => m.tipo === 'egreso')
      .reduce((sum, m) => sum + m.monto, 0);
    
    const balance = ingresos - egresos;

    expect(ingresos).toBe(800);
    expect(egresos).toBe(300);
    expect(balance).toBe(500);
  });
});

describe('Validación de Montos', () => {
  
  function validarMonto(monto) {
    return monto > 0 && typeof monto === 'number' && !isNaN(monto);
  }

  test('debe validar montos positivos', () => {
    expect(validarMonto(100)).toBe(true);
    expect(validarMonto(0.01)).toBe(true);
    expect(validarMonto(1000000)).toBe(true);
  });

  test('debe rechazar montos 0 o negativos', () => {
    expect(validarMonto(0)).toBe(false);
    expect(validarMonto(-100)).toBe(false);
  });

  test('debe rechazar valores no numéricos', () => {
    expect(validarMonto('100')).toBe(false);
    expect(validarMonto(null)).toBe(false);
    expect(validarMonto(undefined)).toBe(false);
  });

  test('debe rechazar NaN', () => {
    expect(validarMonto(NaN)).toBe(false);
  });
});
