/**
 * tests/unit/validaciones.test.js
 * Tests para funciones de validación
 */

// Funciones de validación exportables (extraídas de script.js)
function validarEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validarProducto(producto) {
  const tieneNombre = !!(producto.nombre && producto.nombre.trim().length > 0);
  const tienePrecio = !!(producto.precioVenta && producto.precioVenta > 0);
  const costoValido = !!(producto.costoUnitario !== undefined && producto.costoUnitario >= 0);
  
  return {
    valido: tieneNombre && tienePrecio && costoValido,
    errores: [
      !tieneNombre ? 'El nombre es requerido' : null,
      !tienePrecio ? 'El precio debe ser mayor a 0' : null,
      !costoValido ? 'El costo no puede ser negativo' : null
    ].filter(Boolean)
  };
}

function validarVenta(venta, stock) {
  return {
    valido: venta.cantidad > 0 && venta.cantidad <= stock,
    errores: [
      !venta.cantidad || venta.cantidad <= 0 ? 'La cantidad debe ser mayor a 0' : null,
      venta.cantidad > stock ? `Stock insuficiente (disponible: ${stock})` : null
    ].filter(Boolean)
  };
}

function calcularGanancia(precioVenta, costoUnitario, cantidad) {
  const total = precioVenta * cantidad;
  const costoTotal = costoUnitario * cantidad;
  return total - costoTotal;
}

// ===================== TESTS =====================

describe('Validaciones de Email', () => {
  test('debe validar emails correctos', () => {
    expect(validarEmail('usuario@ejemplo.com')).toBe(true);
    expect(validarEmail('test@gmail.com')).toBe(true);
  });

  test('debe rechazar emails inválidos', () => {
    expect(validarEmail('usuario')).toBe(false);
    expect(validarEmail('usuario@')).toBe(false);
    expect(validarEmail('@ejemplo.com')).toBe(false);
    expect(validarEmail('usuario @ejemplo.com')).toBe(false);
  });
});

describe('Validaciones de Producto', () => {
  test('debe validar productos correctos', () => {
    const producto = {
      nombre: 'Libro Test',
      precioVenta: 100,
      costoUnitario: 50
    };
    const resultado = validarProducto(producto);
    expect(resultado.valido).toBe(true);
    expect(resultado.errores).toHaveLength(0);
  });

  test('debe rechazar producto sin nombre', () => {
    const producto = {
      nombre: '',
      precioVenta: 100,
      costoUnitario: 50
    };
    const resultado = validarProducto(producto);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores).toContain('El nombre es requerido');
  });

  test('debe rechazar producto con precio 0 o negativo', () => {
    const producto = {
      nombre: 'Libro',
      precioVenta: -10,
      costoUnitario: 50
    };
    const resultado = validarProducto(producto);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores).toContain('El precio debe ser mayor a 0');
  });

  test('debe rechazar producto con costo negativo', () => {
    const producto = {
      nombre: 'Libro',
      precioVenta: 100,
      costoUnitario: -5
    };
    const resultado = validarProducto(producto);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores).toContain('El costo no puede ser negativo');
  });
});

describe('Validaciones de Venta', () => {
  test('debe validar venta con stock suficiente', () => {
    const venta = { cantidad: 5 };
    const resultado = validarVenta(venta, 10);
    expect(resultado.valido).toBe(true);
    expect(resultado.errores).toHaveLength(0);
  });

  test('debe rechazar venta con cantidad 0', () => {
    const venta = { cantidad: 0 };
    const resultado = validarVenta(venta, 10);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores).toContain('La cantidad debe ser mayor a 0');
  });

  test('debe rechazar venta con stock insuficiente', () => {
    const venta = { cantidad: 15 };
    const resultado = validarVenta(venta, 10);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores).toContain('Stock insuficiente (disponible: 10)');
  });

  test('debe rechazar venta con cantidad negativa', () => {
    const venta = { cantidad: -5 };
    const resultado = validarVenta(venta, 10);
    expect(resultado.valido).toBe(false);
    expect(resultado.errores).toContain('La cantidad debe ser mayor a 0');
  });
});

describe('Cálculo de Ganancias', () => {
  test('debe calcular ganancia correctamente', () => {
    const ganancia = calcularGanancia(100, 50, 10);
    expect(ganancia).toBe(500); // (100-50) * 10
  });

  test('debe calcular ganancia 0 si precio = costo', () => {
    const ganancia = calcularGanancia(50, 50, 10);
    expect(ganancia).toBe(0);
  });

  test('debe calcular pérdida (ganancia negativa)', () => {
    const ganancia = calcularGanancia(40, 50, 10);
    expect(ganancia).toBe(-100); // (40-50) * 10
  });

  test('debe manejar cantidades decimales', () => {
    const ganancia = calcularGanancia(100, 50, 2.5);
    expect(ganancia).toBe(125); // (100-50) * 2.5
  });
});

// Exportar para uso en otros módulos
module.exports = {
  validarEmail,
  validarProducto,
  validarVenta,
  calcularGanancia
};
