const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Detectar si usar PostgreSQL (producción) o MySQL (desarrollo)
const usePostgreSQL = process.env.NODE_ENV === 'production' || process.env.PGHOST;

// Importar módulos según el entorno
let Pool, mysql;
if (usePostgreSQL) {
    Pool = require('pg').Pool;
    console.log('🐘 Usando PostgreSQL (Render/Producción)');
} else {
    mysql = require('mysql2');
    console.log('🐬 Usando MySQL (Desarrollo local con DBeaver)');
}

const app = express();

// 🔒 CONFIGURACIÓN DE CORS - Permite solicitudes desde el frontend
const corsOptions = {
    origin: function (origin, callback) {
        // Permitir solicitudes sin origin (apps móviles, Postman, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:5500',
            'http://localhost:3000',
            'http://127.0.0.1:5500',
            'https://kivra-nutrir.onrender.com',
            'https://www.kivra-nutrir.onrender.com'
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('onrender.com')) {
            callback(null, true);
        } else {
            console.log('⚠️ Solicitud bloqueada por CORS desde:', origin);
            callback(null, true); // Permitir de todos modos en desarrollo
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// 🔧 PRODUCCIÓN: Servir archivos estáticos - versión simplificada
const fs = require('fs');

// Una sola ruta confiable para el frontend
const frontendPath = path.join(__dirname, '../FRONTEND');

console.log('📁 Directorio actual (__dirname):', __dirname);
console.log('📁 Buscando FRONTEND en:', frontendPath);
console.log('� Verificando si existe:', fs.existsSync(frontendPath));

if (!fs.existsSync(frontendPath)) {
    console.error('❌ FRONTEND NO ENCONTRADO en:', frontendPath);
    console.error('ℹ️ Estructura esperada: /FRONTEND con index.html y stock.html');
} else {
    app.use(express.static(frontendPath));
    console.log('✅ Sirviendo archivos estáticos desde:', frontendPath);
    
    app.get('/', (req, res) => {
        res.sendFile(path.join(frontendPath, 'index.html'));
    });
    
    app.get('/stock.html', (req, res) => {
        res.sendFile(path.join(frontendPath, 'stock.html'));
    });
    
    app.get('/stock', (req, res) => {
        res.sendFile(path.join(frontendPath, 'stock.html'));
    });
}

// Configuración de multer para guardar imágenes (detecta estructura)
const imagenesPath = require('fs').existsSync(path.join(__dirname, '../FRONTEND/imagenes')) 
    ? path.join(__dirname, '../FRONTEND/imagenes')
    : path.join(__dirname, '../imagenes');

// 🔒 SEGURIDAD: Ruta específica para imágenes con validación anti-traversal
app.get('/imagenes/:filename', (req, res) => {
    const filename = decodeURIComponent(req.params.filename);
    
    // 🚨 VALIDACIÓN CRÍTICA: Prevenir path traversal
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        console.log('🚨 INTENTO DE PATH TRAVERSAL detectado:', filename);
        return res.status(400).send('Nombre de archivo inválido');
    }
    
    // 🔒 WHITELIST: Solo extensiones de imagen permitidas
    const extensionesPermitidas = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const extension = path.extname(filename).toLowerCase();
    
    if (!extensionesPermitidas.includes(extension)) {
        console.log('🚨 EXTENSIÓN NO PERMITIDA:', extension);
        return res.status(400).send('Tipo de archivo no permitido');
    }
    
    // 🔒 SANITIZACIÓN: Construir ruta segura
    const safeFilename = path.basename(filename); // Solo el nombre, sin rutas
    const filepath = path.join(imagenesPath, safeFilename);
    
    // 🔒 VALIDACIÓN FINAL: Verificar que la ruta está dentro del directorio permitido
    const realPath = path.resolve(filepath);
    const realImagenesPath = path.resolve(imagenesPath);
    
    if (!realPath.startsWith(realImagenesPath)) {
        console.log('� INTENTO DE ACCESO FUERA DEL DIRECTORIO:', realPath);
        return res.status(403).send('Acceso denegado');
    }
    
    console.log('�🖼️ Solicitando imagen segura:', safeFilename);
    console.log('📁 Ruta validada:', realPath);
    
    res.sendFile(realPath, (err) => {
        if (err) {
            console.log('❌ Error enviando imagen:', err.message);
            res.status(404).send('Imagen no encontrada');
        } else {
            console.log('✅ Imagen enviada correctamente');
        }
    });
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, imagenesPath);
    },
    filename: function (req, file, cb) {
        // 🔒 SEGURIDAD: Sanitizar nombre de archivo
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, Date.now() + '-' + safeName);
    }
});

// 🔒 SEGURIDAD: Filtro de archivos y límites de tamaño
const fileFilter = (req, file, cb) => {
    // Solo permitir imágenes
    if (file.mimetype.startsWith('image/')) {
        // Extensiones permitidas
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
        const fileExtension = require('path').extname(file.originalname).toLowerCase();
        
        if (allowedExtensions.includes(fileExtension)) {
            console.log('✅ Archivo de imagen válido:', file.originalname);
            cb(null, true);
        } else {
            console.log('❌ Extensión no permitida:', fileExtension);
            cb(new Error('Solo se permiten archivos de imagen (jpg, png, gif, webp)'), false);
        }
    } else {
        console.log('❌ Tipo MIME no válido:', file.mimetype);
        cb(new Error('Solo se permiten archivos de imagen'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 🚨 LÍMITE: 5MB máximo
        files: 1 // Solo 1 archivo por request
    }
});

// Configurar conexión según el entorno
let db;

if (usePostgreSQL) {
    // PostgreSQL para producción (Render)
    db = new Pool({
        host: process.env.PGHOST || 'localhost',
        port: process.env.PGPORT || 5432,
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || '1234',
        database: process.env.PGDATABASE || 'kivra',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Prueba la conexión PostgreSQL
    db.query('SELECT NOW()', (err, res) => {
        if (err) {
            console.error('❌ Error de conexión PostgreSQL:', err);
        } else {
            console.log('✅ Conectado a PostgreSQL:', res.rows[0]);
        }
    });
} else {
    // MySQL para desarrollo local (DBeaver)
    db = mysql.createConnection({
        host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
        port: process.env.MYSQLPORT || 3306,
        user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
        password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '1234',
        database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'kivra'
    });

    // Prueba la conexión MySQL
    db.connect((err) => {
        if (err) {
            console.error('❌ Error de conexión MySQL:', err);
        } else {
            console.log('✅ Conectado a MySQL (DBeaver)');
        }
    });
}

// 🔒 SEGURIDAD: Función universal para consultas SQL con timeout y reconexión
const executeQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        // 🚨 TIMEOUT CRÍTICO: Rechazar después de 10 segundos
        const timeout = setTimeout(() => {
            reject(new Error('Timeout de base de datos (10s)'));
        }, 10000);

        if (usePostgreSQL) {
            // Convertir ? a $1, $2, etc. para PostgreSQL
            let pgQuery = query;
            let paramIndex = 1;
            while (pgQuery.includes('?')) {
                pgQuery = pgQuery.replace('?', `$${paramIndex}`);
                paramIndex++;
            }
            
            // Para INSERT, agregar RETURNING id si no existe
            if (pgQuery.toUpperCase().includes('INSERT') && !pgQuery.toUpperCase().includes('RETURNING')) {
                pgQuery += ' RETURNING id';
            }
            
            db.query(pgQuery, params, (err, result) => {
                clearTimeout(timeout); // Limpiar timeout
                if (err) {
                    console.error('❌ Error PostgreSQL:', err.message);
                    reject(err);
                } else {
                    const insertId = result.rows && result.rows[0] && result.rows[0].id ? result.rows[0].id : null;
                    resolve({ 
                        rows: result.rows || result, 
                        rowCount: result.rowCount, 
                        insertId: insertId 
                    });
                }
            });
        } else {
            // MySQL usa ? como placeholders
            db.query(query, params, (err, result) => {
                clearTimeout(timeout); // Limpiar timeout
                if (err) {
                    console.error('❌ Error MySQL:', err.message);
                    // 🔄 RECONEXIÓN: Intentar reconectar si se perdió conexión
                    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
                        console.log('🔄 Intentando reconectar MySQL...');
                        db.connect((reconnectErr) => {
                            if (!reconnectErr) {
                                console.log('✅ Reconexión MySQL exitosa');
                            }
                        });
                    }
                    reject(err);
                } else {
                    resolve({ 
                        rows: result, 
                        rowCount: result.affectedRows, 
                        insertId: result.insertId 
                    });
                }
            });
        }
    });
};

// Endpoint para obtener productos
app.get('/api/productos', async (req, res) => {
    try {
        const result = await executeQuery('SELECT * FROM productos');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint para actualizar el stock de un producto
app.put('/api/productos/:id/stock', async (req, res) => {
    console.log('🚀 ENDPOINT STOCK LLAMADO - Iniciando...');
    try {
        const id = req.params.id;
        const nuevoStock = req.body.stock;
        const accionFrontend = req.body.accion; // Puede ser 'venta', 'edicion', etc.
        
        console.log('📦 ACTUALIZANDO STOCK:');
        console.log('- ID:', id);
        console.log('- Nuevo Stock:', nuevoStock, typeof nuevoStock);
        console.log('- Acción:', accionFrontend);
        console.log('- Body completo:', req.body);
        
        // 🚨 VALIDACIÓN CRÍTICA: Stock válido
        const stockNumerico = parseInt(nuevoStock);
        if (isNaN(stockNumerico) || stockNumerico < 0) {
            console.log('❌ Stock inválido:', nuevoStock);
            return res.status(400).json({ error: 'El stock no puede ser negativo ni inválido' });
        }
        
        if (stockNumerico > 9999) {
            console.log('❌ Stock demasiado alto:', stockNumerico);
            return res.status(400).json({ error: 'El stock no puede ser mayor a 9999' });
        }
        
        // Obtener stock anterior
        const stockResult = await executeQuery('SELECT stock FROM productos WHERE id = ?', [id]);
        console.log('📊 Resultado consulta stock:', stockResult);
        
        if (!stockResult.rows || stockResult.rows.length === 0) {
            console.log('❌ Producto no encontrado con ID:', id);
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        const stockAntes = stockResult.rows[0].stock;
        console.log('📈 Stock anterior:', stockAntes);
        
        // 🔒 TRANSACCIÓN: Primero registrar movimiento, después actualizar stock
        const cantidad = Math.abs(stockNumerico - stockAntes);
        let accion = 'ajuste';  // Valor por defecto mejorado
        
        if (accionFrontend === 'venta') {
            accion = 'salida';   // Venta = salida de stock
        } else if (stockNumerico < stockAntes) {
            accion = 'ajuste_salida';   // Admin redujo stock
        } else if (stockNumerico > stockAntes) {
            accion = 'ajuste_entrada';  // Admin aumentó stock
        }
        
        console.log('📝 Registrando movimiento PRIMERO - Cantidad:', cantidad, 'Acción:', accion);
        
        // PASO 1: Registrar movimiento (si esto falla, no se actualiza stock)
        await executeQuery('INSERT INTO movimientos (producto_id, accion, cantidad, stock_antes, stock_despues, usuario) VALUES (?, ?, ?, ?, ?, ?)',
            [parseInt(id), accion, cantidad, stockAntes, stockNumerico, 'admin']);
        
        console.log('✅ Movimiento registrado correctamente');
        
        // PASO 2: Actualizar stock (solo si el movimiento se registró exitosamente)
        console.log('🔄 Ejecutando UPDATE...');
        await executeQuery('UPDATE productos SET stock = ? WHERE id = ?', [stockNumerico, parseInt(id)]);
        console.log('✅ Stock actualizado exitosamente');
        
        res.json({ success: true });
        
    } catch (err) {
        console.error('❌ ERROR COMPLETO al actualizar stock:', err);
        console.error('❌ Stack trace:', err.stack);
        res.status(500).json({ error: err.message });
    }
});

// 🔒 SEGURIDAD: Endpoint para venta atómica (previene race conditions)
app.post('/api/productos/:id/venta', async (req, res) => {
    console.log('🛒 ENDPOINT DE VENTA ATÓMICA LLAMADO');
    try {
        const id = parseInt(req.params.id);
        const cantidadVenta = parseInt(req.body.cantidadVenta);
        
        // Validaciones críticas
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ error: 'ID de producto inválido' });
        }
        
        if (isNaN(cantidadVenta) || cantidadVenta <= 0) {
            return res.status(400).json({ error: 'Cantidad de venta debe ser mayor a 0' });
        }
        
        console.log(`📦 Procesando venta: ${cantidadVenta} unidades del producto ${id}`);
        
        // 🔒 TRANSACCIÓN ATÓMICA: Obtener stock actual con FOR UPDATE (bloquea fila)
        const stockQuery = usePostgreSQL 
            ? 'SELECT stock FROM productos WHERE id = $1 FOR UPDATE'
            : 'SELECT stock FROM productos WHERE id = ? FOR UPDATE';
            
        const stockResult = await executeQuery(stockQuery, [id]);
        
        if (!stockResult.rows || stockResult.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        const stockActual = stockResult.rows[0].stock;
        console.log(`📊 Stock actual: ${stockActual}, Venta solicitada: ${cantidadVenta}`);
        
        // 🚨 VALIDACIÓN CRÍTICA: Verificar stock suficiente
        if (cantidadVenta > stockActual) {
            console.log(`❌ Stock insuficiente: ${stockActual} < ${cantidadVenta}`);
            return res.status(400).json({ 
                error: `Stock insuficiente. Disponible: ${stockActual}, Solicitado: ${cantidadVenta}` 
            });
        }
        
        const nuevoStock = stockActual - cantidadVenta;
        
        // PASO 1: Registrar movimiento de venta
        await executeQuery(
            'INSERT INTO movimientos (producto_id, accion, cantidad, stock_antes, stock_despues, usuario) VALUES (?, ?, ?, ?, ?, ?)',
            [id, 'salida', cantidadVenta, stockActual, nuevoStock, 'admin']
        );
        
        console.log('✅ Movimiento de venta registrado');
        
        // PASO 2: Actualizar stock atómicamente
        await executeQuery('UPDATE productos SET stock = ? WHERE id = ?', [nuevoStock, id]);
        
        console.log(`✅ Venta completada: ${stockActual} → ${nuevoStock}`);
        
        res.json({ 
            success: true, 
            stockAnterior: stockActual,
            stockNuevo: nuevoStock,
            cantidadVendida: cantidadVenta
        });
        
    } catch (err) {
        console.error('❌ ERROR EN VENTA ATÓMICA:', err);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint para agregar producto con descripción
app.post('/api/productos', upload.single('imagen'), async (req, res) => {
    try {
        const { nombre, descripcion, categoria, precio, stock } = req.body;
        const imagen = req.file ? req.file.filename : null;
        
        // Insertar producto
        const result = await executeQuery('INSERT INTO productos (nombre, descripcion, imagen, categoria, precio, stock) VALUES (?, ?, ?, ?, ?, ?)', 
            [nombre, descripcion, imagen, categoria, precio, stock]);
        
        const productoId = result.insertId;
        
        // Registrar movimiento de alta
        await executeQuery('INSERT INTO movimientos (producto_id, accion, cantidad, stock_antes, stock_despues, usuario) VALUES (?, ?, ?, ?, ?, ?)',
            [productoId, 'entrada', stock, 0, stock, 'admin']);
        
        res.json({ success: true });
        
    } catch (err) {
        console.error('Error al agregar producto:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});
// Endpoint para eliminar producto
// 🔒 SEGURIDAD: Endpoint DELETE con validaciones completas
app.delete('/api/productos/:id', async (req, res) => {
    console.log('🗑️ SOLICITUD DE ELIMINACIÓN - Producto ID:', req.params.id);
    try {
        const id = parseInt(req.params.id);
        
        // 🚨 VALIDACIÓN CRÍTICA: ID válido
        if (isNaN(id) || id <= 0) {
            console.log('❌ ID inválido:', req.params.id);
            return res.status(400).json({ success: false, error: 'ID de producto inválido' });
        }
        
        // 🔒 VERIFICAR: Producto existe antes de eliminar
        const productoResult = await executeQuery('SELECT * FROM productos WHERE id = ?', [id]);
        
        if (!productoResult.rows || productoResult.rows.length === 0) {
            console.log('❌ Producto no encontrado para eliminar:', id);
            return res.status(404).json({ success: false, error: 'Producto no encontrado' });
        }
        
        const producto = productoResult.rows[0];
        console.log('📋 Producto a eliminar:', producto.nombre, 'Stock:', producto.stock);
        
        // 🚨 VALIDACIÓN DE NEGOCIO: Advertir si tiene stock alto
        if (producto.stock > 0) {
            console.log('⚠️ ADVERTENCIA: Eliminando producto con stock:', producto.stock);
        }
        
        // 🔒 SOFT DELETE vs HARD DELETE
        // Por seguridad, usamos soft delete (marcar como eliminado)
        const now = new Date().toISOString();
        
        // PASO 1: Registrar movimiento ANTES de eliminar
        await executeQuery(
            'INSERT INTO movimientos (producto_id, accion, cantidad, stock_antes, stock_despues, usuario) VALUES (?, ?, ?, ?, ?, ?)',
            [id, 'eliminacion', producto.stock, producto.stock, 0, 'admin']
        );
        
        console.log('✅ Movimiento de eliminación registrado');
        
        // PASO 2: Soft Delete - agregar fecha de eliminación
        const updateQuery = usePostgreSQL 
            ? 'UPDATE productos SET deleted_at = $1 WHERE id = $2'
            : 'UPDATE productos SET deleted_at = ? WHERE id = ?';
            
        try {
            await executeQuery(updateQuery, [now, id]);
            console.log('✅ Producto marcado como eliminado (soft delete)');
        } catch (softDeleteError) {
            // Si no existe campo deleted_at, hacer hard delete
            console.log('⚠️ Campo deleted_at no existe, usando hard delete');
            const deleteResult = await executeQuery('DELETE FROM productos WHERE id = ?', [id]);
            
            if (deleteResult.rowCount === 0) {
                return res.status(500).json({ success: false, error: 'Error al eliminar producto' });
            }
        }
        
        // 🔒 AUDITORÍA: Log detallado
        console.log(`🗑️ PRODUCTO ELIMINADO - ID: ${id}, Nombre: ${producto.nombre}, Usuario: admin, Timestamp: ${now}`);
        
        res.json({ 
            success: true, 
            message: `Producto "${producto.nombre}" eliminado correctamente`,
            productId: id,
            timestamp: now
        });
        
    } catch (err) {
        console.error('❌ ERROR CRÍTICO al eliminar producto:', err);
        console.error('❌ Stack trace:', err.stack);
        res.status(500).json({ success: false, error: 'Error interno del servidor al eliminar producto' });
    }
});

// Endpoint para actualizar producto completo
app.put('/api/productos/:id', upload.single('imagen'), async (req, res) => {
    try {
        const id = req.params.id;
        const { nombre, descripcion, categoria, precio, stock } = req.body;
        const imagen = req.file ? req.file.filename : null;
        
        // Construir query dinámicamente según si hay imagen nueva o no
        let updateQuery = 'UPDATE productos SET nombre = ?, descripcion = ?, categoria = ?, precio = ?, stock = ?';
        let updateParams = [nombre, descripcion, categoria, precio, stock];
        
        if (imagen) {
            updateQuery += ', imagen = ?';
            updateParams.push(imagen);
        }
        
        updateQuery += ' WHERE id = ?';
        updateParams.push(id);
        
        // Actualizar producto
        await executeQuery(updateQuery, updateParams);
        
        // Registrar movimiento de edición
        await executeQuery('INSERT INTO movimientos (producto_id, accion, cantidad, stock_antes, stock_despues, usuario) VALUES (?, ?, ?, ?, ?, ?)',
            [id, 'entrada', 0, stock, stock, 'admin']);
        
        res.json({ success: true });
        
    } catch (err) {
        console.error('Error al actualizar producto:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Endpoint para obtener historial de movimientos
app.get('/api/movimientos', async (req, res) => {
    try {
        const sql = `
            SELECT m.*, p.nombre AS producto_nombre
            FROM movimientos m
            LEFT JOIN productos p ON m.producto_id = p.id
            ORDER BY m.fecha DESC
            LIMIT 200
        `;
        const result = await executeQuery(sql);
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener movimientos:', err);
        res.status(500).json({ error: err.message });
    }
});

// 🌐 Puerto de escucha dinámico para Render/Railway/desarrollo
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor backend escuchando en puerto ${PORT}`);
    console.log(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Base de datos: ${usePostgreSQL ? 'PostgreSQL' : 'MySQL'}`);
});