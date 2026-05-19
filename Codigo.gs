te adjunto el código actualizado de archivo que está en el backend en google apps script y los archivos del frontend en github pages, todo los códigos están en el archivo prompt_precargado.txt

Archivos del frontend (en github):
- config.js
- dashboard.html
- finanzas.html
- index.html
- productos.html
- script.js
- style.css
- ventas.html
Archivos del backend (en google apps script):
- Codigo.gs


// =====================================================
// LIBRERÍA SYSTEM - BACKEND (Google Apps Script)
// =====================================================
// CONFIGURACIÓN INICIAL:
// 1. Ve a https://script.google.com/create
// 2. Pega este código
// 3. Haz clic en "Desplegar" → "Nuevo despliegue"
// 4. Tipo: "Aplicación web"
// 5. Ejecutar como: "Yo" (tu cuenta)
// 6. Quién tiene acceso: "Cualquier persona con cuenta de Google"
// 7. Copia la URL que te da (ej: https://script.google.com/macros/s/.../exec)
// =====================================================

// Configuración de seguridad - SOLO PERMITIR ESTOS DOMINIOS
const DOMINIOS_PERMITIDOS = [
  "https://manuelmottagestion.github.io",
  "https://manuelmottagestion.github.io/libreria",
  "http://localhost:5500/",  // Para pruebas locales
  "http://127.0.0.1:5500/"
];

// ID del Google Sheet
const SPREADSHEET_ID = "1RhEZN4M8laejkuFzsiGdhivJ5NxGJ88DWr_Un2MTau4";

// Nombres de las hojas
const HOJAS = {
  PRODUCTOS: "Productos",
  VENTAS: "Ventas",
  REGISTRO_SESIONES: "RegistroSesiones",
  FINANZAS: "Finanzas"
};

// =====================================================
// FUNCIÓN PRINCIPAL - Maneja todas las peticiones
// =====================================================
function doPost(e) {
  return manejarPeticion(e);
}

/*function doGet(e) {
  return manejarPeticion(e);
}*/

function manejarPeticion(e) {
  // 1. VERIFICAR DOMINIO (lista blanca)
  const origen = e ? (e.parameter.origin || e.header?.origin || "") : "";
  const referer = e?.header?.["Referer"] || "";
  const esDominioPermitido = DOMINIOS_PERMITIDOS.some(dominio => 
    origen.startsWith(dominio) || referer.startsWith(dominio)
  );
  
  if (!esDominioPermitido && !origen.includes("localhost")) {
    return respuestaError("Acceso denegado: dominio no autorizado", 403);
  }
  
  // 2. VERIFICAR AUTENTICACIÓN (token de sesión)
  const token = e?.parameter?.token || "";
  const emailUsuario = validarTokenYObtenerEmail(token);
  
  if (!emailUsuario) {
    return respuestaError("No autorizado: debes iniciar sesión", 401);
  }
  
  // 3. REGISTRAR LA ACCIÓN
  registrarSesion(emailUsuario, e?.parameter?.accion || "consulta");
  
  // 4. PROCESAR LA ACCIÓN SOLICITADA
  const accion = e?.parameter?.accion || "";
  const datos = e?.parameter?.datos ? JSON.parse(e.parameter.datos) : {};
  
  try {
    switch(accion) {
      case "obtenerProductos":
        return respuestaExito(obtenerProductos());
      case "guardarProducto":
        return respuestaExito(guardarProducto(datos, emailUsuario));
      case "eliminarProducto":
        return respuestaExito(eliminarProducto(datos.id));
      case "registrarVenta":
        return respuestaExito(registrarVenta(datos, emailUsuario));
      case "obtenerVentas":
        return respuestaExito(obtenerVentas());
      case "obtenerFinanzas":
        return respuestaExito(obtenerFinanzas());
      case "verificarSesion":
        return respuestaExito({ email: emailUsuario });
      case "login":
        return respuestaExito(verificarLogin(datos.email));
      default:
        return respuestaError("Acción no válida", 400);
    }
  } catch(error) {
    return respuestaError(error.toString(), 500);
  }
}

// =====================================================
// FUNCIONES DE SEGURIDAD
// =====================================================
function validarTokenYObtenerEmail(token) {
  if (!token) return null;
  
  try {
    // Decodificar token en base64
    const datos = JSON.parse(Utilities.base64Decode(token, true));
    if (datos.expira > Date.now()) {
      return datos.email;
    }
  } catch(e) {}
  return null;
}

function generarToken(email) {
  const payload = {
    email: email,
    expira: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
  };
  return Utilities.base64Encode(JSON.stringify(payload));
}

function registrarSesion(email, accion) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let hoja = ss.getSheetByName(HOJAS.REGISTRO_SESIONES);
  
  if (!hoja) {
    hoja = ss.insertSheet(HOJAS.REGISTRO_SESIONES);
    hoja.appendRow(["Fecha", "Email", "Acción", "IP"]);
  }
  
  hoja.appendRow([new Date().toISOString(), email, accion, "registrado"]);
}

// =====================================================
// CRUD DE PRODUCTOS (con gestión de lotes)
// =====================================================
function obtenerProductos() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let hoja = ss.getSheetByName(HOJAS.PRODUCTOS);
  
  if (!hoja) {
    hoja = ss.insertSheet(HOJAS.PRODUCTOS);
    hoja.appendRow(["ID", "Nombre", "CostoUnitario", "PrecioVenta", "Stock", "FechaCompra", "EsLote", "LoteCantidad", "LoteCostoTotal", "Proveedor", "FechaCarga"]);
    return [];
  }
  
  const datos = hoja.getDataRange().getValues();
  const productos = [];
  
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][0]) { // Si tiene ID
      productos.push({
        id: datos[i][0],
        nombre: datos[i][1],
        costoUnitario: datos[i][2],
        precioVenta: datos[i][3],
        stock: datos[i][4],
        fechaCompra: datos[i][5],
        esLote: datos[i][6],
        loteCantidad: datos[i][7],
        loteCostoTotal: datos[i][8],
        proveedor: datos[i][9],
        fechaCarga: datos[i][10]
      });
    }
  }
  return productos;
}

function guardarProducto(producto, emailUsuario) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let hoja = ss.getSheetByName(HOJAS.PRODUCTOS);
  
  if (!hoja) {
    hoja = ss.insertSheet(HOJAS.PRODUCTOS);
    hoja.appendRow(["ID", "Nombre", "CostoUnitario", "PrecioVenta", "Stock", "FechaCompra", "EsLote", "LoteCantidad", "LoteCostoTotal", "Proveedor", "FechaCarga"]);
  }
  
  // Generar ID si no existe
  if (!producto.id || producto.id === "") {
    producto.id = "PROD-" + Date.now();
  }
  
  producto.fechaCarga = new Date().toISOString();
  
  // Buscar si ya existe
  const datos = hoja.getDataRange().getValues();
  let filaExistente = -1;
  
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][0] === producto.id) {
      filaExistente = i + 1;
      break;
    }
  }
  
  const nuevaFila = [
    producto.id,
    producto.nombre,
    producto.costoUnitario || 0,
    producto.precioVenta || 0,
    producto.stock || 0,
    producto.fechaCompra || "",
    producto.esLote || false,
    producto.loteCantidad || 0,
    producto.loteCostoTotal || 0,
    producto.proveedor || "",
    producto.fechaCarga
  ];
  
  if (filaExistente > 0) {
    hoja.getRange(filaExistente, 1, 1, nuevaFila.length).setValues([nuevaFila]);
  } else {
    hoja.appendRow(nuevaFila);
  }
  
  // Registrar en finanzas si es compra nueva
  if (filaExistente === -1 && producto.costoUnitario > 0) {
    registrarMovimientoFinanciero({
      tipo: "egreso",
      concepto: `Compra: ${producto.nombre}`,
      monto: producto.esLote ? producto.loteCostoTotal : producto.costoUnitario * producto.stock,
      fecha: new Date().toISOString(),
      usuario: emailUsuario
    });
  }
  
  return { success: true, id: producto.id };
}

function eliminarProducto(id) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const hoja = ss.getSheetByName(HOJAS.PRODUCTOS);
  if (!hoja) return false;
  
  const datos = hoja.getDataRange().getValues();
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][0] === id) {
      hoja.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

// =====================================================
// REGISTRO DE VENTAS
// =====================================================
function registrarVenta(venta, emailUsuario) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let hoja = ss.getSheetByName(HOJAS.VENTAS);
  
  if (!hoja) {
    hoja = ss.insertSheet(HOJAS.VENTAS);
    hoja.appendRow(["ID", "ProductoID", "ProductoNombre", "Cantidad", "PrecioUnitario", "Total", "Ganancia", "Fecha", "Cliente", "Usuario"]);
  }
  
  // Obtener producto para calcular ganancia
  const productos = obtenerProductos();
  const producto = productos.find(p => p.id === venta.productoId);
  
  if (!producto) throw new Error("Producto no encontrado");
  if (producto.stock < venta.cantidad) throw new Error("Stock insuficiente");
  
  const total = venta.cantidad * (producto.precioVenta || venta.precioUnitario);
  const costoTotal = venta.cantidad * producto.costoUnitario;
  const ganancia = total - costoTotal;
  
  // Registrar venta
  hoja.appendRow([
    Date.now().toString(),
    venta.productoId,
    producto.nombre,
    venta.cantidad,
    producto.precioVenta,
    total,
    ganancia,
    new Date().toISOString(),
    venta.cliente || "Mostrador",
    emailUsuario
  ]);
  
  // Actualizar stock
  producto.stock -= venta.cantidad;
  guardarProducto(producto, emailUsuario);
  
  // Registrar en finanzas
  registrarMovimientoFinanciero({
    tipo: "ingreso",
    concepto: `Venta: ${producto.nombre} x${venta.cantidad}`,
    monto: total,
    fecha: new Date().toISOString(),
    usuario: emailUsuario
  });
  
  return { success: true, total, ganancia };
}

function obtenerVentas() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const hoja = ss.getSheetByName(HOJAS.VENTAS);
  
  if (!hoja) return [];
  
  const datos = hoja.getDataRange().getValues();
  const ventas = [];
  
  for (let i = 1; i < datos.length; i++) {
    ventas.push({
      id: datos[i][0],
      productoId: datos[i][1],
      productoNombre: datos[i][2],
      cantidad: datos[i][3],
      precioUnitario: datos[i][4],
      total: datos[i][5],
      ganancia: datos[i][6],
      fecha: datos[i][7],
      cliente: datos[i][8],
      usuario: datos[i][9]
    });
  }
  return ventas;
}

// =====================================================
// FINANZAS Y CONTROL DE CAPITAL
// =====================================================
function registrarMovimientoFinanciero(movimiento) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let hoja = ss.getSheetByName(HOJAS.FINANZAS);
  
  if (!hoja) {
    hoja = ss.insertSheet(HOJAS.FINANZAS);
    hoja.appendRow(["Fecha", "Tipo", "Concepto", "Monto", "Usuario", "BalanceActual"]);
  }
  
  // Calcular balance actual
  const datos = hoja.getDataRange().getValues();
  let balanceAnterior = 0;
  if (datos.length > 1) {
    balanceAnterior = datos[datos.length - 1][5] || 0;
  }
  
  const nuevoBalance = movimiento.tipo === "ingreso" 
    ? balanceAnterior + movimiento.monto 
    : balanceAnterior - movimiento.monto;
  
  hoja.appendRow([
    movimiento.fecha,
    movimiento.tipo,
    movimiento.concepto,
    movimiento.monto,
    movimiento.usuario,
    nuevoBalance
  ]);
}

function obtenerFinanzas() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const hoja = ss.getSheetByName(HOJAS.FINANZAS);
  
  if (!hoja) {
    return { totalIngresos: 0, totalEgresos: 0, balance: 0, movimientos: [] };
  }
  
  const datos = hoja.getDataRange().getValues();
  let totalIngresos = 0;
  let totalEgresos = 0;
  const movimientos = [];
  
  for (let i = 1; i < datos.length; i++) {
    const tipo = datos[i][1];
    const monto = datos[i][3];
    
    if (tipo === "ingreso") {
      totalIngresos += monto;
    } else {
      totalEgresos += monto;
    }
    
    movimientos.push({
      fecha: datos[i][0],
      tipo: tipo,
      concepto: datos[i][2],
      monto: monto,
      usuario: datos[i][4],
      balance: datos[i][5]
    });
  }
  
  return {
    totalIngresos,
    totalEgresos,
    balance: totalIngresos - totalEgresos,
    movimientos: movimientos.reverse() // Más recientes primero
  };
}

// =====================================================
// FUNCIONES AUXILIARES
// =====================================================
function respuestaExito(datos) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, data: datos }))
    .setMimeType(ContentService.MimeType.JSON);
}

function respuestaError(mensaje, codigo = 400) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: false, error: mensaje }))
    .setMimeType(ContentService.MimeType.JSON);
}

// =====================================================
// LOGIN SIMPLE - VERIFICACIÓN POR LISTA BLANCA
// =====================================================

function verificarLogin(email) {
  // 1. Abrir la hoja de usuarios permitidos
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let hoja = ss.getSheetByName("UsuariosPermitidos");
  
  // Si no existe, crearla
  if (!hoja) {
    hoja = ss.insertSheet("UsuariosPermitidos");
    hoja.appendRow(["Email", "Nombre", "Rol", "FechaAlta"]);
    // Agregar un usuario por defecto (vos)
    hoja.appendRow(["manuelmottalibreria@gmail.com", "Administrador", "admin", new Date().toISOString()]);
  }
  
  // 2. Buscar el email en la lista
  const datos = hoja.getDataRange().getValues();
  let usuarioEncontrado = null;
  
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][0] === email) {
      usuarioEncontrado = {
        email: datos[i][0],
        nombre: datos[i][1],
        rol: datos[i][2]
      };
      break;
    }
  }
  
  // 3. Si está permitido, generar token y registrar sesión
  if (usuarioEncontrado) {
    const token = generarTokenSimple(email);
    registrarSesion(email, "login");
    return { 
      success: true,
      data: {
        token: token, 
        usuario: usuarioEncontrado,
        rol: usuarioEncontrado.rol
      }
    };
  } else {
    return { success: false, error: "Email no autorizado" };
  }
}

function generarTokenSimple(email) {
  const payload = {
    email: email,
    expira: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
  };
  return Utilities.base64Encode(JSON.stringify(payload));
}

// Función para inicializar el spreadsheet (ejecutar una vez)
function inicializarBaseDeDatos() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Crear todas las hojas
  const hojasNecesarias = [HOJAS.PRODUCTOS, HOJAS.VENTAS, HOJAS.REGISTRO_SESIONES, HOJAS.FINANZAS];
  
  hojasNecesarias.forEach(nombreHoja => {
    let hoja = ss.getSheetByName(nombreHoja);
    if (!hoja) {
      hoja = ss.insertSheet(nombreHoja);
    }
  });
  
  Logger.log("Base de datos inicializada correctamente");
}

// =====================================================
// SOPORTE PARA JSONP (para evitar CORS)
// =====================================================
function doGet(e) {
  return manejarPeticionJSONP(e);
}

function manejarPeticionJSONP(e) {
  const origen = e?.parameter?.origin || e?.header?.origin || "";
  const referer = e?.parameter?.referer || e?.header?.["Referer"] || "";
  const callback = e?.parameter?.callback || "callback";

  const normalizar = (url) => (url || "").replace(/\/+$/, "");

  const esDominioPermitido = DOMINIOS_PERMITIDOS.some(dominio =>
    normalizar(origen).startsWith(normalizar(dominio)) ||
    normalizar(referer).startsWith(normalizar(dominio))
  );

  if (!esDominioPermitido && !origen.includes("localhost")) {
    const output = `${callback}(${JSON.stringify({ success: false, error: "Dominio no autorizado" })})`;
    return ContentService
      .createTextOutput(output)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  const accion = e?.parameter?.accion || "";
  const token = e?.parameter?.token || "";
  const datos = e?.parameter?.datos ? JSON.parse(e.parameter.datos) : {};
  const emailUsuario = validarTokenYObtenerEmail(token);

  let resultado;

  try {
    switch (accion) {
      case "login":
        resultado = verificarLogin(datos.email);
        break;
      case "verificarSesion":
        resultado = emailUsuario
          ? { success: true, data: { email: emailUsuario } }
          : { success: false, error: "No autenticado" };
        break;
      default:
        resultado = { success: false, error: "Acción no válida" };
    }
  } catch (error) {
    resultado = { success: false, error: error.toString() };
  }

  const output = `${callback}(${JSON.stringify(resultado)})`;
  return ContentService
    .createTextOutput(output)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
