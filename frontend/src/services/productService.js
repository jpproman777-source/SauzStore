import { api } from './apiClient';

export const productService = {
  /**
   * Obtiene la lista completa de productos reales del catálogo
   */
  async getProducts() {
    const res = await api.get('/api/products');
    return res.products || res || [];
  },

  /**
   * Obtiene un producto por su identificador
   * @param {string|number} id
   */
  async getProductById(id) {
    const res = await api.get(`/api/products/${encodeURIComponent(id)}`);
    return res.product || res;
  },

  /**
   * Consulta productos con existencias por debajo de un umbral
   * @param {number} threshold
   */
  async getLowStock(threshold = 5) {
    const res = await api.get(`/api/admin/low-stock?threshold=${encodeURIComponent(threshold)}`);
    return res.lowStockItems || res.items || [];
  },

  /**
   * Reabastece una variante o producto específico (Administración)
   */
  async restockProduct(data) {
    return await api.post('/api/products/restock', data);
  },

  /**
   * Crea un nuevo producto (Administración)
   */
  async createProduct(productData) {
    return await api.post('/api/products', productData);
  },

  /**
   * Actualiza un producto existente (Administración)
   */
  async updateProduct(id, productData) {
    return await api.put(`/api/products/${encodeURIComponent(id)}`, productData);
  },

  /**
   * Elimina un producto (Administración)
   */
  async deleteProduct(id) {
    return await api.delete(`/api/products/${encodeURIComponent(id)}`);
  },
};
