const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, '..', 'frontend', 'dist');
const FRONTEND_DIR = fs.existsSync(DIST_DIR) ? DIST_DIR : path.join(__dirname, '..', 'frontend');
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');

// Cargar catálogo de productos
let products = [];
try {
  const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
  products = JSON.parse(data);
} catch (err) {
  console.error('Error al cargar products.json:', err.message);
  products = [];
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

  // Si no existe el archivo directo o es una ruta de navegación, fallback a index.html
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
      // GET /api/products
      if (pathname === '/api/products' && method === 'GET') {
        return sendJSON(res, 200, {
          success: true,
          products: products
        });
      }

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

      // POST /api/checkout (Finalizar compra con datos de cliente y método de pago)
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
          city: ''
        };

        const payment = body.payment || {
          method: 'card',
          details: { cardLast4: '4242' }
        };

        const summary = getCartSummary();
        const orderId = `SAUZ-${Date.now().toString(36).toUpperCase()}`;
        const orderDate = new Date().toLocaleString('es-ES', {
          dateStyle: 'medium',
          timeStyle: 'short'
        });

        const paymentLabel = payment.method === 'card'
          ? `Tarjeta de Crédito / Débito (terminada en ${payment.details?.cardLast4 || '****'})`
          : (payment.method === 'transfer' ? 'Transferencia (Nequi / Daviplata / Bancolombia)' : 'Pago Contra Entrega en Efectivo');

        const order = {
          orderId,
          date: orderDate,
          customer: {
            name: customer.name || 'Cliente Sauz Store',
            email: customer.email || '',
            phone: customer.phone || '',
            address: customer.address || 'Recogida en tienda',
            city: customer.city || ''
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
          count: summary.count
        };

        // Limpiar el carrito tras completar la compra
        cart = [];

        return sendJSON(res, 200, {
          success: true,
          message: '¡Pago procesado exitosamente en Sauz Store! 🎉',
          order,
          cart: getCartSummary()
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
        error: 'Error interno del servidor'
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
    console.error(`💡 Solución rápida:`);
    console.error(`   1. Liberar el puerto ejecutando: npx kill-port ${PORT}`);
    console.error(`   2. O arrancar en otro puerto: PORT=${Number(PORT) + 1} npm run dev\n`);
  } else {
    console.error('Error en el servidor:', err);
  }
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`👗 Servidor de Sauz Store iniciado en http://localhost:${PORT}`);
  console.log(`📦 Catálogo de moda cargado: ${products.length} prendas`);
});

module.exports = server;
