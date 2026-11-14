const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mysql = require('mysql2/promise');
const sourceFile = path.join(__dirname, 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME || 'sauz_store_db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 2,
  decimalNumbers: true,
  charset: 'utf8mb4'
});

function getVariants(product) {
  const variants = Array.isArray(product.variants) && product.variants.length
    ? product.variants
    : [{ id: 'legacy-single', size: 'Única', stock: Number(product.stock) || 0 }];
  return variants.map((variant, index) => {
    const stock = Number(variant.stock);
    if (!Number.isInteger(stock) || stock < 0) {
      throw new Error(`Stock inválido en "${product.name}", variante ${index + 1}.`);
    }
    return {
      sourceKey: `json:${product.id}:${encodeURIComponent(String(variant.id || index + 1))}`,
      size: String(variant.size || 'Única').trim(),
      color: String(variant.color || '').trim(),
      stock
    };
  });
}

async function ensureImportSchema(connection) {
  const [columns] = await connection.query(
    `SELECT column_name
       FROM information_schema.columns
      WHERE table_schema = DATABASE() AND table_name = 'products'`
  );
  const existing = new Set(columns.map(column => column.column_name));
  const additions = [
    ['source_import_key', 'VARCHAR(180) NULL'],
    ['subcategory', "VARCHAR(80) NOT NULL DEFAULT ''"],
    ['icon', "VARCHAR(32) NOT NULL DEFAULT ''"],
    ['alternate_images', 'JSON NULL'],
    ['commercial', 'TINYINT(1) NOT NULL DEFAULT 1']
  ];
  for (const [name, definition] of additions) {
    if (!existing.has(name)) {
      await connection.query(`ALTER TABLE products ADD COLUMN \`${name}\` ${definition}`);
    }
  }
  const [indexes] = await connection.query(
    `SELECT index_name
       FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = 'products'
        AND index_name = 'uq_products_source_import_key'`
  );
  if (!indexes.length) {
    await connection.query(
      'ALTER TABLE products ADD UNIQUE KEY uq_products_source_import_key (source_import_key)'
    );
  }
}

async function importProduct(connection, product) {
  const variants = getVariants(product);
  const productId = Number(product.id);
  if (!Number.isInteger(productId) || productId <= 0) {
    throw new Error(`ID inválido en el producto "${product.name}".`);
  }
  const name = String(product.name || '').trim();
  if (!name) throw new Error(`Hay un producto sin nombre (ID ${product.id}).`);

  const fields = {
    name,
    sku: String(product.sku || `SAUZ-${product.id}`).trim(),
    brand: String(product.brand || '').trim(),
    description: String(product.description || product.detailedDescription || '').trim(),
    image: String(product.image || '').trim(),
    category: String(product.category || 'Camisetas').trim(),
    subcategory: String(product.subcategory || '').trim(),
    price: Number.isFinite(Number(product.price)) ? Number(product.price) : 0,
    previousPrice: Number(product.previousPrice) > 0 ? Number(product.previousPrice) : null,
    icon: String(product.icon || '').trim(),
    alternateImages: JSON.stringify(Array.isArray(product.alternateImages) ? product.alternateImages : []),
    active: product.active === false ? 0 : 1,
    commercial: product.commercial === false ? 0 : 1
  };
  if (fields.image.length > 1000) throw new Error(`La ruta de imagen de "${name}" es demasiado larga.`);

  const keys = variants.map(variant => variant.sourceKey);
  const placeholders = keys.map(() => '?').join(', ');
  const [existingRows] = await connection.execute(
    `SELECT id_product, product_group_id, source_import_key
       FROM products
      WHERE source_import_key IN (${placeholders})
      FOR UPDATE`,
    keys
  );
  const rowByKey = new Map(existingRows.map(row => [row.source_import_key, row]));
  let groupId = existingRows[0]?.product_group_id || null;

  for (const variant of variants) {
    const existing = rowByKey.get(variant.sourceKey);
    if (existing) {
      if (groupId === null) groupId = existing.product_group_id;
      await connection.execute(
        `UPDATE products
            SET product_group_id = ?, name = ?, sku = ?, brand = ?, description = ?,
                image_url = ?, category = ?, subcategory = ?, size = ?, color = ?,
                price = ?, previous_price = ?, stock = ?, active = ?, icon = ?,
                alternate_images = ?, commercial = ?
          WHERE id_product = ?`,
        [groupId, fields.name, fields.sku, fields.brand, fields.description,
          fields.image, fields.category, fields.subcategory, variant.size,
          variant.color, fields.price, fields.previousPrice, variant.stock,
          fields.active, fields.icon, fields.alternateImages, fields.commercial,
          existing.id_product]
      );
      continue;
    }

    const [result] = await connection.execute(
      `INSERT INTO products
        (product_group_id, source_import_key, name, sku, brand, description,
         image_url, category, subcategory, size, color, price, previous_price,
         stock, active, icon, alternate_images, commercial)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [groupId || 0, variant.sourceKey, fields.name, fields.sku, fields.brand,
        fields.description, fields.image, fields.category, fields.subcategory,
        variant.size, variant.color, fields.price, fields.previousPrice,
        variant.stock, fields.active, fields.icon, fields.alternateImages,
        fields.commercial]
    );
    if (groupId === null) {
      groupId = result.insertId;
      await connection.execute(
        'UPDATE products SET product_group_id = ? WHERE id_product = ?',
        [groupId, result.insertId]
      );
    }
  }
}

async function main() {
  const connection = await pool.getConnection();
  let transactionStarted = false;
  try {
    const [schema] = await connection.query(
      `SELECT COUNT(*) AS required_columns
         FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'products'
          AND column_name IN ('product_group_id', 'previous_price', 'active')`
    );
    if (Number(schema[0].required_columns) !== 3) {
      throw new Error('Aplica primero backend/mysql-migration.sql en phpMyAdmin.');
    }

    await ensureImportSchema(connection);
    await connection.beginTransaction();
    transactionStarted = true;
    for (const product of products) await importProduct(connection, product);
    await connection.commit();
    transactionStarted = false;

    const [counts] = await connection.query(
      `SELECT COUNT(DISTINCT product_group_id) AS imported_products,
              COUNT(*) AS imported_variants,
              SUM(active = 1) AS active_variants
         FROM products
        WHERE source_import_key IS NOT NULL`
    );
    console.log(JSON.stringify({
      success: true,
      sourceProducts: products.length,
      importedProducts: Number(counts[0].imported_products),
      importedVariants: Number(counts[0].imported_variants),
      activeVariants: Number(counts[0].active_variants)
    }, null, 2));
  } catch (error) {
    if (transactionStarted) {
      try {
        await connection.rollback();
      } catch {
        // Keep the original import error.
      }
    }
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

main().catch(error => {
  console.error('No se pudieron importar los productos:', error.message);
  process.exitCode = 1;
});
