// =====================================================
// SISTEMA COMPLETO - FRONTEND
// =====================================================

let currentUser = null;
let currentToken = null;
let productosCache = [];
let ventasCache = [];

// =====================================================
// INICIALIZACIÓN Y AUTENTICACIÓN
// =====================================================

async function checkAuth() {
    const token = localStorage.getItem('libToken');
    const user = localStorage.getItem('libUser');
    
    if (!token || !user) {
        if (!window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        }
        return false;
    }
    
    try {
        const result = await callGAS('verificarSesion', {});
        const emailBackend = (result.data?.email || '').toLowerCase().trim();
        const emailLocal = (user || '').toLowerCase().trim();

        if (!result.success || emailBackend !== emailLocal) {
            throw new Error('Sesión inválida');
        }

        currentToken = token;
        currentUser = user;
        const userEmailEl = document.getElementById('userEmail');
        if (userEmailEl) userEmailEl.innerText = user;
        return true;
    } catch (error) {
        console.error('checkAuth falló:', error);
        localStorage.removeItem('libToken');
        localStorage.removeItem('libUser');
        window.location.href = 'index.html';
        return false;
    }
}

function logout() {
    localStorage.removeItem('libToken');
    localStorage.removeItem('libUser');
    window.location.href = 'index.html';
}

// =====================================================
// COMUNICACIÓN CON GAS
// =====================================================

/**
 * Llama al backend vía JSONP (GET). Devuelve Promise → compatible con await.
 * Siempre envía origin y referer para la lista blanca del backend.
 */
function callGAS(accion, datos = {}) {
    const token = localStorage.getItem('libToken');

    if (!token && accion !== 'login') {
        return Promise.reject(new Error('No autenticado'));
    }

    return new Promise((resolve, reject) => {
        const callbackName = 'gas_' + Date.now();
        const origin = window.location.origin === 'null' ? '' : window.location.origin;
        const referer = window.location.href;

        const url = new URL(CONFIG.GAS_URL);
        url.searchParams.set('accion', accion);
        url.searchParams.set('token', token || '');
        url.searchParams.set('datos', JSON.stringify(datos));
        url.searchParams.set('callback', callbackName);
        url.searchParams.set('origin', origin);
        url.searchParams.set('referer', referer);

        const script = document.createElement('script');
        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error('Timeout: el backend no respondió a tiempo'));
        }, 20000);

        function cleanup() {
            clearTimeout(timeout);
            delete window[callbackName];
            if (script.parentNode) script.parentNode.removeChild(script);
        }

        window[callbackName] = function(resultado) {
            cleanup();
            resolve(resultado);
        };

        script.onerror = () => {
            cleanup();
            reject(new Error('No se pudo conectar con el backend. Revisá CONFIG.GAS_URL y el despliegue de Apps Script.'));
        };

        script.src = url.toString();
        document.body.appendChild(script);
    });
}

// =====================================================
// GESTIÓN DE PRODUCTOS
// =====================================================

async function cargarProductos() {
    try {
        const result = await callGAS('obtenerProductos', {});
        if (result.success) {
            productosCache = result.data;
            renderizarProductos();
        }
    } catch (error) {
        console.error('Error cargando productos:', error);
        mostrarNotificacion('Error al cargar productos', 'error');
    }
}

function renderizarProductos() {
    const tbody = document.getElementById('productosLista');
    if (!tbody) return;
    
    const searchTerm = document.getElementById('buscarProducto')?.value.toLowerCase() || '';
    const productosFiltrados = productosCache.filter(p => 
        p.nombre?.toLowerCase().includes(searchTerm) || 
        p.id?.toLowerCase().includes(searchTerm)
    );
    
    if (productosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No hay productos registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = productosFiltrados.map(p => `
        <tr>
            <td>${p.id || '-'}</td>
            <td>${p.nombre || '-'}</td>
            <td>$${Number(p.costoUnitario || 0).toFixed(2)}</td>
            <td>$${Number(p.precioVenta || 0).toFixed(2)}</td>
            <td>${p.stock || 0}</td>
            <td class="${(p.precioVenta - p.costoUnitario) > 0 ? 'text-success' : 'text-danger'}">
                $${((p.precioVenta || 0) - (p.costoUnitario || 0)).toFixed(2)}
            </td>
            <td>
                <button class="btn-secondary btn-sm" onclick="editarProducto('${p.id}')">✏️</button>
                <button class="btn-danger btn-sm" onclick="eliminarProducto('${p.id}')">🗑️</button>
            </td>
        </tr>
    `).join('');
}

async function guardarProductoIndividual(event) {
    event.preventDefault();
    
    const producto = {
        id: document.getElementById('productoId').value,
        nombre: document.getElementById('nombre').value,
        costoUnitario: parseFloat(document.getElementById('costoUnitario').value) || 0,
        precioVenta: parseFloat(document.getElementById('precioVenta').value) || 0,
        stock: parseInt(document.getElementById('stock').value) || 1,
        fechaCompra: document.getElementById('fechaCompra').value,
        proveedor: document.getElementById('proveedor').value,
        esLote: false
    };
    
    try {
        const result = await callGAS('guardarProducto', producto);
        if (result.success) {
            mostrarNotificacion('Producto guardado exitosamente', 'success');
            cargarProductos();
            document.getElementById('formProductoIndividual').reset();
        }
    } catch (error) {
        mostrarNotificacion('Error al guardar', 'error');
    }
}

async function guardarProductoLote(event) {
    event.preventDefault();
    
    const cantidad = parseInt(document.getElementById('loteCantidad').value);
    const costoTotal = parseFloat(document.getElementById('loteCostoTotal').value);
    const costoUnitario = costoTotal / cantidad;
    
    // Crear productos individuales del lote
    const nombreBase = document.getElementById('loteNombre').value;
    const precioVenta = parseFloat(document.getElementById('lotePrecioVenta').value) || 0;
    const fechaCompra = document.getElementById('loteFechaCompra').value;
    const proveedor = document.getElementById('loteProveedor').value;
    
    for (let i = 1; i <= cantidad; i++) {
        const producto = {
            nombre: `${nombreBase} (Unidad ${i})`,
            costoUnitario: costoUnitario,
            precioVenta: precioVenta,
            stock: 1,
            fechaCompra: fechaCompra,
            proveedor: proveedor,
            esLote: true,
            loteCantidad: cantidad,
            loteCostoTotal: costoTotal
        };
        
        await callGAS('guardarProducto', producto);
    }
    
    mostrarNotificacion(`Lote de ${cantidad} productos guardado exitosamente`, 'success');
    cargarProductos();
    document.getElementById('formProductoLote').reset();
}

function editarProducto(id) {
    const producto = productosCache.find(p => p.id === id);
    if (!producto) return;
    
    document.getElementById('productoId').value = producto.id;
    document.getElementById('nombre').value = producto.nombre;
    document.getElementById('costoUnitario').value = producto.costoUnitario;
    document.getElementById('precioVenta').value = producto.precioVenta;
    document.getElementById('stock').value = producto.stock;
    document.getElementById('fechaCompra').value = producto.fechaCompra?.split('T')[0] || '';
    document.getElementById('proveedor').value = producto.proveedor || '';
    
    // Cambiar a la pestaña individual
    document.querySelector('[data-tab="individual"]').click();
    document.getElementById('tab-individual').scrollIntoView({ behavior: 'smooth' });
}

async function eliminarProducto(id) {
    if (!confirm('¿Eliminar este producto permanentemente?')) return;
    
    try {
        const result = await callGAS('eliminarProducto', { id });
        if (result.success) {
            mostrarNotificacion('Producto eliminado', 'success');
            cargarProductos();
        }
    } catch (error) {
        mostrarNotificacion('Error al eliminar', 'error');
    }
}

// =====================================================
// GESTIÓN DE VENTAS
// =====================================================

async function cargarVentas() {
    try {
        const result = await callGAS('obtenerVentas', {});
        if (result.success) {
            ventasCache = result.data;
            renderizarVentas();
        }
    } catch (error) {
        console.error('Error cargando ventas:', error);
    }
}

function renderizarVentas() {
    const tbody = document.getElementById('ventasLista');
    if (!tbody) return;
    
    const searchTerm = document.getElementById('buscarVenta')?.value.toLowerCase() || '';
    const ventasFiltradas = ventasCache.filter(v => 
        v.productoNombre?.toLowerCase().includes(searchTerm) ||
        v.cliente?.toLowerCase().includes(searchTerm)
    );
    
    if (ventasFiltradas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No hay ventas registradas</td></tr>';
        return;
    }
    
    tbody.innerHTML = ventasFiltradas.slice(0, 50).map(v => `
        <tr>
            <td>${new Date(v.fecha).toLocaleDateString()}</td>
            <td>${v.productoNombre || '-'}</td>
            <td>${v.cantidad || 0}</td>
            <td>$${Number(v.total || 0).toFixed(2)}</td>
            <td class="text-success">$${Number(v.ganancia || 0).toFixed(2)}</td>
        </tr>
    `).join('');
}

async function cargarSelectProductos() {
    const select = document.getElementById('ventaProductoId');
    if (!select) return;
    
    await cargarProductos();
    const productosConStock = productosCache.filter(p => p.stock > 0);
    
    select.innerHTML = '<option value="">-- Seleccionar producto --</option>' +
        productosConStock.map(p => `
            <option value="${p.id}" data-precio="${p.precioVenta}" data-stock="${p.stock}" data-costo="${p.costoUnitario}">
                ${p.nombre} - Stock: ${p.stock} - $${p.precioVenta}
            </option>
        `).join('');
    
    // Evento para mostrar info del producto
    select.onchange = function() {
        const selected = this.options[this.selectedIndex];
        const precio = selected.dataset.precio;
        const stock = selected.dataset.stock;
        const costo = selected.dataset.costo;
        
        if (precio) {
            document.getElementById('infoProductoSeleccionado').style.display = 'block';
            document.getElementById('infoStock').innerText = stock;
            document.getElementById('infoPrecio').innerText = `$${Number(precio).toFixed(2)}`;
            document.getElementById('infoGanancia').innerText = `$${(Number(precio) - Number(costo)).toFixed(2)}`;
        } else {
            document.getElementById('infoProductoSeleccionado').style.display = 'none';
        }
    };
}

async function registrarVenta(event) {
    event.preventDefault();
    
    const productoId = document.getElementById('ventaProductoId').value;
    const cantidad = parseInt(document.getElementById('ventaCantidad').value);
    const cliente = document.getElementById('ventaCliente').value;
    
    if (!productoId || !cantidad) {
        mostrarNotificacion('Complete todos los campos', 'error');
        return;
    }
    
    try {
        const result = await callGAS('registrarVenta', {
            productoId,
            cantidad,
            cliente
        });
        
        if (result.success) {
            mostrarNotificacion(`Venta registrada. Total: $${result.data.total.toFixed(2)}`, 'success');
            document.getElementById('formVenta').reset();
            document.getElementById('infoProductoSeleccionado').style.display = 'none';
            cargarProductos();
            cargarSelectProductos();
            cargarVentas();
            actualizarFinanzas();
        }
    } catch (error) {
        mostrarNotificacion('Error al registrar venta', 'error');
    }
}

function actualizarPreviewVenta() {
    const select = document.getElementById('ventaProductoId');
    const cantidad = parseInt(document.getElementById('ventaCantidad').value) || 0;
    const selected = select?.options[select.selectedIndex];
    const precio = parseFloat(selected?.dataset.precio) || 0;
    
    const total = precio * cantidad;
    document.getElementById('ventaTotalPreview').innerHTML = `$${total.toFixed(2)}`;
}

// =====================================================
// FINANZAS
// =====================================================

async function actualizarFinanzas() {
    try {
        const result = await callGAS('obtenerFinanzas', {});
        if (result.success) {
            const finanzas = result.data;
            
            document.getElementById('totalIngresos').innerText = `$${finanzas.totalIngresos?.toFixed(2) || '0.00'}`;
            document.getElementById('totalEgresos').innerText = `$${finanzas.totalEgresos?.toFixed(2) || '0.00'}`;
            document.getElementById('balanceActual').innerText = `$${finanzas.balance?.toFixed(2) || '0.00'}`;
            
            const gananciaNeta = (finanzas.totalIngresos || 0) - (finanzas.totalEgresos || 0);
            document.getElementById('gananciaNeta').innerText = `$${gananciaNeta.toFixed(2)}`;
            
            renderizarMovimientos(finanzas.movimientos || []);
            renderizarGraficoBalance(finanzas.movimientos || []);
        }
    } catch (error) {
        console.error('Error cargando finanzas:', error);
    }
}

function renderizarMovimientos(movimientos) {
    const tbody = document.getElementById('movimientosLista');
    if (!tbody) return;
    
    if (movimientos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No hay movimientos registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = movimientos.map(m => `
        <tr>
            <td>${new Date(m.fecha).toLocaleDateString()}</td>
            <td>
                <span class="${m.tipo === 'ingreso' ? 'text-success' : 'text-danger'}">
                    ${m.tipo === 'ingreso' ? '💰 Ingreso' : '💸 Egreso'}
                </span>
            </td>
            <td>${m.concepto || '-'}</td>
            <td class="${m.tipo === 'ingreso' ? 'text-success' : 'text-danger'}">
                $${Number(m.monto).toFixed(2)}
            </td>
            <td>${m.usuario || '-'}</td>
            <td>$${Number(m.balance).toFixed(2)}</td>
        </tr>
    `).join('');
}

function renderizarGraficoBalance(movimientos) {
    const container = document.getElementById('balanceBars');
    if (!container) return;
    
    // Tomar últimos 10 movimientos
    const ultimos = movimientos.slice(-10);
    const maxBalance = Math.max(...ultimos.map(m => m.balance || 0), 100);
    
    container.innerHTML = ultimos.map(m => {
        const height = ((m.balance || 0) / maxBalance) * 180;
        const fecha = new Date(m.fecha).toLocaleDateString();
        return `
            <div class="bar" style="height: ${height}px;">
                <div class="bar-label">${fecha}</div>
            </div>
        `;
    }).join('');
}

// =====================================================
// NAVEGACIÓN Y RENDERIZADO DE PÁGINAS
// =====================================================

async function loadPage(pageName) {
    const contentArea = document.getElementById('contentArea');
    const pageTitle = document.getElementById('pageTitle');
    
    if (!contentArea) return;
    
    // Mapeo de páginas a archivos HTML
    const pages = {
        dashboard: 'dashboard_content.html',
        productos: 'productos.html',
        ventas: 'ventas.html',
        finanzas: 'finanzas.html'
    };
    
    try {
        const response = await fetch(pages[pageName]);
        const html = await response.text();
        contentArea.innerHTML = html;
        
        pageTitle.innerText = {
            dashboard: 'Dashboard',
            productos: 'Productos',
            ventas: 'Ventas',
            finanzas: 'Finanzas'
        }[pageName];
        
        // Inicializar componentes según la página
        if (pageName === 'productos') {
            initProductosPage();
        } else if (pageName === 'ventas') {
            initVentasPage();
        } else if (pageName === 'finanzas') {
            initFinanzasPage();
        } else if (pageName === 'dashboard') {
            initDashboardPage();
        }
        
    } catch (error) {
        contentArea.innerHTML = '<div class="error">Error cargando la página</div>';
    }
}

function initProductosPage() {
    cargarProductos();
    
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
        };
    });
    
    // Formularios
    const formIndividual = document.getElementById('formProductoIndividual');
    if (formIndividual) formIndividual.onsubmit = guardarProductoIndividual;
    
    const formLote = document.getElementById('formProductoLote');
    if (formLote) {
        formLote.onsubmit = guardarProductoLote;
        
        // Calcular costo por unidad automáticamente
        const loteCantidad = document.getElementById('loteCantidad');
        const loteCostoTotal = document.getElementById('loteCostoTotal');
        const costoPorUnidad = document.getElementById('costoPorUnidad');
        
        function actualizarCostoUnitario() {
            const cantidad = parseFloat(loteCantidad.value) || 0;
            const costoTotal = parseFloat(loteCostoTotal.value) || 0;
            if (cantidad > 0 && costoTotal > 0) {
                costoPorUnidad.value = `$${(costoTotal / cantidad).toFixed(2)} por unidad`;
            } else {
                costoPorUnidad.value = '';
            }
        }
        
        loteCantidad.oninput = actualizarCostoUnitario;
        loteCostoTotal.oninput = actualizarCostoUnitario;
    }
    
    // Búsqueda
    const buscador = document.getElementById('buscarProducto');
    if (buscador) buscador.oninput = renderizarProductos;
}

function initVentasPage() {
    cargarSelectProductos();
    cargarVentas();
    
    const formVenta = document.getElementById('formVenta');
    if (formVenta) formVenta.onsubmit = registrarVenta;
    
    const cantidadInput = document.getElementById('ventaCantidad');
    if (cantidadInput) cantidadInput.oninput = actualizarPreviewVenta;
    
    const selectProducto = document.getElementById('ventaProductoId');
    if (selectProducto) selectProducto.onchange = actualizarPreviewVenta;
    
    const buscador = document.getElementById('buscarVenta');
    if (buscador) buscador.oninput = renderizarVentas;
}

function initFinanzasPage() {
    actualizarFinanzas();
    
    // Actualizar cada 30 segundos
    setInterval(actualizarFinanzas, 30000);
}

function initDashboardPage() {
    // Mostrar resumen en el dashboard
    cargarProductos();
    cargarVentas();
    actualizarFinanzas();
}

// =====================================================
// UTILIDADES
// =====================================================

function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear notificación flotante
    const notif = document.createElement('div');
    notif.className = `notification notification-${tipo}`;
    notif.innerText = mensaje;
    notif.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${tipo === 'success' ? '#10b981' : tipo === 'error' ? '#ef4444' : '#4f46e5'};
        color: white;
        border-radius: 8px;
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticación (si no es login page)
    if (!window.location.pathname.includes('index.html')) {
        const auth = await checkAuth();
        if (!auth) return;
        
        // Configurar sidebar
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        
        if (menuToggle) {
            menuToggle.onclick = () => {
                sidebar.classList.toggle('open');
            };
        }
        
        // Navegación
        document.querySelectorAll('.nav-item').forEach(item => {
            item.onclick = (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                loadPage(page);
            };
        });
        
        // Logout
        const btnLogout = document.getElementById('btnLogout');
        if (btnLogout) btnLogout.onclick = logout;
        
        // Cargar página inicial
        loadPage('dashboard');
        
        // Reloj
        function updateDateTime() {
            const dt = document.getElementById('dateTime');
            if (dt) {
                dt.innerText = new Date().toLocaleString();
            }
        }
        updateDateTime();
        setInterval(updateDateTime, 1000);
    }
});

// Animaciones CSS adicionales
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .btn-sm {
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        margin: 0 0.125rem;
    }
    
    .notification {
        font-family: monospace;
        font-size: 0.875rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
`;
document.head.appendChild(style);