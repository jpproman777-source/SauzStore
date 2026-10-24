const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, '..', 'frontend', 'dist');
const FRONTEND_DIR = fs.existsSync(DIST_DIR) ? DIST_DIR : path.join(__dirname, '..', 'frontend');
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

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

// Estado del carrito en memoria
let cart = [];

// Helper para redondear a 2 decimales
function roundDecimals(val) {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

// Calcular resumen del carrito
function getCartSummary() {
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

      // ==============================================================
      // 2. PRODUCTOS E INVENTARIO
      // ==============================================================
      // GET /api/products
      if (pathname === '/api/products' && method === 'GET') {
        return sendJSON(res, 200, {
          success: true,
          products: products
        });
      }

      // POST /api/products (Crear nuevo slot de producto / prenda en inventario)
      if (pathname === '/api/products' && method === 'POST') {
        const body = await parseRequestBody(req);
        const { name, category, price, stock, description, image, icon } = body;

        if (!name || !price) {
          return sendJSON(res, 400, {
            success: false,
            error: 'El nombre y el precio del producto son obligatorios'
          });
        }

        const newId = Math.max(0, ...products.map(p => p.id || 0)) + 1;
        const newProduct = {
          id: newId,
          name: name.trim(),
          category: category ? category.trim() : 'Camisetas',
          description: description ? description.trim() : 'Prenda streetwear de alta gama confeccionada en Colombia.',
          price: parseFloat(price) || 50000,
          icon: icon || (category === 'Sudaderas' ? '🧥' : '👕'),
          image: image && image.trim() ? image.trim() : '/Productos/jordan_Blanca.png',
          stock: parseInt(stock, 10) >= 0 ? parseInt(stock, 10) : 10
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

        const removed = products.splice(idx, 1)[0];
        saveProducts();

        return sendJSON(res, 200, {
          success: true,
          message: `Slot "${removed.name}" eliminado del catálogo`,
          products: products
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
        if (body.name !== undefined) product.name = body.name.trim();
        if (body.category !== undefined) product.category = body.category.trim();
        if (body.description !== undefined) product.description = body.description.trim();
        if (body.price !== undefined) product.price = parseFloat(body.price) || product.price;
        if (body.stock !== undefined) product.stock = Math.max(0, parseInt(body.stock, 10) || 0);
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
        const { orderStatus } = body;

        const order = orders.find(o => o.orderId === orderId);
        if (!order) {
          return sendJSON(res, 404, {
            success: false,
            error: 'Pedido no encontrado'
          });
        }

        if (orderStatus) {
          order.orderStatus = orderStatus;
        }
        saveOrders();

        return sendJSON(res, 200, {
          success: true,
          message: `Estado del pedido ${orderId} actualizado a "${orderStatus}"`,
          order: order
        });
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
        const quantity = parseInt(body.quantity || 1, 10);

        if (isNaN(productId) || quantity <= 0) {
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

        const currentInCart = cart.find(item => item.productId === productId)?.quantity || 0;
        if (product.stock !== undefined && (currentInCart + quantity) > product.stock) {
          return sendJSON(res, 400, {
            success: false,
            error: `Lo sentimos, solo quedan ${product.stock} unidades disponibles en inventario de "${product.name}".`
          });
        }

        const existingItem = cart.find(item => item.productId === productId);
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          cart.push({
            productId: product.id,
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
        const body = await parseRequestBody(req);
        const newQuantity = parseInt(body.quantity, 10);

        if (isNaN(newQuantity)) {
          return sendJSON(res, 400, {
            success: false,
            error: 'La cantidad debe ser un número válido'
          });
        }

        const itemIndex = cart.findIndex(item => item.productId === productId);
        if (itemIndex === -1) {
          return sendJSON(res, 404, {
            success: false,
            error: 'Producto no se encuentra en el carrito'
          });
        }

        const product = products.find(p => p.id === productId);
        if (newQuantity > 0 && product && product.stock !== undefined && newQuantity > product.stock) {
          return sendJSON(res, 400, {
            success: false,
            error: `Solo hay ${product.stock} unidades disponibles en inventario`
          });
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
        const itemIndex = cart.findIndex(item => item.productId === productId);

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
        cart.forEach(cartItem => {
          const product = products.find(p => p.id === cartItem.productId);
          if (product) {
            const currentStock = typeof product.stock === 'number' ? product.stock : 10;
            product.stock = Math.max(0, currentStock - cartItem.quantity);
          }
        });
        saveProducts(); // Persistir en disco products.json

        // 2. CREAR Y REGISTRAR PEDIDO COMPLETO
        const summary = getCartSummary();
        const orderId = `SAUZ-${Date.now().toString(36).toUpperCase()}`;
        const orderDate = new Date().toLocaleString('es-CO', {
          dateStyle: 'medium',
          timeStyle: 'short'
        });

        const paymentLabel = payment.method === 'card'
          ? `Tarjeta de Crédito / Débito (terminada en ${payment.details?.cardLast4 || '****'})`
          : (payment.method === 'transfer' ? 'Transferencia (Nequi / Daviplata / Bancolombia)' : 'Pago Contra Entrega en Efectivo');

        const order = {
          orderId,
          date: orderDate,
          timestamp: Date.now(),
          customer: {
            name: customer.name || 'Cliente Sauz Store',
            email: customer.email || '',
            phone: customer.phone || '',
            address: customer.address || 'Recogida en tienda',
            city: customer.city || 'Medellín'
          },
          payment: {
            method: payment.method || 'card',
            label: paymentLabel,
            status: payment.method === 'cash' ? 'Pendiente al recibir' : 'Aprobado exitosamente'
          },
          items: [...cart],
          subtotal: summary.subtotal,
          tax: summary.tax,
          total: summary.total,
          count: summary.count,
          orderStatus: payment.method === 'cash' ? 'Pendiente' : 'En proceso'
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
