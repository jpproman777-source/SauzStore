import { api } from './apiClient';

export const orderService = {
  /**
   * Procesa la creación de un nuevo pedido en el checkout
   * @param {object} orderPayload
   */
  async checkout(orderPayload) {
    const res = await api.post('/api/checkout', orderPayload);
    return res;
  },

  /**
   * Obtiene la lista de pedidos (para clientes o administradores)
   * @param {object} filters { email, userId }
   */
  async getOrders(filters = {}) {
    const params = new URLSearchParams();
    if (filters.email) params.set('email', filters.email);
    if (filters.userId) params.set('userId', filters.userId);
    const qStr = params.toString() ? `?${params.toString()}` : '';
    const res = await api.get(`/api/orders${qStr}`);
    return res.orders || res || [];
  },

  /**
   * Consulta el detalle y trazabilidad de una orden por su ID
   * @param {string} orderId
   */
  async getOrderById(orderId) {
    const res = await api.get(`/api/orders/${encodeURIComponent(orderId)}`);
    return res.order || res;
  },

  /**
   * Actualiza el estado de una orden (Administración)
   * @param {string} orderId
   * @param {object} updateData { status, location, note }
   */
  async updateOrderStatus(orderId, updateData) {
    return await api.patch(`/api/orders/${encodeURIComponent(orderId)}`, updateData);
  },
};
