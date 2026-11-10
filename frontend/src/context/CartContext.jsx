import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

const CartContext = createContext();
const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    count: 0,
  });

  const [cartLoading, setCartLoading] = useState(true);
  const [cartLoadError, setCartLoadError] = useState(null);
  const [cartConfirmation, setCartConfirmation] = useState(null);
  const pendingAdds = useRef(new Set());
  const confirmationSequence = useRef(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Formato de moneda
  const formatMoney = (amount) => {
    return copFormatter.format(Number(amount || 0));
  };

  // Notificaciones Toast
  const showToast = useCallback((msg, duration = 3000) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, duration);
  }, []);

  // Carga de productos
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Error al cargar productos:", err);
      showToast("⚠️ No se pudo conectar con el catálogo de Sauz Store.");
    } finally {
      setLoadingProducts(false);
    }
  }, [showToast]);

  // Carga de pedidos
  const fetchOrders = useCallback(async (clientEmail = null) => {
    setLoadingOrders(true);
    try {
      const url = clientEmail
        ? `/api/orders?email=${encodeURIComponent(clientEmail)}`
        : "/api/orders";
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setOrders(data.orders || []);
      return data.orders || [];
    } catch (err) {
      console.error("Error al cargar pedidos:", err);
      return [];
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  // Carga inicial del carrito
  const fetchCart = useCallback(async () => {
    setCartLoading(true);
    setCartLoadError(null);
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.cart) {
        setCart(data.cart);
      }
    } catch (err) {
      console.error("Error al sincronizar carrito:", err);
      setCartLoadError("No pudimos cargar tu bolsa. Inténtalo de nuevo.");
    } finally {
      setCartLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCart();
    fetchOrders();
  }, [fetchProducts, fetchCart, fetchOrders]);

  // Bloquear scroll cuando el drawer o modal están abiertos
  useEffect(() => {
    if (isCartOpen || isCheckoutOpen || orderCompleted) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isCartOpen, isCheckoutOpen, orderCompleted]);

  // Agregar prenda al carrito
  const addToCart = async (productId, quantity = 1) => {
    const key = String(productId);
    if (pendingAdds.current.has(key)) return null;
    pendingAdds.current.add(key);
    setCartConfirmation(null);
    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al agregar prenda");
      setCart(data.cart);
      const item = data.cart?.items?.find(
        (item) => String(item.productId) === key,
      );
      if (item) {
        const product = products.find((product) => String(product.id) === key);
        setCartConfirmation({
          item: { ...product, ...item },
          quantity,
          sequence: ++confirmationSequence.current,
        });
      }
      return data;
    } catch (err) {
      showToast(`❌ ${err.message}`);
      return null;
    } finally {
      pendingAdds.current.delete(key);
    }
  };

  // Modificar cantidad
  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await fetch(`/api/cart/items/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar");
      setCart(data.cart);
      return data;
    } catch (err) {
      showToast(`❌ ${err.message}`);
      return null;
    }
  };

  // Eliminar prenda individual
  const removeItem = async (productId) => {
    try {
      const res = await fetch(`/api/cart/items/${productId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar");
      setCart(data.cart);
      showToast(data.message || "Prenda eliminada de la bolsa");
      return data;
    } catch (err) {
      showToast(`❌ ${err.message}`);
      return null;
    }
  };

  // Vaciar carrito
  const clearCart = async () => {
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al vaciar");
      setCart(data.cart);
      showToast("🗑️ Bolsa vaciada");
      return data;
    } catch (err) {
      showToast(`❌ ${err.message}`);
      return null;
    }
  };

  // Procesar Checkout (descuenta stock en tiempo real)
  const processCheckout = async (customer, payment) => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, payment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al procesar compra");

      setCart(data.cart);
      if (data.products) {
        setProducts(data.products);
      } else {
        fetchProducts();
      }
      fetchOrders();
      setIsCheckoutOpen(false);
      setOrderCompleted(data.order);
      showToast("🎉 ¡Compra realizada exitosamente!");
      return data;
    } catch (err) {
      showToast(`❌ ${err.message}`);
      return null;
    }
  };

  // Reabastecer stock de un producto existente ("Llegaron productos al slot")
  const restockProduct = async (productId, amount) => {
    try {
      const res = await fetch("/api/products/restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al reabastecer stock");
      if (data.products) {
        setProducts(data.products);
      } else {
        fetchProducts();
      }
      showToast(`📦 ${data.message}`);
      return data;
    } catch (err) {
      showToast(`❌ ${err.message}`);
      throw err;
    }
  };

  // Crear nuevo slot de producto en inventario
  const createNewProduct = async (productData) => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear producto");
      if (data.products) {
        setProducts(data.products);
      } else {
        fetchProducts();
      }
      showToast(data.message);
      return data;
    } catch (err) {
      showToast(err.message);
      throw err;
    }
  };

  // Actualizar datos de un producto (Admin)
  const updateProduct = async (productId, updatedData) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Error al actualizar producto");
      if (data.products) {
        setProducts(data.products);
      } else {
        fetchProducts();
      }
      showToast(data.message || "Producto actualizado con éxito");
      return data;
    } catch (err) {
      showToast(err.message);
      throw err;
    }
  };

  // Eliminar slot de producto
  const deleteProduct = async (productId) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar producto");
      if (data.products) {
        setProducts(data.products);
      } else {
        fetchProducts();
      }
      showToast(data.message);
      return data;
    } catch (err) {
      showToast(err.message);
      throw err;
    }
  };

  // Actualizar estado de una orden (Admin)
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar pedido");
      fetchOrders();
      showToast(`Pedido ${orderId}: ${newStatus}`);
      return data;
    } catch (err) {
      showToast(err.message);
      throw err;
    }
  };

  return (
    <CartContext.Provider
      value={{
        products,
        loadingProducts,
        orders,
        loadingOrders,
        cart,
        formatMoney,
        isCartOpen,
        setIsCartOpen,
        cartConfirmation,
        setCartConfirmation,
        cartLoading,
        cartLoadError,
        refreshCart: fetchCart,
        isCheckoutOpen,
        setIsCheckoutOpen,
        orderCompleted,
        setOrderCompleted,
        toastMessage,
        showToast,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        processCheckout,
        refreshProducts: fetchProducts,
        fetchOrders,
        restockProduct,
        createNewProduct,
        updateProduct,
        deleteProduct,
        updateOrderStatus,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
