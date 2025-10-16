/**
 * Script para agregar TODOS los productos reales de Kivra Nutrir
 * Ejecutar con: node BACKEND/agregar-productos-completos.js
 */

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL || 
    `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@dpg-d3jvgpvdiees738q8qs0-a.oregon-postgres.render.com:5432/${process.env.PGDATABASE}`;

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function agregarProductos() {
    console.log('🚀 Agregando productos completos a la base de datos...\n');
    
    try {
        // GRANOLAS POR 1KG
        const granolas = [
            ['GRANOLA PREMIUM', 'Avena tostada, semillas de chía, almendras, castañas caju, duraznos, peras, pasas de uva y miel de abejas', 'granolas', 9900, 10, 'GRANOLA PREMIUM.jpg'],
            ['GRANOLA MADRE TIERRA', 'Avena, harina de algarroba, arándanos pasa, quinoa pop, sal, aceite de girasol, trigo Saraceno, coco en escamas, saborizante de vainilla, fructosa', 'granolas', 9900, 10, 'GRANOLA MADRE TIERRA.jpg'],
            ['GRANOLA FUERZA NATURAL', 'Avena, maní, maní triturado, quinoa pop, copos maíz sin azúcar, almendras, aceite de girasol, sal, saborizante (vainilla), fructosa', 'granolas', 9900, 10, 'GRANOLA FUERZA NATURAL.jpg'],
            ['GRANOLA CROCANTE', 'Avena tostada, copos de maíz sin azúcar, semillas de lino, semillas de girasol pelado, semillas de chía, sésamo integral y fructosa', 'granolas', 9500, 10, 'GRANOLA CROCANTE.jpg'],
            ['GRANOLA ESPECIAL CON FRUTAS', 'Avena tostada, duraznos, peras, almendras, pasas de uva y miel de abejas', 'granolas', 9500, 10, 'GRANOLA ESPECIAL CON FRUTAS.jpg'],
            ['GRANOLA NATURAL', 'Avena tostada, copos de maíz sin azúcar, almendras, sésamo integral, pasas de uva y fructosa', 'granolas', 9500, 10, 'GRANOLA NATURAL.jpg'],
            ['GRANOLA ENERGÉTICA', 'Avena tostada, copos de maíz sin azúcar, almendras, maní pelado, girasol pelado y fructosa', 'granolas', 9500, 10, 'GRANOLA ENERGÉTICA.jpg'],
            ['GRANOLA CROCANTE CON MANZANAS', 'Avena tostada, copos de maíz sin azúcar, nueces, pasas de uva, manzana y fructosa', 'granolas', 9500, 10, 'GRANOLA CROCANTE CON MANZANAS.jpg'],
            ['GRANOLA TROPICAL', 'Avena tostada, pasas de uva, copos de maíz sin azúcar, banana, almendras y fructosa', 'granolas', 9500, 10, 'GRANOLA TROPICAL.jpg'],
            ['GRANOLA KETO', 'Granola, nueces, maní, pasta de maní, almendras, arándanos, chocolate 80%, girasol, chía, sésamo', 'granolas', 16800, 5, 'GRANOLA KETO.jpg']
        ];

        // BARRITAS 45g
        const barritas45g = [
            ['BARRITA PROTEICA', 'Barra de cereal, lino, girasol, chía, chocolate y pasta de maní', 'barritas', 1150, 20, 'BARRITA PROTEICA.jpg'],
            ['BARRITA DULCE DE LECHE', 'Barra de cereal, dulce de leche, maní, nueces y miel', 'barritas', 1150, 20, 'BARRITA DULCE DE LECHE.jpg'],
            ['BARRITA TRIGO SARRACENO', 'Barra de cereal, trigo, sarraceno, algarroba, arándanos, quinoa y coco', 'barritas', 1150, 20, 'BARRITA TRIGO SARRACENO.jpg'],
            ['BARRITA ENERGÉTICA', 'Barra de cereal, maní, quinoa, almendra y miel', 'barritas', 1150, 20, 'BARRITA ENERGÉTICA.jpg']
        ];

        // BARRITAS 55g
        const barritas55g = [
            ['BARRITA NATURAL', 'Granola, pasta de maní, maní, pasas de uva y sésamo integral', 'barritas', 1000, 25, 'BARRITA NATURAL.jpg'],
            ['BARRITA GRANOLA', 'Cereal, granola, pasas de uva y miel', 'barritas', 1000, 25, 'BARRITA GRANOLA.jpg'],
            ['BARRITA DE SESAMO', 'Sésamo, coco y miel', 'barritas', 1000, 25, 'BARRITA DE SESAMO.jpg'],
            ['BARRITA DE MANI', 'Maní, pasas de uva y miel', 'barritas', 1000, 25, 'BARRITA DE MANI.jpg']
        ];

        // TURRONES 85g
        const turrones = [
            ['TURRON ENERGETICO DE CHIA', 'Sésamo, almendras tostadas, girasol, chía y miel', 'turrones', 1600, 15, 'TURRON ENERGETICO DE CHIA.jpg'],
            ['TURRON ENERGETICO', 'Girasol tostado, semillas de lino, quinoa y fructosa', 'turrones', 1600, 15, 'TURRON ENERGETICO.jpg'],
            ['TURRON PURO CALCIO', 'Sésamo blanco, sésamo negro, nueces y fructosa', 'turrones', 1600, 15, 'TURRON PURO CALCIO.jpg'],
            ['TURRON PURA FIBRA', 'Avena, maní tostado, hojuelas de maíz sin azúcar, chía y fructosa', 'turrones', 1600, 15, 'TURRON PURA FIBRA.jpg'],
            ['TURRON CROCANTE DE MANI', 'Maní seleccionado y fructosa', 'turrones', 1600, 15, 'TURRON CROCANTE DE MANI.jpg']
        ];

        // PRODUCTOS KETO
        const keto = [
            ['BARRITA KETO', 'Barritas de cereal, nueces, maní, pasta de maní, almendras, arándanos, chocolate 80%, girasol, chía, sésamo', 'barritas', 2500, 12, 'BARRITA KETO.jpg']
        ];

        // Unir todos los productos
        const todosLosProductos = [
            ...granolas,
            ...barritas45g,
            ...barritas55g,
            ...turrones,
            ...keto
        ];

        console.log(`📦 Total de productos a insertar: ${todosLosProductos.length}\n`);

        let insertados = 0;
        let actualizados = 0;

        for (const prod of todosLosProductos) {
            const [nombre, descripcion, categoria, precio, stock, imagen] = prod;
            
            // Verificar si el producto ya existe
            const existe = await pool.query('SELECT id FROM productos WHERE nombre = $1', [nombre]);
            
            if (existe.rows.length > 0) {
                // Actualizar producto existente
                await pool.query(
                    'UPDATE productos SET descripcion = $1, categoria = $2, precio = $3, stock = $4, imagen = $5 WHERE nombre = $6',
                    [descripcion, categoria, precio, stock, imagen, nombre]
                );
                console.log(`  ↻ Actualizado: ${nombre}`);
                actualizados++;
            } else {
                // Insertar nuevo producto
                await pool.query(
                    'INSERT INTO productos (nombre, descripcion, categoria, precio, stock, imagen) VALUES ($1, $2, $3, $4, $5, $6)',
                    [nombre, descripcion, categoria, precio, stock, imagen]
                );
                console.log(`  ✓ Insertado: ${nombre}`);
                insertados++;
            }
        }

        // Mostrar resumen
        const { rows: totalProductos } = await pool.query('SELECT COUNT(*) as count FROM productos');
        
        console.log('\n📊 RESUMEN:');
        console.log(`   ✓ Productos insertados: ${insertados}`);
        console.log(`   ↻ Productos actualizados: ${actualizados}`);
        console.log(`   📦 Total en base de datos: ${totalProductos[0].count}`);
        console.log('\n✨ ¡Productos agregados exitosamente!\n');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await pool.end();
    }
}

// Ejecutar script
agregarProductos();
