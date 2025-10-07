const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend (detecta estructura del proyecto)
const frontendPath = path.join(__dirname, '../FRONTEND');
const rootPath = path.join(__dirname, '..');

// Detectar si estamos en estructura PROYECTO KIVRA o kivra-nutrir
if (require('fs').existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    console.log('Sirviendo archivos estáticos desde:', frontendPath);
} else {
    app.use(express.static(rootPath));
    console.log('Sirviendo archivos estáticos desde:', rootPath);
}
// Configuración de multer para guardar imágenes (detecta estructura)
const imagenesPath = require('fs').existsSync(path.join(__dirname, '../FRONTEND/imagenes')) 
    ? path.join(__dirname, '../FRONTEND/imagenes')
    : path.join(__dirname, '../imagenes');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, imagenesPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Configura la conexión a MySQL usando variables de entorno (Railway)
const db = mysql.createConnection({
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    port: process.env.MYSQLPORT || 3306,
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '1234',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'kivra'
});

// Prueba la conexión
db.connect((err) => {
    if (err) {
        console.error('Error de conexión:', err);
    } else {
        console.log('Conectado a MySQL');
    }
});

// Endpoint para obtener productos
app.get('/api/productos', (req, res) => {
    db.query('SELECT * FROM productos', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// Endpoint para actualizar el stock de un producto
app.put('/api/productos/:id/stock', (req, res) => {
    const id = req.params.id;
    const nuevoStock = req.body.stock;
    const accionFrontend = req.body.accion; // Puede ser 'venta', 'edicion', etc.
    // Obtener stock anterior
    db.query('SELECT stock FROM productos WHERE id = ?', [id], (err, rows) => {
        if (err || rows.length === 0) return res.status(500).json({ error: 'Producto no encontrado' });
        const stockAntes = rows[0].stock;
        db.query('UPDATE productos SET stock = ? WHERE id = ?', [nuevoStock, id], (err, result) => {
            if (err) return res.status(500).json({ error: err });
            // Registrar movimiento
            const cantidad = Math.abs(nuevoStock - stockAntes);
            let accion = 'entrada';  // Valor por defecto compatible con ENUM
            if (accionFrontend === 'venta') {
                accion = 'salida';   // Venta = salida de stock
            } else if (nuevoStock < stockAntes) {
                accion = 'salida';   // Descuento = salida de stock
            } else if (nuevoStock > stockAntes) {
                accion = 'entrada';  // Ingreso = entrada de stock
            }
            db.query('INSERT INTO movimientos (producto_id, accion, cantidad, stock_antes, stock_despues, usuario) VALUES (?, ?, ?, ?, ?, ?)',
                [id, accion, cantidad, stockAntes, nuevoStock, 'admin'],
                (err2) => {
                    if (err2) console.error('Error al registrar movimiento:', err2);
                    res.json({ success: true });
                });
        });
    });
});
    // Endpoint para agregar producto con descripción
    app.post('/api/productos', upload.single('imagen'), (req, res) => {
        const { nombre, descripcion, categoria, precio, stock } = req.body;
        const imagen = req.file ? req.file.filename : null;
        db.query('INSERT INTO productos (nombre, descripcion, imagen, categoria, precio, stock) VALUES (?, ?, ?, ?, ?, ?)', [nombre, descripcion, imagen, categoria, precio, stock], (err, result) => {
            if (err) return res.status(500).json({ success: false, error: err });
            // Registrar movimiento de alta
            const productoId = result.insertId;
            db.query('INSERT INTO movimientos (producto_id, accion, cantidad, stock_antes, stock_despues, usuario) VALUES (?, ?, ?, ?, ?, ?)',
                [productoId, 'entrada', stock, 0, stock, 'admin'],
                (err2) => {
                    if (err2) console.error('Error al registrar movimiento de alta:', err2);
                    res.json({ success: true });
                });
        });
    });
    // Endpoint para eliminar producto
    app.delete('/api/productos/:id', (req, res) => {
        const id = req.params.id;
        // Obtener stock antes de eliminar
        db.query('SELECT stock FROM productos WHERE id = ?', [id], (err, rows) => {
            const stockAntes = rows && rows.length ? rows[0].stock : 0;
            db.query('DELETE FROM productos WHERE id = ?', [id], (err, result) => {
                if (err) return res.status(500).json({ success: false, error: 'Error al eliminar producto' });
                if (result.affectedRows === 0) {
                    return res.status(404).json({ success: false, error: 'Producto no encontrado' });
                }
                // Registrar movimiento de eliminación
                db.query('INSERT INTO movimientos (producto_id, accion, cantidad, stock_antes, stock_despues, usuario) VALUES (?, ?, ?, ?, ?, ?)',
                    [id, 'salida', stockAntes, stockAntes, 0, 'admin'],
                    (err2) => {
                        if (err2) console.error('Error al registrar movimiento de eliminación:', err2);
                        res.json({ success: true });
                    });
            });
        });
    });

// Endpoint para actualizar producto completo
app.put('/api/productos/:id', upload.single('imagen'), (req, res) => {
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
    
    db.query(updateQuery, updateParams, (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err });
        
        // Registrar movimiento de edición
        db.query('INSERT INTO movimientos (producto_id, accion, cantidad, stock_antes, stock_despues, usuario) VALUES (?, ?, ?, ?, ?, ?)',
            [id, 'entrada', 0, stock, stock, 'admin'],
            (err2) => {
                if (err2) console.error('Error al registrar movimiento de edición:', err2);
                res.json({ success: true });
            });
    });
});

// Endpoint para obtener historial de movimientos
app.get('/api/movimientos', (req, res) => {
    const sql = `
        SELECT m.*, p.nombre AS producto_nombre
        FROM movimientos m
        LEFT JOIN productos p ON m.producto_id = p.id
        ORDER BY m.fecha DESC
        LIMIT 200
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// Puerto de escucha dinámico para Railway
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en puerto ${PORT}`);
});