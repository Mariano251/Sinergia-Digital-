require('dotenv').config();
const pool = require('../src/config/database');

const seed = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🌱 Iniciando seed de TechNova...\n');

    // ── Categorías ────────────────────────────────────────────────────────
    const categoriesData = [
      { name: 'Periféricos',    slug: 'perifericos',    description: 'Teclados, mouse pads, webcams y más' },
      { name: 'Audio',          slug: 'audio',          description: 'Auriculares, headsets y equipos de sonido' },
      { name: 'Monitores',      slug: 'monitores',      description: 'Monitores Full HD, 4K y curvos' },
      { name: 'Almacenamiento', slug: 'almacenamiento', description: 'SSD, HDD y memorias USB' },
      { name: 'Accesorios',     slug: 'accesorios',     description: 'Cables, hubs y accesorios varios' },
    ];

    const categoryMap = {};
    for (const cat of categoriesData) {
      const res = await client.query(
        `INSERT INTO categories (name, slug, description)
         VALUES ($1, $2, $3)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
         RETURNING id, slug`,
        [cat.name, cat.slug, cat.description]
      );
      categoryMap[res.rows[0].slug] = res.rows[0].id;
    }
    console.log('✅ Categorías insertadas:', Object.keys(categoryMap).join(', '));

    // ── Productos ─────────────────────────────────────────────────────────
    const productsData = [
      {
        name:         'Teclado Mecánico RGB',
        description:  'Teclado mecánico con switches Blue, retroiluminación RGB por tecla totalmente personalizable y chasis de aluminio anodizado. Anti-ghosting completo, perfecto para gaming y trabajo intensivo.',
        price:        55000,
        stock:        50,
        category_slug:'perifericos',
        image_url:    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80',
        featured:     true
      },
      {
        name:         'Mouse Pad XL',
        description:  'Mouse pad extra grande de 900×400 mm con superficie de tela de microfibra de alta precisión, base de goma antideslizante y bordes cosidos para mayor durabilidad.',
        price:        20000,
        stock:        100,
        category_slug:'perifericos',
        image_url:    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80',
        featured:     false
      },
      {
        name:         'Auriculares Bluetooth Pro',
        description:  'Auriculares inalámbricos con cancelación activa de ruido híbrida, 30 horas de batería, drivers de 40 mm y audio Hi-Res certificado. Compatible con Multipoint para 2 dispositivos simultáneos.',
        price:        45000,
        stock:        30,
        category_slug:'audio',
        image_url:    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
        featured:     true
      },
      {
        name:         'Monitor 27" Full HD',
        description:  'Monitor IPS 27 pulgadas con resolución Full HD 1920×1080, frecuencia de actualización de 144 Hz, tiempo de respuesta 1 ms y compatibilidad con FreeSync Premium. Ideal para gaming competitivo.',
        price:        180000,
        stock:        15,
        category_slug:'monitores',
        image_url:    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80',
        featured:     true
      },
      {
        name:         'SSD 1TB NVMe',
        description:  'Unidad de estado sólido NVMe PCIe 4.0 de 1 TB con velocidades de lectura secuencial de hasta 7000 MB/s y escritura de 6500 MB/s. Ideal para reducir tiempos de carga en juegos y trabajo profesional.',
        price:        85000,
        stock:        40,
        category_slug:'almacenamiento',
        image_url:    'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&q=80',
        featured:     true
      },
      {
        name:         'Webcam 1080p',
        description:  'Webcam Full HD 1080p a 30 fps con micrófono estéreo integrado con reducción de ruido, autofocus automático y corrección de luz. Compatible con OBS, Zoom, Teams y Discord.',
        price:        35000,
        stock:        25,
        category_slug:'perifericos',
        image_url:    'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&q=80',
        featured:     false
      },
      {
        name:         'Headset Gamer 7.1',
        description:  'Headset gaming con sonido surround virtual 7.1, drivers de 50 mm neodimio, micrófono retráctil con cancelación de ruido, iluminación RGB y peso ultraligero de 268 g.',
        price:        65000,
        stock:        20,
        category_slug:'audio',
        image_url:    'https://images.unsplash.com/photo-1599669454699-248893623440?w=400&q=80',
        featured:     true
      },
      {
        name:         'Cable USB-C 2m',
        description:  'Cable USB-C a USB-C de 2 metros con carga rápida 100W (PD 3.0), transferencia de datos USB 3.2 Gen 2 (10 Gbps), compatibilidad con DisplayPort Alt Mode y trenza de nylon duradera.',
        price:        4000,
        stock:        200,
        category_slug:'accesorios',
        image_url:    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&q=80',
        featured:     false
      },
    ];

    let insertedCount = 0;
    for (const p of productsData) {
      const categoryId = categoryMap[p.category_slug];
      if (!categoryId) {
        console.warn(`⚠️  Categoría "${p.category_slug}" no encontrada para "${p.name}"`);
        continue;
      }

      await client.query(
        `INSERT INTO products (name, description, price, stock, category_id, image_url, featured)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [p.name, p.description, p.price, p.stock, categoryId, p.image_url, p.featured]
      );
      insertedCount++;
    }

    console.log(`✅ ${insertedCount} productos insertados`);

    await client.query('COMMIT');

    console.log('\n🚀 Seed completado exitosamente!');
    console.log(`   → ${categoriesData.length} categorías`);
    console.log(`   → ${insertedCount} productos`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error en el seed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

seed().catch(process.exit.bind(process, 1));
