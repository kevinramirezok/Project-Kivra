-- Script SQL para crear la base de datos KIVRA en Railway
-- Generado desde la base de datos local

-- Crear tabla productos
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100),
    precio DECIMAL(10,2),
    imagen VARCHAR(255),
    stock INT DEFAULT 0
);

-- Crear tabla movimientos
CREATE TABLE movimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT,
    accion ENUM('entrada', 'salida') NOT NULL,
    cantidad INT NOT NULL,
    stock_antes INT,
    stock_despues INT,
    usuario VARCHAR(100),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Insertar productos
INSERT INTO productos (nombre, descripcion, categoria, precio, imagen, stock) VALUES ('Barrita Proteica', 'Barra de cereal, trigo, girasol, chía, chocolate y aceite de maní', 'barritas', 1150.00, 'BARRITA PROTEICA.jpg', 20);
INSERT INTO productos (nombre, descripcion, categoria, precio, imagen, stock) VALUES ('Barrita Trigo Sarraceno', 'Barra de cereal, trigo sarraceno, algarroba, arándanos, quinoa y chía', 'barritas', 1150.00, 'BARRITA TRIGO CERRACENO.jpg', 5);
INSERT INTO productos (nombre, descripcion, categoria, precio, imagen, stock) VALUES ('Barrita Natural', 'Granola, pasta de maíz, maní, pasas de uva y sésamo integral', 'barritas', 1000.00, 'BARRITA NATURAL.jpg', 16);
INSERT INTO productos (nombre, descripcion, categoria, precio, imagen, stock) VALUES ('Barrita Granola', 'Cereal, girasol, pasas de uva y miel', 'barritas', 1000.00, 'BARRITA GRANOLA.jpg', 20);
INSERT INTO productos (nombre, descripcion, categoria, precio, imagen, stock) VALUES ('Barrita de Sésamo', 'Sésamo, coco y miel', 'barritas', 1000.00, 'BARRITA DE SESAMO.jpg', 20);
INSERT INTO productos (nombre, descripcion, categoria, precio, imagen, stock) VALUES ('Barrita Bocadito de Maní', 'Maní, pasas de uva y miel', 'barritas', 1000.00, 'BARRITA BOCADITO DE MANI.jpg', 20);
INSERT INTO productos (nombre, descripcion, categoria, precio, imagen, stock) VALUES ('Barrita Keto', 'Barritas de cereal, nueces, maní, pasta de maní, almendras, arándanos, chocolate 80%, girasol, chía, sésamo', 'barritas', 2500.00, 'BARRITA KETO.jpg', 20);
INSERT INTO productos (nombre, descripcion, categoria, precio, imagen, stock) VALUES ('Turrón Energético de Chía', 'Sésamo, almendras tostadas, girasol, chía y miel', 'otros', 1600.00, 'TURRON ENERGETICO DE CHIA.jpg', 20);
INSERT INTO productos (nombre, descripcion, categoria, precio, imagen, stock) VALUES ('Turrón Energético', 'Girasol tostado, semillas de lino, quinoa y fructosa', 'otros', 1600.00, 'TURRON ENERGETICO.jpg', 5);
INSERT INTO productos (nombre, descripcion, categoria, precio, imagen, stock) VALUES ('Turrón Puro Calcio', 'Sésamo blanco, sésamo negro, nueces y miel', 'otros', 1600.00, 'TURRON PURO CALCIO.jpg', 20);
INSERT INTO productos (nombre, descripcion, categoria, precio, imagen, stock) VALUES ('Turrón Pura Fibra', 'Avena, maní tostado, semillas de maíz sin azúcar, chía y fructosa', 'otros', 1600.00, 'TURRON PUTA FIBRA.jpg', 20);
INSERT INTO productos (nombre, descripcion, categoria, precio, imagen, stock) VALUES ('Turrón Crocante de Maní', 'Maní seleccionado y fructosa', 'otros', 1600.00, 'TURRON CROCANTE DE MANI.jpg', 20);
INSERT INTO productos (nombre, descripcion, categoria, precio, imagen, stock) VALUES ('Granola Premium', 'Avena tostada, semillas de chía, almendras, castañas cajú, duraznos, peras, pasas de uva y miel de abejas', 'granolas', 9900.00, 'GRANOLA PREMIUM.jpg', 20);
INSERT INTO productos (nombre, descripcion, categoria, precio, imagen, stock) VALUES ('Granola Madre Tierra', 'Avena, harina de algarroba, arándanos, pasas de uva, quinoa pop, sal, aceite de girasol, trigo Sarraceno, coco en escamas, saborizante de vainilla, fructosa', 'granolas', 9900.00, 'GRANOLA  MADRE TIERRA.jpg', 24);
INSERT INTO productos (nombre, descripcion, categoria, precio, imagen, stock) VALUES ('Granola Fuerza Natural', 'Avena, maní triturado, quinoa pop, copos maíz sin azúcar, almendras, aceite de girasol, sal, saborizante (vainilla), fructosa', 'granolas', 9500.00, 'GRANOLA FUERZA NATURAL.jpg', 20);
INSERT INTO productos (nombre, descripcion, categoria, precio, imagen, stock) VALUES ('Granola Crocante', 'Avena tostada, copos de maíz sin azúcar, semillas de lino, semillas de girasol pelado, semillas de chía, sésamo integral y fructosa', 'granolas', 9500.00, 'GRANOLA CROCANTE.jpg', 20);
INSERT INTO productos (nombre, descripcion, categoria, precio, imagen, stock) VALUES ('Granola Especial con Frutas', 'Avena tostada, duraznos, peras, almendras, pasas de uva y miel de abejas', 'granolas', 9500.00, 'GRANOLA ESPECIAL CON FRUTAS.jpg', 15);
INSERT INTO productos (nombre, descripcion, categoria, precio, imagen, stock) VALUES ('Granola Natural', 'Avena tostada, copos de maíz sin azúcar, almendras, sésamo integral, pasas de uva y miel', 'granolas', 9500.00, 'GRANOLA NATURAL.jpg', 16);
INSERT INTO productos (nombre, descripcion, categoria, precio, imagen, stock) VALUES ('Granola Energética', 'Avena tostada, semillas de chía, almendras, maní pelado, girasol pelado y fructosa', 'granolas', 9500.00, 'GRANOLA ENERGÉTICA.jpg', 20);
INSERT INTO productos (nombre, descripcion, categoria, precio, imagen, stock) VALUES ('Granola Crocante con Manzanas', 'Avena tostada, copos de maíz sin azúcar, nueces, pasas de uva, manzana y fructosa', 'granolas', 9500.00, 'GRANOLA  CROCANTE CON MANZANAS.jpg', 20);
INSERT INTO productos (nombre, descripcion, categoria, precio, imagen, stock) VALUES ('Granola Tropical', 'Avena tostada, pasas de uva, copos de maíz sin azúcar, banana, almendras y fructosa', 'granolas', 9500.00, 'GRANOLA TROPICAL.jpg', 20);
INSERT INTO productos (nombre, descripcion, categoria, precio, imagen, stock) VALUES ('Granola Keto', 'Granola especial, maní, pasta de maní, almendras, girasol, chocolate 80%, girasol, chía, sésamo', 'granolas', 16800.00, 'GRANOLA KETO.jpg', 20);
INSERT INTO productos (nombre, descripcion, categoria, precio, imagen, stock) VALUES ('Barrita Dulce de Leche', 'Barra de cereal, dulce de leche, maní, nueces', 'barritas', 1150.00, '1759668504396-BARRITA DULCE DE LECHE.jpg', 20);