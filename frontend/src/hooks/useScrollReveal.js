import { useEffect } from 'react';

export const useScrollReveal = (containerRef, dependencies = [], selector = '[data-reveal]') => {
  useEffect(() => {
    const root = containerRef.current;
    if (!root || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('sauz-reveal-visible');
        observer.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    const elements = root.querySelectorAll(selector);
    for (const element of elements) {
      if (element.classList.contains('sauz-reveal-visible')) continue;
      element.classList.add('sauz-reveal-ready');
      observer.observe(element);
    }
    return () => observer.disconnect();
  }, dependencies);
};
