import React, { useState } from "react";

const optimizedSource = (src) => /^\/Productos\/sauz-\d{3}\.png$/i.test(src || "")
  ? src.replace(/\.png$/i, "") : null;

export const ProductImage = ({ src, alt, mode = "card", category, className = "", sizes, onLoad, onError, ...props }) => {
  const [failed, setFailed] = useState(null);
  const [optimizedFailed, setOptimizedFailed] = useState(null);
  const [loaded, setLoaded] = useState(null);
  const unavailable = !src || failed === src;
  const original = unavailable ? "/sauz-placeholder.svg" : src;
  const base = !unavailable && mode !== "full" && optimizedFailed !== src ? optimizedSource(src) : null;
  const srcSet = base ? `${base}-480.jpg 480w, ${base}-960.jpg 960w` : undefined;
  const responsiveSizes = mode === "thumb" ? "96px" : "(max-width: 640px) 80vw, (max-width: 1000px) 45vw, 25vw";
  return (
    <img
      {...props}
      className={`sauz-product-image ${className}`.trim()}
      src={original}
      srcSet={srcSet}
      sizes={srcSet ? (sizes || responsiveSizes) : undefined}
      data-product-category={category || undefined}
      data-loaded={loaded === original ? "true" : "false"}
      alt={unavailable ? `${alt || "Producto"} — imagen no disponible` : alt}
      loading={props.loading || (mode === "full" ? "eager" : "lazy")}
      decoding="async"
      onLoad={(event) => { setLoaded(original); onLoad?.(event); }}
      onError={(event) => {
        if (base) setOptimizedFailed(src);
        else if (!unavailable) setFailed(src);
        else event.currentTarget.style.visibility = "hidden";
        onError?.(event);
      }}
    />
  );
};
