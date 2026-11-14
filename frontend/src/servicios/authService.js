import { api } from './apiClient';

export const authService = {
  /**
   * Inicia sesión con credenciales reales en el backend
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    const res = await api.post('/api/auth/login', { email, password });
    return res;
  },

  /**
   * Registra un nuevo cliente en el backend
   * @param {object} userData { name, docType, documentNumber, email, password, phone, address, city }
   */
  async register(userData) {
    const res = await api.post('/api/auth/register', userData);
    return res;
  },

  /**
   * Cierra la sesión en el servidor
   */
  async logout() {
    try {
      const res = await api.post('/api/auth/logout', {});
      return res;
    } catch (e) {
      console.warn('Advertencia en cierre de sesión en backend:', e.message);
      return { success: true };
    }
  },

  /**
   * Obtiene el perfil del usuario actual desde el backend
   * @param {string|number} userId
   * @param {string} email
   */
  async getProfile(userId, email) {
    const query = userId ? `userId=${encodeURIComponent(userId)}` : `email=${encodeURIComponent(email)}`;
    const res = await api.get(`/api/users/profile?${query}`);
    return res;
  },

  /**
   * Actualiza los datos personales del cliente
   * @param {object} profileData
   */
  async updateProfile(profileData) {
    const res = await api.put('/api/users/profile', profileData);
    return res;
  },

  /**
   * Solicita envío de enlace de recuperación (contrato pendiente en backend nuevo)
   * @param {string} email
   */
  async requestPasswordReset(email) {
    return await api.post('/api/auth/forgot-password', { email });
  },

  /**
   * Restablece la contraseña usando el token de recuperación
   * @param {object} payload { token, newPassword }
   */
  async resetPassword(payload) {
    return await api.post('/api/auth/reset-password', payload);
  },
};
