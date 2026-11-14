const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mysqlEnabled = Boolean(process.env.DB_NAME);
let pool;

if (mysqlEnabled) {
  const mysql = require('mysql2/promise');
  pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true,
    charset: 'utf8mb4'
  });
}

const parseJson = value => {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const splitName = value => {
  const parts = String(value || '').trim().split(/\s+/).filter(Boolean);
  return { name: parts.shift() || 'Cliente', lastName: parts.join(' ') };
};
const joinName = (name, lastName) => {
  const first = String(name || '').trim();
  const last = String(lastName || '').trim();
  return last && !first.toLowerCase().endsWith(` ${last.toLowerCase()}`)
    ? `${first} ${last}`.trim()
    : first;
};

function mapCustomer(row) {
  return {
    id: row.id_customer,
    name: joinName(row.name, row.last_name),
    email: row.email,
    role: String(row.user_role).toUpperCase() === 'ADMIN' ? 'admin' : 'cliente',
    phone: row.phone || '',
    address: row.address || '',
    city: row.city || '',
    docType: row.doc_type || '',
    documentNumber: String(row.id_customer),
    birthday: row.birthday || null,
    addresses: []
  };
}

function mapProducts(rows) {
  const groups = new Map();
  for (const row of rows) {
    if (!row.active) continue;
    const groupId = Number(row.product_group_id);
    let product = groups.get(groupId);
    if (!product) {
      product = {
        id: groupId,
        sku: row.sku || `SAUZ-${groupId}`,
        name: row.name,
        category: row.category,
        subcategory: row.subcategory || '',
        brand: row.brand || '',
        description: row.description || '',
        price: Number(row.price),
        previousPrice: row.previous_price == null ? null : Number(row.previous_price),
        image: row.image_url || '',
        images: [row.image_url, ...(parseJson(row.alternate_images) || [])].filter(Boolean),
        alternateImages: parseJson(row.alternate_images) || [],
        icon: row.icon || '',
        colors: [],
        variants: [],
        active: true,
        commercial: Boolean(row.commercial) && Number(row.price) > 0
      };
      groups.set(groupId, product);
    }
    const color = row.color || '';
    if (color && !product.colors.includes(color)) product.colors.push(color);
    product.variants.push({
      id: String(row.id_product),
      size: row.size || 'Única',
      color,
      stock: Number(row.stock)
    });
  }
  return Array.from(groups.values()).map(product => ({
    ...product,
    stock: product.variants.reduce((total, variant) => total + variant.stock, 0)
  }));
}

function mapOrder(row, items, customer) {
  const date = new Date(row.sale_date);
  const trackingHistory = parseJson(row.tracking_history) || [];
  const shippingAddress = parseJson(row.shipping_address) || {};
  return {
    orderId: row.order_code,
    date: date.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota' }),
    timestamp: date.getTime(),
    customer: parseJson(row.customer_snapshot) || {
      userId: row.id_customer,
      name: customer?.name || 'Cliente Sauz Store',
      email: customer?.email || '',
      phone: customer?.phone || '',
      address: customer?.address || '',
      city: customer?.city || ''
    },
    shippingAddress,
    shippingTracking: shippingAddress.shippingTracking || null,
    payment: {
      method: row.payment_method,
      label: row.payment_method,
      status: row.payment_method === 'cash' ? 'Pendiente al recibir' : 'Aprobado exitosamente'
    },
    items,
    subtotal: Number(row.subtotal),
    tax: Number(row.tax),
    total: Number(row.total),
    count: Number(row.item_count),
    orderStatus: row.order_status,
    trackingHistory
  };
}

async function getProducts(connection = pool) {
  const [rows] = await connection.query(
    `SELECT id_product, product_group_id, name, category, subcategory, size, color, price,
            stock, sku, brand, description, image_url, alternate_images, icon,
            previous_price, active, commercial
       FROM products
      WHERE active = 1
      ORDER BY product_group_id, id_product`
  );
  return mapProducts(rows);
}

async function getCustomers(connection = pool) {
  const [rows] = await connection.query(
    `SELECT id_customer, doc_type, name, last_name, phone, email, address, city,
            birthday, user_role
       FROM customers
      ORDER BY id_customer`
  );
  return rows.map(mapCustomer);
}

async function getOrders(connection = pool) {
  const [sales] = await connection.query(
    `SELECT id_sale, id_customer, order_code, sale_date, total, subtotal, tax,
            item_count, payment_method, shipping_address, customer_snapshot,
            order_status, tracking_history
       FROM sales
      ORDER BY sale_date DESC, id_sale DESC`
  );
  if (!sales.length) return [];

  const saleIds = sales.map(sale => sale.id_sale);
  const saleIdPlaceholders = saleIds.map(() => '?').join(', ');
  const [items] = await connection.query(
    `SELECT id_sale, id_product, product_name, quantity, unit_price
       FROM sale_items
      WHERE id_sale IN (${saleIdPlaceholders})`,
    saleIds
  );
  const customerIds = [...new Set(sales.map(sale => sale.id_customer).filter(Boolean))];
  const customerById = new Map();
  if (customerIds.length) {
    const [customers] = await connection.query(
      `SELECT id_customer, name, last_name, phone, email, address, city
         FROM customers
        WHERE id_customer IN (?)`,
      [customerIds]
    );
    customers.forEach(customer => customerById.set(customer.id_customer, {
      ...customer,
      name: joinName(customer.name, customer.last_name)
    }));
  }
  const itemsBySale = new Map();
  for (const item of items) {
    if (!itemsBySale.has(item.id_sale)) itemsBySale.set(item.id_sale, []);
    itemsBySale.get(item.id_sale).push({
      productId: Number(item.id_product),
      variantId: String(item.id_product),
      name: item.product_name,
      quantity: Number(item.quantity),
      price: Number(item.unit_price),
      subtotal: Number(item.unit_price) * Number(item.quantity)
    });
  }
  return sales.map(sale => mapOrder(
    sale,
    itemsBySale.get(sale.id_sale) || [],
    customerById.get(sale.id_customer)
  ));
}

async function initialize() {
  await pool.query('SELECT 1');
  const [checks] = await pool.query(
    `SELECT COUNT(*) AS column_count
       FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = 'products'
        AND column_name = 'product_group_id'`
  );
  if (Number(checks[0].column_count) !== 1) {
    throw new Error('Falta aplicar backend/mysql-migration.sql en la base de datos.');
  }
  const [customerChecks] = await pool.query(
    `SELECT COUNT(*) AS column_count
       FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = 'customers'
        AND column_name = 'city'`
  );
  if (Number(customerChecks[0].column_count) !== 1) {
    throw new Error('La migración SQL está incompleta: falta customers.city.');
  }
  const [salesChecks] = await pool.query(
    `SELECT COUNT(*) AS column_count
       FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = 'sales'
        AND column_name = 'order_code'`
  );
  const [addressChecks] = await pool.query(
    `SELECT COUNT(*) AS table_count
       FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = 'customer_addresses'`
  );
  if (Number(salesChecks[0].column_count) !== 1 || Number(addressChecks[0].table_count) !== 1) {
    throw new Error('La migración SQL está incompleta: revisa las columnas de sales y customer_addresses.');
  }
  const [documentKeyChecks] = await pool.query(
    `SELECT table_name, column_type
       FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND ((table_name = 'customers' AND column_name = 'id_customer')
          OR (table_name = 'sales' AND column_name = 'id_customer')
          OR (table_name = 'customer_addresses' AND column_name = 'id_customer'))`
  );
  if (documentKeyChecks.length !== 3 ||
      documentKeyChecks.some(column => !column.column_type.startsWith('varchar(30)'))) {
    throw new Error('Aplica backend/document-id-migration.sql para usar el documento como id_customer.');
  }
  return {
    products: await getProducts(),
    users: await getCustomers(),
    orders: await getOrders()
  };
}

async function findCustomerByEmail(email, connection = pool) {
  const [rows] = await connection.execute(
    `SELECT id_customer, doc_type, name, last_name, phone, email, address, city,
            password_customer, birthday, user_role
       FROM customers
      WHERE LOWER(email) = ?
      LIMIT 1`,
    [String(email).trim().toLowerCase()]
  );
  return rows[0] || null;
}

async function authenticateCustomer(email, password, bcrypt) {
  const row = await findCustomerByEmail(email);
  if (!row) return null;
  const storedPassword = String(row.password_customer || '');
  const isHash = /^\$2[aby]\$/.test(storedPassword);
  const valid = isHash
    ? await bcrypt.compare(password, storedPassword)
    : storedPassword === password;
  if (!valid) return null;
  if (!isHash) {
    const passwordHash = await bcrypt.hash(password, 12);
    await pool.execute(
      'UPDATE customers SET password_customer = ? WHERE id_customer = ?',
      [passwordHash, row.id_customer]
    );
  }
  return getCustomerById(row.id_customer);
}

async function getCustomerById(id, connection = pool) {
  const [rows] = await connection.execute(
    `SELECT id_customer, doc_type, name, last_name, phone, email, address, city,
            birthday, user_role
       FROM customers WHERE id_customer = ? LIMIT 1`,
    [id]
  );
  return rows[0] ? mapCustomer(rows[0]) : null;
}

async function createCustomer(data, passwordHash) {
  const { name, lastName } = splitName(data.name);
  await pool.execute(
    `INSERT INTO customers
      (id_customer, doc_type, name, last_name, phone, email, address, city, password_customer,
       birthday, user_role)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 'CLIENT')`,
    [String(data.documentNumber), data.docType, name, lastName,
      data.phone || '', String(data.email).trim().toLowerCase(),
      data.address || '', data.city || '', passwordHash]
  );
  return getCustomerById(String(data.documentNumber));
}

async function updateCustomerProfile(customerId, fields) {
  const current = await getCustomerById(customerId);
  if (!current) return null;
  const nextName = fields.name || (fields.firstName || fields.lastName
    ? `${fields.firstName || ''} ${fields.lastName || ''}`.trim()
    : current.name);
  const { name, lastName } = splitName(nextName);
  const email = String(fields.newEmail || current.email).trim().toLowerCase();
  const phone = fields.phone === undefined ? current.phone : String(fields.phone).trim();
  const address = fields.address === undefined ? current.address : String(fields.address).trim();
  const city = fields.city === undefined ? current.city : String(fields.city).trim();
  try {
    await pool.execute(
      `UPDATE customers
          SET name = ?, last_name = ?, email = ?, phone = ?, address = ?, city = ?
        WHERE id_customer = ?`,
      [name, lastName, email, phone, address, city, customerId]
    );
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return { duplicateEmail: true };
    throw error;
  }
  return getCustomerById(customerId);
}

async function listAddresses(customerId) {
  const [rows] = await pool.execute(
    `SELECT id_address, recipient, phone, department, city, neighborhood, address,
            complement, address_references, is_default
       FROM customer_addresses
      WHERE id_customer = ?
      ORDER BY is_default DESC, id_address`,
    [customerId]
  );
  return rows.map(row => ({
    id: String(row.id_address),
    recipient: row.recipient,
    recipientName: row.recipient,
    phone: row.phone,
    department: row.department,
    city: row.city,
    neighborhood: row.neighborhood,
    address: row.address,
    complement: row.complement,
    references: row.address_references,
    isDefault: Boolean(row.is_default)
  }));
}

async function saveAddress(customerId, data, addressId = null) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [customerRows] = await connection.execute(
      'SELECT id_customer FROM customers WHERE id_customer = ? FOR UPDATE',
      [customerId]
    );
    if (!customerRows.length) {
      await connection.rollback();
      return null;
    }
    if (data.isDefault) {
      await connection.execute(
        'UPDATE customer_addresses SET is_default = 0 WHERE id_customer = ?',
        [customerId]
      );
    }
    if (addressId) {
      const [result] = await connection.execute(
        `UPDATE customer_addresses
            SET recipient = ?, phone = ?, department = ?, city = ?, neighborhood = ?,
                address = ?, complement = ?, address_references = ?, is_default = ?
          WHERE id_address = ? AND id_customer = ?`,
        [data.recipient, data.phone || '', data.department || '', data.city,
          data.neighborhood || '', data.address, data.complement || '',
          data.references || '', data.isDefault ? 1 : 0, addressId, customerId]
      );
      if (!result.affectedRows) {
        await connection.rollback();
        return false;
      }
    } else {
      const [count] = await connection.execute(
        'SELECT COUNT(*) AS total FROM customer_addresses WHERE id_customer = ?',
        [customerId]
      );
      const isDefault = data.isDefault || Number(count[0].total) === 0;
      await connection.execute(
        `INSERT INTO customer_addresses
          (id_customer, recipient, phone, department, city, neighborhood, address,
           complement, address_references, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [customerId, data.recipient, data.phone || '', data.department || '',
          data.city, data.neighborhood || '', data.address, data.complement || '',
          data.references || '', isDefault ? 1 : 0]
      );
    }
    await connection.commit();
    return listAddresses(customerId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function removeAddress(customerId, addressId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(
      'DELETE FROM customer_addresses WHERE id_address = ? AND id_customer = ?',
      [addressId, customerId]
    );
    if (!result.affectedRows) {
      await connection.rollback();
      return false;
    }
    const [remaining] = await connection.execute(
      'SELECT id_address FROM customer_addresses WHERE id_customer = ? ORDER BY id_address LIMIT 1',
      [customerId]
    );
    if (remaining.length) {
      await connection.execute(
        'UPDATE customer_addresses SET is_default = 1 WHERE id_address = ?',
        [remaining[0].id_address]
      );
    }
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function createProduct(data, variants) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    let groupId = null;
    for (const variant of variants) {
      const [result] = await connection.execute(
        `INSERT INTO products
          (product_group_id, name, sku, brand, description, image_url, category,
           size, color, price, previous_price, stock, active)
         VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [data.name, data.sku || '', data.brand || '', data.description || '',
          data.image || '', data.category || 'Camisetas', variant.size,
          variant.color || '', Number(data.price), data.previousPrice || null,
          variant.stock]
      );
      if (groupId === null) groupId = result.insertId;
      await connection.execute(
        'UPDATE products SET product_group_id = ? WHERE id_product = ?',
        [groupId, result.insertId]
      );
    }
    await connection.commit();
    return (await getProducts()).find(product => product.id === groupId) || null;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateProduct(groupId, changes, variants) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [existing] = await connection.execute(
      `SELECT id_product, size, color, price
         FROM products
        WHERE product_group_id = ? AND active = 1
        FOR UPDATE`,
      [groupId]
    );
    if (!existing.length) {
      await connection.rollback();
      return null;
    }
    const fields = {
      name: changes.name,
      category: changes.category,
      sku: changes.sku,
      brand: changes.brand,
      description: changes.description,
      image_url: changes.image,
      price: changes.price,
      previous_price: changes.previousPrice
    };
    const updates = Object.entries(fields).filter(([, value]) => value !== undefined);
    if (updates.length) {
      const assignments = updates.map(([key]) => `\`${key}\` = ?`).join(', ');
      const values = updates.map(([, value]) => value);
      await connection.execute(
        `UPDATE products SET ${assignments} WHERE product_group_id = ?`,
        [...values, groupId]
      );
    }
    if (variants) {
      const activeIds = new Set(variants.map(variant => String(variant.id)));
      for (const existingVariant of existing) {
        if (!activeIds.has(String(existingVariant.id_product))) {
          await connection.execute(
            'UPDATE products SET active = 0 WHERE id_product = ?',
            [existingVariant.id_product]
          );
        }
      }
      for (const variant of variants) {
        const variantId = Number(variant.id);
        if (existing.some(row => row.id_product === variantId)) {
          await connection.execute(
            'UPDATE products SET size = ?, color = ?, stock = ?, active = 1 WHERE id_product = ? AND product_group_id = ?',
            [variant.size, variant.color || '', variant.stock, variantId, groupId]
          );
        } else {
          await connection.execute(
            `INSERT INTO products
              (product_group_id, name, sku, brand, description, image_url, category,
               size, color, price, previous_price, stock, active)
             SELECT product_group_id, name, sku, brand, description, image_url, category,
                    ?, ?, ?, previous_price, ?, 1
               FROM products
              WHERE product_group_id = ? AND id_product = ?
              LIMIT 1`,
            [variant.size, variant.color || '',
              changes.price === undefined ? Number(existing[0].price || 0) : changes.price,
              variant.stock, groupId, existing[0].id_product]
          );
        }
      }
    }
    await connection.commit();
    return (await getProducts()).find(product => product.id === Number(groupId)) || null;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function archiveProduct(groupId) {
  const [result] = await pool.execute(
    'UPDATE products SET active = 0 WHERE product_group_id = ? AND active = 1',
    [groupId]
  );
  return result.affectedRows > 0;
}

async function restockProduct(variantId, amount) {
  const [result] = await pool.execute(
    `UPDATE products SET stock = stock + ?
      WHERE id_product = ? AND active = 1 AND stock + ? >= 0`,
    [amount, variantId, amount]
  );
  return result.affectedRows > 0;
}

async function createOrder({ cart, customer, shippingAddress, paymentMethod, subtotal, tax, total, count }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (const item of cart) {
      const [result] = await connection.execute(
        `UPDATE products
            SET stock = stock - ?
          WHERE id_product = ? AND active = 1 AND stock >= ?`,
        [item.quantity, item.variantId, item.quantity]
      );
      if (!result.affectedRows) {
        const error = new Error(`Stock insuficiente para ${item.name}.`);
        error.code = 'INSUFFICIENT_STOCK';
        throw error;
      }
    }
    const customerRow = customer.email
      ? await findCustomerByEmail(customer.email, connection)
      : null;
    const customerSnapshot = {
      userId: customerRow?.id_customer || null,
      name: customer.name || 'Cliente Sauz Store',
      email: customer.email || '',
      phone: customer.phone || '',
      address: shippingAddress.address || customer.address || '',
      city: shippingAddress.city || customer.city || ''
    };
    const orderId = `SAUZ-${Date.now().toString(36).toUpperCase()}`;
    const date = new Date();
    const initialStatus = 'Pendiente';
    const trackingHistory = [{
      status: initialStatus,
      timestamp: date.toISOString(),
      dateFormatted: date.toLocaleString('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'America/Bogota'
      }),
      note: 'Pedido recibido por SAUZ. Pendiente de revisión y aceptación antes de preparar el despacho.',
      location: 'Centro de Distribución SAUZ — Medellín, Colombia'
    }];
    const [saleResult] = await connection.execute(
      `INSERT INTO sales
        (id_customer, order_code, sale_date, total, order_status, subtotal, tax,
         item_count, payment_method, shipping_address, customer_snapshot, tracking_history)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [customerRow?.id_customer || null, orderId, date, total, initialStatus, subtotal,
        tax, count, paymentMethod, JSON.stringify(shippingAddress),
        JSON.stringify(customerSnapshot), JSON.stringify(trackingHistory)]
    );
    for (const item of cart) {
      await connection.execute(
        `INSERT INTO sale_items
          (id_sale, id_product, product_name, quantity, unit_price)
         VALUES (?, ?, ?, ?, ?)`,
        [saleResult.insertId, Number(item.variantId), item.name,
          item.quantity, item.price]
      );
    }
    await connection.commit();
    return { orderId, customerSnapshot };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateOrder(orderId, changes) {
  const [rows] = await pool.execute(
    `SELECT id_sale, order_status, shipping_address, tracking_history
       FROM sales WHERE order_code = ? LIMIT 1`,
    [orderId]
  );
  if (!rows.length) return null;
  const sale = rows[0];
  let history = parseJson(sale.tracking_history) || [];
  let shippingAddress = parseJson(sale.shipping_address) || {};
  if (changes.orderStatus) {
    history.push({
      status: changes.orderStatus,
      timestamp: changes.timestamp,
      dateFormatted: changes.dateFormatted,
      note: changes.note,
      location: changes.location || ''
    });
  }
  if (changes.shippingTracking) {
    shippingAddress = {
      ...shippingAddress,
      shippingTracking: changes.shippingTracking
    };
  }
  await pool.execute(
    `UPDATE sales
        SET order_status = ?, shipping_address = ?, tracking_history = ?
      WHERE id_sale = ?`,
    [changes.orderStatus || sale.order_status, JSON.stringify(shippingAddress),
      JSON.stringify(history), sale.id_sale]
  );
  return true;
}

async function close() {
  if (pool) await pool.end();
}

module.exports = {
  mysqlEnabled,
  initialize,
  getProducts,
  getCustomers,
  getOrders,
  findCustomerByEmail,
  authenticateCustomer,
  getCustomerById,
  createCustomer,
  updateCustomerProfile,
  listAddresses,
  saveAddress,
  removeAddress,
  createProduct,
  updateProduct,
  archiveProduct,
  restockProduct,
  createOrder,
  updateOrder,
  close
};
