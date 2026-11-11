import { api } from './apiClient';

export const addressService = {
  /**
   * Obtiene la lista de direcciones registradas para un cliente
   * @param {object} params { userId, email }
   */
  async getAddresses({ userId, email } = {}) {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    if (email) params.set('email', email);
    const qStr = params.toString() ? `?${params.toString()}` : '';
    const res = await api.get(`/api/users/addresses${qStr}`);
    return res.addresses || [];
  },

  /**
   * Agrega una nueva dirección colombiana
   * @param {object} payload { userId, email, address }
   */
  async addAddress(payload) {
    const res = await api.post('/api/users/addresses', payload);
    return res;
  },

  /**
   * Elimina una dirección por su identificador
   * @param {string|number} addressId
   * @param {object} params { userId, email }
   */
  async updateAddress(addressId, payload) {
    return api.put(`/api/users/addresses/${encodeURIComponent(addressId)}`, payload);
  },

  async deleteAddress(addressId, { userId, email } = {}) {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    if (email) params.set('email', email);
    const qStr = params.toString() ? `?${params.toString()}` : '';
    const res = await api.delete(`/api/users/addresses/${encodeURIComponent(addressId)}${qStr}`);
    return res;
  },
};
