import { api } from './apiClient';

export const cartService = {
  /**
   * Consulta el estado del carrito en el backend
   */
  async getCart() {
    return await api.get('/api/cart');
  },

  /**
   * Agrega un producto/variante al carrito en el servidor
   */
  async addItem({ productId, variantId, quantity = 1 }) {
    return await api.post('/api/cart/items', { productId, variantId, quantity });
  },

  /**
   * Modifica la cantidad de una variante en el carrito
   */
  async updateItem(productId, { variantId, quantity }) {
    const qStr = variantId ? `?variantId=${encodeURIComponent(variantId)}` : '';
    return await api.patch(`/api/cart/items/${encodeURIComponent(productId)}${qStr}`, { quantity });
  },

  /**
   * Elimina una variante del carrito
   */
  async removeItem(productId, { variantId } = {}) {
    const qStr = variantId ? `?variantId=${encodeURIComponent(variantId)}` : '';
    return await api.delete(`/api/cart/items/${encodeURIComponent(productId)}${qStr}`);
  },

  /**
   * Vacía el carrito por completo
   */
  async clearCart() {
    return await api.delete('/api/cart');
  },
};
