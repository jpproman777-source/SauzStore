const http = require('http');
const fs = require('fs');
const path = require('path');
const {
  AUTHORIZED_MODELS,
  buildOutfitSummary,
  processStyleStudioGeneration,
} = require('./services/styleStudioService');

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, '..', 'frontend', 'dist');
const FRONTEND_DIR = process.env.SAUZ_SERVE_SOURCE === '1' || !fs.existsSync(DIST_DIR)
  ? path.join(__dirname, '..', 'frontend') : DIST_DIR;
const PUBLIC_DIR = path.join(__dirname, '..', 'frontend', 'img');
const DATA_DIR = process.env.SAUZ_DATA_DIR || path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CLOSET_FILE = path.join(DATA_DIR, 'closet.json');
const DROPS_FILE = path.join(DATA_DIR, 'drops.json');
const COMMUNITY_FILE = path.join(DATA_DIR, 'community.json');

// Asegurar directorio data
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Cargar catálogo de productos
let products = [];
try {
  if (fs.existsSync(PRODUCTS_FILE)) {
    products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
  }
} catch (err) {
  console.error('Error al cargar products.json:', err.message);
  products = [];
}

// Cargar órdenes
let orders = [];
try {
  if (fs.existsSync(ORDERS_FILE)) {
    orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
  }
} catch (err) {
  console.error('Error al cargar orders.json:', err.message);
  orders = [];
}

// Cargar usuarios
let users = [];
try {
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  }
} catch (err) {
  console.error('Error al cargar users.json:', err.message);
  users = [];
}

// Cargar closet
let closetOutfits = [];
try {
  if (fs.existsSync(CLOSET_FILE)) {
    closetOutfits = JSON.parse(fs.readFileSync(CLOSET_FILE, 'utf-8'));
  }
} catch (err) {
  closetOutfits = [];
}

// Cargar drops
let drops = [];
try {
  if (fs.existsSync(DROPS_FILE)) {
    drops = JSON.parse(fs.readFileSync(DROPS_FILE, 'utf-8'));
  }
} catch (err) {
  drops = [];
}

// Cargar community
let communityPosts = [];
try {
  if (fs.existsSync(COMMUNITY_FILE)) {
    communityPosts = JSON.parse(fs.readFileSync(COMMUNITY_FILE, 'utf-8'));
  }
} catch (err) {
  communityPosts = [];
}

// Funciones para guardar en disco
function saveProducts() {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error al guardar products.json:', err.message);
  }
}

function saveOrders() {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error al guardar orders.json:', err.message);
  }
}

function saveUsers() {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error al guardar users.json:', err.message);
  }
}

function saveCloset() {
  try {
    fs.writeFileSync(CLOSET_FILE, JSON.stringify(closetOutfits, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error al guardar closet.json:', err.message);
  }
}

function saveDrops() {
  try {
    fs.writeFileSync(DROPS_FILE, JSON.stringify(drops, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error al guardar drops.json:', err.message);
  }
}

function saveCommunity() {
  try {
    fs.writeFileSync(COMMUNITY_FILE, JSON.stringify(communityPosts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error al guardar community.json:', err.message);
  }
}

// Estado del carrito en memoria
let cart = [];
const validVariants = product => Array.isArray(product?.variants) ? product.variants : [];
const configuredProduct = product => product && product.active !== false && product.commercial !== false &&
  Number.isFinite(product.price) && product.price > 0 && validVariants(product).length > 0;
const canPurchase = (product, variantId, quantity = 1) => {
  const variant = validVariants(product).find(v => String(v.id) === String(variantId));
  return configuredProduct(product) && variant && Number.isInteger(variant.stock) && variant.stock >= quantity && quantity > 0;
};
const cartKey = (productId, variantId) => `${productId}:${variantId}`;
function parseVariants(value) {
  if (!Array.isArray(value)) return null;
  const variants = value.map((variant, index) => ({
    id: String(variant?.id || `size-${index + 1}`),
    size: String(variant?.size || '').trim(),
    stock: variant?.stock,
  }));
  if (variants.some(v => !v.size || !Number.isInteger(v.stock) || v.stock < 0) ||
      new Set(variants.map(v => v.id)).size !== variants.length ||
      new Set(variants.map(v => v.size.toLowerCase())).size !== variants.length) return null;
  return variants;
}
function pruneCart() {
  cart = cart.filter(item => {
    const product = products.find(p => p.id === item.productId);
    const variant = validVariants(product).find(v => v.id === item.variantId);
    return variant?.size === item.size && canPurchase(product, item.variantId, item.quantity);
  });
}

// Helper para redondear a 2 decimales
function roundDecimals(val) {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

// Calcular resumen del carrito
function getCartSummary() {
  pruneCart();
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.16; // IVA 16%
  const total = subtotal + tax;
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);

  return {
    items: cart,
    subtotal: roundDecimals(subtotal),
    tax: roundDecimals(tax),
    total: roundDecimals(total),
    count: count
  };
}

// Helper para enviar respuestas JSON con CORS
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// Helper para parsear el cuerpo JSON de peticiones
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (!body.trim()) {
        return resolve({});
      }
      try {
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch (err) {
        reject(new Error('JSON inválido en el cuerpo de la petición'));
      }
    });
    req.on('error', reject);
  });
}

// Servir archivos estáticos del frontend
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.mp4': 'video/mp4',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function serveStaticFile(req, res, pathname) {
  let relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  const safePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(FRONTEND_DIR, safePath);

  // Vite publica frontend/img en la raíz de la URL. El backend también debe
  // servir esos recursos cuando se inició antes de que existiera dist.
  if (!fs.existsSync(filePath)) {
    const publicPath = path.join(PUBLIC_DIR, safePath);
    if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
      filePath = publicPath;
    }
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(FRONTEND_DIR, 'index.html');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

// Manejador del servidor HTTP
const server = http.createServer(async (req, res) => {
  // Manejo de preflight CORS (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // Rutas de la API
  if (pathname.startsWith('/api/')) {
    try {
      // ==============================================================
      // 1. AUTH / USUARIOS (ADMIN & CLIENTE)
      // ==============================================================
      // POST /api/auth/login
      if (pathname === '/api/auth/login' && method === 'POST') {
        const body = await parseRequestBody(req);
        const { email, password } = body;

        if (!email || !password) {
          return sendJSON(res, 400, {
            success: false,
            error: 'Debes proporcionar correo electrónico y contraseña'
          });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

        if (!user || user.password !== password) {
          return sendJSON(res, 401, {
            success: false,
            error: 'Credenciales inválidas. Verifica tu correo y contraseña.'
          });
        }

        // Retornar información del usuario sin la contraseña sensible
        const { password: _, ...userSafe } = user;
        return sendJSON(res, 200, {
          success: true,
          message: `Bienvenido a Sauz Store, ${user.name}`,
          user: userSafe
        });
      }

      // POST /api/auth/register
      if (pathname === '/api/auth/register' && method === 'POST') {
        const body = await parseRequestBody(req);
        const { name, email, password, phone, address, city } = body;

        if (!name || !email || !password) {
          return sendJSON(res, 400, {
            success: false,
            error: 'Nombre, correo electrónico y contraseña son obligatorios'
          });
        }

        const normalizedEmail = email.trim().toLowerCase();
        if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
          return sendJSON(res, 400, {
            success: false,
            error: 'Este correo electrónico ya se encuentra registrado'
          });
        }

        const newUser = {
          id: Math.max(0, ...users.map(u => u.id || 0)) + 1,
          name: name.trim(),
          email: normalizedEmail,
          password: password,
          role: 'cliente',
          phone: phone ? phone.trim() : '',
          address: address ? address.trim() : '',
          city: city ? city.trim() : 'Medellín'
        };

        users.push(newUser);
        saveUsers();

        const { password: _, ...userSafe } = newUser;
        return sendJSON(res, 201, {
          success: true,
          message: '¡Registro exitoso! Ya eres cliente de Sauz Store',
          user: userSafe
        });
      }

      // POST /api/auth/logout (US-17: Cerrar sesión)
      if (pathname === '/api/auth/logout' && method === 'POST') {
        return sendJSON(res, 200, {
          success: true,
          message: 'Sesión finalizada exitosamente'
        });
      }

      // GET /api/users/profile (US-16: Obtener perfil de usuario)
      if (pathname === '/api/users/profile' && method === 'GET') {
        const email = (parsedUrl.searchParams.get('email') || '').trim().toLowerCase();
        const user = users.find(u => u.email.toLowerCase() === email);
        if (!user) {
          return sendJSON(res, 404, { success: false, error: 'Usuario no encontrado' });
        }
        const { password: _, ...userSafe } = user;
        return sendJSON(res, 200, { success: true, user: userSafe });
      }

      // PUT /api/users/profile (US-16: Editar datos personales)
      if (pathname === '/api/users/profile' && (method === 'PUT' || method === 'PATCH')) {
        const body = await parseRequestBody(req);
        const currentEmail = (body.email || '').trim().toLowerCase();
        const user = users.find(u => u.email.toLowerCase() === currentEmail);

        if (!user) {
          return sendJSON(res, 404, { success: false, error: 'Usuario no encontrado' });
        }

        const { name, firstName, lastName, phone, newEmail, address, city } = body;
        const fullName = name ? name.trim() : (firstName || lastName ? `${firstName || ''} ${lastName || ''}`.trim() : user.name);

        if (!fullName) {
          return sendJSON(res, 400, { success: false, error: 'El nombre es obligatorio' });
        }

        if (newEmail && newEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
          const targetEmail = newEmail.trim().toLowerCase();
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(targetEmail)) {
            return sendJSON(res, 400, { success: false, error: 'El formato de correo no es válido' });
          }
          if (users.some(u => u.id !== user.id && u.email.toLowerCase() === targetEmail)) {
            return sendJSON(res, 400, { success: false, error: 'Este correo electrónico ya está registrado por otra cuenta' });
          }
          user.email = targetEmail;
        }

        user.name = fullName;
        if (phone !== undefined) user.phone = phone.trim();
        if (address !== undefined) user.address = address.trim();
        if (city !== undefined) user.city = city.trim();

        saveUsers();
        const { password: _, ...userSafe } = user;
        return sendJSON(res, 200, {
          success: true,
          message: 'Datos personales actualizados correctamente',
          user: userSafe
        });
      }

      // GET /api/users/addresses (US-23: Direcciones de entrega)
      if (pathname === '/api/users/addresses' && method === 'GET') {
        const email = (parsedUrl.searchParams.get('email') || '').trim().toLowerCase();
        const userId = parsedUrl.searchParams.get('userId');
        const user = users.find(u => (email && u.email.toLowerCase() === email) || (userId && String(u.id) === String(userId)));
        if (!user) {
          return sendJSON(res, 404, { success: false, error: 'Usuario no encontrado' });
        }
        return sendJSON(res, 200, {
          success: true,
          addresses: user.addresses || []
        });
      }

      // POST /api/users/addresses (US-23: Registrar nueva dirección de entrega)
      if (pathname === '/api/users/addresses' && method === 'POST') {
        const body = await parseRequestBody(req);
        const email = (body.email || '').trim().toLowerCase();
        const userId = body.userId;
        const user = users.find(u => (email && u.email.toLowerCase() === email) || (userId && String(u.id) === String(userId)));

        if (!user) {
          return sendJSON(res, 404, { success: false, error: 'Usuario no encontrado' });
        }

        const recipientName = (body.recipient || body.recipientName || '').trim();
        const { phone, department, city, neighborhood, address, complement, references, isDefault } = body;
        if (!recipientName || !address || !city) {
          return sendJSON(res, 400, {
            success: false,
            error: 'Destinatario, ciudad y dirección son campos requeridos'
          });
        }

        if (!Array.isArray(user.addresses)) {
          user.addresses = [];
        }

        const newAddress = {
          id: `addr-${Date.now()}`,
          recipient: recipientName,
          recipientName: recipientName,
          phone: (phone || user.phone || '').trim(),
          department: (department || 'Antioquia').trim(),
          city: city.trim(),
          neighborhood: (neighborhood || '').trim(),
          address: address.trim(),
          complement: (complement || '').trim(),
          references: (references || '').trim(),
          isDefault: Boolean(isDefault || user.addresses.length === 0)
        };

        if (newAddress.isDefault) {
          user.addresses.forEach(a => { a.isDefault = false; });
        }

        user.addresses.push(newAddress);
        saveUsers();

        return sendJSON(res, 201, {
          success: true,
          message: 'Dirección guardada exitosamente',
          address: newAddress,
          addresses: user.addresses
        });
      }

      // DELETE /api/users/addresses/:id (US-23: Eliminar dirección)
      const deleteAddrMatch = pathname.match(/^\/api\/users\/addresses\/([A-Za-z0-9\-_]+)$/);
      if (deleteAddrMatch && method === 'DELETE') {
        const addrId = deleteAddrMatch[1];
        const email = (parsedUrl.searchParams.get('email') || '').trim().toLowerCase();
        const userId = parsedUrl.searchParams.get('userId');
        const user = users.find(u => (email && u.email.toLowerCase() === email) || (userId && String(u.id) === String(userId)));

        if (!user) {
          return sendJSON(res, 404, { success: false, error: 'Usuario no encontrado' });
        }

        if (Array.isArray(user.addresses)) {
          user.addresses = user.addresses.filter(a => a.id !== addrId);
          if (user.addresses.length > 0 && !user.addresses.some(a => a.isDefault)) {
            user.addresses[0].isDefault = true;
          }
          saveUsers();
        }

        return sendJSON(res, 200, {
          success: true,
          message: 'Dirección eliminada correctamente',
          addresses: user.addresses || []
        });
      }

      // ==============================================================
      // 2. PRODUCTOS E INVENTARIO
      // ==============================================================
      // GET /api/products
      if (pathname === '/api/products' && method === 'GET') {
        return sendJSON(res, 200, {
          success: true,
          products: products.filter(p => p.active !== false)
        });
      }

      // POST /api/products (Crear nuevo slot de producto / prenda en inventario)
      if (pathname === '/api/products' && method === 'POST') {
        const body = await parseRequestBody(req);
        const { name, category, price, description, image, icon } = body;
        const variants = parseVariants(body.variants || []);

        if (!name?.trim() || !variants) {
          return sendJSON(res, 400, {
            success: false,
            error: 'Nombre y variantes válidas son obligatorios'
          });
        }

        const newId = Math.max(0, ...products.map(p => p.id || 0)) + 1;
        const newProduct = {
          id: newId,
          name: name.trim(),
          category: category ? category.trim() : 'Camisetas',
          description: description ? description.trim() : '',
          price: Number(price) > 0 ? Number(price) : null,
          icon: icon || (category === 'Sudaderas' ? '🧥' : '👕'),
          image: image && image.trim() ? image.trim() : '',
          brand: String(body.brand || '').trim(),
          subcategory: String(body.subcategory || '').trim(),
          variants,
          sizes: variants.map(variant => variant.size),
          stock: variants.reduce((sum, variant) => sum + variant.stock, 0),
          commercial: Number(price) > 0 && variants.length > 0,
          active: true
        };

        products.push(newProduct);
        saveProducts();

        return sendJSON(res, 201, {
          success: true,
          message: `Nuevo slot creado: "${newProduct.name}" agregado al inventario`,
          product: newProduct,
          products: products
        });
      }

      // POST /api/products/restock (Llegaron productos al slot / reabastecer stock)
      if (pathname === '/api/products/restock' && method === 'POST') {
        const body = await parseRequestBody(req);
        const productId = parseInt(body.productId, 10);
        const amount = parseInt(body.amount, 10);

        if (isNaN(productId) || isNaN(amount) || amount === 0) {
          return sendJSON(res, 400, {
            success: false,
            error: 'Debes indicar el ID del producto y una cantidad válida a sumar'
          });
        }

        const product = products.find(p => p.id === productId);
        if (!product) {
          return sendJSON(res, 404, {
            success: false,
            error: 'Producto no encontrado'
          });
        }

        if (validVariants(product).length) {
          const variant = product.variants.find(v => String(v.id) === String(body.variantId));
          if (!variant || variant.stock + amount < 0) {
            return sendJSON(res, 400, { success: false, error: 'Selecciona una variante válida para reabastecer' });
          }
          variant.stock += amount;
          product.stock = product.variants.reduce((sum, v) => sum + v.stock, 0);
          saveProducts();
          return sendJSON(res, 200, { success: true, message: 'Inventario de variante actualizado', product, products });
        }

        product.stock = Math.max(0, (product.stock || 0) + amount);
        saveProducts();

        return sendJSON(res, 200, {
          success: true,
          message: `Inventario actualizado: +${amount} unidades para "${product.name}". Stock total: ${product.stock}`,
          product: product,
          products: products
        });
      }

      // DELETE /api/products/:id (Eliminar un slot de producto)
      const deleteProductMatch = pathname.match(/^\/api\/products\/(\d+)$/);
      if (deleteProductMatch && method === 'DELETE') {
        const productId = parseInt(deleteProductMatch[1], 10);
        const idx = products.findIndex(p => p.id === productId);

        if (idx === -1) {
          return sendJSON(res, 404, {
            success: false,
            error: 'Producto no encontrado'
          });
        }

        const removed = products[idx];
        removed.active = false;
        removed.archivedAt = new Date().toISOString();
        pruneCart();
        saveProducts();

        return sendJSON(res, 200, {
          success: true,
          message: `Slot "${removed.name}" eliminado del catálogo`,
          products: products.filter(p => p.active !== false)
        });
      }

      // PUT /api/products/:id (Editar slot de producto / prenda en inventario)
      const editProductMatch = pathname.match(/^\/api\/products\/(\d+)$/);
      if (editProductMatch && (method === 'PUT' || method === 'PATCH')) {
        const productId = parseInt(editProductMatch[1], 10);
        const product = products.find(p => p.id === productId);

        if (!product) {
          return sendJSON(res, 404, {
            success: false,
            error: 'Producto no encontrado'
          });
        }

        const body = await parseRequestBody(req);
        if (body.variants !== undefined) {
          const parsed = parseVariants(body.variants);
          if (!parsed) return sendJSON(res, 400, { success: false, error: 'Variantes inválidas: usa talla única y stock entero no negativo' });
          product.variants = parsed;
          product.sizes = parsed.map(variant => variant.size);
          product.stock = parsed.reduce((sum, variant) => sum + variant.stock, 0);
        }
        if (body.name !== undefined) product.name = body.name.trim();
        if (body.category !== undefined) product.category = body.category.trim();
        if (body.description !== undefined) product.description = body.description.trim();
        if (body.price !== undefined) product.price = Number(body.price) > 0 ? Number(body.price) : null;
        if (body.previousPrice !== undefined) product.previousPrice = Number(body.previousPrice) > 0 ? Number(body.previousPrice) : null;
        if (body.colors !== undefined) product.colors = Array.isArray(body.colors) ? body.colors.map(c => String(c).trim()).filter(Boolean) : [];
        if (body.active !== undefined) product.active = Boolean(body.active);
        if (body.images !== undefined) product.images = Array.isArray(body.images) ? body.images : [];
        if (body.sku !== undefined && body.sku.trim()) product.sku = body.sku.trim();
        if (body.materials !== undefined) product.materials = body.materials.trim();
        if (body.sizeGuide !== undefined) product.sizeGuide = body.sizeGuide.trim();
        if (body.commercial !== undefined) {
          product.commercial = Boolean(body.commercial);
          product.configurationStatus = product.commercial ? null : 'No disponible para venta';
        } else if (body.variants !== undefined || body.price !== undefined) {
          product.commercial = product.price > 0 && validVariants(product).length > 0;
          product.configurationStatus = product.commercial ? null : 'Pendiente de precio o variantes';
        }
        if (body.image !== undefined && body.image.trim()) product.image = body.image.trim();
        if (body.icon !== undefined) product.icon = body.icon;

        saveProducts();

        return sendJSON(res, 200, {
          success: true,
          message: `Producto "${product.name}" actualizado correctamente`,
          product: product,
          products: products
        });
      }

      // ==============================================================
      // 3. PEDIDOS (ORDERS), CLIENTES & DASHBOARD
      // ==============================================================
      // GET /api/customers (Directorio de clientes con historial de compras)
      if (pathname === '/api/customers' && method === 'GET') {
        const customerMap = new Map();

        // Agregar clientes registrados
        users.filter(u => u.role !== 'admin').forEach(u => {
          customerMap.set(u.email.toLowerCase(), {
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone || '',
            city: u.city || 'Medellín',
            address: u.address || '',
            orderCount: 0,
            totalSpent: 0,
            lastOrderDate: 'Sin compras aún',
            status: 'Activo'
          });
        });

        // Consolidar información con el historial de pedidos
        orders.forEach(order => {
          const email = (order.customer?.email || '').toLowerCase().trim();
          if (!email) return;

          let cust = customerMap.get(email);
          if (!cust) {
            cust = {
              id: 'CUST-' + Math.abs(email.split('').reduce((acc, c) => ((acc << 5) - acc) + c.charCodeAt(0), 0)),
              name: order.customer?.name || 'Cliente Sauz Store',
              email: order.customer?.email,
              phone: order.customer?.phone || '',
              city: order.customer?.city || 'Medellín',
              address: order.customer?.address || '',
              orderCount: 0,
              totalSpent: 0,
              lastOrderDate: order.date,
              status: 'Activo'
            };
            customerMap.set(email, cust);
          }

          cust.orderCount += 1;
          if (order.orderStatus !== 'Cancelado') {
            cust.totalSpent += (order.total || 0);
          }
          if (order.date) {
            cust.lastOrderDate = order.date;
          }
        });

        const customerList = Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
        return sendJSON(res, 200, {
          success: true,
          customers: customerList
        });
      }
      // GET /api/orders (Todos los pedidos o filtrados por email de cliente)
      if (pathname === '/api/orders' && method === 'GET') {
        const clientEmail = parsedUrl.searchParams.get('email');
        let filteredOrders = orders;

        if (clientEmail) {
          filteredOrders = orders.filter(
            o => o.customer?.email?.toLowerCase() === clientEmail.toLowerCase()
          );
        }

        return sendJSON(res, 200, {
          success: true,
          orders: filteredOrders
        });
      }

      // PATCH /api/orders/:id (Actualizar estado de pedido: En proceso, Enviado, Entregado, etc.)
      const orderMatch = pathname.match(/^\/api\/orders\/([A-Za-z0-9\-]+)$/);
      if (orderMatch && (method === 'PATCH' || method === 'PUT')) {
        const orderId = orderMatch[1];
        const body = await parseRequestBody(req);
        const { orderStatus, note, location } = body;

        const order = orders.find(o => o.orderId === orderId);
        if (!order) {
          return sendJSON(res, 404, {
            success: false,
            error: 'Pedido no encontrado'
          });
        }

        if (orderStatus) {
          order.orderStatus = orderStatus;
          if (!Array.isArray(order.trackingHistory)) {
            order.trackingHistory = [];
          }
          order.trackingHistory.push({
            status: orderStatus,
            timestamp: new Date().toISOString(),
            dateFormatted: new Date().toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }),
            note: note || `Estado actualizado a "${orderStatus}" por logística SAUZ`,
            location: location || 'Centro de Operaciones SAUZ — Colombia'
          });
        }
        saveOrders();

        return sendJSON(res, 200, {
          success: true,
          message: `Estado del pedido ${orderId} actualizado a "${orderStatus}"`,
          order: order
        });
      }

      // GET /api/admin/low-stock (US-25: Alerta de stock bajo en inventario)
      if (pathname === '/api/admin/low-stock' && method === 'GET') {
        const threshold = Number(parsedUrl.query?.threshold) || 5;
        const lowStockItems = [];

        products.forEach(p => {
          if (p.active === false) return;
          const variants = validVariants(p);
          if (variants.length > 0) {
            variants.forEach(v => {
              const vStock = typeof v.stock === 'number' ? v.stock : 0;
              if (vStock <= threshold) {
                lowStockItems.push({
                  productId: p.id,
                  productName: p.name,
                  brand: p.brand || 'SAUZ',
                  category: p.category,
                  sku: p.sku || `SAUZ-${p.id}`,
                  image: p.image,
                  variantId: v.id,
                  color: v.color || 'Único',
                  size: v.size || 'Única',
                  stock: vStock,
                  status: vStock === 0 ? 'Agotado' : 'Stock Crítico',
                  threshold
                });
              }
            });
          } else {
            const pStock = typeof p.stock === 'number' ? p.stock : 0;
            if (pStock <= threshold) {
              lowStockItems.push({
                productId: p.id,
                productName: p.name,
                brand: p.brand || 'SAUZ',
                category: p.category,
                sku: p.sku || `SAUZ-${p.id}`,
                image: p.image,
                variantId: null,
                color: 'General',
                size: 'General',
                stock: pStock,
                status: pStock === 0 ? 'Agotado' : 'Stock Crítico',
                threshold
              });
            }
          }
        });

        return sendJSON(res, 200, {
          success: true,
          threshold,
          totalAlerts: lowStockItems.length,
          items: lowStockItems
        });
      }

      // GET /api/style-studio/models (FASE 3: Modelos autorizados de probador)
      if (pathname === '/api/style-studio/models' && method === 'GET') {
        return sendJSON(res, 200, {
          success: true,
          models: AUTHORIZED_MODELS
        });
      }

      // POST /api/style-studio/generate (FASE 3: Generación de look / outfit)
      if (pathname === '/api/style-studio/generate' && method === 'POST') {
        const body = await parseRequestBody(req);
        const result = await processStyleStudioGeneration({
          modelId: body.modelId,
          slots: body.slots,
          catalogProducts: products
        });
        return sendJSON(res, 200, result);
      }

      // ==============================================================
      // SAUZ EXPERIENCE ENDPOINTS (CLOSET, DROPS, COMMUNITY, STYLE DNA)
      // ==============================================================

      // GET /api/closet?userId=...
      if (pathname === '/api/closet' && method === 'GET') {
        const userId = parsedUrl.searchParams.get('userId');
        const userEmail = (parsedUrl.searchParams.get('email') || '').trim().toLowerCase();
        let userOutfits = closetOutfits;
        if (userId || userEmail) {
          userOutfits = closetOutfits.filter(o => 
            (userId && String(o.userId) === String(userId)) || 
            (userEmail && (o.userEmail || '').toLowerCase() === userEmail)
          );
        }
        return sendJSON(res, 200, { success: true, outfits: userOutfits });
      }

      // POST /api/closet/outfits
      if (pathname === '/api/closet/outfits' && method === 'POST') {
        const body = await parseRequestBody(req);
        const { userId, userEmail, userName, name, style, slots, subtotalCOP, isPublic } = body;
        if (!name || !slots) {
          return sendJSON(res, 400, { success: false, error: 'Nombre del outfit y prendas son obligatorios' });
        }
        const newOutfit = {
          id: `outfit-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
          userId: userId || null,
          userEmail: userEmail || '',
          userName: userName || 'Miembro SAUZ',
          name: name.trim(),
          style: style || 'Urban Street',
          createdAt: new Date().toISOString(),
          isPublic: isPublic !== false,
          slots,
          subtotalCOP: Number(subtotalCOP) || 0
        };
        closetOutfits.unshift(newOutfit);
        saveCloset();
        return sendJSON(res, 201, { success: true, outfit: newOutfit });
      }

      // GET & DELETE /api/closet/outfits/:id
      const singleOutfitMatch = pathname.match(/^\/api\/closet\/outfits\/([A-Za-z0-9\-_]+)$/);
      if (singleOutfitMatch && method === 'GET') {
        const outfitId = singleOutfitMatch[1];
        const outfit = closetOutfits.find(o => o.id === outfitId);
        if (!outfit) {
          return sendJSON(res, 404, { success: false, error: 'Outfit no encontrado' });
        }
        return sendJSON(res, 200, { success: true, outfit });
      }

      if (singleOutfitMatch && method === 'DELETE') {
        const outfitId = singleOutfitMatch[1];
        const initialLen = closetOutfits.length;
        closetOutfits = closetOutfits.filter(o => o.id !== outfitId);
        if (closetOutfits.length < initialLen) {
          saveCloset();
          return sendJSON(res, 200, { success: true, message: 'Outfit eliminado de tu closet' });
        }
        return sendJSON(res, 404, { success: false, error: 'Outfit no encontrado' });
      }

      // GET /api/drops
      if (pathname === '/api/drops' && method === 'GET') {
        return sendJSON(res, 200, { success: true, drops });
      }

      // POST /api/drops/:id/waitlist
      const dropWaitlistMatch = pathname.match(/^\/api\/drops\/([A-Za-z0-9\-_]+)\/waitlist$/);
      if (dropWaitlistMatch && method === 'POST') {
        const dropId = dropWaitlistMatch[1];
        const body = await parseRequestBody(req);
        const email = (body.email || '').trim().toLowerCase();
        if (!email || !email.includes('@')) {
          return sendJSON(res, 400, { success: false, error: 'Ingresa un correo electrónico válido' });
        }
        const drop = drops.find(d => d.id === dropId);
        if (!drop) {
          return sendJSON(res, 404, { success: false, error: 'Lanzamiento no encontrado' });
        }
        if (!Array.isArray(drop.waitlistEmails)) drop.waitlistEmails = [];
        if (!drop.waitlistEmails.includes(email)) {
          drop.waitlistEmails.push(email);
          drop.waitlistCount = (drop.waitlistCount || 0) + 1;
          saveDrops();
        }
        return sendJSON(res, 200, {
          success: true,
          message: '¡Te has unido a la lista de espera oficial de este drop!',
          waitlistCount: drop.waitlistCount
        });
      }

      // GET /api/community/posts
      if (pathname === '/api/community/posts' && method === 'GET') {
        const publicPosts = communityPosts.filter(p => !p.reported);
        return sendJSON(res, 200, { success: true, posts: publicPosts });
      }

      // POST /api/community/posts
      if (pathname === '/api/community/posts' && method === 'POST') {
        const body = await parseRequestBody(req);
        const { userId, authorName, city, title, caption, photo, taggedProducts } = body;
        if (!title || !photo) {
          return sendJSON(res, 400, { success: false, error: 'Título y fotografía son obligatorios' });
        }
        const newPost = {
          id: `post-${Date.now().toString(36)}`,
          userId: userId || null,
          authorName: authorName || 'Miembro SAUZ',
          city: city || 'Medellín',
          title: title.trim(),
          caption: (caption || '').trim(),
          photo: photo.trim(),
          taggedProducts: Array.isArray(taggedProducts) ? taggedProducts : [],
          votes: 1,
          votedUsers: [],
          isFitOfTheWeek: false,
          createdAt: new Date().toISOString(),
          reported: false
        };
        communityPosts.unshift(newPost);
        saveCommunity();
        return sendJSON(res, 201, { success: true, post: newPost });
      }

      // POST /api/community/posts/:id/vote
      const communityVoteMatch = pathname.match(/^\/api\/community\/posts\/([A-Za-z0-9\-_]+)\/vote$/);
      if (communityVoteMatch && method === 'POST') {
        const postId = communityVoteMatch[1];
        const body = await parseRequestBody(req);
        const userEmail = (body.userEmail || '').trim().toLowerCase();
        const post = communityPosts.find(p => p.id === postId);
        if (!post) {
          return sendJSON(res, 404, { success: false, error: 'Publicación no encontrada' });
        }
        if (!Array.isArray(post.votedUsers)) post.votedUsers = [];
        if (userEmail && post.votedUsers.includes(userEmail)) {
          post.votedUsers = post.votedUsers.filter(e => e !== userEmail);
          post.votes = Math.max(0, (post.votes || 1) - 1);
        } else {
          if (userEmail) post.votedUsers.push(userEmail);
          post.votes = (post.votes || 0) + 1;
        }
        saveCommunity();
        return sendJSON(res, 200, { success: true, votes: post.votes });
      }

      // POST /api/community/posts/:id/report
      const communityReportMatch = pathname.match(/^\/api\/community\/posts\/([A-Za-z0-9\-_]+)\/report$/);
      if (communityReportMatch && method === 'POST') {
        const postId = communityReportMatch[1];
        const post = communityPosts.find(p => p.id === postId);
        if (post) {
          post.reported = true;
          saveCommunity();
        }
        return sendJSON(res, 200, { success: true, message: 'Publicación enviada a moderación' });
      }

      // PUT /api/users/style-dna
      if (pathname === '/api/users/style-dna' && (method === 'PUT' || method === 'POST')) {
        const body = await parseRequestBody(req);
        const { userId, email, styleDna } = body;
        const user = users.find(u => (userId && String(u.id) === String(userId)) || (email && u.email.toLowerCase() === email.toLowerCase()));
        if (user) {
          user.styleDna = styleDna;
          saveUsers();
        }
        return sendJSON(res, 200, { success: true, message: 'Perfil de Style DNA guardado con éxito', styleDna });
      }

      // GET /api/dashboard/stats (Métricas consolidadas para el Admin)
      if (pathname === '/api/dashboard/stats' && method === 'GET') {
        const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        const totalOrders = orders.length;
        const totalUnitsSold = orders.reduce((sum, o) => sum + (o.count || 0), 0);
        const averageTicket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

        const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;
        const outOfStockCount = products.filter(p => p.stock === 0).length;
        const totalStockCount = products.reduce((sum, p) => sum + (p.stock || 0), 0);

        // Agrupar ventas por categoría
        const categoryMap = {};
        orders.forEach(o => {
          (o.items || []).forEach(item => {
            const prod = products.find(p => p.id === item.productId);
            const cat = prod?.category || 'Otros';
            categoryMap[cat] = (categoryMap[cat] || 0) + (item.price * item.quantity);
          });
        });

        // Top 5 productos más vendidos
        const productSales = {};
        orders.forEach(o => {
          (o.items || []).forEach(item => {
            if (!productSales[item.productId]) {
              productSales[item.productId] = {
                id: item.productId,
                name: item.name,
                image: item.image,
                quantity: 0,
                revenue: 0
              };
            }
            productSales[item.productId].quantity += item.quantity;
            productSales[item.productId].revenue += item.price * item.quantity;
          });
        });

        const topProducts = Object.values(productSales)
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5);

        return sendJSON(res, 200, {
          success: true,
          stats: {
            totalRevenue,
            totalOrders,
            totalUnitsSold,
            averageTicket,
            lowStockCount,
            outOfStockCount,
            totalStockCount,
            totalProducts: products.length,
            categorySales: categoryMap,
            topProducts,
            recentOrders: orders.slice(0, 5)
          }
        });
      }

      // ==============================================================
      // 4. CARRITO DE COMPRAS
      // ==============================================================
      // GET /api/cart
      if (pathname === '/api/cart' && method === 'GET') {
        return sendJSON(res, 200, {
          success: true,
          cart: getCartSummary()
        });
      }

      // POST /api/cart/items (Agregar producto al carrito)
      if (pathname === '/api/cart/items' && method === 'POST') {
        const body = await parseRequestBody(req);
        const productId = parseInt(body.productId, 10);
        const quantity = Number(body.quantity ?? 1);
        const variantId = String(body.variantId || '');

        if (isNaN(productId) || !Number.isInteger(quantity) || quantity <= 0) {
          return sendJSON(res, 400, {
            success: false,
            error: 'ID de producto o cantidad inválida'
          });
        }

        const product = products.find(p => p.id === productId);
        if (!product) {
          return sendJSON(res, 404, {
            success: false,
            error: 'Producto no encontrado'
          });
        }

        const variant = validVariants(product).find(v => v.id === variantId);
        if (!variant || !canPurchase(product, variantId, quantity)) {
          return sendJSON(res, 409, { success: false, error: 'Producto no disponible para compra' });
        }

        const currentInCart = cart.find(item => cartKey(item.productId, item.variantId) === cartKey(productId, variantId))?.quantity || 0;
        if (currentInCart + quantity > variant.stock) {
          return sendJSON(res, 400, {
            success: false,
            error: `Solo quedan ${variant.stock} unidades de la talla ${variant.size}.`
          });
        }

        const existingItem = cart.find(item => cartKey(item.productId, item.variantId) === cartKey(productId, variantId));
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          cart.push({
            productId: product.id,
            variantId,
            size: variant.size,
            name: product.name,
            price: product.price,
            image: product.image,
            icon: product.icon,
            quantity: quantity
          });
        }

        return sendJSON(res, 200, {
          success: true,
          message: `"${product.name}" agregado al carrito`,
          cart: getCartSummary()
        });
      }

      // PATCH o PUT /api/cart/items/:id (Modificar cantidad)
      const updateMatch = pathname.match(/^\/api\/cart\/items\/(\d+)$/);
      if (updateMatch && (method === 'PATCH' || method === 'PUT')) {
        const productId = parseInt(updateMatch[1], 10);
        const variantId = parsedUrl.searchParams.get('variantId');
        const body = await parseRequestBody(req);
        const newQuantity = parseInt(body.quantity, 10);

        if (isNaN(newQuantity)) {
          return sendJSON(res, 400, {
            success: false,
            error: 'La cantidad debe ser un número válido'
          });
        }

        const itemIndex = cart.findIndex(item => item.productId === productId && (variantId === null || item.variantId === variantId));
        if (itemIndex === -1) {
          return sendJSON(res, 404, {
            success: false,
            error: 'Producto no se encuentra en el carrito'
          });
        }

        const product = products.find(p => p.id === productId);
        if (newQuantity > 0 && !canPurchase(product, cart[itemIndex].variantId, newQuantity)) {
          return sendJSON(res, 409, { success: false, error: 'Producto no disponible para compra' });
        }

        if (newQuantity <= 0) {
          const removedItem = cart.splice(itemIndex, 1)[0];
          return sendJSON(res, 200, {
            success: true,
            message: `"${removedItem.name}" eliminado del carrito`,
            cart: getCartSummary()
          });
        } else {
          cart[itemIndex].quantity = newQuantity;
          return sendJSON(res, 200, {
            success: true,
            message: `Cantidad actualizada para "${cart[itemIndex].name}"`,
            cart: getCartSummary()
          });
        }
      }

      // DELETE /api/cart/items/:id (Eliminar producto del carrito)
      if (updateMatch && method === 'DELETE') {
        const productId = parseInt(updateMatch[1], 10);
        const variantId = parsedUrl.searchParams.get('variantId');
        const itemIndex = cart.findIndex(item => item.productId === productId && (variantId === null || item.variantId === variantId));

        if (itemIndex === -1) {
          return sendJSON(res, 404, {
            success: false,
            error: 'Producto no se encuentra en el carrito'
          });
        }

        const removed = cart.splice(itemIndex, 1)[0];
        return sendJSON(res, 200, {
          success: true,
          message: `"${removed.name}" eliminado del carrito`,
          cart: getCartSummary()
        });
      }

      // DELETE /api/cart (Vaciar todo el carrito)
      if (pathname === '/api/cart' && method === 'DELETE') {
        cart = [];
        return sendJSON(res, 200, {
          success: true,
          message: 'Carrito vaciado exitosamente',
          cart: getCartSummary()
        });
      }

      // ==============================================================
      // 5. CHECKOUT (DESCUENTO AUTOMÁTICO DE STOCK & GUARDADO DE PEDIDO)
      // ==============================================================
      if (pathname === '/api/checkout' && method === 'POST') {
        pruneCart();
        if (cart.length === 0) {
          return sendJSON(res, 400, {
            success: false,
            error: 'El carrito está vacío, no se puede procesar el pago'
          });
        }

        const body = await parseRequestBody(req);
        const customer = body.customer || {
          name: 'Cliente Sauz Store',
          email: 'cliente@ejemplo.com',
          phone: '',
          address: 'Dirección no especificada',
          city: 'Medellín'
        };

        const payment = body.payment || {
          method: 'card',
          details: { cardLast4: '4242' }
        };

        // 1. DESCONTAR STOCK AUTOMÁTICAMENTE DE CADA PRODUCTO
        const summary = getCartSummary();
        const purchasedItems = cart.map(item => ({ ...item }));
        cart.forEach(cartItem => {
          const product = products.find(p => p.id === cartItem.productId);
          if (product) {
            const variant = validVariants(product).find(v => v.id === cartItem.variantId);
            variant.stock -= cartItem.quantity;
            product.stock = product.variants.reduce((sum, v) => sum + v.stock, 0);
          }
        });
        saveProducts(); // Persistir en disco products.json

        // 2. CREAR Y REGISTRAR PEDIDO COMPLETO
        const orderId = `SAUZ-${Date.now().toString(36).toUpperCase()}`;
        const orderDate = new Date().toLocaleString('es-CO', {
          dateStyle: 'medium',
          timeStyle: 'short'
        });

        const paymentLabel = payment.method === 'card'
          ? `Tarjeta de Crédito / Débito (terminada en ${payment.details?.cardLast4 || '****'})`
          : (payment.method === 'transfer' ? 'Transferencia (Nequi / Daviplata / Bancolombia)' : 'Pago Contra Entrega en Efectivo');

        const shippingAddress = body.shippingAddress || (customer.shippingAddress ? customer.shippingAddress : {
          recipient: customer.name || 'Cliente Sauz Store',
          phone: customer.phone || '',
          department: customer.department || 'Antioquia',
          city: customer.city || 'Medellín',
          neighborhood: customer.neighborhood || 'El Poblado',
          address: customer.address || 'Recogida en tienda',
          complement: customer.complement || '',
          references: customer.references || ''
        });

        const initialStatus = payment.method === 'cash' ? 'Pendiente' : 'En proceso';
        const initialNote = payment.method === 'cash'
          ? 'Pedido recibido con pago contra entrega. Nuestro equipo se comunicará para confirmar despacho.'
          : 'Pago validado y aprobado exitosamente. Orden en alistamiento en bodega central.';

        const order = {
          orderId,
          date: orderDate,
          timestamp: Date.now(),
          customer: {
            name: customer.name || 'Cliente Sauz Store',
            email: customer.email || '',
            phone: customer.phone || '',
            address: shippingAddress.address || customer.address || 'Recogida en tienda',
            city: shippingAddress.city || customer.city || 'Medellín'
          },
          shippingAddress,
          payment: {
            method: payment.method || 'card',
            label: paymentLabel,
            status: payment.method === 'cash' ? 'Pendiente al recibir' : 'Aprobado exitosamente'
          },
          items: purchasedItems,
          subtotal: summary.subtotal,
          tax: summary.tax,
          total: summary.total,
          count: summary.count,
          orderStatus: initialStatus,
          trackingHistory: [
            {
              status: initialStatus,
              timestamp: new Date().toISOString(),
              dateFormatted: orderDate,
              note: initialNote,
              location: 'Centro de Distribución SAUZ — Medellín, Colombia'
            }
          ]
        };

        // Agregar al inicio del historial de órdenes y persistir
        orders.unshift(order);
        saveOrders(); // Persistir en disco orders.json

        // Limpiar el carrito en memoria tras completar la compra
        cart = [];

        return sendJSON(res, 200, {
          success: true,
          message: '¡Pago procesado exitosamente en Sauz Store! 🎉 Stock descontado e inventario actualizado.',
          order,
          cart: getCartSummary(),
          products: products
        });
      }

      // Si la ruta /api/* no coincide con ninguna
      return sendJSON(res, 404, {
        success: false,
        error: 'Endpoint de API no encontrado'
      });

    } catch (err) {
      console.error('Error interno en servidor:', err);
      return sendJSON(res, 500, {
        success: false,
        error: 'Error interno del servidor: ' + err.message
      });
    }
  }

  // Si no es una ruta /api/*, servir archivos estáticos del frontend
  if (method === 'GET' || method === 'HEAD') {
    serveStaticFile(req, res, pathname);
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n⚠️  El puerto ${PORT} ya está siendo utilizado por otro proceso.`);
  } else {
    console.error('Error en el servidor:', err);
  }
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`👗 Servidor de Sauz Store iniciado en http://localhost:${PORT}`);
  console.log(`📦 Catálogo de moda cargado: ${products.length} prendas`);
  console.log(`👥 Usuarios registrados: ${users.length} (Admin & Clientes)`);
  console.log(`📋 Historial de pedidos cargados: ${orders.length} órdenes`);
});

module.exports = server;
