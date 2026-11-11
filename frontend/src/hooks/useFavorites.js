import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { favoritesKey, readFavorites } from '../lib/favorites';
const eventName = 'sauz:favorites-changed';
export const useFavorites = () => {
  const { user } = useAuth();
  const key = favoritesKey(user);
  const read = () => { try { return readFavorites(localStorage, key); } catch { return []; } };
  const [state, setState] = useState(() => ({ key, ids: read() }));
  useEffect(() => {
    const sync = () => setState({ key, ids: read() });
    sync();
    window.addEventListener(eventName, sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener(eventName, sync); window.removeEventListener('storage', sync); };
  }, [key]);
  const toggle = id => {
    const value = String(id), previous = read();
    const ids = previous.includes(value) ? previous.filter(item => item !== value) : [...previous, value];
    setState({ key, ids });
    try { localStorage.setItem(key, JSON.stringify(ids)); window.dispatchEvent(new Event(eventName)); } catch { /* Keep the selection for this session when storage is unavailable. */ }
  };
  return { ids: state.key === key ? state.ids : read(), toggle };
};
