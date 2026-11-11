export const favoritesKey = user => user?.id != null ? `sauz_favorites:user:${user.id}` : 'sauz_favorites';
export function readFavorites(storage, key) {
  try {
    const ids = JSON.parse(storage.getItem(key) || '[]');
    return Array.isArray(ids) ? [...new Set(ids.filter(id => typeof id === 'string'))] : [];
  } catch { return []; }
}
export function claimGuestFavorites(storage, user) {
  const key = favoritesKey(user);
  if (key === 'sauz_favorites') return;
  const guest = readFavorites(storage, 'sauz_favorites');
  if (!guest.length) return;
  storage.setItem(key, JSON.stringify([...new Set([...readFavorites(storage, key), ...guest])]));
  storage.removeItem('sauz_favorites');
}
