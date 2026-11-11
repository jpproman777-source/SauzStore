import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, ZoomIn, X, Minus, Plus } from 'lucide-react';
import { ProductImage } from './ProductImage';
import { clamp, containImage, maxImageZoom, panBounds } from '../lib/imageZoom';
import './product-gallery.css';

export function ProductGallery({ images, name, category }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const stage = useRef(null), photo = useRef(null), overlay = useRef(null);
  const dialog = useRef(null), viewport = useRef(null), modalPhoto = useRef(null);
  const trigger = useRef(null), frame = useRef(0), hover = useRef(false);
  const pointers = useRef(new Map()), gesture = useRef(null);
  const view = useRef({ scale: 1, x: 0, y: 0 });
  const src = images[index] || images[0];
  const alt = `${name} — Fotografía ${index + 1} de ${images.length || 1}`;

  const stopHover = () => {
    hover.current = false;
    cancelAnimationFrame(frame.current);
    if (overlay.current) overlay.current.style.display = 'none';
  };
  const reset = () => {
    view.current = { scale: 1, x: 0, y: 0 };
    pointers.current.clear();
    gesture.current = null;
    if (modalPhoto.current) modalPhoto.current.style.transform = '';
  };
  useEffect(() => {
    const stop = () => { stopHover(); reset(); };
    window.addEventListener('resize', stop);
    window.addEventListener('scroll', stopHover, true);
    return () => {
      stopHover();
      window.removeEventListener('resize', stop);
      window.removeEventListener('scroll', stopHover, true);
    };
  }, []);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current.showModal();
    dialog.current.querySelector('button').focus();
    return () => {
      dialog.current?.close();
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open]);

  const move = (event) => {
    if (event.pointerType !== 'mouse') return;
    const image = photo.current;
    if (!image?.naturalWidth || image.dataset.loaded !== 'true' || image.getAttribute('src') !== src) return;
    const rect = stage.current.getBoundingClientRect();
    const fit = containImage(image.clientWidth, image.clientHeight, image.naturalWidth, image.naturalHeight);
    const left = rect.left + (rect.width - fit.width) / 2;
    const top = rect.top + (rect.height - fit.height) / 2;
    const px = (event.clientX - left) / fit.width, py = (event.clientY - top) / fit.height;
    if (px < 0 || px > 1 || py < 0 || py > 1) return stopHover();
    const scale = maxImageZoom(image.naturalWidth, image.naturalHeight, fit.width, fit.height);
    if (scale <= 1.01) return stopHover();
    hover.current = true;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const panel = overlay.current;
      if (!panel || !hover.current) return;
      // Float only into genuinely unused space, never over purchase controls.
      const galleryLayout = stage.current.closest('.premium-detail-layout').getBoundingClientRect();
      const side = Math.min(420, rect.width);
      const floating = innerWidth - galleryLayout.right >= side + 24;
      const w = floating ? side : rect.width, h = floating ? Math.min(rect.height, innerHeight - 32) : rect.height;
      Object.assign(panel.style, {
        display: 'block', left: `${floating ? galleryLayout.right + 12 : rect.left}px`,
        top: `${clamp(rect.top, 8, Math.max(8, innerHeight - h - 8))}px`,
        width: `${w}px`, height: `${h}px`,
        backgroundImage: `url(${JSON.stringify(src)})`,
        backgroundSize: `${fit.width * scale}px ${fit.height * scale}px`,
        backgroundPosition: `${clamp(w / 2 - px * fit.width * scale, Math.min(0, w - fit.width * scale), Math.max(0, (w - fit.width * scale) / 2))}px ${clamp(h / 2 - py * fit.height * scale, Math.min(0, h - fit.height * scale), Math.max(0, (h - fit.height * scale) / 2))}px`,
      });
    });
  };
  const apply = (scale, x, y) => {
    const img = modalPhoto.current, box = viewport.current;
    if (!img?.naturalWidth || !box) return;
    const fit = containImage(box.clientWidth, box.clientHeight, img.naturalWidth, img.naturalHeight);
    scale = clamp(scale, 1, maxImageZoom(img.naturalWidth, img.naturalHeight, fit.width, fit.height));
    const pan = panBounds(x, y, scale, fit, { width: box.clientWidth, height: box.clientHeight });
    view.current = { scale, ...pan };
    img.style.transform = `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${scale})`;
  };
  const snapshot = () => {
    const pts = [...pointers.current.values()];
    if (!pts.length) { gesture.current = null; return; }
    const a = pts[0], b = pts[1] || a;
    gesture.current = { ...view.current, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2, distance: Math.hypot(a.x - b.x, a.y - b.y) };
  };
  const change = (next) => { stopHover(); reset(); setIndex((next + images.length) % images.length); };
  const launch = () => { stopHover(); reset(); setOpen(true); };
  return <section className="premium-gallery" aria-label="Galería fotográfica del producto" data-reveal>
    <div className="premium-gallery-main sauz-zoom-stage" ref={stage} onPointerMove={move} onPointerLeave={stopHover}>
      <button ref={trigger} className="sauz-photo-trigger" onClick={launch} aria-label="Ampliar fotografía" aria-haspopup="dialog">
        <ProductImage key={src} src={src} alt={alt} category={category} mode="full" onLoad={e => { photo.current = e.currentTarget; }} />
        <span className="premium-gallery-zoom" aria-hidden="true"><ZoomIn size={18} /></span>
      </button>
      {images.length > 1 && <div className="premium-gallery-nav" onPointerEnter={stopHover}>
        <button type="button" aria-label="Fotografía anterior" onClick={() => change(index - 1)}><ArrowLeft size={18} /></button>
        <span className="premium-gallery-counter" aria-live="polite">{index + 1} / {images.length}</span>
        <button type="button" aria-label="Siguiente fotografía" onClick={() => change(index + 1)}><ArrowRight size={18} /></button>
      </div>}
    </div>
    {images.length > 1 && <div className="premium-gallery-thumbs" role="group" aria-label="Vistas disponibles del producto">
      {images.map((image, i) => <button type="button" key={image} aria-pressed={index === i} aria-label={`Ver imagen ${i + 1}`} className={`premium-thumb-btn ${index === i ? 'active' : ''}`} onClick={() => change(i)}><ProductImage src={image} alt="" mode="thumb" category={category} /></button>)}
    </div>}
    {createPortal(<div ref={overlay} className="sauz-hover-zoom" aria-hidden="true" />, document.body)}
    {open && createPortal(<dialog ref={dialog} className="sauz-image-dialog" aria-label={`Vista ampliada: ${name}`} onCancel={e => { e.preventDefault(); setOpen(false); }} onClose={() => setOpen(false)} onKeyDown={e => {
      if (e.key === 'Tab') {
        const controls = [...dialog.current.querySelectorAll('button')];
        const first = controls[0], last = controls.at(-1);
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
      if (e.key === 'ArrowLeft' && images.length > 1) change(index - 1);
      if (e.key === 'ArrowRight' && images.length > 1) change(index + 1);
    }}>
      <div className="sauz-zoom-toolbar">
        <button type="button" aria-label="Cerrar vista ampliada" onClick={() => setOpen(false)}><X /></button>
        <span>{index + 1} / {images.length || 1}</span>
        <button type="button" aria-label="Reducir ampliación" onClick={() => apply(view.current.scale / 1.5, view.current.x, view.current.y)}><Minus /></button>
        <button type="button" aria-label="Aumentar ampliación" onClick={() => apply(view.current.scale * 1.5, view.current.x, view.current.y)}><Plus /></button>
      </div>
      <div ref={viewport} className="sauz-zoom-viewport" onPointerDown={e => {
        e.currentTarget.setPointerCapture(e.pointerId);
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY }); snapshot();
      }} onPointerMove={e => {
        if (!pointers.current.has(e.pointerId)) return;
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const g = gesture.current, pts = [...pointers.current.values()];
        if (!g) return;
        const a = pts[0], b = pts[1] || a;
        const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
        const scale = g.distance ? g.scale * Math.hypot(a.x - b.x, a.y - b.y) / g.distance : g.scale;
        const bounds = viewport.current.getBoundingClientRect();
        const factor = scale / g.scale;
        apply(scale, g.x * factor + (cx - g.cx) + (g.cx - bounds.left - bounds.width / 2) * (1 - factor), g.y * factor + (cy - g.cy) + (g.cy - bounds.top - bounds.height / 2) * (1 - factor));
      }} onPointerUp={e => { pointers.current.delete(e.pointerId); snapshot(); }} onPointerCancel={e => { pointers.current.delete(e.pointerId); snapshot(); }}>
        <img key={src} ref={modalPhoto} src={src} alt={alt} draggable="false" onLoad={reset} />
      </div>
      <div className="sauz-zoom-footer">
        {images.length > 1 && <button type="button" aria-label="Fotografía anterior" onClick={() => change(index - 1)}><ArrowLeft /></button>}
        <p>Pellizca para ampliar · Arrastra para explorar</p>
        {images.length > 1 && <button type="button" aria-label="Siguiente fotografía" onClick={() => change(index + 1)}><ArrowRight /></button>}
      </div>
    </dialog>, document.body)}
  </section>;
}
