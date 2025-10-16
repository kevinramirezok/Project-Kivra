const PASSWORD = "kivra25";
if (sessionStorage.getItem('kivra_auth') !== PASSWORD) {
    const ingreso = prompt("Ingrese la contraseña para acceder al panel de stock:");
    if (ingreso !== PASSWORD) {
        document.body.innerHTML = '<h2 style="color: var(--rojo); text-align:center; margin-top:100px;">Acceso denegado</h2>';
        throw new Error("Acceso denegado");
    } else {
        sessionStorage.setItem('kivra_auth', PASSWORD);
    }
}

const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001' 
    : 'https://kivra-nutrir.onrender.com';

// Configuración de ruta de imágenes
const IMAGES_BASE_URL = `${API_BASE_URL}/imagenes`;

console.log('Hostname detectado (Stock Admin):', window.location.hostname);
console.log('API_BASE_URL configurada (Stock Admin):', API_BASE_URL);
console.log('IMAGES_BASE_URL configurada (Stock Admin):', IMAGES_BASE_URL);

let productos = [];

function cargarProductos() {
    fetch(`${API_BASE_URL}/api/productos`)
        .then(res => res.json())
        .then(data => {
            productos = data;
            filterProducts();
            actualizarEstadisticas();
        })
        .catch(() => {
            document.getElementById('products-grid').innerHTML = '<div style="color:var(--rojo);text-align:center;">Error al cargar productos</div>';
        });
}

function renderizarProductos() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = productos.map(prod => `
        <div class="product-card${prod.stock === 0 ? ' out-of-stock' : prod.stock <= 5 ? ' low-stock' : ''}">
            <h3>${prod.nombre}</h3>
            <div class="price">$${prod.precio}</div>
            <div class="stock-control">
                <input type="number" min="0" value="${prod.stock}" id="stock-input-${prod.id}">
                <button class="btn btn-primary" onclick="actualizarStock(${prod.id})"><i class="bi bi-save"></i></button>
            </div>
            <span class="stock-badge ${prod.stock === 0 ? 'low' : prod.stock <= 5 ? 'medium' : 'high'}">Stock: ${prod.stock}</span>
        </div>
    `).join('');
}

function actualizarStock(id) {
    const input = document.getElementById(`stock-input-${id}`);
    const nuevoStock = parseInt(input.value);
    
    if (isNaN(nuevoStock) || nuevoStock < 0) {
        mostrarAlerta('El stock no puede ser negativo ni inválido', 'danger');
        input.focus();
        return;
    }
    
    if (nuevoStock > 9999) {
        mostrarAlerta('El stock no puede ser mayor a 9999', 'danger');
        input.focus();
        return;
    }
    
    fetch(`${API_BASE_URL}/api/productos/${id}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: nuevoStock, accion: 'edicion' })
    })
        .then(res => {
            console.log('Status respuesta:', res.status);
            if (res.ok) {
                // Si el status es 200-299, consideramos éxito
                mostrarAlerta('Stock actualizado correctamente', 'success');
                cargarProductos();
                return res.json().catch(() => ({ success: true }));
            } else {
                console.log('Status de error:', res.status);
                mostrarAlerta(`Error HTTP ${res.status} al actualizar stock`, 'danger');
                return res.json().catch(() => ({ success: false }));
            }
        })
        .then(data => {
            console.log('Datos recibidos:', data);
            // Ya manejamos el éxito arriba, aquí solo logueamos
        })
        .catch(error => {
            console.error('Error completo:', error);
            mostrarAlerta('Error de conexión con el backend', 'danger');
        });
}

function actualizarEstadisticas() {
    document.getElementById('total-products').textContent = productos.length;
    document.getElementById('low-stock').textContent = productos.filter(p => p.stock <= 5 && p.stock > 0).length;
    document.getElementById('out-stock').textContent = productos.filter(p => p.stock === 0).length;
    const totalValue = productos.reduce((sum, p) => sum + (p.precio * p.stock), 0);
    document.getElementById('total-value').textContent = `$${totalValue}`;
}

document.getElementById('search-input').addEventListener('input', filterProducts);
function filterProducts() {
    const texto = document.getElementById('search-input').value.toLowerCase();
    const categoria = document.getElementById('category-filter').value;
    const stockFiltro = document.getElementById('stock-filter').value;
    let filtrados = productos.slice();

    // Filtrar por categoría
    if (categoria !== 'all') {
        filtrados = filtrados.filter(p => (p.categoria || '').toLowerCase() === categoria.toLowerCase());
    }

    // Filtrar por stock
    if (stockFiltro === 'high') {
        filtrados = filtrados.filter(p => p.stock > 5);
    } else if (stockFiltro === 'low') {
        filtrados = filtrados.filter(p => p.stock <= 5 && p.stock > 0);
    } else if (stockFiltro === 'out') {
        filtrados = filtrados.filter(p => p.stock === 0);
    }

    // Filtrar por texto
    if (texto) {
        filtrados = filtrados.filter(p => (p.nombre || '').toLowerCase().includes(texto) || (p.descripcion && p.descripcion.toLowerCase().includes(texto)));
    }

    renderizarProductosFiltrados(filtrados);
}

function renderizarProductosFiltrados(lista) {
    const grid = document.getElementById('products-grid');
    if (lista.length === 0) {
        grid.innerHTML = '<div style="color:var(--rojo);text-align:center;">No se encontraron productos</div>';
        return;
    }
    grid.innerHTML = lista.map(prod => `
        <div class="product-card${prod.stock === 0 ? ' out-of-stock' : prod.stock <= 5 ? ' low-stock' : ''}">
            <button class="btn-eliminar" title="Eliminar" onclick="eliminarProducto(${prod.id})"><i class="bi bi-trash"></i></button>
            <span class="stock-badge ${prod.stock === 0 ? 'low' : prod.stock <= 5 ? 'medium' : 'high'}">Stock: ${prod.stock}</span>
            <img src="${IMAGES_BASE_URL}/${prod.imagen}" alt="${prod.nombre}" style="width:100%;max-height:120px;object-fit:contain;margin-bottom:10px;border-radius:8px;" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA0NUw3NSA3NUg0NUw2MCA0NVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'">
            <h3>${prod.nombre}</h3>
            <div class="price">$${prod.precio}</div>
            <div style="margin-bottom:8px;color:var(--marron-claro);font-size:0.95rem;">${prod.descripcion || ''}</div>
            <div class="stock-control">
                <input type="number" min="0" value="${prod.stock}" id="stock-input-${prod.id}">
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="actualizarStock(${prod.id})" title="Guardar stock"><i class="bi bi-save"></i></button>
                    <button class="btn btn-secondary" onclick="confirmarVenta(${prod.id}, ${prod.stock})" title="Descontar stock"><i class="bi bi-cart-check"></i></button>
                    <button class="btn btn-warning" onclick="editarProducto(${prod.id})" title="Editar producto" style="background:var(--naranja);color:white;"><i class="bi bi-pencil"></i></button>
                </div>
            </div>
        </div>
    `).join('');
}

function eliminarProducto(id) {
    if (!confirm('¿Seguro que quieres eliminar este producto?')) return;
    fetch(`${API_BASE_URL}/api/productos/${id}`, {
        method: 'DELETE'
    })
        .then(res => {
            console.log('[ELIMINAR] Status:', res.status);
            if (res.ok) {
                mostrarAlerta('Producto eliminado correctamente', 'success');
                cargarProductos();
                return res.json().catch(() => ({ success: true }));
            } else {
                console.log('[ELIMINAR] Error HTTP:', res.status);
                mostrarAlerta('Error al eliminar producto', 'danger');
                return res.json().catch(() => ({ success: false }));
            }
        })
        .then(data => {
            console.log('[ELIMINAR] Respuesta:', data);
        })
        .catch(error => {
            console.error('[ELIMINAR] Error de conexion:', error);
            mostrarAlerta('Error de conexión con el backend', 'danger');
        });
}

function confirmarVenta(id, stockActual) {
    const cantidad = parseInt(prompt('¿Cuántas unidades deseas descontar del stock?'));
    if (isNaN(cantidad) || cantidad <= 0) {
        alert('Cantidad inválida');
        return;
    }
    if (cantidad > stockActual) {
        alert('No hay suficiente stock disponible');
        return;
    }
    
    fetch(`${API_BASE_URL}/api/productos/${id}/venta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            cantidadVenta: cantidad,
            accion: 'venta'
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                mostrarAlerta(`Stock descontado: ${cantidad} unidades`, 'success');
                cargarProductos();
            } else {
                mostrarAlerta(data.error || 'Error al descontar stock', 'danger');
            }
        })
        .catch(() => mostrarAlerta('Error de conexión con el backend', 'danger'));
}

let productoEditando = null;

function openAddProductModal() {
    productoEditando = null;
    document.getElementById('modal-title').textContent = 'Agregar Producto';
    document.getElementById('product-form').reset();
    document.getElementById('product-image').required = true;
    document.getElementById('product-modal').classList.add('active');
}

function editarProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) {
        mostrarAlerta('Producto no encontrado', 'danger');
        return;
    }
    
    productoEditando = id;
    document.getElementById('modal-title').textContent = 'Editar Producto';
    document.getElementById('product-name').value = producto.nombre;
    document.getElementById('product-description').value = producto.descripcion || '';
    document.getElementById('product-category').value = producto.categoria;
    document.getElementById('product-price').value = producto.precio;
    document.getElementById('product-stock').value = producto.stock;
    document.getElementById('product-min-stock').value = producto.min_stock || 5;
    document.getElementById('product-image').required = false;
    document.getElementById('product-modal').classList.add('active');
}

function closeModal() {
    productoEditando = null;
    document.getElementById('product-modal').classList.remove('active');
}

function saveProduct(e) {
    e.preventDefault();
    const nombre = document.getElementById('product-name').value.trim();
    const categoria = document.getElementById('product-category').value;
    const precio = parseFloat(document.getElementById('product-price').value);
    const stock = parseInt(document.getElementById('product-stock').value);
    const descripcion = document.getElementById('product-description').value.trim();
    const imagenFile = document.getElementById('product-image').files[0];
    
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);
    formData.append('categoria', categoria);
    formData.append('precio', precio);
    formData.append('stock', stock);
    
    if (imagenFile) {
        formData.append('imagen', imagenFile);
    }
    
    const url = productoEditando ? 
        `${API_BASE_URL}/api/productos/${productoEditando}` : 
        `${API_BASE_URL}/api/productos`;
    const method = productoEditando ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        body: formData
    })
        .then(res => {
            console.log('[GUARDAR/EDITAR] Status:', res.status);
            if (res.ok) {
                // Status 200-299 = éxito
                mostrarAlerta(productoEditando ? 'Producto actualizado correctamente' : 'Producto agregado correctamente', 'success');
                closeModal();
                cargarProductos();
                return res.json().catch(() => ({ success: true }));
            } else {
                console.log('[GUARDAR/EDITAR] Error HTTP:', res.status);
                mostrarAlerta(productoEditando ? 'Error al actualizar producto' : 'Error al agregar producto', 'danger');
                return res.json().catch(() => ({ success: false }));
            }
        })
        .then(data => {
            console.log('[GUARDAR/EDITAR] Respuesta:', data);
        })
        .catch(error => {
            console.error('[GUARDAR/EDITAR] Error de conexion:', error);
            mostrarAlerta('Error de conexión con el backend', 'danger');
        });
}

document.getElementById('product-form').onsubmit = saveProduct;
cargarProductos();

function mostrarReporteStockBajo() {
    // Considera stock mínimo 5 si no está definido
    const criticos = productos.filter(p => p.stock === 0 || p.stock <= (p.min_stock || 5));
    if (criticos.length === 0) {
        mostrarAlerta('¡No hay productos con stock bajo o sin stock!', 'success');
        return;
    }
    let html = '<b>Productos con stock crítico:</b><ul style="margin:10px 0 0 20px;">';
    criticos.forEach(p => {
        html += `<li><b>${p.nombre}</b> - Stock: <span style="color:${p.stock === 0 ? 'var(--rojo)' : 'var(--amarillo)'};font-weight:bold;">${p.stock}</span></li>`;
    });
    html += '</ul>';
    mostrarAlerta(html, 'warning');
}

function exportarInventarioCSV() {
    if (!productos.length) {
        mostrarAlerta('No hay productos para exportar.', 'warning');
        return;
    }
    // Encabezados
    const headers = ['ID', 'Nombre', 'Descripción', 'Categoría', 'Precio', 'Stock', 'Imagen'];
    let csv = headers.join(',') + '\n';
    productos.forEach(p => {
        csv += [p.id, p.nombre, p.descripcion, p.categoria, p.precio, p.stock, p.imagen]
            .map(val => `"${(val || '').toString().replace(/"/g, '""')}"`)
            .join(',') + '\n';
    });
    
    // Descargar archivo
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventario_kivra.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    mostrarAlerta('Inventario exportado correctamente.', 'success');
}

function mostrarAlerta(mensaje, tipo = 'info', esPrompt = false, callback = null, esCantidad = false) {
    const container = document.getElementById('alerts-container');
    container.innerHTML = '';
    let icon = '';
    if (tipo === 'success') icon = '<i class="bi bi-check-circle-fill" style="color:var(--verde-claro);"></i>';
    if (tipo === 'danger') icon = '<i class="bi bi-x-circle-fill" style="color:var(--rojo);"></i>';
    if (tipo === 'warning') icon = '<i class="bi bi-exclamation-triangle-fill" style="color:var(--amarillo);"></i>';
    if (tipo === 'info') icon = '<i class="bi bi-info-circle-fill" style="color:var(--marron-claro);"></i>';
    
    if (esPrompt) {
        // Mostrar input para confirmación o cantidad
        const inputType = esCantidad ? 'number' : 'text';
        container.innerHTML = `<div class="alert alert-${tipo}" style="display:flex;align-items:center;gap:10px;">
            ${icon}
            <span style="flex:1;">${mensaje}</span>
            <input id="alert-input" type="${inputType}" style="padding:5px;border-radius:5px;border:1px solid #ccc;width:80px;">
            <button class="btn btn-primary" id="alert-ok">OK</button>
            <button class="btn btn-secondary" id="alert-cancel">Cancelar</button>
        </div>`;
        document.getElementById('alert-ok').onclick = () => {
            const val = document.getElementById('alert-input').value;
            container.innerHTML = '';
            if (callback) callback(val);
        };
        document.getElementById('alert-cancel').onclick = () => {
            container.innerHTML = '';
        };
    } else {
        container.innerHTML = `<div class="alert alert-${tipo}" style="display:flex;align-items:center;gap:10px;">
            ${icon}
            <span style="flex:1;">${mensaje}</span>
            <button class="btn btn-secondary" style="margin-left:10px;" onclick="this.parentElement.remove()">Cerrar</button>
        </div>`;
        setTimeout(() => {
            if (container.firstChild) container.firstChild.remove();
        }, 3500);
    }
}

let movimientosGlobal = [];

// Abrir modal de historial y cargar movimientos
function abrirHistorialModal() {
    document.getElementById('historial-modal').classList.add('active');
    cargarHistorialMovimientos();
}

function cerrarHistorialModal() {
    document.getElementById('historial-modal').classList.remove('active');
}

function filtrarHistorialMovimientos() {
    const accion = document.getElementById('filtro-accion').value;
    const producto = document.getElementById('filtro-producto').value.toLowerCase();
    let lista = movimientosGlobal.slice();
    
    if (accion !== 'all') {
        lista = lista.filter(m => (m.accion || '').toLowerCase() === accion.toLowerCase());
    }
    if (producto) {
        lista = lista.filter(m => (m.producto_nombre || '').toLowerCase().includes(producto));
    }
    renderizarTablaHistorial(lista);
}

function exportarHistorialCSV() {
    if (!movimientosGlobal.length) {
        mostrarAlerta('No hay movimientos para exportar.', 'warning');
        return;
    }
    const headers = ['Fecha', 'Producto', 'Acción', 'Cantidad', 'Stock Antes', 'Stock Después', 'Usuario'];
    let csv = headers.join(',') + '\n';
    movimientosGlobal.forEach(mov => {
        csv += [
            new Date(mov.fecha).toLocaleString(),
            mov.producto_nombre || mov.producto_id,
            mov.accion,
            mov.cantidad,
            mov.stock_antes,
            mov.stock_despues,
            mov.usuario || '-'
        ].map(val => `"${(val || '').toString().replace(/"/g, '""')}"`)
        .join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historial_movimientos_kivra.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    mostrarAlerta('Historial exportado correctamente.', 'success');
}

function renderizarTablaHistorial(data) {
    const tableContainer = document.getElementById('historial-table-container');
    if (!data.length) {
        tableContainer.innerHTML = '<div style="color:var(--rojo);text-align:center;font-weight:bold;">No hay movimientos registrados.<br><span style="color:var(--marron-claro);font-size:1rem;">¿Agregaste, editaste o vendiste productos?<br>Si el historial sigue vacío, revisa la base de datos o la conexión del backend.</span></div>';
        return;
    }
    
    let html = `<table style="width:100%;border-collapse:collapse;font-size:0.98rem;">
        <thead>
            <tr style="background:var(--crema);">
                <th style="border-bottom:2px solid var(--marron-claro);padding:8px;">Fecha</th>
                <th style="border-bottom:2px solid var(--marron-claro);padding:8px;">Producto</th>
                <th style="border-bottom:2px solid var(--marron-claro);padding:8px;">Acción</th>
                <th style="border-bottom:2px solid var(--marron-claro);padding:8px;">Cantidad</th>
                <th style="border-bottom:2px solid var(--marron-claro);padding:8px;">Stock Antes</th>
                <th style="border-bottom:2px solid var(--marron-claro);padding:8px;">Stock Después</th>
                <th style="border-bottom:2px solid var(--marron-claro);padding:8px;">Usuario</th>
            </tr>
        </thead>
        <tbody>`;
        
    data.forEach(mov => {
        let rowStyle = '';
        if (mov.accion === 'Venta' || mov.accion === 'Eliminación') rowStyle = 'background:#fff3cd;';
        html += `<tr style="${rowStyle}">
            <td style="padding:6px;border-bottom:1px solid #eee;">${new Date(mov.fecha).toLocaleString()}</td>
            <td style="padding:6px;border-bottom:1px solid #eee;">${mov.producto_nombre || mov.producto_id}</td>
            <td style="padding:6px;border-bottom:1px solid #eee;">${mov.accion}</td>
            <td style="padding:6px;border-bottom:1px solid #eee;">${mov.cantidad}</td>
            <td style="padding:6px;border-bottom:1px solid #eee;">${mov.stock_antes}</td>
            <td style="padding:6px;border-bottom:1px solid #eee;">${mov.stock_despues}</td>
            <td style="padding:6px;border-bottom:1px solid #eee;">${mov.usuario || '-'}</td>
        </tr>`;
    });
    html += '</tbody></table>';
    tableContainer.innerHTML = html;
}

function cargarHistorialMovimientos() {
    const loader = document.getElementById('historial-loader');
    const tableContainer = document.getElementById('historial-table-container');
    loader.style.display = 'block';
    tableContainer.innerHTML = '';
    
    fetch(`${API_BASE_URL}/api/movimientos`)
        .then(res => res.json())
        .then(data => {
            loader.style.display = 'none';
            movimientosGlobal = data;
            filtrarHistorialMovimientos();
        })
        .catch(() => {
            loader.style.display = 'none';
            document.getElementById('historial-table-container').innerHTML = '<div style="color:var(--rojo);text-align:center;">Error al cargar el historial.</div>';
        });
}