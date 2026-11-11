import { api } from './apiClient';

export const experienceService = {
  async getDrops() {
    const res = await api.get('/api/drops');
    return res.drops || [];
  },

  async joinDropWaitlist(dropId, email) {
    return await api.post(`/api/drops/${encodeURIComponent(dropId)}/waitlist`, { email });
  },

  async getCommunityPosts() {
    const res = await api.get('/api/community/posts');
    return res.posts || [];
  },

  async voteCommunityPost(postId, userEmail) {
    return await api.post(`/api/community/posts/${encodeURIComponent(postId)}/vote`, { userEmail });
  },

  async reportCommunityPost(postId) {
    return await api.post(`/api/community/posts/${encodeURIComponent(postId)}/report`, {});
  },

  async createCommunityPost(payload) {
    return await api.post('/api/community/posts', payload);
  },

  async generateStyleLook(payload) {
    return await api.post('/api/style-studio/generate', payload);
  },

  async getClosetOutfits({ userId, email } = {}) {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    else if (email) params.set('email', email);
    const qStr = params.toString() ? `?${params.toString()}` : '';
    const res = await api.get(`/api/closet${qStr}`);
    return res.outfits || [];
  },

  async saveClosetOutfit(payload) {
    return await api.post('/api/closet/outfits', payload);
  },

  async deleteClosetOutfit(outfitId) {
    return await api.delete(`/api/closet/outfits/${encodeURIComponent(outfitId)}`);
  },

  async saveStyleDna(payload) {
    return await api.put('/api/users/style-dna', payload);
  },
};
