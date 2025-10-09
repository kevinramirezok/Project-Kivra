-- Script de base de datos para PostgreSQL (Render)
-- Kivra Nutrir - Sistema de gestión de productos

-- Crear tabla productos
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    imagen VARCHAR(255),
    categoria VARCHAR(100),
    precio DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla movimientos
CREATE TABLE IF NOT EXISTS movimientos (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(id),
    accion VARCHAR(50) NOT NULL CHECK (accion IN ('entrada', 'salida')),
    cantidad INTEGER NOT NULL,
    stock_antes INTEGER NOT NULL,
    stock_despues INTEGER NOT NULL,
    usuario VARCHAR(100) DEFAULT 'admin',
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar productos de ejemplo (opcional)
INSERT INTO productos (nombre, descripcion, categoria, precio, stock, imagen) VALUES
('BARRITA BOCADITO DE MANI', 'Deliciosa barrita con bocaditos de maní natural', 'barritas', 2500.00, 15, 'BARRITA BOCADITO DE MANI.jpg'),
('BARRITA DE SESAMO', 'Barrita nutritiva con semillas de sésamo', 'barritas', 2300.00, 20, 'BARRITA DE SESAMO.jpg'),
('BARRITA DULCE DE LECHE', 'Barrita con el sabor clásico del dulce de leche', 'barritas', 2700.00, 12, 'BARRITA DULCE DE LECHE.jpg'),
('BARRITA ENERGÉTICA', 'Barrita ideal para deportistas y actividades físicas', 'barritas', 2800.00, 18, 'BARRITA ENERGÉTICA.jpg'),
('BARRITA GRANOLA', 'Barrita con mix de granola y frutos secos', 'barritas', 2600.00, 14, 'BARRITA GRANOLA.jpg'),
('BARRITA KETO', 'Barrita baja en carbohidratos para dieta cetogénica', 'barritas', 3200.00, 10, 'BARRITA KETO.jpg'),
('BARRITA NATURAL', 'Barrita 100% natural sin conservantes', 'barritas', 2400.00, 22, 'BARRITA NATURAL.jpg'),
('BARRITA PROTEICA', 'Barrita alta en proteínas para recuperación muscular', 'barritas', 3000.00, 16, 'BARRITA PROTEICA.jpg'),
('GRANOLA CROCANTE', 'Granola crujiente con miel y frutos secos', 'granolas', 4500.00, 8, 'GRANOLA CROCANTE.jpg'),
('GRANOLA ENERGÉTICA', 'Granola con superalimentos para más energía', 'granolas', 5200.00, 6, 'GRANOLA ENERGÉTICA.jpg'),
('GRANOLA KETO', 'Granola baja en carbohidratos', 'granolas', 5800.00, 4, 'GRANOLA KETO.jpg'),
('GRANOLA NATURAL', 'Granola artesanal con ingredientes orgánicos', 'granolas', 4800.00, 9, 'GRANOLA NATURAL.jpg'),
('TURRON CROCANTE DE MANI', 'Turrón crujiente con maní tostado', 'turrones', 3500.00, 7, 'TURRON CROCANTE DE MANI.jpg'),
('TURRON ENERGETICO', 'Turrón con ingredientes energizantes', 'turrones', 3800.00, 5, 'TURRON ENERGETICO.jpg');

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_movimientos_producto_id ON movimientos(producto_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos(fecha);