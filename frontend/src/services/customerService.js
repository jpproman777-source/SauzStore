import { api } from './apiClient';

export const customerService = {
  /**
   * Obtiene el listado de clientes registrados (Administración)
   */
  async getCustomers() {
    const res = await api.get('/api/customers');
    return res.customers || [];
  },
};
