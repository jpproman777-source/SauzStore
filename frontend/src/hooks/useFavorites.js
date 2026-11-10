import { useEffect, useState } from "react";
const key = "sauz_favorites";
const eventName = "sauz:favorites-changed";
const read = () => {
  try {
    const ids = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(ids) ? ids.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
};
export const useFavorites = () => {
  const [ids, setIds] = useState(read);
  useEffect(() => {
    const sync = () => setIds(read());
    window.addEventListener(eventName, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(eventName, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const toggle = (id) => {
    const value = String(id),
      previous = read();
    const next = previous.includes(value)
      ? previous.filter((item) => item !== value)
      : [...previous, value];
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      setIds(next);
      return;
    }
    window.dispatchEvent(new Event(eventName));
  };
  return { ids, toggle };
};
