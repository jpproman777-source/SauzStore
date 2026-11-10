import React, { useState } from "react";
export const ProductImage = ({ src, alt, ...props }) => {
  const [failed, setFailed] = useState(null);
  const unavailable = !src || failed === src;
  return (
    <img
      {...props}
      src={unavailable ? "/sauz-placeholder.svg" : src}
      alt={
        unavailable ? `${alt || "Producto"} \u2014 imagen no disponible` : alt
      }
      loading={props.loading || "lazy"}
      decoding="async"
      onError={(e) => {
        if (!unavailable) setFailed(src);
        else e.currentTarget.style.visibility = "hidden";
      }}
    />
  );
};
